"""
Badge processor module for generating Open Badges 3.0 BadgeClass definitions.
"""
import json
import os

from openedx_ai_extensions.processors import LLMProcessor  # pylint: disable=import-error


class BadgeProcessor(LLMProcessor):
    """
    Processor for generating BadgeClass definitions using LLM.

    This processor generates Open Badges 3.0 compliant BadgeClass definitions
    based on course context information.
    """

    def __init__(self, config=None, user_session=None):
        super().__init__(config, user_session)
        
        # Load response schema
        schema_path = os.path.join(
            os.path.dirname(__file__),
            '../response_schemas/openbadge30achievement.json'
        )
        with open(schema_path, 'r', encoding='utf-8') as f:
            self.extra_params['response_format'] = json.load(f)

    def generate_badgeclass(self):
        """
        Generate a BadgeClass definition based on course context.

        Returns:
            dict: LLM response containing the generated BadgeClass JSON
        """
        system_role = """
            Generate an Open Badges 3.0 Achievement definition based on the course context provided.

            Content Guidelines:

            - name: Create a concise, professional badge title (e.g., "Python Programming Fundamentals")
            - description: Write a clear 2-3 sentence description of what this achievement represents
            - criteria.narrative: Describe objectively what learners must complete to earn this badge (focus on requirements, not personal accomplishments)
            - id: Use a placeholder URL in the format "https://example.org/achievements/{course-identifier}"
            - image.id: Use a placeholder URL in the format "https://example.org/images/{course-identifier}.png"
            - issuer: Extract or infer the institution information from the course context

            Important:
            - This badge represents the achievement itself, NOT an individual learner
            - Must be reusable for multiple recipients
            - Use professional, verifiable language
            - Avoid any personal data or learner-specific information
            - Similar courses should produce similar badge definitions
        """
        result = self._call_completion_wrapper(system_role=system_role)
        return result
