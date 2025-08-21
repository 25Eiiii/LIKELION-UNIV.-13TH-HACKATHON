from django.apps import AppConfig


class RecommendConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'recommend'

    def ready(self):
        from .algo import _build_event_corpus
        try: _build_event_corpus()
        except Exception: pass


