from typing import Any, Dict, List, Text
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, FollowupAction
import requests
import logging

import urllib.parse

def _auth_headers_ascii(tracker: Tracker) -> Dict[str, str]:
    token = tracker.get_slot("auth_token")
    if not token:
        return {}
    ascii_token = str(token).encode("ascii", "ignore").decode("ascii")
    return {
        "Authorization": f"Bearer {ascii_token}",
        "Accept": "application/json",
        "User-Agent": "boogi-bot/1.0 (+requests)"
    }

def _encode_params_utf8(params: Dict[str, Any]) -> Dict[str, Any]:
    """한글 파라미터를 확실히 퍼센트 인코딩해서 전달 (이중 인코딩 방지).
    숫자/불린은 그대로, 문자열만 quote."""
    out = {}
    for k, v in params.items():
        if v is None:
            continue
        if isinstance(v, (int, float, bool)):
            out[k] = v
        else:
            s = str(v)
            # 이미 퍼센트 인코딩된 값이면 그대로 두고, 아니면 UTF-8로 인코딩
            if "%" in s:
                out[k] = s
            else:
                out[k] = urllib.parse.quote(s, safe="")
    return out

logger = logging.getLogger(__name__)

# ===== 엔드포인트 =====
BASE_URL        = "http://127.0.0.1:8000"
LOGIN_ENDPOINT  = "/api/recommend/chat"     # 로그인 전용
PUBLIC_ENDPOINT = "/api/recommend/public"   # 비로그인 전용(팀원 개발 예정)

# ===== 키워드 분기 =====
NEARBY_KEYWORDS = ["근처", "가까운", "주변", "이번 주", "이번주"]
THEME_KEYWORDS  = ["인기", "요즘", "주말", "가족", "가족이랑", "가족과"]

# ===== 페이징 =====
PAGE_SIZE = 3

def choose_endpoint_and_headers(tracker: Tracker) -> tuple[str, Dict[str, str]]:
    token = tracker.get_slot("auth_token")
    if token:
        # 반드시 ASCII 강제 버전 사용
        return f"{BASE_URL}{LOGIN_ENDPOINT}", _auth_headers_ascii(tracker)
    return f"{BASE_URL}{PUBLIC_ENDPOINT}", {}

class ActionDetermineNextStep(Action):
    def name(self) -> Text:
        return "action_determine_next_step"

    def run(self, dispatcher, tracker, domain):
        text = (tracker.latest_message.get("text") or "").strip()
        area = tracker.get_slot("area")
        category = tracker.get_slot("category")  # UI 버튼이라 이미 codename 보장

        if category or area:
            return [
                SlotSet("category", category),
                SlotSet("area", area),
                SlotSet("page", 1),
                FollowupAction("action_recommend_event"),
            ]

        if any(k in text for k in NEARBY_KEYWORDS):
            dispatcher.utter_message(response="utter_ask_area")
            return []
        if any(k in text for k in THEME_KEYWORDS):
            dispatcher.utter_message(response="utter_ask_category")
            return []

        dispatcher.utter_message(response="utter_ask_area")
        return []

class ActionRecommendEvent(Action):
    def name(self) -> Text:
        return "action_recommend_event"

    def run(self, dispatcher, tracker, domain):
        area = tracker.get_slot("area")
        category = tracker.get_slot("category")  # 이미 codename
        page = tracker.get_slot("page") or 1

        # 1) 원본 params
        params = {"limit": PAGE_SIZE, "page": page}
        if area:     params["area"] = area
        if category: params["category"] = category

        # 2) URL/헤더 선택(헤더는 ASCII 보장), params는 UTF-8 퍼센트 인코딩
        url, headers = choose_endpoint_and_headers(tracker)
        encoded_params = _encode_params_utf8(params)

        try:
            logger.info("Calling recommend: url=%s params=%s headers=%s", url, encoded_params, headers)
            resp = requests.get(
                url,
                params=encoded_params,
                headers=headers,
                timeout=(3, 15)  
            )
            resp.raise_for_status()
            items = resp.json().get("results", [])
        except Exception as e:
            logger.exception("recommend API 호출 실패: %s", e)
            dispatcher.utter_message(text="추천 서버와 통신에 문제가 있어요. 잠시 후 다시 시도해 주세요.")
            return []

        if not items:
            dispatcher.utter_message(text="조건에 맞는 행사가 지금은 없네요. 다른 분류로 찾아볼까요?")
            return []

        header_area = f"'{area}'에서 " if area else ""
        header_cat  = f"'{category}' " if category else ""
        dispatcher.utter_message(text=f"{header_area}{header_cat}추천이에요.")

        for it in items[:PAGE_SIZE]:
            title = it.get("title") or "제목 없음"
            place = it.get("place") or "장소 미정"
            date  = it.get("date")  or "일정 미정"
            detail_url = it.get("url") or f"{BASE_URL}/events/{it.get('id')}"
            dispatcher.utter_message(text=f"• [{title}]({detail_url}) — {place} / {date}")

        dispatcher.utter_message(text="더 볼까요? '더 보기'라고 말해보세요!")
        return [SlotSet("page", page + 1)]

class ActionShowMore(Action):
    def name(self) -> Text:
        return "action_show_more"

    def run(self, dispatcher, tracker, domain):
        area = tracker.get_slot("area")
        category = tracker.get_slot("category")
        page = tracker.get_slot("page") or 1

        # 1) 원본 params
        params = {"limit": PAGE_SIZE, "page": page}
        if area:     params["area"] = area
        if category: params["category"] = category

        # 2) URL/헤더/인코딩
        url, headers = choose_endpoint_and_headers(tracker)
        encoded_params = _encode_params_utf8(params)

        try:
            logger.info("Calling recommend more: url=%s params=%s headers=%s", url, encoded_params, headers)
            resp = requests.get(
                url,
                params=encoded_params,
                headers=headers,
                timeout=(3, 15)  
            )
            resp.raise_for_status()
            items = resp.json().get("results", [])
        except Exception as e:
            logger.exception("recommend more API 호출 실패: %s", e)
            dispatcher.utter_message(text="더 보기를 불러오는데 문제가 생겼어요. 잠시 후 다시 시도해 주세요.")
            return []
        
        if not items:
            dispatcher.utter_message(text="더 이상 결과가 없어요. 다른 분류나 지역으로 찾아볼까요?")
            return []

        for it in items:
            title = it.get("title") or "제목 없음"
            place = it.get("place") or "장소 미정"
            date  = it.get("date")  or "일정 미정"
            detail_url = it.get("url") or f"{BASE_URL}/events/{it.get('id')}"
            dispatcher.utter_message(text=f"• [{title}]({detail_url}) — {place} / {date}")

        return [SlotSet("page", page + 1)]
