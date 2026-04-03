import pytest
from fastapi.testclient import TestClient
from backend.src.main import app
from backend.src.models.task.model import Task
from backend.src.services.task.service import TaskService
from backend.src.types.task.types import TaskCreate, TaskUpdate
from typing import List, Dict, Any
from unittest.mock import patch, MagicMock
import uuid

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def sample_task_data():
    return {
        "title": "Test Task",
        "description": "This is a test task",
        "completed": False
    }

@pytest.fixture
def sample_task_update_data():
    return {
        "title": "Updated Task",
        "description": "This task has been updated",
        "completed": True
    }

@pytest.fixture
def mock_task_service():
    with patch('backend.src.controllers.task.controller.TaskService') as mock:
        yield mock

class TestTaskCreation:
    def test_create_task_success(self, client: TestClient, sample_task_data: Dict[str, Any]):
        response = client.post("/tasks/", json=sample_task_data)
        assert response.status_code == 201
        assert response.json()["title"] == sample_task_data["title"]
        assert response.json()["description"] == sample_task_data["description"]
        assert response.json()["completed"] == sample_task_data["completed"]

    def test_create_task_missing_title(self, client: TestClient, sample_task_data: Dict[str, Any]):
        invalid_data = sample_task_data.copy()
        del invalid_data["title"]
        response = client.post("/tasks/", json=invalid_data)
        assert response.status_code == 422
        assert "title" in response.json()["detail"][0]["loc"]

    def test_create_task_empty_description(self, client: TestClient, sample_task_data: Dict[str, Any]):
        invalid_data = sample_task_data.copy()
        invalid_data["description"] = ""
        response = client.post("/tasks/", json=invalid_data)
        assert response.status_code == 201  # Empty description should be allowed

    def test_create_task_service_error(self, client: TestClient, sample_task_data: Dict[str, Any], mock_task_service: MagicMock):
        mock_task_service.return_value.create_task.side_effect = Exception("Database error")
        response = client.post("/tasks/", json=sample_task_data)
        assert response.status_code == 500
        assert "error" in response.json()

class TestTaskRetrieval:
    def test_get_all_tasks_empty(self, client: TestClient):
        response = client.get("/tasks/")
        assert response.status_code == 200
        assert response.json() == []

    def test_get_all_tasks_with_data(self, client: TestClient, sample_task_data: Dict[str, Any]):
        # First create a task
        create_response = client.post("/tasks/", json=sample_task_data)
        assert create_response.status_code == 201

        # Then get all tasks
        response = client.get("/tasks/")
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["title"] == sample_task_data["title"]

    def test_get_task_by_id_success(self, client: TestClient, sample_task_data: Dict[str, Any]):
        # Create a task
        create_response = client.post("/tasks/", json=sample_task_data)
        assert create_response.status_code == 201
        task_id = create_response.json()["id"]

        # Get the task by ID
        response = client.get(f"/tasks/{task_id}")
        assert response.status_code == 200
        assert response.json()["id"] == task_id
        assert response.json()["title"] == sample_task_data["title"]

    def test_get_task_by_id_not_found(self, client: TestClient):
        non_existent_id = str(uuid.uuid4())
        response = client.get(f"/tasks/{non_existent_id}")
        assert response.status_code == 404
        assert "detail" in response.json()

    def test_get_task_by_id_invalid_format(self, client: TestClient):
        invalid_id = "invalid-uuid-format"
        response = client.get(f"/tasks/{invalid_id}")
        assert response.status_code == 422
        assert "detail" in response.json()

