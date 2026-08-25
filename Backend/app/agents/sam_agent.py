from PIL import Image
import numpy as np
from ..schemas.agent import SamAgentRequest, SamAgentResponse

# Lazy load the model to avoid blocking on startup, but cache it to avoid reloading
_SAM_MODEL = None
_SAM_PROCESSOR = None

def get_sam_components():
    global _SAM_MODEL, _SAM_PROCESSOR
    if _SAM_MODEL is None:
        try:
            import torch
            from transformers import SamModel, SamProcessor
            model_id = "facebook/sam-vit-base"
            _SAM_PROCESSOR = SamProcessor.from_pretrained(model_id)
            _SAM_MODEL = SamModel.from_pretrained(model_id)
            device = "cuda" if torch.cuda.is_available() else "cpu"
            _SAM_MODEL.to(device)
        except ImportError:
            print("[SAM Agent] PyTorch or Transformers not installed. Skipping SAM refinement.")
            return None, None
    return _SAM_PROCESSOR, _SAM_MODEL

def run_sam_inference(request: SamAgentRequest) -> SamAgentResponse:
    # 1. Load image
    if request.image_path.startswith("http"):
        import urllib.request
        import tempfile
        req = urllib.request.Request(request.image_path, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
                tmp_file.write(response.read())
                local_path = tmp_file.name
        img = Image.open(local_path).convert("RGB")
    else:
        img = Image.open(request.image_path).convert("RGB")
        
    width, height = img.size
    
    # 2. Convert normalized box (0-1000) to pixel coordinates
    # Vision agent outputs [ymin, xmin, ymax, xmax] on a 0-1000 scale
    rough_ymin, rough_xmin, rough_ymax, rough_xmax = request.rough_bbox
    
    # If no damage detected (box is all 0s), just return it
    if rough_ymin == 0 and rough_xmax == 0:
        return SamAgentResponse(refined_bbox=[0, 0, 0, 0])
        
    pixel_xmin = (rough_xmin / 1000.0) * width
    pixel_xmax = (rough_xmax / 1000.0) * width
    pixel_ymin = (rough_ymin / 1000.0) * height
    pixel_ymax = (rough_ymax / 1000.0) * height
    
    # SAM expects box prompt as [[xmin, ymin, xmax, ymax]]
    input_boxes = [[[pixel_xmin, pixel_ymin, pixel_xmax, pixel_ymax]]]
    
    processor, model = get_sam_components()
    if processor is None or model is None:
        return SamAgentResponse(refined_bbox=request.rough_bbox)
        
    import torch
    device = model.device
    
    inputs = processor(img, input_boxes=[input_boxes], return_tensors="pt").to(device)
    
    with torch.no_grad():
        outputs = model(**inputs)
        
    # The output masks shape is usually (batch_size, num_masks, height, width)
    masks = processor.image_processor.post_process_masks(
        outputs.pred_masks.cpu(), 
        inputs["original_sizes"].cpu(), 
        inputs["reshaped_input_sizes"].cpu()
    )
    
    # Pick the mask with the highest IoU score predicted by the model
    iou_scores = outputs.iou_scores.cpu().numpy()[0][0]  # shape: (3,)
    best_mask_idx = np.argmax(iou_scores)
    
    # output masks is a list of tensors, masks[0] shape: (1, 3, H, W)
    best_mask = masks[0][0][best_mask_idx].numpy()
    
    # Use cv2 to find distinct regions
    import cv2
    mask_uint8 = (best_mask * 255).astype(np.uint8)
    contours, _ = cv2.findContours(mask_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        return SamAgentResponse(refined_bboxes=[request.rough_bbox])
        
    refined_bboxes = []
    total_area = width * height
    for contour in contours:
        area = cv2.contourArea(contour)
        if area < total_area * 0.01:
            continue # skip regions smaller than 1% of image
            
        x, y, w, h = cv2.boundingRect(contour)
        norm_ymin = int((y / height) * 1000)
        norm_xmin = int((x / width) * 1000)
        norm_ymax = int(((y + h) / height) * 1000)
        norm_xmax = int(((x + w) / width) * 1000)
        
        refined_bboxes.append([norm_ymin, norm_xmin, norm_ymax, norm_xmax])
        
    if not refined_bboxes:
        refined_bboxes = [request.rough_bbox]
    
    return SamAgentResponse(refined_bboxes=refined_bboxes)
