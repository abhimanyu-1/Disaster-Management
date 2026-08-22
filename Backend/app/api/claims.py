from fastapi import APIRouter, HTTPException
from ..schemas.agent import ClaimAgentRequest, ClaimAgentResponse
from ..agents.claim_agent import analyze_claim
from ..store import add_audit_log

router = APIRouter()

@router.post("/claims/analyze", response_model=ClaimAgentResponse)
def run_claim_analysis(request: ClaimAgentRequest):
    try:
        result = analyze_claim(request)
        add_audit_log("CLAIM_ANALYZED", f"Claim analysis ran for amount {request.claim_amount}")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
