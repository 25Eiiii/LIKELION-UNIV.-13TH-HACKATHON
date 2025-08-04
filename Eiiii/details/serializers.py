from rest_framework import serializers
from search import models as searchModel
from . import models 

class CulturalEventDetailSerializer(serializers.ModelSerializer):
    like_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = searchModel.CulturalEvent
        fields = [
            'id', 'title', 'program', 'date', 'place', 'use_trgt', 'use_fee',
            'main_img', 'rgst_date', 'codename', 'is_free', 'hmpg_addr',
            'like_count', 'is_liked'
        ]

    def get_like_count(self, obj):
        return models.CulturalEventLike.objects.filter(event=obj).count()

    def get_is_liked(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return models.CulturalEventLike.objects.filter(user=user, event=obj).exists()
        return False
