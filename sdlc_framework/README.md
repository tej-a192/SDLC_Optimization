# AI-Enabled Cloud SDLC Framework

A comprehensive **AI-powered Software Development Lifecycle Framework** that automates the end-to-end SDLC process with machine learning, cloud deployment, and real-time monitoring.

## 🎯 Overview

This framework orchestrates a complete 7-phase SDLC process enhanced with AI/ML capabilities:

1. **Requirements Analysis & Embeddings** - Extract and embed SRS documents
2. **Architecture Design** - Generate system diagrams using Mermaid
3. **Code Generation** - Auto-generate code from requirements and existing patterns
4. **Testing** - Execute unit and integration tests
5. **Defect Analysis** - Identify and remediate defects using ML models
6. **Cloud Deployment** - Deploy to AWS/GCP/Azure with CI/CD
7. **Maintenance & Monitoring** - Monitor system health and performance

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│         AI-Enabled SDLC Framework                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Phase 1     │  │  Phase 2     │  │  Phase 3     │  │
│  │ Requirements │→ │ Architecture │→ │    Code      │  │
│  │              │  │              │  │ Generation   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         ↓                  ↓                  ↓          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Phase 4     │  │  Phase 5     │  │  Phase 6     │  │
│  │   Testing    │→ │   Defects    │→ │ Deployment   │  │
│  │              │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         ↓                  ↓                  ↓          │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Phase 7: Maintenance & Monitoring       │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │    Web UI Dashboard - View All Phase Outputs     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 📦 Project Structure

```
sdlc_framework/
├── phases_orchestrator.py      # Main SDLC orchestrator and phase classes
├── app.py                      # Flask web application
├── requirements.txt            # Python dependencies
├── templates/
│   ├── index.html             # Dashboard home page
│   ├── project_dashboard.html  # Project overview
│   ├── phase_view.html        # Individual phase detailed view
│   └── diagrams_view.html     # Architecture diagrams viewer
├── static/
│   └── css/
│       └── style.css          # Main stylesheet
└── README.md
```

## 🚀 Quick Start

### Installation

1. **Clone/Navigate to the framework directory:**
   ```bash
   cd d:\SDLC\sdlc_framework
   ```

2. **Create a virtual environment (optional but recommended):**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application

1. **Start the Flask development server:**
   ```bash
   python app.py
   ```

2. **Open your browser and navigate to:**
   ```
   http://localhost:5000
   ```

3. **Create your first project:**
   - Click "New Project"
   - Enter project name and SRS requirements
   - The framework will execute all 7 phases automatically

## 📋 Phases Explained

### Phase 1: Requirements Analysis & Embeddings
**Purpose:** Extract and semantically understand SRS documents

**Outputs:**
- Embedding vectors for requirements chunks
- Semantic similarity analysis
- Requirement summaries

**Technologies:**
- Sentence Transformers (all-MiniLM-L6-v2)
- Text chunking and preprocessing

### Phase 2: Architecture Design
**Purpose:** Generate system architecture diagrams

**Outputs:**
- System Architecture Diagram
- Database Schema (ER Diagram)
- Data Flow Diagram
- Technology Stack Diagram

**Diagram Format:** Mermaid.js for easy viewing and export

### Phase 3: Code Generation
**Purpose:** Auto-generate project files and code structure

**Outputs:**
- main.py - Application entry point
- requirements.txt - Dependencies
- config.py - Configuration management
- models.py - Data models
- .env.example - Environment template
- .gitignore - Git configuration

### Phase 4: Testing
**Purpose:** Validate generated code through automated tests

**Outputs:**
- Test results summary
- Individual test status (passed/failed)
- Code coverage metrics
- Test execution times

### Phase 5: Defect Analysis & Remediation
**Purpose:** Identify and provide remediation for defects

**Outputs:**
- Defect inventory by severity (High/Medium/Low)
- Defect location and description
- Remediation suggestions
- Remediation status tracking

### Phase 6: Cloud Deployment
**Purpose:** Deploy application to cloud platform

**Outputs:**
- Deployment configuration
- Cloud endpoint URL
- Deployment ID
- Docker configuration
- CI/CD pipeline setup

### Phase 7: Maintenance & Monitoring
**Purpose:** Monitor deployed system health

**Outputs:**
- System health status (Healthy/Warning/Critical)
- Performance metrics:
  - Uptime percentage
  - Response time (ms)
  - Error rate
  - Active users count
  - Requests per second
  - CPU and Memory usage
  - Database latency

## 🖥️ Web UI Features

### Dashboard
- **Project Overview:** View all projects at a glance
- **Statistics:** Total projects, completed phases, frameworks used
- **Quick Actions:** Create new project, export, delete

### Project Dashboard
- **Phase Progress Tracker:** Visual progress through SDLC phases
- **Phase Cards:** Detailed information about each phase
- **Project Statistics:** Metrics and completion status

