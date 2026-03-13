"""
Phase 3 Orchestrator — Implementation (Production-Grade)
Generates a complete, production-grade project with proper folder structure,
using the tech stack specified in the SRS document.

LLM Calls:
  1. Plan the FULL production-grade folder structure (JSON tree)
  2-N. One LLM call per file (dynamic, based on the plan)
"""

import os
import json
import re
from datetime import datetime
from typing import Dict, Any, List

from services.llm_service import LLMService
from utils.file_writer import write_text_file, write_json_file


SYSTEM_PROMPT = """You are a senior full-stack software engineer who builds production-grade applications.
You write clean, well-structured, properly organized code following industry best practices.
When generating code files, return ONLY the raw file content — no markdown fences, no explanations.
You follow the exact tech stack specified in the requirements — do NOT substitute technologies.
Your code must be complete and runnable, not stubs or placeholders."""


class Phase3Orchestrator:

    def __init__(self, llm: LLMService, project_dir: str):
        self.llm = llm
        self.project_dir = project_dir
        self.output_dir = os.path.join(project_dir, "implementation")
        os.makedirs(self.output_dir, exist_ok=True)
        self.llm_calls = 0

    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Run the Implementation phase."""
        print("[Phase 3] Implementation — Starting...")

        p1_summary = context.get("phase1_summary", {})
        p2_summary = context.get("phase2_summary", {})
        srs_text = context.get("srs_text", "")

        # ── LLM Call 1: Plan the FULL production-grade folder structure ──
        folder_structure = self._plan_folder_structure(p1_summary, p2_summary, srs_text)

        # ── LLM Call 2: Generate a detailed implementation guide ──
        impl_guide = self._generate_implementation_guide(p1_summary, p2_summary, folder_structure, srs_text)

        # Save the implementation guide
        write_text_file(self.output_dir, "IMPLEMENTATION_GUIDE.md", impl_guide)

        # ── Dynamic LLM Calls: Generate each file from the folder structure ──
        all_files = self._flatten_file_tree(folder_structure)
        generated_files = []

        print(f"[Phase 3] Generating {len(all_files)} files...")

        for i, file_info in enumerate(all_files, 1):
            filepath = file_info.get("path", "")
            description = file_info.get("description", "")
            print(f"  [{i}/{len(all_files)}] Generating: {filepath}")

            code = self._generate_file(
                filepath, description,
                p1_summary, p2_summary, folder_structure, impl_guide
            )

            # Write the file
            full_path = os.path.join(self.output_dir, filepath)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(code)

            generated_files.append(filepath)

        # Save the manifest
        write_json_file(self.output_dir, "file_manifest.json", {
            "folder_structure": folder_structure,
            "total_files": len(generated_files),
            "files": generated_files,
        })

        result = {
            "status": "completed",
            "phase": "implementation",
            "output_dir": self.output_dir,
            "artifacts": generated_files + ["file_manifest.json", "IMPLEMENTATION_GUIDE.md"],
            "summary": {
                "total_files": len(generated_files),
                "file_list": generated_files,
                "folder_structure": folder_structure,
                "project_name": p1_summary.get("project_name", "Unknown"),
                "tech_stack": p2_summary.get("tech_stack", p1_summary.get("tech_stack_hints", {})),
            },
            "llm_calls": self.llm_calls,
            "completed_at": datetime.now().isoformat(),
        }

        print(f"[Phase 3] Implementation — Complete ({len(generated_files)} files generated)")
        return result

    def _plan_folder_structure(self, p1_summary: Dict, p2_summary: Dict, srs_text: str) -> Dict:
        """
        LLM Call 1: Plan the complete, production-grade folder structure.
        This is the MOST IMPORTANT call — it determines the entire project shape.
        """
        self.llm_calls += 1

        tech_hints = p2_summary.get("tech_stack", p1_summary.get("tech_stack_hints", {}))
        entities = p1_summary.get("entities", [])
        reqs = p1_summary.get("functional_requirements", [])
        user_roles = p1_summary.get("user_roles", [])

        prompt = f"""You are planning a PRODUCTION-GRADE project folder structure.

## Project Context
- Project Name: {p1_summary.get('project_name', 'Unknown')}
- Description: {p1_summary.get('project_description', '')}

## Tech Stack (from SRS — use EXACTLY these technologies, do NOT substitute)
{json.dumps(tech_hints, indent=2)}

## Entities
{', '.join(entities)}

## User Roles
{', '.join(user_roles)}

## Key Requirements
{chr(10).join(f'- {r}' for r in reqs[:15])}

