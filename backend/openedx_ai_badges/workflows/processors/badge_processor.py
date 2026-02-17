"""
Badge processor module for generating Open Badges 2.0 BadgeClass definitions.
"""
from openedx_ai_extensions.processors import LLMProcessor  # pylint: disable=import-error


class BadgeProcessor(LLMProcessor):
    """
    Processor for generating BadgeClass definitions using LLM.

    This processor generates Open Badges 2.0 compliant BadgeClass definitions
    based on course context information.
    """

    def generate_badgeclass(self):
        """
        Generate a BadgeClass definition based on course context.

        Returns:
            dict: LLM response containing the generated BadgeClass JSON
        """
        system_role = """
            Based on the course context above, generate a BadgeClass definition following
            the Open Badges 2.0 specification.

            Rules and constraints:

            1. The badge represents the achievement itself, NOT an individual learner.
            2. The badge must be reusable and suitable for multiple recipients.
            3. Do NOT include any personal data.
            4. Use clear, professional, and verifiable language.
            5. The criteria must describe objectively what was required to earn the badge.
            6. The badge definition should be deterministic: similar courses should
              produce similar badge definitions.
            7. Assume the issuer already exists and will be linked separately.

            Return the result strictly as JSON with the following structure:

            {
              "name": string,
              "description": string,
              "criteria": {
                "narrative": string
              },
              "skills": [string],
              "level": string
            }

            Do not include IDs, URLs, issuer information, or images.
            Do not include explanations or additional text outside the JSON.
        """
        result = self._call_completion_wrapper(system_role=system_role)
        return result
