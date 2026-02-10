from rest_framework.generics import RetrieveAPIView
from openedx_ai_badges.models import BadgeClass
from ..serializers.badge import BadgeClassPublicSerializer


class BadgeClassPublicView(RetrieveAPIView):
    serializer_class = BadgeClassPublicSerializer

    def get_queryset(self):
        return BadgeClass.objects.filter(is_published=True)

    def get_object(self):
        slug = self.kwargs["slug"]
        version = self.kwargs["version"]

        return self.get_queryset().get(
            slug=slug,
            version=version
        )
