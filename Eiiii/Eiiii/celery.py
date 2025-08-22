import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Eiiii.settings")

app = Celery("Eiiii")
# 환경변수 CELERY_ 접두 설정도 읽어오도록
app.config_from_object("django.conf:settings", namespace="CELERY")
# 각 앱의 tasks.py 자동 탐색
app.autodiscover_tasks()
