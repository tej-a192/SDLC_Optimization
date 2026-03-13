"""
Phase 2 Orchestrator — Design
Generates architecture decisions, database schema, and Mermaid diagrams using LLM.

LLM Calls:
  1. Architecture & component design
  2. Database schema design
  3. Mermaid class diagram
  4. Mermaid sequence diagram
  5. (Conditional) Mermaid ER diagram if DB has 4+ entities
"""

import os
import json
import re
from datetime import datetime
from typing import Dict, Any

from services.llm_service import LLMService
from utils.file_writer import write_text_file, write_json_file


SYSTEM_PROMPT = """You are an expert software architect.
You design robust, scalable, and maintainable software systems.
Follow modern best practices for web application architecture."""


class Phase2Orchestrator:

    def __init__(self, llm: LLMService, project_dir: str):
        self.llm = llm
        self.project_dir = project_dir
        self.output_dir = os.path.join(project_dir, "design")
        os.makedirs(self.output_dir, exist_ok=True)
        self.llm_calls = 0

    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Run the Design phase."""
        print("[Phase 2] Design — Starting...")

        p1_summary = context.get("phase1_summary", {})
        srs_text = context.get("srs_text", "")
        rag_context = context.get("rag_context", {})

        # ── LLM Call 1: Architecture Design ──
        architecture = self._design_architecture(p1_summary, srs_text)

        # ── LLM Call 2: Database Schema ──
        db_schema = self._design_database(p1_summary)

        # ── LLM Call 3: Mermaid Class Diagram ──
        class_diagram = self._generate_mermaid_class_diagram(p1_summary, architecture)

        # ── LLM Call 4: Mermaid Sequence Diagram ──
        sequence_diagram = self._generate_mermaid_sequence_diagram(p1_summary)

        # ── LLM Call 5 (conditional): ER Diagram ──
        er_diagram = ""
        entities = p1_summary.get("entities", [])
        if len(entities) >= 4:
            er_diagram = self._generate_mermaid_er_diagram(p1_summary, db_schema)

        # Assemble Design Document
        design_doc = self._assemble_design_document(
            p1_summary, architecture, db_schema,
            class_diagram, sequence_diagram, er_diagram
        )

        # Build summary for Phase 3
        design_summary = self._extract_design_summary(architecture, db_schema, p1_summary)

        # Save artifacts
        write_text_file(self.output_dir, "Design_Document.md", design_doc)
        write_json_file(self.output_dir, "design_metadata.json", design_summary)

        result = {
            "status": "completed",
            "phase": "design",
            "output_dir": self.output_dir,
            "artifacts": ["Design_Document.md", "design_metadata.json"],
            "summary": design_summary,
            "llm_calls": self.llm_calls,
            "completed_at": datetime.now().isoformat(),
        }

        print("[Phase 2] Design — Complete")
        return result

    def _design_architecture(self, p1_summary: Dict, srs_text: str) -> str:
        """LLM Call 1: Generate architecture decisions."""
        self.llm_calls += 1

        reqs = p1_summary.get("functional_requirements", [])
        nfrs = p1_summary.get("non_functional_requirements", [])
        tech_hints = p1_summary.get("tech_stack_hints", {})

        prompt = f"""Design the software architecture for this project.

Project: {p1_summary.get('project_name', 'Unknown')}
Description: {p1_summary.get('project_description', '')}

Functional Requirements:
{chr(10).join(f'- {r}' for r in reqs[:15])}

Non-Functional Requirements:
{chr(10).join(f'- {r}' for r in nfrs[:10])}

Tech Stack Hints: {json.dumps(tech_hints)}

Generate a detailed architecture section covering:
1. System Overview (high-level architecture pattern: monolith/microservices/etc.)
2. Technology Stack (frontend, backend, database, tools)
3. Component Breakdown (list each major module/service)
4. API Design (list the main endpoints with methods and descriptions)
5. Authentication & Authorization approach
6. Data Flow (how data moves through the system)

Use Markdown formatting with headers and bullet lists.
"""

        return self.llm.generate(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=5000, model="mistral-large-3:675b-cloud")

    def _design_database(self, p1_summary: Dict) -> str:
        """LLM Call 2: Design the database schema."""
        self.llm_calls += 1

        entities = p1_summary.get("entities", [])
        reqs = p1_summary.get("functional_requirements", [])

        prompt = f"""Design a database schema for this project.

Project: {p1_summary.get('project_name', 'Unknown')}
Entities identified: {', '.join(entities)}
Key requirements:
{chr(10).join(f'- {r}' for r in reqs[:10])}

Generate the schema as Markdown with:
1. A table per entity showing: Column Name, Data Type, Constraints, Description
2. Relationships between tables
3. Indexing recommendations

