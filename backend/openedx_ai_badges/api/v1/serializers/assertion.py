from rest_framework import serializers
from openedx_ai_badges.models import BadgeAssertion


class AssertionPublicSerializer(serializers.ModelSerializer):
    context = serializers.SerializerMethodField()
    id = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    badge = serializers.SerializerMethodField()
    issuer = serializers.SerializerMethodField()
    recipient = serializers.SerializerMethodField()
    issuedOn = serializers.DateTimeField(source="issued_on")
    verification = serializers.SerializerMethodField()

    class Meta:
        model = BadgeAssertion
        fields = [
            "context",
            "id",
            "type",
            "issuedOn",
            "badge",
            "issuer",
            "recipient",
            "verification",
        ]

    def get_context(self, obj):
        return "https://w3id.org/openbadges/v2"

    def get_id(self, obj):
        return obj.assertion_id()

    def get_type(self, obj):
        return "Assertion"

    def get_badge(self, obj):
        return obj.badge.badge_id()

    def get_issuer(self, obj):
        return obj.badge.issuer.json_url()

    def get_recipient(self, obj):
        return {
            "type": obj.recipient_type,
            "hashed": obj.recipient_hashed,
            "salt": obj.recipient_salt,
            "identity": obj.recipient_identity,
        }

    def get_verification(self, obj):
        return {
            "type": "HostedBadge"
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['@context'] = data.pop('context')
        return data


class AssertionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = BadgeAssertion
        fields = [
            "badge",
            "recipient_type",
            "recipient_hashed",
            "recipient_salt",
            "recipient_identity",
            "expires_at",
        ]

    def validate(self, data):
        badge = data["badge"]
        if not badge.is_published:
            raise serializers.ValidationError(
                "Cannot issue assertion for unpublished BadgeClass."
            )
        return data
