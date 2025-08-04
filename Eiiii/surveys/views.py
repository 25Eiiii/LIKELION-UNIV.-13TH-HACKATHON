from rest_framework import generics, permissions
from .models import SurveySubmission
from .serializers import SurveySubmissionSerializer, MyCulturalEventSerializer

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