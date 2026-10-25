import secrets

from django.db import IntegrityError, models, transaction

from .choices import (
    HIRE_HOURS_MAX,
    HIRE_HOURS_MIN,
    City,
    Locale,
    ServiceType,
    VehicleClass,
)

# No 0/O or 1/I, so a reference read out over the phone is unambiguous.
REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
REFERENCE_PREFIX = "DRV-"


def generate_reference():
    suffix = "".join(secrets.choice(REFERENCE_ALPHABET) for _ in range(6))
    return f"{REFERENCE_PREFIX}{suffix}"


class QuoteRequest(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "New"
        CONTACTED = "contacted", "Contacted"
        QUOTED = "quoted", "Quoted"
        CLOSED = "closed", "Closed"

    reference = models.CharField(max_length=10, unique=True, editable=False)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.NEW, db_index=True
    )

    first_name = models.CharField(max_length=60)
    last_name = models.CharField(max_length=60)
    email = models.EmailField(max_length=254)
    phone = models.CharField(max_length=40)

    city = models.CharField(max_length=20, choices=City.choices)
    service_type = models.CharField(max_length=20, choices=ServiceType.choices)
    vehicle_class = models.CharField(max_length=20, choices=VehicleClass.choices)
    pickup_location = models.CharField(max_length=300)
    destination = models.CharField(max_length=300, blank=True)
    hire_hours = models.PositiveSmallIntegerField(null=True, blank=True)
    journey_date = models.DateField()
    journey_time = models.TimeField()
    passengers = models.PositiveSmallIntegerField()
    luggage = models.PositiveSmallIntegerField()
    notes = models.TextField(max_length=1500, blank=True)
    locale = models.CharField(max_length=2, choices=Locale.choices, default=Locale.EN)

    # Kept to investigate abuse of the public form.
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    staff_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(passengers__gte=1), name="quote_passengers_min_1"
            ),
            models.CheckConstraint(
                condition=models.Q(hire_hours__isnull=True)
                | models.Q(hire_hours__gte=HIRE_HOURS_MIN, hire_hours__lte=HIRE_HOURS_MAX),
                name="quote_hire_hours_range",
            ),
        ]

    def __str__(self):
        return f"{self.reference} · {self.full_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

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
                taken = QuoteRequest.objects.filter(reference=self.reference).exists()
                if not taken or attempt == 4:
                    raise


class Notification(models.Model):
    """One alert to one recipient about one quote request, with its delivery log."""

    class Channel(models.TextChoices):
        EMAIL = "email", "Email"
        WHATSAPP = "whatsapp", "WhatsApp"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SENT = "sent", "Sent"
        FAILED = "failed", "Failed"
        SKIPPED = "skipped", "Skipped"

    quote_request = models.ForeignKey(
        QuoteRequest, on_delete=models.CASCADE, related_name="notifications"
    )
    channel = models.CharField(max_length=10, choices=Channel.choices)
    recipient = models.CharField(max_length=254, blank=True)
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PENDING, db_index=True
    )
    attempts = models.PositiveSmallIntegerField(default=0)
    provider_message_id = models.CharField(max_length=100, blank=True)
    error = models.TextField(blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["quote_request", "channel", "recipient"],
                name="notification_unique_per_recipient",
            )
        ]

    def __str__(self):
        return f"{self.get_channel_display()} to {self.recipient or '-'}: {self.status}"
