from django.urls import path
from .views import SubmitSurveyView, MyCulturalEventListView

urlpatterns = [
    path('submit/', SubmitSurveyView.as_view(), name='submit-survey'),
    path('my-events/', MyCulturalEventListView.as_view(), name='my-events'),
]
