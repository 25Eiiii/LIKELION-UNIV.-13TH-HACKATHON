from django.urls import path
from .views import MyPointView

urlpatterns = [
    path('my/', MyPointView.as_view(), name='my-point'),
]