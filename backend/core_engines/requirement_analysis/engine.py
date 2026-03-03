"""
SDLC Optimization - Requirement Analysis Engine
Phase 1: Generates a formal Requirement Analysis (RA) Document.

Input:  Raw SRS text + RAG context (chunks, embeddings, vector store)
Output: RA Document (PDF & text) saved to project_dir/requirement_analysis/
"""

import os
import json
from datetime import datetime
from typing import Dict, Any

from utils.file_writer import write_text_file, write_json_file


class RequirementAnalysisEngine:
    """
    Processes SRS input and generates a structured RA Document
    covering functional requirements, non-functional requirements,
    stakeholders, constraints, and risk analysis.
    """

    def __init__(self, project_dir: str):
        self.project_dir = project_dir
        self.output_dir = os.path.join(project_dir, "requirement_analysis")
        os.makedirs(self.output_dir, exist_ok=True)

    def execute(self, srs_text: str, rag_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the Requirement Analysis phase.

        Args:
            srs_text: The raw SRS document text.
            rag_context: Context from the RAG pipeline (chunks, vector store, etc.)

        Returns:
            Phase result metadata.
        """
        print("[Phase 1] Requirement Analysis - Starting...")

        # Extract key information from SRS
        analysis = self._analyze_requirements(srs_text, rag_context)

        # Generate the RA Document content
        ra_document = self._generate_ra_document(srs_text, analysis)

        # Save the RA document as text
        write_text_file(self.output_dir, "RA_Document.md", ra_document)

        # Save analysis metadata as JSON
        write_json_file(self.output_dir, "analysis_metadata.json", analysis)

        result = {
            "status": "completed",
            "phase": "requirement_analysis",
            "output_dir": self.output_dir,
            "artifacts": ["RA_Document.md", "analysis_metadata.json"],
            "summary": analysis,
            "completed_at": datetime.now().isoformat(),
        }

        print("[Phase 1] Requirement Analysis - Complete")
        return result

    def _analyze_requirements(self, srs_text: str, rag_context: Dict[str, Any]) -> Dict:
        """Analyze srs text and extract structured requirement categories."""
        words = srs_text.lower().split()
        sentences = [s.strip() for s in srs_text.split(".") if s.strip()]

        # Keyword-based classification (to be enhanced with LLM)
        functional_keywords = ["shall", "must", "should", "will", "feature", "function", "user"]
        nonfunctional_keywords = ["performance", "security", "scalability", "reliability", "availability"]

        functional_count = sum(1 for w in words if w in functional_keywords)
        nonfunctional_count = sum(1 for w in words if w in nonfunctional_keywords)

        return {
            "total_words": len(words),
            "total_sentences": len(sentences),
            "total_chunks": rag_context.get("total_chunks", 0),
            "functional_requirements_indicators": functional_count,
            "nonfunctional_requirements_indicators": nonfunctional_count,
            "complexity_estimate": "High" if len(words) > 1000 else "Medium" if len(words) > 300 else "Low",
            "analyzed_at": datetime.now().isoformat(),
        }

    def _generate_ra_document(self, srs_text: str, analysis: Dict) -> str:
        """
        Generate the formal RA Document in Markdown format.
        This will be enhanced with LLM-powered generation.
        """
        doc = f"""# Requirement Analysis Document

## 1. Introduction

This document provides a structured analysis of the Software Requirements Specification (SRS)
provided for this project. It captures the functional and non-functional requirements,
identifies stakeholders, and assesses the project complexity.

**Generated At:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

---

## 2. SRS Summary

{srs_text[:2000]}{"..." if len(srs_text) > 2000 else ""}

---

## 3. Requirement Classification

| Category                        | Count / Value                              |
|---------------------------------|--------------------------------------------|
| Total Words                     | {analysis["total_words"]}                  |
| Total Sentences                 | {analysis["total_sentences"]}              |
| Functional Req. Indicators      | {analysis["functional_requirements_indicators"]}  |
| Non-Functional Req. Indicators  | {analysis["nonfunctional_requirements_indicators"]}|
| Document Chunks (RAG)           | {analysis["total_chunks"]}                 |
| Complexity Estimate             | {analysis["complexity_estimate"]}          |

---

## 4. Functional Requirements

> _To be populated by LLM analysis of the SRS text._

---

## 5. Non-Functional Requirements

> _To be populated by LLM analysis of the SRS text._

---

## 6. Stakeholders

> _To be identified from SRS context._

---

## 7. Constraints & Assumptions

> _To be extracted from SRS context._

---

## 8. Risk Assessment

> _To be generated based on complexity and requirement gaps._

---

_This document was auto-generated by the SDLC Optimization Framework._
"""
        return doc
