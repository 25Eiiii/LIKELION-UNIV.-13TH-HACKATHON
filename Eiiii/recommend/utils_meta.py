import pandas as pd
from .algo import get_db_engine

def fetch_events_meta_preserve_order(ids: list[int]) -> pd.DataFrame:
    if not ids:
        return pd.DataFrame(columns=["id","title","place","main_img","start_date","end_date"])
    eng = get_db_engine()
    cols = ["id","title","place","main_img","start_date","end_date"]
    q = f"SELECT {', '.join(cols)} FROM search_culturalevent WHERE id IN ({', '.join(['%s']*len(ids))})"
    df = pd.read_sql(q, eng, params=tuple(ids))
    df["__order"] = pd.Categorical(df["id"], ids, ordered=True)
    return df.sort_values("__order").drop(columns="__order")

def to_items(df: pd.DataFrame, score_col: str, extra_cols: list[str] | None = None) -> list[dict]:
    if df is None or df.empty:
        return []
    base = ["id","title","place","main_img","start_date","end_date"]
    for c in base:
        if c not in df.columns:
            df[c] = None
    cols = base + [score_col]
    if extra_cols:
        cols += [c for c in extra_cols if c in df.columns]
    out = df[cols].rename(columns={score_col: "score"})
    return out.to_dict(orient="records")
