import re
import smtplib
from datetime import timedelta
from decimal import Decimal
from unittest import mock

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core import mail
from django.core.cache import cache
from django.test import Client, TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework.throttling import ScopedRateThrottle
from twilio.base.exceptions import TwilioRestException

from content.models import City, Service, ServicePrice, Vehicle

from .models import Booking, Notification
from .notifications import RetryableDeliveryError, deliver, requeue_stale_notifications, whatsapp_chat_url
from .tasks import send_notification

URL = reverse("booking-create")
PASSWORD = "Silent-Mercedes-42"

ALERTS = {
    "BOOKING_ALERT_EMAILS": ["owner@example.com"],
    "BOOKING_ALERT_WHATSAPP": ["+447700900123"],
    "TWILIO_ACCOUNT_SID": "ACtest",
    "TWILIO_AUTH_TOKEN": "token",
    "TWILIO_WHATSAPP_FROM": "+14155238886",
    "TWILIO_WHATSAPP_CONTENT_SID": "",
    "WEBSITE_BASE_URL": "https://driveo.example",
}


def text(en):
    return {"en": en, "fr": f"{en} (fr)", "bg": "", "ar": ""}


def make_content():
    """The published content a booking needs: services, a city, vehicles and prices."""
    first = Vehicle.objects.create(
        id="first_class", slug="first-class", published=True, name=text("First Class"),
        model="S-Class", description=text("Saloon"), passengers=4, luggage=3,
    )
    van = Vehicle.objects.create(
        id="business_van", slug="business-van", published=True, name=text("Business Van"),
        model="VLE", description=text("Van"), passengers=7, luggage=8,
    )
    airport = Service.objects.create(
        id="airport_transfer", slug="airport-transfer", published=True, icon="plane", title=text("Airport transfer"),
    )
    hourly = Service.objects.create(
        id="hourly_hire", slug="hourly-hire", published=True, icon="clock", title=text("Hourly hire"),
        price_unit="hour",
    )
    events = Service.objects.create(
        id="private_event", slug="private-events", published=True, icon="sparkles", title=text("Private events"),
    )
    london = City.objects.create(id="london", slug="london", published=True, name=text("London"))
    london.services.set([airport, hourly])  # Not private events.
    ServicePrice.objects.create(service=airport, city=london, vehicle=first, amount=Decimal("120.00"))
    ServicePrice.objects.create(service=hourly, city=london, vehicle=first, amount=Decimal("75.00"))
    # No price for the van at all, and none for private events.
    return {"first": first, "van": van, "airport": airport, "hourly": hourly, "london": london}


def payload(**overrides):
    data = {
        "first_name": "Ada",
        "last_name": "Lovelace",
        "email": "ada@example.com",
        "phone": "+44 20 7946 0000",
        "city": "london",
        "service": "airport_transfer",
        "vehicle": "first_class",
        "pickup_location": "Heathrow T5",
        "destination": "Mayfair",
        "hire_hours": None,
        "flight_number": "ba 117",
        "journey_date": str(timezone.now().date() + timedelta(days=10)),
        "journey_time": "09:30",
        "passengers": 2,
        "luggage": 2,
        "notes": "",
        "locale": "fr",
        "honeypot": "",
    }
    data.update(overrides)
    return data


def twilio_message(sid="SM123"):
    return mock.Mock(sid=sid)


class BookingApiTestCase(TestCase):
    def setUp(self):
        cache.clear()  # Reset the rate limiter between tests.
        self.content = make_content()
        # Run queued messages synchronously, through the real Celery task.
        patcher = mock.patch.object(
            send_notification,
            "delay",
            side_effect=lambda pk: send_notification.apply(args=(pk,), throw=True),
        )
        patcher.start()
        self.addCleanup(patcher.stop)
        twilio = mock.patch("twilio.rest.Client")
        self.twilio = twilio.start()
        self.twilio.return_value.messages.create.return_value = twilio_message()
        self.addCleanup(twilio.stop)

    def post(self, data, client=None, **headers):
        with self.captureOnCommitCallbacks(execute=True):
            return (client or self.client).post(URL, data, content_type="application/json", headers=headers)

    def book(self, **overrides):
        response = self.post(payload(**overrides))
        self.assertEqual(response.status_code, 201, response.content)
        return response.json()


