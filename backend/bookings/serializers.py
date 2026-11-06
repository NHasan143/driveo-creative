import re
from datetime import timedelta

from django.conf import settings
from django.core.validators import RegexValidator
from django.utils import timezone
from rest_framework import serializers

from content.models import City, Service, Vehicle
from content.serializers import LocalizedField

from .choices import HIRE_HOURS_MAX, HIRE_HOURS_MIN, Locale
from .models import Booking
from .pricing import JourneyError, resolve

_UNSAFE_CHARS = re.compile(r"[\x00-\x1f\x7f<>]")
_WHITESPACE = re.compile(r"\s+")


class CleanCharField(serializers.CharField):
    """Strips control characters and angle brackets and collapses whitespace,
    the same cleaning the website applies before sending."""

    def to_internal_value(self, data):
        value = super().to_internal_value(data)
        return _WHITESPACE.sub(" ", _UNSAFE_CHARS.sub(" ", value)).strip()


class JourneyFields(serializers.Serializer):
    """The parts of a journey a customer sets when booking and may change later."""

    vehicle = serializers.CharField(max_length=64)
    pickup_location = CleanCharField(min_length=2, max_length=300)
    destination = CleanCharField(max_length=300, allow_blank=True, required=False)
    hire_hours = serializers.IntegerField(
        min_value=HIRE_HOURS_MIN, max_value=HIRE_HOURS_MAX, allow_null=True, required=False
    )
    flight_number = CleanCharField(
        max_length=12,
        allow_blank=True,
        required=False,
        validators=[RegexValidator(r"^[A-Za-z0-9 ]*$", "Enter a flight number like BA117.")],
    )
    journey_date = serializers.DateField()
    journey_time = serializers.TimeField(input_formats=["%H:%M", "%H:%M:%S"])
    passengers = serializers.IntegerField(min_value=1)
    luggage = serializers.IntegerField(min_value=0)
    notes = CleanCharField(max_length=1500, allow_blank=True, required=False)

    def validate_flight_number(self, value):
        return value.replace(" ", "").upper()

    def check_journey(self, attrs, service_id, city_id):
        """Prices the journey and applies the booking rules. Returns the priced journey."""
        try:
            journey = resolve(service_id, city_id, attrs["vehicle"])
        except JourneyError as error:
            raise serializers.ValidationError({error.field: [error.message]}) from error

        errors = {}
        if journey.is_hourly:
            if attrs.get("hire_hours") is None:
                errors["hire_hours"] = "Select the number of hours."
            attrs["destination"] = ""
        else:
            if len(attrs.get("destination", "")) < 2:
                errors["destination"] = "Enter a destination."
            attrs["hire_hours"] = None

        if attrs["passengers"] > journey.vehicle.passengers:
            errors["passengers"] = f"This vehicle takes up to {journey.vehicle.passengers} passengers."
        if attrs["luggage"] > journey.vehicle.luggage:
            errors["luggage"] = f"This vehicle takes up to {journey.vehicle.luggage} luggage items."

        # Driveo needs time to assign a chauffeur: measured in the city's own time.
        starts_at = Booking(
            city=city_id, journey_date=attrs["journey_date"], journey_time=attrs["journey_time"]
        ).starts_at
        if starts_at < timezone.now() + timedelta(hours=settings.BOOKING_MIN_NOTICE_HOURS):
            errors["journey_date"] = (
                f"Book at least {settings.BOOKING_MIN_NOTICE_HOURS} hours before pickup, "
                "or call us for an urgent journey."
            )

        if errors:
            raise serializers.ValidationError(errors)
        return journey


