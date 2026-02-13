"""
Django admin configuration for AI Extensions models.
"""

from .models import BadgeClass
from django.contrib import admin

@admin.register(BadgeClass)
class BadgeClassAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "version", "issuer", "is_published")
    list_filter = ("issuer", "is_published")
    readonly_fields = ("course_id",)
