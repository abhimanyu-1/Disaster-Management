import uuid
from ..schemas.assessment import (
    FinalAssessment, VisionAssessment, GeoAssessment, 
    SeverityAssessment, ClaimAssessment, PriorityAssessment, 
    VerificationAssessment, FinalDecision
)
from ..schemas.agent import (
    VisionAgentRequest, GeoAgentRequest, 
    ClaimAgentRequest, PriorityAgentRequest, VerificationAgentRequest
)
from ..agents.vision_agent import analyze_images
from ..agents.geo_agent import get_context
from ..agents.claim_agent import analyze_claim
from ..agents.priority_agent import calculate_priority
from ..agents.verification_agent import check_verification
from ..database import log_audit_event, save_assessment

def run_workflow(request) -> FinalAssessment:
    asset_id = request.asset_id
    assessment_id = f"ASM-{str(uuid.uuid4())[:8].upper()}"
    
    # 1. Vision Agent
    print(f"\n[{assessment_id}] === 1. RUNNING VISION AGENT ===")
    vision_resp = analyze_images(VisionAgentRequest(
        image_path=request.image_path,
        asset_id=asset_id
    ))
    print(f"VISION AGENT OUTPUT: {vision_resp.model_dump_json(indent=2)}")
    log_audit_event(asset_id, "VISION_COMPLETED", f"Damage score: {vision_resp.damage_score}")
    
    # 3. Geo Agent
    print(f"\n[{assessment_id}] === 3. RUNNING GEO AGENT ===")
    geo_resp = get_context(GeoAgentRequest(
        lat=request.lat,
        lon=request.lon
    ))
    print(f"GEO AGENT OUTPUT: {geo_resp.model_dump_json(indent=2)}")
    log_audit_event(asset_id, "GEO_CONTEXT_RETRIEVED", f"Population: {geo_resp.population_affected}")
    
    # 4. Assessment Engine
    severity_score = vision_resp.damage_score
    severity_level = "LOW"
    if severity_score > 0.8:
        severity_level = "HIGH"
    elif severity_score > 0.4:
        severity_level = "MEDIUM"
        
    # 5. Claim Agent
    print(f"\n[{assessment_id}] === 4. RUNNING CLAIM AGENT ===")
    claim_resp = analyze_claim(ClaimAgentRequest(
        assessment_severity=severity_level,
        field_report=request.field_report,
        claim_amount=request.claim_amount,
        claim_desc=request.claim_desc
    ))
    print(f"CLAIM AGENT OUTPUT: {claim_resp.model_dump_json(indent=2)}")
    log_audit_event(asset_id, "CLAIM_ANALYSIS_COMPLETED", f"Claim risk: {claim_resp.claim_risk}")
    
    # 6. Priority Agent
    print(f"\n[{assessment_id}] === 5. RUNNING PRIORITY AGENT ===")
    priority_resp = calculate_priority(PriorityAgentRequest(
        severity_score=severity_score,
        population_affected=geo_resp.population_affected,
        criticality=geo_resp.criticality,
        confidence=vision_resp.confidence,
        claim_risk=claim_resp.claim_risk
    ))
    print(f"PRIORITY AGENT OUTPUT: {priority_resp.model_dump_json(indent=2)}")
    log_audit_event(asset_id, "PRIORITY_CALCULATED", f"Priority: {priority_resp.priority_level}")
    
    # 7. Verification Agent
    print(f"\n[{assessment_id}] === 6. RUNNING VERIFICATION AGENT ===")
    verification_resp = check_verification(VerificationAgentRequest(
        confidence=vision_resp.confidence,
        claim_risk=claim_resp.claim_risk,
        evidence_agreement="HIGH" if claim_resp.is_consistent else "LOW"
    ))
    print(f"VERIFICATION AGENT OUTPUT: {verification_resp.model_dump_json(indent=2)}\n")
    log_audit_event(asset_id, "VERIFICATION_COMPLETED", f"Action: {verification_resp.action}")
    
    status = "REVIEW_REQUIRED" if verification_resp.verification_required else "AUTO_APPROVED"
    
    # Assembly
    final_assessment = FinalAssessment(
        assessment_id=assessment_id,
        vision=VisionAssessment(
            damage_detected=vision_resp.damage_detected,
            damage_type=vision_resp.damage_type,
            damage_score=round(vision_resp.damage_score, 3),
            confidence=round(vision_resp.confidence, 3),
            evidence=vision_resp.evidence,
            bounding_box=vision_resp.bounding_box
        ),
        geo_context=GeoAssessment(
            population_affected=geo_resp.population_affected,
            criticality=geo_resp.criticality,
            flood_zone=geo_resp.flood_zone
        ),
        assessment=SeverityAssessment(
            severity=severity_level,
            severity_score=round(severity_score, 3)
        ),
        claim_analysis=ClaimAssessment(
            risk=claim_resp.claim_risk,
            consistent=claim_resp.is_consistent
        ),
        priority=PriorityAssessment(
            score=priority_resp.priority_score,
            level=priority_resp.priority_level
        ),
        verification=VerificationAssessment(
            required=verification_resp.verification_required,
            action=verification_resp.action
        ),
        final_decision=FinalDecision(
            status=status,
            recommended_action=verification_resp.action
        )
    )
    
    save_assessment(assessment_id, asset_id, final_assessment.model_dump())
    
    return final_assessment
