"""
Simple Custom Orchestrator - Demonstrates orchestrator pattern
"""
import logging
import time

from openedx_ai_extensions.workflows.orchestrators import BaseOrchestrator

logger = logging.getLogger(__name__)


class SimpleMockOrquestator(BaseOrchestrator):
    """
    Complete mock orchestrator.
    Responds inmediately with a mock answer. Useful for UI testing.
    """

    def run(self, input_data):
        # Emit completed event for one-shot workflow
        return {
            "response": f"Mock response for BADGES {self.workflow.action} at {time.strftime('%Y-%m-%d %H:%M:%S')}",
            "status": "completed",
        }
