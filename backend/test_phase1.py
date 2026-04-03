import os
import uuid
from config import settings
from services.llm_service import LLMService

from orchestrator.phase1_orchestrator import Phase1Orchestrator

SAMPLE_SRS = """
# Software Requirements Specification (SRS)
## Project: TaskFlow - To-Do Application

### 1. Introduction
#### 1.1 Purpose
The purpose of this document is to define the functional and non-functional requirements for "TaskFlow," a task management application designed to help users organize, track, and prioritize daily activities.

#### 1.2 Scope
TaskFlow is a web/mobile-based application that allows users to create tasks, set deadlines, categorize items, and receive notifications. It aims to improve personal productivity through a minimalist interface.

---

### 2. Functional Requirements (FR)

| ID | Requirement Name | Description |
|:---|:---|:---|
| FR-1 | User Authentication | Users must be able to sign up, log in, and reset passwords via email. |
| FR-2 | Task Creation | Users can create tasks with a title, description, and optional due date. |
| FR-3 | Task Categorization | Users can assign labels or "tags" (e.g., Work, Personal, Urgent) to tasks. |
| FR-4 | Status Management | Users can mark tasks as 'Pending', 'In Progress', or 'Completed'. |
| FR-5 | Priority Levels | Users can set priority (Low, Medium, High) for each task. |
| FR-6 | Task Deletion | Users can delete individual tasks or clear all completed tasks. |
| FR-7 | Search & Filter | Users can search for tasks by keyword or filter by date/priority/status. |
| FR-8 | Reminders | The system shall send push/email notifications 30 minutes before a task is due. |

---

### 3. Non-Functional Requirements (NFR)
#### 3.1 Performance
- The application should load the task list in under 2 seconds.
- Real-time updates should sync across devices within 500ms.

#### 3.2 Usability
- The interface must follow minimalist design principles.
- The app must be fully responsive for mobile, tablet, and desktop views.

#### 3.3 Reliability
- Task data must be persisted in a database (PostgreSQL/MongoDB) to prevent data loss on refresh.
- The system should maintain 99.9% uptime.

#### 3.4 Security
- User passwords must be hashed using bcrypt before storage.
- All API endpoints must be protected using JWT (JSON Web Tokens).

---

### 4. System Architecture
- **Frontend:** React.js / Flutter (Mobile)
- **Backend:** Node.js with Express / Python with FastAPI
- **Database:** MongoDB (NoSQL for flexible task structures)
- **Authentication:** OAuth 2.0 / Firebase Auth

---

### 5. User Interface (UI) Requirements
- **Dashboard:** A central view showing "Today's Tasks" and "Upcoming."
- **Task Editor:** A modal or slide-over for adding/editing task details.
- **Dark Mode:** A toggle for light and dark themes based on user preference.

---

### 6. Future Scope
- Collaborative "Shared Lists" for team task management.
- Integration with Google Calendar and Outlook.
- AI-based task suggestions based on user habits.
"""

def test_p1_and_rename():
    # 1. Recreate the exact API setup conditions
    project_id = str(uuid.uuid4())[:8]
    old_dir_name = f"temp_project_{project_id}"
    project_dir = os.path.join(settings.projects_dir, old_dir_name)
    os.makedirs(project_dir, exist_ok=True)
    
    print(f"Created temporary directory: {old_dir_name}")
    
    # 2. Recreate LLM and Phase 1 Orchestrator
    llm = LLMService(provider="ollama", ollama_url="http://localhost:11434")
    p1 = Phase1Orchestrator(llm, project_dir)
    
    # 3. Execute Phase 1 exactly as the Main Orchestrator does
    res = p1.execute(SAMPLE_SRS, {"chunks": []})
    
    print("\n--- PHASE 1 SUMMARY (Parsed JSON) ---")
    print(res.get("summary", {}))
    
    # 4. Recreate the dynamic renaming logic exactly as it is in main_orchestrator.py
    inferred_name = res.get("summary", {}).get("project_name")
    
    if inferred_name and "temp_project_" in project_dir:
        parent_dir = os.path.dirname(project_dir)
        uuid_part = os.path.basename(project_dir).split("_")[-1]
        safe_name = "".join(c for c in inferred_name if c.isalnum() or c in (' ', '-', '_')).replace(' ', '_')
        new_dir_name = f"{safe_name}_{uuid_part}"
        new_project_dir = os.path.join(parent_dir, new_dir_name)
        
        try:
            os.rename(project_dir, new_project_dir)
            project_dir = new_project_dir
            print(f"\n✅ SUCCESS: Dynamically renamed project folder to: {new_dir_name}")
        except Exception as e:
            print(f"\n❌ FAILED: Could not rename project directory: {e}")
    else:
        print("\n❌ FAILED: Did not trigger renaming logic (Inferred name is empty or temp_project not in dir)")

if __name__ == "__main__":
    test_p1_and_rename()
