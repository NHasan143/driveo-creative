import re
import smtplib
from datetime import timedelta
from unittest import mock

from django.core import mail
from django.core.cache import cache
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from twilio.base.exceptions import TwilioRestException

from .models import Notification, QuoteRequest
from .notifications import RetryableDeliveryError, deliver, requeue_stale_notifications
from .tasks import send_notification

URL = reverse("quote-request-create")

ALERTS = {
    "QUOTE_ALERT_EMAILS": ["owner@example.com"],
    "QUOTE_ALERT_WHATSAPP": ["+447700900123"],
    "TWILIO_ACCOUNT_SID": "ACtest",
    "TWILIO_AUTH_TOKEN": "token",
    "TWILIO_WHATSAPP_FROM": "+14155238886",
    "TWILIO_WHATSAPP_CONTENT_SID": "",
}


def payload(**overrides):
    data = {
        "first_name": "Ada",
        "last_name": "Lovelace",
        "email": "ada@example.com",
        "phone": "+44 20 7946 0000",
        "city": "london",
        "service_type": "airport_transfer",
        "vehicle_class": "first_class",
        "pickup_location": "Heathrow T5",
        "destination": "Mayfair",
        "hire_hours": None,
        "journey_date": str(timezone.now().date() + timedelta(days=7)),
        "journey_time": "09:30",
        "passengers": 2,
        "luggage": 2,
        "notes": "BA117",
        "locale": "en",
        "honeypot": "",
    }
    data.update(overrides)
    return data


def twilio_message(sid="SM123"):
    return mock.Mock(sid=sid)


class QuoteApiTestCase(TestCase):
    def setUp(self):
        cache.clear()  # Reset the rate limiter between tests.
        # Run queued alerts synchronously, through the real Celery task.
        patcher = mock.patch.object(
            send_notification,
            "delay",
            side_effect=lambda pk: send_notification.apply(args=(pk,), throw=True),
        )
        patcher.start()
        self.addCleanup(patcher.stop)

    def post(self, data):
        with self.captureOnCommitCallbacks(execute=True):
            return self.client.post(URL, data, content_type="application/json")


@override_settings(**ALERTS)
class CreateQuoteRequestTests(QuoteApiTestCase):
    @mock.patch("twilio.rest.Client")
    def test_saves_request_and_alerts_owner_by_email_and_whatsapp(self, client):
        client.return_value.messages.create.return_value = twilio_message("SM42")

        response = self.post(payload())

        self.assertEqual(response.status_code, 201)
        reference = response.json()["reference"]
        self.assertRegex(reference, r"^DRV-[A-HJ-NP-Z2-9]{6}$")
        quote = QuoteRequest.objects.get(reference=reference)
        self.assertEqual(quote.full_name, "Ada Lovelace")

        email = mail.outbox[0]
        self.assertEqual(email.to, ["owner@example.com"])
        self.assertEqual(email.reply_to, ["ada@example.com"])
        self.assertIn(reference, email.subject)
        self.assertIn("Heathrow T5 → Mayfair", email.body)

        sent = client.return_value.messages.create.call_args.kwargs
        self.assertEqual(sent["to"], "whatsapp:+447700900123")
        self.assertEqual(sent["from_"], "whatsapp:+14155238886")
        self.assertIn(reference, sent["body"])

        statuses = dict(quote.notifications.values_list("channel", "status"))
        self.assertEqual(statuses, {"email": "sent", "whatsapp": "sent"})
        self.assertEqual(quote.notifications.get(channel="whatsapp").provider_message_id, "SM42")

    @mock.patch("twilio.rest.Client")
    def test_uses_whatsapp_template_when_configured(self, client):
        client.return_value.messages.create.return_value = twilio_message()

        with self.settings(TWILIO_WHATSAPP_CONTENT_SID="HXabc"):
            self.post(payload())

        sent = client.return_value.messages.create.call_args.kwargs
        self.assertEqual(sent["content_sid"], "HXabc")
        self.assertIn('"1": "DRV-', sent["content_variables"])
        self.assertNotIn("body", sent)

    def test_honeypot_returns_fake_reference_and_stores_nothing(self):
        response = self.post(payload(honeypot="http://spam.example"))

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.json()["reference"].startswith("DRV-"))
        self.assertFalse(QuoteRequest.objects.exists())
        self.assertEqual(mail.outbox, [])

    @mock.patch("twilio.rest.Client")
    def test_cleans_text_fields(self, client):
        client.return_value.messages.create.return_value = twilio_message()

        self.post(payload(notes="  <b>late</b>\n\n flight  ", first_name="Ada\x00 "))

        quote = QuoteRequest.objects.get()
        self.assertEqual(quote.notes, "b late /b flight")
        self.assertEqual(quote.first_name, "Ada")

    @mock.patch("twilio.rest.Client")
    def test_hourly_hire_ignores_destination(self, client):
        client.return_value.messages.create.return_value = twilio_message()

        response = self.post(
            payload(service_type="hourly_hire", hire_hours=4, destination="ignored")
        )

        self.assertEqual(response.status_code, 201)
        quote = QuoteRequest.objects.get()
        self.assertEqual((quote.hire_hours, quote.destination), (4, ""))

    @mock.patch("twilio.rest.Client")
    def test_van_takes_seven_passengers_and_eight_bags(self, client):
        client.return_value.messages.create.return_value = twilio_message()

        response = self.post(payload(vehicle_class="business_van", passengers=7, luggage=8))

        self.assertEqual(response.status_code, 201)

    @mock.patch("twilio.rest.Client")
    def test_rate_limited_per_ip(self, client):
        client.return_value.messages.create.return_value = twilio_message()

        with mock.patch(
            "rest_framework.throttling.ScopedRateThrottle.THROTTLE_RATES",
            {"quote_requests": "2/hour"},
        ):
            codes = [self.post(payload()).status_code for _ in range(3)]

        self.assertEqual(codes, [201, 201, 429])


