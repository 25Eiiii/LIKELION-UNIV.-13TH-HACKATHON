from rest_framework import serializers
from .models import SurveySubmission, SurveyReview
from accounts.models import CustomUser
from search.models import CulturalEvent
from point.utils import adjust_point

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

        submission = SurveySubmission.objects.create(user=user, event=event)

        #포인트 지급 로직
        is_free = event.is_free.strip() if event.is_free else ""
        point = 100 if is_free == "무료" else 300
        adjust_point(user, point, f"{event.title} 참여 인증 보상")

        return submission


#설문한 행사 정보
class MyCulturalEventSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='event.title')
    date = serializers.CharField(source='event.date')
    place = serializers.CharField(source='event.place')
    main_img = serializers.URLField(source='event.main_img')
    is_reviewed = serializers.SerializerMethodField()

    class Meta:
        model = SurveySubmission
        fields = ['title', 'date', 'place', 'main_img', 'submitted_at', 'is_reviewed']

    def get_is_reviewed(self, obj):
        return SurveyReview.objects.filter(user=obj.user, event=obj.event).exists()

#리뷰 작성할 때 해당 행사 제목, 사진 보여줘야 함
class ReviewEventInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CulturalEvent
        fields = ['id', 'title', 'main_img']


#행사 리뷰 작성
class SurveyReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyReview
        fields = ['event', 'content', 'extra_feedback', 'photo']

    def validate(self, data):
        user = self.context['request'].user
        event = data['event']

        # 설문 제출 안 했으면 후기 불가
        if not SurveySubmission.objects.filter(user=user, event=event).exists():
            raise serializers.ValidationError("설문을 제출한 사용자만 후기를 작성할 수 있습니다.")

        # 이미 후기 작성했으면 불가
        if SurveyReview.objects.filter(user=user, event=event).exists():
            raise serializers.ValidationError("이미 후기를 작성하셨습니다.")

        return data

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data.pop('user', None)  
        return SurveyReview.objects.create(user=user, **validated_data)

#내가 쓴 후기 리스트 조회
class MyReviewSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='event.title')
    main_img = serializers.URLField(source='event.main_img')
    created_at = serializers.DateTimeField(format="%Y.%m.%d")  

    photo = serializers.ImageField()
    
    class Meta:
        model = SurveyReview
        fields = ['id', 'title', 'main_img', 'content', 'created_at', 'photo']

    def get_photo(self, obj):
        submission = SurveySubmission.objects.filter(user=obj.user, event=obj.event).first()
        if submission and submission.photo:
            return submission.photo.url
        return None

#특정 행사 상세 페이지에서 다른 사람들이 쓴 후기 목록 조회
class PublicReviewSerializer(serializers.ModelSerializer):
    nickname = serializers.CharField(source='user.nickname')
    created_at = serializers.DateTimeField(format="%Y.%m.%d")
    photo = serializers.ImageField()

    class Meta:
        model = SurveyReview
        fields = ['nickname', 'content', 'created_at', 'photo']

#내가 인증한 문화 행사 리스트 조회
class MyCertifiedEventSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='event.title')
    start_date = serializers.DateField(source='event.start_date', format='%Y.%m.%d')
    end_date = serializers.DateField(source='event.end_date', format='%Y.%m.%d')
    place = serializers.CharField(source='event.place')
    main_img = serializers.URLField(source='event.main_img')

    class Meta:
        model = SurveySubmission
        fields = ['title', 'start_date', 'end_date', 'place', 'main_img']