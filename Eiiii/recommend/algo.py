from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine
import pandas as pd
from surprise import SVD, Dataset, Reader
from surprise.model_selection import train_test_split
from surprise import KNNBasic
from surprise import accuracy
from typing import List

from .behavior_based import calculate_activity_scores

import numpy as np
np.random.seed(42)

import os, re, json
from pathlib import Path
from dotenv import load_dotenv

here = Path(__file__).resolve()
env_path = here.parent.parent / ".env"  

load_dotenv(dotenv_path=env_path, override=True)

from konlpy.tag import Okt

# ===== 공통 유틸 =====
#전역 엔진 캐시
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

_VECTORIZER = None
_EVENT_TFIDF = None

def _ensure_vectorizer(event_texts: list[str]):
    #이벤트 메타로만 fit: 사용자 희귀 토큰 소실 방지
    global _VECTORIZER, _EVENT_TFIDF
    if _VECTORIZER is None or _EVENT_TFIDF is None:
        vec = TfidfVectorizer(
            ngram_range=(1, 2),      # (1,3) → (1,2) 권장(성능/과적합 밸런스)
            sublinear_tf=True,
            min_df=3,                # 5 → 3 (희귀 토큰 보존)
            max_features=20000
        )
        _EVENT_TFIDF = vec.fit_transform(event_texts)
        _VECTORIZER = vec

def calculate_similarity(event_df: pd.DataFrame, user_profile: str) -> pd.Series:
    texts = event_df['meta'].tolist()
    _ensure_vectorizer(texts)
    user_vec = _VECTORIZER.transform([user_profile or ""])
    sims = cosine_similarity(_EVENT_TFIDF, user_vec).ravel()
    return pd.Series(sims, index=event_df.index)

# 1. 회원가입 초기: 콘텐츠 기반 필터링
#    데이터: 카테고리 / 지역 / 유, 무료 / 테마
#    (1) 이벤트 데이터와 사용자 정보 데이터를 벡터화 하고
#    (2) 각각의 이벤트 데이터에서 중요한 키워드를 뽑은 후 (tfidf)
#    (3) 이벤트 데이터와 사용자 데이터 간 유사도를 계산한다. (cosine-similarity)
#    (4) 유사도가 높은 이벤트를 사용자에게 추천한다. 

okt = Okt()

# ===== 텍스트 전처리 =====
def preprocess_text(text):
    # 한글, 숫자, 공백만 남기기
    text = re.sub(r'[^ㄱ-ㅎ가-힣0-9\s/-]', ' ', text)

    # 형태소 분석 후 명사/형용사만 추출
    tokens = text.split()

    return ' '.join(tokens)

def preprocess_title(title: str) -> str:
    """
    공연/행사 제목 문자열을 전처리:
    1) 괄호([]) 안 내용 제거
    2) 특수문자, 숫자 제거
    3) 형태소 분석 후 명사/형용사만 추출
    4) 공백으로 연결한 문자열 반환
    """
    if not isinstance(title, str):
        return ""
    
    # 1) 대괄호 안 내용 제거
    text = re.sub(r"\[.*?\]", " ", title)
    
    # 2) 숫자, 특수문자 제거
    text = re.sub(r"[^가-힣a-zA-Z\s]", " ", text)
    
    # 3) 형태소 분석 (명사/형용사만)
    tokens = [word for word, pos in okt.pos(text) if pos in ["Noun", "Adjective"]]
    
    # 4) 공백 기준 문자열 반환
    return " ".join(tokens)

