0001 Offloading the AI engine to openedx-ai-extensions
######################################################

Status
******

Accepted

Context
*******

``openedx-ai-badges`` generates Open Badges 3.0 badge definitions from Open edX
course content. Doing so requires a large amount of generic "AI plumbing":
talking to LLM providers, extracting course content from the modulestore,
persisting workflow state, running work asynchronously, and exposing an HTTP
API to the frontend.

None of that plumbing is specific to badges. It is provided by the companion
library ``openedx-ai-extensions``, which this plugin depends on. The decision
recorded here is that ``openedx-ai-badges`` deliberately stays **thin**: it owns
only the badge *domain* and delegates ("offloads") every generic AI capability
to ``openedx-ai-extensions`` by subclassing its base classes and calling its
processors, models, and views.

This ADR documents where that boundary sits so future contributors know what
belongs in this repository versus the extension.

Decision
********

The following capabilities are offloaded to ``openedx-ai-extensions``. This
plugin imports, subclasses, or calls them rather than re-implementing them.

1. Orchestration framework & lifecycle
======================================

The badge orchestrators subclass extension base classes and override only
``run`` / ``regenerate`` and the badge CRUD actions:

- ``BaseOrchestrator`` — constructor wiring (``workflow``, ``user``,
  ``profile``, ``course_id``, ``location_id``, ``llm_processor``) and the
  ``get_orchestrator()`` factory that resolves the orchestrator class string
  from the profile, imports it, validates it, and instantiates it.
- ``SessionBasedOrchestrator`` — ``clear_session``, ``_set_status_message``,
  ``run_async``, ``get_run_status``, ``_get_submission_processor``.
  ``BadgeOrchestrator`` reuses ``_set_status_message`` / ``get_run_status``
  verbatim and only re-implements session lookup to be course-scoped.

2. Asynchronous execution infrastructure (Celery)
=================================================

Entirely offloaded — this plugin defines no Celery task. The
``_execute_orchestrator_async`` shared task provides the time limits, session
re-fetch, action dispatch by name, ``refresh_from_db``, and the
``task_status`` / ``task_result`` / ``task_error`` / ``timeout`` metadata state
machine. The badge orchestrator only calls ``.delay(...)`` and polls.

3. Workflow data model & configuration system
==============================================

This plugin defines **no Django models** (``models.py`` is a stub). All three
live in the extension:

- ``AIWorkflowProfile`` — disk-template + DB JSON5 merge-patch (RFC 7386)
  merging, validation, caching, and the ``processor_config`` /
  ``orchestrator_class`` / ``actuator_config`` accessors that the badge
  ``profiles/*.json`` files plug into.
- ``AIWorkflowScope`` — scope resolution (``ui_slot_selector_id`` matching,
  ``specificity_index`` weighting, ``location_regex``, ``service_variant``,
  caching) and ``execute()``, the action-dispatch entry point.
- ``AIWorkflowSession`` — the ``metadata`` JSONField where this plugin stores
  its entire ``badges[]`` list and image-task state, plus the
  local/remote/combined thread reconstruction helpers.

4. LLM abstraction (the core AI capability)
===========================================

``BaseBadgeLLMProcessor`` subclasses ``LLMProcessor`` and adds only file-based
prompt/schema loading and ``{{PLACEHOLDER}}`` filling. Everything about
actually calling a model is offloaded:

- Provider abstraction via LiteLLM, resolved from the ``AI_EXTENSIONS`` settings
  profiles (the ``"provider": "openai"`` in the profile JSON), including
  credential injection and model-string parsing.
- ``_call_completion_wrapper`` — the completion call used by ``BadgeProcessor``
  and ``SkillsProcessor``.
- Structured output (badges passes its JSON Schema via
  ``extra_params['response_format']``; enforcement is in the extension),
  Completion and Responses APIs, streaming, tool/function calling, MCP support,
  response caching, token-usage accounting, and ``PromptTemplate`` loading.

5. Open edX course-content access
=================================

This plugin calls ``OpenEdXProcessor(...).process()`` and treats the result as
opaque course context. All modulestore/edxapp access is offloaded:
``get_course_info``, ``get_course_outline``, ``get_location_content``,
component extractors, ``get_location_link``, ``get_context``, the ``@llm_tool``
registration, and ``SubmissionProcessor`` (via ``_get_submission_processor``).

6. HTTP / REST API surface
==========================

This plugin's own ``urls.py`` and ``views.py`` are empty stubs. The entire
client-facing API is offloaded:

- ``AIGenericWorkflowView`` — the single endpoint that reads ``action`` +
  ``user_input`` and dispatches to the badge orchestrator methods (``run``,
  ``regenerate``, ``save_badge``, ``get_badges``, ``generate_image_async``,
  ``get_image_status``, …), including streaming-vs-JSON handling and error
  envelopes.
- ``AIWorkflowProfileView`` / ``AIWorkflowProfilesListView`` — config delivery
  to the frontend (the ``actuator_config.UIComponents`` in the badge profiles).
- ``PromptTemplateDetailView`` — prompt editing.
- Permissions (``CourseStaffPermission``, ``get_context_from_request``) and the
  ``handle_ai_errors`` decorator.

7. Cross-cutting infrastructure
===============================

- xAPI / analytics emission and usage serialization.
- Settings scaffolding: ``WORKFLOW_TEMPLATE_DIRS`` (this plugin only *appends*
  its profiles dir), ``AI_EXTENSIONS`` provider profiles,
  ``AI_EXTENSIONS_MCP_CONFIGS``, ``AI_EXTENSIONS_ENABLE_LLM_CACHE``,
  ``OPENEDX_AI_EXTENSIONS_UI_SLOT_IDS``.
- Frontend actuator / UIComponents resolution (the profile→component contract).

What this plugin keeps
======================

For contrast, ``openedx-ai-badges`` owns the badge *domain*:

- The Open Badges 3.0 prompts and JSON response schemas.
- ``BadgeProcessor`` / ``SkillsProcessor`` (thin function wrappers over the
  offloaded LLM call).
- ``BadgeImageUploadProcessor`` (base64 → course asset store via its own
  ``edxapp_wrapper/contentstore``).
- ``MITDCCProcessor`` and the LAiSER polling client
  (``generate_skills_laiser_api``).
- ``OpenEdXEventsProcessor`` plus the ``BADGE_GENERATION`` signal and
  serializers.
- The badge image-generation HTTP proxy.
- The course-scoped session override and the multi-badge ``badges[]`` metadata
  CRUD.

Consequences
************

- **Clear ownership boundary.** New generic AI capability (a provider, a tool,
  an API endpoint) belongs in ``openedx-ai-extensions``; new badge behavior
  belongs here. Domain code should not reach around the extension to talk to
  the modulestore or an LLM directly.
- **Tight version coupling.** This plugin depends on extension internals
  (``BaseOrchestrator``, ``SessionBasedOrchestrator``,
  ``_execute_orchestrator_async``, ``LLMProcessor``, ``OpenEdXProcessor``,
  ``AIWorkflowSession``). Breaking changes in the extension can break badges;
  the dependency must be version-pinned and upgraded deliberately.
- **Thin, focused codebase.** The plugin stays small and badge-specific, at the
  cost of needing familiarity with the extension to understand the full
  request lifecycle.
