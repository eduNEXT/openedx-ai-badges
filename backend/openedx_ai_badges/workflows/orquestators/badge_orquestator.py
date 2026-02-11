"""
Simple Custom Orchestrator - Demonstrates orchestrator pattern
"""
import json
import logging
import time

from openedx_ai_extensions.workflows.orchestrators import BaseOrchestrator
from ..processors.badge_processor import BadgeProcessor
from openedx_ai_badges.api.v1.serializers.badge import BadgeClassWriteSerializer
from openedx_ai_badges.models import Issuer, BadgeClass, issue_assertion_for_email

logger = logging.getLogger(__name__)

MOCK_COURSE_CONTEXT = {
    "course_title": "Python Async Fundamentals",
    "course_description": (
        "This course introduces asynchronous programming in Python. "
        "Learners explore how to build non-blocking applications using "
        "asyncio, coroutines, and asynchronous I/O. The course focuses on "
        "practical patterns commonly used in backend services."
    ),
    "target_audience": (
        "Backend developers with basic Python knowledge who want to improve "
        "application performance and scalability."
    ),
    "learning_objectives": [
        "Understand the difference between synchronous and asynchronous execution",
        "Learn how the asyncio event loop works",
        "Write and run coroutines using async and await",
        "Manage concurrent tasks and handle async errors",
        "Apply async patterns in real-world backend scenarios",
    ],
    "skills": [
        "python",
        "asyncio",
        "event loop",
        "coroutines",
        "concurrency",
        "asynchronous I/O",
    ],
    "duration": "8 hours",
    "assessment_method": (
        "Hands-on coding exercises and a final practical assessment where "
        "learners implement an asynchronous service."
    ),
    "completion_requirements": (
        "Complete all modules, submit all exercises, and pass the final "
        "assessment with a minimum score of 70%."
    ),
    "level": "intermediate",
}


class BadgeOrquestator(BaseOrchestrator):
    """
    Complete mock orchestrator.
    Responds inmediately with a mock answer. Useful for UI testing.
    """

    def run(self, input_data):
        #1. Get course context (mocked)
        course_context = MOCK_COURSE_CONTEXT

        #2. Process badge class definition
        badge_processor = BadgeProcessor(self.profile.processor_config)
        issuer = Issuer.objects.first()  # TODO handle issuer selection properly
        llm_result = badge_processor.process(context=str(course_context))
        response = json.loads(llm_result.get("response", "{}"))

        #3. Serialize and create BadgeClass with the result
        serializer = BadgeClassWriteSerializer(data=response)
        serializer.is_valid(raise_exception=True)
        serializer.save(issuer=issuer, course_id=self.course_id)
        return {
            "response": "BadgeClass created successfully",
            "status": "completed",
        }

class BadgeAssertionOrquestator(BaseOrchestrator):
    """
    Complete mock orchestrator for badge assertion.
    """

    def run(self, input_data):
        existing_badge = BadgeClass.objects.filter(course_id=self.course_id).first()
        if existing_badge:
            assertion = issue_assertion_for_email(
                badge_slug=existing_badge.slug,
                badge_version=existing_badge.version,
                user=self.user,
            )
            return {
                "response": f"Certificate Generated Sucessfully! You can import you badge with this (Link)[{assertion.assertion_id()}]",
                "status": "completed",
            }
