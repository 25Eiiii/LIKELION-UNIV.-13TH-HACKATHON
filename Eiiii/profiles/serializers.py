from rest_framework import serializers
from .models import UserProfile

TOGETHER_CHOICES = ["혼자", "친구와", "연인과", "가족과", "아이와 함께"]

class UserProfileSerializer(serializers.ModelSerializer):
    together = serializers.ChoiceField(choices=TOGETHER_CHOICES)

    class Meta:
        model = UserProfile
        fields = ['interests', 'together', 'area', 'fee_type']

    def validate_interests(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("관심사는 리스트여야 합니다.")
        if len(value) != 3:
            raise serializers.ValidationError("관심사는 정확히 3개를 선택해야 합니다.")
        if len(set(value)) != 3:
            raise serializers.ValidationError("중복 없이 3개를 선택해야 합니다.")
        return value