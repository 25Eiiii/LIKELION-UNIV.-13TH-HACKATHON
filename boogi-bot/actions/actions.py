# actions.py

from typing import Any, Dict, Text, List, Optional
import logging
import requests
import time
import os

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import (
    SlotSet,
    FollowupAction,
    SessionStarted,
    ActionExecuted,
)
from requests.exceptions import ReadTimeout, ConnectTimeout, ConnectionError
from urllib.parse import urljoin

logger = logging.getLogger(__name__)

# ===== 엔드포인트 =====
API_BASE = os.getenv("BACKEND_BASE_URL", "http://web:8000").rstrip("/")
LOGIN_ENDPOINT  =  urljoin(API_BASE + "/", "api/recommend/chat")       # 로그인 전용
PUBLIC_ENDPOINT =  urljoin(API_BASE + "/", "api/pbrecommend/public/")   # 비로그인 전용(팀원 개발 예정)
DEFAULT_INTERNAL_HEADERS = {"X-Forwarded-Proto": "https"}  # 내부 http→https 리다이렉트 회피
 

# 엔드포인트 메서드 환경변수 (기본: 로그인=GET, 퍼블릭=GET)
LOGIN_METHOD  = os.getenv("RECO_LOGIN_METHOD",  "GET").upper()
PUBLIC_METHOD = os.getenv("RECO_PUBLIC_METHOD", "GET").upper()

# 타임아웃/재시도도 env로 조절
CONNECT_T = int(os.getenv("RECO_CONNECT_T", "3"))
READ_T    = int(os.getenv("RECO_READ_T",    "60"))   # 45→60
MAX_RETRY = int(os.getenv("RECO_MAX_RETRY", "1"))    # 2→1 (개발중 체감↑)

# ===== 키워드 분기 =====
NEARBY_KEYWORDS = ["근처", "가까운", "주변", "이번 주", "이번주"]
THEME_KEYWORDS  = ["인기", "요즘", "주말", "가족", "가족이랑", "가족과"]

# ===== 페이징 =====
PAGE_SIZE = 3


# ─────────────────────────────────────────────────────────────────────────────
# UTIL
# ─────────────────────────────────────────────────────────────────────────────
def _get_token(tracker: Tracker) -> Optional[Text]:
    """auth_token을 (1) 슬롯 → (2) 최신 메시지 메타데이터 → (3) 최근 user 이벤트 메타데이터 순으로 탐색."""
    # 1) 슬롯
    tok = tracker.get_slot("auth_token")
    if tok:
        logger.debug("[token] from slot")
        return tok
    # 2) 최신 메시지 metadata
    md = (tracker.latest_message or {}).get("metadata") or {}
    if md.get("auth_token"):
        logger.debug("[token] from latest_message.metadata")
        return md["auth_token"]
    # 3) 과거 user 이벤트 스캔 (뒤에서 앞으로)
    for ev in reversed(tracker.events or []):
        if ev.get("event") == "user":
            m = ev.get("metadata") or {}
            if m.get("auth_token"):
                logger.debug("[token] from past user metadata")
                return m["auth_token"]
    logger.debug("[token] not found")
    return None


def _auth_headers_from_token(token: Optional[Text]) -> Dict[str, str]:
    if not token:
        return {}
    # 토큰은 변형하지 말고 그대로 사용 (로깅만 마스킹)
    return {
        "Authorization": f"Bearer {str(token)}",
        "Accept": "application/json",
        "User-Agent": "boogi-bot/1.0 (+requests)",
    }

def _safe_log_headers(headers: Dict[str, str]) -> Dict[str, str]:
    out = {}
    for k, v in headers.items():
        if k.lower() == "authorization":
            out[k] = "Bearer ***"
        else:
            out[k] = v
    return out

