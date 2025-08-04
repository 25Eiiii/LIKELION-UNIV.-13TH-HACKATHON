from rest_framework import generics, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from .models import SurveySubmission, SurveyReview
from search.models import CulturalEvent
from .serializers import (
    SurveySubmissionSerializer, 
    MyCulturalEventSerializer, SurveyReviewSerializer,
    MyReviewSerializer, PublicReviewSerializer,
    MyCertifiedEventSerializer, ReviewEventInfoSerializer
)
# Create your views here.
#설문제출인증
class SubmitSurveyView(generics.CreateAPIView):
    serializer_class = SurveySubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

#설문제출한문화행사정보(내가 참여한 문화행사인 것임)
class MyCulturalEventListView(generics.ListAPIView):
    serializer_class = MyCulturalEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SurveySubmission.objects.filter(user=self.request.user).select_related('event')
    
#리뷰 작성할 때 해당 행사 제목, 사진 보여줘야 함
class ReviewEventInfoView(generics.RetrieveAPIView):
    queryset = CulturalEvent.objects.all()
    serializer_class = ReviewEventInfoSerializer
    permission_classes = [permissions.IsAuthenticated]  
    lookup_field = 'id'

#행사리뷰작성
class SubmitReviewView(generics.CreateAPIView):
    serializer_class = SurveyReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

#내가 쓴 후기 리스트 조회
class MyReviewListView(generics.ListAPIView):
    serializer_class = MyReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SurveyReview.objects.filter(user=self.request.user).select_related('event')
    
#내가 쓴 후기 삭제
class DeleteReviewView(generics.DestroyAPIView):
    queryset = SurveyReview.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 본인 것만 삭제 가능하게 제한
        return self.queryset.filter(user=self.request.user)
    
#특정 행사 상세 페이지에서 다른 사람들이 쓴 후기 목록 조회
class EventReviewListView(generics.ListAPIView):
    serializer_class = PublicReviewSerializer
    permission_classes = []  # 누구나 접근 가능

    def get_queryset(self):
        event_id = self.kwargs['event_id']
        return SurveyReview.objects.filter(event_id=event_id).select_related('user')
    
#내가 인증한 문화 행사 리스트 조회
class MyCertifiedEventView(generics.ListAPIView):
    serializer_class = MyCertifiedEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SurveySubmission.objects.filter(user=self.request.user).select_related('event')