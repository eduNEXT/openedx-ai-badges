"""
Database models for openedx_ai_extensions.
"""

from django.db import models

class Issuer(models.Model):
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=255)
    url = models.URLField()
    email = models.EmailField()

    description = models.TextField(blank=True)

    public_key = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def json_url(self):
        return f"{self.url}/issuer/{self.slug}.json"

    def __str__(self):
        return self.name
