"""
Badge Orchestrator - Generates Open Badges 3.0 BadgeClass via async Celery tasks.

Session metadata stores multiple badges per session under a ``badges`` list.
Each badge entry has an ``id``, ``status`` (draft/published), and ``versions`` (image history).
"""
import json
import logging
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from urllib.parse import urlparse

import requests
from django.conf import settings
from openedx_ai_extensions.processors import OpenEdXProcessor
from openedx_ai_extensions.workflows.orchestrators.session_based_orchestrator import (
    SessionBasedOrchestrator,
    _execute_orchestrator_async,
)

from openedx_ai_badges.processors.badge_processor import BadgeProcessor, SkillsProcessor
from openedx_ai_badges.processors.mit_dcc_processor import MITDCCProcessor
from openedx_ai_badges.processors.openedx_events_processor import OpenEdXEventsProcessor

logger = logging.getLogger(__name__)


class BadgeOrchestrator(SessionBasedOrchestrator):
    """
    Orchestrator to generate Open Badges 3.0 BadgeClass
    based on course context and optional skills.
    """

    # ------------------------------------------------------------------
    # Badge list helpers
    # ------------------------------------------------------------------

    def _get_badges(self):
        """Return the badges list from session metadata, initializing if needed."""
        if 'badges' not in self.session.metadata:
            self.session.metadata['badges'] = []
        return self.session.metadata['badges']

    def _find_badge(self, badge_id):
        """Find a badge by *id*. Returns ``(index, badge_dict)`` or ``(None, None)``."""
        for i, badge in enumerate(self._get_badges()):
            if badge['id'] == badge_id:
                return i, badge
        return None, None

    def _set_image_status_message(self, message):
        """Write an intermediate status message for image generation polling."""
        self.session.metadata['image_task_status_message'] = message
        self.session.save(update_fields=['metadata'])

    def _resolve_regenerate_context(self, input_data):
        """
        Resolve the badge, previous generated response, and course context for a regeneration call.

        Looks up the badge by ``badge_id`` when provided.  Also fetches
        (or reuses) the course context and validates that a prior badge
        definition exists before any expensive work is done.

        Returns:
            tuple: ``(badge, course_context, previous_generated_response)`` on
                   success, or an error dict ``{"error": ..., "status": "error"}``
                   that the caller should return immediately.
        """
        badge_id = input_data.get('badge_id')
        badge = None

        if badge_id:
            _, badge = self._find_badge(badge_id)
            if badge is None:
                return {'error': f'Badge {badge_id} not found', 'status': 'error'}
            previous_generated_response = badge.get('generated_response', {})
        else:
            return {
                "error": "No previous generation found to regenerate from.",
                "status": "error",
            }

        has_subject = (previous_generated_response.get('credentialSubject')
                       or previous_generated_response.get('credential_subject'))
        if not has_subject:
            return {
                "error": "Previous badge definition is missing. Cannot regenerate without a prior badge.",
                "status": "error",
            }

        if badge is not None and badge.get('course_context'):
            course_context = badge['course_context']
        else:
            self._set_status_message("Fetching course content...")
            course_context = self._get_course_context()
            if isinstance(course_context, dict) and 'error' in course_context:
                return course_context

        return badge, course_context, previous_generated_response

    # ------------------------------------------------------------------
    # CRUD actions exposed to the frontend
    # ------------------------------------------------------------------

    def get_badges(self, input_data):  # pylint: disable=unused-argument
        """
        Return all badges stored in the current session.

        Used by the frontend to determine the initial view state:
        - Empty list → show Empty State (no badges created yet)
        - Non-empty → show Gallery with badge cards

        Returns:
            dict: ``{"response": [...], "status": "completed"}`` or
                  ``{"response": [], "status": "empty"}``.
        """
        badges = self._get_badges()
        if badges:
            return {"response": badges, "status": "completed"}
        return {"response": [], "status": "empty"}

    def save_badge(self, input_data):
        """
        Upsert a badge entry with the given status and content.

        Args:
            input_data: dict with ``badge_id`` (str | None), ``status``
                        ('draft' | 'published'), ``course_context``,
                        ``generated_response``, and optionally ``badge_image``.
        """
        badge_id = input_data.get('badge_id')
        status = input_data.get('status', 'draft')

        if badge_id:
            _, badge = self._find_badge(badge_id)
            if badge is None:
                return {'error': f'Badge {badge_id} not found', 'status': 'error'}
        else:
            badge_id = str(uuid.uuid4())
            badge = {
                'id': badge_id,
                'status': 'draft',
                'created_at': datetime.now(timezone.utc).isoformat(),
                'versions': [],
            }
            self._get_badges().append(badge)

        if 'course_context' in input_data:
            badge['course_context'] = input_data['course_context']
        if 'generated_response' in input_data:
            badge['generated_response'] = input_data['generated_response']
        if 'badge_image' in input_data and input_data['badge_image']:
            new_image = input_data['badge_image']
            current_image = badge.get('badge_image')
            if not current_image or current_image.get('b64') != new_image.get('b64'):
                badge.setdefault('versions', []).insert(0, {
                    'id': str(uuid.uuid4()),
                    'badge_image': new_image,
                    'created_at': datetime.now(timezone.utc).isoformat(),
                })
            badge['badge_image'] = new_image

        badge['status'] = status
        self.session.save(update_fields=['metadata'])

        if status == 'published':
            self._emit_badge_generation(badge)

        return {"response": badge, "status": "saved"}

    def delete_draft(self, input_data):
        """
        Delete a draft badge by ID. Published badges cannot be deleted.
        """
        badge_id = input_data.get('badge_id')
        if not badge_id:
            return {'error': 'Missing badge_id', 'status': 'error'}

        idx, badge = self._find_badge(badge_id)
        if badge is None:
            return {'error': f'Badge {badge_id} not found', 'status': 'error'}
        if badge['status'] != 'draft':
            return {'error': 'Only draft badges can be deleted', 'status': 'error'}

        self._get_badges().pop(idx)
        self.session.save(update_fields=['metadata'])
        return {"response": None, "status": "deleted"}

    # ------------------------------------------------------------------
    # Existing actions
    # ------------------------------------------------------------------

    def regenerate(self, input_data):
        """
        Regenerate the badge using the existing session metadata.

        Args:
            input_data: dict containing any necessary input for regeneration.
                Pass ``badge_id`` to update a specific badge in ``badges[]``.
        Returns:
            dict: Response containing the regenerated badge and status
        """
        context = self._resolve_regenerate_context(input_data)
        if isinstance(context, dict):
            return context
        badge, course_context, previous_generated_response = context

        skills_requested = input_data.get('skills_enabled', False) or input_data.get('skillsEnabled', False)
        if skills_requested and not previous_generated_response.get('skills'):
            return {
                "error": "Skills were requested for regeneration but no previous skills definition was found.",
                "status": "error",
            }

        credential_subject = (
            previous_generated_response.get('credentialSubject')
            or previous_generated_response.get('credential_subject')
            or {}
        )
        input_data['previous_badge'] = credential_subject.get('achievement', {})
        input_data['previous_skills'] = previous_generated_response.get('skills', [])

        input_data['course_context'] = course_context

        generated_response = {
            'enable_skill_extraction': skills_requested,
            'badge_configuration': {
                'badge_style': input_data.get('style', ''),
                'badge_tone': input_data.get('tone', ''),
                'badge_level': input_data.get('level', ''),
                'criterion_style': input_data.get('criterion', ''),
            },
        }

        if skills_requested:
            skills_fn = self.profile.processor_config.get("SkillsProcessor", {}).get("function", "generate_skills")
            self._set_status_message(f'Generating skills alignment using "{skills_fn}"...')
            skills = self._get_skills(course_context, input_data, regenerate=True)
            if isinstance(skills, dict) and 'error' in skills:
                return skills
            generated_response['skills'] = skills
        else:
            generated_response['skills'] = previous_generated_response.get('skills', [])

        self._set_status_message("Generating badge definition...")
        credential_subject = self._get_achievement(input_data, input_data, regenerate=True)
        if isinstance(credential_subject, dict) and 'error' in credential_subject:
            return credential_subject
        generated_response['credentialSubject'] = credential_subject

        input_data['generated_response'] = generated_response

        badge['course_context'] = course_context  # pylint: disable=unsupported-assignment-operation
        badge['generated_response'] = generated_response  # pylint: disable=unsupported-assignment-operation
        self.session.save(update_fields=['metadata'])
        return {"response": badge, "status": "completed"}

    def generate_image_async(self, input_data):
        """
        Launch async task to execute the generate_image method.
        Uses separate ``image_task_*`` metadata keys so it does not
        conflict with the badge-generation ``task_*`` keys.
        """
        self.session.metadata = self.session.metadata or {}
        self.session.metadata['image_task_status'] = 'processing'
        self.session.metadata.pop('image_task_result', None)
        self.session.metadata.pop('image_task_error', None)
        self.session.metadata.pop('image_task_status_message', None)
        self.session.save()

        task = _execute_orchestrator_async.delay(
            session_id=self.session.id,
            action='generate_image',
            params={"input_data": input_data},
        )

        return {
            'status': 'processing',
            'task_id': task.id,
            'message': 'Image generation has started',
        }

    def get_image_status(self, input_data):  # pylint: disable=unused-argument
        """
        Poll the status of an async image generation task.
        Mirrors ``get_run_status`` but reads the ``image_task_*`` keys.
        """
        metadata = self.session.metadata or {}
        status = metadata.get('image_task_status', 'idle')

        if status == 'completed':
            return {
                'status': 'completed',
                'response': metadata.get('image_task_result'),
                'message': metadata.get('image_task_status_message'),
            }
        if status == 'error':
            return {
                'status': 'error',
                'error': metadata.get('image_task_error', 'Image generation failed'),
            }
        return {
            'status': status,
            'message': metadata.get('image_task_status_message'),
        }

    def regenerate_async(self, input_data):
        """
        Launch async task to execute the regenerate method.

        Args:
            input_data: Input data to pass to the regenerate method
        """
        self.session.course_id = self.course_id
        self.session.location_id = self.location_id
        self.session.metadata = self.session.metadata or {}
        self.session.metadata['task_status'] = 'processing'
        self.session.metadata.pop('task_result', None)
        self.session.metadata.pop('task_error', None)
        self.session.metadata.pop('task_status_message', None)
        self.session.save()

        task = _execute_orchestrator_async.delay(
            session_id=self.session.id,
            action='regenerate',
            params={
                "input_data": input_data,
            }
        )

        return {
            'status': 'processing',
            'task_id': task.id,
            'message': 'AI workflow has started',
        }

    def generate_image(self, input_data):
        """
        Proxy image generation request to the external Image API.

        Args:
            input_data: dict containing:
                - mode: 'icon_based', 'text_overlay', or 'config'
                - scale_factor: float
                - (other fields depending on mode)
        Returns:
            dict: The API response (b64 + config) and status.
        """
        image_api_url = getattr(settings, 'MIT_DCC_BADGE_IMAGE_API_URL', 'http://mit-slm-image:3001')
        if not image_api_url:
            return {'error': 'Image API URL not configured', 'status': 'error'}

        mode = input_data.get('mode', 'icon_based')
        scale_factor = input_data.get('scale_factor', 2.0)

        if mode == 'text_overlay':
            endpoint = f"{image_api_url}/api/v1/badge/generate-with-text"
            payload = {
                "image_type": "text_overlay",
                "short_title": input_data.get('short_title'),
                "achievement_phrase": input_data.get('achievement_phrase'),
                "institution": input_data.get('institution', ''),
                "institute_url": input_data.get('institute_url', ''),
                "image_configuration": input_data.get('image_configuration', {}),
                "scale_factor": scale_factor,
            }
        elif mode == 'config':
            endpoint = f"{image_api_url}/api/v1/badge/generate"
            payload = {
                "config": input_data.get('config'),
                "scale_factor": scale_factor,
            }
        else:  # icon_based
            endpoint = f"{image_api_url}/api/v1/badge/generate-with-icon"
            payload = {
                "image_type": "icon_based",
                "badge_name": input_data.get('badge_name'),
                "badge_description": input_data.get('badge_description'),
                "institution": input_data.get('institution', ''),
                "institute_url": input_data.get('institute_url', ''),
                "image_configuration": input_data.get('image_configuration', {}),
                "scale_factor": scale_factor,
            }

        try:
            self._set_image_status_message("Generating badge image...")
            logger.info("Proxying image generation (%s) to: %s", mode, endpoint)
            response = requests.post(endpoint, json=payload, timeout=60)
            response.raise_for_status()
            raw_data = response.json()

            badge_image_data = {
                "b64": raw_data.get("data", {}).get("base64", ""),
                "config": raw_data.get("config", {})
            }

            # Persist image and mark image task complete
            if input_data.get('badge_id'):
                badge_id = input_data['badge_id']
                _, badge = self._find_badge(badge_id)
                if badge:
                    badge['badge_image'] = badge_image_data
            self.session.metadata['image_task_status'] = 'completed'
            self.session.metadata['image_task_result'] = badge_image_data
            self.session.save(update_fields=['metadata'])

            return {
                "response": badge_image_data,
                "status": "completed",
            }
        except Exception as e:      # pylint: disable=broad-exception-caught
            logger.error("Image generation failed: %s", str(e))
            self.session.metadata['image_task_status'] = 'error'
            self.session.metadata['image_task_error'] = str(e)
            self.session.save(update_fields=['metadata'])
            return {'error': f"Image generation failed: {str(e)}", 'status': 'error'}

    def run(self, input_data):
        """
        Execute the badge generation workflow.
        Args:
            input_data: dict containing any necessary input for the workflow
        Returns:
            dict: Final response containing the generated badge and status
        """
        self._set_status_message("Fetching course content...")
        course_context = self._get_course_context()
        if isinstance(course_context, dict) and 'error' in course_context:
            return course_context

        input_data['course_context'] = course_context

        skills_enabled = input_data.get('skills_enabled', False) or input_data.get('skillsEnabled', False)
        generated_response = {
            'enable_skill_extraction': skills_enabled,
            'badge_configuration': {
                'badge_style': input_data.get('style', ''),
                'badge_tone': input_data.get('tone', ''),
                'badge_level': input_data.get('level', ''),
                'criterion_style': input_data.get('criterion', ''),
            },
        }

        if skills_enabled:
            skills_fn = self.profile.processor_config.get("SkillsProcessor", {}).get("function", "generate_skills")
            self._set_status_message(f'Generating skills alignment using "{skills_fn}"...')
            skills = self._get_skills(course_context, input_data)
            if isinstance(skills, dict) and 'error' in skills:
                return skills
            generated_response['skills'] = skills

        self._set_status_message("Generating badge definition...")
        credential_subject = self._get_achievement(course_context, input_data)
        if isinstance(credential_subject, dict) and 'error' in credential_subject:
            return credential_subject
        generated_response['credentialSubject'] = credential_subject

        input_data['generated_response'] = generated_response
        response = self.save_badge(input_data)

        return {"response": response.get("response", {}), "status": "completed"}

    def _emit_badge_generation(self, badge_info: dict) -> dict:
        """
        Emit the BADGE_GENERATION event and return the processor result.

        Args:
            badge_info (dict): Full session badge entry as stored in
                ``self.session.metadata['badges']``.  The complete structure
                (``id``, ``status``, ``course_context``, ``generated_response``,
                ``badge_image``, etc.) is forwarded as-is into
                ``BadgeGenerationData.badge_data``.
        """
        try:
            result = OpenEdXEventsProcessor().emit_badge_generation(
                course_id=self.course_id,
                badge_info=badge_info,
            )
            if isinstance(result, dict) and (
                result.get('status') == 'error' or 'error' in result
            ):
                error_message = result.get('error') or 'Failed to emit BADGE_GENERATION event.'
                logger.error(
                    "Failed to emit BADGE_GENERATION for course=%s: %s",
                    self.course_id,
                    error_message,
                )
                return {'error': error_message, 'status': 'error'}
            logger.info("BADGE_GENERATION emitted for course=%s", self.course_id)
            return result
        except Exception as exc:  # pylint: disable=broad-exception-caught
            logger.error(
                "Failed to emit BADGE_GENERATION for course=%s: %s",
                self.course_id, exc,
            )
            return {'error': f'Failed to emit BADGE_GENERATION event: {exc}', 'status': 'error'}

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

    def _get_skills(self, course_context, input_data, regenerate=False):
        """Run SkillsProcessor and return the skills list or an error dict."""
        skill_processor = SkillsProcessor(
            self.profile.processor_config,
            regenerate=regenerate
        )
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
            result = json.loads(llm_result.get("response", "{}"))
            return result.get('skills', [])
        except json.JSONDecodeError as e:
            return {
                'error': f"Failed to parse skills response: {str(e)}",
                'status': 'error'
            }

    def _get_achievement(self, context, input_data, regenerate=False):
        """Run BadgeProcessor and return the credentialSubject dict or an error dict."""
        badge_processor = BadgeProcessor(
            self.profile.processor_config,
            regenerate=regenerate
        )
        llm_result = badge_processor.process(
            context=json.dumps(context),
            input_data=json.dumps(input_data)
        )
        if 'error' in llm_result:
            return {
                'error': f"Badge generation failed: {llm_result.get('error', 'Unknown error')}",
                'status': 'error'
            }
        try:
            result = json.loads(llm_result.get("response", "{}"))
            return result.get('credentialSubject', {})
        except json.JSONDecodeError as e:
            return {
                'error': f"Failed to parse badge response: {str(e)}",
                'status': 'error'
            }

    def get_api_status(self, input_data):  # pylint: disable=unused-argument
        """Check availability of the image generation API."""
        image_api_health_url = getattr(settings, 'MIT_DCC_BADGE_IMAGE_API_HEALTH_URL', '')

        if not image_api_health_url:
            status = 'not_configured'
        else:
            try:
                resp = requests.get(image_api_health_url, timeout=5)
                status = 'online' if resp.ok else 'unavailable'
            except Exception:   # pylint: disable=broad-exception-caught
                status = 'unavailable'

        return {
            'services': {
                'image_api': {'status': status, 'required': False},
            }
        }


