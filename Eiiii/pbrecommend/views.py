from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle
from search.models import CulturalEvent
from .serializers import PublicEventCardSerializer
import logging

logger = logging.getLogger(__name__)

class PublicRecommendView(APIView):
    """
    비로그인 추천 API (/api/pbrecommend/public/)
    Query Params:
      - area: str (부분일치, guname|place)
      - category: str (부분일치, category|codename)
      - when: [today, week, weekend, upcoming7]
      - sort: 'rgst_desc'(기본) | 'rgst_asc' | 'popular' | 'start_asc' | 'start_desc'
      - limit: int (기본 6, 1~50)
      - page: int (기본 1, 1 이상)
    """
    authentication_classes = []
    permission_classes = []
    throttle_classes = [AnonRateThrottle]

    # ---------------- helpers ----------------
    def _parse_page_pagination(self, request):
        try:
            limit = int(request.query_params.get("limit", 6))
        except ValueError:
            return None, None, None, Response({"detail": "limit must be an integer"}, status=status.HTTP_400_BAD_REQUEST)
        if limit <= 0:
            return None, None, None, Response({"detail": "limit must be positive"}, status=status.HTTP_400_BAD_REQUEST)
        limit = min(limit, 50)

        try:
            page = int(request.query_params.get("page", 1))
        except ValueError:
            return None, None, None, Response({"detail": "page must be an integer"}, status=status.HTTP_400_BAD_REQUEST)
        if page < 1:
            return None, None, None, Response({"detail": "page must be >= 1"}, status=status.HTTP_400_BAD_REQUEST)

        offset = (page - 1) * limit
        return limit, page, offset, None

    def _apply_time_window(self, qs, when: str):
        today = timezone.localdate()
        if when == "today":
            start, end = today, today
        elif when == "week":
            weekday = today.weekday()  # 0=월
            start = today - timedelta(days=weekday)
            end = start + timedelta(days=6)
        elif when == "weekend":
            weekday = today.weekday()
            saturday = today + timedelta(days=(5 - weekday)) if weekday <= 5 else today
            sunday = saturday + timedelta(days=1)
            start, end = saturday, sunday
        elif when == "upcoming7":
            start, end = today, today + timedelta(days=7)
        else:
            return qs.filter(end_date__gte=today)
        return qs.filter(end_date__gte=start, start_date__lte=end)

    def _order_fields(self, sort: str):
        meta_fields = {f.name for f in CulturalEvent._meta.get_fields()}
        def rgst_desc(): return ["-rgst_date"] if "rgst_date" in meta_fields else ["-id"]
        def rgst_asc():  return ["rgst_date"] if "rgst_date" in meta_fields else ["id"]

        if sort == "popular":
            base = ["-like_count", "start_date"]
            base += ["-rgst_date"] if "rgst_date" in meta_fields else ["-id"]
            return base
        elif sort == "start_asc":
            return ["start_date"] + rgst_desc()
        elif sort == "start_desc":
            return ["-start_date"] + rgst_desc()
        elif sort == "rgst_asc":
            return rgst_asc()
        else:
            return rgst_desc()  # 기본: 등록일 최신순

    # ---------------- GET ----------------
    def get(self, request, *args, **kwargs):
        logger.info("[PublicRecommend] params=%s", dict(request.query_params))

        qs = CulturalEvent.objects.all()

        # 파라미터
        area = request.query_params.get("area")
        category = request.query_params.get("category")
        when = request.query_params.get("when")
        sort = request.query_params.get("sort", "rgst_desc")

        # 지역/카테고리
        if area:
            area = area.strip()
            qs = qs.filter(Q(guname__icontains=area) | Q(place__icontains=area))
        if category:
            cat = category.strip()
            qs = qs.filter(Q(category__icontains=cat) | Q(codename__icontains=cat))

        # 날짜
        qs = self._apply_time_window(qs, when) if when else qs.filter(end_date__gte=timezone.localdate())

        # 정렬
        if sort == "popular":
            qs = qs.annotate(like_count=Count("liked_by")).order_by(*self._order_fields(sort))
        else:
            qs = qs.order_by(*self._order_fields(sort))

        # 페이지네이션(page 기반) + 마지막 페이지 병합(fold)
        limit, page, offset, error_resp = self._parse_page_pagination(request)
        if error_resp:
            return error_resp

        total = qs.count()

        end_nominal = offset + limit
        has_more = end_nominal < total               # fold 이전 기준으로 has_more 결정
        next_page = page + 1 if has_more else None

        start = offset
        end = end_nominal
        if has_more:
            remaining = total - end_nominal
            if remaining < limit:
                end = total  # 마지막 “찌꺼기”를 현재 페이지에 붙여줌
        else:
            end = min(end_nominal, total)

        slice_qs = qs[start:end]
        data = PublicEventCardSerializer(slice_qs, many=True).data

        # 원시 날짜 포함
        by_id = {obj.id: obj for obj in slice_qs}
        for item in data:
            obj = by_id.get(item.get("id"))
            if obj:
                item.setdefault("start_date_raw", obj.start_date)
                item.setdefault("end_date_raw", obj.end_date)

        resp = {
            "results": data,
            "total": total,
            "limit": limit,
            "page": page,
            "has_more": has_more,
            "next_page": next_page,
            "next": next_page,        # 클라이언트 호환 키
            "returned": len(data),    # 디버깅용
            "meta": {"sort": sort, "when": when},
        }
        return Response(resp, status=status.HTTP_200_OK)
