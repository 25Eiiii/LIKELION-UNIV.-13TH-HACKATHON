from django.urls import path
from .views import ProfileCreateView

urlpatterns = [
    path('create/', ProfileCreateView.as_view(), name='profile-create'),
]
