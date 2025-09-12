from django.apps import AppConfig
import logging

class RecommendConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'recommend'

    def ready(self):
        #from .algo import _build_event_corpus
        #try: _build_event_corpus()
        #except Exception: pass

        logging.getLogger(__name__).info("recommend app ready (warmup skipped in G0)")
        # G0에서는 무거운 warmup/학습 호출하지 않음

