import os
from google import genai
from PIL import Image
import json
from ..schemas.agent import VisionAgentRequest, VisionAgentResponse
from dotenv import load_dotenv

# Load env variables
load_dotenv()

def analyze_images(request: VisionAgentRequest) -> VisionAgentResponse:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), '.env'))
        api_key = os.environ.get("GEMINI_API_KEY")

    client = genai.Client(api_key=api_key)
    
    if request.image_path.startswith("http"):
        import urllib.request
        req = urllib.request.Request(request.image_path, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            import tempfile
            with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
                tmp_file.write(response.read())
                local_path = tmp_file.name
        img = Image.open(local_path)
    else:
        img = Image.open(request.image_path)
        
    prompt = f"""
    You are a highly capable disaster assessment AI.
    Analyze this disaster image and assess the structural damage.
    CRITICAL: You MUST identify the type of disaster that occurred (e.g., Flood, Earthquake, Hurricane, Fire, Tornado, etc.) and state it in the 'damage_type' field.
    If there is water flooding the area, it is a Flood. If structures are crumbled, it might be an Earthquake.
    Make your damage score and evidence decisions based on the severity of this specific disaster type.
    
    You MUST also provide a 'bounding_box' array [ymin, xmin, ymax, xmax] tightly wrapping the most severe damage visible in the image.
    The coordinates MUST be normalized floats between 0.0 and 1000.0 (e.g. [200.5, 150.0, 800.0, 900.5]).
    If no damage is detected, return [0, 0, 0, 0].
    
    Asset ID: {request.asset_id}
    
    Respond with ONLY a JSON object exactly matching this structure:
    {{
        "asset_type": "House / Hospital / Bridge / etc.",
        "damage_detected": true/false,
        "damage_type": "Flood / Earthquake / Fire / Hurricane / None",
        "damage_score": 0.0 to 1.0 (float, where 1.0 is completely destroyed),
        "confidence": 0.0 to 1.0 (float),
        "evidence": ["evidence 1", "evidence 2"],
        "bounding_box": [ymin, xmin, ymax, xmax]
    }}
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[prompt, img],
        config={'response_mime_type': 'application/json'}
    )
    
    text = response.text

    data = json.loads(text)
    return VisionAgentResponse(**data)
