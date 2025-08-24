from rest_framework.generics import RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import CulturalEventLike
from search import models
from .serializers import CulturalEventDetailSerializer

class CulturalEventDetailView(RetrieveAPIView):
    queryset = models.CulturalEvent.objects.all()
    serializer_class = CulturalEventDetailSerializer
    lookup_field = 'id'  # 또는 'pk'

class CulturalEventLikeToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        try:
            event = models.CulturalEvent.objects.get(id=id)
        except models.CulturalEvent.DoesNotExist:
            return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        like_obj, created = CulturalEventLike.objects.get_or_create(user=user, event=event)

        if not created:
            like_obj.delete()
            liked = False
        else:
            liked = True

        like_count = CulturalEventLike.objects.filter(event=event).count()

        return Response({
            'liked': liked,
            'like_count': like_count
        })

class LikedListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        likes = CulturalEventLike.objects.filter(user=user).select_related('event')
        events = [like.event for like in likes]
        serializer = CulturalEventDetailSerializer(events, many=True, context={'request': request})

        return Response(serializer.data)
