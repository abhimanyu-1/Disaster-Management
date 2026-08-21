from ..schemas.assessment import AssessmentJobRequest, FinalAssessment
from ..workflows.disaster_workflow import run_workflow
from ..database import log_audit_event

def run_assessment_job(request: AssessmentJobRequest) -> FinalAssessment:
    log_audit_event(request.asset_id, "ASSESSMENT_CREATED", "Job received by orchestrator.")
    try:
        final_assessment = run_workflow(request)
        log_audit_event(request.asset_id, "WORKFLOW_COMPLETED", "Final assessment generated successfully.")
        return final_assessment
    except Exception as e:
        log_audit_event(request.asset_id, "WORKFLOW_FAILED", str(e))
        raise e
