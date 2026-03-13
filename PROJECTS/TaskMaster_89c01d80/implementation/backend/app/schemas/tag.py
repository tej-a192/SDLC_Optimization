from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID

class TagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    color: Optional[str] = Field(None, pattern=r"^#[0-9a-fA-F]{6}$")

class TagCreate(TagBase):
    pass

class TagUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    color: Optional[str] = Field(None, pattern=r"^#[0-9a-fA-F]{6}$")

class TagInDBBase(TagBase):
    id: UUID

    class Config:
        orm_mode = True

class Tag(TagInDBBase):
    pass

class TagWithTasks(TagInDBBase):
    tasks: List['task.Task'] = []

# Update forward references
from . import task
TagWithTasks.update_forward_refs()