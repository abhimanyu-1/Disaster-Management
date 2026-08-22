from ..schemas.assessment import AssessmentJobRequest, FinalAssessment
from ..workflows.disaster_workflow import run_workflow

def run_assessment_job(request: AssessmentJobRequest) -> FinalAssessment:
    try:
        final_assessment = run_workflow(request)
        return final_assessment
    except Exception as e:
        raise e
