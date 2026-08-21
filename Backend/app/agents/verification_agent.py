from ..schemas.agent import VerificationAgentRequest, VerificationAgentResponse

def check_verification(request: VerificationAgentRequest) -> VerificationAgentResponse:
    required = False
    action = "AUTO_APPROVE"
    reasons = []
    
    if request.confidence < 0.70:
        required = True
        reasons.append("Low AI confidence")
        
    if request.claim_risk == "HIGH":
        required = True
        reasons.append("High claim risk (mismatch)")
        
    if request.evidence_agreement == "LOW":
        required = True
        reasons.append("Evidence disagreement")
        
    if required:
        action = "HUMAN_REVIEW"
        if request.confidence < 0.50 and request.claim_risk == "HIGH":
            action = "FIELD_INSPECTION"
            
    explanation = "All checks passed. Auto-approval eligible."
    if required:
        explanation = f"Manual verification required due to: {', '.join(reasons)}."
        
    return VerificationAgentResponse(
        verification_required=required,
        action=action,
        explanation=explanation
    )
