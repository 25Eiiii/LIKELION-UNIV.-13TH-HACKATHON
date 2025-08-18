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
from rest_framework import status

from search.models import CulturalEvent
from .serializers import RecommendedEventSerializer
from recommend.algo import hybrid_recommend
from details.models import CulturalEventLike
from surveys.models import SurveyReview

class RecommendedEventsView(APIView):
    """
    GET /api/recommend/events/?top_n=10&like_w=1.0&review_w=1.5&recent_alpha=0.7&ongoing_bonus=0.5
    - 로그인 사용자 추천 (hybrid)
    - 부족분은 '좋아요+리뷰(가중)' 인기 점수로 폴백
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        top_n = int(request.query_params.get("top_n", 10))

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
        return Response(data, status=status.HTTP_200_OK)

    def _get_popular_event_ids_weighted(self, exclude_ids: List[int], limit: int, request) -> List[int]:
        """
        '좋아요 + 리뷰 수(가중치)'로 인기 점수(popularity_score) 산정.
        - 최근 가중(recent_alpha): recent 60일치에 비중을 더 줌 (0~1)
        - 진행/예정 이벤트 보너스(ongoing_bonus) 추가
        - 역참조 이름에 의존하지 않도록 Subquery로 안전 계산
        """
        today = timezone.now().date()
        since = today - timezone.timedelta(days=60)

        # 쿼리 파라미터로 가중치 조절 가능 (기본값 권장)
        like_w = float(request.query_params.get("like_w", 1.0))
        review_w = float(request.query_params.get("review_w", 1.5))
        recent_alpha = float(request.query_params.get("recent_alpha", 0.7))  # 최근 60일 비중
        ongoing_bonus = float(request.query_params.get("ongoing_bonus", 0.5))  # 진행/예정 보너스

        # --- Subquery: 좋아요 수 (전체/최근)
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

        # --- Subquery: 리뷰 수 (전체/최근)
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
            # 진행/예정 우선. 지나간 것도 필요하면 아래 필터를 빼고 all에서 추가 보충
            .filter(end_date__gte=today)
            .annotate(
                like_all=Coalesce(Subquery(like_all_sq, output_field=IntegerField()), Value(0)),
                like_recent=Coalesce(Subquery(like_recent_sq, output_field=IntegerField()), Value(0)),
                review_all=Coalesce(Subquery(review_all_sq, output_field=IntegerField()), Value(0)),
                review_recent=Coalesce(Subquery(review_recent_sq, output_field=IntegerField()), Value(0)),
            )
        )

        # 최근/전체 블렌딩: blended = recent_alpha*recent + (1-recent_alpha)*all
        blended_like = ExpressionWrapper(
            Value(recent_alpha) * F("like_recent") + Value(1.0 - recent_alpha) * F("like_all"),
            output_field=FloatField()
        )
        blended_review = ExpressionWrapper(
            Value(recent_alpha) * F("review_recent") + Value(1.0 - recent_alpha) * F("review_all"),
            output_field=FloatField()
        )

        # 진행/예정 보너스
        is_ongoing = Case(
            When(end_date__gte=today, then=Value(1.0)),
            default=Value(0.0),
            output_field=FloatField()
        )

        # 최종 인기 점수: like_w*blended_like + review_w*blended_review + ongoing_bonus*is_ongoing
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

        # 진행/예정이 너무 적다면: 전체에서 추가 보충
        if len(ids) < limit:
            remain = limit - len(ids)

            rest_qs = (
                CulturalEvent.objects
                .exclude(id__in=ids + exclude_ids)
                .annotate(
                    like_all=Coalesce(Subquery(like_all_sq, output_field=IntegerField()), Value(0)),
                    review_all=Coalesce(Subquery(review_all_sq, output_field=IntegerField()), Value(0)),
                    # 전체 영역에서는 최근 가중 없이 간단히 누적만 사용
                    popularity_score=ExpressionWrapper(
                        Value(like_w) * F("like_all") + Value(review_w) * F("review_all"),
                        output_field=FloatField()
                    ),
                )
                .order_by("-popularity_score", "-end_date")[:remain]
            )
            ids += list(rest_qs.values_list("id", flat=True))

        return ids