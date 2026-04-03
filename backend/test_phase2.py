import os
import uuid
from config import settings
from services.llm_service import LLMService

from orchestrator.phase1_orchestrator import Phase1Orchestrator
from orchestrator.phase2_orchestrator import Phase2Orchestrator

SAMPLE_SRS = """
# Software Requirements Specification (SRS)
## Project: TaskFlow - To-Do Application

### 1. Introduction
The purpose of this document is to define the functional and non-functional requirements for "TaskFlow," a task management application designed to help users organize, track, and prioritize daily activities.

### 2. Functional Requirements (FR)
| ID | Requirement Name | Description |
|:---|:---|:---|
| FR-1 | User Authentication | Users must be able to sign up, log in. |
| FR-2 | Task Creation | Users can create tasks with a title, description. |
| FR-3 | Task Categorization | Users can assign labels to tasks. |
"""

def test_p2():
    project_id = str(uuid.uuid4())[:8]
    old_dir_name = f"temp_project_{project_id}"
    project_dir = os.path.join(settings.projects_dir, old_dir_name)
    os.makedirs(project_dir, exist_ok=True)
    
    print(f"Created temporary directory: {old_dir_name}")
    
    llm = LLMService(provider="ollama", ollama_url="http://localhost:11434")
    
    # Run Phase 1
    p1 = Phase1Orchestrator(llm, project_dir)
    p1_result = p1.execute(SAMPLE_SRS, {"chunks": []})
    
    # Context setup
    context = {
        "srs_text": SAMPLE_SRS,
        "rag_context": {"chunks": []},
        "phase1_summary": p1_result.get("summary", {})
    }
    
    print("\n--- PHASE 1 SUMMARY PASSED TO PHASE 2 ---")
    print(p1_result.get("summary", {}).get("project_name"))
    print(p1_result.get("summary", {}).get("entities"))
    
    # Run Phase 2
    p2 = Phase2Orchestrator(llm, project_dir)
    res = p2.execute(context)
    
    print("\n--- PHASE 2 SUMMARY (Design Output) ---")
    print(res.get("summary", {}).get("project_name"))
    print("Database Schema snippet preview:")
    print(res.get("summary", {}).get("db_schema_snippet")[:200])
    
if __name__ == "__main__":
    test_p2()
