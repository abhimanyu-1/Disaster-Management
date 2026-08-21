import os
from google import genai
from ..schemas.agent import PriorityAgentRequest, PriorityAgentResponse
from dotenv import load_dotenv

load_dotenv()

def calculate_priority(request: PriorityAgentRequest) -> PriorityAgentResponse:
    score = request.severity_score * 0.5 + request.criticality * 0.3 + min(request.population_affected / 1000, 1.0) * 0.2
    
    if score > 0.8: level = "CRITICAL"
    elif score > 0.6: level = "HIGH"
    elif score > 0.4: level = "MEDIUM"
    else: level = "LOW"
    
    api_key = os.environ.get("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)
    
    prompt = f"Explain in one short sentence why an asset with damage severity {request.severity_score:.2f}, criticality {request.criticality:.2f}, and {request.population_affected} affected people got a priority score of {score:.2f} ({level}). Keep it brief."
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    explanation = response.text.strip()
        
    return PriorityAgentResponse(
        priority_score=round(score, 2),
        priority_level=level,
        explanation=explanation
    )