@override_settings(**ALERTS)
class CreateBookingTests(BookingApiTestCase):
    def test_booking_is_priced_from_the_grid_and_messages_go_out(self):
        data = self.book()

        booking = Booking.objects.get()
        self.assertRegex(data["reference"], r"^DRV-[A-HJ-NP-Z2-9]{6}$")
        self.assertEqual(data["status"], "pending")
        self.assertEqual((data["total_price"], data["currency"], data["price_unit"]), ("120.00", "EUR", "trip"))
        self.assertEqual(data["manage_token"], booking.manage_token)
        self.assertEqual(data["service_name"]["en"], "Airport transfer")
        self.assertEqual(booking.flight_number, "BA117")
        self.assertEqual(booking.ip_address, "127.0.0.1")

        self.assertEqual(
            set(booking.notifications.values_list("audience", "channel", "status")),
            {("owner", "email", "sent"), ("owner", "whatsapp", "sent"), ("customer", "email", "sent")},
        )
        owner, customer = sorted(mail.outbox, key=lambda message: message.to[0] != "owner@example.com")
        self.assertIn(f"New booking {booking.reference}", owner.subject)
        self.assertIn("120.00 EUR, paid later", owner.body)
        # The customer's email is in the language they booked in, with their private link.
        self.assertEqual(customer.to, ["ada@example.com"])
        self.assertEqual(customer.subject, f"Réservation reçue : {booking.reference}")
        self.assertIn(
            f"https://driveo.example/booking?lang=fr&ref={booking.reference}&token={booking.manage_token}",
            customer.body,
        )

    def test_hourly_hire_is_priced_per_hour(self):
        data = self.book(service="hourly_hire", hire_hours=4, destination="Ignored")
        self.assertEqual((data["total_price"], data["unit_price"], data["price_unit"]), ("300.00", "75.00", "hour"))
        self.assertEqual(Booking.objects.get().destination, "")

    def test_only_priced_combinations_can_be_booked(self):
        response = self.post(payload(vehicle="business_van"))
        self.assertEqual(response.status_code, 400)
        self.assertIn("vehicle", response.json())
        self.assertFalse(Booking.objects.exists())

    def test_service_must_be_offered_in_the_city(self):
        response = self.post(payload(service="private_event"))
        self.assertEqual(response.json(), {"service": ["This service isn't offered in this city."]})

    def test_unpublished_content_cannot_be_booked(self):
        Vehicle.objects.filter(pk="first_class").update(published=False)
        self.assertIn("vehicle", self.post(payload()).json())

    def test_capacity_comes_from_the_vehicle(self):
        Vehicle.objects.filter(pk="first_class").update(passengers=3)
        response = self.post(payload(passengers=4))
        self.assertEqual(response.json(), {"passengers": ["This vehicle takes up to 3 passengers."]})

    def test_needs_notice_before_pickup(self):
        soon = timezone.now() + timedelta(hours=1)
        response = self.post(payload(journey_date=str(soon.date()), journey_time="00:00"))
        self.assertIn("journey_date", response.json())

    def test_journey_needs_a_destination_or_hours(self):
        self.assertIn("destination", self.post(payload(destination="")).json())
        self.assertIn("hire_hours", self.post(payload(service="hourly_hire")).json())

    def test_honeypot_looks_like_success_but_saves_nothing(self):
        response = self.post(payload(honeypot="https://spam.example"))
        self.assertEqual(response.status_code, 201)
        self.assertIn("reference", response.json())
        self.assertFalse(Booking.objects.exists())
        self.assertEqual(len(mail.outbox), 0)

    def test_signed_in_customers_own_their_bookings(self):
        user = get_user_model().objects.create_user("ada@example.com", "ada@example.com", PASSWORD)
        self.client.force_login(user)
        self.book()
        self.assertEqual(Booking.objects.get().customer, user)

    def test_signed_in_bookings_need_the_csrf_token(self):
        user = get_user_model().objects.create_user("ada@example.com", "ada@example.com", PASSWORD)
        client = Client(enforce_csrf_checks=True)
        client.force_login(user)
        response = self.post(payload(), client=client)
        self.assertEqual(response.status_code, 403)
        self.assertFalse(Booking.objects.exists())

    def test_rate_limited_per_ip(self):
        with mock.patch.object(ScopedRateThrottle, "THROTTLE_RATES", {"bookings": "2/hour"}):
            codes = [self.post(payload()).status_code for _ in range(3)]
        self.assertEqual(codes, [201, 201, 429])

    @override_settings(REST_FRAMEWORK={**settings.REST_FRAMEWORK, "NUM_PROXIES": 2})
    def test_behind_proxies_the_forwarded_client_ip_is_stored(self):
        self.post(payload(), **{"X-Forwarded-For": "203.0.113.5, 198.51.100.7"})
        self.assertEqual(Booking.objects.get().ip_address, "203.0.113.5")

    def test_saved_even_when_the_broker_is_down(self):
        with mock.patch.object(send_notification, "delay", side_effect=ConnectionError("redis down")):
            response = self.post(payload())
        self.assertEqual(response.status_code, 201)
        self.assertEqual(set(Booking.objects.get().notifications.values_list("status", flat=True)), {"pending"})


