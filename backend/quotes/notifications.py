"""Owner alerts for new quote requests: email and Twilio WhatsApp.

Flow: the view saves the request, then `queue_quote_notifications` creates one
`Notification` row per recipient and queues a Celery task for each. The task
calls `deliver`, which records every attempt on the row, so the admin always
shows what was sent, what failed and why.
"""

import json
import logging
import re
import smtplib
from datetime import timedelta
from email.utils import formataddr, parseaddr
from urllib.parse import quote as quote_url

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.db import transaction
from django.template.defaultfilters import pluralize
from django.template.loader import render_to_string
from django.urls import reverse
from django.utils import timezone

from .choices import ServiceType
from .models import Notification, QuoteRequest

logger = logging.getLogger(__name__)

# A pending row untouched for this long was never queued or its task was lost.
# Longer than the task's whole retry schedule, so a row waiting for a retry is
# never queued twice.
STALE_AFTER = timedelta(minutes=45)


class RetryableDeliveryError(Exception):
    """The provider may accept the message later (outage, timeout, rate limit)."""


class PermanentDeliveryError(Exception):
    """Retrying won't help (bad number, rejected sender, bad credentials)."""


# ---- Queueing ---------------------------------------------------------------


def queue_quote_notifications(quote):
    """Create the alert rows for a new quote request and queue their delivery."""
    rows = _plan_notifications(quote)
    for row in rows:
        if row.status == Notification.Status.PENDING:
            enqueue(row)


def enqueue(notification):
    from .tasks import send_notification

    try:
        send_notification.delay(notification.pk)
    except Exception:
        # Broker down: the row stays pending and the periodic sweep re-queues it.
        logger.exception("Could not queue notification %s", notification.pk)


def requeue_stale_notifications():
    cutoff = timezone.now() - STALE_AFTER
    stale = Notification.objects.filter(
        status=Notification.Status.PENDING, updated_at__lt=cutoff
    )
    count = 0
    for row in stale:
        row.save(update_fields=["updated_at"])  # Restart the stale clock.
        enqueue(row)
        count += 1
    return count


def _plan_notifications(quote):
    rows = []
    for channel, recipients, setting_name in (
        (Notification.Channel.EMAIL, settings.QUOTE_ALERT_EMAILS, "QUOTE_ALERT_EMAILS"),
        (Notification.Channel.WHATSAPP, settings.QUOTE_ALERT_WHATSAPP, "QUOTE_ALERT_WHATSAPP"),
    ):
        skip_reason = None
        if not recipients:
            skip_reason = f"No recipients configured ({setting_name})."
        elif channel == Notification.Channel.WHATSAPP and not twilio_configured():
            skip_reason = "Twilio is not configured (TWILIO_* settings)."

        if skip_reason:
            # A visible row in the admin instead of a silent gap.
            logger.warning("Quote %s: %s alert skipped. %s", quote.reference, channel, skip_reason)
            rows.append(
                Notification.objects.create(
                    quote_request=quote,
                    channel=channel,
                    status=Notification.Status.SKIPPED,
                    error=skip_reason,
                )
            )
            continue

        for recipient in recipients:
            rows.append(
                Notification.objects.create(
                    quote_request=quote, channel=channel, recipient=recipient
                )
            )
    return rows


# ---- Delivery ---------------------------------------------------------------


def deliver(notification_id, *, final_attempt):
    """Send one notification and record the outcome on its row.

    Raises RetryableDeliveryError when the caller should try again later.
    """
    with transaction.atomic():
        row = (
            Notification.objects.select_for_update()
            .select_related("quote_request")
            .get(pk=notification_id)
        )
        if row.status != Notification.Status.PENDING:
            return row  # Already sent, skipped or given up on.
        row.attempts += 1
        row.save(update_fields=["attempts", "updated_at"])

    sender = SENDERS[row.channel]
    try:
        row.provider_message_id = sender(row.quote_request, row.recipient) or ""
    except PermanentDeliveryError as exc:
        _record_failure(row, exc, give_up=True)
        return row
    except RetryableDeliveryError as exc:
        _record_failure(row, exc, give_up=final_attempt)
        if final_attempt:
            return row
        raise

    row.status = Notification.Status.SENT
    row.sent_at = timezone.now()
    row.error = ""
    row.save(update_fields=["status", "sent_at", "error", "provider_message_id", "updated_at"])
    return row


def _record_failure(row, exc, *, give_up):
    logger.warning(
        "Quote %s: %s to %s failed (attempt %s): %s",
        row.quote_request.reference,
        row.channel,
        row.recipient,
        row.attempts,
        exc,
    )
    row.error = str(exc)[:2000]
    if give_up:
        row.status = Notification.Status.FAILED
    row.save(update_fields=["status", "error", "updated_at"])


# ---- Message content --------------------------------------------------------


def admin_url(quote):
    path = reverse("admin:quotes_quoterequest_change", args=[quote.pk])
    return f"{settings.BACKEND_BASE_URL.rstrip('/')}{path}"


