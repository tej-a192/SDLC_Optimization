from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.api.v1.dependencies import get_current_user, get_db
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.models.user import User
from app.services import task_service

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new task for the current user.
    
    Args:
        task: Task creation data
        db: Database session
        current_user: Currently authenticated user
    
    Returns:
        Created task object
    """
    try:
        return task_service.create_task(db, task, current_user.id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/", response_model=List[TaskResponse])
def read_tasks(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    priority: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve tasks for the current user with optional filtering.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        status: Filter by task status
        priority: Filter by task priority
        db: Database session
        current_user: Currently authenticated user
    
    Returns:
        List of task objects
    """
    try:
        return task_service.get_user_tasks(
            db, 
            current_user.id, 
            skip=skip, 
            limit=limit,
            status=status,
            priority=priority
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{task_id}", response_model=TaskResponse)
def read_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve a specific task by ID if it belongs to the current user.
    
    Args:
        task_id: ID of the task to retrieve
        db: Database session
        current_user: Currently authenticated user
    
    Returns:
        Task object
    """
    try:
        task = task_service.get_task(db, task_id, current_user.id)
        if task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        return task
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: UUID,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a specific task by ID if it belongs to the current user.
    
    Args:
        task_id: ID of the task to update
        task_update: Task update data
        db: Database session
        current_user: Currently authenticated user
    
    Returns:
        Updated task object
    """
    try:
        task = task_service.update_task(db, task_id, task_update, current_user.id)
        if task is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or not authorized"
            )
        return task
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a specific task by ID if it belongs to the current user.
    
    Args:
        task_id: ID of the task to delete
        db: Database session
        current_user: Currently authenticated user
    
    Returns:
        None
    """
    try:
        success = task_service.delete_task(db, task_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found or not authorized"
            )
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )