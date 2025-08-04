from rest_framework import serializers
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['interests', 'together', 'area', 'fee_type']

    def validate_interests(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("관심사는 리스트여야 합니다.")
        if len(value) != 3:
            raise serializers.ValidationError("관심사는 정확히 3개를 선택해야 합니다.")
        return value