def _choose_endpoint_and_headers_from_token(token: Optional[Text]) -> tuple[str, Dict[str, str], str]:
    """token 유무로 엔드포인트/헤더/모드(login|public) 결정."""
    if token: 
        headers = _auth_headers_from_token(token)
        return LOGIN_ENDPOINT, headers, "login"
    url = f"{BASE_URL}{PUBLIC_ENDPOINT}"
    logger.warning("auth_token 미감지 → PUBLIC_ENDPOINT 사용: %s", PUBLIC_ENDPOINT)
    return PUBLIC_ENDPOINT, {}, "public"


def _toggle_slash(url: str) -> str:
    """/ 유무가 다른 라우팅에 대비해 한 번 토글."""
    return url[:-1] if url.endswith("/") else url + "/"


def _call_once(method: str, url: str, headers: Dict[str, str], params: Dict[str, Any],
               connect_s: int, read_s: int) -> requests.Response:
    merged = {**DEFAULT_INTERNAL_HEADERS, **(headers or {})}
    if method.upper() == "POST":
        return requests.post(url, json=params, headers=merged, timeout=(connect_s, read_s), allow_redirects=False)
    return requests.get(url, params=params, headers=merged, timeout=(connect_s, read_s), allow_redirects=False)

def _call_reco(method: str, url: str, headers: Dict[str, str], params: Dict[str, Any]) -> requests.Response:

    def call_with_retries(m: str, target_url: str, target_headers: Dict[str, str], *, q: Dict[str, Any]) -> requests.Response:
        last_exc = None
        for attempt in range(MAX_RETRY + 1):
            try:
                return _call_once(m, target_url, target_headers, q, CONNECT_T, READ_T)
            except (ReadTimeout, ConnectTimeout, ConnectionError) as e:
                last_exc = e
                backoff = 0.4 * (2 ** attempt)  # 0.4s, 0.8s, ...
                logger.warning("네트워크 에러(%s) 재시도 %d/%d, %.1fs 대기... url=%s headers=%s params=%r",
                               type(e).__name__, attempt+1, MAX_RETRY+1, backoff,
                               target_url, _safe_log_headers(target_headers), q)
                time.sleep(backoff)
        if last_exc:
            raise last_exc
        raise RuntimeError("unknown network error")

    # 1) 1차 호출
    r = call_with_retries(method, url, headers, q=params)

    # 2) 404면 슬래시 토글 재시도
    if r.status_code == 404:
        alt = _toggle_slash(url)
        if alt != url:
            logger.warning("404 → 슬래시 토글 재시도: %s (원본 %s)", alt, url)
            r2 = call_with_retries(method, alt, headers, q=params)
            if r2.ok or r2.status_code in (401, 403, 404):
                r = r2

    # 405면 메서드 자동 전환(예: GET→POST 혹은 반대)
    if r.status_code == 405:
        alt_m = "POST" if method.upper() == "GET" else "GET"
        logger.warning("405(Method Not Allowed) → %s로 재시도", alt_m)
        r2 = call_with_retries(alt_m, url, headers, q=params)
        if r2.ok or r2.status_code in (401, 403, 404, 405):
            r = r2

    # 401/403 퍼블릭 폴백(기존 그대로)
    if r.status_code in (401, 403):
        logger.warning("401/403 → 퍼블릭 폴백: %s", PUBLIC_ENDPOINT)
        r = call_with_retries(PUBLIC_METHOD, PUBLIC_ENDPOINT, {}, q=params)

    # 4) 최종 상태
    r.raise_for_status()
    return r

def _parse_json_safe(resp: requests.Response) -> Dict[str, Any]:
    try:
        return resp.json()
    except ValueError:
        text = (resp.text[:200] + "...") if resp.text and len(resp.text) > 200 else resp.text
        logger.error("JSON 파싱 실패: status=%s content-type=%s body=%r",
                     resp.status_code, resp.headers.get("content-type"), text)
        raise

def _md_escape(text: str) -> str:
    # 아주 가벼운 이스케이프 (대괄호/괄호 정도)
    return str(text).replace("[", "\\[").replace("]", "\\]").replace("(", "\\(").replace(")", "\\)")

