import os
from google import genai
import json
from ..schemas.agent import ClaimAgentRequest, ClaimAgentResponse
from dotenv import load_dotenv

load_dotenv()

def analyze_claim(request: ClaimAgentRequest) -> ClaimAgentResponse:
    api_key = os.environ.get("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)
    
    prompt = f"""
    You are a fraud detection and claim assessment AI.
    Evaluate this claim based on the stated damage vs actual severity.
    Claim Amount: {request.claim_amount}
    Claim Description: {request.claim_desc}
    Calculated Damage Severity: {request.assessment_severity}
    Field Report: {request.field_report}
    
    Respond with ONLY a JSON object exactly matching this structure:
    {{
        "claim_risk": "LOW" or "MEDIUM" or "HIGH",
        "is_consistent": true or false,
        "explanation": "Short sentence explaining the consistency"
    }}
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    
    text = response.text
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].strip()
        
    data = json.loads(text)
    return ClaimAgentResponse(**data)
