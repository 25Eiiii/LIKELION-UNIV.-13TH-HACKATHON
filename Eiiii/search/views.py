from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
import requests
from datetime import datetime

class CategoryExploreView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        base_url = f"http://openapi.seoul.go.kr:8088/{settings.API_KEY}/json/culturalEventInfo"
        start_index = 1
        end_index = 1000
        filtered_items = []
        today = datetime.today().date()

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

                    # 성북구 또는 종로구 필터
                    if not any(gu in guname for gu in ['성북구', '종로구', '강북구', '동대문구']):
                        continue

                    # 날짜 필터
                    if '~' in date_str:
                        try:
                            end_date_str = date_str.split('~')[-1].strip()
                            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()

                            if end_date >= today:
                                filtered_items.append(item)

                        except ValueError:
                            continue  # 날짜 형식 이상하면 건너뜀
                    else:
                        continue  # 날짜 범위 형식 아니면 건너뜀

                # 마지막 페이지 도달 시 종료
                if end_index >= total_count:
                    break

                start_index += 1000
                end_index = min(end_index + 1000, total_count)

            return Response({
                'filtered_count': len(filtered_items),
                'results': filtered_items
            }, status=200)

        except Exception as e:
            return Response({'error': str(e)}, status=500)
