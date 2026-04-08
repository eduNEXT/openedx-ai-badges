"""
Common settings for the openedx_ai_extensions application.
"""

import logging
from pathlib import Path

logger = logging.getLogger(__name__)


BASE_DIR = Path(__file__).resolve().parent.parent


def plugin_settings(settings):
    """
    Add plugin settings to main settings object.

    Args:
        settings (dict): Django settings object
    """

    # -------------------------
    # Extend workflow template directories
    # -------------------------
    if not hasattr(settings, "WORKFLOW_TEMPLATE_DIRS"):
        settings.WORKFLOW_TEMPLATE_DIRS = []

    # Add ai-badges workflow profiles directory
    badges_workflow_dir = BASE_DIR / "workflows" / "profiles"
    if badges_workflow_dir not in settings.WORKFLOW_TEMPLATE_DIRS:
        settings.WORKFLOW_TEMPLATE_DIRS.append(badges_workflow_dir)

    # -------------------------
    # MIT DCC Badge API
    # -------------------------
    settings.MIT_DCC_BADGE_API_URL = "http://mit-slm:8000/api/v1/generate-badge-suggestions"
    settings.MIT_SLM_OLLAMA_URL = ""
    settings.MIT_SLM_OLLAMA_TOKEN = ""
    settings.MIT_DCC_BADGE_API_HEALTH_URL = "http://mit-slm:8000/health"

    # -------------------------
    # LAiSER API
    # -------------------------
    settings.LAISER_API_BASE_URL = ""
    settings.LAISER_API_KEY = ""
    settings.LAISER_API_TIMEOUT_SECONDS = 90
    settings.LAISER_API_POLL_INTERVAL_SECONDS = 2
