from rest_framework import generics, permissions,serializers
from .models import UserProfile
from .serializers import UserProfileSerializer

# Create your views here.
class ProfileCreateView(generics.CreateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if UserProfile.objects.filter(user=self.request.user).exists():
            raise serializers.ValidationError("이미 프로필을 생성했습니다.")
        serializer.save(user=self.request.user)