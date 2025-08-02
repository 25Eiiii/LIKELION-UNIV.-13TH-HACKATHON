from django.urls import path
from .views import SignupView, CheckUsernameView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),#회원가입
    path('check-username/', CheckUsernameView.as_view(), name='check-username'),#중복아이디
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # 로그인
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # 토큰 재발급
]
