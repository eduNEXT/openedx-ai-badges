from rest_framework import serializers


class BadgeClassPublicSerializer(serializers.Serializer):
    """
    Serializer for BadgeClass that returns static JSON data
    without relying on a database model.
    """
    name = serializers.CharField()
    description = serializers.CharField()
    criteria = serializers.JSONField()
    skills = serializers.ListField(child=serializers.CharField())

    def to_representation(self, instance):
        """
        Convert the instance data to the Open Badges v2 format.

        Expected instance structure (dict):
        {
            'id': 'badge URL',
            'name': 'Badge name',
            'description': 'Badge description',
            'criteria': {'narrative': 'criteria text'},
            'skills': ['skill1', 'skill2'],
        }
        """
        data = super().to_representation(instance)
        return data
