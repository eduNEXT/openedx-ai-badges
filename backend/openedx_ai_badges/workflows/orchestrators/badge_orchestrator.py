"""
Simple Custom Orchestrator - Demonstrates orchestrator pattern
"""
import json
import logging

# pylint: disable=import-error
from openedx_ai_extensions.processors import OpenEdXProcessor
from openedx_ai_extensions.workflows.orchestrators.session_based_orchestrator import SessionBasedOrchestrator

from ..processors.badge_processor import BadgeProcessor

logger = logging.getLogger(__name__)


MOCKED_BADGE_STRUCTURE = {
  "@context": "https://w3id.org/openbadges/v2",
  "id": "https://tu-dominio.com/badges/backend-master.json",
  "type": "BadgeClass",
  "image": "https://your-domain/static/badges/backend-master.png",
  "issuer": "https://your-domain/issuer.json",
}


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
        response = json.loads(llm_result.get("response", "{}"))

        badge = {
            "type": "BadgeClass",
            "id": "https://yourplatform.com/badges/ai-generated-id-123",
            "name": response['name'],
            "description": response['description'],
            "image": f"https://api.dicebear.com/7.x/identicon/svg?seed={response['name']}",
            "criteria": {"narrative": response['criteria']},
            "issuer": {
                "id": "https://yourplatform.com/issuer.json",
                "type": "Issuer",
                "name": "My Extensible Platform",
                "url": "https://yourplatform.com"
            }
        }

        self.session.metadata['badge'] = badge
        self.session.save(update_fields=['metadata'])

        return {
            "response": str(badge),
            "status": "completed",
        }
