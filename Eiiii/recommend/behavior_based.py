from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv
from pathlib import Path
from geopy.distance import geodesic  # 거리 계산용

# 환경변수 로드
env_path = Path(__file__).resolve().parent.parent / "Eiiii" / ".env"
load_dotenv(dotenv_path=env_path)

def get_db_engine():
    return create_engine(
        f"postgresql+psycopg2://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )

#행동 기반 추천 점수 계산
def calculate_activity_scores(user_id):
    engine = get_db_engine()
    conn = engine.connect()

    # 유저 정보 가져오기 (좌표)
    user_query = text("SELECT latitude, longitude FROM accounts_customuser WHERE id = :user_id")
    user_loc = conn.execute(user_query, {"user_id": user_id}).fetchone()

    if not user_loc:
        return {}

    user_latitude, user_longitude = user_loc
    scores = {}
    details = {}  # 점수 요소별 저장

    #거리 기반 점수
    event_query = text("SELECT id, title, lat, lot FROM search_culturalevent WHERE lat IS NOT NULL AND lot IS NOT NULL")
    events = conn.execute(event_query).fetchall()

    for event in events:
        event_id, title, lot, lat = event
        event_latitude = float(lat)
        event_longitude = float(lot)

        distance_km = geodesic(
            (user_latitude, user_longitude),
            (event_latitude, event_longitude)
        ).km
        distance_score = max(0, 1 - distance_km / 10) # 가까울수록 점수 높게: 10km 이내면 +1, 멀수록 0으로 감소
        scores[event_id] = distance_score
        details[event_id] = {
            "title": title,
            "distance_score": distance_score,
            "review_score": 0,
            "like_score": 0
        }

        #print("유저:", user_latitude, user_longitude)
        #print("이벤트:", event_latitude, event_longitude)

    #좋아요 +1점
    like_query = text("SELECT event_id FROM details_culturaleventlike WHERE user_id = :user_id")
    liked = conn.execute(like_query, {"user_id": user_id}).fetchall()
    for row in liked:
        event_id = row[0]
        if event_id in scores:
            scores[event_id] += 1.0
            details[event_id]["like_score"] = 1.0

    #리뷰 작성 +2점, 평점 +0.5~+1점
    review_query = text("SELECT event_id, rating FROM surveys_surveyreview WHERE user_id = :user_id")
    reviews = conn.execute(review_query, {"user_id": user_id}).fetchall()
    #print("리뷰 기반 가중치용 리뷰 목록:", reviews)
    for event_id, rating in reviews:
        if event_id in scores:
            review_score = 2 + (0.5 + 0.1 * rating)  # 기본 2점 + 평점 기반 추가 점수 긍까 평점 5점 주면 1.0추가, 4점 주면 0.9추가..
            scores[event_id] += review_score
            details[event_id]["review_score"] = review_score
    
    # 최종 종합 점수
    for event_id in scores:
        details[event_id]["total_score"] = scores[event_id]

    conn.close()
    return scores, details


#테스트
if __name__ == "__main__":
    user_id = 3
    result = calculate_activity_scores(user_id)

    sorted_result = sorted(result.items(), key=lambda x: x[1]["total_score"], reverse=True)

    print("\n추천 결과 (상위 10개):")
    for rank, (event_id, data) in enumerate(sorted_result[:10], 1):
        print(f"{rank}위. [{data['title']}] (ID: {event_id})")
        print(f"      거리점수: {data['distance_score']:.3f}")
        print(f"      좋아요점수: {data['like_score']:.3f}")
        print(f"      리뷰점수: {data['review_score']:.3f}")
        print(f"      총점: {data['total_score']:.3f}\n")

    