def _maybe_sync_token_slot(tracker: Tracker) -> List:
    """메타데이터에서 토큰을 읽어 왔는데 슬롯이 비어 있으면 슬롯 동기화 이벤트 반환(다음 턴 대비)."""
    # 슬롯 우선
    tok = tracker.get_slot("auth_token")
    if tok:
        return []
    # 최신 메시지 metadata
    md = (tracker.latest_message or {}).get("metadata") or {}
    if md.get("auth_token"):
        return [SlotSet("auth_token", md["auth_token"])]
    # 과거 user 이벤트 뒤에서 앞으로 스캔
    for ev in reversed(tracker.events or []):
        if ev.get("event") == "user":
            m = ev.get("metadata") or {}
            if m.get("auth_token"):
                return [SlotSet("auth_token", m["auth_token"])]
    return []


def _say(dispatcher: CollectingDispatcher, template: str):
    """Rasa 3.x(response) / 2.x(template) 호환 출력."""
    try:
        dispatcher.utter_message(response=template)
    except TypeError:
        dispatcher.utter_message(template=template)

def _reset_and_restart() -> List:
    """추천 세션 리셋 후, 초기 질문 흐름으로 복귀."""
    return [
        SlotSet("area", None),
        SlotSet("category", None),
        SlotSet("page", 1),
        FollowupAction("action_determine_next_step"),
    ]


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
        (첫 user 메시지 이전일 수 있으므로 이후 매 액션에서 _maybe_sync_token_slot로 보완)
        """
        events: List = [SessionStarted()]
        md = (tracker.latest_message or {}).get("metadata") or {}
        token = md.get("auth_token")
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
        # 토큰 슬롯 동기화(항상 첫 줄에서) — 저장은 "이 액션 끝난 뒤"에 반영됨
        events: List = _maybe_sync_token_slot(tracker)

        text = (tracker.latest_message.get("text") or "").strip()
        area = tracker.get_slot("area")
        category = tracker.get_slot("category")  # UI 버튼이라 codename 보장 가정

        logger.info("[determine] text='%s' area=%r category=%r", text, area, category)

        # 이미 area/category가 있으면 바로 추천으로
        if category or area:
            return events + [
                SlotSet("page", 1),
                FollowupAction("action_recommend_event"),
            ]

        # 사용자가 자연어로 근처/주말 등 요청한 경우
        if any(k in text for k in NEARBY_KEYWORDS):
            return events + [FollowupAction("utter_ask_area")]

        if any(k in text for k in THEME_KEYWORDS):
            return events + [FollowupAction("utter_ask_category")]

        # 기본값: 지역 먼저 유도
        return events + [FollowupAction("utter_ask_area")]


class ActionRecommendEvent(Action):
    def name(self) -> Text:
        return "action_recommend_event"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ):
        # 토큰 슬롯 동기화(다음 턴 대비)
        events: List = _maybe_sync_token_slot(tracker)

        area = tracker.get_slot("area")
        category = tracker.get_slot("category")
        page = tracker.get_slot("page") or 1

        # 방어막: 빈 슬롯이면 질문으로 회귀
        if not area and not category:
            return events + [FollowupAction("utter_ask_area")]
        if area and not category:
            return events + [FollowupAction("utter_ask_category")]
        if category and not area:
            return events + [FollowupAction("utter_ask_area")]

        # 이 턴에서 사용할 토큰은 "지역 변수"로 확보 (슬롯 반영 타이밍 이슈 회피)
        token = _get_token(tracker)
        url, headers, mode = _choose_endpoint_and_headers_from_token(token)
        method = LOGIN_METHOD if mode == "login" else PUBLIC_METHOD

        # 요청 파라미터
        params: Dict[str, Any] = {"limit": PAGE_SIZE, "page": page}
        if area:
            params["area"] = area
        if category:
            params["category"] = category

        logger.info("Reco call url=%s method=%s params=%r headers=%r",
                    url, method, params, list(headers.keys()))

        # 호출
        try:
            resp = _call_reco(method, url, headers, params)
            data = _parse_json_safe(resp)
            items = data.get("results", [])
        except Exception as e:
            logger.exception("recommend API 호출 실패: %s", e)
            dispatcher.utter_message(text="추천 서버와 통신에 문제가 있어요. 잠시 후 다시 시도해주세요.")
            return events

        # 결과 처리
        if not items:
            dispatcher.utter_message(text="조건에 맞는 행사가 지금은 없네요. 다른 분류로 찾아볼까요?")
            return events + _reset_and_restart()

        header_area = f"'{area}'에서 " if area else ""
        header_cat  = f"'{category}' " if category else ""
        dispatcher.utter_message(text=f"{header_area}{header_cat}추천이에요.")

        for it in items[:PAGE_SIZE]:
            title = _md_escape(it.get("title") or "제목 없음")
            place = it.get("place") or "장소 미정"
            date  = it.get("date")  or "일정 미정"
            detail_url = it.get("url") or f"{API_BASE}/events/{it.get('id')}"
            dispatcher.utter_message(text=f"• [{title}]({detail_url}) — {place} / {date}")

        has_next = bool(data.get("next"))
        if has_next:
            dispatcher.utter_message(text="더 볼까요? '더 보기'라고 말해보세요!")
            return events + [SlotSet("page", page + 1)]
        else:
            dispatcher.utter_message(text="여기까지가 끝! 다른 분류로 찾아볼까요?")
            return events + _reset_and_restart()


class ActionShowMore(Action):
    def name(self) -> Text:
        return "action_show_more"

    def run(self, dispatcher, tracker, domain):
        events: List = _maybe_sync_token_slot(tracker)

        area = tracker.get_slot("area")
        category = tracker.get_slot("category")
        page = tracker.get_slot("page") or 1

        token = _get_token(tracker)
        url, headers, mode = _choose_endpoint_and_headers_from_token(token)
        method = "GET"

        params: Dict[str, Any] = {"limit": PAGE_SIZE, "page": page}
        if area:
            params["area"] = area
        if category:
            params["category"] = category

        logger.info("Reco more call url=%s method=%s params=%r headers=%r",
                    url, method, params, list(headers.keys()))

        try:
            resp = _call_reco(method, url, headers, params)
            data = _parse_json_safe(resp)
            items = data.get("results", [])
        except Exception as e:
            logger.exception("recommend more API 호출 실패: %s", e)
            dispatcher.utter_message(text="더 보기를 불러오는데 문제가 생겼어요. 잠시 후 다시 시도해 주세요.")
            return events
        
        # --- has_more/next 기반으로 종료 여부 판단 ---
        # 서버가 has_more를 주면 우선 사용, 없으면 next/next_page 존재로 보강
        has_more = bool(data.get("has_more"))
        if not data.get("has_more") and (data.get("next") is not None or data.get("next_page") is not None):
            has_more = True

        next_page = data.get("next") or data.get("next_page")

        if not items:
            dispatcher.utter_message(text="더 이상 결과가 없어요. 다른 분류나 지역으로 찾아볼까요?")
            logger.info("[show_more] no more items → reset slots and restart flow")
            return events + _reset_and_restart()   # ★ 여기 추가

        for it in items:
            title = _md_escape(it.get("title") or "제목 없음")
            place = it.get("place") or "장소 미정"
            date  = it.get("date")  or "일정 미정"
            detail_url = it.get("url") or f"{API_BASE}/events/{it.get('id')}"
            dispatcher.utter_message(text=f"• [{title}]({detail_url}) — {place} / {date}")

        # 마지막/다음 페이지 분기 직전에 힌트 출력 추가
        if has_more and next_page:
            dispatcher.utter_message(text="더 볼까요? '더 보기'라고 말해보세요!")
            logger.info("[show_more] has_more=True → set next page to %s", next_page)
            try:
                next_page_int = int(next_page)
            except Exception:
                next_page_int = (page or 1) + 1
            return events + [SlotSet("page", next_page_int)]

        # 마지막 페이지 처리
        dispatcher.utter_message(text="더 이상 결과가 없어요. 다른 분류나 지역으로 찾아볼까요?")
        logger.info("[show_more] last page reached → reset & restart")
        return events + _reset_and_restart()

