from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

from .task import TaskResponse
from .tag import TagResponse

class UserBase(BaseModel):
    """Base schema for user data"""
    email: EmailStr = Field(..., example="user@example.com")

class UserCreate(UserBase):
    """Schema for creating a new user"""
    password: str = Field(..., min_length=8, example="securepassword123")

class UserUpdate(BaseModel):
    """Schema for updating user data"""
    email: Optional[EmailStr] = Field(None, example="updated@example.com")
    is_active: Optional[bool] = Field(None, example=True)
    is_superuser: Optional[bool] = Field(None, example=False)

class UserInDBBase(UserBase):
    """Base schema for user data stored in database"""
    id: UUID
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class UserResponse(UserInDBBase):
    """Schema for user response data"""
    pass

class UserWithTasksAndTags(UserInDBBase):
    """Schema for user with related tasks and tags"""
    tasks: List[TaskResponse] = []
    tags: List[TagResponse] = []

class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Schema for JWT token payload data"""
    user_id: Optional[str] = None
    email: Optional[str] = None