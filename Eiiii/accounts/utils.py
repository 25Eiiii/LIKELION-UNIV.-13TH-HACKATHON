import requests
from django.conf import settings

def get_coordinates_from_address(address):
    url = "https://dapi.kakao.com/v2/local/search/address.json"
    headers = {"Authorization": f"KakaoAK {settings.KAKAO_API_KEY}"}
    params = {"query": address}

    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        documents = response.json().get("documents")
        if documents:
            x = float(documents[0]["address"]["x"])  # longitude(위도)
            y = float(documents[0]["address"]["y"])  # latitude(경도)
            return y, x
    return None, None
