"""
Simple Custom Orchestrator - Demonstrates orchestrator pattern
"""
import json
import logging

# pylint: disable=import-error
from openedx_ai_extensions.processors import OpenEdXProcessor
from openedx_ai_extensions.workflows.orchestrators.session_based_orchestrator import SessionBasedOrchestrator

from openedx_ai_badges.processors.badge_processor import BadgeProcessor

logger = logging.getLogger(__name__)


class BadgeOrchestrator(SessionBasedOrchestrator):
    """
    Complete mock orchestrator.
    Responds inmediately with a mock answer. Useful for UI testing.
    """

    def run(self, input_data):  # pylint: disable=unused-argument
        """
        Execute the badge generation workflow.

        Args:
            input_data: Input data for the orchestrator (currently unused as we use course context)

        Returns:
            dict: Response containing the generated badge and status
        """
        if self.session.metadata.get('badge'):
            badge = self.session.metadata['badge']
            return {
                "response": str(badge),
                "status": "completed",
            }

        openedx_processor = OpenEdXProcessor(
            processor_config=self.profile.processor_config,
            location_id=self.location_id,
            course_id=self.course_id,
            user=self.user,
        )
        course_context = openedx_processor.process()

        if 'error' in course_context:
            return {'error': course_context['error'], 'status': 'error'}

        badge_processor = BadgeProcessor(self.profile.processor_config)
        llm_result = badge_processor.process(context=str(course_context))
        badge = json.loads(llm_result.get("response", "{}"))

        self.session.metadata['badge'] = badge
        self.session.save(update_fields=['metadata'])

        return {
            "response": badge,
            "status": "completed",
        }
