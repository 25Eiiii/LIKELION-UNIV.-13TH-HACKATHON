from django.db import models
from django.conf import settings
from search.models import CulturalEvent
# Create your models here.

class SurveySubmission(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    event = models.ForeignKey(CulturalEvent, on_delete=models.CASCADE)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'event')  # 한 사용자가 같은 행사 설문 중복 제출 방지

    def __str__(self):
        return f"{self.user.username} - {self.event.title}"