class BookingCreateSerializer(JourneyFields):
    """POST /api/v1/bookings/. Mirrors frontend/src/features/booking/schema.ts."""

    first_name = CleanCharField(min_length=2, max_length=60)
    last_name = CleanCharField(min_length=1, max_length=60)
    email = serializers.EmailField(max_length=254)
    phone = CleanCharField(
        min_length=7,
        max_length=40,
        validators=[RegexValidator(r"^[+0-9 ()./-]+$", "Enter a valid phone number.")],
    )
    service = serializers.CharField(max_length=64)
    city = serializers.CharField(max_length=64)
    locale = serializers.ChoiceField(choices=Locale.choices, default=Locale.EN)
    # Hidden field that only bots fill in. The view drops those bookings.
    honeypot = serializers.CharField(max_length=500, allow_blank=True, required=False, write_only=True)

    def validate(self, attrs):
        if attrs.get("honeypot"):
            return attrs  # Never saved; skip the content lookups.
        journey = self.check_journey(attrs, attrs["service"], attrs["city"])
        attrs["price_unit"] = journey.price_unit
        attrs["unit_price"] = journey.unit_price
        attrs["total_price"] = journey.total(attrs.get("hire_hours") or 1)
        return attrs

    def create(self, validated_data):
        validated_data.pop("honeypot", None)
        return Booking.objects.create(**validated_data)


class BookingChangeSerializer(JourneyFields):
    """PATCH /api/v1/bookings/{reference}/: a new date, time, route, car or party."""

    def __init__(self, booking, *args, **kwargs):
        self.booking = booking
        # Start from the booking, so a partial change is checked as a whole journey.
        current = {name: getattr(booking, name) for name in JourneyFields._declared_fields}
        current["journey_time"] = booking.journey_time.strftime("%H:%M")
        data = {**current, **kwargs.pop("data", {})}
        super().__init__(*args, data=data, **kwargs)

    def validate(self, attrs):
        journey = self.check_journey(attrs, self.booking.service, self.booking.city)
        attrs["price_unit"] = journey.price_unit
        attrs["unit_price"] = journey.unit_price
        attrs["total_price"] = journey.total(attrs.get("hire_hours") or 1)
        return attrs


class BookingSerializer(serializers.ModelSerializer):
    """A booking as its customer sees it (no staff notes, IP or manage token)."""

    service_name = serializers.SerializerMethodField()
    city_name = serializers.SerializerMethodField()
    vehicle_name = serializers.SerializerMethodField()
    can_change = serializers.SerializerMethodField()
    change_deadline = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "reference",
            "status",
            "service",
            "service_name",
            "city",
            "city_name",
            "vehicle",
            "vehicle_name",
            "pickup_location",
            "destination",
            "hire_hours",
            "flight_number",
            "journey_date",
            "journey_time",
            "passengers",
            "luggage",
            "notes",
            "first_name",
            "last_name",
            "email",
            "phone",
            "currency",
            "price_unit",
            "unit_price",
            "total_price",
            "chauffeur_name",
            "chauffeur_phone",
            "vehicle_details",
            "can_change",
            "change_deadline",
            "created_at",
        ]
        read_only_fields = fields

    def _name(self, model, pk, attr):
        """The record's name in every language; cached per response, since lists repeat them."""
        cache = self.context.setdefault("names", {})
        key = (model.__name__, pk)
        if key not in cache:
            record = model.objects.filter(pk=pk).first()
            cache[key] = LocalizedField().to_representation(getattr(record, attr, None)) if record else None
        return cache[key]

    def get_service_name(self, booking):
        return self._name(Service, booking.service, "title")

    def get_city_name(self, booking):
        return self._name(City, booking.city, "name")

    def get_vehicle_name(self, booking):
        return self._name(Vehicle, booking.vehicle, "name")

    def get_can_change(self, booking):
        return booking.can_change()

    def get_change_deadline(self, booking):
        deadline = booking.starts_at - timedelta(hours=settings.BOOKING_CANCEL_NOTICE_HOURS)
        return deadline.isoformat()

    def to_representation(self, booking):
        data = super().to_representation(booking)
        # The chauffeur's details only once Driveo has confirmed them.
        if booking.status != Booking.Status.CONFIRMED:
            for name in ("chauffeur_name", "chauffeur_phone", "vehicle_details"):
                data[name] = ""
        return data