# ===== 행사 데이터 로드 =====
def load_event_data():
    """
    search_culturalevent에서 메타 칼럼들을 합쳐 한 문자열 생성
    """
    engine = get_db_engine()
    query = "SELECT * FROM search_culturalevent"
    df = pd.read_sql(query, engine)

    # 메타 칼럼 합쳐서 텍스트 벡터로 만들기
    # 텍스트 벡터로 만들어야 tfidf vectorizer 적용 가능함

    # 값 표준화
    df["is_free"]   = df["is_free"].map({True:"무료", False:"유료"}).fillna("")
    df["themecode"] = df["themecode"].fillna("")
    df["guname"]    = df["guname"].fillna("")
    df["codename"]  = df["codename"].fillna("")
    df["title"]     = df["title"].fillna("")

    # title 전처리 적용
    df["title_clean"] = df["title"].apply(preprocess_title)

    df["meta_raw"] = df[["codename", 'guname', "is_free", "themecode", "title_clean"]].astype(str).agg(" ".join, axis=1)
    df["meta"] = df["meta_raw"].apply(preprocess_text)
    return df

#profiles_userprofile 여기에서 값을 가져오면 됨*********************************************
# ===== 사용자 프로필 로드 =====
def load_user_profile(user_id: int):
    """
    profiles_userinterests에서 해당 사용자의 관심사, 지역, 요금, 동반자 텍스트를 모아 하나의 문장으로 만들고 전처리 
    """
    engine = get_db_engine()
    query = """
        SELECT interests, area, fee_type, together_input
        FROM profiles_userprofile
        WHERE user_id = %s
    """
    df = pd.read_sql(query, engine, params=(user_id,))

    if df.empty:
        # 데이터 없으면 빈 문자열 반환
        return ""

    row = df.iloc[0]
    raw_interests = row['interests']

    if isinstance(raw_interests, list):
        interests_list = raw_interests
    elif isinstance(raw_interests, str):
        try:
            interests_list = json.loads(raw_interests)
        except Exception as e:
            print(f"JSON parsing error: {e}")
            interests_list = []
    else:
        interests_list = []

    interests_str = ' '.join(interests_list) if interests_list else ""

        # fee_type 처리 (무료 / 유료 / 둘다좋아요 / 그 외 문구)
    raw_fee_type = str(row['fee_type']) if pd.notna(row['fee_type']) else ""

    # 자연어 문구 → 표준값 매핑
    fee_type_map = {
        "무료 행사만 볼래요": "무료",
        "유료 행사도 괜찮아요": "유료",
        "둘 다 좋아요": "무료 유료"
    }

    # 매핑 적용 (없으면 그대로 사용)
    fee_type_str = fee_type_map.get(raw_fee_type, raw_fee_type)

    user_mapped = {
        'interests': interests_str,
        'area': str(row['area']) if pd.notna(row['area']) else "",
        'fee_type': fee_type_str,
        'together_input': str(row['together_input']) if pd.notna(row['together_input']) else ""
    }

    return preprocess_text(' '.join(user_mapped.values()))

# ===== TF-IDF로 사용자와 행사 유사도 계산 =====
#def calculate_similarity(event_df, user_profile):
#    corpus = event_df['meta'].tolist() + [user_profile]
#    tfidf = TfidfVectorizer(
#        ngram_range=(1, 3), 
#        sublinear_tf=True, 
#        min_df=5,
#        max_features=15000
#        )
#    tfidf_matrix = tfidf.fit_transform(corpus)
#    cosine_sim = cosine_similarity(tfidf_matrix[:-1], tfidf_matrix[-1]).flatten()
#    return pd.Series(cosine_sim, index=event_df.index)

# 사용자 관심사 불러오기
#def load_user_interests(user_id):
#    """
#    DB에서 user_id로 사용자의 관심사 데이터를 불러와 dict 형태로 반환
#    예:
#    """
#    engine = get_db_engine()
#    query = f"""
#        SELECT interests, fee_type, area, together_input
#        FROM profiles_userprofile
#        WHERE user_id = {user_id}
#    """
#    df = pd.read_sql(query, engine)

#    # df를 dict로 변환
#    if not df.empty:
#        return df.iloc[0].to_dict()
#   else:
#        return {}
def load_user_interests(user_id: int) -> dict:
    engine = get_db_engine()
    query = """
        SELECT interests, fee_type, area, together_input
        FROM profiles_userprofile
        WHERE user_id = %s
    """
    df = pd.read_sql(query, engine, params=(user_id,))
    return df.iloc[0].to_dict() if not df.empty else {}

