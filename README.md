# SDLC Optimization Framework

An AI-powered Software Development Lifecycle Framework that automatically scaffolds entire, production-ready codebases with documentation, from an initial SRS (text or PDF).

## 🚀 Overview

Upload an SRS document and the framework orchestrates 5 phases: **Requirement Analysis → Design → Implementation → Testing → Deployment**, producing a fully structured project inside the `PROJECTS/` directory.

## 📂 Project Structure

```text
SDLC_Optimization/
│
├── frontend/                         # React + Vite Dashboard (Tailwind v4, Shadcn UI)
│   └── src/
│       ├── components/               # UI components
│       ├── pages/                    # Dashboard, ProjectWizard, PhaseViewer
│       └── services/                 # API clients
│
├── backend/                          # FastAPI Engine (Python 3.11)
│   ├── main.py                       # Application entry point
│   ├── config.py                     # Pydantic settings (.env)
│   ├── api/
│   │   └── routes.py                 # REST endpoints (project CRUD + pipeline)
│   ├── core_engines/
│   │   ├── requirement_analysis/     # Phase 1: SRS → RA Document
│   │   ├── design/                   # Phase 2: Architecture → Design Document (Mermaid)
│   │   ├── implementation/           # Phase 3: Scaffolds frontend + backend code
│   │   ├── testing/                  # Phase 4: Generates test scripts (not executed)
│   │   └── deployment/              # Phase 5: Generates Docker, CI/CD, Nginx
│   ├── rag_service/
│   │   ├── document_processor.py     # Text chunking & preprocessing
│   │   ├── embeddings.py             # Sentence-transformer embeddings
│   │   ├── vector_store.py           # In-memory cosine similarity search
│   │   └── pipeline.py              # Full RAG orchestration
│   ├── models/
│   │   └── schemas.py                # Pydantic request/response models
│   ├── services/
│   │   └── llm_service.py            # OpenAI / LangChain wrapper
│   ├── utils/
│   │   ├── pdf_reader.py             # PDF text extraction
│   │   └── file_writer.py            # File output helpers
│   └── requirements.txt
│
└── PROJECTS/                         # Generated project outputs
    └── [ProjectName_id]/
        ├── requirement_analysis/     # RA Document (Markdown)
        ├── design/                   # Design Document (Markdown + Mermaid diagrams)
        ├── implementation/           # Source code (backend/ + frontend/)
        ├── testing/                  # Test scripts (pytest + vitest)
        └── deployment/              # Docker, CI/CD, Nginx configs
```

## ⚙️ Tech Stack

| Layer          | Technology                                              |
|----------------|--------------------------------------------------------|
| Frontend       | React, Vite, Tailwind CSS v4, Shadcn UI, Redux/Context |
| Backend        | FastAPI, Python 3.11, Uvicorn                          |
| AI / RAG       | Sentence-Transformers, OpenAI, LangChain, ChromaDB     |
| Doc Processing | pdfplumber                                              |
| Validation     | Pydantic v2                                            |

## 🏃 Quick Start

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # Set your OPENAI_API_KEY
python main.py
```
Server runs at `http://localhost:8000`

### Frontend (WIP)
```bash
cd frontend
npm install
npm run dev
```
Dashboard at `http://localhost:5173`

## 📋 API Endpoints

| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| GET    | `/api/projects`           | List all generated projects        |
| POST   | `/api/projects/create`    | Create project (upload PDF / text) |
| GET    | `/api/projects/{id}`      | Get project details                |
| DELETE | `/api/projects/{id}`      | Delete a project                   |
