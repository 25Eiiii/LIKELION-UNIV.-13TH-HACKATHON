from rest_framework import generics
from .serializers import SignupSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model

# Create your views here.

User = get_user_model()

#회원가입
class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SignupSerializer

#아이디중복체크
class CheckUsernameView(APIView):
    def get(self, request):
        username = request.query_params.get("username")
        if not username:
            return Response({"error": "username 파라미터 필요"}, status=400)
        if User.objects.filter(username=username).exists():
            return Response({"available": False})
        return Response({"available": True})
