from celery import shared_task

from .notifications import RetryableDeliveryError, deliver, requeue_stale_notifications

# Retries after 1, 2, 4, 8 and 16 minutes: about half an hour of provider
# downtime is absorbed before a notification is marked as failed.
MAX_RETRIES = 5


@shared_task(bind=True, max_retries=MAX_RETRIES, acks_late=True)
def send_notification(self, notification_id):
    final_attempt = self.request.retries >= self.max_retries
    try:
        deliver(notification_id, final_attempt=final_attempt)
    except RetryableDeliveryError as exc:
        raise self.retry(exc=exc, countdown=60 * 2**self.request.retries) from exc


@shared_task
def requeue_stale_notifications_task():
    """Periodic sweep (Celery beat) for alerts whose task was never queued or got lost."""
    return requeue_stale_notifications()
