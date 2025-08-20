from typing import List
from django.db.models import (
    Case, When, Value, F, Q, Count, OuterRef, Subquery,
    IntegerField, FloatField, ExpressionWrapper
)
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, permissions
from django.core.paginator import Paginator

from search.models import CulturalEvent
from .serializers import RecommendedEventSerializer
from recommend.algo import hybrid_recommend
from details.models import CulturalEventLike
from surveys.models import SurveyReview

# ─────────────────────────────────────────────────────────────────────────────
# 메인화면 (그리드용 추천 목록) — 기존 형식 유지
# ─────────────────────────────────────────────────────────────────────────────
class RecommendedEventsView(APIView):
    """
    GET /api/recommend/events/?top_n=10&like_w=1.0&review_w=1.5&recent_alpha=0.7&ongoing_bonus=0.5
    - 로그인 사용자 추천 (hybrid)
    - 부족분은 '좋아요+리뷰(가중)' 인기 점수로 폴백
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # 페이지네이션 파라미터(기본값만 사용, 응답은 기존대로 리스트 반환)
        try:
            limit = int(request.query_params.get("limit", 10))
            page  = int(request.query_params.get("page", 1))
        except ValueError:
            return Response({"detail": "limit/page는 숫자여야 합니다."}, status=status.HTTP_400_BAD_REQUEST)
        limit = max(1, min(limit, 50))
        page = max(1, page)

        # 기존 top_n 허용 + 기본은 현재 페이지를 충분히 커버하도록 크게
        user_top_n = int(request.query_params.get("top_n", 0) or 0)
        top_n = max(user_top_n, limit * page * 10)

        # --- 1) 하이브리드 추천
        rec_df = hybrid_recommend(
            user_id=user.id,
            top_n=top_n,
            weights=(0.3, 0.4, 0.3),
            return_components=False,
        )
        picked_ids: List[int] = []
        if rec_df is not None and not rec_df.empty:
            picked_ids = rec_df["id"].dropna().astype(int).tolist()

        # --- 2) 폴백(인기 점수)로 보충
        if len(picked_ids) < top_n:
            need = top_n - len(picked_ids)
            popular_ids = self._get_popular_event_ids_weighted(
                exclude_ids=picked_ids,
                limit=need,
                request=request,
            )
            picked_ids.extend(popular_ids)

        # --- 3) id 순서대로 메타 조회
        if not picked_ids:
            return Response([], status=status.HTTP_200_OK)

        preserved = Case(*[When(id=pk, then=pos) for pos, pk in enumerate(picked_ids)], output_field=IntegerField())
        qs = (
            CulturalEvent.objects
            .filter(id__in=picked_ids)
            .only("id", "title", "main_img", "start_date", "end_date")
            .order_by(preserved)
        )
        data = RecommendedEventSerializer(qs, many=True).data
        # 메인화면은 기존 스펙 유지(배열 그대로 반환)
        return Response(data, status=status.HTTP_200_OK)

    def _get_popular_event_ids_weighted(self, exclude_ids: List[int], limit: int, request) -> List[int]:
        today = timezone.now().date()
        since = today - timezone.timedelta(days=60)

        like_w = float(request.query_params.get("like_w", 1.0))
        review_w = float(request.query_params.get("review_w", 1.5))
        recent_alpha = float(request.query_params.get("recent_alpha", 0.7))
        ongoing_bonus = float(request.query_params.get("ongoing_bonus", 0.5))

        like_all_sq = (CulturalEventLike.objects
            .filter(event=OuterRef("pk"))
            .values("event")
            .annotate(c=Count("*"))
            .values("c")[:1])

        like_recent_sq = (CulturalEventLike.objects
            .filter(event=OuterRef("pk"), created_at__date__gte=since)
            .values("event")
            .annotate(c=Count("*"))
            .values("c")[:1])

        review_all_sq = (SurveyReview.objects
            .filter(event=OuterRef("pk"))
            .values("event")
            .annotate(c=Count("*"))
            .values("c")[:1])

        review_recent_sq = (SurveyReview.objects
            .filter(event=OuterRef("pk"), created_at__date__gte=since)
            .values("event")
            .annotate(c=Count("*"))
            .values("c")[:1])

        base_qs = (
            CulturalEvent.objects
            .exclude(id__in=exclude_ids)
            .filter(end_date__gte=today)
            .annotate(
                like_all=Coalesce(Subquery(like_all_sq, output_field=IntegerField()), Value(0)),
                like_recent=Coalesce(Subquery(like_recent_sq, output_field=IntegerField()), Value(0)),
                review_all=Coalesce(Subquery(review_all_sq, output_field=IntegerField()), Value(0)),
                review_recent=Coalesce(Subquery(review_recent_sq, output_field=IntegerField()), Value(0)),
            )
        )

        blended_like = ExpressionWrapper(
            Value(recent_alpha) * F("like_recent") + Value(1.0 - recent_alpha) * F("like_all"),
            output_field=FloatField()
        )
        blended_review = ExpressionWrapper(
            Value(recent_alpha) * F("review_recent") + Value(1.0 - recent_alpha) * F("review_all"),
            output_field=FloatField()
        )

        is_ongoing = Case(
            When(end_date__gte=today, then=Value(1.0)),
            default=Value(0.0),
            output_field=FloatField()
        )

        scored_qs = (
            base_qs
            .annotate(
                blended_like=blended_like,
                blended_review=blended_review,
                popularity_score=ExpressionWrapper(
                    Value(like_w) * F("blended_like")
                    + Value(review_w) * F("blended_review")
                    + Value(ongoing_bonus) * is_ongoing,
                    output_field=FloatField()
                ),
            )
            .order_by("-popularity_score", "start_date")[:limit]
        )

        ids = list(scored_qs.values_list("id", flat=True))

        if len(ids) < limit:
            remain = limit - len(ids)
            rest_qs = (
                CulturalEvent.objects
                .exclude(id__in=ids + exclude_ids)
                .annotate(
                    like_all=Coalesce(Subquery(like_all_sq, output_field=IntegerField()), Value(0)),
                    review_all=Coalesce(Subquery(review_all_sq, output_field=IntegerField()), Value(0)),
                    popularity_score=ExpressionWrapper(
                        Value(like_w) * F("like_all") + Value(review_w) * F("review_all"),
                        output_field=FloatField()
                    ),
                )
                .order_by("-popularity_score", "-end_date")[:remain]
            )
            ids += list(rest_qs.values_list("id", flat=True))

        return ids


# ─────────────────────────────────────────────────────────────────────────────
# 챗봇 추천(로그인) — Rasa 액션이 기대하는 next/has_more 포함
# ─────────────────────────────────────────────────────────────────────────────
def _format_date(ev):
    start = getattr(ev, "start_date", None)
    end   = getattr(ev, "end_date", None)
    if start and end:
        return f"{start:%Y.%m.%d} ~ {end:%Y.%m.%d}"
    if start:
        return f"{start:%Y.%m.%d}"
    return getattr(ev, "rgst_date", None) or "일정 미정"


class RecommendView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        # === query ===
        try:
            limit = int(request.GET.get("limit", 3))
            page  = int(request.GET.get("page", 1))
        except ValueError:
            return Response({"detail": "limit/page는 숫자여야 합니다."}, status=400)

        limit = max(1, min(limit, 50))
        page  = max(1, page)

        area     = request.GET.get("area")        # 예: 성북구
        category = request.GET.get("category")    # 예: 전시/미술
        debug    = request.GET.get("__debug")     # "1"이면 디버그 정보 포함
        force    = request.GET.get("__force")     # "filter"면 필터 우선 강제
        # 선택: top_n 오버라이드(있으면 사용)
        user_top_n = int(request.GET.get("top_n", 0) or 0)

        debug_info = {"area": area, "category": category, "limit": limit, "page": page}

        # === 0) filter-only 강제 모드(문제 분리) ===
        if force == "filter":
            qs = CulturalEvent.objects.all()
            if area:
                qs = qs.filter(Q(guname__icontains=area) | Q(place__icontains=area))
            if category:
                qs = qs.filter(Q(category__icontains=category) | Q(codename__icontains=category))
            qs = qs.order_by("-start_date", "-rgst_date", "-id")

            paginator = Paginator(qs, limit)
            page_obj = paginator.get_page(page)

            results = [{
                "id": ev.id,
                "title": ev.title or "제목 없음",
                "place": ev.place or "장소 미정",
                "date": _format_date(ev),
                "url": ev.hmpg_addr or None,
            } for ev in page_obj.object_list]

            has_more  = page_obj.has_next()
            next_page = (page + 1) if has_more else None

            payload = {
                "results": results,
                "total": paginator.count,
                "limit": limit,
                "page": page,
                "has_more": has_more,       # alias
                "has_next": has_more,       # alias(기존 클라 호환)
                "next_page": next_page,     # 사람 친화
                "next": next_page,          # Rasa 액션 호환 키 (data.get("next"))
                "returned": len(results),   # 디버깅 편의
            }
            if debug == "1":
                payload["__debug"] = {
                    **debug_info,
                    "mode": "filter-only",
                    "db_total": CulturalEvent.objects.count(),
                    "filtered_total": paginator.count,
                }
            return Response(payload, status=200)

        # === 1) 추천 풀 ===
        # 현재 페이지를 충분히 커버하도록 풀을 크게 + 최소 300 보장 + 사용자가 주면 그 값도 반영
        TOP_POOL = max(300, limit * max(page, 1) * 10, user_top_n or 0)
        try:
            rec_df = hybrid_recommend(user_id=user.id, top_n=TOP_POOL, return_components=False)
        except Exception as e:
            rec_df = None
            debug_info["hybrid_error"] = str(e)

        ids_ordered = rec_df["id"].dropna().astype(int).tolist() if (rec_df is not None and not rec_df.empty) else []
        debug_info["rec_ids_len"] = len(ids_ordered)

        # === 2) 교집합(추천풀 ∩ 필터) ===
        qs = CulturalEvent.objects.filter(id__in=ids_ordered) if ids_ordered else CulturalEvent.objects.none()
        if area:
            qs = qs.filter(Q(guname__icontains=area) | Q(place__icontains=area))
        if category:
            qs = qs.filter(Q(category__icontains=category) | Q(codename__icontains=category))

        inter_count = qs.count()
        debug_info["intersection_count"] = inter_count
        debug_info["db_total"] = CulturalEvent.objects.count()

        # 추천 순서 유지
        if ids_ordered and inter_count > 0:
            order_map = {eid: pos for pos, eid in enumerate(ids_ordered)}
            when_list = [When(pk=eid, then=order_map.get(eid, len(ids_ordered))) for eid in qs.values_list("id", flat=True)]
            qs = qs.annotate(_order=Case(*when_list, output_field=IntegerField())).order_by("_order")

        # === 3) 폴백: 교집합 0이면 필터만으로 채우기 ===
        if inter_count == 0:
            fb = CulturalEvent.objects.all()
            if area:
                fb = fb.filter(Q(guname__icontains=area) | Q(place__icontains=area))
            if category:
                fb = fb.filter(Q(category__icontains=category) | Q(codename__icontains=category))
            fb = fb.order_by("-start_date", "-rgst_date", "-id")
            qs = fb
            debug_info["fallback_total"] = qs.count()

        # === 4) 페이지네이션 & 응답 ===
        paginator = Paginator(qs, limit)
        page_obj = paginator.get_page(page)
        results = [{
            "id": ev.id,
            "title": ev.title or "제목 없음",
            "place": ev.place or "장소 미정",
            "date": _format_date(ev),
            "url": ev.hmpg_addr or None,
        } for ev in page_obj.object_list]

        has_more  = page_obj.has_next()
        next_page = (page + 1) if has_more else None

        payload = {
            "results": results,
            "total": paginator.count,
            "limit": limit,
            "page": page,
            "has_more": has_more,       # alias
            "has_next": has_more,       # alias(기존 클라 호환)
            "next_page": next_page,     # 사람 친화
            "next": next_page,          # Rasa 액션 호환 키 (data.get("next"))
            "returned": len(results),   # 디버깅 편의
        }
        if debug == "1":
            payload["__debug"] = debug_info
        return Response(payload, status=200)
