from django.urls import path
from .views import PublicRecommendView

urlpatterns = [
    path("public/", PublicRecommendView.as_view(), name="public-recommend"),
]