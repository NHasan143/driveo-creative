"""People management for the content admin: /api/v1/staff/.

Customers: any staff member can look them up and see their bookings.
Staff accounts: superusers only.
"""

from django.contrib.auth import update_session_auth_hash
from django.db import IntegrityError, transaction
from django.db.models import Count, Max, Q
from rest_framework import generics, serializers, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import BasePermission, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from bookings.models import Booking

from .models import User
from .serializers import EMAIL_TAKEN, PHONE_VALIDATOR, check_password_strength, email_taken


class IsSuperuser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


class CustomerPagination(PageNumberPagination):
    page_size = 25


class CustomerSerializer(serializers.ModelSerializer):
    booking_count = serializers.IntegerField(read_only=True)
    last_booking_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone",
            "locale",
            "is_active",
            "date_joined",
            "last_login",
            "booking_count",
            "last_booking_at",
        ]
        # Staff may only switch a customer's account on or off.
        read_only_fields = [name for name in fields if name != "is_active"]


class StaffBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            "id",
            "reference",
            "status",
            "created_at",
            "service",
            "city",
            "vehicle",
            "journey_date",
            "journey_time",
            "pickup_location",
            "destination",
            "total_price",
            "currency",
        ]
        read_only_fields = fields


def customers():
    return User.objects.filter(is_staff=False).annotate(
        booking_count=Count("bookings"), last_booking_at=Max("bookings__created_at")
    )


class CustomerListView(generics.ListAPIView):
    """GET /api/v1/staff/customers/?search=&page= → paginated, newest first."""

    permission_classes = [IsAdminUser]
    serializer_class = CustomerSerializer
    pagination_class = CustomerPagination

    def get_queryset(self):
        queryset = customers().order_by("-date_joined")
        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(phone__icontains=search)
            )
        return queryset


class CustomerDetailView(generics.RetrieveUpdateAPIView):
    """GET → the customer and their bookings · PATCH {"is_active"}."""

    permission_classes = [IsAdminUser]
    serializer_class = CustomerSerializer
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        return customers()

    def retrieve(self, request, *args, **kwargs):
        customer = self.get_object()
        data = self.get_serializer(customer).data
        bookings = customer.bookings.order_by("-journey_date", "-journey_time")
        data["bookings"] = StaffBookingSerializer(bookings, many=True).data
        return Response(data)


class StaffUserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=254)
    phone = serializers.CharField(max_length=40, allow_blank=True, required=False, validators=[PHONE_VALIDATOR])
    password = serializers.CharField(max_length=128, write_only=True, trim_whitespace=False)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "is_active",
            "is_superuser",
            "date_joined",
            "last_login",
            "password",
        ]
        read_only_fields = ["id", "date_joined", "last_login"]

    def get_fields(self):
        fields = super().get_fields()
        if self.instance is not None:
            # Usernames are permanent; passwords change through their own endpoint.
            fields["username"].read_only = True
            fields.pop("password")
        return fields

    def validate_email(self, value):
        value = value.strip().lower()
        if email_taken(value, self.instance.pk if self.instance else None):
            raise serializers.ValidationError(EMAIL_TAKEN)
        return value

    def validate(self, attrs):
        if "password" in attrs:
            candidate = User(**{key: value for key, value in attrs.items() if key != "password"})
            try:
                check_password_strength(attrs["password"], candidate)
            except serializers.ValidationError as error:
                raise serializers.ValidationError({"password": error.detail}) from error

        me = self.context["request"].user
        if self.instance is not None and self.instance.pk == me.pk:
            if attrs.get("is_active") is False:
                raise serializers.ValidationError({"is_active": ["You can't deactivate your own account."]})
            if attrs.get("is_superuser") is False:
                raise serializers.ValidationError({"is_superuser": ["You can't remove your own superuser access."]})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, is_staff=True, **validated_data)


class SaveWithEmailCheckMixin:
    """Turns a lost race on the unique email into a field error."""

    def perform_save(self, serializer):
        try:
            with transaction.atomic():
                serializer.save()
        except IntegrityError as error:
            raise serializers.ValidationError({"email": [EMAIL_TAKEN]}) from error

    def perform_create(self, serializer):
        self.perform_save(serializer)

    def perform_update(self, serializer):
        self.perform_save(serializer)


class StaffUserListView(SaveWithEmailCheckMixin, generics.ListCreateAPIView):
    """GET staff accounts · POST {"username", "email", "first_name", "last_name", "password", "is_superuser"}."""

    permission_classes = [IsSuperuser]
    serializer_class = StaffUserSerializer
    queryset = User.objects.filter(is_staff=True).order_by("first_name", "last_name", "username")


class StaffUserDetailView(SaveWithEmailCheckMixin, generics.RetrieveUpdateAPIView):
    """GET · PATCH {"email", "first_name", "last_name", "phone", "is_active", "is_superuser"}."""

    permission_classes = [IsSuperuser]
    serializer_class = StaffUserSerializer
    queryset = User.objects.filter(is_staff=True)
    http_method_names = ["get", "patch", "head", "options"]


class StaffUserPasswordView(APIView):
    """POST /api/v1/staff/users/{id}/password/ {"password"} → 204. Sets a new password."""

    permission_classes = [IsSuperuser]

    def post(self, request, pk):
        user = generics.get_object_or_404(User, pk=pk, is_staff=True)
        password = request.data.get("password")
        if not isinstance(password, str) or not password:
            return Response({"password": ["Enter a password."]}, status=status.HTTP_400_BAD_REQUEST)
        try:
            check_password_strength(password, user)
        except serializers.ValidationError as error:
            return Response({"password": error.detail}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(password)
        user.save(update_fields=["password"])
        if user.pk == request.user.pk:
            update_session_auth_hash(request._request, user)
        return Response(status=status.HTTP_204_NO_CONTENT)
