"""
Phase 1 Orchestrator — Requirement Analysis
Analyzes the SRS document and generates a structured RA Document using LLM.

LLM Calls:
  1. Analyze & classify requirements → structured JSON
  2. (Conditional) Risk assessment if complexity is High
"""

import os
import json
from datetime import datetime
from typing import Dict, Any

from services.llm_service import LLMService
from utils.file_writer import write_text_file, write_json_file
from utils.pdf_generator import convert_md_to_pdf


SYSTEM_PROMPT = """You are an expert software requirements analyst.
Your job is to analyze a Software Requirements Specification (SRS) document
and produce a comprehensive, structured Requirement Analysis Document.
Be thorough, precise, and professional. Use Markdown formatting."""


class Phase1Orchestrator:

    def __init__(self, llm: LLMService, project_dir: str):
        self.llm = llm
        self.project_dir = project_dir
        self.output_dir = os.path.join(project_dir, "requirement_analysis")
        os.makedirs(self.output_dir, exist_ok=True)
        self.llm_calls = 0

    def execute(self, srs_text: str, rag_context: Dict[str, Any]) -> Dict[str, Any]:
        """Run the Requirement Analysis phase."""
        print("[Phase 1] Requirement Analysis — Starting...")

        # ── LLM Call 1: Analyze & Classify Requirements ──
        analysis = self._analyze_requirements(srs_text, rag_context)

        # ── LLM Call 2: Generate full RA Document ──
        ra_document = self._generate_ra_document(srs_text, analysis)

        # ── Conditional: Risk Assessment if High complexity ──
        risk_assessment = ""
        if analysis.get("complexity_estimate", "").lower() == "high":
            risk_assessment = self._generate_risk_assessment(srs_text, analysis)

        # Append risk to RA doc if generated
        if risk_assessment:
            ra_document += f"\n\n---\n\n## 8. Risk Assessment\n\n{risk_assessment}"

        # Save artifacts
        write_text_file(self.output_dir, "RA_Document.md", ra_document)
        write_json_file(self.output_dir, "analysis_metadata.json", analysis)
        
        # Also generate PDF version
        pdf_path = os.path.join(self.output_dir, "RA_Document.pdf")
        convert_md_to_pdf(ra_document, pdf_path)

        result = {
            "status": "completed",
            "phase": "requirement_analysis",
            "output_dir": self.output_dir,
            "artifacts": ["RA_Document.md", "RA_Document.pdf", "analysis_metadata.json"],
            "summary": analysis,
            "llm_calls": self.llm_calls,
            "completed_at": datetime.now().isoformat(),
        }

        print("[Phase 1] Requirement Analysis — Complete")
        return result

    def _analyze_requirements(self, srs_text: str, rag_context: Dict[str, Any]) -> Dict:
        """LLM Call 1: Analyze SRS and extract structured requirements as JSON."""
        self.llm_calls += 1

        relevant_chunks = rag_context.get("chunks", [])[:10]
        chunks_text = "\n---\n".join(relevant_chunks) if relevant_chunks else "No RAG chunks available."

        prompt = f"""Analyze the following Software Requirements Specification (SRS) document.
Extract and return a JSON object with the following structure:

{{
  "project_name": "inferred project name",
  "project_description": "brief 2-3 sentence description",
  "functional_requirements": ["FR1: description", "FR2: description", ...],
  "non_functional_requirements": ["NFR1: description", "NFR2: description", ...],
  "user_roles": ["role1", "role2", ...],
  "entities": ["entity1", "entity2", ...],
  "tech_stack_hints": {{
    "frontend": "any mentioned frontend tech",
    "backend": "any mentioned backend tech",
    "database": "any mentioned database"
  }},
  "constraints": ["constraint1", "constraint2", ...],
  "complexity_estimate": "Low|Medium|High",
  "total_functional_requirements": <number>,
  "total_non_functional_requirements": <number>
}}

IMPORTANT: Return ONLY the JSON object, no markdown fences, no explanation.

=== SRS Document ===
{srs_text}

=== Relevant Context Chunks (from RAG) ===
{chunks_text}
"""

        response = self.llm.generate(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=4000, model="kimi-k2-thinking:cloud")

        print("""
        =========================================
        =========================================
        RESPONSE FROM PHASE 1
        =========================================
        =========================================
        """)
        print(response)

        
        # Parse JSON from LLM response
        try:
            import re
            # Aggressively remove reasoning model 'think' blocks to prevent curly brace interference
            clean_text = re.sub(r'<think>.*?</think>', '', response, flags=re.DOTALL)

            # Clean up response (extract only the JSON object between {} avoiding <think> tags)
            start_idx = clean_text.find('{')
            end_idx = clean_text.rfind('}')
            if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                cleaned = clean_text[start_idx:end_idx+1]
            else:
                cleaned = clean_text.strip()

            analysis = json.loads(cleaned)
        except json.JSONDecodeError:
            print(f"[Phase 1] Warning: Could not parse LLM JSON. Using fallback.")
            analysis = {
                "project_name": "Unknown",
                "project_description": "Could not parse SRS automatically.",
                "functional_requirements": [],
                "non_functional_requirements": [],
                "user_roles": [],
                "entities": [],
                "tech_stack_hints": {"frontend": "React", "backend": "FastAPI", "database": "PostgreSQL"},
                "constraints": [],
                "complexity_estimate": "Medium",
                "total_functional_requirements": 0,
                "total_non_functional_requirements": 0,
                "raw_llm_response": response[:500],
            }

        analysis["analyzed_at"] = datetime.now().isoformat()
        analysis["total_chunks"] = rag_context.get("total_chunks", 0)
        return analysis

    def _generate_ra_document(self, srs_text: str, analysis: Dict) -> str:
        """LLM Call 2: Generate the full RA Document in Markdown."""
        self.llm_calls += 1

        analysis_json = json.dumps(analysis, indent=2)

        prompt = f"""Based on the following SRS document and its structured analysis,
generate a complete, professional Requirement Analysis (RA) Document in Markdown format.

The document should include these sections:
1. Introduction (project overview, purpose, scope)
2. SRS Summary
3. Functional Requirements (numbered list with descriptions)
4. Non-Functional Requirements (numbered list with descriptions)
5. User Roles & Stakeholders
6. Data Entities & Relationships
7. Constraints & Assumptions
8. Technology Stack Recommendations

Use proper Markdown headers (##), tables where appropriate, and bullet lists.
Make it thorough and production-quality.

=== Original SRS ===
{srs_text[:3000]}

=== Structured Analysis ===
{analysis_json}
"""

        return self.llm.generate(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=6000, model="kimi-k2-thinking:cloud")

    def _generate_risk_assessment(self, srs_text: str, analysis: Dict) -> str:
        """LLM Call 3 (conditional): Generate risk assessment for high-complexity projects."""
        self.llm_calls += 1

        prompt = f"""Based on this high-complexity software project, generate a Risk Assessment section.

Project: {analysis.get('project_name', 'Unknown')}
Functional Requirements: {analysis.get('total_functional_requirements', 0)}
Non-Functional Requirements: {analysis.get('total_non_functional_requirements', 0)}
Entities: {', '.join(analysis.get('entities', []))}

Generate a Markdown table with columns: Risk ID, Risk Description, Severity (High/Medium/Low), Mitigation Strategy.
Include at least 5 risks covering technical, resource, and timeline concerns.
Return ONLY the Markdown content, no explanation.
"""

        return self.llm.generate(prompt, system_prompt=SYSTEM_PROMPT, max_tokens=2000, model="kimi-k2-thinking:cloud")
