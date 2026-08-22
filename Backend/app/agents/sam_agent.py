import torch
from transformers import SamModel, SamProcessor
from PIL import Image
import numpy as np
from ..schemas.agent import SamAgentRequest, SamAgentResponse

# Lazy load the model to avoid blocking on startup, but cache it to avoid reloading
_SAM_MODEL = None
_SAM_PROCESSOR = None

def get_sam_components():
    global _SAM_MODEL, _SAM_PROCESSOR
    if _SAM_MODEL is None:
        model_id = "facebook/sam-vit-base"
        _SAM_PROCESSOR = SamProcessor.from_pretrained(model_id)
        _SAM_MODEL = SamModel.from_pretrained(model_id)
        device = "cuda" if torch.cuda.is_available() else "cpu"
        _SAM_MODEL.to(device)
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
    
    # Take the first mask (SAM predicts multiple masks, often 3. The first one is a good default or we could take the one with the highest iou score)
    # output masks is a list of tensors
    # masks[0] shape: (1, 3, H, W)
    # We take the first predicted mask (index 0 out of 3)
    best_mask = masks[0][0][0].numpy()
    
    # Find bounding box of the boolean mask
    y_indices, x_indices = np.where(best_mask)
    
    if len(y_indices) == 0 or len(x_indices) == 0:
        # Fallback to the original rough box if SAM fails to segment anything
        return SamAgentResponse(refined_bbox=request.rough_bbox)
        
    new_pixel_xmin = np.min(x_indices)
    new_pixel_xmax = np.max(x_indices)
    new_pixel_ymin = np.min(y_indices)
    new_pixel_ymax = np.max(y_indices)
    
    # Convert back to normalized 0-1000 scale [ymin, xmin, ymax, xmax]
    norm_ymin = int((new_pixel_ymin / height) * 1000)
    norm_xmin = int((new_pixel_xmin / width) * 1000)
    norm_ymax = int((new_pixel_ymax / height) * 1000)
    norm_xmax = int((new_pixel_xmax / width) * 1000)
    
    refined_bbox = [norm_ymin, norm_xmin, norm_ymax, norm_xmax]
    
    return SamAgentResponse(refined_bbox=refined_bbox)
