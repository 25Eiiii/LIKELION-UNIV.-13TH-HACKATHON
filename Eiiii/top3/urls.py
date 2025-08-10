from django.urls import path
from .views import MonthlyTop3View, MonthlyTop3PublicView

urlpatterns = [
    path("monthly/", MonthlyTop3View.as_view(), name="monthly-top3"),                # 개인화(로그인)
    path("monthly/public/", MonthlyTop3PublicView.as_view(), name="monthly-public"), # 공개
]
