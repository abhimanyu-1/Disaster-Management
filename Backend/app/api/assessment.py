from fastapi import APIRouter, HTTPException
from ..schemas.assessment import AssessmentJobRequest, FinalAssessment, VerificationUpdateRequest
from ..agents.orchestrator import run_assessment_job
from ..database import get_assessment, get_dashboard_stats, update_verification_status

router = APIRouter()

@router.post("/assessments", response_model=FinalAssessment)
def create_assessment(request: AssessmentJobRequest):
    try:
        result = run_assessment_job(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/assessments/{id}")
def get_assessment_by_id(id: str):
    data = get_assessment(id)
    if not data:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return data

@router.post("/verification/{id}")
def update_verification(id: str, request: VerificationUpdateRequest):
    data = update_verification_status(id, request.status)
    if not data:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return data

@router.get("/dashboard")
def dashboard():
    stats = get_dashboard_stats()
    return stats