@override_settings(**ALERTS)
class ManageBookingTests(BookingApiTestCase):
    def setUp(self):
        super().setUp()
        data = self.book()
        self.booking = Booking.objects.get(reference=data["reference"])
        self.token = data["manage_token"]
        self.url = reverse("booking-detail", args=[self.booking.reference])
        self.cancel_url = reverse("booking-cancel", args=[self.booking.reference])
        mail.outbox.clear()

    def call(self, method, url, data=None, token=None):
        headers = {"X-Booking-Token": token} if token else {}
        with self.captureOnCommitCallbacks(execute=True):
            return getattr(self.client, method)(url, data, content_type="application/json", headers=headers)

    def test_the_link_opens_the_booking(self):
        response = self.call("get", self.url, token=self.token)
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("manage_token", response.json())
        self.assertTrue(response.json()["can_change"])

    @override_settings(CORS_ALLOWED_ORIGINS=["https://driveo.test"])
    def test_the_website_may_send_the_token(self):
        # The website is another origin, so the browser asks first.
        response = self.client.options(
            self.url,
            headers={
                "Origin": "https://driveo.test",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "x-booking-token",
            },
        )
        self.assertIn("x-booking-token", response["Access-Control-Allow-Headers"])

    def test_wrong_token_or_stranger_gets_not_found(self):
        self.assertEqual(self.call("get", self.url, token="nope").status_code, 404)
        self.assertEqual(self.call("get", self.url).status_code, 404)
        stranger = get_user_model().objects.create_user("eve@example.com", "eve@example.com", PASSWORD)
        self.client.force_login(stranger)
        self.assertEqual(self.call("get", self.url).status_code, 404)

    def test_the_signed_in_owner_needs_no_token(self):
        user = get_user_model().objects.create_user("ada@example.com", "ada@example.com", PASSWORD)
        Booking.objects.filter(pk=self.booking.pk).update(customer=user)
        self.client.force_login(user)
        self.assertEqual(self.call("get", self.url).status_code, 200)
        self.assertEqual(len(self.client.get(reverse("account-bookings")).json()), 1)

    def test_change_reprices_and_asks_for_confirmation_again(self):
        Booking.objects.filter(pk=self.booking.pk).update(status="confirmed", chauffeur_name="Sam")
        response = self.call("patch", self.url, {"journey_time": "11:00", "passengers": 3}, token=self.token)

        self.assertEqual(response.status_code, 200, response.content)
        self.booking.refresh_from_db()
        self.assertEqual((self.booking.status, self.booking.passengers), ("pending", 3))
        self.assertEqual(f"{self.booking.journey_time:%H:%M}", "11:00")
        events = self.booking.notifications.filter(event="changed")
        self.assertEqual(set(events.values_list("audience", flat=True)), {"owner", "customer"})

    def test_change_checks_the_whole_journey(self):
        response = self.call("patch", self.url, {"passengers": 9}, token=self.token)
        self.assertIn("passengers", response.json())

    def test_cancel(self):
        response = self.call("post", self.cancel_url, token=self.token)
        self.assertEqual(response.json()["status"], "cancelled")
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.cancelled_by, "customer")
        self.assertTrue(any("annulée" in message.subject for message in mail.outbox))

        again = self.call("post", self.cancel_url, token=self.token)
        self.assertEqual((again.status_code, again.json()["code"]), (409, "closed"))

    def test_no_changes_shortly_before_pickup(self):
        soon = timezone.now() + timedelta(hours=10)
        Booking.objects.filter(pk=self.booking.pk).update(journey_date=soon.date(), journey_time=soon.time())
        response = self.call("post", self.cancel_url, token=self.token)
        self.assertEqual((response.status_code, response.json()["code"]), (409, "too_late"))

    def test_chauffeur_details_only_once_confirmed(self):
        Booking.objects.filter(pk=self.booking.pk).update(chauffeur_name="Sam")
        self.assertEqual(self.call("get", self.url, token=self.token).json()["chauffeur_name"], "")
        Booking.objects.filter(pk=self.booking.pk).update(status="confirmed")
        self.assertEqual(self.call("get", self.url, token=self.token).json()["chauffeur_name"], "Sam")


