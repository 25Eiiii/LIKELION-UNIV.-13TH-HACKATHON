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
env_path = Path(__file__).resolve().parent.parent / "Eiiii" / ".env"
print("찾는 경로:", env_path)  # 확인용

load_dotenv(dotenv_path=env_path)
print("PORT:", os.getenv("DB_PORT")) # 확인용
# 1. 회원가입 초기: 콘텐츠 기반 필터링
#    데이터: 카테고리 / 지역 / 유, 무료 / 테마
#    (1) 이벤트 데이터와 사용자 정보 데이터를 벡터화 하고
#    (2) 각각의 이벤트 데이터에서 중요한 키워드를 뽑은 후 (tfidf)
#    (3) 이벤트 데이터와 사용자 데이터 간 유사도를 계산한다. (cosine-similarity)
#    (4) 유사도가 높은 이벤트를 사용자에게 추천한다. 

# DB 연결
def get_db_engine():
    return create_engine(
        f"postgresql+psycopg2://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )

# 문화 행사 데이터를 문자열 벡터로 변환
def load_event_data():
    engine = get_db_engine()
    query = "SELECT * FROM search_culturalevent"
    df = pd.read_sql(query, engine)

    # 메타 칼럼 합쳐서 텍스트 벡터로 만들기
    # 텍스트 벡터로 만들어야 tfidf vectorizer 적용 가능함
    df['meta'] = df[['category', 'guname', 'use_fee', 'use_trgt']].astype(str).agg(' '.join, axis=1)

    return df

# 사용자 정보를 문자열 벡터로 변환
def load_user_data(user_interest: dict):
    user_mapped = {
        'category': user_interest.get('interests', ''),
        'guname': user_interest.get('area', ''),
        'use_fee': user_interest.get('fee_type', ''),
        'use_trgt': user_interest.get('together', '')
    }
    return ' '.join(user_mapped.values())

# 추천 함수
def content_based_recommend(user_interests: dict, top_n=10):
    event_df = load_event_data()
    user_profile = load_user_data(user_interests)

    # TF-IDF 벡터화
    # 각 행사의 중요 키워드 추출
    corpus = event_df['meta'].tolist() + [user_profile]
    tfidf = TfidfVectorizer()
    tfidf_matrix = tfidf.fit_transform(corpus)

    # 사용자와 행사 간 유사도 계산
    event_vectors = tfidf_matrix[:-1]
    user_vector = tfidf_matrix[-1]
    cosine_sim = cosine_similarity(event_vectors, user_vector).flatten()
    event_df['similarity'] = cosine_sim.round(3)

    # 유사도 높은 순으로 정렬
    result = event_df.sort_values('similarity', ascending=False).head(top_n)

    return result[['id', 'title', 'category', 'guname', 'use_fee', 'use_trgt', 'similarity', 'main_img', 'place', 'start_date','end_date']]


# 2. 행동 기반 콘텐츠 필터링
def behavior_adjusted_recommend(user_id, user_interests, top_n=10):
    event_df = load_event_data()
    user_profile = load_user_data(user_interests)

    # TF-IDF 벡터화
    corpus = event_df['meta'].tolist() + [user_profile]
    tfidf = TfidfVectorizer()
    tfidf_matrix = tfidf.fit_transform(corpus)

    # 유사도 계산
    event_vectors = tfidf_matrix[:-1]
    user_vector = tfidf_matrix[-1]
    cosine_sim = cosine_similarity(event_vectors, user_vector).flatten()
    event_df['similarity'] = cosine_sim.round(4)

    # 행동 점수 계산
    scores, _ = calculate_activity_scores(user_id)


    # 행동 점수 반영 (예: 유사도 × (1 + 행동 점수))
    def apply_behavior_score(row):
        base_sim = row['similarity']
        event_id = row['id']
        activity_score = scores.get(event_id, 0)
        return round(base_sim * (1 + activity_score), 4)

    event_df['adjusted_similarity'] = event_df.apply(apply_behavior_score, axis=1)

    # adjusted_similarity 기준 정렬하되
    # similarity 점수가 너무 낮은 건 걸러주기 (예: 관심사가 너무 다르면 제외)
    filtered_df = event_df[event_df['similarity'] > 0.2]
    result = filtered_df.sort_values('adjusted_similarity', ascending=False).head(top_n)

    return result

#2번 테스트 출력 포맷용
def print_behavior_results(df):
    print("[2번] 행동 기반 콘텐츠 필터링 추천 결과\n")
    for rank, (_, row) in enumerate(df.iterrows(), start=1):
        print(f"{rank}위. [{row['title']}]")
        print(f"      유사도(TF-IDF): {row['similarity']:.4f}")
        print(f"      가중 유사도(행동 반영): {row['adjusted_similarity']:.4f}\n")

# 3. 협업 필터링 함수
#    (1) 데이터 형식 변환하고 (Surprise)
#    (2) 사용자 기반 협업 필터링 모델을 학습한다. (user_based=True) -> 나와 비슷한 유저를 찾을 수 있음
#    (3) 아직 평가하지 않은 행사를 찾아서 유저가 이 행사에 줄 평점을 예측한다. 
#    (4) 높은 평점으로 예상되는 행사를 추천한다. 

# 사용자 평점 데이터 불러오기
def load_ratings():
    engine = get_db_engine()
    query = "SELECT user_id, event_id, rating FROM surveys_surveyreview;"
    df = pd.read_sql(query, engine)
    return df

# Surprise 형식으로 변환 
def prepare_dataset(df):
    reader = Reader(rating_scale=(0,5))
    data = Dataset.load_from_df(df[['user_id', 'event_id', 'rating']], reader)
    return data

ratings_df = load_ratings()
data = prepare_dataset(ratings_df)
trainset, testset = train_test_split(data, test_size=0.2)

# 사용자 기반 협업 필터링 모델 학습
sim_options = {
    'name': 'cosine',
    'user_based': True
}

algo = KNNBasic(sim_options=sim_options) # knn 알고리즘 사용한 모델 생성

algo.fit(trainset) # 학습 

# 추천 함수
def get_unrated_events(user_id, ratings_df, all_event_ids):
    rated_events = ratings_df[ratings_df['user_id'] == user_id]['event_id'].tolist()    # 평가한 이벤트

    unrated_events = [item for item in all_event_ids if item not in rated_events]       # 평가 안 한 이벤트

    return unrated_events

#협업 필터링 기반 추천
def collaborative_filtering_recommend(user_id, top_n=5):
    # 평점 데이터 로드
    ratings_df = load_ratings()

    if ratings_df.empty:
        print("⚠️ 평점 데이터가 없습니다. 협업 필터링을 수행할 수 없습니다.")
        return []

    # Surprise 데이터 준비
    data = prepare_dataset(ratings_df)
    trainset, _ = train_test_split(data, test_size=0.2)

    # KNNBasic 모델 (사용자 기반)
    sim_options = {
        'name': 'cosine',
        'user_based': True
    }
    algo = KNNBasic(sim_options=sim_options)
    algo.fit(trainset)

    # 평가하지 않은 행사 찾기
    all_event_ids = ratings_df['event_id'].unique()
    unrated_items = get_unrated_events(user_id, ratings_df, all_event_ids)

    if not unrated_items:
        print(f"⚠️ user_id={user_id}는 모든 이벤트를 평가했습니다.")
        return []

    # 각 미평가 행사에 대한 평점 예측
    predictions = []
    for event_id in unrated_items:
        pred = algo.predict(user_id, event_id)
        predictions.append((event_id, pred.est))  # (행사 ID, 예측 평점)

    # 높은 평점 순으로 정렬 후 top_n 반환
    top_preds = sorted(predictions, key=lambda x: x[1], reverse=True)[:top_n]

    # DB에서 행사 상세정보 가져오기
    if top_preds:
        engine = get_db_engine()
        top_event_ids = [int(p[0]) for p in top_preds]
        placeholders = ', '.join(['%s'] * len(top_event_ids))
        query = f"""
            SELECT id, title, category, guname, use_fee, main_img, place, start_date, end_date
            FROM search_culturalevent
            WHERE id IN ({placeholders})
        """
        event_df = pd.read_sql(query, engine, params=tuple(top_event_ids))

        # 예측 평점 붙이기
        pred_df = pd.DataFrame(top_preds, columns=['id', 'pred_rating'])
        result_df = event_df.merge(pred_df, on='id')

        # 평점 높은 순 정렬
        result_df = result_df.sort_values('pred_rating', ascending=False)
        return result_df

    return []

def recommend_for_user(user_id, ratings_df, algo, top_n=5):
    all_event_ids = ratings_df['event_id'].unique()
    unrated_items = get_unrated_events(user_id, ratings_df, all_event_ids)

    predictions = []
    
    for id in unrated_items:
        pred = algo.predict(user_id, id)
        predictions.append((id, pred.est))

    #top_preds = sorted(predictions, key=lambda x: x[1], reverse=True[:top_n])
    top_preds = sorted(predictions, key=lambda x: x[1], reverse=True)[:top_n]

    return top_preds


if __name__ == "__main__":
    user_interest = {
        "interests": "체험",
        "area": "동대문구",
        "fee_type": "무료",
        "together": "연인과"
    }

    recs = content_based_recommend(user_interest, top_n=5)
    print(recs[['title', 'similarity', 'start_date']])

    print("@@@@@@@@@@@@@@@@@@@@2번 코드 테스트@@@@@@@@@@")
    user_id = 1
    recs = behavior_adjusted_recommend(user_id, user_interest, top_n=5)
    print_behavior_results(recs)
    
    print("@@@@@@@@@@@@@@@@@@@@3번 코드 테스트@@@@@@@@@@")
    user_id = 1
    recs_cf = collaborative_filtering_recommend(user_id, top_n=5)

    print("[3번] 협업 필터링 추천 결과\n")
    for rank, row in enumerate(recs_cf.itertuples(), start=1):
        print(f"{rank}위. [{row.title}] - 예측 평점: {row.pred_rating:.2f}")