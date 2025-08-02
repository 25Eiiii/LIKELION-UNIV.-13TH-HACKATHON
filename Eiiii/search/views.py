from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings
import requests

class CategoryExploreView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        url = "http://apis.data.go.kr/B551463/arteApiService/getProgramInfo"
        params = {
            'serviceKey': settings.API_KEY,  
            'resultType': 'json',
            'pageNo': 1, # 페이지 넘버
            'numOfRows': 100, # 한페이지에 나올 item 수
        }
        headers = {
            'Accept': 'application/json'  
        }

        try:
            response = requests.get(url, params=params, headers=headers)

            print("응답 상태:", response.status_code)
            print("응답 내용 일부:", response.text[:300])

            # JSON 아닌 경우 방지
            if "application/json" not in response.headers.get('Content-Type', ''):
                return Response({'error': '응답이 JSON이 아닙니다.', 'raw': response.text}, status=500)

            data = response.json()
            items = data.get('response', {}).get('body', {}).get('items', {}).get('item', [])
            return Response({'results': data}, status=200)

        except Exception as e:
            return Response({'error': str(e)}, status=500)
