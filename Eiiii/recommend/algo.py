# recommend/algo.py
from __future__ import annotations

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine
import pandas as pd
from surprise import SVD, Dataset, Reader
from surprise.model_selection import train_test_split
from surprise import KNNBasic
from surprise import accuracy
from typing import List, Optional

from .behavior_based import calculate_activity_scores

import numpy as np
np.random.seed(42)

import os, re, json
from pathlib import Path
from dotenv import load_dotenv

# CF 캐시 (오프라인 학습 산출물) 사용
from .cf_cache import cf_available, score_cf

from konlpy.tag import Okt

# ─────────────────────────────────────────────────────────────────────────────
# 환경
# ─────────────────────────────────────────────────────────────────────────────
here = Path(__file__).resolve()
env_path = here.parent.parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

# ─────────────────────────────────────────────────────────────────────────────
# DB 엔진 캐시
# ─────────────────────────────────────────────────────────────────────────────
_ENGINE = None
def get_db_engine():
    global _ENGINE
    if _ENGINE is None:
        _ENGINE = create_engine(
            f"postgresql+psycopg2://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
            f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}",
            pool_pre_ping=True, pool_size=5, max_overflow=10
        )
    return _ENGINE

def _ensure_vectorizer(_texts=None):
    """
    과거 코드 호환용: 벡터라이저/코퍼스가 준비돼 있음을 보장합니다.
    인자로 넘어온 texts는 사용하지 않고, 전역 코퍼스를 1회 빌드(또는 재사용)합니다.
    반환: 전역 TfidfVectorizer 인스턴스
    """
    _build_event_corpus()
    return _VECTORIZER
# ─────────────────────────────────────────────────────────────────────────────
# 전역 코퍼스/TF-IDF 캐시 (전 이벤트 1회 학습)
# ─────────────────────────────────────────────────────────────────────────────
_VECTORIZER: Optional[TfidfVectorizer] = None
_EVENT_TFIDF = None                 # 전체 이벤트에 대한 TF-IDF 행렬 (rows == EVENT_DF rows)
_EVENT_DF: Optional[pd.DataFrame] = None   # 최소한 ['id','title','meta', ...]
_EVENT_ROW_BY_ID: Optional[dict[int, int]] = None  # id → row index

okt = Okt()

def preprocess_text(text: str) -> str:
    # 한글, 숫자, 공백, /-만 남기기
    text = re.sub(r'[^ㄱ-ㅎ가-힣0-9\s/-]', ' ', text)
    # 간단 토크나이즈 (이미 title_clean에서 형태소 처리)
    tokens = text.split()
    return ' '.join(tokens)

def preprocess_title(title: str) -> str:
    if not isinstance(title, str):
        return ""
    text = re.sub(r"\[.*?\]", " ", title)              # 대괄호 제거
    text = re.sub(r"[^가-힣a-zA-Z\s]", " ", text)      # 숫자/특수 제거
    tokens = [w for w, pos in okt.pos(text) if pos in ["Noun", "Adjective"]]
    return " ".join(tokens)

def _build_event_corpus() -> None:
    """DB에서 전체 이벤트를 로드하고, 전역 TF-IDF 코퍼스를 1회 구축."""
    global _EVENT_DF, _VECTORIZER, _EVENT_TFIDF, _EVENT_ROW_BY_ID

    if _EVENT_DF is not None and _VECTORIZER is not None and _EVENT_TFIDF is not None:
        return

    eng = get_db_engine()
    df = pd.read_sql("SELECT * FROM search_culturalevent", eng)

    # 값 표준화
    df["is_free"]   = df["is_free"].map({True: "무료", False: "유료"}).fillna("")
    df["themecode"] = df["themecode"].fillna("")
    df["guname"]    = df["guname"].fillna("")
    df["codename"]  = df["codename"].fillna("")
    df["title"]     = df["title"].fillna("")

    # title 전처리
    df["title_clean"] = df["title"].apply(preprocess_title)

    # 메타 텍스트 생성 + 전처리
    df["meta_raw"] = df[["codename", "guname", "is_free", "themecode", "title_clean"]].astype(str).agg(" ".join, axis=1)
    df["meta"] = df["meta_raw"].apply(preprocess_text)

    # TF-IDF 학습(전 코퍼스 1회)
    vec = TfidfVectorizer(
        ngram_range=(1, 2),
        sublinear_tf=True,
        min_df=3,
        max_features=20000,
    )
    X = vec.fit_transform(df["meta"].tolist())

    # 전역 캐시 저장
    _EVENT_DF = df.reset_index(drop=True)
    _VECTORIZER = vec
    _EVENT_TFIDF = X
    _EVENT_ROW_BY_ID = {int(eid): i for i, eid in enumerate(_EVENT_DF["id"].tolist())}

