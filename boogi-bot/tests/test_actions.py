import os
import responses
from actions.actions import _call_reco, _parse_json_safe

BASE = os.getenv("RECO_BASE_URL", "http://127.0.0.1:8000")
LOGIN = f"{BASE}/api/recommend/chat"
PUBLIC = f"{BASE}/api/pbrecommend/public/"

def test_login_200_json_ok():
    with responses.RequestsMock() as rsps:
        rsps.add(rsps.GET, LOGIN, json={"results":[{"title":"t"}], "next": None}, status=200)
        r = _call_reco("GET", LOGIN, {"Authorization":"Bearer x"}, {"limit":3})
        data = _parse_json_safe(r)
        assert data["results"][0]["title"] == "t"

def test_404_toggle_then_ok():
    with responses.RequestsMock() as rsps:
        rsps.add(rsps.GET, LOGIN, status=404)  # 원 URL
        rsps.add(rsps.GET, LOGIN + "/", json={"results":[], "next": None}, status=200)  # 토글
        r = _call_reco("GET", LOGIN, {}, {"limit":3})
        assert r.status_code == 200

def test_401_fallback_public():
    with responses.RequestsMock() as rsps:
        rsps.add(rsps.GET, LOGIN, status=401)
        rsps.add(rsps.GET, PUBLIC, json={"results":[{"title":"pub"}], "next":None}, status=200)
        r = _call_reco("GET", LOGIN, {"Authorization":"Bearer bad"}, {"limit":3})
        data = _parse_json_safe(r)
        assert data["results"][0]["title"] == "pub"

