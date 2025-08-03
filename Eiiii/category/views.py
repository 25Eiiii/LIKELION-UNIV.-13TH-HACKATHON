from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from datetime import date
from search.models import CulturalEvent

# Create your views here.
class CulturalEventListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        category = request.GET.get("category")
        today = date.today()

        if not category:
            return Response({"error": "category 파라미터를 입력해주세요."}, status=400)

        events = CulturalEvent.objects.filter(category=category).order_by('start_date')

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
            "category": category,
            "count": len(results),
            "results": results
        })