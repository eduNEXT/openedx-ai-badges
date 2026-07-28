Generate Badges with the MIT DCC Models
########################################

This how-to walks through everything needed to produce an Open Badges 3.0
definition from a course, using the **MIT DCC** badge-generation service
(a fine-tuned ``phi4-chat`` model served through Ollama, with skill
extraction provided by LAiSER).

The same steps apply to the default, LLM-based workflow — the only
difference is which base template the AI workflow profile points to. See
`Using the LLM workflow instead`_ at the end.

.. contents::
   :local:
   :depth: 2


Before you start
****************

Install the plugins
===================

This plugin builds on top of `openedx-ai-extensions
<https://github.com/openedx/openedx-ai-extensions>`_, which must be
installed and configured first. Follow the `AI Extensions documentation
<https://docs.openedx.org/projects/openedx-ai-extensions/en/latest/index.html>`_,
then install this plugin as described in the `installation section of the
README <https://github.com/eduNEXT/openedx-ai-badges#installation>`_::

    pip install git+https://github.com/openedx/openedx-ai-badges.git
    tutor plugins enable openedx-ai-badges
    tutor images build openedx
    tutor images build mfe
    tutor local launch

Both the backend package and the Authoring MFE build matter: the
**AI Badges** tab is contributed by the frontend package, so an Authoring
MFE image built without it will not show the tab.

Bring up the DCC services
=========================

The MIT DCC path talks to an external badge API instead of calling an LLM
provider from inside Open edX. Enable the sidecar and point it at an
Ollama instance::

    tutor config save --set RUN_MIT_SLM=true
    tutor config save --set MIT_SLM_OLLAMA_URL="<your-ollama-endpoint>"
    tutor local launch

Optionally enable the badge image renderer, which powers the *Generate
image* button in the editor::

    tutor config save --set RUN_MIT_SLM_IMAGE=true

The orchestrator calls ``MIT_DCC_BADGE_API_URL``, which defaults to
``http://mit-slm:8000/api/v1/generate-badge-suggestions`` — the address of
the sidecar from inside the Open edX containers. This one is a Django
setting rather than a Tutor variable; override it only if the service runs
somewhere else.

For the full service architecture, hosting options, and the complete list
of configuration variables, see :doc:`../references/mit_slm_orchestrator`.


Step 1: Create the AI workflow profile
***************************************

A **profile** binds a workflow template on disk to a set of optional
overrides. As a platform administrator, go to::

    https://<your-lms-domain>/admin/openedx_ai_extensions/aiworkflowprofile/

Select *Add* and fill in:

.. list-table::
   :header-rows: 1
   :widths: 25 75

   * - Field
     - Value
   * - **Slug**
     - A human-readable identifier, e.g. ``cms_mitslm_badges``. Used for
       analytics; must be unique.
   * - **Description**
     - Free text, e.g. "Experiments with the MIT SLM model from the DCC
       project".
   * - **Base filepath**
     - ``mit_dcc_badges`` — the template shipped by this plugin. The
       dropdown lists every template discovered in
       ``WORKFLOW_TEMPLATE_DIRS``.
   * - **Content patch**
     - Leave empty to use the template as-is. It accepts a JSON5 Merge
       Patch (RFC 7386) — comments and trailing commas allowed — applied
       on top of the base template.

.. image:: /_static/admin-workflow-profile.png
   :alt: Django admin form for an AI workflow profile using the mit_dcc_badges template
   :width: 100%

The ``mit_dcc_badges`` template sets ``orchestrator_class`` to
``openedx_ai_badges.workflows.orchestrators.MITDCCBadgeOrchestrator``,
extracts ``title``, ``short_description``, ``description`` and ``overview``
from the course, and declares the ``badge_api``, ``ollama`` and
``image_api`` service checks shown in the editor's status panel.

Saving validates the merged configuration against the workflow schema.
Expand **Preview & Validation** to see the effective configuration and any
validation errors before saving.


Step 2: Create the AI workflow scope
*************************************

A **scope** decides where a profile is offered. Go to::

    https://<your-lms-domain>/admin/openedx_ai_extensions/aiworkflowscope/

Select *Add* and fill in:

.. list-table::
   :header-rows: 1
   :widths: 25 75

   * - Field
     - Value
   * - **Course id**
     - Leave blank to offer the workflow in **every** course. Set a course
       key such as ``course-v1:edunext+01+2026`` to restrict it to one
       course.
   * - **Location regex**
     - Leave blank. It only applies to workflows attached to a specific
       unit or block, and requires a course id when used.
   * - **Service variant**
     - ``CMS - Studio`` — badge authoring happens in Studio.
   * - **Ui slot selector id**
     - ``authoring-resources-ai-badge-creator-modal`` — this must match
       exactly, it is the identifier the AI Badges tab sends. Existing
       values are suggested as you type.
   * - **Profile**
     - The profile created in step 1.
   * - **Enabled**
     - Checked.

.. image:: /_static/admin-workflow-scope.png
   :alt: Django admin form for an AI workflow scope pointing at the badges UI slot
   :width: 100%