## Original SRS (excerpt)
{srs_text[:2000]}

## Instructions
Generate a COMPLETE production-grade folder structure as a JSON object. 
The structure must follow real-world best practices for the specified tech stack:

For a **Node.js/Express backend**, include:
- src/config/ (database, env, constants)
- src/models/ (one file per entity)  
- src/routes/ (one file per resource)
- src/controllers/ (one file per resource)
- src/services/ (business logic, one per domain)
- src/middleware/ (auth, error handler, validation, rate limiter)
- src/utils/ (helpers, validators, email sender)
- src/types/ (TypeScript types/interfaces if TS)
- prisma/schema.prisma (if using Prisma)
- package.json, tsconfig.json, .env.example

For a **React frontend**, include:
- src/components/ (reusable UI components organized by feature)
- src/pages/ (one per route/view)
- src/hooks/ (custom hooks)
- src/services/ (API service layer)
- src/context/ or src/store/ (state management)
- src/utils/ (helpers, formatters)
- src/types/ (TypeScript types if TS)
- src/styles/ (global styles, theme)
- package.json, vite.config or next.config, tailwind.config

For a **Python/FastAPI backend**, include:
- app/api/v1/endpoints/ (one per resource)
- app/models/ (SQLAlchemy models)
- app/schemas/ (Pydantic schemas)  
- app/services/ (business logic)
- app/core/ (config, security, database)
- app/middleware/
- alembic/ (migrations)
- requirements.txt, .env.example

Return a JSON object with this EXACT format:
{{
  "backend": {{
    "root_files": [
      {{"path": "package.json", "description": "Node.js dependencies and scripts"}},
      ...
    ],
    "directories": {{
      "src/config": [
        {{"path": "src/config/database.ts", "description": "Database connection config"}},
        ...
      ],
      "src/models": [
        {{"path": "src/models/user.model.ts", "description": "User model"}},
        ...
      ]
    }}
  }},
  "frontend": {{
    "root_files": [...],
    "directories": {{...}}
  }}
}}

IMPORTANT:
- Aim for 25-40 files total (enough for production quality, not excessive)
- Every file listed MUST be a real, necessary file
- Use the EXACT tech stack from the SRS — DO NOT substitute React for Next.js, etc.
- Include config files (package.json, tsconfig, etc.)
- Return ONLY the JSON, no markdown fences
"""

        response = self.llm.generate(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=6000, model="qwen3-coder:480b-cloud")

        try:
            cleaned = self._strip_fences(response)
            structure = json.loads(cleaned)
        except json.JSONDecodeError:
            print("[Phase 3] Warning: Could not parse folder structure JSON. Using smart fallback.")
            structure = self._smart_fallback_structure(p1_summary, tech_hints)

        return structure

    def _generate_implementation_guide(self, p1_summary: Dict, p2_summary: Dict,
                                        folder_structure: Dict, srs_text: str) -> str:
        """
        LLM Call 2: Generate a detailed implementation guide that all file generators reference.
        This ensures consistency across all generated files.
        """
        self.llm_calls += 1

        prompt = f"""Generate a concise but comprehensive IMPLEMENTATION GUIDE for this project.
This guide will be referenced when generating each source file to ensure consistency.

## Project: {p1_summary.get('project_name', 'Unknown')}
## Tech Stack: {json.dumps(p2_summary.get('tech_stack', p1_summary.get('tech_stack_hints', {})))}
## Entities: {', '.join(p1_summary.get('entities', []))}
## User Roles: {', '.join(p1_summary.get('user_roles', []))}

## Folder Structure:
{json.dumps(folder_structure, indent=2)[:3000]}

Cover these topics concisely:
1. **Naming Conventions** — file names, variable names, class names, table names
2. **Database Schema** — exact table/model definitions with fields and types
3. **API Endpoints** — method, path, auth requirement, description
4. **Authentication Flow** — JWT structure, middleware chain
5. **Key Shared Types/Interfaces** — that multiple files reference
6. **Environment Variables** — all required env vars
7. **Import Conventions** — how files import from each other

