"""
Django admin configuration for AI Extensions models.
"""

from .models import Issuer, BadgeClass, BadgeAssertion
from django.contrib import admin


@admin.register(Issuer)
class IssuerAdmin(admin.ModelAdmin):
    list_display = ("name", "url", "email")
    readonly_fields = ("json_url", "slug")


@admin.register(BadgeClass)
class BadgeClassAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "version", "issuer", "is_published")
    list_filter = ("issuer", "is_published")
    readonly_fields = ("course_id",)


@admin.register(BadgeAssertion)
class BadgeAssertionAdmin(admin.ModelAdmin):
    list_display = ("badge", "user", "assertion_id", "issued_on")
    list_filter = ("badge",)
    readonly_fields = ("badge", "issued_on")
