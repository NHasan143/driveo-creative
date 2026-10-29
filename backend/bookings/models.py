import secrets
import zoneinfo
from datetime import datetime

from django.conf import settings
from django.db import IntegrityError, models, transaction
from django.utils import timezone

from .choices import CITY_TIMEZONES, DEFAULT_TIMEZONE, HIRE_HOURS_MAX, HIRE_HOURS_MIN, Locale

# No 0/O or 1/I, so a reference read out over the phone is unambiguous.
REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
REFERENCE_PREFIX = "DRV-"


def generate_reference():
    suffix = "".join(secrets.choice(REFERENCE_ALPHABET) for _ in range(6))
    return f"{REFERENCE_PREFIX}{suffix}"


def generate_manage_token():
    return secrets.token_urlsafe(24)


class Booking(models.Model):
    """A chauffeur booking at a fixed price from the admin's price grid.

    The customer pays later (the chauffeur or an invoice). Staff confirm each
    booking once a chauffeur and car are assigned.
    """

    class Status(models.TextChoices):
        PENDING = "pending", "Awaiting confirmation"
        CONFIRMED = "confirmed", "Confirmed"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    class PriceUnit(models.TextChoices):
        TRIP = "trip", "Per journey"
        HOUR = "hour", "Per hour"

    class CancelledBy(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        STAFF = "staff", "Driveo"

    reference = models.CharField(max_length=10, unique=True, editable=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    # Lets a guest open, change or cancel the booking from the link in their email.
    manage_token = models.CharField(max_length=64, unique=True, default=generate_manage_token, editable=False)
    # The customer who was signed in when booking; they also see it under My account.
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="bookings"
    )

    first_name = models.CharField(max_length=60)
    last_name = models.CharField(max_length=60)
    email = models.EmailField(max_length=254)
    phone = models.CharField(max_length=40)
    locale = models.CharField(max_length=2, choices=Locale.choices, default=Locale.EN)

    # Content ids (backend/content/), e.g. "airport_transfer", "london", "first_class".
    service = models.CharField(max_length=64)
    city = models.CharField(max_length=64)
    vehicle = models.CharField(max_length=64)
    pickup_location = models.CharField(max_length=300)
    destination = models.CharField(max_length=300, blank=True)
    hire_hours = models.PositiveSmallIntegerField(null=True, blank=True)
    flight_number = models.CharField(max_length=12, blank=True)
    journey_date = models.DateField()
    journey_time = models.TimeField()
    passengers = models.PositiveSmallIntegerField()
    luggage = models.PositiveSmallIntegerField()
    notes = models.TextField(max_length=1500, blank=True)

    # The price when booked (or last changed), from the price grid. Kept as it was,
    # even if the grid changes later.
    currency = models.CharField(max_length=3, default="EUR")
    price_unit = models.CharField(max_length=4, choices=PriceUnit.choices)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    total_price = models.DecimalField(max_digits=9, decimal_places=2)

    # Filled in by staff when confirming; shared with the customer.
    chauffeur_name = models.CharField(max_length=100, blank=True)
    chauffeur_phone = models.CharField(max_length=40, blank=True)
    vehicle_details = models.CharField(
        max_length=100, blank=True, help_text="E.g. black S-Class, registration AB12 CDE."
    )
    staff_notes = models.TextField(blank=True)

    confirmed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.CharField(max_length=10, choices=CancelledBy.choices, blank=True)

    # Kept to investigate abuse of the public form.
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(condition=models.Q(passengers__gte=1), name="booking_passengers_min_1"),
            models.CheckConstraint(
                condition=models.Q(hire_hours__isnull=True)
                | models.Q(hire_hours__gte=HIRE_HOURS_MIN, hire_hours__lte=HIRE_HOURS_MAX),
                name="booking_hire_hours_range",
            ),
        ]

    def __str__(self):
        return f"{self.reference} · {self.full_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def is_hourly(self):
        return self.price_unit == self.PriceUnit.HOUR

    @property
    def starts_at(self):
        """Pickup as an aware datetime, in the city's own time zone."""
        tz = zoneinfo.ZoneInfo(CITY_TIMEZONES.get(self.city, DEFAULT_TIMEZONE))
        return datetime.combine(self.journey_date, self.journey_time, tzinfo=tz)

    @property
    def is_open(self):
        return self.status in (self.Status.PENDING, self.Status.CONFIRMED)

    def can_change(self, now=None):
        """Customers may change or cancel until BOOKING_CANCEL_NOTICE_HOURS before pickup."""
        now = now or timezone.now()
        notice = settings.BOOKING_CANCEL_NOTICE_HOURS * 3600
        return self.is_open and (self.starts_at - now).total_seconds() >= notice

    def save(self, *args, **kwargs):
        if self.reference:
            return super().save(*args, **kwargs)
        # A reference collision is a one-in-a-billion event; retry a few times.
        # Any other integrity error (a check constraint) is raised straight away.
        for attempt in range(5):
            self.reference = generate_reference()
            try:
                with transaction.atomic():
                    return super().save(*args, **kwargs)
            except IntegrityError:
                taken = Booking.objects.filter(reference=self.reference).exists()
                if not taken or attempt == 4:
                    raise


class Notification(models.Model):
    """One message to one recipient about one booking event, with its delivery log."""

    class Event(models.TextChoices):
        CREATED = "created", "New booking"
        CHANGED = "changed", "Booking changed"
        CONFIRMED = "confirmed", "Booking confirmed"
        CANCELLED = "cancelled", "Booking cancelled"

    class Audience(models.TextChoices):
        OWNER = "owner", "Driveo"
        CUSTOMER = "customer", "Customer"

    class Channel(models.TextChoices):
        EMAIL = "email", "Email"
        WHATSAPP = "whatsapp", "WhatsApp"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SENT = "sent", "Sent"
        FAILED = "failed", "Failed"
        SKIPPED = "skipped", "Skipped"

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="notifications")
    event = models.CharField(max_length=10, choices=Event.choices, default=Event.CREATED)
    audience = models.CharField(max_length=10, choices=Audience.choices, default=Audience.OWNER)
    channel = models.CharField(max_length=10, choices=Channel.choices)
    recipient = models.CharField(max_length=254, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING, db_index=True)
    attempts = models.PositiveSmallIntegerField(default=0)
    provider_message_id = models.CharField(max_length=100, blank=True)
    error = models.TextField(blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        target = self.recipient or "—"
        return f"{self.get_event_display()} {self.get_channel_display()} to {target}: {self.get_status_display()}"
