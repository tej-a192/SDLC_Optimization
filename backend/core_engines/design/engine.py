"""
SDLC Optimization - Design Engine
Phase 2: Generates a comprehensive Design Document with embedded Mermaid diagrams.

Input:  RA result + RAG context
Output: Design Document (Markdown with Mermaid) saved to project_dir/design/
"""

import os
from datetime import datetime
from typing import Dict, Any

from utils.file_writer import write_text_file, write_json_file


class DesignEngine:
    """
    Generates a Design Document that includes:
      - System Architecture Diagram (Mermaid)
      - Database Schema / ER Diagram (Mermaid)
      - Data Flow Diagram (Mermaid)
      - Technology Stack Diagram (Mermaid)
      - Component descriptions and design rationale
    """

    def __init__(self, project_dir: str):
        self.project_dir = project_dir
        self.output_dir = os.path.join(project_dir, "design")
        os.makedirs(self.output_dir, exist_ok=True)

    def execute(self, ra_result: Dict[str, Any], rag_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the Design phase.

        Args:
            ra_result: Output from the Requirement Analysis phase.
            rag_context: Context from the RAG pipeline.

        Returns:
            Phase result metadata.
        """
        print("[Phase 2] Design - Starting...")

        # Generate Mermaid diagrams
        system_arch = self._generate_system_architecture()
        db_schema = self._generate_database_schema()
        data_flow = self._generate_data_flow()
        tech_stack = self._generate_tech_stack()

        # Compose the full Design Document with embedded diagrams
        design_doc = self._compose_design_document(
            ra_summary=ra_result.get("summary", {}),
            system_arch=system_arch,
            db_schema=db_schema,
            data_flow=data_flow,
            tech_stack=tech_stack,
        )

        # Save the Design Document
        write_text_file(self.output_dir, "Design_Document.md", design_doc)

        # Also save individual diagram files for reference
        write_text_file(self.output_dir, "system_architecture.mmd", system_arch)
        write_text_file(self.output_dir, "database_schema.mmd", db_schema)
        write_text_file(self.output_dir, "data_flow.mmd", data_flow)
        write_text_file(self.output_dir, "tech_stack.mmd", tech_stack)

        # Save metadata
        metadata = {
            "diagrams_generated": 4,
            "diagram_types": ["system_architecture", "database_schema", "data_flow", "tech_stack"],
            "generated_at": datetime.now().isoformat(),
        }
        write_json_file(self.output_dir, "design_metadata.json", metadata)

        result = {
            "status": "completed",
            "phase": "design",
            "output_dir": self.output_dir,
            "artifacts": [
                "Design_Document.md",
                "system_architecture.mmd",
                "database_schema.mmd",
                "data_flow.mmd",
                "tech_stack.mmd",
                "design_metadata.json",
            ],
            "metadata": metadata,
            "completed_at": datetime.now().isoformat(),
        }

        print("[Phase 2] Design - Complete")
        return result

    # ──────────────────────────────────────────────
    # Mermaid Diagram Generators
    # (To be enhanced with LLM-driven dynamic generation)
    # ──────────────────────────────────────────────

    def _generate_system_architecture(self) -> str:
        """Generate System Architecture diagram in Mermaid syntax."""
        return """graph TB
    Client["Client Layer<br/>(Web / Mobile)"]
    LB["Load Balancer"]
    API["API Gateway"]
    Auth["Authentication<br/>Service"]
    App["Application<br/>Server"]
    Cache["Cache Layer<br/>(Redis)"]
    DB["Database<br/>(PostgreSQL)"]
    Queue["Message Queue<br/>(RabbitMQ)"]
    Storage["File Storage<br/>(S3/MinIO)"]

    Client --> LB
    LB --> API
    API --> Auth
    API --> App
    App --> Cache
    App --> DB
    App --> Queue
    App --> Storage"""

    def _generate_database_schema(self) -> str:
        """Generate Database ER diagram in Mermaid syntax."""
        return """erDiagram
    USERS ||--o{ PROJECTS : creates
    USERS {
        int id PK
        string name
        string email
        string password_hash
        datetime created_at
    }
    PROJECTS ||--o{ MODULES : contains
    PROJECTS {
        int id PK
        string name
        string description
        int owner_id FK
        datetime created_at
    }
    MODULES ||--o{ TASKS : has
    MODULES {
        int id PK
        string name
        int project_id FK
    }
    TASKS {
        int id PK
        string title
        string status
        int module_id FK
        datetime due_date
    }"""

    def _generate_data_flow(self) -> str:
        """Generate Data Flow diagram in Mermaid syntax."""
        return """graph LR
    A["User Input"] -->|REST API| B["API Gateway"]
    B -->|Validate| C["Auth Middleware"]
    C -->|Authorized| D["Business Logic"]
    D -->|Read/Write| E["Database"]
    D -->|Cache| F["Redis"]
    D -->|Async Tasks| G["Message Queue"]
    E -->|Result| H["Response Builder"]
    H -->|JSON| I["Client Response"]"""

    def _generate_tech_stack(self) -> str:
        """Generate Technology Stack diagram in Mermaid syntax."""
        return """graph TB
    subgraph "Frontend"
        React["React + Vite"]
        Tailwind["Tailwind CSS v4"]
        Shadcn["Shadcn UI"]
    end
    subgraph "Backend"
        FastAPI["FastAPI"]
        Python["Python 3.11"]
        SQLAlchemy["SQLAlchemy ORM"]
    end
    subgraph "Data Layer"
        PostgreSQL["PostgreSQL"]
        Redis["Redis Cache"]
    end
    subgraph "DevOps"
        Docker["Docker"]
        CICD["GitHub Actions"]
        Nginx["Nginx"]
    end

    Frontend --> Backend
    Backend --> Data_Layer["Data Layer"]
    Backend --> DevOps"""

    # ──────────────────────────────────────────────
    # Design Document Composer
    # ──────────────────────────────────────────────

    def _compose_design_document(
        self,
        ra_summary: Dict,
        system_arch: str,
        db_schema: str,
        data_flow: str,
        tech_stack: str,
    ) -> str:
        """Compose the full Design Document with embedded Mermaid diagrams."""
        doc = f"""# Design Document

## 1. Introduction

This document presents the architectural design for the project based on the
requirements captured during the Requirement Analysis phase. It includes system
architecture, database schema, data flow, and technology stack decisions.

**Generated At:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

---

## 2. Design Overview

| Aspect               | Details                                                |
|----------------------|--------------------------------------------------------|
| Complexity           | {ra_summary.get("complexity_estimate", "N/A")}        |
| Total Requirements   | {ra_summary.get("total_sentences", "N/A")} sentences  |
| Architecture Style   | Layered / Client-Server                                |
| Communication        | RESTful APIs (JSON)                                    |

---

## 3. System Architecture

The following diagram represents the high-level system architecture:

```mermaid
{system_arch}
```

### Component Descriptions

- **Client Layer**: Web and mobile interfaces that interact with the backend via REST APIs.
- **API Gateway**: Central entry point that handles routing, rate limiting, and authentication.
- **Application Server**: Core business logic processing layer.
- **Cache Layer**: Redis-based caching for frequently accessed data.
- **Database**: PostgreSQL for persistent relational data storage.
- **Message Queue**: RabbitMQ for asynchronous task processing.
- **File Storage**: S3-compatible object storage for uploaded files and generated artifacts.

---

## 4. Database Schema

The Entity-Relationship diagram for the database:

```mermaid
{db_schema}
```

---

## 5. Data Flow

How data moves through the system from user input to response:

```mermaid
{data_flow}
```

---

## 6. Technology Stack

Overview of technologies used across layers:

```mermaid
{tech_stack}
```

---

## 7. Security Considerations

> _To be populated with specific security design decisions based on the requirement analysis._

---

## 8. API Design

> _To be populated with endpoint specifications and request/response schemas._

---

## 9. Deployment Architecture

> _Refer to the Deployment phase output for Docker and CI/CD configuration._

---

_This document was auto-generated by the SDLC Optimization Framework._
"""
        return doc
