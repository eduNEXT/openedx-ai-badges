"""
Badge processor module for generating Open Badges 3.0 BadgeClass definitions.
"""
import json
import logging
from pathlib import Path

from openedx_ai_extensions.processors import LLMProcessor  # pylint: disable=import-error

logger = logging.getLogger(__name__)


class BadgeProcessor(LLMProcessor):
    """
    Processor for generating BadgeClass definitions using LLM.

    This processor generates Open Badges 3.0 compliant BadgeClass definitions
    based on course context information.
    """

    def __init__(self, config=None, user_session=None):
        super().__init__(config, user_session)

        # Load response schema
        schema_path = (
            Path(__file__).resolve().parent
            / "response_schemas"
            / "openbadge-3.0-achievement.json"
        )
        with open(schema_path, 'r', encoding='utf-8') as f:
            self.extra_params['response_format'] = json.load(f)

    def generate_badgeclass(self):
        """
        Generate a BadgeClass definition based on course context.

        Returns:
            dict: LLM response containing the generated BadgeClass JSON
        """
        prompt_file_path = (
            Path(__file__).resolve().parent.parent
            / "prompts"
            / "generate_openbadge_30.txt"
        )
        try:
            with open(prompt_file_path, "r", encoding='utf-8') as f:
                prompt = f.read()
        except Exception as e:  # pylint: disable=broad-exception-caught
            logger.exception(f"Error loading prompt template: {e}")
            return {"error": "Failed to load prompt template."}

        result = self._call_completion_wrapper(system_role=prompt)
        return result
