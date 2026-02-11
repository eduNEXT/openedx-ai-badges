"""
Database models for openedx_ai_extensions.
"""
import uuid
import hashlib
from django.utils import timezone
from django.db import models
from opaque_keys.edx.django.models import CourseKeyField
from django.contrib.auth import get_user_model


User = get_user_model()


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

    course_id = CourseKeyField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Course associated",
        unique=True,
    )

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


class BadgeAssertion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    badge = models.ForeignKey(BadgeClass, on_delete=models.PROTECT)

    # Identidad del receptor (Open Badges compliant)
    recipient_type = models.CharField(
        max_length=20,
        choices=[("email", "Email")],
        default="email",
    )

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, help_text="User associated with this session", null=True, blank=True
    )

    recipient_hashed = models.BooleanField(default=True)
    recipient_salt = models.CharField(max_length=64)
    recipient_identity = models.CharField(max_length=255)

    issued_on = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def assertion_id(self):
        return f"{self.badge.issuer.url}/assertions/{self.id}.json"

    def __str__(self):
        return f"Assertion {self.id}"


def hash_recipient_email(email: str, salt: str) -> str:
    value = email.lower().strip() + salt
    digest = hashlib.sha256(value.encode("utf-8")).hexdigest()
    return f"sha256${digest}"

def issue_assertion_for_email(*, badge_slug: str, badge_version: int, user: User) -> BadgeAssertion:
    email = user.email
    badge = BadgeClass.objects.get(
        slug=badge_slug,
        version=badge_version,
        is_published=True,
    )

    salt = uuid.uuid4().hex
    recipient_identity = hash_recipient_email(email, salt)

    assertion = BadgeAssertion.objects.create(
        badge=badge,
        recipient_type="email",
        recipient_hashed=True,
        recipient_salt=salt,
        recipient_identity=recipient_identity,
        issued_on=timezone.now(),
        user=user,
    )

    return assertion
