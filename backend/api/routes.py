"""
SDLC Optimization - API Routes
Defines all endpoints for the SDLC pipeline.
Now uses the Main Orchestrator for LLM-powered project generation.
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import os
import uuid
import json
import shutil
from datetime import datetime
from fastapi.responses import FileResponse

from config import settings
from models.schemas import (
    ProjectCreateRequest,
    ProjectResponse,
    PhaseStatusResponse,
)
from rag_service.pipeline import RAGPipeline
from services.llm_service import LLMService
from orchestrator.main_orchestrator import MainOrchestrator

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
    Triggers the full SDLC pipeline via the Main Orchestrator.
    """
    if not srs_text and not srs_file:
        raise HTTPException(
            status_code=400,
            detail="Please provide either SRS text or upload an SRS PDF file.",
        )

    # Initialize the LLM service with the selected provider and key rotation
    llm = LLMService(
        provider=llm_provider,
        ollama_url=ollama_url or settings.ollama_url,
    )

    # Generate unique project ID
    project_id = str(uuid.uuid4())[:8]
    safe_name = "".join(c for c in project_name if c.isalnum() or c in (' ', '-', '_')).replace(' ', '_')
    project_dir = os.path.join(settings.projects_dir, f"{safe_name}_{project_id}")
    os.makedirs(project_dir, exist_ok=True)

    # Extract text from PDF if uploaded
    raw_srs_text = srs_text or ""
    if srs_file:
        from utils.pdf_reader import extract_text_from_pdf
        pdf_bytes = await srs_file.read()
        raw_srs_text = extract_text_from_pdf(pdf_bytes)

    # ── RAG Pipeline: chunk + embed the SRS ──
    rag = RAGPipeline()
    rag_context = rag.process_document(raw_srs_text)

    # ── Run the Main Orchestrator (all 5 phases with LLM) ──
    orchestrator = MainOrchestrator(llm, project_dir)
    pipeline_created_at = datetime.now().isoformat()
    pipeline_result = orchestrator.run(
        raw_srs_text,
        rag_context,
        project_name=project_name,
        project_created_at=pipeline_created_at,
    )

    # Unpack result — orchestrator now returns {phases, evaluation_metrics}
    phases_result      = pipeline_result.get("phases",             {})
    evaluation_metrics = pipeline_result.get("evaluation_metrics", {})

    # Ensure the correct path and name are saved
    project_dir = orchestrator.project_dir
    final_project_name = project_name

    # Build and save project metadata (includes evaluation_metrics for every project)
    metadata = {
        "project_name": final_project_name,
        "project_id": project_id,
        "created_at": pipeline_created_at,
        "srs_input_method": "pdf" if srs_file else "text",
        "llm_provider": llm_provider,
        "phases": phases_result,
        "evaluation_metrics": evaluation_metrics,
    }

    metadata_path = os.path.join(project_dir, "project_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2, default=str)

    return ProjectResponse(
        project_name=final_project_name,
        project_id=project_id,
        project_dir=project_dir,
        phases=phases_result,
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
            project_path = os.path.join(projects_dir, name)
            shutil.rmtree(project_path)
            return {"message": f"Project {project_id} deleted successfully."}

    raise HTTPException(status_code=404, detail="Project not found")


@router.get("/projects/{project_id}/download")
async def download_project(project_id: str):
    """Zip the generated project directory and return it for download."""
    projects_dir = settings.projects_dir
    for name in os.listdir(projects_dir):
        if project_id in name:
            project_path = os.path.join(projects_dir, name)
            zip_path = os.path.join(settings.projects_dir, f"{name}.zip")
            shutil.make_archive(zip_path.replace('.zip', ''), 'zip', project_path)
            
            return FileResponse(
                path=zip_path, 
                media_type="application/x-zip-compressed", 
                filename=f"{name}.zip"
            )

    raise HTTPException(status_code=404, detail="Project not found")
