from django.utils.text import slugify
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
        read_only_fields = ["slug", "issuer"]

    def validate(self, data):
        if self.instance and self.instance.is_published:
            raise serializers.ValidationError(
                "Published BadgeClass cannot be modified."
            )
        return data

    def create(self, validated_data):
        if "slug" not in validated_data or not validated_data.get("slug"):
            validated_data["slug"] = slugify(validated_data["name"])
        return super().create(validated_data)
