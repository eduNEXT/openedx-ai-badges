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


class BadgeClass(models.Model):
    issuer = models.ForeignKey(Issuer, on_delete=models.PROTECT)

    slug = models.SlugField()
    version = models.PositiveIntegerField(default=1)

    name = models.CharField(max_length=255)
    description = models.TextField()

    criteria = models.JSONField()
    skills = models.JSONField(default=list, blank=True)

    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("slug", "version")
        indexes = [
            models.Index(fields=["slug", "version"]),
        ]

    def badge_id(self):
        return f"{self.issuer.url}/badges/{self.slug}-v{self.version}.json"

    def __str__(self):
        return f"{self.name} v{self.version}"
