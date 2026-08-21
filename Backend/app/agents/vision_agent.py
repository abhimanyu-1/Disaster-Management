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
    
    before_img = Image.open(request.before_image_path)
    after_img = Image.open(request.after_image_path)
    
    prompt = f"""
    You are a highly capable disaster assessment AI.
    Analyze these two images: the first is 'before' the disaster, the second is 'after'.
    Asset ID: {request.asset_id}
    
    Respond with ONLY a JSON object exactly matching this structure:
    {{
        "asset_type": "House / Hospital / Bridge / etc.",
        "damage_detected": true/false,
        "damage_type": "Structural / Water / Fire / etc.",
        "damage_score": 0.0 to 1.0 (float),
        "confidence": 0.0 to 1.0 (float),
        "evidence": ["evidence 1", "evidence 2"]
    }}
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[prompt, before_img, after_img]
    )
    
    text = response.text
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].strip()
        
    data = json.loads(text)
    return VisionAgentResponse(**data)
