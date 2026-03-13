from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

from .user import UserResponse
from .tag import TagResponse


class TaskBase(BaseModel):
    """Base schema for task operations"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    status: Optional[str] = Field("todo", regex="^(todo|in_progress|done)$")
    priority: Optional[int] = Field(1, ge=1, le=5)
    due_date: Optional[datetime] = None


class TaskCreate(TaskBase):
    """Schema for creating a new task"""
    pass


class TaskUpdate(TaskBase):
    """Schema for updating an existing task"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)


class TaskResponse(TaskBase):
    """Schema for returning task data"""
    id: UUID
    owner_id: UUID
    created_at: datetime
    updated_at: datetime
    tags: List[TagResponse] = []

    class Config:
        orm_mode = True


class TaskWithOwnerResponse(TaskResponse):
    """Schema for returning task data with owner information"""
    owner: UserResponse

    class Config:
        orm_mode = True