# 1. 콘텐츠 기반 추천
def content_based_recommend_df(user_id: int, top_n=10) -> pd.DataFrame:
    event_df = load_event_data()
    user_profile = load_user_profile(user_id)
    event_df['similarity'] = calculate_similarity(event_df, user_profile).round(3)
    return (event_df.sort_values('similarity', ascending=False)
                    .loc[:, ['id','title','similarity']]
                    .head(top_n)
                    .reset_index(drop=True))

# 정밀도 검사에서 호환용 별칭 
content_based_recommend = content_based_recommend_df
#cb_recommend_ids = content_based_recommend_ids
def content_based_recommend_ids(user_id: int, top_n=10) -> list[int]:
    df = content_based_recommend_df(user_id, top_n)
    return df['id'].dropna().astype(int).tolist()
# 중복 정의되어 있던 cb_recommend_ids 제거

# ===== top-k id 만 뽑기 =====
def cb_recommend_ids(user_id: int, top_k=10):
    df = content_based_recommend(user_id, top_n=top_k)
    id_col = 'id' if 'id' in df.columns else df.columns[0]
    return df[id_col].tolist()

# 2. 행동 기반 콘텐츠 필터링
def behavior_adjusted_recommend(user_id, top_n=10):
    event_df = load_event_data()
    user_profile = load_user_profile(user_id)
    event_df['similarity'] = calculate_similarity(event_df, user_profile).round(4)

    scores, _ = calculate_activity_scores(user_id)  # {event_id: score}
    # 안정화: 사용자 단위 min-max (분산 0이면 0 처리)
    if scores:
        s = pd.Series(scores)
        if s.max() > s.min():
            s = (s - s.min()) / (s.max() - s.min())
        else:
            s = s*0.0
        adj_factor = event_df['id'].map(s).fillna(0.0)
    else:
        adj_factor = pd.Series(0.0, index=event_df.index)

    event_df['adjusted_similarity'] = (event_df['similarity'] * (1 + adj_factor)).round(4)

    filtered_df = event_df[event_df['similarity'] > 0.2]
    if filtered_df.empty:
        filtered_df = event_df

    return filtered_df.sort_values('adjusted_similarity', ascending=False).head(top_n)

# 3. 협업 필터링 함수
#    (1) 데이터 형식 변환하고 (Surprise)
#    (2) 사용자 기반 협업 필터링 모델을 학습한다. (user_based=True) -> 나와 비슷한 유저를 찾을 수 있음
#    (3) 아직 평가하지 않은 행사를 찾아서 유저가 이 행사에 줄 평점을 예측한다. 
#    (4) 높은 평점으로 예상되는 행사를 추천한다. 

# 사용자 평점 데이터 불러오기
def load_ratings():
    eng = get_db_engine()
    df = pd.read_sql("""
        SELECT user_id, event_id, rating, created_at::timestamp AS created_at
        FROM surveys_surveyreview
        WHERE rating IS NOT NULL
    """, eng)
    df['created_at'] = pd.to_datetime(df['created_at'])
    df = df.sort_values('created_at').drop_duplicates(['user_id','event_id'], keep='last')
    return df[['user_id','event_id','rating']]

# Surprise 형식으로 변환 
def prepare_dataset(df):
    reader = Reader(rating_scale=(0,5))
    return Dataset.load_from_df(df[['user_id', 'event_id', 'rating']], reader)

def get_unrated_events(user_id, ratings_df, all_event_ids):
    rated_events = ratings_df[ratings_df['user_id'] == user_id]['event_id'].tolist()
    return [item for item in all_event_ids if item not in rated_events]

