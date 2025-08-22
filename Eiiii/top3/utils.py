from datetime import date, datetime
from zoneinfo import ZoneInfo
from geopy.distance import geodesic
from geopy.point import Point
from datetime import date as _date, datetime as _dt
from sqlalchemy import text, bindparam
from math import log1p, exp

from recommend.behavior_based import calculate_activity_scores
from .helpers import get_db_engine, parse_date_string, overlaps_month, to_date

def _fetch_user_location(conn, user_id: int):
    row = conn.execute(
        text("SELECT latitude, longitude FROM accounts_customuser WHERE id = :uid"),
        {"uid": user_id}
    ).fetchone()
    # 좌표가 하나라도 None이면 위치 정보 없다고 처리
    if not row or row[0] is None or row[1] is None:
        return None, None
    try:
        return float(row[0]), float(row[1])
    except:
        return None, None

def normalize_lat_lon(lat_raw, lon_raw):
    """
    위도/경도 뒤바뀜을 자동 보정.
    - 위도 합법 범위: [-90, 90], 경도 합법 범위: [-180, 180]
    - 케이스:
        1) (lat, lon) 둘 다 합법 → 그대로
        2) lat는 불법, lon은 위도 범위 / lat는 경도 범위 → 스왑
        3) 하나라도 숫자 변환 실패나 범위 크게 벗어남 → (None, None)
    """
    try:
        lat = float(lat_raw) if lat_raw is not None else None
        lon = float(lon_raw) if lon_raw is not None else None
    except Exception:
        return None, None

    def valid_lat(x): return x is not None and -90.0 <= x <= 90.0
    def valid_lon(x): return x is not None and -180.0 <= x <= 180.0

    if valid_lat(lat) and valid_lon(lon):
        return lat, lon
    # 뒤바뀐 패턴: lat가 경도 범위, lon이 위도 범위일 때
    if valid_lon(lat) and valid_lat(lon):
        return lon, lat
    # 둘 다 이상하면 사용하지 않음
    return None, None

def _fetch_event_meta(conn, event_ids: list[int]):
    if not event_ids:
        return {}
    stmt = text("""
        SELECT
            id,
            title,
            -- lot는 위도, lat는 경도. 숫자인 경우에만 실수로 캐스팅
            CASE WHEN lot::text ~ '^-?[0-9]+(\\.[0-9]+)?$' THEN lot::double precision ELSE NULL END AS lat,
            CASE WHEN lat::text ~ '^-?[0-9]+(\\.[0-9]+)?$' THEN lat::double precision ELSE NULL END AS lon,
            place, codename, main_img, date, start_date, end_date
        FROM search_culturalevent
        WHERE id IN :ids
    """).bindparams(bindparam("ids", expanding=True))

    rows = conn.execute(stmt, {"ids": tuple(event_ids)}).fetchall()

    meta = {}
    for r in rows:
        (eid, title, lat, lon, place, codename, main_img, date_text, start_date, end_date) = r
        meta[eid] = {
            "title": title, "lat": lat, "lon": lon, "place": place,
            "codename": codename, "main_img": main_img, "date_text": date_text,
            "start_date": start_date, "end_date": end_date,
        }
    return meta


def _f(x, default=0.0) -> float:
    try:
        return float(x) if x is not None else float(default)
    except:
        return float(default)

