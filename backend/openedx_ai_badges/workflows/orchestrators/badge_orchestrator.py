"""
Simple Custom Orchestrator - Demonstrates orchestrator pattern
"""
import json
import logging
import time

from openedx_ai_extensions.workflows.orchestrators.session_based_orchestrator import SessionBasedOrchestrator
from ..processors.badge_processor import BadgeProcessor
from openedx_ai_badges.api.v1.serializers.badge import BadgeClassPublicSerializer

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


class BadgeOrchestrator(SessionBasedOrchestrator):
    """
    Complete mock orchestrator.
    Responds inmediately with a mock answer. Useful for UI testing.
    """

    def run(self, input_data):
        if self.session.metadata.get('badge'):
            badge = self.session.metadata['badge']
            return {
                "response": str(badge),
                "status": "completed",
            }

        course_context = MOCK_COURSE_CONTEXT

        badge_processor = BadgeProcessor(self.profile.processor_config)
        llm_result = badge_processor.process(context=str(course_context))
        response = json.loads(llm_result.get("response", "{}"))

        # response = {'name': 'Python Async Fundamentals Completion', 'description': 'Validates intermediate competency in asynchronous programming with Python for backend applications, including the use of asyncio, the event loop, coroutines (async/await), and asynchronous I/O to build non-blocking services and manage concurrent tasks with robust error handling.', 'criteria': {'narrative': 'To earn this badge, a learner must: 1) complete all course modules; 2) submit all hands-on coding exercises; and 3) pass a final practical assessment with a minimum score of 70%. The final assessment requires implementing an asynchronous Python service that: uses the asyncio event loop; defines and runs coroutines with async and await; performs non-blocking I/O; schedules and manages multiple concurrent tasks; and handles errors, cancellations, and timeouts in asynchronous workflows.'}, 'skills': ['python', 'asyncio', 'event loop', 'coroutines', 'concurrency', 'asynchronous I/O'], 'level': 'intermediate'}

        serializer = BadgeClassPublicSerializer(response)
        badge = serializer.data
        self.session.metadata['badge'] = badge
        self.session.save(update_fields=['metadata'])

        return {
            "response": str(badge),
            "status": "completed",
        }
