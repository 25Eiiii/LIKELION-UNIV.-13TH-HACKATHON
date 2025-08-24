from typing import List
from django.db.models import (
    Case, When, Value, F, Q, Count, OuterRef, Subquery,
    IntegerField, FloatField, ExpressionWrapper
)
from django.db.models.functions import Coalesce
from django.utils import timezone
from .utils_meta import fetch_events_meta_preserve_order, to_items
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
from surveys.models import SurveySubmission
from .similar_from_anchor import similar_to_event_df

import pandas as pd

from django.core.cache import cache
from django.core.paginator import Paginator

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

    CACHE_TTL_SEC = 600            # 캐시 유지 시간
    CACHE_VER     = "v1"          # 캐시 키 버전(구조 바뀔 때만 올리면 됨)

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

        area       = request.GET.get("area")        # 예: 성북구
        category   = request.GET.get("category")    # 예: 전시/미술
        debug      = request.GET.get("__debug")     # "1"이면 디버그 정보 포함
        force      = request.GET.get("__force")     # "filter"면 필터 우선 강제
        user_top_n = int(request.GET.get("top_n", 0) or 0)
        cand_limit = int(request.GET.get("cand_limit", 5000))  # 후보군 상한(필요 시 조절)
        bust       = request.GET.get("__bust")      # 캐시 무시하고 강제 재계산(옵션)

        debug_info = {
            "area": area, "category": category,
            "limit": limit, "page": page,
            "cand_limit": cand_limit,
        }

        # === 0) filter-only 강제 모드(문제 분리용) ===
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
                "has_more": has_more,
                "has_next": has_more,
                "next_page": next_page,
                "next": next_page,
                "returned": len(results),
            }
            if debug == "1":
                payload["__debug"] = {
                    **debug_info,
                    "mode": "filter-only",
                    "db_total": CulturalEvent.objects.count(),
                    "filtered_total": paginator.count,
                }
            # 스크롤 중 캐시 만료 연장 (캐시 키가 있을 때만)
            if not bust and ids_ordered is not None:
                try:
                    cache.touch(cache_key, self.CACHE_TTL_SEC)
                except Exception:
                    # 일부 백엔드/버전에선 touch 미지원일 수 있으니, 안전하게 무시
                    pass                
            
            return Response(payload, status=200)

        # === 1) 후보군 id 먼저(필터 적용 후 상한) ===
        fq = CulturalEvent.objects.all().only("id")
        if area:
            fq = fq.filter(Q(guname__icontains=area) | Q(place__icontains=area))
        if category:
            fq = fq.filter(Q(category__icontains=category) | Q(codename__icontains=category))

        candidate_ids = list(fq.values_list("id", flat=True)[:cand_limit])
        debug_info["candidate_total"] = len(candidate_ids)

        # === 2) 캐시 키 구성
        cache_key = f"chatrec:{self.CACHE_VER}:{user.id}:{area or '-'}:{category or '-'}"
        ids_ordered = None if bust else cache.get(cache_key)
        debug_info["cache"] = "hit" if ids_ordered is not None else "miss"

        # === 3) 캐시 미스면 추천 계산 → 정렬된 ID 배열로 캐시
        if ids_ordered is None:
            TOP_POOL = max(300, limit * max(page, 1) * 10, user_top_n or 0, min(len(candidate_ids), cand_limit))
            rec_df = None
            try:
                rec_df = hybrid_recommend(
                    user_id=user.id,
                    top_n=TOP_POOL,
                    weights=(0.3, 0.4, 0.3),   # fast_mode=True면 CF는 내부에서 0으로 처리 또는 캐시 있으면만 반영
                    return_components=False,
                    candidate_ids=candidate_ids,  # 후보군만 스코어링
                    fast_mode=True,               # 즉시 응답용(캐시된 CF 없으면 자동 스킵)
                )
            except Exception as e:
                debug_info["hybrid_error"] = str(e)

            ids_ordered = (
                rec_df["id"].dropna().astype(int).tolist()
                if (rec_df is not None and not rec_df.empty) else []
            )
            debug_info["rec_ids_len"] = len(ids_ordered)

            # 폴백: 추천 비었으면 후보군 최신순으로 정렬된 ID 생성
            if not ids_ordered:
                fb_qs = CulturalEvent.objects.filter(id__in=candidate_ids) if candidate_ids else CulturalEvent.objects.none()
                fb_ids = list(
                    fb_qs.order_by("-start_date", "-rgst_date", "-id")
                         .values_list("id", flat=True)[:cand_limit]
                )
                ids_ordered = fb_ids
                debug_info["fallback_total"] = len(fb_ids)

            # 캐시 저장
            cache.set(cache_key, ids_ordered, self.CACHE_TTL_SEC)

        # === 4) 페이지 슬라이스(IDs 기반) ===
        total = len(ids_ordered)
        start = (page - 1) * limit
        end   = start + limit + 1  # +1로 has_more 판단
        if start >= total:
            # 범위를 벗어난 요청이면 빈 결과 반환
            payload = {
                "results": [],
                "total": total,
                "limit": limit,
                "page": page,
                "has_more": False,
                "has_next": False,
                "next_page": None,
                "next": None,
                "returned": 0,
            }
            if debug == "1":
                payload["__debug"] = {**debug_info, "mode": "hybrid-fast", "slice": [start, end]}
            return Response(payload, status=200)

        page_ids = ids_ordered[start:end]
        has_more = len(page_ids) > limit
        page_ids = page_ids[:limit]

        # === 5) 해당 페이지 ID들만 DB에서 순서 보존 조회 ===
        preserved = Case(
            *[When(id=pk, then=pos) for pos, pk in enumerate(page_ids)],
            output_field=IntegerField(),
        )
        qs = (CulturalEvent.objects
              .filter(id__in=page_ids)
              .only("id", "title", "place", "hmpg_addr", "start_date", "end_date", "rgst_date")
              .order_by(preserved))

        results = [{
            "id": ev.id,
            "title": ev.title or "제목 없음",
            "place": ev.place or "장소 미정",
            "date": _format_date(ev),
            "url": ev.hmpg_addr or None,
        } for ev in qs]

        next_page = (page + 1) if has_more else None

        payload = {
            "results": results,
            "total": total,
            "limit": limit,
            "page": page,
            "has_more": has_more,
            "has_next": has_more,
            "next_page": next_page,
            "next": next_page,
            "returned": len(results),
        }
        if debug == "1":
            payload["__debug"] = {
                **debug_info,
                "mode": "hybrid-fast",
                "slice": [start, end],
            }
        return Response(payload, status=200)

