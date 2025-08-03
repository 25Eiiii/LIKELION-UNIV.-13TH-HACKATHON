from rest_framework.generics import RetrieveAPIView
from search import models
from .serializers import CulturalEventDetailSerializer

class CulturalEventDetailView(RetrieveAPIView):
    queryset = models.CulturalEvent.objects.all()
    serializer_class = CulturalEventDetailSerializer
    lookup_field = 'id'  # 또는 'pk'
