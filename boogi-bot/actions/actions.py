# actions.py
from typing import Any, Dict, Text, List
import logging
import requests
import time

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import (
    SlotSet,
    FollowupAction,
    SessionStarted,
    ActionExecuted,
)
from requests.exceptions import ReadTimeout, ConnectTimeout, ConnectionError

logger = logging.getLogger(__name__)

# ===== 엔드포인트 =====
BASE_URL        = "http://127.0.0.1:8000"
LOGIN_ENDPOINT  = "/api/recommend/chat"         # 로그인 전용
PUBLIC_ENDPOINT = "/api/pbrecommend/public/"    # 비로그인 전용(팀원 개발 예정)

# ===== 키워드 분기 =====
NEARBY_KEYWORDS = ["근처", "가까운", "주변", "이번 주", "이번주"]
THEME_KEYWORDS  = ["인기", "요즘", "주말", "가족", "가족이랑", "가족과"]

# ===== 페이징 =====
PAGE_SIZE = 3


# ─────────────────────────────────────────────────────────────────────────────
# UTIL
# ─────────────────────────────────────────────────────────────────────────────
def _get_token(tracker: Tracker) -> Text:
    """auth_token을 (1) 슬롯 → (2) 최신 메시지 메타데이터 → (3) 최근 user 이벤트 메타데이터 순으로 탐색."""
    # 1) 슬롯
    tok = tracker.get_slot("auth_token")
    if tok:
        return tok
    # 2) 최신 메시지 metadata
    if tracker.latest_message and tracker.latest_message.get("metadata"):
        meta_tok = tracker.latest_message["metadata"].get("auth_token")
        if meta_tok:
            return meta_tok
    # 3) 과거 user 이벤트 스캔 (뒤에서 앞으로)
    for ev in reversed(tracker.events or []):
        if ev.get("event") == "user":
            md = ev.get("metadata") or {}
            if md.get("auth_token"):
                return md["auth_token"]
    return None


def _auth_headers(tracker: Tracker) -> Dict[str, str]:
    token = _get_token(tracker)
    if not token:
        return {}
    # 비ASCII 혼입 대비
    ascii_token = str(token).encode("ascii", "ignore").decode("ascii")
    return {
        "Authorization": f"Bearer {ascii_token}",
        "Accept": "application/json",
        "User-Agent": "boogi-bot/1.0 (+requests)",
    }


def _choose_endpoint_and_headers(tracker: Tracker) -> tuple[str, Dict[str, str]]:
    token = _get_token(tracker)
    if token:
        url = f"{BASE_URL}{LOGIN_ENDPOINT}"
        headers = _auth_headers(tracker)
        logger.info("auth_token 감지됨 → LOGIN_ENDPOINT 사용: %s", url)
        return url, headers
    url = f"{BASE_URL}{PUBLIC_ENDPOINT}"
    logger.warning("auth_token 미감지 → PUBLIC_ENDPOINT 사용: %s", url)
    return url, {}


def _toggle_slash(url: str) -> str:
    """/ 유무가 다른 라우팅에 대비해 한 번 토글."""
    return url[:-1] if url.endswith("/") else url + "/"


def _toggle_slash(url: str) -> str:
    return url[:-1] if url.endswith("/") else url + "/"

def _call_once(url: str, headers: Dict[str, str], params: Dict[str, Any], connect_s: int, read_s: int):
    return requests.get(url, params=params, headers=headers, timeout=(connect_s, read_s))

def _call_reco(url: str, headers: Dict[str, str], params: Dict[str, Any]) -> requests.Response:
    """
    - 로그인 URL 우선 호출
    - 404 → 슬래시 토글 1회 재시도
    - 401/403 → 퍼블릭 폴백
    - ReadTimeout/ConnectionError → 지수백오프로 2회 재시도 후 (로그인에 한해) 퍼블릭 폴백
    """
    CONNECT_T = 3          # 연결 타임아웃
    READ_T    = 45         # 응답 타임아웃(기존 15 → 45로 증가)
    MAX_RETRY = 2          # 네트워크 오류 재시도 횟수

    def call_with_retries(target_url: str, target_headers: Dict[str, str]) -> requests.Response:
        last_exc = None
        for attempt in range(MAX_RETRY + 1):
            try:
                return _call_once(target_url, target_headers, params, CONNECT_T, READ_T)
            except (ReadTimeout, ConnectTimeout, ConnectionError) as e:
                last_exc = e
                backoff = 0.4 * (2 ** attempt)  # 0.4s, 0.8s, ...
                logger.warning("네트워크 에러(%s) 재시도 %d/%d, %.1fs 대기...", type(e).__name__, attempt+1, MAX_RETRY+1, backoff)
                time.sleep(backoff)
        # 모두 실패
        if last_exc:
            raise last_exc
        raise RuntimeError("unknown network error")

    # 1) 로그인 URL 시도
    r = call_with_retries(url, headers)

    # 2) 404면 슬래시 토글 재시도
    if r.status_code == 404:
        alt = _toggle_slash(url)
        if alt != url:
            logger.warning("로그인 404 → 슬래시 토글 재시도: %s", alt)
            r2 = call_with_retries(alt, headers)
            if r2.ok or r2.status_code in (401, 403, 404):
                r = r2  # 결과 갱신

    # 3) 401/403 → 퍼블릭 폴백 시도
    if r.status_code in (401, 403):
        pub = f"{BASE_URL}{PUBLIC_ENDPOINT}"
        logger.warning("로그인 401/403 → 퍼블릭 폴백: %s", pub)
        r = call_with_retries(pub, {})  # 퍼블릭은 헤더 없이

    # 4) 최종 상태 처리
    r.raise_for_status()
    return r

