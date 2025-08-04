from django.urls import path
from . import views

urlpatterns = [
    path('detail/<int:id>/', views.CulturalEventDetailView.as_view(), name='cultural-event-detail'),
    path('detail/<int:id>/like/', views.CulturalEventLikeToggleView.as_view(), name='cultural-event-like'),
    path('liked/', views.LikedListView.as_view(), name='liked-list'),
]
