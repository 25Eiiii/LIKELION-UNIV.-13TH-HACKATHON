from sqlalchemy import create_engine, text
import os, math
from collections import defaultdict
from datetime import datetime, timezone
from dotenv import load_dotenv
from pathlib import Path
from geopy.distance import geodesic
from typing import Tuple, Dict, Any, Iterable

# 환경변수 로드
env_path = Path(__file__).resolve().parent.parent / "Eiiii" / ".env"
load_dotenv(dotenv_path=env_path)

def get_db_engine():
    return create_engine(
        f"postgresql+psycopg2://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )

# 선호도(카테고리/지역) 계산 헬퍼
# -----------------------------
def _build_user_prefs(conn, user_id: int, cutoff_ts=None, lambda_per_day: float = 0.02):
    """
    cutoff 이전의 (좋아요+리뷰)로부터 유저의 카테고리/지역 선호를 시간감쇠로 집계.
    반환: (pref_cat: dict[str,float], pref_area: dict[str,float])
    """
    cut_clause = "AND created_at < :cutoff" if cutoff_ts else ""
    params = {"uid": user_id}
    if cutoff_ts:
        params["cutoff"] = cutoff_ts

    rows = conn.execute(text(f"""
        WITH inter AS (
            SELECT event_id, created_at FROM details_culturaleventlike
             WHERE user_id = :uid {cut_clause}
            UNION ALL
            SELECT event_id, created_at FROM surveys_surveyreview
             WHERE user_id = :uid {cut_clause}
        )
        SELECT e.codename, e.guname, inter.created_at
          FROM inter
          JOIN search_culturalevent e ON e.id = inter.event_id
         WHERE (e.codename IS NOT NULL OR e.guname IS NOT NULL)
    """), params).fetchall()

    # now 기준: cutoff 있으면 cutoff, 없으면 현재 UTC (둘 다 tz-aware로 통일)
    if isinstance(cutoff_ts, datetime):
        now = cutoff_ts if cutoff_ts.tzinfo else cutoff_ts.replace(tzinfo=timezone.utc)
    else:
        now = datetime.now(timezone.utc)

    cat = defaultdict(float)
    area = defaultdict(float)
    for codename, guname, ts in rows:
        if isinstance(ts, datetime):
            ts_aware = ts if ts.tzinfo else ts.replace(tzinfo=timezone.utc)
            delta_days = max((now - ts_aware).days, 0)
        else:
            delta_days = 0
        w = math.exp(-lambda_per_day * float(delta_days))  # 더 최근일수록 가중↑
        if codename:
            cat[str(codename)] += w
        if guname:
            area[str(guname)] += w

    # 확률 정규화(없으면 빈 dict)
    s_cat = sum(cat.values())
    s_area = sum(area.values())
    pref_cat = {k: v / s_cat for k, v in cat.items()} if s_cat > 0 else {}
    pref_area = {k: v / s_area for k, v in area.items()} if s_area > 0 else {}
    return pref_cat, pref_area


def calculate_activity_scores(
    user_id: int,
    cutoff_ts=None,
    exclude_event_ids: Iterable[int] = None,
    W_DIST: float = 0.6,   # 거리 가중
    W_CAT: float = 0.25,   # 카테고리 선호 가중
    W_AREA: float = 0.15   # 지역 선호 가중
) -> Tuple[Dict[int, float], Dict[int, Dict[str, Any]]]:
    """
    행동 기반 추천 점수 계산(누수 방지 + 선호도 적용)
      - 거리 점수: 10km 이내 1.0, 멀수록 선형감소
      - 선호 점수: cutoff 이전 행동으로 추정한 카테고리/지역 선호(시간감쇠)
      - 직접 가점: 좋아요 +1.0, 리뷰 +2.5~3.0 (단, exclude_event_ids에는 적용하지 않음)

    반환: (scores, details)
      scores  = {event_id: total_score}
      details = {event_id: {...중간항목...}}
    """
    exclude_event_ids = set(exclude_event_ids or [])

    engine = get_db_engine()
    with engine.connect() as conn:
        # 유저 좌표
        row = conn.execute(
            text("SELECT latitude, longitude FROM accounts_customuser WHERE id=:uid"),
            {"uid": user_id}
        ).fetchone()
        if not row or row[0] is None or row[1] is None:
            return {}, {}

        u_lat, u_lon = float(row[0]), float(row[1])

        # 유저 선호(카테고리/지역) 추정
        pref_cat, pref_area = _build_user_prefs(conn, user_id, cutoff_ts=cutoff_ts, lambda_per_day=0.02)

        # 이벤트 메타 + 좌표 로드 (lat/lot 스왑 주의: lot=위도, lat=경도)
        events = conn.execute(text("""
            SELECT
                id,
                title,
                lot AS lat,    -- 위도
                lat AS lon,    -- 경도
                codename,
                guname
            FROM search_culturalevent
            WHERE lat IS NOT NULL AND lot IS NOT NULL
        """)).fetchall()

        scores: Dict[int, float] = {}
        details: Dict[int, Dict[str, Any]] = {}

        # 1) 거리 + 선호 점수
        for eid, title, ev_lat, ev_lon, codename, guname in events:
            try:
                d_km = geodesic((u_lat, u_lon), (float(ev_lat), float(ev_lon))).km
            except Exception:
                # 좌표 이상치면 해당 이벤트 스킵
                continue
            dist_score = max(0.0, 1.0 - d_km / 10.0)

            # 선호(0~1): 없으면 0
            cat_pref = pref_cat.get(str(codename), 0.0)
            area_pref = pref_area.get(str(guname), 0.0)
            pref_score = W_CAT * cat_pref + W_AREA * area_pref

            base = W_DIST * dist_score + pref_score

            scores[eid] = base
            details[eid] = {
                "title": title,
                "distance_score": dist_score,
                "cat_pref": cat_pref,
                "area_pref": area_pref,
                "like_score": 0.0,
                "review_score": 0.0,
                "total_score": base,
            }

        # cutoff 절
        cut_clause = "AND created_at < :cutoff" if cutoff_ts else ""
        params = {"uid": user_id}
        if cutoff_ts:
            params["cutoff"] = cutoff_ts

        # 2) 좋아요 가점 (+1.0) — 좌표 없던 이벤트도 포함(세부정보는 title None)
        like_rows = conn.execute(text(f"""
            SELECT event_id
            FROM details_culturaleventlike
            WHERE user_id = :uid {cut_clause}
        """), params).fetchall()

        for (eid,) in like_rows:
            if eid in exclude_event_ids:
                continue
            if eid not in scores:
                scores[eid] = 0.0
                details[eid] = {
                    "title": None, "distance_score": 0.0,
                    "cat_pref": 0.0, "area_pref": 0.0,
                    "like_score": 0.0, "review_score": 0.0, "total_score": 0.0
                }
            scores[eid] += 1.0
            details[eid]["like_score"] += 1.0
            details[eid]["total_score"] = scores[eid]

        # 3) 리뷰 가점 (+2.0 + 평점 보정)
        review_rows = conn.execute(text(f"""
            SELECT event_id, rating
            FROM surveys_surveyreview
            WHERE user_id = :uid {cut_clause}
        """), params).fetchall()

        for eid, rating in review_rows:
            if eid in exclude_event_ids:
                continue
            if eid not in scores:
                scores[eid] = 0.0
                details[eid] = {
                    "title": None, "distance_score": 0.0,
                    "cat_pref": 0.0, "area_pref": 0.0,
                    "like_score": 0.0, "review_score": 0.0, "total_score": 0.0
                }
            add = 2.0 + (0.5 + 0.1 * float(rating or 0))  # 2.5~3.0
            scores[eid] += add
            details[eid]["review_score"] += add
            details[eid]["total_score"] = scores[eid]

        return scores, details


# 테스트
if __name__ == "__main__":
    user_id = 3
    scores, details = calculate_activity_scores(user_id, cutoff_ts=None)

    # total_score 기준 상위 10개 출력
    sorted_items = sorted(details.items(), key=lambda x: x[1].get("total_score", 0.0), reverse=True)

    print("\n추천 결과 (상위 10개):")
    for rank, (event_id, data) in enumerate(sorted_items[:10], 1):
        print(f"{rank}위. [{data.get('title')}] (ID: {event_id})")
        print(f"      거리점수: {data.get('distance_score', 0.0):.3f}")
        print(f"      좋아요점수: {data.get('like_score', 0.0):.3f}")
        print(f"      리뷰점수: {data.get('review_score', 0.0):.3f}")
        print(f"      총점: {data.get('total_score', 0.0):.3f}\n")
