'''
Data models for SDLC Framework
'''

from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class Requirement(BaseModel):
    requirement_id: str
    description: str
    priority: str
    category: str
    created_at: datetime

class CodeArtifact(BaseModel):
    artifact_id: str
    source_code: str
    language: str
    quality_score: float
    defects: List[str]

class DefectReport(BaseModel):
    defect_id: str
    description: str
    severity: str
    location: str
    remedy: str

class DeploymentConfig(BaseModel):
    cloud_provider: str
    region: str
    environment: str
    auto_scaling: bool
