from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

class HomeView(APIView):

    def get(self, request):
        category_list = [
            {'id': 1, 'name': '공연/영화', 'value': 'movie'},
            {'id': 2, 'name': '전시/미술', 'value': 'art'},
            {'id': 3, 'name': '교육/체험', 'value': 'education'},
            {'id': 4, 'name': '축제', 'value': 'festival'},
            {'id': 5, 'name': '도서', 'value': 'book'},
            {'id': 6, 'name': '역사', 'value': 'history'},
        ]
        return Response({'categories': category_list}, status=200)
    