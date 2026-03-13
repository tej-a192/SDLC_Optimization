from typing import List, Optional
from uuid import UUID
from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate
from app.services.auth_service import get_current_user


class TaskService:
    """Service class for handling task-related business logic."""

    def __init__(self, db: Session):
        self.db = db

    def get_task(self, task_id: UUID) -> Task:
        """Retrieve a task by its ID."""
        task = self.db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task

    def get_user_tasks(self, user_id: UUID, skip: int = 0, limit: int = 100) -> List[Task]:
        """Retrieve all tasks for a specific user with pagination."""
        return (
            self.db.query(Task)
            .filter(Task.owner_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create_task(self, task_data: TaskCreate, user_id: UUID) -> Task:
        """Create a new task for a user."""
        db_task = Task(
            title=task_data.title,
            description=task_data.description,
            status=task_data.status,
            priority=task_data.priority,
            due_date=task_data.due_date,
            owner_id=user_id,
        )
        self.db.add(db_task)
        self.db.commit()
        self.db.refresh(db_task)
        return db_task

    def update_task(self, task_id: UUID, task_data: TaskUpdate) -> Task:
        """Update an existing task."""
        db_task = self.get_task(task_id)
        
        # Update only provided fields
        update_data = task_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_task, key, value)
            
        db_task.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(db_task)
        return db_task

    def delete_task(self, task_id: UUID) -> bool:
        """Delete a task by its ID."""
        db_task = self.get_task(task_id)
        self.db.delete(db_task)
        self.db.commit()
        return True

    def search_tasks(self, user_id: UUID, query: str) -> List[Task]:
        """Search tasks by title or description for a specific user."""
        return (
            self.db.query(Task)
            .filter(
                and_(
                    Task.owner_id == user_id,
                    Task.title.ilike(f"%{query}%") | Task.description.ilike(f"%{query}%")
                )
            )
            .all()
        )