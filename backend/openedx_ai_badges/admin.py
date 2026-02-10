"""
Django admin configuration for AI Extensions models.
"""

from .models import Issuer
from django.contrib import admin


@admin.register(Issuer)
class IssuerAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "url", "email")
    prepopulated_fields = {"slug": ("name",)}
