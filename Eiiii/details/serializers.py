from rest_framework import serializers
from search import models as searchModel
from . import models 

class CulturalEventDetailSerializer(serializers.ModelSerializer):
    like_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    reward_point = serializers.SerializerMethodField()

    class Meta:
        model = searchModel.CulturalEvent
        fields = [
            'id', 'title', 'program', 'date', 'place', 'use_trgt', 'use_fee',
            'main_img', 'rgst_date', 'codename', 'is_free', 'hmpg_addr',
            'like_count', 'is_liked', 'reward_point'
        ]

    def get_like_count(self, obj):
        return models.CulturalEventLike.objects.filter(event=obj).count()

    def get_is_liked(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return models.CulturalEventLike.objects.filter(user=user, event=obj).exists()
        return False
    
    def get_reward_point(self, obj):
        if obj.is_free and obj.is_free.strip() == "무료":
            return 100
        return 300
