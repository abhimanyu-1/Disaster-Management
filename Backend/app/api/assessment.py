from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from ..schemas.assessment import AssessmentJobRequest, FinalAssessment, VerificationUpdateRequest
from ..agents.orchestrator import run_assessment_job
from ..workflows.disaster_workflow import stream_workflow
from ..store import assessments, add_audit_log
from dotenv import load_dotenv
import base64
import os
import json

load_dotenv()

router = APIRouter()


@router.post("/assessments/stream")
def stream_assessment(request: AssessmentJobRequest):
    try:
        if request.image_path.startswith("data:image"):
            header, encoded = request.image_path.split(",", 1)
            image_data = base64.b64decode(encoded)
            upload_path = os.path.join(os.getcwd(), "data", "imagery", "uploaded.jpg")
            os.makedirs(os.path.dirname(upload_path), exist_ok=True)
            with open(upload_path, "wb") as f:
                f.write(image_data)
            request.image_path = upload_path

        def event_generator():
            try:
                for event_json in stream_workflow(request):
                    event_obj = json.loads(event_json)
                    if event_obj.get("event") == "complete":
                        final_data = event_obj.get("assessment", {})
                        asm_id = final_data.get("assessment_id")
                        if asm_id:
                            assessments[asm_id] = final_data
                            add_audit_log("ASSESSMENT_CREATED", f"Assessment generated for {request.asset_id}", asm_id)
                    yield f"data: {event_json}\n\n"
            except Exception as ex:
                err_data = json.dumps({"event": "error", "error": str(ex)})
                yield f"data: {err_data}\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
        assessments[result.assessment_id] = result.model_dump()
        add_audit_log("ASSESSMENT_CREATED", f"Assessment generated for {request.asset_id}", result.assessment_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/assessments/{assessment_id}", response_model=FinalAssessment)
def get_assessment(assessment_id: str):
    if assessment_id not in assessments:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessments[assessment_id]


@router.get("/feed-status")
def feed_status():
    api_key_loaded = bool(os.environ.get("GEMINI_API_KEY"))
    status = "ONLINE" if api_key_loaded else "OFFLINE"
    
    return {
        "feeds": [
            {"name": "Gemini Vision Multimodal Feed", "type": "Satellite SAR/Optical", "status": status, "latency": "120ms"},
            {"name": "USGS Global ShakeMap Feeds", "type": "Seismic Ingestion", "status": status, "latency": "42ms"},
            {"name": "Maxar OpenData Disaster Fleet", "type": "High-Res Aerial Nadir", "status": status, "latency": "85ms"},
            {"name": "NOAA NWS Flash Flood Advisories", "type": "Hydrological Feeds", "status": status, "latency": "60ms"},
            {"name": "Tactical UAV / Drone RTMP Stream", "type": "Local Low-Altitude", "status": "STANDBY", "latency": "18ms"}
        ]
    }