def load_event_data(ids: Optional[List[int]] = None) -> pd.DataFrame:
    """
    전체 코퍼스에서 필요한 행만 슬라이스하여 반환.
    ids가 None이면 전체 반환(복사).
    """
    _build_event_corpus()
    if ids:
        keep = set(map(int, ids))
        return _EVENT_DF[_EVENT_DF["id"].isin(keep)].copy()
    return _EVENT_DF.copy()

def _similarity_for_subset(event_ids: List[int], user_profile: str) -> pd.Series:
    """
    전역 TF-IDF 행렬에서 event_ids 행만 뽑아 user_profile과 코사인 유사도.
    반환 index는 event_ids의 순서를 그대로 따른다.
    """
    _build_event_corpus()
    # 인덱스 매핑
    row_idxs = []
    idx_kept = []
    for eid in event_ids:
        r = _EVENT_ROW_BY_ID.get(int(eid))
        if r is not None:
            row_idxs.append(r)
            idx_kept.append(eid)

    if not row_idxs:
        return pd.Series([], dtype=float)

    sub = _EVENT_TFIDF[row_idxs, :]
    user_vec = _VECTORIZER.transform([user_profile or ""])
    sims = cosine_similarity(sub, user_vec).ravel()
    return pd.Series(sims, index=pd.Index(idx_kept, name="id"))

# ─────────────────────────────────────────────────────────────────────────────
# 사용자 프로필
# ─────────────────────────────────────────────────────────────────────────────
def load_user_profile(user_id: int) -> str:
    """
    profiles_userprofile에서 관심사/지역/요금/동반자 → 전처리 문자열
    """
    eng = get_db_engine()
    df = pd.read_sql(
        """
        SELECT interests, area, fee_type, together_input
        FROM profiles_userprofile
        WHERE user_id = %s
        """,
        eng,
        params=(user_id,),
    )
    if df.empty:
        return ""

    row = df.iloc[0]
    raw_interests = row["interests"]

    if isinstance(raw_interests, list):
        interests_list = raw_interests
    elif isinstance(raw_interests, str):
        try:
            interests_list = json.loads(raw_interests)
        except Exception:
            interests_list = []
    else:
        interests_list = []

    interests_str = " ".join(interests_list) if interests_list else ""

    raw_fee_type = str(row["fee_type"]) if pd.notna(row["fee_type"]) else ""
    fee_type_map = {
        "무료 행사만 볼래요": "무료",
        "유료 행사도 괜찮아요": "유료",
        "둘 다 좋아요": "무료 유료",
    }
    fee_type_str = fee_type_map.get(raw_fee_type, raw_fee_type)

    user_mapped = {
        "interests": interests_str,
        "area": str(row["area"]) if pd.notna(row["area"]) else "",
        "fee_type": fee_type_str,
        "together_input": str(row["together_input"]) if pd.notna(row["together_input"]) else "",
    }
    return preprocess_text(" ".join(user_mapped.values()))

# ─────────────────────────────────────────────────────────────────────────────
# 콘텐츠/행동/협업 컴포넌트
# ─────────────────────────────────────────────────────────────────────────────
def content_based_recommend_df(user_id: int, top_n=10, candidate_ids: Optional[List[int]] = None) -> pd.DataFrame:
    ev = load_event_data(ids=candidate_ids)
    if ev.empty:
        return pd.DataFrame(columns=["id", "title", "similarity"])

    user_profile = load_user_profile(user_id)
    # 전역 TF-IDF에서 후보군 행만 가져와 유사도 계산
    sims = _similarity_for_subset(ev["id"].astype(int).tolist(), user_profile)
    ev = ev.set_index("id")
    ev["similarity"] = sims.reindex(ev.index).fillna(0.0)

    out = (
        ev.sort_values("similarity", ascending=False)
          .reset_index()[["id", "title", "similarity"]]
          .head(top_n)
    )
    return out

# 별칭/호환
content_based_recommend = content_based_recommend_df

