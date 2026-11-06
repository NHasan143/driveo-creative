import logging
import secrets

from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.settings import api_settings
from rest_framework.throttling import BaseThrottle, ScopedRateThrottle
from rest_framework.views import APIView

from .models import Booking, Notification, generate_manage_token, generate_reference
from .notifications import queue_booking_notifications
from .serializers import BookingChangeSerializer, BookingCreateSerializer, BookingSerializer

logger = logging.getLogger(__name__)

# The customer's own list shows their most recent bookings.
MY_BOOKINGS_LIMIT = 100


def client_ip(request):
    """The visitor's IP, the same address the rate limit counts. Behind proxies
    (REST_FRAMEWORK NUM_PROXIES) it comes from X-Forwarded-For. Without that
    setting DRF would return the whole header, which isn't a single address."""
    if api_settings.NUM_PROXIES:
        return BaseThrottle().get_ident(request) or None
    return request.META.get("REMOTE_ADDR") or None


class BookingCreateView(APIView):
    """POST /api/v1/bookings/ → 201 with the booking and its private `manage_token`.

    The booking is saved first; messages are queued only after the transaction
    commits, so a provider outage can never lose a booking. A signed-in
    customer's booking is linked to their account: DRF then checks the CSRF
    token, so the website always sends it.
    """

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "bookings"

    def post(self, request):
        serializer = BookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if serializer.validated_data.get("honeypot"):
            # Look like a success so bots learn nothing; store and send nothing.
            logger.info("Dropped booking: honeypot filled")
            fake = {"reference": generate_reference(), "status": "pending", "manage_token": generate_manage_token()}
            return Response(fake, status=status.HTTP_201_CREATED)

        with transaction.atomic():
            booking = serializer.save(
                ip_address=client_ip(request),
                customer=request.user if request.user.is_authenticated else None,
            )
            transaction.on_commit(lambda: queue_booking_notifications(booking, Notification.Event.CREATED))

        data = BookingSerializer(booking).data
        data["manage_token"] = booking.manage_token
        return Response(data, status=status.HTTP_201_CREATED)


class BookingAccessMixin:
    """The booking's own customer (signed in) or anyone holding its manage token."""

    permission_classes = [AllowAny]
    TOKEN_HEADER = "HTTP_X_BOOKING_TOKEN"

    def get_booking(self, request, reference):
        booking = Booking.objects.filter(reference=reference.upper()).first()
        if booking is not None:
            token = request.META.get(self.TOKEN_HEADER, "")
            if token and secrets.compare_digest(token, booking.manage_token):
                return booking
            if request.user.is_authenticated and booking.customer_id == request.user.pk:
                return booking
        # The same answer for "no such booking" and "not yours", so references can't be probed.
        raise NotFound("No booking with this reference, or the link is not valid.")

    @staticmethod
    def closed(booking):
        code = "too_late" if booking.is_open else "closed"
        message = (
            "Changes and cancellations close shortly before pickup. Please call us."
            if code == "too_late"
            else "This booking can no longer be changed."
        )
        return Response({"code": code, "detail": message}, status=status.HTTP_409_CONFLICT)


class BookingDetailView(BookingAccessMixin, APIView):
    """GET /api/v1/bookings/{reference}/ · PATCH to change date, time, route, car or party."""

    def get(self, request, reference):
        return Response(BookingSerializer(self.get_booking(request, reference)).data)

    def patch(self, request, reference):
        booking = self.get_booking(request, reference)
        if not booking.can_change():
            return self.closed(booking)
        serializer = BookingChangeSerializer(booking, data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            for name, value in serializer.validated_data.items():
                setattr(booking, name, value)
            # Driveo checks the new details again before confirming.
            booking.status = Booking.Status.PENDING
            booking.confirmed_at = None
            booking.save()
            transaction.on_commit(lambda: queue_booking_notifications(booking, Notification.Event.CHANGED))
        return Response(BookingSerializer(booking).data)


class BookingCancelView(BookingAccessMixin, APIView):
    """POST /api/v1/bookings/{reference}/cancel/ → the cancelled booking."""

    def post(self, request, reference):
        booking = self.get_booking(request, reference)
        if not booking.can_change():
            return self.closed(booking)
        with transaction.atomic():
            booking.status = Booking.Status.CANCELLED
            booking.cancelled_at = timezone.now()
            booking.cancelled_by = Booking.CancelledBy.CUSTOMER
            booking.save(update_fields=["status", "cancelled_at", "cancelled_by", "updated_at"])
            transaction.on_commit(lambda: queue_booking_notifications(booking, Notification.Event.CANCELLED))
        return Response(BookingSerializer(booking).data)


class MyBookingsView(APIView):
    """GET /api/v1/account/bookings/ → the signed-in customer's bookings, newest first."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = request.user.bookings.order_by("-created_at")[:MY_BOOKINGS_LIMIT]
        return Response(BookingSerializer(bookings, many=True).data)
