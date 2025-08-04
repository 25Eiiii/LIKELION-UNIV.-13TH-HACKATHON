from rest_framework import serializers
from .models import SurveySubmission

#설문제출인증
class SurveySubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveySubmission
        fields = ['event']

    def create(self, validated_data):
        user = self.context['request'].user
        event = validated_data['event']

        # 중복 제출 방지
        if SurveySubmission.objects.filter(user=user, event=event).exists():
            raise serializers.ValidationError("이미 설문을 제출하셨습니다.")

        return SurveySubmission.objects.create(user=user, event=event)


#설문한 행사 정보
class MyCulturalEventSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='event.title')
    date = serializers.CharField(source='event.date')
    place = serializers.CharField(source='event.place')
    main_img = serializers.URLField(source='event.main_img')

    class Meta:
        model = SurveySubmission
        fields = ['title', 'date', 'place', 'main_img', 'submitted_at']