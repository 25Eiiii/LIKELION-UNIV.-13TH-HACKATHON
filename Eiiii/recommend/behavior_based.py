from sqlalchemy import create_engine, text
import os, math
from collections import defaultdict
from datetime import datetime, timezone
from dotenv import load_dotenv
from pathlib import Path
from geopy.distance import geodesic
from typing import Tuple, Dict, Any, Iterable, Optional, List

# 환경변수 로드
env_path = Path(__file__).resolve().parent.parent / "Eiiii" / ".env"
load_dotenv(dotenv_path=env_path)

def get_db_engine():
    return create_engine(
        f"postgresql+psycopg2://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )

# ─────────────────────────────────────────────────────────────────────────────
# 선호도(카테고리/지역) 계산 헬퍼
# ─────────────────────────────────────────────────────────────────────────────
def _build_user_prefs(conn, user_id: int, cutoff_ts=None, lambda_per_day: float = 0.02):
    """
    cutoff 이전의 (좋아요+리뷰)로부터 유저의 카테고리/지역 선호를 시간감쇠로 집계.
    반환: (pref_cat: dict[str,float], pref_area: dict[str,float])
    """
    cut_clause = "AND created_at < :cutoff" if cutoff_ts else ""
    params = {"uid": user_id}
    if cutoff_ts:
        params["cutoff"] = cutoff_ts

    rows = conn.execute(
        text(
            f"""
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
            """
        ),
        params,
    ).fetchall()

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

# ─────────────────────────────────────────────────────────────────────────────
# bbox(근사 반경) 유틸
# ─────────────────────────────────────────────────────────────────────────────
def _bbox_params(u_lat: float, u_lon: float, radius_km: float):
    """
    근사 bounding box 계산 (한국 위도대 기준으로 오차 작음)
    """
    dlat = radius_km / 111.0
    denom = 111.0 * max(0.2, math.cos(math.radians(u_lat)))  # 0으로 나누기 방지
    dlon = radius_km / denom
    return (u_lat - dlat, u_lat + dlat, u_lon - dlon, u_lon + dlon)

def _append_in_clause(sql_base: str, col: str, ids: List[int]) -> tuple[str, dict]:
    """SQL 끝에 AND col IN (:e0, :e1, ...) 을 붙이고 파라미터 dict를 반환"""
    if not ids:
        return sql_base, {}
    ph = ", ".join([f":e{i}" for i in range(len(ids))])
    return sql_base + f" AND {col} IN ({ph})", {f"e{i}": int(v) for i, v in enumerate(ids)}

# ─────────────────────────────────────────────────────────────────────────────
# 행동 기반 점수 (후보 축소 + bbox)
# ─────────────────────────────────────────────────────────────────────────────
def calculate_activity_scores(
    user_id: int,
    cutoff_ts=None,
    exclude_event_ids: Iterable[int] = None,
    *,
    candidate_ids: Optional[Iterable[int]] = None,   # 후보가 있으면 그 집합만
    radius_km: float = 20.0,                         # 근사 반경(10~30 추천)
    bbox_limit: int = 5000,                          # bbox 상한
    W_DIST: float = 0.6,   # 거리 가중
    W_CAT: float = 0.25,   # 카테고리 선호 가중
    W_AREA: float = 0.15   # 지역 선호 가중
) -> Tuple[Dict[int, float], Dict[int, Dict[str, Any]]]:

    exclude_event_ids = set(exclude_event_ids or [])
    cand_set = set(int(x) for x in candidate_ids) if candidate_ids else None

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

        # 1) 후보 이벤트 1차 컷 (근사 bounding box)
        lat_min, lat_max, lon_min, lon_max = _bbox_params(u_lat, u_lon, radius_km)

        # ⚠️ DB 컬럼 주의: lot=위도(lat), lat=경도(lon)
        base_sql = """
            SELECT id, title, lot AS lat, lat AS lon, codename, guname
              FROM search_culturalevent
             WHERE lot IS NOT NULL AND lat IS NOT NULL
               AND lot BETWEEN :lat_min AND :lat_max   -- 위도
               AND lat BETWEEN :lon_min AND :lon_max   -- 경도
             LIMIT :bbox_limit
        """
        params = {
            "lat_min": lat_min, "lat_max": lat_max,
            "lon_min": lon_min, "lon_max": lon_max,
            "bbox_limit": bbox_limit,
        }

        # candidate_ids 교집합을 DB 쿼리 단계에서 적용
        if cand_set:
            ids = list(cand_set)
            ph = ", ".join([f":id{i}" for i in range(len(ids))]) or ":id0"
            in_clause = f" AND id IN ({ph}) "
            base_sql = base_sql.replace("LIMIT :bbox_limit", in_clause + "LIMIT :bbox_limit")
            for i, v in enumerate(ids):
                params[f"id{i}"] = int(v)

        rows = conn.execute(text(base_sql), params).fetchall()

        if not rows:
            if cand_set:
                return ({eid: 0.0 for eid in cand_set},
                        {eid: {"title": None, "total_score": 0.0} for eid in cand_set})
            return {}, {}

        scores: Dict[int, float] = {}
        details: Dict[int, Dict[str, Any]] = {}

        # 2) 거리 + 선호 점수
        for eid, title, ev_lat, ev_lon, codename, guname in rows:
            try:
                d_km = geodesic((u_lat, u_lon), (float(ev_lat), float(ev_lon))).km
            except Exception:
                continue
            dist_score = max(0.0, 1.0 - d_km / 10.0)

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
        q_params = {"uid": user_id}
        if cutoff_ts:
            q_params["cutoff"] = cutoff_ts

        # 3) 좋아요 가점 (+1.0)  —— IN 필터 SQL 단계에서 적용
        like_sql = f"""
            SELECT event_id
              FROM details_culturaleventlike
             WHERE user_id = :uid {cut_clause}
        """
        like_extra = {}
        if cand_set:
            like_sql, like_extra = _append_in_clause(like_sql, "event_id", list(cand_set))

        like_rows = conn.execute(text(like_sql), {**q_params, **like_extra}).fetchall()

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

        # 4) 리뷰 가점 (+2.0 + 평점 보정) —— IN 필터 SQL 단계에서 적용
        review_sql = f"""
            SELECT event_id, rating
              FROM surveys_surveyreview
             WHERE user_id = :uid {cut_clause}
        """
        review_extra = {}
        if cand_set:
            review_sql, review_extra = _append_in_clause(review_sql, "event_id", list(cand_set))

        review_rows = conn.execute(text(review_sql), {**q_params, **review_extra}).fetchall()

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
    scores, details = calculate_activity_scores(user_id, cutoff_ts=None, radius_km=20.0)
    sorted_items = sorted(details.items(), key=lambda x: x[1].get("total_score", 0.0), reverse=True)

    print("\n추천 결과 (상위 10개):")
    for rank, (event_id, data) in enumerate(sorted_items[:10], 1):
        print(f"{rank}위. [{data.get('title')}] (ID: {event_id})")
        print(f"      거리점수: {data.get('distance_score', 0.0):.3f}")
        print(f"      좋아요점수: {data.get('like_score', 0.0):.3f}")
        print(f"      리뷰점수: {data.get('review_score', 0.0):.3f}")
        print(f"      총점: {data.get('total_score', 0.0):.3f}\n")
