from django.apps import AppConfig


class ApiConfig(AppConfig):
    name = 'api'

    def ready(self):
        from .reminder_worker import start_reminder_worker

        start_reminder_worker()
