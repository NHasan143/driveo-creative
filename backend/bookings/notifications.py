"""Booking messages: owner alerts (email and Twilio WhatsApp) and customer emails.

Flow: the view saves the booking, then `queue_booking_notifications` creates one
`Notification` row per recipient and queues a Celery task for each. The task
calls `deliver`, which records every attempt on the row, so the admin always
shows what was sent, what failed and why.

Who hears about what:
  created    owner (email + WhatsApp) and customer (email, with the manage link)
  changed    owner and customer
  cancelled  owner (when the customer cancelled) and customer
  confirmed  customer (with the chauffeur's details)
"""

import json
import logging
import re
import smtplib
from datetime import timedelta
from email.utils import formataddr, parseaddr

from django.conf import settings
from django.core.mail import EmailMessage, EmailMultiAlternatives
from django.db import transaction
from django.template.defaultfilters import pluralize
from django.template.loader import render_to_string
from django.urls import reverse
from django.utils import timezone

from . import customer_emails
from .models import Booking, Notification
from .pricing import english_name

logger = logging.getLogger(__name__)

# A pending row untouched for this long was never queued or its task was lost.
# Longer than the task's whole retry schedule, so a row waiting for a retry is
# never queued twice.
STALE_AFTER = timedelta(minutes=45)

Event = Notification.Event
Audience = Notification.Audience


class RetryableDeliveryError(Exception):
    """The provider may accept the message later (outage, timeout, rate limit)."""


class PermanentDeliveryError(Exception):
    """Retrying won't help (bad number, rejected sender, bad credentials)."""


# ---- Queueing ---------------------------------------------------------------


def queue_booking_notifications(booking, event, *, owner=True, customer=True):
    """Create the message rows for a booking event and queue their delivery."""
    rows = []
    if owner and event != Event.CONFIRMED:
        rows += _plan_owner_alerts(booking, event)
    if customer:
        rows.append(
            Notification.objects.create(
                booking=booking,
                event=event,
                audience=Audience.CUSTOMER,
                channel=Notification.Channel.EMAIL,
                recipient=booking.email,
            )
        )
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
    stale = Notification.objects.filter(status=Notification.Status.PENDING, updated_at__lt=cutoff)
    count = 0
    for row in stale:
        row.save(update_fields=["updated_at"])  # Restart the stale clock.
        enqueue(row)
        count += 1
    return count


def _plan_owner_alerts(booking, event):
    rows = []
    for channel, recipients, setting_name in (
        (Notification.Channel.EMAIL, settings.BOOKING_ALERT_EMAILS, "BOOKING_ALERT_EMAILS"),
        (Notification.Channel.WHATSAPP, settings.BOOKING_ALERT_WHATSAPP, "BOOKING_ALERT_WHATSAPP"),
    ):
        skip_reason = None
        if not recipients:
            skip_reason = f"No recipients configured ({setting_name})."
        elif channel == Notification.Channel.WHATSAPP and not twilio_configured():
            skip_reason = "Twilio is not configured (TWILIO_* settings)."

        if skip_reason:
            # A visible row in the admin instead of a silent gap.
            logger.warning("Booking %s: %s alert skipped. %s", booking.reference, channel, skip_reason)
            rows.append(
                Notification.objects.create(
                    booking=booking,
                    event=event,
                    channel=channel,
                    status=Notification.Status.SKIPPED,
                    error=skip_reason,
                )
            )
            continue

        for recipient in recipients:
            rows.append(
                Notification.objects.create(booking=booking, event=event, channel=channel, recipient=recipient)
            )
    return rows


# ---- Delivery ---------------------------------------------------------------


def deliver(notification_id, *, final_attempt):
    """Send one notification and record the outcome on its row.

    Raises RetryableDeliveryError when the caller should try again later.
    """
    with transaction.atomic():
        row = Notification.objects.select_for_update().select_related("booking").get(pk=notification_id)
        if row.status != Notification.Status.PENDING:
            return row  # Already sent, skipped or given up on.
        row.attempts += 1
        row.save(update_fields=["attempts", "updated_at"])

    sender = SENDERS[(row.audience, row.channel)]
    try:
        row.provider_message_id = sender(row.booking, row.recipient, row.event) or ""
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
        "Booking %s: %s %s to %s failed (attempt %s): %s",
        row.booking.reference,
        row.event,
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

OWNER_HEADINGS = {
    Event.CREATED: "New booking",
    Event.CHANGED: "Booking changed by the customer",
    Event.CANCELLED: "Booking cancelled by the customer",
}


