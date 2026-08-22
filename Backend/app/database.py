import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'audit.db')

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asset_id TEXT NOT NULL,
            event_type TEXT NOT NULL,
            details TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS assessments (
            assessment_id TEXT PRIMARY KEY,
            asset_id TEXT NOT NULL,
            status TEXT NOT NULL,
            priority_level TEXT NOT NULL,
            claim_risk TEXT NOT NULL,
            human_review_required BOOLEAN NOT NULL,
            data_json TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def log_audit_event(asset_id: str, event_type: str, details: str = ""):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO audit_logs (asset_id, event_type, details, timestamp) VALUES (?, ?, ?, ?)",
            (asset_id, event_type, details, datetime.utcnow().isoformat())
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Failed to log audit event: {e}")

def save_assessment(assessment_id: str, asset_id: str, assessment_dict: dict):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        status = assessment_dict.get('final_decision', {}).get('status', 'PENDING')
        priority = assessment_dict.get('priority', {}).get('level', 'LOW')
        claim_risk = assessment_dict.get('claim_analysis', {}).get('risk', 'LOW')
        human_review = assessment_dict.get('verification', {}).get('required', False)
        
        cursor.execute(
            """INSERT INTO assessments 
               (assessment_id, asset_id, status, priority_level, claim_risk, human_review_required, data_json, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (assessment_id, asset_id, status, priority, claim_risk, human_review, json.dumps(assessment_dict), datetime.utcnow().isoformat())
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Failed to save assessment: {e}")

def get_assessment(assessment_id: str) -> dict:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT data_json FROM assessments WHERE assessment_id = ?", (assessment_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return json.loads(row[0])
    return None

def update_verification_status(assessment_id: str, new_status: str) -> dict:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT data_json FROM assessments WHERE assessment_id = ?", (assessment_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return None
        
    data = json.loads(row[0])
    data['final_decision']['status'] = new_status
    
    cursor.execute(
        "UPDATE assessments SET status = ?, data_json = ? WHERE assessment_id = ?",
        (new_status, json.dumps(data), assessment_id)
    )
    conn.commit()
    conn.close()
    return data

def get_dashboard_stats() -> dict:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM assessments")
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM assessments WHERE priority_level = 'CRITICAL'")
    critical = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM assessments WHERE priority_level = 'HIGH'")
    high = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM assessments WHERE claim_risk = 'HIGH'")
    claims_flagged = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM assessments WHERE human_review_required = 1 AND status = 'REVIEW_REQUIRED'")
    human_reviews = cursor.fetchone()[0]
    
    cursor.execute("SELECT assessment_id, asset_id, priority_level, data_json FROM assessments ORDER BY created_at DESC LIMIT 10")
    recent = []
    for row in cursor.fetchall():
        try:
            data = json.loads(row[3])
            score = data.get('priority', {}).get('score', 0)
        except:
            score = 0
            
        recent.append({
            "assessment_id": row[0],
            "asset_id": row[1],
            "priority": row[2],
            "score": score
        })
        
    conn.close()
    
    return {
        "affected_assets": total,
        "critical": critical,
        "high_priority": high,
        "claims_flagged": claims_flagged,
        "human_reviews": human_reviews,
        "priority_queue": recent
    }

def get_audit_logs(limit: int = 50) -> list:
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT id, asset_id, event_type, details, timestamp FROM audit_logs ORDER BY id DESC LIMIT ?", (limit,))
        rows = cursor.fetchall()
        conn.close()
        return [
            {
                "id": r[0],
                "asset_id": r[1],
                "event_type": r[2],
                "details": r[3],
                "timestamp": r[4]
            }
            for r in rows
        ]
    except Exception as e:
        print(f"Failed to get audit logs: {e}")
        return []
