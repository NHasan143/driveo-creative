"""Accounts API shapes (snake_case, like the booking API)."""

import secrets

from django.contrib.auth import password_validation
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import RegexValidator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework import serializers

from quotes.choices import Locale
from quotes.models import QuoteRequest

from .models import User

PHONE_VALIDATOR = RegexValidator(r"^[+0-9 ()./-]{7,40}$", "Enter a valid phone number.")
EMAIL_TAKEN = "This email address is already registered."


def email_taken(email, exclude_pk=None):
    others = User.objects.filter(email__iexact=email)
    if exclude_pk is not None:
        others = others.exclude(pk=exclude_pk)
    return others.exists()


def check_password_strength(password, user):
    """Runs Django's password validators; their messages become a DRF ValidationError."""
    try:
        password_validation.validate_password(password, user)
    except DjangoValidationError as error:
        raise serializers.ValidationError(list(error.messages)) from error


def username_for(email):
    """Customers sign in with their email; the username is only an internal handle."""
    if len(email) <= 150 and not User.objects.filter(username__iexact=email).exists():
        return email
    return f"customer-{secrets.token_hex(6)}"


class UserSerializer(serializers.ModelSerializer):
    """The signed-in person, as the website and the admin show them."""

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "phone", "locale", "is_staff", "is_superuser"]
        read_only_fields = fields


class ProfileSerializer(serializers.ModelSerializer):
    """What people edit about themselves."""

    email = serializers.EmailField(max_length=254)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150, allow_blank=True, required=False)
    phone = serializers.CharField(max_length=40, allow_blank=True, required=False, validators=[PHONE_VALIDATOR])
    locale = serializers.ChoiceField(choices=Locale.choices, required=False)

    class Meta:
        model = User
        fields = ["email", "first_name", "last_name", "phone", "locale"]

    def validate_email(self, value):
        value = value.strip().lower()
        if email_taken(value, self.instance.pk if self.instance else None):
            raise serializers.ValidationError(EMAIL_TAKEN)
        return value


class RegisterSerializer(ProfileSerializer):
    password = serializers.CharField(max_length=128, write_only=True, trim_whitespace=False)

    class Meta(ProfileSerializer.Meta):
        fields = [*ProfileSerializer.Meta.fields, "password"]

    def validate(self, attrs):
        # Validators compare the password with the person's name and email.
        candidate = User(
            email=attrs["email"], first_name=attrs["first_name"], last_name=attrs.get("last_name", "")
        )
        try:
            check_password_strength(attrs["password"], candidate)
        except serializers.ValidationError as error:
            raise serializers.ValidationError({"password": error.detail}) from error
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        return User.objects.create_user(
            username=username_for(validated_data["email"]), password=password, **validated_data
        )


class SignInSerializer(serializers.Serializer):
    email = serializers.CharField(max_length=254, help_text="Email address (staff may use their username).")
    password = serializers.CharField(max_length=128, trim_whitespace=False)


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(max_length=128, trim_whitespace=False)
    new_password = serializers.CharField(max_length=128, trim_whitespace=False)

    def validate_current_password(self, value):
        if not self.context["user"].check_password(value):
            raise serializers.ValidationError("Your current password is not correct.")
        return value

    def validate_new_password(self, value):
        check_password_strength(value, self.context["user"])
        return value


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=254)
    locale = serializers.ChoiceField(choices=Locale.choices, required=False)


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField(max_length=64)
    token = serializers.CharField(max_length=128)
    new_password = serializers.CharField(max_length=128, trim_whitespace=False)

    INVALID = "This reset link is invalid or has expired. Please ask for a new one."

    def validate(self, attrs):
        try:
            pk = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = User.objects.get(pk=pk, is_active=True)
        except (ValueError, TypeError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({"token": [self.INVALID]}) from None
        if not default_token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError({"token": [self.INVALID]})
        try:
            check_password_strength(attrs["new_password"], user)
        except serializers.ValidationError as error:
            raise serializers.ValidationError({"new_password": error.detail}) from error
        attrs["user"] = user
        return attrs


class CustomerQuoteRequestSerializer(serializers.ModelSerializer):
    """A quote request as its customer sees it (no staff notes, no IP)."""

    class Meta:
        model = QuoteRequest
        fields = [
            "reference",
            "status",
            "created_at",
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
        ]
        read_only_fields = fields
