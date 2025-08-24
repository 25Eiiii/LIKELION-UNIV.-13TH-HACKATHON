from rest_framework import serializers
from django.contrib.auth import get_user_model
from .utils import get_coordinates_from_address
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

#회원가입 
class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'nickname', 'address')

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("비밀번호가 일치하지 않습니다.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User(
            username=validated_data['username'],
            nickname=validated_data['nickname'],
            address=validated_data['address'],
        )

        # 주소 → 위도/경도 자동 변환
        lat, lng = get_coordinates_from_address(user.address)
        user.latitude = lat
        user.longitude = lng

        user.set_password(validated_data['password'])
        user.save()
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['nickname'] = user.nickname
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['nickname'] = self.user.nickname
        return data