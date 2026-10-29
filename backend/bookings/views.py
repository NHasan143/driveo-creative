import logging

from django.db import transaction
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.settings import api_settings
from rest_framework.throttling import BaseThrottle, ScopedRateThrottle
from rest_framework.views import APIView

from .models import generate_reference
from .notifications import queue_quote_notifications
from .serializers import QuoteRequestSerializer

logger = logging.getLogger(__name__)


def client_ip(request):
    """The visitor's IP, the same address the rate limit counts. Behind proxies
    (REST_FRAMEWORK NUM_PROXIES) it comes from X-Forwarded-For. Without that
    setting DRF would return the whole header, which isn't a single address."""
    if api_settings.NUM_PROXIES:
        return BaseThrottle().get_ident(request) or None
    return request.META.get("REMOTE_ADDR") or None


class QuoteRequestCreateView(APIView):
    """POST /api/v1/quote-requests/ → 201 {"reference": "DRV-XXXXXX"}.

    The request is saved first; owner alerts are queued only after the
    transaction commits, so a provider outage can never lose a request.
    """

    # Session auth only to know who is signed in: a signed-in customer's request
    # is linked to their account. Anyone may post; DRF checks the CSRF token
    # of signed-in visitors, so the website always sends it.
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "quote_requests"

    def post(self, request):
        serializer = QuoteRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if serializer.validated_data.get("honeypot"):
            # Look like a success so bots learn nothing; store and send nothing.
            logger.info("Dropped quote request: honeypot filled")
            return Response(
                {"reference": generate_reference()}, status=status.HTTP_201_CREATED
            )

        with transaction.atomic():
            quote = serializer.save(
                ip_address=client_ip(request),
                customer=request.user if request.user.is_authenticated else None,
            )
            transaction.on_commit(lambda: queue_quote_notifications(quote))

        return Response({"reference": quote.reference}, status=status.HTTP_201_CREATED)
