# certifications/api/views/assertion.py
from rest_framework.generics import RetrieveAPIView
from openedx_ai_badges.models import BadgeAssertion
from ..serializers.assertion import AssertionPublicSerializer


class AssertionPublicView(RetrieveAPIView):
    serializer_class = AssertionPublicSerializer
    lookup_field = "id"
    queryset = BadgeAssertion.objects.all()
