from django.urls import path
from .views import (SubmitSurveyView, MyCulturalEventListView, 
                    SubmitReviewView, MyReviewListView,
                    DeleteReviewView, EventReviewListView,
                    MyCertifiedEventView, ReviewEventInfoView
                    )
urlpatterns = [
    path('submit/', SubmitSurveyView.as_view(), name='submit-survey'),
    path('my-events/', MyCulturalEventListView.as_view(), name='my-events'),
    path('review/', SubmitReviewView.as_view(), name='submit-review'),
    path('review/info/<int:id>/', ReviewEventInfoView.as_view(), name='review-event-info'),
    path('my-reviews/', MyReviewListView.as_view(), name='my-reviews'),
    path('my-reviews/<int:pk>/', DeleteReviewView.as_view(), name='delete-review'),
    path('reviews/event/<int:event_id>/', EventReviewListView.as_view(), name='event-review-list'),
    path('my-certified/', MyCertifiedEventView.as_view(), name='my-certified-events'),
]
