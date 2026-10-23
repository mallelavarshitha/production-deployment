from fastapi.testclient import TestClient

def test_create_task_success(client: TestClient):
    """Test creating a valid task with title and description."""
    payload = {
        "title": "Set up PostgreSQL database",
        "description": "Configure compose.yaml and test connection"
    }
    response = client.post("/api/tasks", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["title"] == "Set up PostgreSQL database"
    assert data["description"] == "Configure compose.yaml and test connection"
    assert data["completed"] is False
    assert "created_at" in data
    assert "updated_at" in data

def test_create_task_without_description(client: TestClient):
    """Test creating a task with only a title."""
    response = client.post("/api/tasks", json={"title": "Quick task"})
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Quick task"
    assert data["description"] is None
    assert data["completed"] is False

def test_create_task_empty_title_fails(client: TestClient):
    """Test validation rejection on empty or whitespace title."""
    response = client.post("/api/tasks", json={"title": ""})
    assert response.status_code == 422

    response = client.post("/api/tasks", json={"title": "   "})
    assert response.status_code == 422

def test_get_all_tasks(client: TestClient):
    """Test retrieving list of tasks."""
    client.post("/api/tasks", json={"title": "Task 1"})
    client.post("/api/tasks", json={"title": "Task 2"})

    response = client.get("/api/tasks")
    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) >= 2

def test_get_task_by_id(client: TestClient):
    """Test fetching a single task by ID."""
    created = client.post("/api/tasks", json={"title": "Find me", "description": "Details"}).json()
    task_id = created["id"]

    response = client.get(f"/api/tasks/{task_id}")
    assert response.status_code == 200
    assert response.json()["id"] == task_id
    assert response.json()["title"] == "Find me"

def test_get_task_not_found(client: TestClient):
    """Test fetching a non-existent task returns 404."""
    response = client.get("/api/tasks/999999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Task with ID 999999 not found"

def test_update_task_fields(client: TestClient):
    """Test updating task title, description, and completion status."""
    created = client.post("/api/tasks", json={"title": "Original Title"}).json()
    task_id = created["id"]

    # Update title and description
    response = client.put(f"/api/tasks/{task_id}", json={
        "title": "Updated Title",
        "description": "Added description"
    })
    assert response.status_code == 200
    updated = response.json()
    assert updated["title"] == "Updated Title"
    assert updated["description"] == "Added description"
    assert updated["completed"] is False

    # Mark completed
    response = client.put(f"/api/tasks/{task_id}", json={"completed": True})
    assert response.status_code == 200
    assert response.json()["completed"] is True

    # Mark pending again
    response = client.put(f"/api/tasks/{task_id}", json={"completed": False})
    assert response.status_code == 200
    assert response.json()["completed"] is False

def test_update_task_invalid_title(client: TestClient):
    """Test updating task with empty title returns 422."""
    created = client.post("/api/tasks", json={"title": "Initial"}).json()
    task_id = created["id"]

    response = client.put(f"/api/tasks/{task_id}", json={"title": "   "})
    assert response.status_code == 422

def test_update_task_not_found(client: TestClient):
    """Test updating non-existent task returns 404."""
    response = client.put("/api/tasks/999999", json={"title": "New"})
    assert response.status_code == 404

def test_delete_task_success(client: TestClient):
    """Test deleting an existing task."""
    created = client.post("/api/tasks", json={"title": "To be deleted"}).json()
    task_id = created["id"]

    delete_resp = client.delete(f"/api/tasks/{task_id}")
    assert delete_resp.status_code == 200
    assert delete_resp.json()["id"] == task_id

    # Verify task no longer exists
    get_resp = client.get(f"/api/tasks/{task_id}")
    assert get_resp.status_code == 404

def test_delete_task_not_found(client: TestClient):
    """Test deleting non-existent task returns 404."""
    response = client.delete("/api/tasks/999999")
    assert response.status_code == 404

def test_filter_tasks_by_status(client: TestClient):
    """Test filtering tasks by pending and completed statuses."""
    t1 = client.post("/api/tasks", json={"title": "Pending Item"}).json()
    t2 = client.post("/api/tasks", json={"title": "Completed Item"}).json()
    client.put(f"/api/tasks/{t2['id']}", json={"completed": True})

    # Test completed filter
    resp_completed = client.get("/api/tasks?status=completed")
    assert resp_completed.status_code == 200
    completed_ids = [t["id"] for t in resp_completed.json()]
    assert t2["id"] in completed_ids
    assert t1["id"] not in completed_ids

    # Test pending filter
    resp_pending = client.get("/api/tasks?status=pending")
    assert resp_pending.status_code == 200
    pending_ids = [t["id"] for t in resp_pending.json()]
    assert t1["id"] in pending_ids
    assert t2["id"] not in pending_ids

def test_search_tasks_by_title(client: TestClient):
    """Test searching tasks by title substring."""
    client.post("/api/tasks", json={"title": "Deploy FastAPI to production"})
    client.post("/api/tasks", json={"title": "Configure Docker Compose"})

    response = client.get("/api/tasks?search=FastAPI")
    assert response.status_code == 200
    results = response.json()
    assert len(results) >= 1
    assert all("FastAPI".lower() in t["title"].lower() for t in results)

def test_task_counts(client: TestClient):
    """Test retrieving task count statistics."""
    t1 = client.post("/api/tasks", json={"title": "Count 1"}).json()
    t2 = client.post("/api/tasks", json={"title": "Count 2"}).json()
    client.put(f"/api/tasks/{t2['id']}", json={"completed": True})

    response = client.get("/api/tasks/counts")
    assert response.status_code == 200
    counts = response.json()
    assert counts["total"] >= 2
    assert counts["completed"] >= 1
    assert counts["pending"] >= 1
    assert counts["total"] == counts["completed"] + counts["pending"]
