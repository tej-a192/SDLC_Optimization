# test_pipeline.py
import asyncio
import json
import httpx

API_URL = "http://127.0.0.1:8000/api/projects/create"

# Simple To-Do application SRS for faster testing
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

async def test_create_project():
    print("Starting e2e integration test...")
    print(f"SRS length: {len(SAMPLE_SRS)} characters")
    try:
        # Timeout to 900s
        async with httpx.AsyncClient(timeout=900.0) as client:
            print(f"Sending request to {API_URL}...")
            
            data = {
                "project_name": "TaskMaster",
                "srs_text": SAMPLE_SRS,
                "llm_provider": "ollama",
            }
            
            response = await client.post(API_URL, data=data)
            
            print(f"\nStatus Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Project creation successful!")
                print(f"Project ID: {result.get('project_id')}")
                print(f"Project Dir: {result.get('project_dir')}")
                print(f"\nPhases:")
                phases = result.get("phases", {})
                for phase_name, phase_data in phases.items():
                    status = phase_data.get("status", "unknown")
                    llm_calls = phase_data.get("llm_calls", 0)
                    artifacts = phase_data.get("artifacts", [])
                    print(f"  {phase_name}: {status} ({llm_calls} LLM calls, {len(artifacts)} artifacts)")
            else:
                print("❌ Project creation failed!")
                print("Error Details:", response.text[:500])
                
    except httpx.ReadTimeout:
        print("⏰ Request timed out (900s). The pipeline is still running on the server.")
        print("Check the server logs for progress.")
    except Exception as e:
        print(f"❌ Exception occurred: {e}")

if __name__ == "__main__":
    asyncio.run(test_create_project())
