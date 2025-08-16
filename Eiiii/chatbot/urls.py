from django.urls import path
from .views import chat_stream

urlpatterns = [
    path("chat_stream/", chat_stream, name="chat_stream"),
]
