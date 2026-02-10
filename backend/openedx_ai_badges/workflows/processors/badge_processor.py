from openedx_ai_extensions.processors import LLMProcessor

class BadgeProcessor(LLMProcessor):

    def generate_badgeclass(self):
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