def content_based_recommend_ids(user_id: int, top_n=10, candidate_ids: Optional[List[int]] = None) -> List[int]:
    df = content_based_recommend_df(user_id, top_n, candidate_ids)
    return df["id"].dropna().astype(int).tolist()

def cb_recommend_ids(user_id: int, top_k=10, candidate_ids: Optional[List[int]] = None) -> List[int]:
    df = content_based_recommend_df(user_id, top_k, candidate_ids)
    return df["id"].dropna().astype(int).tolist()

def behavior_adjusted_recommend(
    user_id: int,
    top_n: int = 10,
    candidate_ids: Optional[List[int]] = None
) -> pd.DataFrame:
    ev = load_event_data(ids=candidate_ids)
    if ev.empty:
        return pd.DataFrame(columns=["id", "title", "adjusted_similarity"])

    user_profile = load_user_profile(user_id)
    sims = _similarity_for_subset(ev["id"].astype(int).tolist(), user_profile)
    ev = ev.set_index("id")
    ev["similarity"] = sims.reindex(ev.index).fillna(0.0)

    # ⬇️ CB 상위 200개만 행동 점수 후보로 축소
    TOP_FOR_BEH = min(200, len(ev))
    beh_cand_ids = (
        ev.sort_values("similarity", ascending=False)
          .head(TOP_FOR_BEH)
          .index
          .tolist()
    )

    # ⬇️ 행동 점수는 bbox 반경으로만 계산(기본 20km)
    scores, _ = calculate_activity_scores(
        user_id,
        candidate_ids=beh_cand_ids,
        radius_km=20.0
    )

    # 안정화/보정
    if scores:
        s = pd.Series(scores, dtype=float)
        s = (s - s.min()) / (s.max() - s.min()) if s.max() > s.min() else s * 0.0
        adj_factor = ev.index.to_series().map(s).fillna(0.0)
    else:
        adj_factor = pd.Series(0.0, index=ev.index)

    ev["adjusted_similarity"] = (ev["similarity"] * (1.0 + adj_factor)).astype(float)

    filtered = ev[ev["similarity"] > 0.2]
    if filtered.empty:
        filtered = ev

    out = (
        filtered.sort_values("adjusted_similarity", ascending=False)
                .reset_index()[["id", "title", "adjusted_similarity"]]
                .head(top_n)
    )
    return out

# 협업(온라인 학습) 함수는 유지하되, 하이브리드에서는 Redis 캐시만 사용
def load_ratings():
    eng = get_db_engine()
    df = pd.read_sql(
        """
        SELECT user_id, event_id, rating, created_at::timestamp AS created_at
        FROM surveys_surveyreview
        WHERE rating IS NOT NULL
        """,
        eng,
    )
    df["created_at"] = pd.to_datetime(df["created_at"])
    df = df.sort_values("created_at").drop_duplicates(["user_id", "event_id"], keep="last")
    return df[["user_id", "event_id", "rating"]]

def prepare_dataset(df):
    reader = Reader(rating_scale=(0, 5))
    return Dataset.load_from_df(df[["user_id", "event_id", "rating"]], reader)

def get_unrated_events(user_id, ratings_df, all_event_ids):
    rated = ratings_df[ratings_df["user_id"] == user_id]["event_id"].tolist()
    return [i for i in all_event_ids if i not in rated]

def collaborative_filtering_recommend(user_id, top_n=5):
    # (참고용) 온라인 학습: 실서비스 경로에선 사용하지 않음
    ratings_df = load_ratings()
    if ratings_df.empty:
        return []
    if user_id not in set(ratings_df["user_id"].unique()):
        cb = content_based_recommend_df(user_id, top_n)
        if cb.empty:
            return []
        cb = cb.copy()
        cb.rename(columns={"similarity": "pred_rating"}, inplace=True)
        return cb

    reader = Reader(rating_scale=(0, 5))
    data = Dataset.load_from_df(ratings_df[["user_id", "event_id", "rating"]], reader)
    trainset = data.build_full_trainset()

    algo = SVD(n_factors=10, n_epochs=30, reg_all=0.05, random_state=42)
    algo.fit(trainset)

    all_items = set(ratings_df["event_id"].unique())
    seen = set(ratings_df.loc[ratings_df["user_id"] == user_id, "event_id"].unique())
    candidates = list(all_items - seen)
    if not candidates:
        return []

    scored = [(iid, algo.predict(user_id, iid, clip=False).est) for iid in candidates]
    top_preds = sorted(scored, key=lambda x: x[1], reverse=True)[:top_n]
    ids_ordered = [int(eid) for eid, _ in top_preds]

    eng = get_db_engine()
    ph = ", ".join(["%s"] * len(ids_ordered))
    q = f"""
        SELECT id, title, codename, guname, use_fee, main_img, place, start_date, end_date
        FROM search_culturalevent
        WHERE id IN ({ph})
    """
    ev = pd.read_sql(q, eng, params=tuple(ids_ordered))
    ev["__order"] = pd.Categorical(ev["id"], ids_ordered, ordered=True)
    ev = ev.sort_values("__order").drop(columns="__order")

    pred_df = pd.DataFrame(top_preds, columns=["id", "pred_rating"])
    return ev.merge(pred_df, on="id")

