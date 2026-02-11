"""
Version 1 API URLs
"""

from django.urls import path
from .views.badge import BadgeClassPublicView, badge_svg_view
from .views.issuer import IssuerPublicView
from .views.assertion import AssertionPublicView

app_name = "v1"

urlpatterns = [
    path(
        "issuer/<slug:slug>.json",
        IssuerPublicView.as_view(),
        name="issuer-public",
    ),
    path(
        "badges/<slug:slug>-v<int:version>.json",
        BadgeClassPublicView.as_view(),
        name="badgeclass-public",
    ),
    path(
        "assertions/<uuid:id>.json",
        AssertionPublicView.as_view(),
        name="assertion-public",
    ),
    path("badges/<slug:slug>.svg", badge_svg_view, name="badge-svg")
]
