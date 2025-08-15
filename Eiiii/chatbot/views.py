# chatbot/views.py
from django.http import StreamingHttpResponse, HttpResponseBadRequest
from django.views.decorators.http import require_GET
import requests, json

RASA_WEBHOOK = "http://localhost:5005/webhooks/rest/webhook"

def sse(event: str, data) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"

@require_GET
def chat_stream(request):
    q = request.GET.get("q")
    if not q:
        return HttpResponseBadRequest("missing q")
    sender = str(getattr(request.user, "id", "anon"))

    def gen():
        # 선택: 브라우저 재연결 힌트 (10초)
        yield "retry: 10000\n\n"
        try:
            resp = requests.post(
                RASA_WEBHOOK,
                json={"sender": sender, "message": q},
                timeout=30,
            )
            resp.raise_for_status()
            messages = resp.json() or []

            for m in messages:
                # 1) 텍스트를 단어 단위로 흘리기
                text = (m.get("text") or "").strip()
                if text:
                    for tok in text.split():
                        yield sse("chunk", {"text": tok})
                    yield sse("message_end", {})

                # 2) 버튼이 있으면 전달
                if m.get("buttons"):
                    yield sse("buttons", m["buttons"])

                # 3) 이미지/첨부 전달 (있으면)
                if m.get("image"):
                    yield sse("image", {"url": m["image"]})
                if m.get("attachment"):
                    yield sse("attachment", m["attachment"])

            yield sse("done", True)

        except requests.exceptions.RequestException as e:
            yield sse("error", {"message": "Rasa 연결 오류", "detail": str(e)})
            yield sse("done", True)
        except Exception as e:
            yield sse("error", {"message": "서버 내부 오류", "detail": str(e)})
            yield sse("done", True)

    resp = StreamingHttpResponse(gen(), content_type="text/event-stream; charset=utf-8")
    resp["Cache-Control"] = "no-cache"
    resp["X-Accel-Buffering"] = "no"        # nginx 프록시 버퍼 방지
    resp["Access-Control-Allow-Origin"] = "*"  # 개발용 CORS
    resp["Access-Control-Expose-Headers"] = "Content-Type"
    return resp
