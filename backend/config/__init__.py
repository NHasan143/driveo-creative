# Load the Celery app with Django so @shared_task binds to it.
from .celery import app as celery_app

__all__ = ("celery_app",)
