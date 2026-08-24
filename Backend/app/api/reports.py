from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any
from ..store import assessments, audit_logs
from ..services.pdf_generator import generate_pdf

router = APIRouter()

@router.get("/dashboard")
def get_dashboard() -> Dict[str, Any]:
    total_assessments = len(assessments)
    
    high_severity_count = 0
    pending_reviews = 0
    
    for asm in assessments.values():
        severity = asm.get("assessment", {}).get("severity", "LOW")
        if severity == "HIGH":
            high_severity_count += 1
            
        status = asm.get("final_decision", {}).get("status", "")
        if status == "REVIEW_REQUIRED":
            pending_reviews += 1

    return {
        "stats": {
            "total_assessments": total_assessments,
            "high_severity": high_severity_count,
            "pending_reviews": pending_reviews
        }
    }

@router.get("/audit-logs")
def get_audit_logs(limit: int = 50) -> List[Dict[str, Any]]:
    # Return newest logs first
    return sorted(audit_logs, key=lambda x: x["timestamp"], reverse=True)[:limit]

@router.get("/assessments/{assessment_id}/pdf")
def download_assessment_pdf(assessment_id: str):
    if assessment_id not in assessments:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    assessment_data = assessments[assessment_id]
    if hasattr(assessment_data, 'model_dump'):
        assessment_dict = assessment_data.model_dump()
    else:
        assessment_dict = assessment_data
        
    pdf_buffer = generate_pdf(assessment_dict)
    
    return StreamingResponse(
        pdf_buffer, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename=DisasterManagement_{assessment_id}.pdf"}
    )
