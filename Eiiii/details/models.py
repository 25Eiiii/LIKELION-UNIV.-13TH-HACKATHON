# 현재 앱 models.py
from django.db import models
from django.conf import settings
from search.models import CulturalEvent  # 다른 앱의 모델

class CulturalEventLike(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    event = models.ForeignKey(CulturalEvent, on_delete=models.CASCADE, related_name='liked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'event')