class MITDCCBadgeOrchestrator(BadgeOrchestrator):
    """
    Orchestrator that delegates badge generation to the MIT DCC remote API
    instead of running local LLM processors.

    The workflow is:
      1. Extract course context via OpenEdXProcessor (same as base).
      2. POST the course context + user input to the MIT DCC API.
      3. Parse and normalise the response into the same shape that
         BadgeOrchestrator produces so the existing UI works unchanged.

    The ``save`` action is inherited from BadgeOrchestrator without changes.
    """

    def get_api_status(self, input_data):
        """
        Check availability of the external services used by this orchestrator.

        Args:
            input_data: accepted for framework compatibility but not used.

        Returns:
            dict: service statuses keyed by service name.
        """
        health_url = getattr(settings, 'MIT_DCC_BADGE_API_HEALTH_URL', '')
        ollama_url = getattr(settings, 'MIT_SLM_OLLAMA_URL', '')
        ollama_token = getattr(settings, 'MIT_SLM_OLLAMA_TOKEN', '')
        image_api_health_url = getattr(settings, 'MIT_DCC_BADGE_IMAGE_API_HEALTH_URL', '')

        def check_badge_api():
            if not health_url:
                return 'not_configured'
            try:
                resp = requests.get(health_url, timeout=5)
                return 'online' if resp.ok else 'unavailable'
            except Exception:   # pylint: disable=broad-exception-caught
                return 'unavailable'

        def check_ollama():
            if not ollama_url:
                return 'not_configured'
            parsed = urlparse(ollama_url)
            base_url = f"{parsed.scheme}://{parsed.netloc}"
            tags_url = f"{base_url}/api/tags"
            headers = {}
            if ollama_token:
                headers['Authorization'] = f'Bearer {ollama_token}'
            try:
                resp = requests.get(tags_url, headers=headers, timeout=5)
                if not resp.ok:
                    return 'unavailable'
                try:
                    data = resp.json()
                except ValueError:
                    return 'unavailable'
                models = data.get('models', [])
                if isinstance(models, list) and len(models) > 0:
                    return 'online'
                if isinstance(models, list):
                    return 'starting'
                return 'unavailable'
            except Exception:   # pylint: disable=broad-exception-caught
                return 'unavailable'

        def check_image_api():
            if not image_api_health_url:
                return 'not_configured'
            try:
                resp = requests.get(image_api_health_url, timeout=5)
                return 'online' if resp.ok else 'unavailable'
            except Exception:   # pylint: disable=broad-exception-caught
                return 'unavailable'

        with ThreadPoolExecutor(max_workers=3) as executor:
            badge_api_future = executor.submit(check_badge_api)
            ollama_future = executor.submit(check_ollama)
            image_api_future = executor.submit(check_image_api)
            badge_api_status = badge_api_future.result()
            ollama_status = ollama_future.result()
            image_api_status = image_api_future.result()

        return {
            'services': {
                'badge_api': {'status': badge_api_status, 'required': True},
                'ollama': {'status': ollama_status, 'required': True},
                'image_api': {'status': image_api_status, 'required': False},
                # 'laiser_api': {'status': 'not_configured', 'required': False},  # planned for future PR
            }
        }

    def run(self, input_data):
        """
        Execute badge generation via the MIT DCC remote API.

        Args:
            input_data: dict containing user form fields (style, tone, level,
                        criterion, skillsEnabled, …)
        Returns:
            dict: ``{"response": badge, "status": "completed"}``
        """
        self._set_status_message("Fetching course content...")
        course_context = self._get_course_context()
        if isinstance(course_context, dict) and 'error' in course_context:
            return course_context

        self._set_status_message("Generating badge via MIT DCC API...")
        processor = MITDCCProcessor(self.profile.processor_config)
        api_result = processor.generate_badge(
            course_context=course_context,
            input_data=input_data,
        )

        if isinstance(api_result, dict) and 'error' in api_result:
            return {**api_result, 'status': 'error'}

        complete_info = {
            'course_context': course_context,
            'generated_response': api_result,
        }

        self.session.metadata['complete_info'] = complete_info
        badge = self._add_badge_from_complete_info(complete_info)
        self.session.save(update_fields=['metadata'])

        return {"response": badge, "status": "completed"}

    def regenerate(self, input_data):
        """
        Re-generate badge via the MIT DCC remote API, passing the previous
        badge result as additional context so the model can improve on it.

        Args:
            input_data: dict containing updated user form fields.
                        Pass ``badge_id`` to update a specific badge in ``badges[]``.
        Returns:
            dict: ``{"response": badge, "status": "completed"}``
        """
        context = self._resolve_regenerate_context(input_data)
        if isinstance(context, dict):
            return context
        badge, course_context, previous_generated_response = context

        self._set_status_message("Regenerating badge via MIT DCC API...")
        processor = MITDCCProcessor(self.profile.processor_config)
        api_result = processor.generate_badge(
            course_context=course_context,
            input_data={
                **input_data,
                'previous_badge': previous_generated_response.get('credentialSubject', {}).get('achievement', {}),
                'previous_skills': previous_generated_response.get('skills', []),
            },
        )

        if isinstance(api_result, dict) and 'error' in api_result:
            return {**api_result, 'status': 'error'}

        if badge is not None:
            badge['course_context'] = course_context  # pylint: disable=unsupported-assignment-operation
            badge['generated_response'] = api_result  # pylint: disable=unsupported-assignment-operation
            self.session.save(update_fields=['metadata'])
            return {"response": badge, "status": "completed"}

        complete_info = {
            'course_context': course_context,
            'generated_response': api_result,
        }
        self.session.metadata['complete_info'] = complete_info
        self.session.save(update_fields=['metadata'])
        return {"response": complete_info, "status": "completed"}