def collaborative_filtering_recommend(user_id, top_n=5):
    ratings_df = load_ratings()
    if ratings_df.empty:
        return []
    
    # 유저가 아예 평점 기록이 없으면 CB로 폴백
    if user_id not in set(ratings_df['user_id'].unique()):
        cb = content_based_recommend_df(user_id, top_n)
        if cb.empty:
            return []
        cb = cb.copy()
        cb.rename(columns={'similarity': 'pred_rating'}, inplace=True)
        return cb  # id, title, pred_rating 형태와 호환

    reader = Reader(rating_scale=(0,5))
    data = Dataset.load_from_df(ratings_df[['user_id','event_id','rating']], reader)
    trainset = data.build_full_trainset()

    algo = SVD(n_factors=10, n_epochs=30, reg_all=0.05, random_state=42)
    algo.fit(trainset)

    # 후보: 학습에 등장한 아이템들 중 사용자가 아직 안 본 것
    all_items = set(ratings_df['event_id'].unique())
    seen = set(ratings_df.loc[ratings_df['user_id'] == user_id, 'event_id'].unique())
    candidates = list(all_items - seen)
    if not candidates:
        return []

    scored = [(iid, algo.predict(user_id, iid, clip=False).est) for iid in candidates]
    top_preds = sorted(scored, key=lambda x: x[1], reverse=True)[:top_n]
    ids_ordered = [int(eid) for eid, _ in top_preds]

    # 이벤트 메타 가져오고 원래 순서 유지
    eng = get_db_engine()
    placeholders = ', '.join(['%s'] * len(ids_ordered))
    q = f"""
        SELECT id, title, codename, guname, use_fee, main_img, place, start_date, end_date
        FROM search_culturalevent
        WHERE id IN ({placeholders})
    """
    ev = pd.read_sql(q, eng, params=tuple(ids_ordered))
    ev['__order'] = pd.Categorical(ev['id'], ids_ordered, ordered=True)
    ev = ev.sort_values('__order').drop(columns='__order')

    pred_df = pd.DataFrame(top_preds, columns=['id', 'pred_rating'])
    return ev.merge(pred_df, on='id')

def evaluate_cf_rmse_mae(ratings_df):
    data = prepare_dataset(ratings_df)
    trainset, testset = train_test_split(data, test_size=0.2)  # 유저 시간 분할 쓰려면 custom
    algo = KNNBasic(sim_options={'name':'cosine','user_based':True})
    algo.fit(trainset)
    preds = algo.test(testset)
    rmse = accuracy.rmse(preds, verbose=False)
    mae  = accuracy.mae(preds,  verbose=False)
    return {'RMSE': rmse, 'MAE': mae}

def recommend_for_user(user_id, ratings_df, algo, top_n=5):
    """
    사용자 기반 협업 필터링(User-Based Collaborative Filtering) 추천 함수

    목적:
        - 특정 사용자가 아직 평가하지 않은 항목 중에서
          '나와 비슷한 취향을 가진 다른 사용자들'이 높게 평가한 항목을 추천
        - 예측 평점 계산만 수행하며, DB 조회는 하지 않음
        - collaborative_filtering_recommend()의 간소화 버전

    매개변수:
        user_id (int): 추천을 받을 사용자 ID
        ratings_df (pd.DataFrame): user_id, event_id, rating 컬럼을 가진 평점 데이터
        algo (surprise.AlgoBase): 학습된 Surprise 협업 필터링 모델 (예: KNNBasic)
        top_n (int): 추천할 항목 개수

    반환:
        list[tuple]: (event_id, predicted_rating) 형태의 리스트
                     예측 평점이 높은 순서로 정렬됨
    """
    # 사용자가 평가한 이벤트를 제외한 나머지 이벤트 가져오기
    all_event_ids = ratings_df['event_id'].unique()
    unrated_items = get_unrated_events(user_id, ratings_df, all_event_ids)

    predictions = []
    # 미평가 이벤트에 대한 예측 평점 계산
    for event_id in unrated_items:
        pred = algo.predict(user_id, event_id)
        predictions.append((event_id, pred.est))

    # 예측 평점이 높은 순으로 상위 top_n 추출
    top_preds = sorted(predictions, key=lambda x: x[1], reverse=True)[:top_n]

    return top_preds


