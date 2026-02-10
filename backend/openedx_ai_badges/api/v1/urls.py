"""
Version 1 API URLs
"""

from django.urls import path
from .views.badge import BadgeClassPublicView
from .views.issuer import IssuerPublicView

app_name = "v1"

urlpatterns = [
    path(
        "issuer/<slug:slug>.json",
        IssuerPublicView.as_view(),
        name="issuer-public",
    ),
    path(
        "badges/<slug:slug>/v<int:version>.json",
        BadgeClassPublicView.as_view(),
        name="badgeclass-public",
    ),
]
