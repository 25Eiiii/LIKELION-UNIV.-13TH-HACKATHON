from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine
import pandas as pd
from surprise import Dataset, Reader
from surprise.model_selection import train_test_split
from surprise import KNNBasic

from behavior_based import calculate_activity_scores

import os
from dotenv import load_dotenv
from pathlib import Path

# ===== 공통 설정 =====
env_path = Path(__file__).resolve().parent.parent / "Eiiii" / ".env"
load_dotenv(dotenv_path=env_path)

# ===== 공통 유틸 =====
def get_db_engine():
    """PostgreSQL DB 엔진 생성"""
    return create_engine(
        f"postgresql+psycopg2://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )

# 1. 회원가입 초기: 콘텐츠 기반 필터링
#    데이터: 카테고리 / 지역 / 유, 무료 / 테마
#    (1) 이벤트 데이터와 사용자 정보 데이터를 벡터화 하고
#    (2) 각각의 이벤트 데이터에서 중요한 키워드를 뽑은 후 (tfidf)
#    (3) 이벤트 데이터와 사용자 데이터 간 유사도를 계산한다. (cosine-similarity)
#    (4) 유사도가 높은 이벤트를 사용자에게 추천한다. 



# 문화 행사 데이터를 문자열 벡터로 변환
def load_event_data():
    engine = get_db_engine()
    query = "SELECT * FROM search_culturalevent"
    df = pd.read_sql(query, engine)

    # 메타 칼럼 합쳐서 텍스트 벡터로 만들기
    # 텍스트 벡터로 만들어야 tfidf vectorizer 적용 가능함
    df['meta'] = df[['category', 'guname', 'use_fee', 'use_trgt']].astype(str).agg(' '.join, axis=1)

    return df

# 사용자 관심사를 문자열 벡터로 변환
def load_user_profile(user_interest: dict):
    return ' '.join([
        user_interest.get('interests', ''),
        user_interest.get('area', ''),
        user_interest.get('fee_type', ''),
        user_interest.get('together', '')
    ])

#TF-IDF로 사용자와 행사 유사도 계산
def calculate_similarity(event_df, user_profile):
    corpus = event_df['meta'].tolist() + [user_profile]
    tfidf = TfidfVectorizer()
    tfidf_matrix = tfidf.fit_transform(corpus)
    cosine_sim = cosine_similarity(tfidf_matrix[:-1], tfidf_matrix[-1]).flatten()
    return cosine_sim

# 1. 콘텐츠 기반 추천
def content_based_recommend(user_interests: dict, top_n=10):
    event_df = load_event_data()
    user_profile = load_user_profile(user_interests)
    event_df['similarity'] = calculate_similarity(event_df, user_profile).round(3)
    return event_df.sort_values('similarity', ascending=False).head(top_n)

# 2. 행동 기반 콘텐츠 필터링
def behavior_adjusted_recommend(user_id, user_interests, top_n=10):
    event_df = load_event_data()
    user_profile = load_user_profile(user_interests)
    event_df['similarity'] = calculate_similarity(event_df, user_profile).round(4)

    scores, _ = calculate_activity_scores(user_id)

    # 행동 점수 반영
    event_df['adjusted_similarity'] = event_df.apply(
        lambda row: round(row['similarity'] * (1 + scores.get(row['id'], 0)), 4),
        axis=1
    )

    filtered_df = event_df[event_df['similarity'] > 0.2]
    return filtered_df.sort_values('adjusted_similarity', ascending=False).head(top_n)

# 3. 협업 필터링 함수
#    (1) 데이터 형식 변환하고 (Surprise)
#    (2) 사용자 기반 협업 필터링 모델을 학습한다. (user_based=True) -> 나와 비슷한 유저를 찾을 수 있음
#    (3) 아직 평가하지 않은 행사를 찾아서 유저가 이 행사에 줄 평점을 예측한다. 
#    (4) 높은 평점으로 예상되는 행사를 추천한다. 

# 사용자 평점 데이터 불러오기
def load_ratings():
    engine = get_db_engine()
    return pd.read_sql("SELECT user_id, event_id, rating FROM surveys_surveyreview;", engine)

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

    data = prepare_dataset(ratings_df)
    trainset, _ = train_test_split(data, test_size=0.2)
    algo = KNNBasic(sim_options={'name': 'cosine', 'user_based': True})
    algo.fit(trainset)

    unrated_items = get_unrated_events(user_id, ratings_df, ratings_df['event_id'].unique())
    if not unrated_items:
        return []

    predictions = [(eid, algo.predict(user_id, eid).est) for eid in unrated_items]
    top_preds = sorted(predictions, key=lambda x: x[1], reverse=True)[:top_n]

    engine = get_db_engine()
    top_event_ids = [int(p[0]) for p in top_preds]
    placeholders = ', '.join(['%s'] * len(top_event_ids))
    query = f"""
        SELECT id, title, category, guname, use_fee, main_img, place, start_date, end_date
        FROM search_culturalevent
        WHERE id IN ({placeholders})
    """
    event_df = pd.read_sql(query, engine, params=tuple(top_event_ids))

    pred_df = pd.DataFrame(top_preds, columns=['id', 'pred_rating'])
    return event_df.merge(pred_df, on='id').sort_values('pred_rating', ascending=False)

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



if __name__ == "__main__":
    user_interest = {
        "interests": "체험",
        "area": "동대문구",
        "fee_type": "무료",
        "together": "연인과"
    }

    print("@@@@@@@@@ 콘텐츠 기반 추천 @@@@@@@@@")
    print(content_based_recommend(user_interest, top_n=5)[['title','similarity']])
    print("@@@@@@@@@ 행동 기반 추천 @@@@@@@@@")
    print(behavior_adjusted_recommend(1, user_interest, top_n=5)[['title','adjusted_similarity']])
    print("@@@@@@@@@ 협업 필터링 추천 @@@@@@@@@")
    print(collaborative_filtering_recommend(1, top_n=5)[['title','pred_rating']])