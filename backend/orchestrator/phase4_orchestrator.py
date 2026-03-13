"""
Phase 4 Orchestrator — Testing
Generates test files for both backend and frontend using LLM.

LLM Calls:
  1. Backend pytest test files (based on Phase 3 generated code)
  2. Frontend vitest test files (based on Phase 3 generated components)
  3. (Conditional) Additional test files if many modules
"""

import os
import json
from datetime import datetime
from typing import Dict, Any

from services.llm_service import LLMService
from utils.file_writer import write_text_file, write_json_file


SYSTEM_PROMPT = """You are an expert software test engineer.
You write thorough, well-structured tests covering happy paths, edge cases, and error scenarios.
Write production-quality test code. Return ONLY the code content, no markdown fences."""


class Phase4Orchestrator:

    def __init__(self, llm: LLMService, project_dir: str):
        self.llm = llm
        self.project_dir = project_dir
        self.output_dir = os.path.join(project_dir, "testing")
        os.makedirs(self.output_dir, exist_ok=True)
        self.llm_calls = 0

    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Run the Testing phase."""
        print("[Phase 4] Testing — Starting...")

        p1_summary = context.get("phase1_summary", {})
        p3_summary = context.get("phase3_summary", {})
        file_manifest = p3_summary.get("file_manifest", {})

        generated_tests = []

        # ── LLM Call 1: Backend tests ──
        backend_files = file_manifest.get("backend", [])
        if backend_files:
            test_content = self._generate_backend_tests(p1_summary, backend_files)
            write_text_file(self.output_dir, "test_backend.py", test_content)
            generated_tests.append("test_backend.py")

        # ── LLM Call 2: Frontend tests ──
        frontend_files = file_manifest.get("frontend", [])
        if frontend_files:
            test_content = self._generate_frontend_tests(p1_summary, frontend_files)
            write_text_file(self.output_dir, "test_frontend.jsx", test_content)
            generated_tests.append("test_frontend.jsx")

        # ── LLM Call 3 (conditional): API integration tests if 5+ endpoints ──
        backend_route_files = [f for f in backend_files if "route" in f.get("path", "").lower()]
        if len(p1_summary.get("functional_requirements", [])) >= 5:
            test_content = self._generate_api_integration_tests(p1_summary, backend_files)
            write_text_file(self.output_dir, "test_api_integration.py", test_content)
            generated_tests.append("test_api_integration.py")

        # Generate test config files
        pytest_ini = self._generate_pytest_config()
        write_text_file(self.output_dir, "pytest.ini", pytest_ini)
        generated_tests.append("pytest.ini")

        result = {
            "status": "completed",
            "phase": "testing",
            "output_dir": self.output_dir,
            "artifacts": generated_tests,
            "summary": {
                "total_test_files": len(generated_tests),
                "backend_tests": "test_backend.py" in generated_tests,
                "frontend_tests": "test_frontend.jsx" in generated_tests,
                "integration_tests": "test_api_integration.py" in generated_tests,
            },
            "llm_calls": self.llm_calls,
            "completed_at": datetime.now().isoformat(),
        }

        print("[Phase 4] Testing — Complete")
        return result

    def _generate_backend_tests(self, p1_summary: Dict, backend_files: list) -> str:
        """LLM Call 1: Generate backend pytest tests."""
        self.llm_calls += 1

        files_desc = "\n".join(f"- {f['path']}: {f['description']}" for f in backend_files)

        prompt = f"""Generate comprehensive pytest test files for this FastAPI backend.

Project: {p1_summary.get('project_name', 'Unknown')}
Entities: {', '.join(p1_summary.get('entities', []))}

Backend files to test:
{files_desc}

Key Requirements:
{chr(10).join(f'- {r}' for r in p1_summary.get('functional_requirements', [])[:8])}

Generate a test file with:
1. Fixtures for test client (using FastAPI TestClient) and sample data
2. Test classes organized by feature/endpoint
3. Tests for CRUD operations (create, read, update, delete)
4. Tests for validation and error cases
5. Tests for authentication if applicable

Use pytest with httpx/TestClient. Include proper imports and assertions.
Return ONLY the Python code.
"""

        return self._clean_code(self.llm.generate(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=6000, model="devstral-2:123b-cloud"))

    def _generate_frontend_tests(self, p1_summary: Dict, frontend_files: list) -> str:
        """LLM Call 2: Generate frontend vitest tests."""
        self.llm_calls += 1

        files_desc = "\n".join(f"- {f['path']}: {f['description']}" for f in frontend_files)

        prompt = f"""Generate vitest + React Testing Library test files for this React frontend.

Project: {p1_summary.get('project_name', 'Unknown')}

Frontend files to test:
{files_desc}

Generate a test file with:
1. Import statements for vitest and @testing-library/react
2. Tests for component rendering
3. Tests for user interactions (clicks, form inputs)
4. Tests for routing/navigation
5. Mock API calls using vi.mock()

Use vitest with @testing-library/react. Include proper imports.
Return ONLY the JSX code.
"""

        return self._clean_code(self.llm.generate(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=5000, model="devstral-2:123b-cloud"))

    def _generate_api_integration_tests(self, p1_summary: Dict, backend_files: list) -> str:
        """LLM Call 3: Generate API integration tests."""
        self.llm_calls += 1

        prompt = f"""Generate API integration tests for this project using pytest + httpx.

Project: {p1_summary.get('project_name', 'Unknown')}
Entities: {', '.join(p1_summary.get('entities', []))}
Requirements:
{chr(10).join(f'- {r}' for r in p1_summary.get('functional_requirements', [])[:8])}

Generate integration tests that:
1. Test the complete API flow (create → read → update → delete)
2. Test relationships between entities
3. Test authentication flow if applicable
4. Use async httpx client
5. Include setup and teardown

Return ONLY the Python code.
"""

        return self._clean_code(self.llm.generate(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=4000, model="devstral-2:123b-cloud"))

    def _generate_pytest_config(self) -> str:
        """Generate pytest configuration."""
        return """[pytest]
testpaths = .
python_files = test_*.py
python_classes = Test*
python_functions = test_*
asyncio_mode = auto
addopts = -v --tb=short
"""

    def _clean_code(self, code: str) -> str:
        """Strip markdown code fences if present."""
        import re
        code = code.strip()
        match = re.match(r"^```\w*\n(.*?)```$", code, re.DOTALL)
        if match:
            return match.group(1).strip()
        if code.startswith("```"):
            code = code.split("\n", 1)[1] if "\n" in code else code[3:]
        if code.endswith("```"):
            code = code[:-3]
        return code.strip()
