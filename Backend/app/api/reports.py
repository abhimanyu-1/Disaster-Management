from fastapi import APIRouter
from typing import List, Dict, Any
from ..store import assessments, audit_logs

router = APIRouter()

@router.get("/dashboard")
def get_dashboard() -> Dict[str, Any]:
    total_assessments = len(assessments)
    
    high_severity_count = 0
    pending_reviews = 0
    
    for asm in assessments.values():
        severity = asm.get("assessment", {}).get("severity", "LOW")
        if severity == "HIGH":
            high_severity_count += 1
            
        status = asm.get("final_decision", {}).get("status", "")
        if status == "REVIEW_REQUIRED":
            pending_reviews += 1

    return {
        "stats": {
            "total_assessments": total_assessments,
            "high_severity": high_severity_count,
            "pending_reviews": pending_reviews
        }
    }

@router.get("/audit-logs")
def get_audit_logs(limit: int = 50) -> List[Dict[str, Any]]:
    # Return newest logs first
    return sorted(audit_logs, key=lambda x: x["timestamp"], reverse=True)[:limit]
