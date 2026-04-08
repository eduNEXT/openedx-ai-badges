"""
Badge processor module for generating Open Badges 3.0 BadgeClass definitions.
"""
import json
import logging
import time
from pathlib import Path

import requests
from django.conf import settings
from openedx_ai_extensions.processors import LLMProcessor

logger = logging.getLogger(__name__)


class BaseBadgeLLMProcessor(LLMProcessor):
    """Base processor for badge-related LLM tasks."""
    schema_filename = None
    prompt_filename = None
    regenerate_prompt_filename = None
    regenerate = False

    def __init__(self, config=None, user_session=None, regenerate=False):
        """Initialize with schema and prompt files."""
        if not self.schema_filename:
            raise ValueError("schema_filename must be set in subclass")
        schema_path = Path(__file__).resolve().parent / "response_schemas" / self.schema_filename
        with open(schema_path, 'r', encoding='utf-8') as f:
            extra_params = {'response_format': json.load(f)}
        self.regenerate = regenerate
        super().__init__(config=config, user_session=user_session, extra_params=extra_params)

    def load_prompt(self):
        """Load the prompt template from file."""
        file = self.regenerate_prompt_filename if self.regenerate else self.prompt_filename
        if not file:
            raise ValueError("prompt_filename must be set in subclass")
        prompt_path = Path(__file__).resolve().parent.parent / "prompts" / file
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
    regenerate_prompt_filename = "regenerate_openbadge_30.txt"

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
    regenerate_prompt_filename = "regenerate_skills_alignment.txt"

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
    def generate_skills_laiser_api(self):
        """
        Submit course context to the LAiSER API and poll for extracted skills.

        Resolves base_url and api_key from processor config or Django settings.
        POSTs context to /laiser, polls /result until a terminal state, then
        normalizes the result array into the internal skills alignment format.
        """
        base_url = self.config.get("base_url") or getattr(settings, "LAISER_API_BASE_URL", "")
        api_key = self.config.get("api_key") or getattr(settings, "LAISER_API_KEY", "")
        timeout = self.config.get("timeout_seconds", getattr(settings, "LAISER_API_TIMEOUT_SECONDS", 90))
        poll_interval = self.config.get(
            "poll_interval_seconds", getattr(settings, "LAISER_API_POLL_INTERVAL_SECONDS", 2)
        )

        if not base_url or not api_key:
            logger.error("LAiSER API is not configured. Check LAISER_API_BASE_URL or LAISER_API_KEY")
            return {"error": f"LAiSER API incorrectly configured"}

        try:
            submit_response = requests.post(
                f"{base_url}/laiser",
                json={"inputText": self.context},
                headers={"x-api-key": api_key, "Content-Type": "application/json"},
                timeout=30,
            )
            submit_response.raise_for_status()
            submit_data = submit_response.json()
        except requests.exceptions.RequestException as exc:
            logger.error("LAiSER API submit failed: %s", exc)
            return {"error": str(exc)}
        except ValueError as exc:
            logger.error("LAiSER API submit returned non-JSON: %s", exc)
            return {"error": f"Invalid JSON from LAiSER submit: {exc}"}

        job_id = submit_data.get("jobId")
        if not job_id:
            logger.error("LAiSER API submit response missing jobId: %s", submit_data)
            return {"error": "No jobId in LAiSER submit response"}

        result = self._poll_laiser_job(base_url, api_key, job_id, timeout, poll_interval)
        if "error" in result:
            return result

        skills = [self._normalize_laiser_skill(s) for s in result.get("result", [])]
        return {"response": json.dumps({"skills": skills}), "status": "success"}

    def _poll_laiser_job(self, base_url, api_key, job_id, timeout, poll_interval):
        """Poll GET /result until the job reaches a terminal state or timeout."""
        elapsed = 0
        while elapsed < timeout:
            time.sleep(poll_interval)
            elapsed += poll_interval

            try:
                response = requests.get(
                    f"{base_url}/result",
                    params={"jobId": job_id},
                    headers={"x-api-key": api_key},
                    timeout=30,
                )
                response.raise_for_status()
                data = response.json()
            except requests.exceptions.RequestException as exc:
                logger.error("LAiSER API poll failed (jobId=%s): %s", job_id, exc)
                return {"error": str(exc)}
            except ValueError as exc:
                logger.error("LAiSER API poll returned non-JSON (jobId=%s): %s", job_id, exc)
                return {"error": f"Invalid JSON from LAiSER poll: {exc}"}

            if data.get("status") in ("QUEUED", "RUNNING"):
                continue

            return data

        logger.error("LAiSER API timed out after %ds, jobId=%s", timeout, job_id)
        return {"error": f"LAiSER API timed out after {timeout} seconds"}

    @staticmethod
    def _normalize_laiser_skill(skill: dict) -> dict:
        """Map a LAiSER API result entry to the internal skills alignment format."""
        source = (skill.get("Taxonomy Source") or "").lower()
        target_type_map = {
            "esco": "ESCO:Skill",
            "ukos": "UKOS:Skill",
            "onet_tech": "ONET:Skill",
        }
        return {
            "type": "Alignment",
            "skill_tag": skill.get("Raw Skill", ""),
            "target_name": skill.get("Taxonomy Skill", ""),
            "target_description": skill.get("Taxonomy Description", ""),
            "target_url": skill.get("Source URL", ""),
            "target_type": target_type_map.get(source, source),
            "correlation_coefficient": skill.get("Correlation Coefficient", 0),
            "task_abilities": [],
            "knowledge_required": [],
        }