def evaluate_cf_rmse_mae(ratings_df):
    data = prepare_dataset(ratings_df)
    trainset, testset = train_test_split(data, test_size=0.2)
    algo = KNNBasic(sim_options={"name": "cosine", "user_based": True})
    algo.fit(trainset)
    preds = algo.test(testset)
    rmse = accuracy.rmse(preds, verbose=False)
    mae = accuracy.mae(preds, verbose=False)
    return {"RMSE": rmse, "MAE": mae}

def _minmax(s: pd.Series) -> pd.Series:
    if s is None or len(s) == 0:
        return pd.Series(dtype=float)
    s = s.astype(float)
    s_min, s_max = s.min(), s.max()
    if pd.isna(s_min) or pd.isna(s_max) or s_max == s_min:
        return pd.Series([0.0] * len(s), index=s.index)
    return (s - s_min) / (s_max - s_min)

def compute_cb_scores(user_id: int, top_k: int | None = None, candidate_ids: Optional[List[int]] = None) -> pd.DataFrame:
    cb_df = content_based_recommend_df(user_id, top_n=10_000, candidate_ids=candidate_ids).copy()
    cb_df.rename(columns={"similarity": "cb_raw"}, inplace=True)
    cb_df["cb_score"] = _minmax(cb_df["cb_raw"])
    keep = ["id", "cb_score", "cb_raw", "title"]
    if top_k:
        cb_df = cb_df.sort_values("cb_score", ascending=False).head(top_k)
    return cb_df[keep]

def compute_behavior_scores(user_id: int, top_k: int | None = None, candidate_ids: Optional[List[int]] = None) -> pd.DataFrame:
    beh_df = behavior_adjusted_recommend(user_id, top_n=10_000, candidate_ids=candidate_ids).copy()
    if beh_df is None or beh_df.empty:
        return pd.DataFrame(columns=["id", "beh_score", "beh_raw", "title"])
    beh_df.rename(columns={"adjusted_similarity": "beh_raw"}, inplace=True)
    beh_df["beh_score"] = _minmax(beh_df["beh_raw"])
    keep = ["id", "beh_score", "beh_raw", "title"]
    if top_k:
        beh_df = beh_df.sort_values("beh_score", ascending=False).head(top_k)
    return beh_df[keep]

# (참고용) 온라인 CF 점수표는 하이브리드에서 사용하지 않음
def compute_cf_scores(user_id: int, top_k: int | None = None) -> pd.DataFrame:
    cf_df = collaborative_filtering_recommend(user_id, top_n=10_000)
    if cf_df is None or isinstance(cf_df, list) or len(cf_df) == 0:
        return pd.DataFrame(columns=["id", "cf_score", "cf_raw", "title"])
    cf_df = cf_df.copy()
    cf_df.rename(columns={"pred_rating": "cf_raw"}, inplace=True)
    cf_df["cf_score"] = _minmax(cf_df["cf_raw"])
    keep = ["id", "cf_score", "cf_raw", "title"]
    if top_k:
        cf_df = cf_df.sort_values("cf_score", ascending=False).head(top_k)
    return cf_df[keep]

