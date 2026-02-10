"""
Django admin configuration for AI Extensions models.
"""

from .models import Issuer, BadgeClass
from django.contrib import admin


@admin.register(Issuer)
class IssuerAdmin(admin.ModelAdmin):
    list_display = ("name", "url", "email")
    readonly_fields = ("json_url", "slug")

@admin.register(BadgeClass)
class BadgeClassAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "version", "issuer", "is_published")
    list_filter = ("issuer", "is_published")