@override_settings(**ALERTS)
class ValidationTests(QuoteApiTestCase):
    def assertInvalid(self, data, field):
        response = self.post(data)
        self.assertEqual(response.status_code, 400, response.json())
        self.assertIn(field, response.json())
        self.assertFalse(QuoteRequest.objects.exists())

    def test_hourly_hire_needs_hours(self):
        self.assertInvalid(payload(service_type="hourly_hire", hire_hours=None), "hire_hours")

    def test_hire_hours_range(self):
        self.assertInvalid(payload(service_type="hourly_hire", hire_hours=17), "hire_hours")
        self.assertInvalid(payload(service_type="hourly_hire", hire_hours=1), "hire_hours")

    def test_transfer_needs_destination(self):
        self.assertInvalid(payload(destination=""), "destination")

    def test_standard_car_capacity(self):
        self.assertInvalid(payload(passengers=5), "passengers")
        self.assertInvalid(payload(luggage=4), "luggage")

    def test_van_capacity(self):
        self.assertInvalid(payload(vehicle_class="business_van", passengers=8), "passengers")

    def test_unknown_ids(self):
        self.assertInvalid(payload(city="berlin"), "city")
        self.assertInvalid(payload(service_type="helicopter"), "service_type")
        self.assertInvalid(payload(vehicle_class="g_class"), "vehicle_class")

    def test_past_date(self):
        past = str(timezone.now().date() - timedelta(days=3))
        self.assertInvalid(payload(journey_date=past), "journey_date")

    def test_phone_format(self):
        self.assertInvalid(payload(phone="call me maybe"), "phone")

    def test_time_format(self):
        self.assertInvalid(payload(journey_time="9.30am"), "journey_time")

    def test_short_first_name(self):
        self.assertInvalid(payload(first_name="A"), "first_name")


class AlertConfigurationTests(QuoteApiTestCase):
    @override_settings(QUOTE_ALERT_EMAILS=[], QUOTE_ALERT_WHATSAPP=[])
    def test_missing_recipients_are_skipped_not_lost(self):
        response = self.post(payload())

        self.assertEqual(response.status_code, 201)
        rows = QuoteRequest.objects.get().notifications.all()
        self.assertEqual({row.status for row in rows}, {"skipped"})
        self.assertIn("QUOTE_ALERT_EMAILS", rows.get(channel="email").error)

    @override_settings(**{**ALERTS, "TWILIO_ACCOUNT_SID": ""})
    def test_whatsapp_skipped_without_twilio_credentials(self):
        self.post(payload())

        row = QuoteRequest.objects.get().notifications.get(channel="whatsapp")
        self.assertEqual(row.status, "skipped")
        self.assertIn("Twilio is not configured", row.error)

    @override_settings(**ALERTS)
    def test_request_saved_even_when_broker_is_down(self):
        with mock.patch.object(
            send_notification, "delay", side_effect=ConnectionError("redis down")
        ):
            response = self.post(payload())

        self.assertEqual(response.status_code, 201)
        quote = QuoteRequest.objects.get()
        self.assertEqual(
            set(quote.notifications.values_list("status", flat=True)), {"pending"}
        )