# ─────────────────────────────────────────────────────────────────────────────
# 메인: 하이브리드 추천 (CB+BEH(+CF 캐시))
# ─────────────────────────────────────────────────────────────────────────────
def hybrid_recommend(
    user_id: int,
    top_n: int = 10,
    weights: tuple = (0.5, 0.5, 0.0),   # 기본: CB/BEH 중심, CF는 캐시 있을 때만 반영
    dedup: bool = True,
    min_components: int = 1,
    return_components: bool = False,
    candidate_ids: Optional[List[int]] = None,
    fast_mode: bool = True,
) -> pd.DataFrame:

    # 1) CB/BEH 먼저 (fast_mode면 상한 축소로 응답 체감 개선)
    top_k = 1000 if fast_mode else None
    cb  = compute_cb_scores(user_id, top_k=top_k, candidate_ids=candidate_ids)
    beh = compute_behavior_scores(user_id, top_k=top_k, candidate_ids=candidate_ids)

    # 후보군 필터는 compute_*에서 이미 적용됨
    out = cb[["id", "title", "cb_score", "cb_raw"]].copy() if not cb.empty else pd.DataFrame(columns=["id", "title", "cb_score", "cb_raw"])
    out = pd.merge(out, beh[["id", "title", "beh_score", "beh_raw"]], on=["id", "title"], how="outer")

    # 2) CF 캐시가 있으면 가산 (오프라인 내적 스코어)
    cf_ser = pd.Series(dtype=float)
    if cf_available():
        # 후보군 지정: 있으면 그 집합만, 없으면 현재 out.id
        cand = list(candidate_ids) if candidate_ids else out["id"].dropna().astype(int).tolist()
        if cand:
            cf_ser = score_cf(user_id, cand)  # index=id, values=raw
            if not cf_ser.empty:
                cf_df = pd.DataFrame({"id": cf_ser.index, "cf_raw": cf_ser.values})
                out = pd.merge(out, cf_df, on="id", how="outer")

    # 3) 결측 0 채움 + 정규화
    for col in ["cb_score", "beh_score", "cf_raw", "cb_raw", "beh_raw"]:
        if col not in out.columns:
            out[col] = 0.0
    out["cf_raw"] = out["cf_raw"].fillna(0.0)

    def _mm(s: pd.Series) -> pd.Series:
        if s is None or s.empty:
            return s
        s = s.astype(float)
        mn, mx = s.min(), s.max()
        return (s - mn) / (mx - mn) if mx > mn else s * 0.0

    out["cf_score"] = _mm(out["cf_raw"])

    # 4) 가중합
    w_cb, w_beh, w_cf = weights
    # fast_mode에서 CF 캐시가 비었으면 자동 0
    if fast_mode and (cf_ser is None or cf_ser.empty):
        w_cf = 0.0

    out["score"] = (w_cb * out["cb_score"]) + (w_beh * out["beh_score"]) + (w_cf * out["cf_score"])

    if dedup:
        out = out.drop_duplicates(subset=["id"])

    # 최소 컴포넌트 충족
    comp_cols = ["cb_score", "beh_score", "cf_score"]
    out["nonzero_components"] = (out[comp_cols] > 0).sum(axis=1)
    out = out[out["nonzero_components"] >= min_components]

    out = out.sort_values("score", ascending=False)
    cols_basic = ["id", "title", "score"]
    cols_comp  = ["cb_score", "beh_score", "cf_score", "cb_raw", "beh_raw", "cf_raw"] if return_components else []
    return out[cols_basic + cols_comp].head(top_n).reset_index(drop=True)


# ─────────────────────────────────────────────────────────────────────────────
# 로컬 테스트
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    user_id = 27

    ratings_df = load_ratings()
    hybrid_df = hybrid_recommend(user_id, top_n=10, weights=(0.5, 0.5, 0.3), fast_mode=True)

    print("@@@@@@@@@ 콘텐츠 기반 추천 @@@@@@@@@")
    print(content_based_recommend(user_id, top_n=5)[["id", "title", "similarity"]])
    print("@@@@@@@@@ 행동 기반 추천 @@@@@@@@@")
    print(behavior_adjusted_recommend(user_id, top_n=5)[["id", "title", "adjusted_similarity"]])
    print("@@@@@@@@@ 협업 필터링 추천(참고) @@@@@@@@@")
    cf_tmp = collaborative_filtering_recommend(user_id, top_n=5)
    print(cf_tmp[["id", "title", "pred_rating"]] if isinstance(cf_tmp, pd.DataFrame) and not cf_tmp.empty else "[]")
    print(evaluate_cf_rmse_mae(ratings_df))
    print("@@@@@@@@@ 하이브리드 추천 @@@@@@@@@")
    print(hybrid_df)
