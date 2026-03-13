"""
Phase 5 Orchestrator — Deployment
Generates deployment configurations: Docker, CI/CD, Nginx, and environment templates.

LLM Calls:
  1. Dockerfiles (backend + frontend)
  2. docker-compose.yml + Nginx config
  3. (Conditional) CI/CD pipeline (GitHub Actions)
"""

import os
import json
from datetime import datetime
from typing import Dict, Any

from services.llm_service import LLMService
from utils.file_writer import write_text_file, write_json_file


SYSTEM_PROMPT = """You are an expert DevOps engineer.
You write production-ready Docker, CI/CD, and infrastructure configurations.
Follow security best practices and optimize for performance.
Return ONLY the file content, no markdown fences or explanations."""


class Phase5Orchestrator:

    def __init__(self, llm: LLMService, project_dir: str):
        self.llm = llm
        self.project_dir = project_dir
        self.output_dir = os.path.join(project_dir, "deployment")
        os.makedirs(self.output_dir, exist_ok=True)
        self.llm_calls = 0

    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Run the Deployment phase."""
        print("[Phase 5] Deployment — Starting...")

        p1_summary = context.get("phase1_summary", {})
        p3_summary = context.get("phase3_summary", {})

        generated_files = []

        # ── LLM Call 1: Dockerfiles ──
        dockerfiles = self._generate_dockerfiles(p1_summary, p3_summary)
        write_text_file(self.output_dir, "Dockerfile.backend", dockerfiles["backend"])
        write_text_file(self.output_dir, "Dockerfile.frontend", dockerfiles["frontend"])
        generated_files.extend(["Dockerfile.backend", "Dockerfile.frontend"])

        # ── LLM Call 2: docker-compose + Nginx ──
        compose_content = self._generate_docker_compose(p1_summary, p3_summary)
        write_text_file(self.output_dir, "docker-compose.yml", compose_content)
        generated_files.append("docker-compose.yml")

        nginx_content = self._generate_nginx_config(p1_summary)
        write_text_file(self.output_dir, "nginx.conf", nginx_content)
        generated_files.append("nginx.conf")

        # ── LLM Call 3 (conditional): CI/CD Pipeline ──
        if len(p1_summary.get("functional_requirements", [])) >= 3:
            cicd = self._generate_cicd_pipeline(p1_summary, p3_summary)
            ci_dir = os.path.join(self.output_dir, ".github", "workflows")
            os.makedirs(ci_dir, exist_ok=True)
            write_text_file(ci_dir, "ci.yml", cicd)
            generated_files.append(".github/workflows/ci.yml")

        # Generate .env.example for the generated project
        env_example = self._generate_env_template(p1_summary, p3_summary)
        write_text_file(self.output_dir, ".env.example", env_example)
        generated_files.append(".env.example")

        result = {
            "status": "completed",
            "phase": "deployment",
            "output_dir": self.output_dir,
            "artifacts": generated_files,
            "summary": {
                "total_deployment_files": len(generated_files),
                "has_docker": True,
                "has_cicd": ".github/workflows/ci.yml" in generated_files,
                "has_nginx": True,
            },
            "llm_calls": self.llm_calls,
            "completed_at": datetime.now().isoformat(),
        }

        print("[Phase 5] Deployment — Complete")
        return result

    def _generate_dockerfiles(self, p1_summary: Dict, p3_summary: Dict) -> Dict[str, str]:
        """LLM Call 1: Generate Dockerfiles for backend and frontend."""
        self.llm_calls += 1

        tech_stack = p3_summary.get("tech_stack", {})

        prompt = f"""Generate two Dockerfiles for this full-stack web application.

Project: {p1_summary.get('project_name', 'Unknown')}
Backend: {tech_stack.get('backend', 'FastAPI (Python)')}
Frontend: {tech_stack.get('frontend', 'React (Vite)')}
Database: {tech_stack.get('database', 'PostgreSQL')}

Return the output in this EXACT format (with the separator):

===BACKEND_DOCKERFILE===
<Dockerfile content for backend>
===FRONTEND_DOCKERFILE===
<Dockerfile content for frontend>

