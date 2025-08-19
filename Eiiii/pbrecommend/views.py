from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from search.models import CulturalEvent
from .serializers import PublicEventCardSerializer

class PublicRecommendView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, *args, **kwargs):
        qs = CulturalEvent.objects.all()

        area = request.query_params.get("area")
        category = request.query_params.get("category")

        # 필터링
        if area:
            qs = qs.filter(guname__icontains=area)

        if category:
            qs = qs.filter(Q(category__icontains=category) | Q(codename__icontains=category))

        # 진행 예정/진행중 필터링
        now = timezone.now().date()
        qs = qs.filter(end_date__gte=now)

        # 인기순 정렬
        qs = qs.annotate(like_count=Count("liked_by")).order_by("-like_count", "start_date")

        # 페이지네이션
        try:
            limit = int(request.query_params.get("limit", 6))
            offset = int(request.query_params.get("offset", 0))
        except ValueError:
            return Response({"detail": "limit/offset must be integers"}, status=status.HTTP_400_BAD_REQUEST)

        total = qs.count()
        page = qs[offset:offset + limit]
        data = PublicEventCardSerializer(page, many=True).data

        # # URL 생성
        # base = request.build_absolute_uri("/")[:-1]
        # for item in data:
        #     item["url"] = f"{base}/events/{item['id']}"

        return Response({"results": data, "total": total})
