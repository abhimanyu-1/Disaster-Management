from fastapi import APIRouter, HTTPException, Response, Query
from ..schemas.assessment import AssessmentJobRequest, FinalAssessment, VerificationUpdateRequest
from ..agents.orchestrator import run_assessment_job
from ..services.report_generator import generate_pdf_report
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


@router.post("/assessments/report")
def download_assessment_report(
    assessment: FinalAssessment,
    format: str = Query("pdf", description="Output format: pdf, json, or markdown")
):
    try:
        if format.lower() == "pdf":
            pdf_bytes = generate_pdf_report(assessment)
            filename = f"Disaster_Assessment_{assessment.assessment_id}.pdf"
            return Response(
                content=pdf_bytes,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f'attachment; filename="{filename}"'
                }
            )
        elif format.lower() == "markdown":
            md_content = f"""# DISASTER DAMAGE ASSESSMENT REPORT
**Assessment ID:** {assessment.assessment_id}  
**Disaster Type:** {assessment.vision.damage_type.upper()}  
**Severity:** {assessment.assessment.severity} (Score: {assessment.assessment.severity_score})  
**Threat / Priority:** {assessment.priority.level} (Score: {assessment.priority.score})  
**Final Decision:** {assessment.final_decision.status} ({assessment.final_decision.recommended_action})  

---

## 1. Visual & Spatial Analysis
- **Damage Detected:** {assessment.vision.damage_detected}
- **Damage Score:** {assessment.vision.damage_score}
- **Confidence:** {round(assessment.vision.confidence * 100, 1)}%
- **Refined Bounding Box:** {assessment.vision.bounding_box}
- **Visual Evidence:**
{chr(10).join([f"  - {e}" for e in assessment.vision.evidence])}

## 2. Geographical Context
- **Affected Population:** {assessment.geo_context.population_affected:,}
- **Criticality Index:** {assessment.geo_context.criticality}
- **Flood Risk Zone:** {assessment.geo_context.flood_zone}

## 3. Insurance Claim & Fraud Analysis
- **Claim Risk:** {assessment.claim_analysis.risk}
- **Evidence Consistency:** {assessment.claim_analysis.consistent}

## 4. Verification & Guardrail
- **Review Required:** {assessment.verification.required}
- **Action:** {assessment.verification.action}
"""
            filename = f"Disaster_Assessment_{assessment.assessment_id}.md"
            return Response(
                content=md_content,
                media_type="text/markdown",
                headers={
                    "Content-Disposition": f'attachment; filename="{filename}"'
                }
            )
        else:
            filename = f"Disaster_Assessment_{assessment.assessment_id}.json"
            return Response(
                content=assessment.model_dump_json(indent=2),
                media_type="application/json",
                headers={
                    "Content-Disposition": f'attachment; filename="{filename}"'
                }
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")


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
