"""
AI-Enabled Cloud SDLC Framework
Version: 1.0.0
A comprehensive framework for automating Software Development Lifecycle with AI/ML
"""

__version__ = "1.0.0"
__author__ = "AI SDLC Team"
__description__ = "Cloud-enabled AI framework for optimizing SDLC processes"

from sdlc_framework.phases_orchestrator import (
    SDLCOrchestrator,
    Phase1RequirementsAnalysis,
    Phase2ArchitectureDesign,
    Phase3CodeGeneration,
    Phase4Testing,
    Phase5DefectAnalysis,
    Phase6Deployment,
    Phase7Maintenance,
    run_complete_sdlc
)

__all__ = [
    'SDLCOrchestrator',
    'Phase1RequirementsAnalysis',
    'Phase2ArchitectureDesign',
    'Phase3CodeGeneration',
    'Phase4Testing',
    'Phase5DefectAnalysis',
    'Phase6Deployment',
    'Phase7Maintenance',
    'run_complete_sdlc',
]
