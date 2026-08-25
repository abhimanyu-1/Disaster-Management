import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Disaster Assessment API is running"}

def test_feed_status():
    response = client.get("/api/feed-status")
    assert response.status_code == 200
    data = response.json()
    assert "feeds" in data
    assert len(data["feeds"]) > 0

def test_get_dashboard():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "stats" in data
    assert "total_assessments" in data["stats"]

def test_get_audit_logs():
    response = client.get("/api/audit-logs")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_stream_assessment(monkeypatch):
    # Mock stream_workflow to yield quick events
    import json
    def mock_stream(request):
        yield json.dumps({"event": "init", "assessment_id": "ASM-TEST1234", "asset_id": "ASSET-1"})
        yield json.dumps({"event": "step_start", "step": 1, "agent": "vision", "name": "Vision Analysis", "message": "Analyzing..."})
        yield json.dumps({"event": "step_complete", "step": 1, "agent": "vision", "data": {"damage_detected": True, "damage_type": "flood", "damage_score": 0.85, "confidence": 0.9, "evidence": "Flooding", "bounding_boxes": [[100, 100, 500, 500]]}})
        yield json.dumps({"event": "complete", "assessment": {"assessment_id": "ASM-TEST1234", "image_path": "test.jpg"}})

    monkeypatch.setattr("app.api.assessment.stream_workflow", mock_stream)
    response = client.post("/api/assessments/stream", json={
        "asset_id": "ASSET-1",
        "image_path": "test.jpg",
        "field_report": "Flood",
        "claim_amount": 50000.0,
        "claim_desc": "Water damage",
        "lat": 12.97,
        "lon": 77.59
    })
    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")
    assert "data: {\"event\": \"init\"" in response.text
    assert "data: {\"event\": \"complete\"" in response.text