def get_monthly_top3_for_user(user_id: int, today: date | None = None):
    """
    1) behavior_based.calculate_activity_scores() 결과 수신
    2) 이벤트 메타/좌표 재조회
    3) (필요시) 거리 점수 보정: wrong_distance -> correct_distance
    4) 이달 필터 후 TOP3 반환
    """
    # 1) behavior_based 호출 (수정 금지)
    result = calculate_activity_scores(user_id)

    # behavior_based가 (scores, details)를 반환한다고 가정하되,
    # 예외적으로 {}가 올 수도 있으니 방어코드
    if not isinstance(result, tuple) or len(result) != 2:
        return []  # 위치 미등록 등 케이스 → 빈 리스트

    scores, details = result
    if not details:
        return []

    # 준비
    KST = ZoneInfo("Asia/Seoul")
    now = datetime.now(KST).date() if today is None else today
    y, m = now.year, now.month

    engine = get_db_engine()
    with engine.connect() as conn:
        # 2) 메타 조회
        event_ids = list(details.keys())
        meta = _fetch_event_meta(conn, event_ids)

        # 유저 좌표(보정용)
        user_lat, user_lon = _fetch_user_location(conn, user_id)

    # 결과 구성(+ 거리 보정)
    enriched = []
    for eid, d in details.items():
        md = meta.get(eid)
        if not md:
            continue

        # 날짜 구하기
        sd = md.get("start_date")
        ed = md.get("end_date")
        if (sd is None and ed is None) and md.get("date_text"):
            sd, ed = parse_date_string(md["date_text"])

        # 3) 거리 점수 보정
        corrected_distance = _f(d.get("distance_score"))
        distance_km = None
        if (user_lat is not None and user_lon is not None
                and md.get("lat") is not None and md.get("lon") is not None):
            try:
                ev_lat, ev_lon = normalize_lat_lon(md["lat"], md["lon"])
                u_lat, u_lon = normalize_lat_lon(user_lat, user_lon)
                if ev_lat is not None and ev_lon is not None and u_lat is not None and u_lon is not None:
                    km = geodesic((u_lat, u_lon), (ev_lat, ev_lon)).km
                else:
                    km = None
                corrected_distance = max(0.0, 1.0 - km / 10.0)
                distance_km = round(km, 2)
            except:
                pass

        # total 보정
        original_total = _f(d.get("total_score"))
        original_distance = _f(d.get("distance_score"))
        corrected_total = original_total - original_distance + corrected_distance

        # 이달 필터
        if not overlaps_month(sd, ed, y, m):
            continue

        enriched.append({
            "id": eid,
            "title": md.get("title", d.get("title")),
            "place": md.get("place"),
            "main_img": md.get("main_img"),
            "date_text": md.get("date_text"),
            "start_date": sd,
            "end_date": ed,
            "metrics": {
                "distance_km": distance_km
            },
            "scores": {
                "distance": round(corrected_distance, 3),
                "like": round(_f(d.get("like_score")), 3),
                "review": round(_f(d.get("review_score")), 3),
                "total": round(corrected_total, 3),
            }
        })

    # 4) TOP3
    def _to_date(x):
        if isinstance(x, _date): return x
        if isinstance(x, str):
            for fmt in ("%Y-%m-%d", "%Y.%m.%d", "%Y/%m/%d"):
                try:
                    return _dt.strptime(x, fmt).date()
                except:
                    pass
        return None

    def _safe_date(x):
        d = _to_date(x)
        return d if d is not None else _date(9999, 12, 31)

    def _ongoing_flag(item, today):
        sd = _safe_date(item.get("start_date"))
        ed = _safe_date(item.get("end_date")) or sd
        return 1 if (sd <= today <= ed) else 0

    def _upcoming_flag(item, today):
        sd = _safe_date(item.get("start_date"))
        return 1 if sd >= today else 0

    # 총점 동률일 때: 진행중 > 임박 > 시작일 가까운 순
    enriched.sort(
        key=lambda x: (
            -float(x["scores"].get("total", 0.0)),
            -_ongoing_flag(x, now),
            -_upcoming_flag(x, now),
            _safe_date(x.get("start_date"))
        )
    )
    return enriched[:3]

    print("DETAILS:", len(details))
    print("META:", len(meta))
    print("AFTER_FILTER:", len(enriched))
