from rest_framework import serializers
from .models import UserProfile

TOGETHER_CHOICES = ["혼자", "친구와", "연인과", "가족과", "아이와 함께"]

THEMECODE_MAP = {
    "혼자": ["기타"],
    "친구와": ["기타"],
    "연인과": ["기타"],
    "가족과": ["가족 문화행사", "어르신 문화행사"],
    "아이와 함께": ["어린이/청소년 문화행사"],
}

class UserProfileSerializer(serializers.ModelSerializer):
    # 프론트는 여기에 원본 라벨을 보냄
    together = serializers.ChoiceField(choices=TOGETHER_CHOICES, write_only=True)
    # 매핑 결과는 응답으로 보여주기만 (추천 로직에서 바로 사용)
    theme_codes = serializers.ListField(
        child=serializers.CharField(), read_only=True
    )

    class Meta:
        model = UserProfile
        fields = ['interests', 'together', 'area', 'fee_type', 'theme_codes']

    def validate_interests(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("관심사는 리스트여야 합니다.")
        if len(value) != 3:
            raise serializers.ValidationError("관심사는 정확히 3개를 선택해야 합니다.")
        if len(set(value)) != 3:
            raise serializers.ValidationError("중복 없이 3개를 선택해야 합니다.")
        return value

    def create(self, validated_data):
        raw = validated_data.pop('together')  # "가족과"
        codes = THEMECODE_MAP.get(raw, ["기타"])  # ["가족 문화행사","어르신 문화행사"]
        validated_data['together_input'] = raw
        validated_data['theme_codes'] = codes
        return UserProfile.objects.create(**validated_data)