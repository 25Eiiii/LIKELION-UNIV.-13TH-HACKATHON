from django.urls import path
from .views import SignupView, CheckUsernameView, CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),#회원가입
    path('check-username/', CheckUsernameView.as_view(), name='check-username'),#중복아이디
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # 토큰 재발급
]
