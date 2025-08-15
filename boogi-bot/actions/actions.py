from typing import Any, Dict, List, Text
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import re
import requests  # Django API 호출용 (필요시)

NEARBY_KEYWORDS = ["근처", "가까운", "주변", "이번 주", "이번주"]
THEME_KEYWORDS = ["인기", "요즘", "주말", "가족", "가족이랑", "가족과"]

class ActionDetermineNextStep(Action):
    def name(self) -> Text:
        return "action_determine_next_step"

    def run(
        self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        text = (tracker.latest_message.get("text") or "").strip()

        area = tracker.get_slot("area")
        category = tracker.get_slot("category")

        # 이미 카테고리/지역이 파싱되었다면 바로 추천
        if category:
            return [SlotSet("category", category)] + [SlotSet("area", area)] + [ ]
        if area:
            # 근처 추천 흐름: 지역만으로 추천 가능
            return [SlotSet("area", area)]

        # 키워드로 흐름 결정
        if any(k in text for k in NEARBY_KEYWORDS):
            dispatcher.utter_message(response="utter_ask_area")
            return []
        if any(k in text for k in THEME_KEYWORDS):
            dispatcher.utter_message(response="utter_ask_category")
            return []

        # 명시적 단어 없고 엔티티도 없으면 기본값: 지역 먼저
        dispatcher.utter_message(response="utter_ask_area")
        return []


class ActionRecommendEvent(Action):
    def name(self) -> Text:
        return "action_recommend_event"

    def run(
        self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        area = tracker.get_slot("area")
        category = tracker.get_slot("category")

        #dispatcher.utter_message(response="utter_ack")

        # Django 추천 API 호출
        params = {}
        if area: params["area"] = area
        if category: params["category"] = category

        try:
            # 실제 엔드포인트에 맞게 수정하세요
            resp = requests.get("http://localhost:8000/api/recommend", params=params, timeout=5)
            resp.raise_for_status()
            items = resp.json().get("results", [])
        except Exception:
            dispatcher.utter_message(text="추천 서버와 통신에 문제가 있어요. 잠시 후 다시 시도해 주세요.")
            return []

        # 아이템 없을 때
        if not items:
            dispatcher.utter_message(text="조건에 맞는 행사가 지금은 없네요. 다른 카테고리로 찾아볼까요?")
            return []

        # 아이템 있을 때 (SSE에서도 스트리밍 느낌)
        header_area = f"'{area}'에서 " if area else ""
        header_cat = f"'{category}' " if category else ""
        dispatcher.utter_message(text=f"{header_area}{header_cat}추천이에요.")

        for it in items[:3]:
            title = it.get("title") or "제목 없음"
            place = it.get("place") or "장소 미정"
            date  = it.get("date")  or "일정 미정"

            # URL 생성 (API에서 url 필드 제공 or id 기반 생성)
            detail_url = it.get("url") or f"http://localhost:8000/events/{it.get('id')}"

            msg = f"• [{title}]({detail_url}) — {place} / {date}"
            dispatcher.utter_message(text=msg)

        dispatcher.utter_message(text="더 볼까요? '더 보기'라고 말해보세요!")
        return []