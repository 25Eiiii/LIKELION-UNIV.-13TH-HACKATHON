from django.urls import path
from . import views

urlpatterns = [
    path('category/', views.CategoryExploreView.as_view(), name='category'),
]