def admin_url(booking):
    path = reverse("admin:bookings_booking_change", args=[booking.pk])
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


def summary_lines(booking: Booking):
    """The facts the owner needs, shared by every channel."""
    from content.models import City, Service, Vehicle

    def name(model, pk):
        record = model.objects.filter(pk=pk).first()
        return english_name(record) if record else pk

    when = f"{booking.journey_date:%a %d %b %Y}, {booking.journey_time:%H:%M}"
    if booking.is_hourly:
        route = f"From {booking.pickup_location} · {booking.hire_hours} hours"
    else:
        route = f"{booking.pickup_location} → {booking.destination}"
    if booking.flight_number:
        route += f" · flight {booking.flight_number}"
    price = f"{booking.total_price} {booking.currency}"
    if booking.is_hourly:
        price += f" ({booking.unit_price} per hour)"
    return {
        "reference": booking.reference,
        "service": f"{name(Service, booking.service)} · {name(City, booking.city)}",
        "when": when,
        "route": route,
        "vehicle": (
            f"{name(Vehicle, booking.vehicle)} · "
            f"{booking.passengers} passenger{pluralize(booking.passengers)} · "
            f"{booking.luggage} luggage"
        ),
        "price": f"{price}, paid later",
        "customer": f"{booking.full_name} · {booking.phone} · {booking.email}",
        "admin_url": admin_url(booking),
        "reply_whatsapp_url": whatsapp_chat_url(booking.phone) or "",
    }


# ---- Channels ---------------------------------------------------------------


def _send(message):
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


def send_owner_email(booking, recipient, event):
    facts = summary_lines(booking)
    context = {"booking": booking, "heading": OWNER_HEADINGS[event], "event": event, **facts}
    # "Ada Lovelace via Driveo Exclusive": the customer is recognisable in the
    # inbox, and Reply goes straight to them. The sending address is unchanged.
    sender_name, sender_address = parseaddr(settings.DEFAULT_FROM_EMAIL)
    message = EmailMultiAlternatives(
        subject=f"{OWNER_HEADINGS[event]} {booking.reference}: {facts['service']}, {facts['when']}",
        body=render_to_string("bookings/email/owner_booking.txt", context),
        from_email=formataddr((f"{booking.full_name} via {sender_name or 'Driveo Exclusive'}", sender_address)),
        to=[recipient],
        reply_to=[booking.email],
    )
    message.attach_alternative(render_to_string("bookings/email/owner_booking.html", context), "text/html")
    return _send(message)


def send_customer_email(booking, recipient, event):
    subject, body = customer_emails.render(booking, event)
    alert_addresses = settings.BOOKING_ALERT_EMAILS
    message = EmailMessage(
        subject=subject,
        body=body,
        to=[recipient],
        # Replies reach the business, not a no-reply mailbox.
        reply_to=alert_addresses[:1] or None,
    )
    return _send(message)


def twilio_configured():
    return bool(settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_WHATSAPP_FROM)


def _whatsapp_address(number):
    number = number.replace(" ", "")
    return number if number.startswith("whatsapp:") else f"whatsapp:{number}"


def send_owner_whatsapp(booking, recipient, event):
    from twilio.base.exceptions import TwilioException, TwilioRestException
    from twilio.rest import Client

    facts = summary_lines(booking)
    params = {
        "from_": _whatsapp_address(settings.TWILIO_WHATSAPP_FROM),
        "to": _whatsapp_address(recipient),
    }
    if settings.TWILIO_WHATSAPP_CONTENT_SID and event == Event.CREATED:
        # Approved template, required for business-initiated messages outside
        # WhatsApp's 24-hour customer-service window. See README for the
        # placeholder order. Changes and cancellations go as free-form text.
        params["content_sid"] = settings.TWILIO_WHATSAPP_CONTENT_SID
        params["content_variables"] = json.dumps(
            {
                "1": facts["reference"],
                "2": facts["service"],
                "3": facts["when"],
                "4": facts["route"],
                "5": facts["customer"],
                "6": facts["admin_url"],
                "7": facts["reply_whatsapp_url"] or booking.phone,
            }
        )
    else:
        context = {"heading": OWNER_HEADINGS[event], **facts}
        params["body"] = render_to_string("bookings/whatsapp/owner_booking.txt", context)[:1600]

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
    (Audience.OWNER, Notification.Channel.EMAIL): send_owner_email,
    (Audience.OWNER, Notification.Channel.WHATSAPP): send_owner_whatsapp,
    (Audience.CUSTOMER, Notification.Channel.EMAIL): send_customer_email,
}
