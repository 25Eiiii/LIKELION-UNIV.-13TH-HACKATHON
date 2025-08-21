# recommend/cf_cache.py
import os, redis, numpy as np
import pandas as pd


def _redis():
    url = os.getenv("REDIS_PUBLIC_URL") or os.getenv("REDIS_URL") or "redis://localhost:6379/0"
    # Railway rediss 지원: cert 검증이 필요없다면 아래 옵션 켜기
    return redis.from_url(url, decode_responses=False, ssl_cert_reqs=None)

def cf_available() -> bool:
    try:
        r = _redis()
        return r.exists("cf:ver") and r.exists("cf:dim")
    except Exception:
        return False

def load_user_vec(user_id: int):
    r = _redis()
    pu = r.get(f"cf:u:{user_id}")
    if not pu:
        return None, 0.0
    dim = int(r.get("cf:dim") or 0)
    bu_raw = r.get(f"cf:bu:{user_id}") or b"0"
    bu = float(bu_raw.decode() if isinstance(bu_raw, (bytes, bytearray)) else bu_raw)
    return np.frombuffer(pu, dtype=np.float32)[:dim], bu

def load_item_vecs(item_ids):
    r = _redis()
    pipe = r.pipeline()
    for eid in item_ids:
        pipe.get(f"cf:i:{eid}")
        pipe.get(f"cf:bi:{eid}")
    raw = pipe.execute()
    # raw = [qi_bytes, bi, qi_bytes, bi, ...]
    out = {}
    for eid, (q_bytes, bi_raw) in zip(item_ids, zip(raw[0::2], raw[1::2])):
        if not q_bytes:
            continue
        qi = np.frombuffer(q_bytes, dtype=np.float32)
        bi = float((bi_raw.decode() if isinstance(bi_raw, (bytes, bytearray)) else bi_raw) or 0.0)
        out[eid] = (qi, bi)
    return out

def score_cf(user_id: int, candidate_ids) -> pd.Series:
    """P_u·Q_i + b_u + b_i 를 Series로 반환 (index=id, value=raw score)"""
    if not candidate_ids:
        return pd.Series(dtype=float)
    pu, bu = load_user_vec(user_id)
    if pu is None:
        return pd.Series(dtype=float)
    items = load_item_vecs(candidate_ids)
    scores = {}
    for eid, (qi, bi) in items.items():
        if qi.shape[0] != pu.shape[0]:
            continue
        scores[eid] = float(np.dot(pu, qi) + bu + bi)
    return pd.Series(scores, dtype=float)
