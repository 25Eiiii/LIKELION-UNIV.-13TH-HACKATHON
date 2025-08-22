# recommend/management/commands/train_cf.py
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from surveys.models import SurveyReview

import os
import pandas as pd
import numpy as np
import redis
from surprise import SVD, Dataset, Reader
from datetime import datetime, timezone
from django.core.management.base import BaseCommand, CommandError

def _redis_url() -> str:
    """
    로컬에서 Railway Redis에 붙을 때:
    - 내부용(redis.railway.internal)은 로컬에서 접속 불가 → PUBLIC 먼저 사용
    """
    # 1) Railway Public URL(로컬에서 접속용)
    url = os.getenv("REDIS_PUBLIC_URL")
    if url:
        return url
    # 2) settings.REDIS_URL (배포 환경에서 주로 internal)
    url = getattr(settings, "REDIS_URL", None)
    if url:
        return url
    # 3) Django CACHES.default.LOCATION
    try:
        url = settings.CACHES["default"]["LOCATION"]
        if url:
            return url
    except Exception:
        pass
    # 4) 일반 환경변수
    url = os.getenv("REDIS_URL")
    if url:
        return url
    # 5) 최후의 로컬 기본값
    return "redis://localhost:6379/0"


def get_redis() -> redis.Redis:
    url = _redis_url()
    kwargs = {"decode_responses": False}
    # Railway PUBLIC이 TLS(rediss://)면 인증서 검증을 완화(로컬 편의)
    if url.startswith("rediss://"):
        kwargs["ssl_cert_reqs"] = None
    return redis.from_url(url, **kwargs)


class Command(BaseCommand):
    help = "Train CF (SVD) offline and push user/item vectors to Redis."

    def add_arguments(self, parser):
        parser.add_argument(
            "--redis-url",
            dest="redis_url",
            default=None,
            help="Override Redis URL (e.g. rediss://default:<pwd>@<host>:<port>/0)",
        )

    def handle(self, *args, **opts):
        url_override = opts.get("redis_url")

        def pick_url():
            if url_override:
                return url_override
            # 1) REDIS_PUBLIC_URL 우선
            if os.getenv("REDIS_PUBLIC_URL"):
                return os.getenv("REDIS_PUBLIC_URL")
            # 2) settings.REDIS_URL
            if getattr(settings, "REDIS_URL", None):
                return settings.REDIS_URL
            # 3) CACHES.default.LOCATION
            try:
                loc = settings.CACHES["default"]["LOCATION"]
                if loc:
                    return loc
            except Exception:
                pass
            # 4) 환경변수 REDIS_URL
            if os.getenv("REDIS_URL"):
                return os.getenv("REDIS_URL")
            # 5) 로컬 기본
            return "redis://localhost:6379/0"

        url = pick_url()
        kwargs = {"decode_responses": False}
        if url.startswith("rediss://"):
            kwargs["ssl_cert_reqs"] = None  # 로컬에서 Railway public TLS 편의용

        r = redis.from_url(url, **kwargs)
        self.stdout.write(f"Redis URL: {url}")
        try:
            r.ping()
        except Exception as e:
            raise CommandError(f"Redis 연결 실패: {e}")

        # 1) 평점 데이터 적재
        qs = (
            SurveyReview.objects
            .exclude(rating__isnull=True)
            .values('user_id', 'event_id', 'rating', 'created_at')
        )
        df = pd.DataFrame.from_records(qs)
        if df.empty:
            self.stdout.write("no ratings; skip")
            return

        # 중복(동일 user,event) 최신건만
        df = (
            df.sort_values('created_at')
              .drop_duplicates(['user_id', 'event_id'], keep='last')
        )

        # 2) Surprise 데이터셋/학습
        reader = Reader(rating_scale=(0, 5))
        data = Dataset.load_from_df(df[['user_id', 'event_id', 'rating']], reader)
        trainset = data.build_full_trainset()

        algo = SVD(n_factors=32, n_epochs=25, reg_all=0.05, random_state=42)
        self.stdout.write("Training SVD...")
        algo.fit(trainset)
        self.stdout.write(self.style.SUCCESS(
            f"SVD trained: users={trainset.n_users}, items={trainset.n_items}, dim={algo.n_factors}"
        ))

        # 3) Redis에 벡터 push (배치 커밋)
        ver = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
        dim = int(algo.n_factors)
        batch = int(os.getenv("CF_REDIS_BATCH", "5000"))

        pipe = r.pipeline()
        ops = 0

        # 메타 먼저
        pipe.set("cf:ver", ver)
        pipe.set("cf:dim", dim)
        pipe.set("cf:users", trainset.n_users)
        pipe.set("cf:items", trainset.n_items)
        ops += 4

        # 사용자 벡터/바이어스
        for inner_uid in range(trainset.n_users):
            raw_uid = int(trainset.to_raw_uid(inner_uid))
            pu_bytes = algo.pu[inner_uid].astype(np.float32).tobytes()
            bu_str = f"{float(algo.bu[inner_uid]):.6f}"

            pipe.set(f"cf:u:{raw_uid}", pu_bytes)
            pipe.set(f"cf:bu:{raw_uid}", bu_str)
            ops += 2

            if ops >= batch:
                pipe.execute()
                pipe = r.pipeline()
                ops = 0

        # 아이템 벡터/바이어스
        for inner_iid in range(trainset.n_items):
            raw_iid = int(trainset.to_raw_iid(inner_iid))
            qi_bytes = algo.qi[inner_iid].astype(np.float32).tobytes()
            bi_str = f"{float(algo.bi[inner_iid]):.6f}"

            pipe.set(f"cf:i:{raw_iid}", qi_bytes)
            pipe.set(f"cf:bi:{raw_iid}", bi_str)
            ops += 2

            if ops >= batch:
                pipe.execute()
                pipe = r.pipeline()
                ops = 0

        if ops:
            pipe.execute()

        self.stdout.write(self.style.SUCCESS(f"Pushed CF to Redis ver={ver}"))
