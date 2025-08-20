from django.urls import path
from .views import (
    RecommendedEventsView, RecommendView,
    SimilarFromLastParticipationView
)
urlpatterns = [
    path("events/", RecommendedEventsView.as_view(), name="recommended-events"),
    path("chat", RecommendView.as_view(), name="recommend-chat"),
    path("similar_from_last/", SimilarFromLastParticipationView.as_view(), name="recommend-similar-from-last"),
]