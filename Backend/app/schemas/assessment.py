from pydantic import BaseModel
from typing import List

class VisionAssessment(BaseModel):
    damage_detected: bool
    damage_type: str
    damage_score: float
    confidence: float
    evidence: List[str]
    bounding_box: List[int]


class GeoAssessment(BaseModel):
    population_affected: int
    criticality: float
    flood_zone: bool

class SeverityAssessment(BaseModel):
    severity: str
    severity_score: float

class ClaimAssessment(BaseModel):
    risk: str
    consistent: bool

class PriorityAssessment(BaseModel):
    score: float
    level: str

class VerificationAssessment(BaseModel):
    required: bool
    action: str

class FinalDecision(BaseModel):
    status: str
    recommended_action: str

class FinalAssessment(BaseModel):
    assessment_id: str
    vision: VisionAssessment
    geo_context: GeoAssessment
    assessment: SeverityAssessment
    claim_analysis: ClaimAssessment
    priority: PriorityAssessment
    verification: VerificationAssessment
    final_decision: FinalDecision

class AssessmentJobRequest(BaseModel):
    asset_id: str
    lat: float
    lon: float
    image_path: str
    claim_desc: str
    claim_amount: float
    field_report: str
    
class VerificationUpdateRequest(BaseModel):
    status: str
