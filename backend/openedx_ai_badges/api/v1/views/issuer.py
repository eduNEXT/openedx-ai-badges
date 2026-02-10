# certifications/api/views/issuer.py
from rest_framework.generics import RetrieveAPIView
from openedx_ai_badges.models import Issuer
from ..serializers.issuer import IssuerPublicSerializer


class IssuerPublicView(RetrieveAPIView):
    serializer_class = IssuerPublicSerializer
    lookup_field = "slug"
    queryset = Issuer.objects.all()
