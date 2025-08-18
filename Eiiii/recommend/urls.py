from django.urls import path
from .views import RecommendedEventsView

urlpatterns = [
    path("events/", RecommendedEventsView.as_view(), name="recommended-events"),
]