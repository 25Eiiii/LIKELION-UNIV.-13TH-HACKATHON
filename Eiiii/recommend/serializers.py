from rest_framework import serializers
from search.models import CulturalEvent

class RecommendedEventSerializer(serializers.ModelSerializer):
    period = serializers.SerializerMethodField()

    class Meta:
        model = CulturalEvent
        fields = ["id", "title", "main_img", "start_date", "end_date", "period"]

    def get_period(self, obj):
        if obj.start_date and obj.end_date:
            return f"{obj.start_date:%Y.%m.%d} ~ {obj.end_date:%Y.%m.%d}"
        if obj.start_date:
            return f"{obj.start_date:%Y.%m.%d} ~"
        return ""