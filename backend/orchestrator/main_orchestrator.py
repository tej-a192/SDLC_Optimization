"""
SDLC Optimization — Main Orchestrator
Coordinates all 5 SDLC phases in sequence, passing accumulated context between them.
"""

import time
import os
import shutil
from typing import Dict, Any
from datetime import datetime

from services.llm_service import LLMService


class MainOrchestrator:
    """
    Top-level orchestrator that runs the full SDLC pipeline.
    Each phase receives the accumulated context from all previous phases.
    """

    def __init__(self, llm_service: LLMService, project_dir: str):
        self.llm = llm_service
        self.project_dir = project_dir
        self.context = {}  # Accumulated context passed between phases

    def run(self, srs_text: str, rag_context: Dict[str, Any],
            project_name: str = "", project_created_at: str = "") -> Dict[str, Any]:
        """
        Execute the full 5-phase SDLC pipeline.

        Returns:
            Dictionary with keys:
              - "phases"             → phase results keyed by phase name
              - "evaluation_metrics" → computed quality metrics dict
        """
        phases_result = {}
        start_time = time.time()
        pipeline_start = project_created_at or datetime.now().isoformat()

        print("=" * 60)
        print("[Main Orchestrator] Starting SDLC Pipeline")
        print("=" * 60)

        # Store base context
        self.context["srs_text"]    = srs_text
        self.context["rag_context"] = rag_context

        # ── Phase 1: Requirement Analysis ──
        print("\n[Phase 1/5] Requirement Analysis...")
        from orchestrator.phase1_orchestrator import Phase1Orchestrator
        p1 = Phase1Orchestrator(self.llm, self.project_dir)
        p1_result = p1.execute(srs_text, rag_context)
        phases_result["requirement_analysis"] = p1_result
        self.context["phase1_summary"] = p1_result.get("summary", {})
        print(f"  ✓ Phase 1 complete ({p1_result.get('llm_calls', 0)} LLM calls)")

        # ── Phase 2: Design ──
        print("\n[Phase 2/5] Design...")
        from orchestrator.phase2_orchestrator import Phase2Orchestrator
        p2 = Phase2Orchestrator(self.llm, self.project_dir)
        p2_result = p2.execute(self.context)
        phases_result["design"] = p2_result
        self.context["phase2_summary"] = p2_result.get("summary", {})
        print(f"  ✓ Phase 2 complete ({p2_result.get('llm_calls', 0)} LLM calls)")

        # ── Phase 3: Implementation ──
        print("\n[Phase 3/5] Implementation...")
        from orchestrator.phase3_orchestrator import Phase3Orchestrator
        p3 = Phase3Orchestrator(self.llm, self.project_dir)
        p3_result = p3.execute(self.context)
        phases_result["implementation"] = p3_result
        self.context["phase3_summary"] = p3_result.get("summary", {})
        print(f"  ✓ Phase 3 complete ({p3_result.get('llm_calls', 0)} LLM calls)")

        # ── Phase 4: Testing ──
        print("\n[Phase 4/5] Testing...")
        from orchestrator.phase4_orchestrator import Phase4Orchestrator
        p4 = Phase4Orchestrator(self.llm, self.project_dir)
        p4_result = p4.execute(self.context)
        phases_result["testing"] = p4_result
        self.context["phase4_summary"] = p4_result.get("summary", {})
        print(f"  ✓ Phase 4 complete ({p4_result.get('llm_calls', 0)} LLM calls)")

        # ── Phase 5: Deployment ──
        print("\n[Phase 5/5] Deployment...")
        from orchestrator.phase5_orchestrator import Phase5Orchestrator
        p5 = Phase5Orchestrator(self.llm, self.project_dir)
        p5_result = p5.execute(self.context)
        phases_result["deployment"] = p5_result
        self.context["phase5_summary"] = p5_result.get("summary", {})
        print(f"  ✓ Phase 5 complete ({p5_result.get('llm_calls', 0)} LLM calls)")

        elapsed = round(time.time() - start_time, 1)
        total_llm_calls = sum(r.get("llm_calls", 0) for r in phases_result.values())

        # ── Evaluation Metrics ──
        print("\n[Metrics] Computing evaluation metrics...")
        try:
            from services.metrics_calculator import MetricsCalculator
            calculator = MetricsCalculator()
            evaluation_metrics = calculator.compute(
                phases=phases_result,
                project_name=project_name,
                project_created_at=pipeline_start,
            )
            print(f"  ✓ Accuracy: {evaluation_metrics['accuracy']}%")
            print(f"  ✓ Context Relevance: {evaluation_metrics['context_relevance']}%")
            print(f"  ✓ Consistency: {evaluation_metrics['consistency']}%")
            print(f"  ✓ Response Time Score: {evaluation_metrics['response_time_score']}%")
        except Exception as e:
            print(f"  ⚠ Metrics computation failed (non-fatal): {e}")
            evaluation_metrics = {}

        print("\n" + "=" * 60)
        print(f"[Main Orchestrator] Pipeline Complete!")
        print(f"  Total LLM calls: {total_llm_calls}")
        print(f"  Total time: {elapsed}s")
        print("=" * 60)

        return {
            "phases":             phases_result,
            "evaluation_metrics": evaluation_metrics,
        }
