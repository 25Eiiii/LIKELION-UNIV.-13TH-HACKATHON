from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import generics
from django.conf import settings
import requests
from datetime import datetime

from .models import CulturalEvent
from details import serializers

#CODENAME 기준 → 우리가 나눈 category로 매핑
CODENAME_CATEGORY_MAP = {
    "교육/체험": "교육/체험",
    "전시/미술": "전시/미술",
    "축제-기타": "축제",
    "축제-문화/예술": "축제",
    "축제-자연/경관": "축제",
    "축제-전통/역사": "축제",
    "기타": "기타",
    "국악": "음악/콘서트",
    "콘서트": "음악/콘서트",
    "클래식": "음악/콘서트",
    "무용": "무대/공연",
    "뮤지컬/오페라": "무대/공연",
    "연극": "무대/공연",
}

class CategoryExploreView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        base_url = f"http://openapi.seoul.go.kr:8088/{settings.API_KEY}/json/culturalEventInfo"
        start_index = 1
        end_index = 1000
        today = datetime.today().date()
        saved_count = 0

        try:
            while True:
                url = f"{base_url}/{start_index}/{end_index}/"
                response = requests.get(url)

                if "application/json" not in response.headers.get('Content-Type', ''):
                    return Response({'error': '응답이 JSON이 아닙니다.', 'raw': response.text}, status=500)

                data = response.json()
                info = data.get('culturalEventInfo', {})
                items = info.get('row', [])
                total_count = info.get('list_total_count', 0)

                if not items:
                    break

                for item in items:
                    guname = item.get('GUNAME', '')
                    date_str = item.get('DATE', '')
                    if not any(gu in guname for gu in ['성북구', '종로구', '강북구', '동대문구']):
                        continue

                    # 날짜 필터링
                    if '~' in date_str:
                        try:
                            end_date_str = date_str.split('~')[-1].strip()
                            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
                            if end_date < today:
                                continue
                        except ValueError:
                            continue
                    else:
                        continue  # 날짜 범위 형식 아니면 건너뜀

                    # 시작/종료일
                    try:
                        start_date = datetime.strptime(item.get('STRTDATE', '').split()[0], '%Y-%m-%d').date()
                        end_date = datetime.strptime(item.get('END_DATE', '').split()[0], '%Y-%m-%d').date()
                    except:
                        start_date = end_date = None

                    # 카테고리 매핑
                    codename = item.get('CODENAME', '')
                    category = CODENAME_CATEGORY_MAP.get(codename, '기타')

                    # 신청일자
                    try:
                        rgst_date = datetime.strptime(item.get('RGSTDATE', ''), '%Y-%m-%d').date()
                    except:
                        rgst_date = None

                    obj, created = CulturalEvent.objects.update_or_create(
                        title=item.get('TITLE', ''),
                        start_date=start_date,
                        end_date=end_date,
                        place=item.get('PLACE', ''),
                        defaults={
                            "codename": codename,
                            "category": category,
                            "guname": guname,
                            "date": date_str,
                            "org_name": item.get('ORG_NAME', ''),
                            "use_trgt": item.get('USE_TRGT', ''),
                            "use_fee": item.get('USE_FEE', ''),
                            "player": item.get('PLAYER', ''),
                            "program": item.get('PROGRAM', ''),
                            "etc_desc": item.get('ETC_DESC', ''),
                            "org_link": item.get('ORG_LINK', ''),
                            "main_img": item.get('MAIN_IMG', ''),
                            "rgst_date": rgst_date,
                            "ticket": item.get('TICKET', ''),
                            "themecode": item.get('THEMECODE', ''),
                            "lot": item.get('LOT', ''),
                            "lat": item.get('LAT', ''),
                            "is_free": item.get('IS_FREE', ''),
                            "hmpg_addr": item.get('HMPG_ADDR', ''),
                        }
                    )
                    
                    if created:
                        saved_count += 1

                if end_index >= total_count:
                    break
                start_index += 1000
                end_index = min(end_index + 1000, total_count)

            return Response({
                "message": f"{saved_count}개의 문화행사를 저장했습니다.",
                "total_api_items": total_count
            }, status=200)

        except Exception as e:
            return Response({'error': str(e)}, status=500)
        