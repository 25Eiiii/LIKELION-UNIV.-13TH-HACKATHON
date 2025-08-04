from django.db import models
from django.conf import settings
from search.models import CulturalEvent
# Create your models here.

#설문 인증
class SurveySubmission(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    event = models.ForeignKey(CulturalEvent, on_delete=models.CASCADE)
    submitted_at = models.DateTimeField(auto_now_add=True)
    photo = models.ImageField(upload_to='certification_photos/', blank=True, null=True)  # 인증 사진
    
    class Meta:
        unique_together = ('user', 'event')  # 한 사용자가 같은 행사 설문 중복 제출 방지

    def __str__(self):
        return f"{self.user.username} - {self.event.title}"
    
#행사리뷰
class SurveyReview(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    event = models.ForeignKey(CulturalEvent, on_delete=models.CASCADE)
    content = models.TextField()  # 필수 후기
    extra_feedback = models.TextField(blank=True, null=True)  # 선택 항목
    created_at = models.DateTimeField(auto_now_add=True)

    photo = models.ImageField(upload_to='review_photos/', blank=True, null=True)

    class Meta:
        unique_together = ('user', 'event')  # 하나의 행사에 하나의 후기만