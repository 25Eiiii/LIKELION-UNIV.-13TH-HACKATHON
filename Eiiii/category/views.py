from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from datetime import date
from search.models import CulturalEvent
from django.db.models import Q

# Create your views here.
class CulturalEventListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        category = request.GET.get("category")
        search = request.GET.get("search")
        today = date.today()

        # 카테고리별 조회 or 전체 조회
        if category:
            events = CulturalEvent.objects.filter(category=category).order_by('start_date')
        else:
            events = CulturalEvent.objects.all().order_by('start_date')

        if search:
            events = events.filter(
                Q(title__icontains=search)
            )

        results = []
        for event in events:
            # 진행 상태 판단
            if event.start_date and event.end_date:
                if event.start_date <= today <= event.end_date:
                    status = "진행 중"
                elif event.start_date > today:
                    status = "진행 예정"
                else:
                    status = "종료"
            else:
                status = "정보 없음"

            results.append({
                "title": event.title,
                "date": event.date,
                "place": event.place,
                "main_img": event.main_img,
                "codename": event.codename,
                "status": status
            })

        return Response({
            "category": category if category else "전체",
            "search": search,
            "count": len(results),
            "results": results
        })