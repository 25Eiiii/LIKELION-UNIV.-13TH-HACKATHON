from django.db import models
from django.conf import settings

# Create your models here.
class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    interests = models.JSONField(default=list)  # 최대 3개
    # 기존 together -> 분리
    together_input = models.CharField(max_length=10)   # "혼자", "가족과" 등 원본 라벨
    theme_codes = models.JSONField(default=list)       # ["가족 문화행사","어르신 문화행사"] 같은 매핑 결과

    area = models.CharField(max_length=20)
    fee_type = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.user.username}'s profile"