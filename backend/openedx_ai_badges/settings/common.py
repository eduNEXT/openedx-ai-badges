"""
Common settings for the openedx_ai_extensions application.
"""

import logging
from pathlib import Path

logger = logging.getLogger(__name__)


BASE_DIR = Path(__file__).resolve().parent.parent


def plugin_settings(settings):  # pylint: disable=unused-argument
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
