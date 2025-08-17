import os, random
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Set
from collections import defaultdict
from datetime import datetime

from sqlalchemy import create_engine

from surprise import Dataset, Reader, SVD, KNNBaseline
from surprise.model_selection import KFold
from surprise import accuracy
import os
from pathlib import Path
from dotenv import load_dotenv

# 환경변수 로드
env_path = Path(__file__).resolve().parent.parent / "Eiiii" / ".env"
load_dotenv(dotenv_path=env_path)

def get_db_engine():
    return create_engine(
        f"postgresql+psycopg2://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )

# ===== 공통 유틸: 랭킹 지표 =====
def precision_at_k(recommended: List[int], positives: Set[int], k: int) -> float:
    rec_k = recommended[:k]
    hit = sum(1 for eid in rec_k if eid in positives)
    return hit / max(1, k)

def recall_at_k(recommended: List[int], positives: Set[int], k: int) -> float:
    rec_k = recommended[:k]
    hit = sum(1 for eid in rec_k if eid in positives)
    return hit / max(1, len(positives))

def apk(recommended: List[int], positives: Set[int], k: int) -> float:
    """Average Precision@K"""
    score = 0.0
    hit = 0
    for i, eid in enumerate(recommended[:k], start=1):
        if eid in positives:
            hit += 1
            score += hit / i
    return score / max(1, min(len(positives), k))

def dcg_at_k(recommended: List[int], positives: Set[int], k: int) -> float:
    dcg = 0.0
    for i, eid in enumerate(recommended[:k], start=1):
        rel = 1.0 if eid in positives else 0.0
        dcg += rel / np.log2(i + 1)
    return dcg

def ndcg_at_k(recommended: List[int], positives: Set[int], k: int) -> float:
    ideal_hits = min(len(positives), k)
    idcg = sum(1.0 / np.log2(i + 1) for i in range(1, ideal_hits + 1))
    if idcg == 0:
        return 0.0
    return dcg_at_k(recommended, positives, k) / idcg

# ===== A) 행동 기반 평가 =====
# details_culturaleventlike: id, created_at, event_id, user_id
# surveys_surveyreview:     id, content, extra_feedback, created_at, event_id, user_id, photo, rating
def load_interactions(engine) -> pd.DataFrame:
    like_sql = """
        SELECT user_id, event_id, created_at::timestamp AS ts, 'like' AS type
        FROM details_culturaleventlike
    """
    review_sql = """
        SELECT user_id, event_id, created_at::timestamp AS ts, 'review' AS type
        FROM surveys_surveyreview
    """
    like_df = pd.read_sql(like_sql, engine)
    rev_df  = pd.read_sql(review_sql,  engine)
    df = pd.concat([like_df, rev_df], ignore_index=True)
    df['ts'] = pd.to_datetime(df['ts'])
    return df

def build_user_splits(df: pd.DataFrame, test_holdout_per_user: int = 1):
    """
    각 유저별 시간순으로 정렬 후 마지막 n개를 테스트로 홀드아웃.
    반환: {user_id: (train_event_ids, test_event_ids)}
    """
    splits = {}
    for uid, g in df.sort_values('ts').groupby('user_id'):
        events = g['event_id'].tolist()
        if len(events) <= test_holdout_per_user:
            continue
        test = set(events[-test_holdout_per_user:])
        train = set(events[:-test_holdout_per_user]) - test
        splits[uid] = (train, test)
    return splits

def evaluate_behavior_model(engine, k: int = 10, negative_pool: int = 100, seed: int = 42):
    import random
    random.seed(seed); np.random.seed(seed)
    from behavior_based import calculate_activity_scores

    interactions = load_interactions(engine)
    interactions = interactions.dropna(subset=["user_id","event_id","ts"])
    interactions = interactions.sort_values("ts")

    splits, cutoffs = {}, {}
    for uid, g in interactions.groupby('user_id'):
        evs = g[['event_id','ts']].values.tolist()
        if len(evs) <= 1:
            continue
        last_eid, last_ts = evs[-1]
        train_eids = {e for e,_ in evs[:-1]}
        test_eids  = {last_eid}
        splits[uid] = (train_eids, test_eids)
        cutoffs[uid] = last_ts

    all_events = pd.read_sql("SELECT id FROM search_culturalevent", engine)['id'].tolist()

    metrics = defaultdict(list)
    n_users = 0
    for uid, (train_set, test_set) in splits.items():
        cutoff = cutoffs[uid]
        # 테스트 아이템 가점 누수 방지
        scores, _ = calculate_activity_scores(uid, cutoff_ts=cutoff, exclude_event_ids=test_set)

        negatives = [e for e in all_events if e not in train_set and e not in test_set]
        if len(negatives) > negative_pool:
            negatives = random.sample(negatives, negative_pool)
        candidates = list(test_set) + negatives

        ranked = sorted(candidates, key=lambda x: scores.get(x, 0.0), reverse=True)

        metrics['precision@k'].append(precision_at_k(ranked, test_set, k))
        metrics['recall@k'].append(recall_at_k(ranked, test_set, k))
        metrics['map@k'].append(apk(ranked, test_set, k))
        metrics['ndcg@k'].append(ndcg_at_k(ranked, test_set, k))
        n_users += 1

    out = {m: float(np.mean(v)) if v else 0.0 for m, v in metrics.items()}
    print(f"[Behavior Eval] evaluated_users={n_users}, k={k}, negative_pool={negative_pool}")
    return out

# ===== B) 협업 필터링 평가 (KNNBaseline vs SVD) =====
def load_ratings(engine) -> pd.DataFrame:
    sql = """
        SELECT user_id, event_id, rating, created_at::timestamp AS created_at
        FROM surveys_surveyreview
        WHERE rating IS NOT NULL
    """
    df = pd.read_sql(sql, engine)
    df['created_at'] = pd.to_datetime(df['created_at'])
    df = df.dropna(subset=['created_at'])
    # (user,item) 중복 제거: 가장 최근 것만 유지
    df = df.sort_values('created_at').drop_duplicates(['user_id', 'event_id'], keep='last')
    return df

def eval_surprise_rmse_mae(ratings_df: pd.DataFrame):
    reader = Reader(rating_scale=(0,5))
    data = Dataset.load_from_df(ratings_df[['user_id','event_id','rating']], reader)

    # 너무 작은 데이터에서 5-fold가 불가능한 경우 대비
    n_splits = 5
    if ratings_df.shape[0] < 5:
        n_splits = 3
    kf = KFold(n_splits=n_splits, random_state=42, shuffle=True)

    results = {}
    algos = {
        "KNNBaseline": KNNBaseline(sim_options={'name':'pearson_baseline','user_based':False}),
        "SVD": SVD(n_factors=20, n_epochs=50, reg_all=0.02, random_state=42),
    }
    
    for name, algo in algos.items():
        rmses, maes = [], []
        for trainset, testset in kf.split(data):
            algo.fit(trainset)
            preds = algo.test(testset)
            rmses.append(accuracy.rmse(preds, verbose=False))
            maes.append(accuracy.mae(preds, verbose=False))
        results[name] = {"RMSE": float(np.mean(rmses)), "MAE": float(np.mean(maes))}
    return results

def eval_surprise_ranking(
    ratings_df: pd.DataFrame,
    k: int = 10,
    negative_pool: int | None = 300,   # 후보가 너무 많을 때만 다운샘플
    use_all_candidates: bool = True,   # True = 하드 네거티브(추천 난이도 ↑)
    skip_cold: bool = True             # 테스트 아이템이 train에 전혀 없으면 스킵
):
    import random
    random.seed(42); np.random.seed(42)
    reader = Reader(rating_scale=(0,5))

    # (user,item) 중복 제거 + 시간 정렬
    df = ratings_df.sort_values('created_at').drop_duplicates(['user_id','event_id'], keep='last')

    # 유저 필터: 상호작용(유니크 아이템) >= 3
    counts = df.groupby('user_id')['event_id'].nunique()
    keep_users = set(counts[counts >= 3].index)
    df = df[df['user_id'].isin(keep_users)].copy()
    if df.empty:
        return {"error": "Not enough users with >=3 interactions."}

    # 글로벌 아이템 출현 빈도
    freq = df['event_id'].value_counts()

    # 테스트 인덱스: "가장 최근이면서, 해당 아이템이 train에 최소 1회 남는" 것을 우선 선택
    test_idx = []
    train = df.copy()
    for uid, g in df.groupby('user_id'):
        g = g.sort_values('created_at')
        chosen = None
        # 뒤에서부터 탐색
        for i in range(len(g) - 1, -1, -1):
            row = g.iloc[i]
            eid = row['event_id']
            # 현재 train에서 이 아이템의 개수(이 사용자의 이 행을 drop한다고 가정하면 -1)
            eid_count_in_train = (train['event_id'] == eid).sum()
            if eid_count_in_train - 1 > 0:
                chosen = row.name
                break
        # 모두 cold가 될 경우엔 마지막 행 사용(어쩔 수 없음)
        if chosen is None:
            chosen = g.iloc[-1].name

        test_idx.append(chosen)
        # 실제로 train에서 제거하여 다음 유저 선택 시 반영
        train = train.drop(index=[chosen])

    test_pairs = df.loc[test_idx, ['user_id','event_id','created_at']]
    train_items = set(train['event_id'].unique())
    # 학습
    train_data = Dataset.load_from_df(train[['user_id','event_id','rating']], reader)
    trainset = train_data.build_full_trainset()

    algos = {
        "KNNBaseline": KNNBaseline(sim_options={'name':'pearson_baseline','user_based':False, 'min_k': 3}),
        "SVD": SVD(n_factors=10, n_epochs=30, reg_all=0.05, random_state=42),
    }

    out = {}
    for name, algo in algos.items():
        algo.fit(trainset)
        precs, recs, maps, ndcgs = [], [], [], []
        evaluated = 0
        skipped_cold = 0

        for _, row in test_pairs.iterrows():
            uid = int(row['user_id']); pos_item = int(row['event_id'])
            seen = set(train.loc[train['user_id'] == uid, 'event_id'])

            if use_all_candidates:
                candidates = list(train_items - seen)
                if skip_cold and pos_item not in train_items:
                    skipped_cold += 1
                    continue
                if negative_pool is not None and len(candidates) > negative_pool:
                    if pos_item in candidates:
                        candidates.remove(pos_item)
                        candidates = random.sample(candidates, negative_pool - 1) + [pos_item]
                    else:
                        candidates = random.sample(candidates, negative_pool) + [pos_item]
                else:
                    if pos_item not in candidates:
                        candidates.append(pos_item)
            else:
                candidates = list(train_items - seen - {pos_item})
                if negative_pool is not None and len(candidates) > negative_pool:
                    candidates = random.sample(candidates, negative_pool)
                candidates.append(pos_item)

            scored = [(iid, algo.predict(uid, iid, clip=False).est) for iid in candidates]
            ranked = [iid for iid, _ in sorted(scored, key=lambda x: x[1], reverse=True)]
            positives = {pos_item}

            precs.append(precision_at_k(ranked, positives, k))
            recs.append(recall_at_k(ranked, positives, k))
            maps.append(apk(ranked, positives, k))
            ndcgs.append(ndcg_at_k(ranked, positives, k))
            evaluated += 1

        out[name] = {
            "precision@k": float(np.mean(precs)) if precs else 0.0,
            "recall@k": float(np.mean(recs)) if recs else 0.0,
            "map@k": float(np.mean(maps)) if maps else 0.0,
            "ndcg@k": float(np.mean(ndcgs)) if ndcgs else 0.0,
        }
        print(f"[CF Rank:{name}] evaluated_users={evaluated}, skipped_cold={skipped_cold}, "
              f"avg_candidates={(len(candidates) if evaluated else 0)}")
    return out

# ===== 실행 예시 =====
if __name__ == "__main__":
    np.random.seed(42)
    random.seed(42)

    engine = get_db_engine()

    print("=== 행동 기반 (calculate_activity_scores) 랭킹 평가 ===")
    beh = evaluate_behavior_model(engine, k=10, negative_pool=100, seed=42)
    print(beh)

    print("\n=== 협업 필터링 (RMSE/MAE) ===")
    ratings = load_ratings(engine)
    cf_err = eval_surprise_rmse_mae(ratings)
    print(cf_err)

    print("\n=== 협업 필터링 (랭킹: leave-last-out) ===")
    cf_rank = eval_surprise_ranking(ratings, k=10, negative_pool=100)
    print(cf_rank)