def get_monthly_top3_public(lat=None, lon=None, today: date | None = None):
    """
    비로그인 공개 TOP3:
      total = 1.2*log1p(like_count) + 1.0*avg_rating + 0.8*log1p(review_count) + 0.7*recency(+distance)
      recency = exp(-max(0, (today - start_date).days)/14)
      distance (옵션) = max(0, 1 - km/10)  # lat/lon 쿼리 있으면 반영
    """
    KST = ZoneInfo("Asia/Seoul")
    now = datetime.now(KST).date() if today is None else today
    y, m = now.year, now.month

    engine = get_db_engine()
    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT
                e.id,
                e.title,
                -- lot=위도, lat=경도 를 안전 캐스팅
                CASE WHEN e.lot::text ~ '^-?[0-9]+(\\.[0-9]+)?$' THEN e.lot::double precision ELSE NULL END AS lat,
                CASE WHEN e.lat::text ~ '^-?[0-9]+(\\.[0-9]+)?$' THEN e.lat::double precision ELSE NULL END AS lon,
                e.place, e.codename, e.main_img,
                e.date, e.start_date, e.end_date,
                COALESCE(l.cnt, 0) AS like_count,
                COALESCE(rv.avg_rating, 0) AS avg_rating,
                COALESCE(rv.cnt, 0) AS review_count
            FROM search_culturalevent e
            LEFT JOIN (
                SELECT event_id, COUNT(*) AS cnt
                FROM details_culturaleventlike
                GROUP BY event_id
            ) l ON l.event_id = e.id
            LEFT JOIN (
                SELECT event_id, AVG(rating) AS avg_rating, COUNT(*) AS cnt
                FROM surveys_surveyreview
                GROUP BY event_id
            ) rv ON rv.event_id = e.id
        """)).fetchall()

    items = []
    for r in rows:
        (eid, title, ev_lat_raw, ev_lon_raw, place, codename, main_img,
         date_text, sd_raw, ed_raw, like_cnt, avg_rating, rv_cnt) = r
        ev_lat, ev_lon = normalize_lat_lon(ev_lat_raw, ev_lon_raw)

        # 날짜 정규화
        sd = to_date(sd_raw)
        ed = to_date(ed_raw)
        if sd is None and ed is None and date_text:
            sd, ed = parse_date_string(date_text)

        if not overlaps_month(sd, ed, y, m):
            continue

        # 점수 계산
        like_score = log1p(like_cnt or 0)
        rating_score = float(avg_rating or 0.0)
        review_score = log1p(rv_cnt or 0)

        base_date = sd or ed or now
        days = max(0, (now - base_date).days)  # 미래는 0으로 클램프
        recency_score = exp(-days / 14.0)

        distance_score = 0.0
        distance_km = None
        if lat is not None and lon is not None and ev_lat is not None and ev_lon is not None:
            try:
                u_lat, u_lon = normalize_lat_lon(lat, lon)
                if u_lat is not None and u_lon is not None:
                    km = geodesic((u_lat, u_lon), (ev_lat, ev_lon)).km
                else:
                    km = None
                distance_score = max(0.0, 1.0 - (km / 10.0))
                distance_km = round(km, 2)
            except:
                pass

        total = 1.2*like_score + 1.0*rating_score + 0.8*review_score + 0.7*recency_score + 1.0*distance_score

        items.append({
            "id": eid,
            "title": title,
            "place": place,
            "codename": codename,
            "main_img": main_img,
            "date_text": date_text,
            "start_date": sd,
            "end_date": ed,
            "metrics": {
                "likes": int(like_cnt or 0),
                "avg_rating": round(rating_score, 2),
                "review_count": int(rv_cnt or 0),
                "recency_days": days,
                "distance_km": distance_km,
            },
            "scores": {
                "like": round(like_score, 3),
                "rating": round(rating_score, 3),
                "review": round(review_score, 3),
                "recency": round(recency_score, 3),
                "distance": round(distance_score, 3),
                "total": round(total, 3),
            }
        })

    # 안전한 타이브레이커(총점 동률 시 진행중/임박/시작일 가까운 순)
    def _safe_date(d):
        return d if isinstance(d, date) else (to_date(d) or date(9999, 12, 31))
    def _ongoing(x):
        sd = _safe_date(x.get("start_date"))
        ed = _safe_date(x.get("end_date")) or sd
        return 1 if (sd <= now <= ed) else 0
    def _upcoming(x):
        sd = _safe_date(x.get("start_date"))
        return 1 if sd >= now else 0

    items.sort(key=lambda x: (
        -float(x["scores"]["total"]),
        -_ongoing(x),
        -_upcoming(x),
        _safe_date(x.get("start_date")),
    ))
    return items[:3]