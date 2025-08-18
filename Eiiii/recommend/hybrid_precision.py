from algo import hybrid_recommend
from behavior_based import *

def precision_at_k_recommend(user_id, ground_truth, top_n=10, return_components=False):
    """
    특정 사용자 추천 결과에 대해 Precision@K 계산
    user_id: 추천 대상 사용자
    ground_truth: 실제로 사용자가 좋아한 아이템 ID 집합 (set)
    top_n: 상위 몇 개 추천을 평가할지
    return_components: hybrid_recommend 반환 옵션
    """
    # 1) 추천 결과 가져오기
    rec_df = hybrid_recommend(user_id, top_n=top_n, return_components=return_components)
    if rec_df.empty:
        return 0.0

    # 2) 추천 아이템 ID 리스트
    rec_ids = rec_df['id'].tolist()

    # 3) Precision 계산
    hits = sum([1 for r in rec_ids if r in ground_truth])
    precision = hits / len(rec_ids)
    print(f"{user_id}: {precision}")
    return precision

def mean_precision_at_k(users, ground_truth_dict, top_n=10):
    """
    여러 사용자에 대한 평균 Precision@K 계산
    users: 사용자 ID 리스트
    ground_truth_dict: {user_id: 실제 좋아한 아이템 ID 집합}
    """
    precisions = []
    for u in users:
        gt = ground_truth_dict.get(u, set())
        p = precision_at_k_recommend(u, gt, top_n=top_n)
        precisions.append(p)
    if not precisions:
        return 0.0
    return sum(precisions) / len(precisions)


users = [142, 137, 133, 30, 28, 27, 20] # 142, 137, 133, 30, 
ground_truth_dict = {
    142: {57, 46, 142},
    137: {70, 69},
    133: {30, 81},
    30: {105, 104},
    28: {106, 107},
    27: {106, 107},
    20: {132, 129, 128, 124}
}

avg_precision = mean_precision_at_k(users, ground_truth_dict, top_n=10)
print("Mean Precision@10:", avg_precision)

