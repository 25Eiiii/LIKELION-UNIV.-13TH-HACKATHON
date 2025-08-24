# recommend/management/commands/build_geo_index.py
from django.core.management.base import BaseCommand
from search.models import CulturalEvent
import os, redis
from datetime import datetime, timezone

def _redis():
    url = os.getenv("REDIS_PUBLIC_URL") or os.getenv("REDIS_URL") or "redis://localhost:6379/0"
    kw = {"decode_responses": True}
    if url.startswith("rediss://"):
        kw["ssl_cert_reqs"] = None
    return redis.from_url(url, **kw)

def _norm_latlon(lat_raw, lon_raw):
    try:
        lat = float(lat_raw) if lat_raw is not None else None
        lon = float(lon_raw) if lon_raw is not None else None
    except:
        return None, None
    # (lat, lon) 정상/스왑 보정
    if lat is not None and -90 <= lat <= 90 and lon is not None and -180 <= lon <= 180:
        return lat, lon
    if lon is not None and -90 <= lon <= 90 and lat is not None and -180 <= lat <= 180:
        return lon, lat
    return None, None

class Command(BaseCommand):
    help = "Load events into Redis GEO index and metadata hashes."

    def handle(self, *args, **opts):
        r = _redis()
        pipe = r.pipeline()
        pipe.delete("geo:events")
        cnt = 0

        # 주의: DB 스키마가 lot=위도, lat=경도로 뒤바뀐 케이스가 있었음
        for e in CulturalEvent.objects.exclude(lat__isnull=True).exclude(lot__isnull=True).values("id","lat","lot","codename","guname","title"):
            lat, lon = _norm_latlon(e["lat"], e["lot"])
            if lat is None or lon is None:
                continue
            pipe.geoadd("geo:events", (lon, lat, str(e["id"])))
            pipe.hset(f"ev:{e['id']}", mapping={
                "codename": e.get("codename") or "",
                "guname":   e.get("guname") or "",
            })
            cnt += 1
            if cnt % 2000 == 0:
                pipe.execute()
        pipe.execute()
        r.set("geo:events:ver", datetime.now(timezone.utc).isoformat())
        self.stdout.write(self.style.SUCCESS(f"GEO indexed {cnt} events"))