Requirements:
- Use multi-stage builds for smaller images
- Backend: Python 3.11 slim, install requirements, expose port 8000
- Frontend: Node 20 alpine for build, Nginx alpine for serving
- Include health checks
- Follow security best practices (non-root user)
"""

        response = self.llm.generate(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=3000, model="glm-4.7:cloud")

        # Parse the response
        backend_df = ""
        frontend_df = ""

        if "===BACKEND_DOCKERFILE===" in response and "===FRONTEND_DOCKERFILE===" in response:
            parts = response.split("===FRONTEND_DOCKERFILE===")
            backend_df = parts[0].replace("===BACKEND_DOCKERFILE===", "").strip()
            frontend_df = parts[1].strip() if len(parts) > 1 else ""
        else:
            # Fallback: split in half
            backend_df = response
            frontend_df = self._fallback_frontend_dockerfile()

        return {"backend": self._clean(backend_df), "frontend": self._clean(frontend_df)}

    def _generate_docker_compose(self, p1_summary: Dict, p3_summary: Dict) -> str:
        """LLM Call 2: Generate docker-compose.yml."""
        self.llm_calls += 1

        tech_stack = p3_summary.get("tech_stack", {})

        prompt = f"""Generate a docker-compose.yml for this project.

Project: {p1_summary.get('project_name', 'Unknown')}
Services needed:
- backend (FastAPI, port 8000)
- frontend (React/Nginx, port 80)
- database ({tech_stack.get('database', 'PostgreSQL')})
- (optional) redis for caching

Include:
- Proper networking between services
- Volume mounts for database persistence
- Environment variables from .env file
- Health checks
- Restart policies

Return ONLY the YAML content.
"""

        return self._clean(self.llm.generate(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=2000, model="glm-4.7:cloud"))

    def _generate_nginx_config(self, p1_summary: Dict) -> str:
        """Generate Nginx reverse proxy configuration."""
        self.llm_calls += 1

        prompt = f"""Generate an Nginx configuration for a reverse proxy.

Project: {p1_summary.get('project_name', 'Unknown')}

Requirements:
- Serve the React frontend static files at /
- Proxy /api/* to the FastAPI backend at http://backend:8000
- Include gzip compression
- Include security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Include WebSocket support for /ws
- Configure proper caching for static assets

Return ONLY the Nginx config content.
"""

        return self._clean(self.llm.generate(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=1500, model="glm-4.7:cloud"))

    def _generate_cicd_pipeline(self, p1_summary: Dict, p3_summary: Dict) -> str:
        """LLM Call 3: Generate GitHub Actions CI/CD pipeline."""
        self.llm_calls += 1

        prompt = f"""Generate a GitHub Actions CI/CD pipeline.

Project: {p1_summary.get('project_name', 'Unknown')}
Backend: Python (FastAPI)
Frontend: React (Vite)

Pipeline should:
1. Trigger on push to main and pull requests
2. Run backend tests (pytest)
3. Run frontend tests (vitest)
4. Build Docker images
5. (Optional) Deploy step placeholder

Return ONLY the YAML content.
"""

        return self._clean(self.llm.generate(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=2000, model="glm-4.7:cloud"))

    def _generate_env_template(self, p1_summary: Dict, p3_summary: Dict) -> str:
        """Generate .env.example for the generated project."""
        tech_stack = p3_summary.get("tech_stack", {})
        db = tech_stack.get("database", "PostgreSQL")

        return f"""# {p1_summary.get('project_name', 'Project')} — Environment Variables

# Backend
BACKEND_PORT=8000
DEBUG=True
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL={'postgresql://user:password@db:5432/appdb' if 'postgres' in db.lower() else 'sqlite:///./app.db'}

# Frontend
VITE_API_URL=http://localhost:8000/api

# Optional
REDIS_URL=redis://redis:6379/0
"""

    def _fallback_frontend_dockerfile(self) -> str:
        """Fallback frontend Dockerfile if parsing fails."""
        return """FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
"""

    def _clean(self, text: str) -> str:
        """Strip markdown code fences if present."""
        import re
        text = text.strip()
        match = re.match(r"^```\w*\n(.*?)```$", text, re.DOTALL)
        if match:
            return match.group(1).strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()
