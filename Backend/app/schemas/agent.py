from pydantic import BaseModel
from typing import List

class SamAgentRequest(BaseModel):
    image_path: str
    rough_bbox: List[float]

class SamAgentResponse(BaseModel):
    refined_bboxes: List[List[float]]


class VisionAgentRequest(BaseModel):
    image_path: str
    asset_id: str

class VisionAgentResponse(BaseModel):
    asset_type: str
    damage_detected: bool
    damage_type: str
    damage_score: float
    confidence: float
    evidence: List[str]
    bounding_box: List[float]


class GeoAgentRequest(BaseModel):
    lat: float
    lon: float

class GeoAgentResponse(BaseModel):
    population_affected: int
    criticality: float
    accessibility: float
    flood_zone: bool

class ClaimAgentRequest(BaseModel):
    assessment_severity: str
    field_report: str
    claim_amount: float
    claim_desc: str

class ClaimAgentResponse(BaseModel):
    claim_risk: str
    is_consistent: bool
    explanation: str

class PriorityAgentRequest(BaseModel):
    severity_score: float
    population_affected: int
    criticality: float
    confidence: float
    claim_risk: str

class PriorityAgentResponse(BaseModel):
    priority_score: float
    priority_level: str
    explanation: str

class VerificationAgentRequest(BaseModel):
    confidence: float
    claim_risk: str
    evidence_agreement: str

class VerificationAgentResponse(BaseModel):
    verification_required: bool
    action: str
    explanation: str
