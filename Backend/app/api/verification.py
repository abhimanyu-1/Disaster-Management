from fastapi import APIRouter, HTTPException
from ..schemas.assessment import VerificationUpdateRequest
from ..store import assessments, add_audit_log

router = APIRouter()

@router.post("/verification/{assessment_id}")
def update_verification(assessment_id: str, request: VerificationUpdateRequest):
    if assessment_id not in assessments:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    assessment = assessments[assessment_id]
    
    # Update the final decision status based on human input
    old_status = assessment.get("final_decision", {}).get("status", "UNKNOWN")
    new_status = request.status
    
    if "final_decision" in assessment:
        assessment["final_decision"]["status"] = new_status
    
    assessments[assessment_id] = assessment
    
    add_audit_log(
        action="VERIFICATION_UPDATED", 
        details=f"Status changed from {old_status} to {new_status}", 
        assessment_id=assessment_id
    )
    
    return assessment
