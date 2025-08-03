from rest_framework import serializers
from search import models

class CulturalEventDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CulturalEvent
        fields = [
            'title',
            'program',
            'date',
            'place',
            'use_trgt',
            'use_fee',
            'main_img',
            'rgst_date',
            'codename',
            'is_free',
            'hmpg_addr',
        ]
