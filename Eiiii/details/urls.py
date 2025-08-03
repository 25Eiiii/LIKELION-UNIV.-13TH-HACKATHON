from django.urls import path
from .views import CulturalEventDetailView

urlpatterns = [
    path('detail/<int:id>/', CulturalEventDetailView.as_view(), name='cultural-event-detail'),
]
