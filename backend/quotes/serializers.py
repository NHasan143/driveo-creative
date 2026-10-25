import re
from datetime import timedelta

from django.core.validators import RegexValidator
from django.utils import timezone
from rest_framework import serializers

from .choices import HIRE_HOURS_MAX, HIRE_HOURS_MIN, ServiceType, vehicle_capacity
from .models import QuoteRequest

_UNSAFE_CHARS = re.compile(r"[\x00-\x1f\x7f<>]")
_WHITESPACE = re.compile(r"\s+")


class CleanCharField(serializers.CharField):
    """Strips control characters and angle brackets and collapses whitespace,
    the same cleaning the website applies before sending."""

    def to_internal_value(self, data):
        value = super().to_internal_value(data)
        return _WHITESPACE.sub(" ", _UNSAFE_CHARS.sub(" ", value)).strip()


class QuoteRequestSerializer(serializers.ModelSerializer):
    """Public quote form. Mirrors frontend/src/features/quote/schema.ts."""

    first_name = CleanCharField(min_length=2, max_length=60)
    last_name = CleanCharField(min_length=1, max_length=60)
    phone = CleanCharField(
        min_length=7,
        max_length=40,
        validators=[
            RegexValidator(r"^[+0-9 ()./-]+$", "Enter a valid phone number.")
        ],
    )
    pickup_location = CleanCharField(min_length=2, max_length=300)
    destination = CleanCharField(max_length=300, allow_blank=True, required=False)
    hire_hours = serializers.IntegerField(
        min_value=HIRE_HOURS_MIN, max_value=HIRE_HOURS_MAX, allow_null=True, required=False
    )
    journey_time = serializers.TimeField(input_formats=["%H:%M"])
    passengers = serializers.IntegerField(min_value=1)
    luggage = serializers.IntegerField(min_value=0)
    notes = CleanCharField(max_length=1500, allow_blank=True, required=False)
    # Hidden field that only bots fill in. The view drops those requests.
    honeypot = serializers.CharField(
        max_length=500, allow_blank=True, required=False, write_only=True
    )

    class Meta:
        model = QuoteRequest
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone",
            "city",
            "service_type",
            "vehicle_class",
            "pickup_location",
            "destination",
            "hire_hours",
            "journey_date",
            "journey_time",
            "passengers",
            "luggage",
            "notes",
            "locale",
            "honeypot",
        ]

    def validate_journey_date(self, value):
        # One day of slack: "today" in Dubai can still be yesterday in UTC.
        if value < timezone.now().date() - timedelta(days=1):
            raise serializers.ValidationError("The journey date is in the past.")
        return value

    def validate(self, attrs):
        errors = {}

        if attrs["service_type"] == ServiceType.HOURLY_HIRE:
            if attrs.get("hire_hours") is None:
                errors["hire_hours"] = "Select the number of hours."
            attrs["destination"] = ""
        else:
            if len(attrs.get("destination", "")) < 2:
                errors["destination"] = "Enter a destination."
            attrs["hire_hours"] = None

        max_passengers, max_luggage = vehicle_capacity(attrs["vehicle_class"])
        if attrs["passengers"] > max_passengers:
            errors["passengers"] = (
                f"This vehicle takes up to {max_passengers} passengers."
            )
        if attrs["luggage"] > max_luggage:
            errors["luggage"] = f"This vehicle takes up to {max_luggage} luggage items."

        if errors:
            raise serializers.ValidationError(errors)
        return attrs

    def create(self, validated_data):
        validated_data.pop("honeypot", None)
        return super().create(validated_data)