class TestTaskUpdate:
    def test_update_task_success(self, client: TestClient, sample_task_data: Dict[str, Any], sample_task_update_data: Dict[str, Any]):
        # Create a task
        create_response = client.post("/tasks/", json=sample_task_data)
        assert create_response.status_code == 201
        task_id = create_response.json()["id"]

        # Update the task
        response = client.put(f"/tasks/{task_id}", json=sample_task_update_data)
        assert response.status_code == 200
        assert response.json()["title"] == sample_task_update_data["title"]
        assert response.json()["description"] == sample_task_update_data["description"]
        assert response.json()["completed"] == sample_task_update_data["completed"]

    def test_update_task_not_found(self, client: TestClient, sample_task_update_data: Dict[str, Any]):
        non_existent_id = str(uuid.uuid4())
        response = client.put(f"/tasks/{non_existent_id}", json=sample_task_update_data)
        assert response.status_code == 404
        assert "detail" in response.json()

    def test_update_task_partial_update(self, client: TestClient, sample_task_data: Dict[str, Any]):
        # Create a task
        create_response = client.post("/tasks/", json=sample_task_data)
        assert create_response.status_code == 201
        task_id = create_response.json()["id"]

        # Partial update (only mark as complete)
        partial_update = {"completed": True}
        response = client.put(f"/tasks/{task_id}", json=partial_update)
        assert response.status_code == 200
        assert response.json()["completed"] == True
        assert response.json()["title"] == sample_task_data["title"]  # Other fields unchanged

    def test_update_task_invalid_data(self, client: TestClient, sample_task_data: Dict[str, Any]):
        # Create a task
        create_response = client.post("/tasks/", json=sample_task_data)
        assert create_response.status_code == 201
        task_id = create_response.json()["id"]

        # Try to update with invalid data (empty title)
        invalid_update = {"title": ""}
        response = client.put(f"/tasks/{task_id}", json=invalid_update)
        assert response.status_code == 422
        assert "title" in response.json()["detail"][0]["loc"]

class TestTaskDeletion:
    def test_delete_task_success(self, client: TestClient, sample_task_data: Dict[str, Any]):
        # Create a task
        create_response = client.post("/tasks/", json=sample_task_data)
        assert create_response.status_code == 201
        task_id = create_response.json()["id"]

        # Delete the task
        response = client.delete(f"/tasks/{task_id}")
        assert response.status_code == 200
        assert response.json()["message"] == "Task deleted successfully"

        # Verify the task is gone
        get_response = client.get(f"/tasks/{task_id}")
        assert get_response.status_code == 404

    def test_delete_task_not_found(self, client: TestClient):
        non_existent_id = str(uuid.uuid4())
        response = client.delete(f"/tasks/{non_existent_id}")
        assert response.status_code == 404
        assert "detail" in response.json()

    def test_delete_task_invalid_id_format(self, client: TestClient):
        invalid_id = "invalid-uuid-format"
        response = client.delete(f"/tasks/{invalid_id}")
        assert response.status_code == 422
        assert "detail" in response.json()

class TestTaskValidation:
    def test_task_title_length_validation(self, client: TestClient, sample_task_data: Dict[str, Any]):
        # Test minimum length (assuming 1 character minimum)
        valid_short_title = {"title": "a", "description": "test"}
        response = client.post("/tasks/", json=valid_short_title)
        assert response.status_code == 201

        # Test maximum length (assuming 100 characters maximum)
        long_title = "a" * 101
        invalid_long_title = {"title": long_title, "description": "test"}
        response = client.post("/tasks/", json=invalid_long_title)
        assert response.status_code == 422
        assert "title" in response.json()["detail"][0]["loc"]

    def test_task_description_length_validation(self, client: TestClient, sample_task_data: Dict[str, Any]):
        # Test very long description (assuming 500 characters maximum)
        long_description = "a" * 501
        invalid_data = sample_task_data.copy()
        invalid_data["description"] = long_description
        response = client.post("/tasks/", json=invalid_data)
        assert response.status_code == 422
        assert "description" in response.json()["detail"][0]["loc"]

class TestErrorHandling:
    def test_internal_server_error_handling(self, client: TestClient, mock_task_service: MagicMock):
        mock_task_service.return_value.get_all_tasks.side_effect = Exception("Unexpected error")
        response = client.get("/tasks/")
        assert response.status_code == 500
        assert "error" in response.json()

    def test_not_found_error_handling(self, client: TestClient):
        non_existent_id = str(uuid.uuid4())
        response = client.get(f"/tasks/{non_existent_id}")
        assert response.status_code == 404
        assert "detail" in response.json()

    def test_validation_error_handling(self, client: TestClient):
        invalid_data = {"title": "", "description": "test"}  # Empty title
        response = client.post("/tasks/", json=invalid_data)
        assert response.status_code == 422
        assert "detail" in response.json()