### Phase Viewer
- **Detailed Phase Outputs:** View all outputs from each phase
- **Code Display:** Formatted code and configuration
- **Test Results:** Visual test summary and detailed results
- **Defect Report:** Color-coded defect cards with severity
- **Metrics Dashboard:** System performance metrics

### Diagram Viewer
- **Interactive Mermaid Diagrams:** View and explore architecture
- **Multiple Diagram Types:**
  - System Architecture
  - Database Schema
  - Data Flow
  - Technology Stack
- **Download Option:** Export diagrams as SVG

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
PROJECT_NAME=My SDLC Project
DEBUG=True
TESTING=False

# LLM Settings
OPENAI_API_KEY=your-api-key-here
MODEL_NAME=gpt-4

# Database
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=sdlc_framework

# Cloud Deployment
CLOUD_PROVIDER=aws
CLOUD_REGION=us-east-1
```

## 📊 API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/execute-sdlc` - Execute SDLC workflow
- `GET /api/project/<project_id>/metadata` - Get project metadata
- `POST /api/project/<project_id>/delete` - Delete project
- `GET /api/project/<project_id>/export` - Export project as ZIP

### Phases
- `GET /api/project/<project_id>/phase/<phase_num>` - Get phase outputs
- `GET /api/project/<project_id>/diagrams` - Get all diagrams

### Statistics
- `GET /api/stats` - Get framework statistics

## 🎨 UI Components

### Theme
- **Color Scheme:**
  - Primary: Indigo (#6366f1)
  - Secondary: Purple (#8b5cf6)
  - Success: Green (#10b981)
  - Danger: Red (#ef4444)
  - Warning: Amber (#f59e0b)

### Responsive Design
- Mobile-first approach
- Breakpoints: 768px, 480px
- Touch-friendly interfaces
- Optimized for all screen sizes

## 🔄 Workflow Example

1. **Create Project**
   ```python
   # Input: SRS document and project name
   # Framework creates new project with unique ID
   ```

2. **Execute SDLC**
   ```python
   metadata = run_complete_sdlc("MyProject", srs_text, srs_chunks)
   ```

3. **View Results**
   - Navigate to project dashboard
   - Review each phase's outputs
   - Examine architecture diagrams
   - Check defect analysis
   - Monitor deployment status

## 🛠️ Extending the Framework

### Adding Custom Phases

```python
class CustomPhase:
    def __init__(self, orchestrator):
        self.orchestrator = orchestrator
        self.output_dir = os.path.join(orchestrator.output_dir, "phase_custom")
    
    def execute(self):
        # Implement custom logic
        result = {...}
        self.orchestrator.update_phase_status(8, "completed", result)
        return result
```

### Integrating with LLMs

```python
from langchain.llms import OpenAI
from langchain.chains import LLMChain

llm = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
# Use in code generation or requirement analysis
```

## 📈 Analytics & Metrics

The framework tracks:
- Phases completed per project
- Average execution time per phase
- Defect density and remediation rate
- Code coverage metrics
- System uptime and performance
- User engagement metrics

## 🔒 Security Features

- Project isolation
- API authentication ready
- Environment variable management
- Secure file handling
- Input validation
- CORS support

## 🚂 CI/CD Integration

The framework generates:
- Docker configuration
- CI/CD pipeline scripts
- Automated testing setup
- Deployment scripts

## 📚 Documentation

Full documentation is available in the generated project directories:
- `project_metadata.json` - Project configuration
- Phase-specific README files
- Code documentation and comments

## 🤝 Integration Points

### With External Services
- GitHub API - Code repository integration
- Cloud providers (AWS, GCP, Azure)
- OpenAI/GPT-4 - Code generation
- Jira/GitHub Issues - Defect tracking

### Data Sources
- PDF SRS documents
- GitHub repositories
- Defect datasets
- Performance metrics databases

## ⚠️ Prerequisites

- Python 3.8+
- 4GB RAM minimum
- Internet connection (for LLM APIs)
- Optional: MongoDB, Docker, Cloud account

## 🐛 Troubleshooting

### Common Issues

**Port 5000 already in use:**
```bash
python app.py --port 5001
```

**Missing dependencies:**
```bash
pip install --upgrade -r requirements.txt
```

**PDF extraction errors:**
```bash
# Ensure pdfplumber is installed
pip install pdfplumber
```

## 📝 License

This framework is provided as-is for educational and development purposes.

## 🙋 Support

For issues and questions:
1. Check the project metadata files
2. Review phase-specific outputs
3. Check logs in phase directories

## 🎓 Learn More

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Sentence Transformers](https://www.sbert.net/)
- [LangChain](https://python.langchain.com/)
- [Mermaid Diagrams](https://mermaid.js.org/)

## 🔮 Future Enhancements

- [ ] Real-time progress tracking
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] Custom phase templates
- [ ] Multi-language support
- [ ] Mobile application
- [ ] GraphQL API
- [ ] WebSocket real-time updates

---

**Built with ❤️ for automated SDLC optimization**

Last Updated: 2026-02-12