@override_settings(**ALERTS)
class AdminTests(BookingApiTestCase):
    def setUp(self):
        super().setUp()
        self.booking = Booking.objects.get(reference=self.book()["reference"])
        staff = get_user_model().objects.create_superuser("staff", "s@example.com", PASSWORD)
        self.client.force_login(staff)
        mail.outbox.clear()

    def test_list_and_open(self):
        listing = self.client.get(reverse("admin:bookings_booking_changelist"))
        self.assertContains(listing, self.booking.reference)
        self.assertContains(listing, "3 sent")
        self.assertContains(self.client.get(reverse("admin:bookings_booking_change", args=[self.booking.pk])), "BA117")

    def test_confirm_action_emails_the_customer_with_the_chauffeur(self):
        Booking.objects.filter(pk=self.booking.pk).update(chauffeur_name="Sam Driver", vehicle_details="Black S-Class")
        with self.captureOnCommitCallbacks(execute=True):
            self.client.post(
                reverse("admin:bookings_booking_changelist"),
                {"action": "confirm", "_selected_action": [self.booking.pk]},
            )
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, "confirmed")
        self.assertIsNotNone(self.booking.confirmed_at)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Sam Driver", mail.outbox[0].body)
        self.assertIn("confirmée", mail.outbox[0].subject)

    def test_staff_cancellation_tells_only_the_customer(self):
        with self.captureOnCommitCallbacks(execute=True):
            self.client.post(
                reverse("admin:bookings_booking_changelist"),
                {"action": "cancel", "_selected_action": [self.booking.pk]},
            )
        self.booking.refresh_from_db()
        self.assertEqual((self.booking.status, self.booking.cancelled_by), ("cancelled", "staff"))
        self.assertEqual([message.to for message in mail.outbox], [["ada@example.com"]])

    def test_resend_failed_messages(self):
        self.booking.notifications.update(status="failed")
        with self.captureOnCommitCallbacks(execute=True):
            self.client.post(
                reverse("admin:bookings_booking_changelist"),
                {"action": "resend_failed_messages", "_selected_action": [self.booking.pk]},
            )
        self.assertEqual(set(self.booking.notifications.values_list("status", flat=True)), {"sent"})


