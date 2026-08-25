import datetime
import sqlite3
import json
import os
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

# Determine the database path dynamically
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
DB_PATH = os.path.join(DATA_DIR, 'disaster.db')

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS assessments (
                id TEXT PRIMARY KEY,
                data TEXT
            )
        ''')
        conn.execute('''
            CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY,
                timestamp TEXT,
                action TEXT,
                details TEXT,
                assessment_id TEXT
            )
        ''')
        conn.commit()

init_db()

class PersistentAssessments(dict):
    def __init__(self):
        super().__init__()
        self._load()
    
    def _load(self):
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.execute('SELECT id, data FROM assessments')
                for row in cursor:
                    super().__setitem__(row[0], json.loads(row[1]))
        except Exception as e:
            logger.error(f"Error loading assessments from DB: {e}")

    def __setitem__(self, key, value):
        super().__setitem__(key, value)
        try:
            with sqlite3.connect(DB_PATH) as conn:
                conn.execute('REPLACE INTO assessments (id, data) VALUES (?, ?)', (key, json.dumps(value)))
                conn.commit()
        except Exception as e:
            logger.error(f"Error saving assessment {key} to DB: {e}")

class PersistentAuditLogs(list):
    def __init__(self):
        super().__init__()
        self._load()
        
    def _load(self):
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cursor = conn.execute('SELECT id, timestamp, action, details, assessment_id FROM audit_logs ORDER BY timestamp ASC')
                for row in cursor:
                    log = {
                        "id": row[0],
                        "timestamp": row[1],
                        "action": row[2],
                        "details": row[3],
                        "assessment_id": row[4]
                    }
                    super().append(log)
        except Exception as e:
            logger.error(f"Error loading audit logs from DB: {e}")
            
    def append(self, log):
        super().append(log)
        try:
            with sqlite3.connect(DB_PATH) as conn:
                conn.execute(
                    'INSERT INTO audit_logs (id, timestamp, action, details, assessment_id) VALUES (?, ?, ?, ?, ?)',
                    (log['id'], log['timestamp'], log['action'], log['details'], log.get('assessment_id'))
                )
                conn.commit()
        except Exception as e:
            logger.error(f"Error saving audit log {log['id']} to DB: {e}")

# In-memory store for assessments (now SQLite backed)
assessments = PersistentAssessments()

# In-memory audit logs (now SQLite backed)
audit_logs = PersistentAuditLogs()

def add_audit_log(action: str, details: str, assessment_id: str = None):
    log = {
        "id": f"LOG-{len(audit_logs) + 1}",
        "timestamp": datetime.datetime.now().isoformat(),
        "action": action,
        "details": details,
        "assessment_id": assessment_id
    }
    audit_logs.append(log)
    logger.info(f"Audit Log: {action} - {details}")
    return log