Keep it under 2000 words. Use Markdown.
"""

        return self.llm.generate(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=5000, model="qwen3-coder:480b-cloud")

    def _generate_file(self, filepath: str, description: str,
                       p1_summary: Dict, p2_summary: Dict,
                       folder_structure: Dict, impl_guide: str) -> str:
        """Generate a single source code file using LLM."""
        self.llm_calls += 1

        ext = os.path.splitext(filepath)[1]
        tech_stack = p2_summary.get("tech_stack", p1_summary.get("tech_stack_hints", {}))

        # Determine language context
        if ext in (".ts", ".tsx"):
            lang = "TypeScript"
        elif ext in (".js", ".jsx"):
            lang = "JavaScript"
        elif ext in (".py",):
            lang = "Python"
        elif ext in (".prisma",):
            lang = "Prisma Schema"
        elif ext in (".json",):
            lang = "JSON"
        elif ext in (".yml", ".yaml"):
            lang = "YAML"
        elif ext in (".css", ".scss"):
            lang = "CSS"
        else:
            lang = "Config"

        # Build a concise context string from other files in the same directory
        dir_name = os.path.dirname(filepath)
        sibling_files = self._get_sibling_files(folder_structure, dir_name)

        prompt = f"""Generate the COMPLETE content for: **{filepath}**
Purpose: {description}

## Project Context
- Project: {p1_summary.get('project_name', 'Unknown')}
- Language: {lang}
- Tech Stack: {json.dumps(tech_stack)}
- Entities: {', '.join(p1_summary.get('entities', [])[:10])}
- User Roles: {', '.join(p1_summary.get('user_roles', []))}

## Other files in this directory (for import consistency)
{chr(10).join(f'- {f}' for f in sibling_files[:10])}

## Implementation Guide (for consistency)
{impl_guide[:2000]}

## Key Requirements
{chr(10).join(f'- {r}' for r in p1_summary.get('functional_requirements', [])[:8])}

