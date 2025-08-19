# actions.py
from typing import Any, Dict, Text
import logging
import requests

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import (
    SlotSet,
    FollowupAction,
    SessionStarted,
    ActionExecuted,
)

logger = logging.getLogger(__name__)

# ===== 엔드포인트 =====
BASE_URL        = "http://127.0.0.1:8000"
LOGIN_ENDPOINT  = "/api/recommend/chat"     # 로그인 전용
PUBLIC_ENDPOINT = "/api/pbrecommend/public/"   # 비로그인 전용(팀원 개발 예정)

# ===== 키워드 분기 =====
NEARBY_KEYWORDS = ["근처", "가까운", "주변", "이번 주", "이번주"]
THEME_KEYWORDS = ["인기", "요즘", "주말", "가족", "가족이랑", "가족과"]

# ===== 페이징 =====
PAGE_SIZE = 3


# ─────────────────────────────────────────────────────────────────────────────
# UTIL
# ─────────────────────────────────────────────────────────────────────────────
def _auth_headers(tracker: Tracker) -> Dict[str, str]:
    """Bearer 토큰이 있으면 Authorization 헤더 구성."""
    token = tracker.get_slot("auth_token")
    if not token:
        return {}
    # 토큰에 비ASCII 문자가 섞일 수 있는 환경이라면 아래 2줄 사용
    ascii_token = str(token).encode("ascii", "ignore").decode("ascii")
    return {
        "Authorization": f"Bearer {ascii_token}",
        "Accept": "application/json",
        "User-Agent": "boogi-bot/1.0 (+requests)",
    }


def _choose_endpoint_and_headers(tracker: Tracker) -> tuple[str, Dict[str, str]]:
    """로그인 여부에 따라 엔드포인트/헤더 선택."""
    token = tracker.get_slot("auth_token")
    if token:
        return f"{BASE_URL}{LOGIN_ENDPOINT}", _auth_headers(tracker)
    return f"{BASE_URL}{PUBLIC_ENDPOINT}", {}


def _call_reco(url: str, headers: Dict[str, str], params: Dict[str, Any]) -> requests.Response:
    """
    추천 API 호출 헬퍼.
    - 401/403이면 퍼블릭 엔드포인트로 자동 폴백.
    - URL 파라미터는 dict로 그대로 넘겨 requests에게 안전 인코딩을 맡긴다.
    """
    r = requests.get(url, params=params, headers=headers, timeout=(3, 15))
    if r.status_code in (401, 403):
        pub = f"{BASE_URL}{PUBLIC_ENDPOINT}"
        r = requests.get(pub, params=params, timeout=(3, 15))
    r.raise_for_status()
    return r


# ─────────────────────────────────────────────────────────────────────────────
# ACTIONS
# ─────────────────────────────────────────────────────────────────────────────
class ActionSessionStart(Action):
    def name(self) -> Text:
        return "action_session_start"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ):
        """
        세션 시작 시 REST 채널의 metadata에서 auth_token을 받아 슬롯에 저장.
        """
        events = [SessionStarted()]

        token = None
        if tracker.latest_message and tracker.latest_message.get("metadata"):
            token = tracker.latest_message["metadata"].get("auth_token")

        if token:
            events.append(SlotSet("auth_token", token))

        events.append(ActionExecuted("action_listen"))
        return events


class ActionDetermineNextStep(Action):
    def name(self) -> Text:
        return "action_determine_next_step"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ):
        text = (tracker.latest_message.get("text") or "").strip()
        area = tracker.get_slot("area")
        category = tracker.get_slot("category")  # UI 버튼이라 codename 보장 가정

        # 이미 area/category가 있으면 바로 추천으로
        if category or area:
            return [
                SlotSet("category", category),
                SlotSet("area", area),
                SlotSet("page", 1),
                FollowupAction("action_recommend_event"),
            ]

        # 사용자가 자연어로 근처/주말 등 요청한 경우
        if any(k in text for k in NEARBY_KEYWORDS):
            dispatcher.utter_message(response="utter_ask_area")
            return []
        if any(k in text for k in THEME_KEYWORDS):
            dispatcher.utter_message(response="utter_ask_category")
            return []

        # 기본값: 지역 먼저 유도
        dispatcher.utter_message(response="utter_ask_area")
        return []


class ActionRecommendEvent(Action):
    def name(self) -> Text:
        return "action_recommend_event"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ):
        area = tracker.get_slot("area")
        category = tracker.get_slot("category")
        page = tracker.get_slot("page") or 1

        # 1) 원본 params (requests가 안전하게 인코딩)
        params: Dict[str, Any] = {"limit": PAGE_SIZE, "page": page}
        if area:
            params["area"] = area
        if category:
            params["category"] = category

        # 2) URL/헤더 선택
        url, headers = _choose_endpoint_and_headers(tracker)

        # 3) 호출
        try:
            logger.info("Reco call: %s params=%s headers=%s", url, params, headers)
            resp = _call_reco(url, headers, params)
            data = resp.json()
            items = data.get("results", [])
        except Exception as e:
            logger.exception("recommend API 호출 실패: %s", e)
            dispatcher.utter_message(text="추천 서버와 통신에 문제가 있어요. 잠시 후 다시 시도해 주세요.")
            return []

        # 4) 결과 처리
        if not items:
            dispatcher.utter_message(text="조건에 맞는 행사가 지금은 없네요. 다른 분류로 찾아볼까요?")
            return []

        header_area = f"'{area}'에서 " if area else ""
        header_cat = f"'{category}' " if category else ""
        dispatcher.utter_message(text=f"{header_area}{header_cat}추천이에요.")

        for it in items[:PAGE_SIZE]:
            title = it.get("title") or "제목 없음"
            place = it.get("place") or "장소 미정"
            date = it.get("date") or "일정 미정"
            detail_url = it.get("url") or f"{BASE_URL}/events/{it.get('id')}"
            dispatcher.utter_message(text=f"• [{title}]({detail_url}) — {place} / {date}")

        has_next = bool(data.get("next")) or (len(items) == PAGE_SIZE)
        if has_next:
            dispatcher.utter_message(text="더 볼까요? '더 보기'라고 말해보세요!")
            return [SlotSet("page", page + 1)]
        else:
            dispatcher.utter_message(text="여기까지가 끝! 다른 분류로 찾아볼까요?")
            return []


class ActionShowMore(Action):
    def name(self) -> Text:
        return "action_show_more"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ):
        """
        '더 보기'는 같은 파라미터로 다음 페이지를 불러오는 동작이므로
        기존 recommend 로직을 그대로 재사용한다.
        """
        area = tracker.get_slot("area")
        category = tracker.get_slot("category")
        page = tracker.get_slot("page") or 1

        params: Dict[str, Any] = {"limit": PAGE_SIZE, "page": page}
        if area:
            params["area"] = area
        if category:
            params["category"] = category

        url, headers = _choose_endpoint_and_headers(tracker)

        try:
            logger.info("Reco more call: %s params=%s headers=%s", url, params, headers)
            resp = _call_reco(url, headers, params)
            data = resp.json()
            items = data.get("results", [])
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
            date = it.get("date") or "일정 미정"
            detail_url = it.get("url") or f"{BASE_URL}/events/{it.get('id')}"
            dispatcher.utter_message(text=f"• [{title}]({detail_url}) — {place} / {date}")

        return [SlotSet("page", page + 1)]
