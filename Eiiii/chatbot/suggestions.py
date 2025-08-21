import random, re
from functools import lru_cache
from datetime import timedelta
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

# ───────────────────────── utils ─────────────────────────

@lru_cache(maxsize=1)
def get_categories():
    """DB에서 codename(distinct) 읽어 카테고리 목록 확보 (없으면 기본값)."""
    try:
        from search.models import CulturalEvent  
        qs = (CulturalEvent.objects
              .exclude(codename__isnull=True)
              .exclude(codename__exact="")
              .values_list("codename", flat=True)
              .distinct())
        cats = list(qs)
        if cats:
            return cats
    except Exception:
        pass

    return ["전시/미술", "교육/체험", "축제", "국악", "독주/독창회",
            "무용", "뮤지컬/오페라", "연극", "콘서트", "클래식", "기타", "영화"]

def split_tags(text: str):
    if not text:
        return []
    return [t for t in re.split(r"[\s,;/]+", str(text).strip()) if t]

def get_user_area(user):
    try:
        from profiles.models import UserProfile  
        return (UserProfile.objects
                .filter(user_id=getattr(user, "id", None))
                .values_list("area", flat=True)
                .first())
    except Exception:
        return None

def get_category_weights(user):
    """
    기본 1.0 + 프로필 선호(interests, theme_codes)에 가중치 부여.
    (좋아요/조회 모델 없다고 하여 프로필 정보만 사용)
    """
    cats = get_categories()
    weights = {c: 1.0 for c in cats}
    if not getattr(user, "is_authenticated", False):
        return weights

    try:
        from profiles.models import UserProfile
        row = (UserProfile.objects
               .filter(user_id=user.id)
               .values("interests", "theme_codes")
               .first()) or {}
        # interests / theme_codes 안에 codename과 같은 문자열이 있으면 가중치 +
        for token in split_tags(row.get("interests")) + split_tags(row.get("theme_codes")):
            if token in weights:
                weights[token] += 3.0  # 선호도 가중
    except Exception:
        pass
    return weights

def weighted_pick_category(rng, weights):
    cats = list(weights.keys())
    w = [weights[c] for c in cats]
    return rng.choices(cats, weights=w, k=1)[0]

# 화면에 늘 섞어줄 일반 질문
STATIC_POOL = [
    {"label": "이번 주 내 근처 문화 활동 추천 해줄래?", "payload": "이번 주 근처 문화 활동 추천 해줄래?"},
    {"label": "이번 달 인기 문화 행사가 뭐야?", "payload": "이번 달 인기 문화 행사가 뭐야?"},
    {"label": "주말에 갈만한 축제 뭐 있지?", "payload": "주말에 갈만한 축제 뭐 있지?"},
    {"label": "가까운 곳에서 열리는 무료 공연 추천해줘", "payload": "가까운 곳에서 열리는 무료 공연 추천해줘"},
    {"label": "가족이랑 가기 좋은 문화 행사 있을까?", "payload": "가족이랑 가기 좋은 문화 행사 있을까?"},
]

@api_view(["GET"])
@permission_classes([AllowAny])
def suggested_queries(request):
    """
    개인화(프로필 area/선호 카테고리) + 일반 질문을 섞어 k개 반환.
    user+date 시드로 하루 동안 고정 노출.
    """
    k = max(1, min(int(request.GET.get("k", 3)), 5))
    user_key = getattr(getattr(request, "user", None), "id", "anon")
    seed = f"{user_key}-{timezone.localdate()}"
    rng = random.Random(seed)

    area = get_user_area(request.user) if getattr(request, "user", None) else None
    weights = get_category_weights(request.user)

    # 개인화 템플릿
    dyn_templates = []
    if area:
        dyn_templates = [
            "이번 주 {area} {category} 추천해줘",
            "{area} {category} 뭐 있어?",
            "{area}에서 가까운 {category} 알려줘",
        ]
    else:
        dyn_templates = [
            "이번 주 {category} 추천해줘",
            "{category} 뭐 볼만한 거 있을까?",
        ]

    # 개인화 질문 최대 2개 생성
    dyn_count = min(2, k)
    dyn_items = []
    used = set()
    for _ in range(dyn_count):
        tpl = rng.choice(dyn_templates)
        # 중복 카테고리 방지
        for _try in range(5):
            cat = weighted_pick_category(rng, weights)
            key = (tpl, cat, area)
            if key not in used:
                used.add(key)
                break
        text = tpl.format(area=area or "", category=cat)
        dyn_items.append({"label": text.strip(), "payload": text.strip()})

    # 나머지는 일반 질문에서 랜덤
    static_needed = k - len(dyn_items)
    static_items = rng.sample(STATIC_POOL, k=static_needed)

    items = dyn_items + static_items
    rng.shuffle(items)

    return Response({
        "items": [{"id": f"sugg-{i}", "label": it["label"], "payload": it["payload"]}
                  for i, it in enumerate(items)]
    })
