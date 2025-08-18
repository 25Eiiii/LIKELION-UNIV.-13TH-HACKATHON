from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from datetime import date, datetime
from .utils import get_monthly_top3_public, get_monthly_top3_for_user

class MonthlyTop3View(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            data = get_monthly_top3_for_user(request.user.id, today=date.today())
            results = data or []                # ✅ None → []
            return Response({
                "month": date.today().strftime("%Y-%m"),
                "count": len(results),          # ✅ len(None) 방지
                "results": results
            }, status=status.HTTP_200_OK)
        except Exception as e:
            # (선택) 로깅 추가 가능
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MonthlyTop3PublicView(APIView):
    authentication_classes = []  # 공개
    permission_classes = []      # 공개

    def get(self, request):
        # ?lat=..&lon=.. (선택), ?month=YYYY-MM (선택)
        lat = request.query_params.get("lat")
        lon = request.query_params.get("lon")
        month_str = request.query_params.get("month")

        try:
            lat = float(lat) if lat is not None else None
            lon = float(lon) if lon is not None else None
        except ValueError:
            return Response({"detail": "lat/lon must be numbers"}, status=status.HTTP_400_BAD_REQUEST)

        ref_date = date.today()
        if month_str:
            try:
                ref_date = datetime.strptime(month_str, "%Y-%m").date().replace(day=1)
            except ValueError:
                return Response({"detail": "month must be YYYY-MM"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            results = get_monthly_top3_public(lat=lat, lon=lon, today=ref_date) or []
            return Response({
                "month": ref_date.strftime("%Y-%m"),
                "count": len(results),
                "results": results
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)