@override_settings(**ALERTS)
class AdminTests(QuoteApiTestCase):
    @mock.patch("twilio.rest.Client")
    def test_staff_can_list_open_and_resend(self, client):
        from django.contrib.auth.models import User

        client.return_value.messages.create.side_effect = TwilioRestException(
            400, "uri", msg="Not a WhatsApp number", code=63003
        )
        self.post(payload())
        quote = QuoteRequest.objects.get()
        self.client.force_login(User.objects.create_superuser("staff", "s@example.com", "pw"))

        listing = self.client.get(reverse("admin:quotes_quoterequest_changelist"))
        self.assertContains(listing, quote.reference)
        self.assertContains(listing, "1 sent, 1 failed")
        self.assertContains(
            self.client.get(reverse("admin:quotes_quoterequest_change", args=[quote.pk])),
            "Not a WhatsApp number",
        )

        client.return_value.messages.create.side_effect = None
        client.return_value.messages.create.return_value = twilio_message()
        with self.captureOnCommitCallbacks(execute=True):
            self.client.post(
                reverse("admin:quotes_quoterequest_changelist"),
                {"action": "resend_failed_alerts", "_selected_action": [quote.pk]},
            )
        self.assertEqual(
            set(quote.notifications.values_list("status", flat=True)), {"sent"}
        )


@override_settings(**ALERTS)
class DeliveryTests(TestCase):
    def setUp(self):
        self.quote = QuoteRequest.objects.create(
            **{
                k: v
                for k, v in payload(journey_date=timezone.now().date()).items()
                if k != "honeypot"
            }
        )

    def make_row(self, channel, recipient):
        return Notification.objects.create(
            quote_request=self.quote, channel=channel, recipient=recipient
        )

    @mock.patch("twilio.rest.Client")
    def test_bad_number_fails_without_retry(self, client):
        client.return_value.messages.create.side_effect = TwilioRestException(
            400, "uri", msg="Invalid 'To' number", code=21211
        )
        row = self.make_row("whatsapp", "+1000")

        deliver(row.pk, final_attempt=False)

        row.refresh_from_db()
        self.assertEqual((row.status, row.attempts), ("failed", 1))
        self.assertIn("21211", row.error)

    @mock.patch("twilio.rest.Client")
    def test_provider_outage_retries_then_gives_up(self, client):
        client.return_value.messages.create.side_effect = TwilioRestException(
            503, "uri", msg="Service unavailable"
        )
        row = self.make_row("whatsapp", "+447700900123")

        with self.assertRaises(RetryableDeliveryError):
            deliver(row.pk, final_attempt=False)
        row.refresh_from_db()
        self.assertEqual((row.status, row.attempts), ("pending", 1))

        deliver(row.pk, final_attempt=True)
        row.refresh_from_db()
        self.assertEqual((row.status, row.attempts), ("failed", 2))

    def test_smtp_outage_is_retryable(self):
        row = self.make_row("email", "owner@example.com")
        with mock.patch(
            "django.core.mail.EmailMultiAlternatives.send",
            side_effect=smtplib.SMTPServerDisconnected("gone"),
        ):
            with self.assertRaises(RetryableDeliveryError):
                deliver(row.pk, final_attempt=False)

    def test_sent_notification_is_not_sent_twice(self):
        row = self.make_row("email", "owner@example.com")
        deliver(row.pk, final_attempt=False)
        deliver(row.pk, final_attempt=False)

        self.assertEqual(len(mail.outbox), 1)

    def test_admin_link_in_alert(self):
        row = self.make_row("email", "owner@example.com")
        deliver(row.pk, final_attempt=False)

        self.assertRegex(
            mail.outbox[0].body,
            re.escape(f"http://localhost:8000/admin/quotes/quoterequest/{self.quote.pk}/change/"),
        )

    def test_stale_pending_rows_are_requeued(self):
        row = self.make_row("email", "owner@example.com")
        Notification.objects.filter(pk=row.pk).update(
            updated_at=timezone.now() - timedelta(hours=1)
        )
        fresh = self.make_row("email", "second@example.com")

        with mock.patch.object(send_notification, "delay") as delay:
            count = requeue_stale_notifications()

        self.assertEqual(count, 1)
        delay.assert_called_once_with(row.pk)  # Not the fresh row.
        fresh.refresh_from_db()
        self.assertEqual(fresh.status, "pending")