## RULES
1. Return ONLY the raw file content — NO markdown fences, NO explanations
2. Write COMPLETE, production-ready code — not stubs or TODOs
3. Include proper imports referencing sibling files correctly
4. Add JSDoc/docstring comments for functions
5. Handle errors properly with try/catch or error middleware
6. For package.json: include ALL necessary dependencies with versions
7. For config files: include all required settings
8. Use the EXACT tech stack from the SRS
"""

        code = self.llm.generate(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=6000, model="qwen3-coder:480b-cloud")
        return self._strip_fences(code)

    def _flatten_file_tree(self, structure: Dict) -> List[Dict]:
        """Flatten the nested folder structure into a flat list of files."""
        files = []

        for layer in ["backend", "frontend"]:
            layer_data = structure.get(layer, {})

            # Root files
            for f in layer_data.get("root_files", []):
                path = f.get("path", "")
                if path:
                    files.append({
                        "path": f"{layer}/{path}",
                        "description": f.get("description", ""),
                    })

            # Directory files
            for dir_name, dir_files in layer_data.get("directories", {}).items():
                for f in dir_files:
                    path = f.get("path", "")
                    if path:
                        # If the path already includes the directory, don't double-prefix
                        full_path = f"{layer}/{path}" if not path.startswith(dir_name) else f"{layer}/{path}"
                        files.append({
                            "path": full_path,
                            "description": f.get("description", ""),
                        })

        return files

    def _get_sibling_files(self, folder_structure: Dict, dir_name: str) -> List[str]:
        """Get file names in the same directory for import context."""
        all_files = self._flatten_file_tree(folder_structure)
        return [
            os.path.basename(f["path"])
            for f in all_files
            if os.path.dirname(f["path"]) == os.path.dirname(dir_name + "/x")
        ][:10]

    def _strip_fences(self, code: str) -> str:
        """Remove markdown code fences from LLM response."""
        code = code.strip()
        match = re.match(r"^```\w*\n(.*?)```$", code, re.DOTALL)
        if match:
            return match.group(1).strip()
        if code.startswith("```"):
            code = code.split("\n", 1)[1] if "\n" in code else code[3:]
        if code.endswith("```"):
            code = code[:-3]
        return code.strip()

    def _smart_fallback_structure(self, p1_summary: Dict, tech_hints: Dict) -> Dict:
        """Generate a reasonable fallback structure based on the tech stack hints."""
        backend_tech = str(tech_hints.get("backend", "")).lower()
        frontend_tech = str(tech_hints.get("frontend", "")).lower()
        db_tech = str(tech_hints.get("database", "")).lower()

        # Determine file extensions
        be_ext = ".py" if "python" in backend_tech or "fastapi" in backend_tech else ".ts"
        fe_ext = ".tsx" if "typescript" in frontend_tech else ".jsx"

        entities = p1_summary.get("entities", ["User", "Product", "Order"])[:6]

        structure = {"backend": {"root_files": [], "directories": {}}, "frontend": {"root_files": [], "directories": {}}}

        if "fastapi" in backend_tech or "python" in backend_tech:
            structure["backend"]["root_files"] = [
                {"path": "requirements.txt", "description": "Python dependencies"},
                {"path": "main.py", "description": "FastAPI application entry point"},
                {"path": ".env.example", "description": "Environment variables template"},
            ]
            structure["backend"]["directories"] = {
                "app/models": [{"path": f"app/models/{e.lower()}.py", "description": f"{e} SQLAlchemy model"} for e in entities],
                "app/routes": [{"path": f"app/routes/{e.lower()}.py", "description": f"{e} API endpoints"} for e in entities],
                "app/services": [{"path": f"app/services/{e.lower()}_service.py", "description": f"{e} business logic"} for e in entities],
                "app/core": [
                    {"path": "app/core/config.py", "description": "App configuration"},
                    {"path": "app/core/database.py", "description": "Database connection"},
                    {"path": "app/core/security.py", "description": "Auth and JWT utilities"},
                ],
                "app/middleware": [
                    {"path": "app/middleware/auth.py", "description": "Authentication middleware"},
                    {"path": "app/middleware/error_handler.py", "description": "Global error handler"},
                ],
            }
        else:
            structure["backend"]["root_files"] = [
                {"path": "package.json", "description": "Node.js dependencies and scripts"},
                {"path": "tsconfig.json", "description": "TypeScript configuration"},
                {"path": ".env.example", "description": "Environment variables template"},
            ]
            structure["backend"]["directories"] = {
                "src/models": [{"path": f"src/models/{e.lower()}.model{be_ext}", "description": f"{e} database model"} for e in entities],
                "src/routes": [{"path": f"src/routes/{e.lower()}.routes{be_ext}", "description": f"{e} API routes"} for e in entities],
                "src/controllers": [{"path": f"src/controllers/{e.lower()}.controller{be_ext}", "description": f"{e} request handlers"} for e in entities],
                "src/services": [{"path": f"src/services/{e.lower()}.service{be_ext}", "description": f"{e} business logic"} for e in entities],
                "src/config": [
                    {"path": f"src/config/database{be_ext}", "description": "Database connection config"},
                    {"path": f"src/config/env{be_ext}", "description": "Environment variable loader"},
                ],
                "src/middleware": [
                    {"path": f"src/middleware/auth{be_ext}", "description": "JWT authentication middleware"},
                    {"path": f"src/middleware/errorHandler{be_ext}", "description": "Global error handler"},
                ],
                "src": [{"path": f"src/app{be_ext}", "description": "Express app setup with middleware"}],
            }
            if "prisma" in db_tech or "prisma" in backend_tech:
                structure["backend"]["directories"]["prisma"] = [
                    {"path": "prisma/schema.prisma", "description": "Prisma database schema"},
                ]

        # Frontend
        structure["frontend"]["root_files"] = [
            {"path": "package.json", "description": "Frontend dependencies and scripts"},
            {"path": "vite.config.ts" if "typescript" in frontend_tech else "vite.config.js", "description": "Vite build config"},
            {"path": "tailwind.config.js", "description": "Tailwind CSS configuration"},
            {"path": "index.html", "description": "HTML entry point"},
        ]
        structure["frontend"]["directories"] = {
            "src/pages": [
                {"path": f"src/pages/Home{fe_ext}", "description": "Home/landing page"},
                {"path": f"src/pages/Login{fe_ext}", "description": "Login page"},
                {"path": f"src/pages/Register{fe_ext}", "description": "Registration page"},
                {"path": f"src/pages/Dashboard{fe_ext}", "description": "User dashboard"},
            ],
            "src/components": [
                {"path": f"src/components/Navbar{fe_ext}", "description": "Navigation bar component"},
                {"path": f"src/components/Footer{fe_ext}", "description": "Footer component"},
                {"path": f"src/components/ProtectedRoute{fe_ext}", "description": "Auth route guard"},
            ],
            "src/services": [
                {"path": f"src/services/api{fe_ext.replace('x','')}", "description": "Axios API client"},
                {"path": f"src/services/auth.service{fe_ext.replace('x','')}", "description": "Auth API calls"},
            ],
            "src/context": [
                {"path": f"src/context/AuthContext{fe_ext}", "description": "Authentication context provider"},
            ],
            "src": [
                {"path": f"src/App{fe_ext}", "description": "Main app with routing"},
                {"path": "src/index.css", "description": "Global styles with Tailwind"},
                {"path": f"src/main{fe_ext}", "description": "React entry point"},
            ],
        }

        return structure
