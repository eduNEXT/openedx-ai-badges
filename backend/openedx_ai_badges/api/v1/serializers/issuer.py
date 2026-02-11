from rest_framework import serializers
from ....models import Issuer


class IssuerPublicSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    context = serializers.SerializerMethodField()

    class Meta:
        model = Issuer
        fields = [
            "context",
            "id",
            "type",
            "name",
            "url",
            "email",
            "description",
        ]

    def get_id(self, obj):
        return obj.json_url()

    def get_type(self, obj):
        return "Issuer"

    def get_context(self, obj):
        return "https://w3id.org/openbadges/v2"

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['@context'] = data.pop('context')
        return data

class IssuerWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issuer
        fields = "__all__"
