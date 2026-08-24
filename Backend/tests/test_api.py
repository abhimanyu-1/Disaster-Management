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
