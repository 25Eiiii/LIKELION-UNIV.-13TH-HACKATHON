from django.urls import path
from .views import CulturalEventListView

urlpatterns = [
    path('events-category/', CulturalEventListView.as_view(), name='cultural-event-list'),
]