# ===== 유틸: 안전한 Min-Max 정규화 =====
"""
- 데이터 값의 범위를 0~1 사이로 스케일링하여 서로 다른 범위의 점수들을 비교할 수 있음
- 데이터가 NULL이거나 분산이 없는 경우: 모든 값을 0으로 반환
"""
def _minmax(s: pd.Series) -> pd.Series:
    if s is None or len(s) == 0:
        return pd.Series(dtype=float)
    s = s.astype(float)
    s_min, s_max = s.min(), s.max()
    if pd.isna(s_min) or pd.isna(s_max) or s_max == s_min:
        # 분산이 없거나 NULL값이면 전부 0으로
        return pd.Series([0.0] * len(s), index=s.index)
    return (s - s_min) / (s_max - s_min)

# ===== 콘텐츠 점수 DataFrame(id, cb_score) =====
"""
- 유사도 점수: cb_raw
- 정규화된 유사도: cb_score
"""
def compute_cb_scores(user_id: int, top_k: int = None) -> pd.DataFrame:
    # content_based_recommend_df를 사용 (id, title, similarity)
    cb_df = content_based_recommend_df(user_id, top_n=10_000).copy()
    cb_df.rename(columns={'similarity': 'cb_raw'}, inplace=True)
    cb_df['cb_score'] = _minmax(cb_df['cb_raw'])
    keep_cols = ['id', 'cb_score', 'cb_raw', 'title']
    if top_k:
        cb_df = cb_df.sort_values('cb_score', ascending=False).head(top_k)
    return cb_df[keep_cols]

# ===== 행동 점수 DataFrame(id, beh_score) =====
"""
- 유사도 점수: beh_raw
- 정규화된 유사도: beh_score
"""
def compute_behavior_scores(user_id: int, top_k: int = None) -> pd.DataFrame:
    beh_df = behavior_adjusted_recommend(user_id, top_n=10_000).copy()
    # behavior_adjusted_recommend가 title, adjusted_similarity를 갖고 옴
    if beh_df is None or beh_df.empty:
        return pd.DataFrame(columns=['id', 'beh_score', 'beh_raw', 'title'])
    beh_df.rename(columns={'adjusted_similarity': 'beh_raw'}, inplace=True)
    beh_df['beh_score'] = _minmax(beh_df['beh_raw'])
    keep_cols = ['id', 'beh_score', 'beh_raw', 'title']
    if top_k:
        beh_df = beh_df.sort_values('beh_score', ascending=False).head(top_k)
    return beh_df[keep_cols]

# ===== 협업 점수 DataFrame(id, cf_score) =====
"""
- 유사도 점수: cf_raw
- 정규화된 유사도: cf_score
"""
def compute_cf_scores(user_id: int, top_k: int = None) -> pd.DataFrame:
    cf_df = collaborative_filtering_recommend(user_id, top_n=10_000)
    if cf_df is None or isinstance(cf_df, list) or len(cf_df) == 0:
        # collaborative_filtering_recommend가 []를 리턴할 수도 있음
        return pd.DataFrame(columns=['id', 'cf_score', 'cf_raw', 'title'])
    cf_df = cf_df.copy()
    cf_df.rename(columns={'pred_rating': 'cf_raw'}, inplace=True)
    # 예측 평점은 보통 0~5 스케일 => 데이터 기반 min-max가 더 안전
    cf_df['cf_score'] = _minmax(cf_df['cf_raw'])
    keep_cols = ['id', 'cf_score', 'cf_raw', 'title']
    if top_k:
        cf_df = cf_df.sort_values('cf_score', ascending=False).head(top_k)
    return cf_df[keep_cols]