#챗봇 추천

def _nickname(user) -> str:
    return (
        getattr(user, "nickname", None)
    )

class SimilarFromLastParticipationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        nick = _nickname(user)
        LIMIT = 3  # 고정 3개
        explain = str(request.query_params.get("explain","")).lower() in ("1","true","y","yes")

        last = (
            SurveySubmission.objects
            .filter(user=user)
            .select_related("event")
            .order_by("-submitted_at")
            .first()
        )

        if last:
            anchor = last.event
            sim_df = similar_to_event_df(anchor.id, top_n=LIMIT, exclude_past=True, explain=explain)
            if not sim_df.empty:
                items = to_items(
                    sim_df,
                    "score",
                    extra_cols=(["sim_anchor","same_area","same_fee","recency","matched_terms"] if explain else None)
                )
                return Response({
                    "anchor_event": {"id": anchor.id, "title": anchor.title},
                    "message": f"{nick}님 최근 참여하셨던 『{anchor.title}』와 비슷한 행사를 추천해드릴게요",
                    "items": items
                }, status=status.HTTP_200_OK)

        # 폴백(하이브리드)
        hyb = hybrid_recommend(user.id, top_n=LIMIT)
        if hyb is None or hyb.empty:
            return Response({
                "anchor_event": None,
                "message": f"{nick}님 아직 설문 인증 기록이 없어, 프로필/행동/협업 데이터를 바탕으로 추천했어요.",
                "items": []
            }, status=status.HTTP_200_OK)

        ids = hyb["id"].astype(int).tolist()
        meta = fetch_events_meta_preserve_order(ids)
        merged = meta.merge(hyb[["id","title","score"]], on=["id","title"], how="left")
        items = to_items(merged, "score")
        return Response({
            "anchor_event": None,
            "message": f"{nick}님 아직 설문 인증 기록이 없어, 프로필/행동/협업 데이터를 바탕으로 추천했어요.",
            "items": items
        }, status=status.HTTP_200_OK)
