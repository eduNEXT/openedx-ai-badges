from rest_framework.generics import RetrieveAPIView
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
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

def badge_svg_view(request, slug):
    badge = get_object_or_404(BadgeClass, slug=slug)

    svg = f"""
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 600 700"
        width="600"
        height="700"
      >

        <path
          d="M100 120
            Q300 -40 500 120
            V420
            Q300 620 100 420
            Z"
          fill="#ffffff"
          stroke="#000000"
          stroke-width="12"
        />

        <path
          d="M140 150
            Q300 -10 460 150
            V390
            Q300 560 140 390
            Z"
          fill="#ffffff"
          stroke="#000000"
          stroke-width="6"
        />

        <path
          d="M60 310
            H540
            V380
            H60
            Z"
          fill="#ffffff"
          stroke="#000000"
          stroke-width="10"
        />

        <text
          x="300"
          y="355"
          text-anchor="middle"
          dominant-baseline="middle"
          font-family="Arial, Helvetica, sans-serif"
          font-size="32"
          font-weight="bold"
          fill="#000000"
        >
          {badge.name}
        </text>

      </svg>
    """

    return HttpResponse(svg, content_type="image/svg+xml")
