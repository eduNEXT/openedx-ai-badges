"""
Simple Custom Orchestrator - Demonstrates orchestrator pattern
"""
import json
import logging

# pylint: disable=import-error
from openedx_ai_extensions.processors import OpenEdXProcessor
from openedx_ai_extensions.workflows.orchestrators.session_based_orchestrator import SessionBasedOrchestrator

from openedx_ai_badges.processors.badge_processor import BadgeProcessor, SkillsProcessor

logger = logging.getLogger(__name__)


class BadgeOrchestrator(SessionBasedOrchestrator):
    """
    Orchestrator to generate Open Badges 3.0 BadgeClass
    based on course context and optional skills.
    """

    def save(self, input_data):
        """
        Save the updated value to session metadata.
        Args:
            input_data: dict with keys 'key' and 'value'
        Returns:
            dict: Response containing the updated metadata and status
        """
        key = input_data.get('key')
        value = input_data.get('value')
        if not key:
            return {'error': 'Missing key', 'status': 'error'}
        if 'complete_info' not in self.session.metadata:
            self.session.metadata['complete_info'] = {}
        # Verify that the value is JSON serializable
        try:
            if isinstance(value, str):
                value = json.loads(value)
            json.dumps(value)
        except Exception as e:      # pylint: disable=broad-exception-caught
            return {'error': f'Value must be valid JSON: {str(e)}', 'status': 'error'}
        self.session.metadata['complete_info'][key] = value
        self.session.save(update_fields=['metadata'])
        return {
            "response": self.session.metadata['complete_info'],
            "status": "saved",
        }

    def run(self, input_data):
        """
        Execute the badge generation workflow.
        Args:
            input_data: dict containing any necessary input for the workflow
        Returns:
            dict: Final response containing the generated badge and status
        """
        if self.session.metadata.get('complete_info'):
            complete_info = self.session.metadata['complete_info']
            return {
                "response": complete_info,
                "status": "completed",
            }

        course_context = self._get_course_context()
        if isinstance(course_context, dict) and 'error' in course_context:
            return course_context

        complete_info = {}
        complete_info['course_context'] = course_context
        if input_data.get('skills_enabled', False) or input_data.get('skillsEnabled', False):
            skills = self._get_skills(course_context, input_data)
            if isinstance(skills, dict) and 'error' in skills:
                return skills
            complete_info['skills'] = skills

        badge = self._get_badge(complete_info, input_data)
        if isinstance(badge, dict) and 'error' in badge:
            return badge
        complete_info['badge'] = badge

        self.session.metadata['complete_info'] = complete_info
        self.session.save(update_fields=['metadata'])

        return {
            "response": complete_info,
            "status": "completed",
        }

    def _get_course_context(self):
        """Run OpenEdXProcessor and return course context or error dict."""
        openedx_processor = OpenEdXProcessor(
            processor_config=self.profile.processor_config,
            location_id=self.location_id,
            course_id=self.course_id,
            user=self.user,
        )
        course_context = openedx_processor.process()
        if 'error' in course_context:
            return {'error': course_context['error'], 'status': 'error'}
        return course_context

    def _get_skills(self, course_context, input_data):
        """Run SkillsProcessor and return skills or error dict."""
        skill_processor = SkillsProcessor(self.profile.processor_config)
        llm_result = skill_processor.process(
            context=json.dumps(course_context),
            input_data=json.dumps(input_data)
        )
        if 'error' in llm_result:
            return {
                'error': f"Skills generation failed: {llm_result.get('error', 'Unknown error')}",
                'status': 'error'
            }
        try:
            skills = json.loads(llm_result.get("response", "{}"))
            return skills
        except json.JSONDecodeError as e:
            return {
                'error': f"Failed to parse skills response: {str(e)}",
                'status': 'error'
            }

    def _get_badge(self, complete_info, input_data):
        """Run BadgeProcessor and return badge dict."""
        badge_processor = BadgeProcessor(self.profile.processor_config)
        llm_result = badge_processor.process(
            context=json.dumps(complete_info),
            input_data=json.dumps(input_data)
        )

        if 'error' in llm_result:
            return {
                'error': f"Badge generation failed: {llm_result.get('error', 'Unknown error')}",
                'status': 'error'
            }
        try:
            badge = json.loads(llm_result.get("response", "{}"))
            if complete_info.get('skills'):
                badge = {**badge, **complete_info['skills']}
            return badge
        except json.JSONDecodeError as e:
            return {
                'error': f"Failed to parse badge response: {str(e)}",
                'status': 'error'
            }
