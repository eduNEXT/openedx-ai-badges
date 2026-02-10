from rest_framework import serializers
from ....models import Issuer


class IssuerPublicSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()

    class Meta:
        model = Issuer
        fields = [
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

class IssuerWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issuer
        fields = "__all__"
