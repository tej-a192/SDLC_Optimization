"""
SDLC Optimization - Pydantic Request / Response Schemas
"""

from pydantic import BaseModel
from typing import Dict, Optional, Any


class ProjectCreateRequest(BaseModel):
    """Schema for creating a new project."""
    project_name: str
    srs_text: Optional[str] = None


class ProjectResponse(BaseModel):
    """Schema for project creation response."""
    project_name: str
    project_id: str
    project_dir: str
    phases: Dict[str, Any]
    status: str


class PhaseStatusResponse(BaseModel):
    """Schema for individual phase status."""
    phase_name: str
    status: str
    output_dir: str
    artifacts: Dict[str, Any] = {}
