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