Use Markdown tables for each entity.
"""

        return self.llm.generate(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=4000, model="mistral-large-3:675b-cloud")

    def _generate_mermaid_class_diagram(self, p1_summary: Dict, architecture: str) -> str:
        """LLM Call 3: Generate a Mermaid class diagram."""
        self.llm_calls += 1

        prompt = f"""Generate a Mermaid.js class diagram for this project.

Project: {p1_summary.get('project_name', 'Unknown')}
Entities: {', '.join(p1_summary.get('entities', []))}
User Roles: {', '.join(p1_summary.get('user_roles', []))}

Rules:
- Use valid Mermaid classDiagram syntax
- Include key attributes and methods for each class
- Show relationships (inheritance, composition, association)
- Return ONLY the mermaid code block starting with ```mermaid and ending with ```
- Do NOT include any explanation outside the code block
"""

        raw = self.llm.generate(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=2000, model="mistral-large-3:675b-cloud")
        return self._extract_mermaid(raw)

    def _generate_mermaid_sequence_diagram(self, p1_summary: Dict) -> str:
        """LLM Call 4: Generate a Mermaid sequence diagram."""
        self.llm_calls += 1

        reqs = p1_summary.get("functional_requirements", [])

        prompt = f"""Generate a Mermaid.js sequence diagram showing the main user flow.

Project: {p1_summary.get('project_name', 'Unknown')}
User Roles: {', '.join(p1_summary.get('user_roles', []))}
Key Features:
{chr(10).join(f'- {r}' for r in reqs[:8])}

Rules:
- Use valid Mermaid sequenceDiagram syntax
- Show interaction between User, Frontend, Backend API, and Database
- Cover the primary happy-path user flow
- Return ONLY the mermaid code block starting with ```mermaid and ending with ```
"""

        raw = self.llm.generate(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=2000, model="mistral-large-3:675b-cloud")
        return self._extract_mermaid(raw)

    def _generate_mermaid_er_diagram(self, p1_summary: Dict, db_schema: str) -> str:
        """LLM Call 5 (conditional): Generate a Mermaid ER diagram."""
        self.llm_calls += 1

        prompt = f"""Generate a Mermaid.js Entity-Relationship diagram.

Project: {p1_summary.get('project_name', 'Unknown')}
Entities: {', '.join(p1_summary.get('entities', []))}

Database schema context:
{db_schema[:2000]}

Rules:
- Use valid Mermaid erDiagram syntax
- Show all entities with key attributes
- Show relationships with cardinality
- Return ONLY the mermaid code block starting with ```mermaid and ending with ```
"""

        raw = self.llm.generate(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=2000, model="mistral-large-3:675b-cloud")
        return self._extract_mermaid(raw)

    def _extract_mermaid(self, raw: str) -> str:
        """Extract mermaid code from LLM response (strip markdown fences)."""
        match = re.search(r"```mermaid\s*(.*?)```", raw, re.DOTALL)
        if match:
            return match.group(1).strip()
        # If no fences, try to return raw content after basic cleanup
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        return cleaned.strip()

    def _assemble_design_document(self, p1_summary, architecture, db_schema,
                                   class_diagram, sequence_diagram, er_diagram) -> str:
        """Assemble all design artifacts into one Markdown document."""
        doc = f"""# Design Document

**Project:** {p1_summary.get('project_name', 'Unknown')}
**Generated At:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

## 1. Architecture Design

{architecture}

---

## 2. Database Schema

{db_schema}

---

## 3. Class Diagram

```mermaid
{class_diagram}
```

---

## 4. Sequence Diagram

```mermaid
{sequence_diagram}
```
"""

        if er_diagram:
            doc += f"""
---

## 5. Entity-Relationship Diagram

```mermaid
{er_diagram}
```
"""

        doc += "\n---\n\n_This document was auto-generated by the SDLC Optimization Framework._\n"
        return doc

    def _extract_design_summary(self, architecture: str, db_schema: str, p1_summary: Dict) -> Dict:
        """Extract a structured summary for Phase 3 to consume."""
        return {
            "project_name": p1_summary.get("project_name", "Unknown"),
            "entities": p1_summary.get("entities", []),
            "user_roles": p1_summary.get("user_roles", []),
            "tech_stack": p1_summary.get("tech_stack_hints", {}),
            "functional_requirements": p1_summary.get("functional_requirements", []),
            "non_functional_requirements": p1_summary.get("non_functional_requirements", []),
            "architecture_snippet": architecture[:1000],
            "db_schema_snippet": db_schema[:1000],
            "designed_at": datetime.now().isoformat(),
        }
