from django.db import models
from django.conf import settings

# Create your models here.
class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    interests = models.JSONField(default=list)  # 리스트 형태로 최대 3개까지
    together = models.CharField(max_length=20)
    area = models.CharField(max_length=20)
    fee_type = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.user.username}'s profile"