# ===== 메인: 하이브리드 추천 =====
def hybrid_recommend(
    user_id: int,
    top_n: int = 10,
    weights: tuple = (0.3, 0.4, 0.3),  # 각 추천 점수의 가중치 (w_cb, w_beh, w_cf)
    dedup: bool = True,
    min_components: int = 1,           # 최소 몇 개 축에서 점수가 있어야 포함할지(0~3)
    return_components: bool = True     # 부분 점수 컬럼 포함 여부
) -> pd.DataFrame:
    """
    하이브리드 추천: 콘텐츠(CB) + 행동(BEH) + 협업(CF) 가중합
    - 각 축을 0~1로 정규화 후 가중합
    - 결측/콜드스타트 처리
    - 디버깅용 부분점수와 Raw 값 포함

    반환 컬럼:
      id, title, score, [cb_score, beh_score, cf_score, cb_raw, beh_raw, cf_raw]
    """
    w_cb, w_beh, w_cf = weights

    # 1) 각 추천의 점수를 계산
    cb = compute_cb_scores(user_id)
    beh = compute_behavior_scores(user_id)
    cf  = compute_cf_scores(user_id)

    # 2) 모든 점수 df를 병합
    out = cb[['id', 'title', 'cb_score', 'cb_raw']].copy() if not cb.empty else pd.DataFrame(columns=['id','title','cb_score','cb_raw'])
    for rec_df, score_col, raw_col in [
        (beh, 'beh_score', 'beh_raw'),
        (cf,  'cf_score',  'cf_raw')
    ]:
        out = pd.merge(out, rec_df[['id', 'title', score_col, raw_col]], on=['id', 'title'], how='outer')


    # 3) 결측치는 0으로 채움
    out[['cb_score','beh_score','cf_score','cb_raw','beh_raw','cf_raw']] = out[['cb_score','beh_score','cf_score','cb_raw','beh_raw','cf_raw']].fillna(0.0)

    if out.empty:
        return out
    
    # 4) min_components 필터링
    comp_cols = ['cb_score','beh_score','cf_score']
    out['nonzero_components'] = (out[comp_cols] > 0).sum(axis=1)
    out = out[out['nonzero_components'] >= min_components]

    if out.empty:
        return out

    # 5) 최종 점수 = 가중합
    out['score'] = (w_cb * out['cb_score']) + (w_beh * out['beh_score']) + (w_cf * out['cf_score'])

    # 6) 중복 제거 및 정렬
    # 'dedup=True'일 경우 같은 'id'를 가진 행은 처음 행만 남기고 나머지는 제거
    if dedup:
        out = out.drop_duplicates(subset=['id'])

    # 7) 정렬 & 상위 N
    out = out.sort_values('score', ascending=False)

    # 8) 반환 컬럼 구성
    cols_basic = ['id', 'title', 'score']
    cols_comp  = ['cb_score','beh_score','cf_score','cb_raw','beh_raw','cf_raw']
    cols = cols_basic + (cols_comp if return_components else [])
    out = out[cols].reset_index(drop=True)

    # 최종 top_n
    return out.head(top_n)


if __name__ == "__main__":
    user_id = 27
    # user_interest = {
    #     "interests": ["클래식", "축제-기타", "콘서트"],
    #     "area": "성북구",
    #     "fee_type": "무료",
    #     "together": "연인과"
    # }

    ratings_df = load_ratings()
    hybrid_df = hybrid_recommend(user_id, top_n=10, weights=(0.3, 0.4, 0.3))

    print("@@@@@@@@@ 콘텐츠 기반 추천 @@@@@@@@@")
    print(content_based_recommend(user_id, top_n=5)[['title','similarity']])
    print("@@@@@@@@@ 행동 기반 추천 @@@@@@@@@")
    print(behavior_adjusted_recommend(user_id, top_n=5)[['title','adjusted_similarity']])
    print("@@@@@@@@@ 협업 필터링 추천 @@@@@@@@@")
    print(collaborative_filtering_recommend(user_id, top_n=5)[['title','pred_rating']])
    print(evaluate_cf_rmse_mae(ratings_df))
    print("@@@@@@@@@ 하이브리드 추천 @@@@@@@@@")
    print(hybrid_df)