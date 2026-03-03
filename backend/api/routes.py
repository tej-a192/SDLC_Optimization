"""
SDLC Optimization - API Routes
Defines all endpoints for the SDLC pipeline.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import os
import uuid
import json
from datetime import datetime

from config import settings
from models.schemas import (
    ProjectCreateRequest,
    ProjectResponse,
    PhaseStatusResponse,
)
from core_engines.requirement_analysis.engine import RequirementAnalysisEngine
from core_engines.design.engine import DesignEngine
from core_engines.implementation.engine import ImplementationEngine
from core_engines.testing.engine import TestingEngine
from core_engines.deployment.engine import DeploymentEngine
from rag_service.pipeline import RAGPipeline
from services.llm_service import LLMService

router = APIRouter()


@router.get("/projects")
async def list_projects():
    """List all generated projects in the PROJECTS directory."""
    projects_dir = settings.projects_dir
    if not os.path.exists(projects_dir):
        return {"projects": []}

    projects = []
    for name in os.listdir(projects_dir):
        project_path = os.path.join(projects_dir, name)
        if os.path.isdir(project_path):
            metadata_path = os.path.join(project_path, "project_metadata.json")
            if os.path.exists(metadata_path):
                with open(metadata_path, "r") as f:
                    metadata = json.load(f)
                projects.append(metadata)
            else:
                projects.append({"project_name": name, "status": "incomplete"})

    return {"projects": projects}


@router.post("/projects/create")
async def create_project(
    project_name: str = Form(...),
    srs_text: Optional[str] = Form(None),
    srs_file: Optional[UploadFile] = File(None),
    llm_provider: str = Form("gemini"),
    ollama_url: Optional[str] = Form(None),
):
    """
    Create a new project by providing an SRS document (PDF upload or raw text).
    Select the LLM provider: "openai", "gemini", or "ollama".
    For Ollama, provide the URL where it is running.
    Triggers the full SDLC pipeline: RA -> Design -> Implementation -> Testing -> Deployment
    """
    if not srs_text and not srs_file:
        raise HTTPException(
            status_code=400,
            detail="Please provide either SRS text or upload an SRS PDF file.",
        )

    # Initialize the LLM service with the selected provider
    llm = LLMService(
        provider=llm_provider,
        ollama_url=ollama_url or settings.ollama_url,
    )

    # Generate unique project ID
    project_id = str(uuid.uuid4())[:8]
    project_dir = os.path.join(settings.projects_dir, f"{project_name}_{project_id}")
    os.makedirs(project_dir, exist_ok=True)

    # Extract text from PDF if uploaded
    raw_srs_text = srs_text or ""
    if srs_file:
        from utils.pdf_reader import extract_text_from_pdf

        pdf_bytes = await srs_file.read()
        raw_srs_text = extract_text_from_pdf(pdf_bytes)

    # Initialize project metadata
    metadata = {
        "project_name": project_name,
        "project_id": project_id,
        "created_at": datetime.now().isoformat(),
        "srs_input_method": "pdf" if srs_file else "text",
        "llm_provider": llm_provider,
        "phases": {},
    }

    # ── RAG Pipeline: chunk + embed the SRS ──
    rag = RAGPipeline()
    rag_context = rag.process_document(raw_srs_text)

    # ── Phase 1: Requirement Analysis ──
    ra_engine = RequirementAnalysisEngine(project_dir)
    ra_result = ra_engine.execute(raw_srs_text, rag_context)
    metadata["phases"]["requirement_analysis"] = ra_result

    # ── Phase 2: Design ──
    design_engine = DesignEngine(project_dir)
    design_result = design_engine.execute(ra_result, rag_context)
    metadata["phases"]["design"] = design_result

    # ── Phase 3: Implementation ──
    impl_engine = ImplementationEngine(project_dir)
    impl_result = impl_engine.execute(ra_result, design_result, rag_context)
    metadata["phases"]["implementation"] = impl_result

    # ── Phase 4: Testing ──
    test_engine = TestingEngine(project_dir)
    test_result = test_engine.execute(impl_result)
    metadata["phases"]["testing"] = test_result

    # ── Phase 5: Deployment ──
    deploy_engine = DeploymentEngine(project_dir)
    deploy_result = deploy_engine.execute(impl_result)
    metadata["phases"]["deployment"] = deploy_result

    # Save project metadata
    metadata_path = os.path.join(project_dir, "project_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2, default=str)

    return ProjectResponse(
        project_name=project_name,
        project_id=project_id,
        project_dir=project_dir,
        phases=metadata["phases"],
        status="completed",
    )


@router.get("/projects/{project_id}")
async def get_project(project_id: str):
    """Get detailed info about a specific project."""
    projects_dir = settings.projects_dir
    for name in os.listdir(projects_dir):
        if project_id in name:
            metadata_path = os.path.join(projects_dir, name, "project_metadata.json")
            if os.path.exists(metadata_path):
                with open(metadata_path, "r") as f:
                    return json.load(f)
    raise HTTPException(status_code=404, detail="Project not found")


@router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    """Delete a project and all its generated artifacts."""
    import shutil

    projects_dir = settings.projects_dir
    for name in os.listdir(projects_dir):
        if project_id in name:
            shutil.rmtree(os.path.join(projects_dir, name))
            return {"message": f"Project {project_id} deleted successfully"}
    raise HTTPException(status_code=404, detail="Project not found")
