from fastapi import APIRouter, HTTPException
from ..schemas.assessment import AssessmentJobRequest, FinalAssessment, VerificationUpdateRequest
from ..agents.orchestrator import run_assessment_job

router = APIRouter()

import base64
import os

@router.post("/assessments", response_model=FinalAssessment)
def create_assessment(request: AssessmentJobRequest):
    try:
        if request.image_path.startswith("data:image"):
            header, encoded = request.image_path.split(",", 1)
            image_data = base64.b64decode(encoded)
            upload_path = os.path.join(os.getcwd(), "data", "imagery", "uploaded.jpg")
            os.makedirs(os.path.dirname(upload_path), exist_ok=True)
            with open(upload_path, "wb") as f:
                f.write(image_data)
            request.image_path = upload_path
            
        result = run_assessment_job(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


