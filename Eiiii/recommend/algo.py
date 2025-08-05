from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine
import pandas as pd
from surprise import Dataset, Reader
from surprise.model_selection import train_test_split
from surprise import KNNBasic

# 1. 회원가입 초기: 콘텐츠 기반 필터링
#    데이터: 카테고리 / 지역 / 유, 무료 / 테마
#    (1) 이벤트 데이터와 사용자 정보 데이터를 벡터화 하고
#    (2) 각각의 이벤트 데이터에서 중요한 키워드를 뽑은 후 (tfidf)
#    (3) 이벤트 데이터와 사용자 데이터 간 유사도를 계산한다. (cosine-similarity)
#    (4) 유사도가 높은 이벤트를 사용자에게 추천한다. 

# DB 연결
def get_db_engine():
    return create_engine(f'postgresql://postgres:YEPIqooeoqbpRqXtECPZJkUHRICyRNHt@mainline.proxy.rlwy.net:20700/railway')

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

def recommend_for_user(user_id, ratings_df, algo, top_n=5):
    all_event_ids = ratings_df['event_id'].unique()
    unrated_items = get_unrated_events(user_id, ratings_df, all_event_ids)

    predictions = []
    
    for id in unrated_items:
        pred = algo.predict(user_id, id)
        predictions.append((id, pred.est))

    top_preds = sorted(predictions, key=lambda x: x[1], reverse=True[:top_n])
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
