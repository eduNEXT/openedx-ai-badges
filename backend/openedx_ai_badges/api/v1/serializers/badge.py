from rest_framework import serializers
from openedx_ai_badges.models import BadgeClass


class BadgeClassPublicSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    issuer = serializers.SerializerMethodField()

    class Meta:
        model = BadgeClass
        fields = [
            "id",
            "type",
            "name",
            "description",
            "criteria",
            "issuer",
            "skills",
        ]

    def get_id(self, obj):
        return obj.badge_id()

    def get_type(self, obj):
        return "BadgeClass"

    def get_issuer(self, obj):
        return obj.issuer.json_url()


class BadgeClassWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = BadgeClass
        fields = "__all__"

    def validate(self, data):
        if self.instance and self.instance.is_published:
            raise serializers.ValidationError(
                "Published BadgeClass cannot be modified."
            )
        return data