def whatsapp_chat_url(phone):
    """wa.me link that opens a WhatsApp chat with the customer.

    None for a local number without a country code, which wa.me can't resolve.
    """
    compact = phone.strip()
    digits = re.sub(r"\D", "", compact)
    if compact.startswith("00"):
        digits = digits[2:]
    elif not compact.startswith("+"):
        return None
    return f"https://wa.me/{digits}" if len(digits) >= 8 else None


def reply_email_url(quote):
    subject = quote_url(f"Your Driveo Exclusive quote {quote.reference}")
    return f"mailto:{quote.email}?subject={subject}"


def summary_lines(quote: QuoteRequest):
    """The facts the owner needs, shared by every channel."""
    when = f"{quote.journey_date:%a %d %b %Y}, {quote.journey_time:%H:%M}"
    if quote.service_type == ServiceType.HOURLY_HIRE:
        route = f"From {quote.pickup_location} · {quote.hire_hours} hours"
    else:
        route = f"{quote.pickup_location} → {quote.destination}"
    return {
        "reference": quote.reference,
        "service": f"{quote.get_service_type_display()} · {quote.get_city_display()}",
        "when": when,
        "route": route,
        "vehicle": (
            f"{quote.get_vehicle_class_display()} · "
            f"{quote.passengers} passenger{pluralize(quote.passengers)} · "
            f"{quote.luggage} luggage"
        ),
        "customer": f"{quote.full_name} · {quote.phone} · {quote.email}",
        "admin_url": admin_url(quote),
        # The owner answers every request personally; nothing goes to the customer automatically.
        "reply_whatsapp_url": whatsapp_chat_url(quote.phone) or "",
        "reply_email_url": reply_email_url(quote),
    }


# ---- Channels ---------------------------------------------------------------


def send_email(quote, recipient):
    facts = summary_lines(quote)
    context = {"quote": quote, **facts}
    # "Ada Lovelace via Driveo Exclusive": the customer is recognisable in the
    # inbox, and Reply goes straight to them. The sending address is unchanged.
    sender_name, sender_address = parseaddr(settings.DEFAULT_FROM_EMAIL)
    message = EmailMultiAlternatives(
        subject=f"New quote request {quote.reference}: {facts['service']}, {facts['when']}",
        body=render_to_string("quotes/email/new_quote_request.txt", context),
        from_email=formataddr(
            (f"{quote.full_name} via {sender_name or 'Driveo Exclusive'}", sender_address)
        ),
        to=[recipient],
        reply_to=[quote.email],
    )
    message.attach_alternative(
        render_to_string("quotes/email/new_quote_request.html", context), "text/html"
    )
    try:
        message.send()
    except (
        smtplib.SMTPAuthenticationError,
        smtplib.SMTPRecipientsRefused,
        smtplib.SMTPSenderRefused,
    ) as exc:
        raise PermanentDeliveryError(f"SMTP rejected the message: {exc}") from exc
    except (smtplib.SMTPException, OSError) as exc:
        raise RetryableDeliveryError(f"SMTP error: {exc}") from exc
    return ""


def twilio_configured():
    return bool(
        settings.TWILIO_ACCOUNT_SID
        and settings.TWILIO_AUTH_TOKEN
        and settings.TWILIO_WHATSAPP_FROM
    )


def _whatsapp_address(number):
    number = number.replace(" ", "")
    return number if number.startswith("whatsapp:") else f"whatsapp:{number}"


def send_whatsapp(quote, recipient):
    from twilio.base.exceptions import TwilioException, TwilioRestException
    from twilio.rest import Client

    facts = summary_lines(quote)
    params = {
        "from_": _whatsapp_address(settings.TWILIO_WHATSAPP_FROM),
        "to": _whatsapp_address(recipient),
    }
    if settings.TWILIO_WHATSAPP_CONTENT_SID:
        # Approved template, required for business-initiated messages outside
        # WhatsApp's 24-hour customer-service window. See README for the
        # placeholder order.
        params["content_sid"] = settings.TWILIO_WHATSAPP_CONTENT_SID
        params["content_variables"] = json.dumps(
            {
                "1": facts["reference"],
                "2": facts["service"],
                "3": facts["when"],
                "4": facts["route"],
                "5": facts["customer"],
                "6": facts["admin_url"],
                "7": facts["reply_whatsapp_url"] or quote.phone,
            }
        )
    else:
        params["body"] = render_to_string("quotes/whatsapp/new_quote_request.txt", facts)[:1600]

    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    try:
        message = client.messages.create(**params)
    except TwilioRestException as exc:
        error = f"Twilio {exc.status} (code {exc.code}): {exc.msg}"
        if exc.status == 429 or exc.status >= 500:
            raise RetryableDeliveryError(error) from exc
        raise PermanentDeliveryError(error) from exc
    except (TwilioException, OSError) as exc:
        raise RetryableDeliveryError(f"Twilio error: {exc}") from exc
    return message.sid


SENDERS = {
    Notification.Channel.EMAIL: send_email,
    Notification.Channel.WHATSAPP: send_whatsapp,
}
