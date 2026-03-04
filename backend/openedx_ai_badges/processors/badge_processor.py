"""
Badge processor module for generating Open Badges 3.0 BadgeClass definitions.
"""
import json
import logging
from pathlib import Path

from openedx_ai_extensions.processors import LLMProcessor  # pylint: disable=import-error

logger = logging.getLogger(__name__)


class BaseBadgeLLMProcessor(LLMProcessor):
    """Base processor for badge-related LLM tasks."""
    schema_filename = None
    prompt_filename = None

    def __init__(self, config=None, user_session=None):
        """Initialize with schema and prompt files."""
        if not self.schema_filename:
            raise ValueError("schema_filename must be set in subclass")
        schema_path = Path(__file__).resolve().parent / "response_schemas" / self.schema_filename
        with open(schema_path, 'r', encoding='utf-8') as f:
            extra_params = {'response_format': json.load(f)}
        super().__init__(config=config, user_session=user_session, extra_params=extra_params)

    def load_prompt(self):
        """Load the prompt template from file."""
        if not self.prompt_filename:
            raise ValueError("prompt_filename must be set in subclass")
        prompt_path = Path(__file__).resolve().parent.parent / "prompts" / self.prompt_filename
        with open(prompt_path, "r", encoding='utf-8') as f:
            return f.read()

    def fill_prompt(self, prompt: str) -> str:
        """Fill prompt placeholders with input data."""
        if self.input_data:
            try:
                input_data = json.loads(self.input_data)
            except json.JSONDecodeError as e:
                logger.exception(f"Input data is not valid JSON: {e}")
                raise ValueError(f"Input data must be a valid JSON string: {e}") from e
            # Replace all placeholders in the prompt with input_data values (case-insensitive)
            for key, value in input_data.items():
                placeholder = f"{{{{{key.upper()}}}}}"
                prompt = prompt.replace(placeholder, str(value))
        return prompt


class BadgeProcessor(BaseBadgeLLMProcessor):
    """Processor for generating Open Badges 3.0 BadgeClass."""
    schema_filename = "openbadge-3.0-achievement.json"
    prompt_filename = "generate_openbadge_30.txt"

    def generate_badgeclass(self):
        """
        Generate a BadgeClass definition based on course context.

        Returns:
            dict: LLM response containing the generated BadgeClass JSON
        """
        try:
            prompt = self.load_prompt()
        except (FileNotFoundError, ValueError) as e:
            logger.exception(f"Error loading prompt template: {e}")
            return {"error": f"Failed to load prompt template: {e}"}

        prompt = self.fill_prompt(prompt)
        result = self._call_completion_wrapper(system_role=prompt)
        return result


class SkillsProcessor(BaseBadgeLLMProcessor):
    """Processor for generating skills alignment data."""
    schema_filename = "openbadge-skills-alignment.json"
    prompt_filename = "generate_skills_alignment.txt"

    def generate_skills(self):
        """
        Generate a skills definition based on course context.

        Returns:
            dict: LLM response containing the generated skills JSON
        """
        try:
            prompt = self.load_prompt()
        except (FileNotFoundError, ValueError) as e:
            logger.exception(f"Error loading prompt template: {e}")
            return {"error": f"Failed to load prompt template: {e}"}

        prompt = self.fill_prompt(prompt)
        result = self._call_completion_wrapper(system_role=prompt)
        return result
