"""
Main API URLs for openedx-ai-extensions
"""

from django.urls import include, path

app_name = "openedx_ai_badges_api"

urlpatterns = [
    path("v1/", include("openedx_ai_badges.api.v1.urls", namespace="v1")),
]