**Specificity index** is calculated on save and is read-only: a scope
scores +4 for a location regex, +2 for a course id and +1 for a slot
selector. When several scopes match the same context, the highest score
wins. That makes it easy to run a site-wide default scope and override it
for a single course — create both, and the course-specific one takes
precedence.


Step 3: Open the AI Badges tab in Studio
*****************************************

The rest of the work is done by educators, content authors, or anyone with
Studio access to the course.

Open Studio and select a course.

.. image:: /_static/studio-home-course-list.png
   :alt: Studio home listing the available courses
   :width: 100%

From the course, open **Content > Pages & Resources**.

.. image:: /_static/studio-content-pages-resources.png
   :alt: The Content menu in Studio with Pages and Resources highlighted
   :width: 100%

Scroll to the **AI Extensions Settings** card and select it.

.. image:: /_static/pages-resources-ai-extensions-card.png
   :alt: The AI Extensions Settings card in Pages and Resources
   :width: 100%

The settings modal opens on the **AI Badges** tab, which lists every badge
already generated for the course. The message under the introduction comes
from the profile's ``customMessage``, so it tells you which workflow is
active — useful when several profiles are in play.

.. image:: /_static/ai-badges-tab-gallery.png
   :alt: The AI Badges tab showing the gallery of generated badges
   :width: 100%

Badges are stored per course and shared across staff: everyone with access
to the course sees and edits the same gallery.


Step 4: Generate a badge
*************************

Select **Create New Badge** to open the editor, then set your preferences:

.. list-table::
   :header-rows: 1
   :widths: 30 70

   * - Setting
     - Options
   * - **Visual Style**
     - Modern *(default)*, Classic, Minimalist, Playful
   * - **Writing Tone**
     - Professional *(default)*, Friendly, Academic, Creative
   * - **Difficulty Level**
     - Beginner, Intermediate *(default)*, Advanced, Expert
   * - **Earning Criterion**
     - Completion *(default)*, Mastery, Participation, Excellence
   * - **Auto-Extract Skills**
     - On by default. With the DCC workflow, skills are extracted by
       LAiSER inside the remote service.
   * - **Custom Context**
     - Optional free text passed along with the course content.

The **Service Status** panel reports the badge API, the Ollama model and
the image API. *Generate Badge* stays disabled while a required service is
offline; Ollama may report *Starting* for a while as it loads the model.

Selecting **Generate Badge** runs the workflow asynchronously — course
content is extracted first, then sent to the DCC API. Progress messages
appear on the button while it runs.


Step 5: Review, refine, and publish
************************************

The editor shows the generated badge next to a preview:

- **Edit the fields directly** — badge name, description and criteria are
  editable, as are the course context, skills, and badge JSON.
- **Regenerate** — re-runs generation using the previous badge as
  additional context. Optional instructions can be added for that run.
- **Generate image** — renders a badge image through the image service.
  The last five images are kept as versions, selectable as thumbnails.
- **Save draft** — stores the badge in the gallery without announcing it.
- **Publish** — marks the badge published and emits the
  ``BADGE_GENERATION`` Open edX event with the full badge payload, so
  downstream services can act on it.

Published badges cannot be deleted, and only drafts can. Re-publishing an
already-published badge, or saving a draft over one, asks for confirmation
first — each publish emits the event again.


Troubleshooting
***************

**"No badge workflow is configured for this course."**
    No scope resolved for this context. Check that the scope is enabled,
    that **Service variant** is ``CMS - Studio``, that **Ui slot selector
    id** is exactly ``authoring-resources-ai-badge-creator-modal``, and
    that **Course id** is either blank or matches this course.

**The AI Badges tab is missing entirely**
    The Authoring MFE was built without the badges frontend package.
    Rebuild the MFE image, or register the local module as described in
    the README's development-environment section.

**"Required services are offline. Badge generation is disabled."**
    Open the Service Status panel. *Not configured* means the health URL
    setting is empty; *Unavailable* means the service did not answer.
    Verify ``RUN_MIT_SLM``, ``MIT_SLM_OLLAMA_URL`` and, for images,
    ``RUN_MIT_SLM_IMAGE``.

**The profile will not save**
    The merged configuration failed schema validation. The error names the
    offending key; ``schema_version``, ``orchestrator_class``,
    ``processor_config`` and ``actuator_config`` (with both a ``request``
    and a ``response`` UI component) are all required.


Using the LLM workflow instead
*******************************

To generate badges with a regular LLM provider rather than the DCC
service, create the profile in step 1 with **Base filepath** set to
``badges_base``. That template uses ``BadgeOrchestrator``, which calls the
provider configured in the AI Extensions provider settings, and extracts
skills with a prompt instead of LAiSER. Everything from step 2 onward is
identical.

The skills backend is selectable per profile through the
``SkillsProcessor`` function — prompt-based, LAiSER in-process, or the
remote LAiSER API. See the skills extraction notes in
``backend/openedx_ai_badges/workflows/`` for the available functions and
their configuration.
