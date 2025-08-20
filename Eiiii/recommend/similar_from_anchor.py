# recommend/similar_from_anchor.py
from datetime import date
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from . import algo  

def _norm_fee(x: str) -> str:
    return (x or "").strip()

def similar_to_event_df(anchor_event_id: int, top_n: int = 3, exclude_past: bool = True, explain: bool = False) -> pd.DataFrame:
    ev = algo.load_event_data()  # 반드시 ['id','title','meta','guname','is_free','codename','place','main_img','start_date','end_date'] 포함
    if ev.empty or int(anchor_event_id) not in set(ev["id"].astype(int)):
        return pd.DataFrame()

    # TF-IDF 인덱스 준비
    texts = ev["meta"].fillna("").tolist()
    if not any(t.strip() for t in texts):
        return pd.DataFrame()
    algo._ensure_vectorizer(texts)
    vec = algo._VECTORIZER
    mat = algo._EVENT_TFIDF
    if vec is None or mat is None:
        return pd.DataFrame()

    # 앵커 정보
    row = ev.loc[ev["id"].astype(int) == int(anchor_event_id)].iloc[0]
    anchor_meta  = row.get("meta", "")
    anchor_area  = row.get("guname", "")
    anchor_fee   = _norm_fee(row.get("is_free", ""))
    anchor_code  = (row.get("codename", "") or "")
    anchor_start = pd.to_datetime(row.get("start_date")).date() if "start_date" in ev.columns and pd.notna(row.get("start_date")) else None

    # 행사↔행사 TF-IDF 코사인
    anchor_vec = vec.transform([anchor_meta])
    sims = cosine_similarity(mat, anchor_vec).ravel()

    cand = ev.copy()
    cand["sim_anchor"] = pd.Series(sims, index=cand.index)

    # 자기 자신 제외 + 과거 제외(옵션)
    mask = cand["id"].astype(int) != int(anchor_event_id)
    if exclude_past and "start_date" in cand.columns:
        mask &= (pd.to_datetime(cand["start_date"]).dt.date >= date.today())
    cand = cand[mask]

    # codename 완전 일치
    cand["same_codename"] = (cand.get("codename", "").fillna("") == anchor_code).astype(float)
    # 지역/유무료 일치
    cand["same_area"] = (cand.get("guname", "") == anchor_area).astype(float)
    cand["same_fee"]  = (cand.get("is_free", "").apply(_norm_fee) == anchor_fee).astype(float)
    # 시작일 근접(최대 +0.2, 60일에서 0)
    if anchor_start:
        start_ts  = pd.to_datetime(cand.get("start_date"), errors="coerce")
        anchor_ts = pd.to_datetime(row.get("start_date"), errors="coerce")

        gap_days = (start_ts - anchor_ts).abs().dt.days         
        gap_days = gap_days.fillna(9999).astype(float)           

        cand["recency"] = (0.2 - (gap_days.clip(0, 60) / 60.0) * 0.2).clip(lower=0.0)
    else:
        cand["recency"] = 0.0

    # 최종 점수 (텍스트 0.65 + codename 0.15 + 지역 0.1 + 유/무료 0.1 + 날짜근접 가점)
    cand["score"] = (
        0.65 * cand["sim_anchor"] +
        0.15 * cand["same_codename"] +
        0.10 * cand["same_area"] +
        0.10 * cand["same_fee"] +
        cand["recency"]
    )

    # explain 모드: 겹친 토큰 상위 10개 (근거 확인용)
    if explain:
        vocab = vec.get_feature_names_out()
        a_vec = vec.transform([anchor_meta]).toarray().ravel()
        a_nonzero = set(a_vec.nonzero()[0])

        def _matched_terms(meta: str):
            b = vec.transform([meta or ""]).toarray().ravel()
            ix = a_nonzero.intersection(set(b.nonzero()[0]))
            pairs = [ (i, a_vec[i] + b[i]) for i in ix ]
            pairs.sort(key=lambda x: x[1], reverse=True)
            return [vocab[i] for i, _ in pairs[:10]]

        cand["matched_terms"] = cand["meta"].astype(str).apply(_matched_terms)

    keep = ["id","title","place","main_img","start_date","end_date","score",
            "sim_anchor","same_codename","same_area","same_fee","recency","codename"]
    if explain:
        keep += ["matched_terms"]
    keep = [c for c in keep if c in cand.columns]

    out = cand.sort_values("score", ascending=False).head(top_n)[keep].reset_index(drop=True)
    return out
