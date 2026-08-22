import datetime
from typing import Dict, List, Any

# In-memory store for assessments
assessments: Dict[str, Any] = {}

# In-memory audit logs
audit_logs: List[Dict[str, Any]] = []

def add_audit_log(action: str, details: str, assessment_id: str = None):
    log = {
        "id": f"LOG-{len(audit_logs) + 1}",
        "timestamp": datetime.datetime.now().isoformat(),
        "action": action,
        "details": details,
        "assessment_id": assessment_id
    }
    audit_logs.append(log)
    return log
