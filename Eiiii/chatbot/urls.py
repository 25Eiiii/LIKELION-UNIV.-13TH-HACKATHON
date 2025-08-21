from django.urls import path
from .views import chat_stream
from .suggestions import suggested_queries

urlpatterns = [
    path("chat_stream/", chat_stream, name="chat_stream"),
    path("suggestions/", suggested_queries, name="chat-suggestions"),
]
