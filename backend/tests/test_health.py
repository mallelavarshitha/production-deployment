from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError
from app.database import get_db
from app.main import app

def test_health_check_healthy(client: TestClient):
    """Test health check endpoint when database is reachable."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "timestamp" in data

def test_health_check_db_failure():
    """Test health check returns 503 when database is unreachable."""
    def broken_db():
        mock_session = MagicMock()
        mock_session.execute.side_effect = OperationalError("connection refused", None, None)
        yield mock_session

    app.dependency_overrides[get_db] = broken_db
    with TestClient(app) as test_client:
        response = test_client.get("/api/health")
        assert response.status_code == 503
        data = response.json()
        assert data["status"] == "unhealthy"
        assert data["database"] == "disconnected"
        assert "error" in data
    app.dependency_overrides.clear()