def _maybe_sync_token_slot(tracker: Tracker) -> List:
    """메타데이터에서 토큰을 읽어 왔는데 슬롯이 비어 있으면 슬롯 동기화 이벤트 반환."""
    # 슬롯 우선
    tok = tracker.get_slot("auth_token")
    if tok:
        return []
    # 최신 메시지 metadata
    if tracker.latest_message and tracker.latest_message.get("metadata"):
        meta_tok = tracker.latest_message["metadata"].get("auth_token")
        if meta_tok:
            return [SlotSet("auth_token", meta_tok)]
    # 과거 user 이벤트 뒤에서 앞으로 스캔
    for ev in reversed(tracker.events or []):
        if ev.get("event") == "user":
            md = ev.get("metadata") or {}
            if md.get("auth_token"):
                return [SlotSet("auth_token", md["auth_token"])]
    return []

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
        (단, 첫 user 메시지가 들어오기 이전이므로 metadata가 비어있을 수 있음.
         이후 매 액션에서 _maybe_sync_token_slot로 보완 동기화함.)
        """
        events: List = [SessionStarted()]
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
        # 토큰 슬롯 동기화(항상 첫 줄에서)
        events: List = _maybe_sync_token_slot(tracker)

        text = (tracker.latest_message.get("text") or "").strip()
        area = tracker.get_slot("area")
        category = tracker.get_slot("category")  # UI 버튼이라 codename 보장 가정

        # 이미 area/category가 있으면 바로 추천으로
        if category or area:
            return events + [
                SlotSet("category", category),
                SlotSet("area", area),
                SlotSet("page", 1),
                FollowupAction("action_recommend_event"),
            ]

        # 사용자가 자연어로 근처/주말 등 요청한 경우
        if any(k in text for k in NEARBY_KEYWORDS):
            dispatcher.utter_message(response="utter_ask_area")
            return events
        if any(k in text for k in THEME_KEYWORDS):
            dispatcher.utter_message(response="utter_ask_category")
            return events

        # 기본값: 지역 먼저 유도
        dispatcher.utter_message(response="utter_ask_area")
        return events


class ActionRecommendEvent(Action):
    def name(self) -> Text:
        return "action_recommend_event"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ):
        # 토큰 슬롯 동기화
        events: List = _maybe_sync_token_slot(tracker)

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
            return events

        # 4) 결과 처리
        if not items:
            dispatcher.utter_message(text="조건에 맞는 행사가 지금은 없네요. 다른 분류로 찾아볼까요?")
            return events

        header_area = f"'{area}'에서 " if area else ""
        header_cat  = f"'{category}' " if category else ""
        dispatcher.utter_message(text=f"{header_area}{header_cat}추천이에요.")

        for it in items[:PAGE_SIZE]:
            title = it.get("title") or "제목 없음"
            place = it.get("place") or "장소 미정"
            date  = it.get("date")  or "일정 미정"
            detail_url = it.get("url") or f"{BASE_URL}/events/{it.get('id')}"
            dispatcher.utter_message(text=f"• [{title}]({detail_url}) — {place} / {date}")

        has_next = bool(data.get("next")) or (len(items) == PAGE_SIZE)
        if has_next:
            dispatcher.utter_message(text="더 볼까요? '더 보기'라고 말해보세요!")
            return events + [SlotSet("page", page + 1)]
        else:
            dispatcher.utter_message(text="여기까지가 끝! 다른 분류로 찾아볼까요?")
            return events


class ActionShowMore(Action):
    def name(self) -> Text:
        return "action_show_more"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ):
        # 토큰 슬롯 동기화
        events: List = _maybe_sync_token_slot(tracker)

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
            return events

        if not items:
            dispatcher.utter_message(text="더 이상 결과가 없어요. 다른 분류나 지역으로 찾아볼까요?")
            return events

        for it in items:
            title = it.get("title") or "제목 없음"
            place = it.get("place") or "장소 미정"
            date  = it.get("date")  or "일정 미정"
            detail_url = it.get("url") or f"{BASE_URL}/events/{it.get('id')}"
            dispatcher.utter_message(text=f"• [{title}]({detail_url}) — {place} / {date}")

        return events + [SlotSet("page", page + 1)]
