from sqlalchemy import create_engine, text
import os, math
from collections import defaultdict
from datetime import datetime, timezone
from dotenv import load_dotenv
from pathlib import Path
from geopy.distance import geodesic
from typing import Tuple, Dict, Any, Iterable, Optional, List
from sqlalchemy import text, bindparam
import numpy as _np

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
    candidate_ids: Optional[Iterable[int]] = None,
    radius_km: float = 20.0,
    bbox_limit: int = 5000,
    W_DIST: float = 0.6,
    W_CAT: float = 0.25,
    W_AREA: float = 0.15
) -> Tuple[Dict[int, float], Dict[int, Dict[str, Any]]]:

    def _haversine_km_vec(lat1, lon1, lat2, lon2):
        R = 6371.0088
        phi1 = _np.radians(lat1); phi2 = _np.radians(lat2)
        dphi = _np.radians(lat2 - lat1); dlmb = _np.radians(lon2 - lon1)
        a = _np.sin(dphi/2.0)**2 + _np.cos(phi1)*_np.cos(phi2)*_np.sin(dlmb/2.0)**2
        return 2*R*_np.arcsin(_np.sqrt(a))

    exclude_event_ids = set(exclude_event_ids or [])
    cand_set = set(int(x) for x in candidate_ids) if candidate_ids else None
    if candidate_ids is not None and not cand_set:
        return {}, {}

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

        # 선호도
        pref_cat, pref_area = _build_user_prefs(conn, user_id, cutoff_ts=cutoff_ts, lambda_per_day=0.02)

        # bbox
        lat_min, lat_max, lon_min, lon_max = _bbox_params(u_lat, u_lon, radius_km)

        base_sql = """
            SELECT
                id,
                title,
                -- lot=위도, lat=경도 (문자/숫자 모두 안전 처리)
                CASE WHEN lot::text ~ '^-?[0-9]+(\\.[0-9]+)?$' THEN lot::double precision ELSE NULL END AS lat,
                CASE WHEN lat::text ~ '^-?[0-9]+(\\.[0-9]+)?$' THEN lat::double precision ELSE NULL END AS lon,
                codename,
                guname
            FROM search_culturalevent
            WHERE lot IS NOT NULL AND lat IS NOT NULL
                AND lot::text ~ '^-?[0-9]+(\\.[0-9]+)?$'
                AND lat::text ~ '^-?[0-9]+(\\.[0-9]+)?$'
                AND (lot::double precision) BETWEEN :lat_min AND :lat_max   -- 위도
                AND (lat::double precision) BETWEEN :lon_min AND :lon_max   -- 경도
        """

        params = {
            "lat_min": float(lat_min), "lat_max": float(lat_max),
            "lon_min": float(lon_min), "lon_max": float(lon_max),
            "bbox_limit": int(bbox_limit),
        }

        # candidate_ids 교집합을 DB 쿼리 단계에서 적용
        sql = base_sql
        if cand_set:
            ids = list(cand_set)
            ph = ", ".join([f":id{i}" for i in range(len(ids))]) or ":id0"
            sql += f" AND id IN ({ph})"
            for i, v in enumerate(ids):
                params[f"id{i}"] = int(v)

        sql += " ORDER BY id LIMIT :bbox_limit"

        rows = conn.execute(text(sql), params).fetchall()


        if not rows:
            if cand_set:
                return ({eid: 0.0 for eid in cand_set},
                        {eid: {"title": None, "total_score": 0.0} for eid in cand_set})
            return {}, {}

        # 거리/선호 벡터화
        arr = _np.array(rows, dtype=object)
        eids    = arr[:, 0].astype(int)
        titles  = arr[:, 1]
        ev_lats = arr[:, 2].astype(float)
        ev_lons = arr[:, 3].astype(float)
        ev_codes = _np.vectorize(lambda x: str(x) if x is not None else "")(arr[:, 4])
        ev_areas = _np.vectorize(lambda x: str(x) if x is not None else "")(arr[:, 5])

        dists = _haversine_km_vec(u_lat, u_lon, ev_lats, ev_lons)
        dist_scores = _np.clip(1.0 - (dists / 10.0), 0.0, 1.0)

        get_cat = _np.vectorize(lambda k: float(pref_cat.get(k, 0.0)))
        get_area = _np.vectorize(lambda k: float(pref_area.get(k, 0.0)))
        cat_pref_v  = get_cat(ev_codes)
        area_pref_v = get_area(ev_areas)

        pref_scores = W_CAT * cat_pref_v + W_AREA * area_pref_v
        base_scores = W_DIST * dist_scores + pref_scores

        scores: Dict[int, float] = {int(e): float(s) for e, s in zip(eids, base_scores)}
        details: Dict[int, Dict[str, Any]] = {
            int(e): {
                "title": t,
                "distance_score": float(ds),
                "cat_pref": float(cp),
                "area_pref": float(ap),
                "like_score": 0.0,
                "review_score": 0.0,
                "total_score": float(bs),
            }
            for e, t, ds, cp, ap, bs in zip(eids, titles, dist_scores, cat_pref_v, area_pref_v, base_scores)
        }

        # cutoff
        cut_clause = "AND created_at < :cutoff" if cutoff_ts else ""
        q_params = {"uid": user_id}
        if cutoff_ts:
            q_params["cutoff"] = cutoff_ts

        # 좋아요 가점 (+1.0)
        if cand_set:
            like_stmt = text(f"""
                SELECT event_id
                  FROM details_culturaleventlike
                 WHERE user_id = :uid {(' ' + cut_clause if cut_clause else '')}
                   AND event_id IN :cand_ids
            """).bindparams(bindparam("cand_ids", expanding=True))
            like_params = {**q_params, "cand_ids": list(cand_set)}
        else:
            like_stmt = text(f"""
                SELECT event_id
                  FROM details_culturaleventlike
                 WHERE user_id = :uid {(' ' + cut_clause if cut_clause else '')}
            """)
            like_params = q_params

        for (eid,) in conn.execute(like_stmt, like_params).fetchall():
            if eid in exclude_event_ids:
                continue
            scores.setdefault(eid, 0.0)
            d = details.setdefault(eid, {
                "title": None, "distance_score": 0.0, "cat_pref": 0.0, "area_pref": 0.0,
                "like_score": 0.0, "review_score": 0.0, "total_score": 0.0
            })
            scores[eid] += 1.0
            d["like_score"] += 1.0
            d["total_score"] = scores[eid]

        # 리뷰 가점 (+2.0 + 평점 보정)
        if cand_set:
            review_stmt = text(f"""
                SELECT event_id, rating
                  FROM surveys_surveyreview
                 WHERE user_id = :uid {(' ' + cut_clause if cut_clause else '')}
                   AND event_id IN :cand_ids
            """).bindparams(bindparam("cand_ids", expanding=True))
            review_params = {**q_params, "cand_ids": list(cand_set)}
        else:
            review_stmt = text(f"""
                SELECT event_id, rating
                  FROM surveys_surveyreview
                 WHERE user_id = :uid {(' ' + cut_clause if cut_clause else '')}
            """)
            review_params = q_params

        for eid, rating in conn.execute(review_stmt, review_params).fetchall():
            if eid in exclude_event_ids:
                continue
            scores.setdefault(eid, 0.0)
            d = details.setdefault(eid, {
                "title": None, "distance_score": 0.0, "cat_pref": 0.0, "area_pref": 0.0,
                "like_score": 0.0, "review_score": 0.0, "total_score": 0.0
            })
            add = 2.0 + (0.5 + 0.1 * float(rating or 0))  # 2.5~3.0
            scores[eid] += add
            d["review_score"] += add
            d["total_score"] = scores[eid]

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