class AlertConfigurationTests(BookingApiTestCase):
    @override_settings(BOOKING_ALERT_EMAILS=[], BOOKING_ALERT_WHATSAPP=[])
    def test_missing_recipients_are_skipped_not_lost(self):
        self.book()
        owner_rows = Booking.objects.get().notifications.filter(audience="owner")
        self.assertEqual({row.status for row in owner_rows}, {"skipped"})
        self.assertIn("BOOKING_ALERT_EMAILS", owner_rows.get(channel="email").error)

    @override_settings(**{**ALERTS, "TWILIO_ACCOUNT_SID": ""})
    def test_whatsapp_skipped_without_twilio_credentials(self):
        self.book()
        row = Booking.objects.get().notifications.get(channel="whatsapp")
        self.assertEqual(row.status, "skipped")
        self.assertIn("Twilio is not configured", row.error)


@override_settings(**ALERTS)
class DeliveryTests(TestCase):
    def setUp(self):
        make_content()
        data = {k: v for k, v in payload().items() if k != "honeypot"}
        self.booking = Booking.objects.create(
            **data, price_unit="trip", unit_price=Decimal("120"), total_price=Decimal("120")
        )

    def make_row(self, channel, recipient, audience="owner"):
        return Notification.objects.create(booking=self.booking, channel=channel, recipient=recipient, audience=audience)

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
        client.return_value.messages.create.side_effect = TwilioRestException(503, "uri", msg="Service unavailable")
        row = self.make_row("whatsapp", "+447700900123")
        with self.assertRaises(RetryableDeliveryError):
            deliver(row.pk, final_attempt=False)
        row.refresh_from_db()
        self.assertEqual((row.status, row.attempts), ("pending", 1))
        deliver(row.pk, final_attempt=True)
        row.refresh_from_db()
        self.assertEqual((row.status, row.attempts), ("failed", 2))

    @mock.patch("twilio.rest.Client")
    def test_whatsapp_template_variables(self, client):
        client.return_value.messages.create.return_value = twilio_message()
        with override_settings(TWILIO_WHATSAPP_CONTENT_SID="HXtemplate"):
            deliver(self.make_row("whatsapp", "+447700900123").pk, final_attempt=False)
        params = client.return_value.messages.create.call_args.kwargs
        self.assertEqual(params["content_sid"], "HXtemplate")
        self.assertIn(self.booking.reference, params["content_variables"])

    def test_smtp_outage_is_retryable(self):
        row = self.make_row("email", "owner@example.com")
        with mock.patch(
            "django.core.mail.EmailMultiAlternatives.send", side_effect=smtplib.SMTPServerDisconnected("gone")
        ):
            with self.assertRaises(RetryableDeliveryError):
                deliver(row.pk, final_attempt=False)

    def test_sent_notification_is_not_sent_twice(self):
        row = self.make_row("email", "owner@example.com")
        deliver(row.pk, final_attempt=False)
        deliver(row.pk, final_attempt=False)
        self.assertEqual(len(mail.outbox), 1)

    def test_admin_link_in_owner_alert(self):
        deliver(self.make_row("email", "owner@example.com").pk, final_attempt=False)
        self.assertRegex(
            mail.outbox[0].body,
            re.escape(f"http://localhost:8000/admin/bookings/booking/{self.booking.pk}/change/"),
        )

    def test_stale_pending_rows_are_requeued(self):
        row = self.make_row("email", "owner@example.com")
        Notification.objects.filter(pk=row.pk).update(updated_at=timezone.now() - timedelta(hours=1))
        fresh = self.make_row("email", "second@example.com")
        with mock.patch.object(send_notification, "delay") as delay:
            count = requeue_stale_notifications()
        self.assertEqual(count, 1)
        delay.assert_called_once_with(row.pk)  # Not the fresh row.
        fresh.refresh_from_db()
        self.assertEqual(fresh.status, "pending")


class WhatsAppLinkTests(TestCase):
    def test_international_numbers_get_a_chat_link(self):
        self.assertEqual(whatsapp_chat_url("+44 20 7946 0000"), "https://wa.me/442079460000")
        self.assertEqual(whatsapp_chat_url("0044 20 7946 0000"), "https://wa.me/442079460000")

    def test_local_numbers_have_none(self):
        self.assertIsNone(whatsapp_chat_url("020 7946 0000"))
