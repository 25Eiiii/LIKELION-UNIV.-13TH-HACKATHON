from rest_framework import serializers
from search.models import CulturalEvent  # 실제 경로로 수정

class PublicEventCardSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()

    class Meta:
        model = CulturalEvent
        fields = ("id", "title", "place", "main_img", "date", 'hmpg_addr')

    def get_date(self, obj):
        if getattr(obj, "start_date", None) and getattr(obj, "end_date", None):
            return f"{obj.start_date:%Y.%m.%d} ~ {obj.end_date:%Y.%m.%d}"
        return getattr(obj, "date", None) or "일정 미정"