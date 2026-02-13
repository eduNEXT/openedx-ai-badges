"""
Version 1 API URLs
"""

from django.urls import path
from .views.badge import BadgeClassPublicView, badge_svg_view

app_name = "v1"

urlpatterns = [
    path(
        "badges/<slug:slug>-v<int:version>.json",
        BadgeClassPublicView.as_view(),
        name="badgeclass-public",
    ),
    path("badges/<slug:slug>.svg", badge_svg_view, name="badge-svg")
]
