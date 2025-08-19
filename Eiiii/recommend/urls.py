from django.urls import path
from .views import RecommendedEventsView, RecommendView

urlpatterns = [
    path("events/", RecommendedEventsView.as_view(), name="recommended-events"),
    path("chat", RecommendView.as_view(), name="recommend-chat"),
]