from fastapi import APIRouter, HTTPException
from ..schemas.assessment import AssessmentJobRequest, FinalAssessment, VerificationUpdateRequest
from ..agents.orchestrator import run_assessment_job
from ..database import get_assessment, get_dashboard_stats, update_verification_status, get_audit_logs, log_audit_event
import base64
import os

router = APIRouter()

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
    log_audit_event(id, "VERIFICATION_STATUS_CHANGED", f"Status set to {request.status}")
    return data

@router.get("/dashboard")
def dashboard():
    stats = get_dashboard_stats()
    return stats

@router.get("/audit-logs")
def audit_logs(limit: int = 50):
    return get_audit_logs(limit)

@router.get("/feed-status")
def feed_status():
    return {
        "feeds": [
            {"name": "USGS Global ShakeMap Feeds", "type": "Seismic Ingestion", "status": "ONLINE", "latency": "42ms"},
            {"name": "Copernicus Sentinel-2 Optical", "type": "Satellite SAR/Optical", "status": "ONLINE", "latency": "120ms"},
            {"name": "Maxar OpenData Disaster Fleet", "type": "High-Res Aerial Nadir", "status": "ONLINE", "latency": "85ms"},
            {"name": "NOAA NWS Flash Flood Advisories", "type": "Hydrological Feeds", "status": "ONLINE", "latency": "60ms"},
            {"name": "Tactical UAV / Drone RTMP Stream", "type": "Local Low-Altitude", "status": "STANDBY", "latency": "18ms"}
        ]
    }
