from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class CustomUser(AbstractUser):
    username = models.CharField(max_length=30, unique=True)  # 아이디
    nickname = models.CharField(max_length=30)
    address = models.CharField(max_length=100)  # 거주지
    latitude = models.FloatField(null=True, blank=True)#위도
    longitude = models.FloatField(null=True, blank=True)#경도