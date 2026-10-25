import logging

from django.db import transaction
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import generate_reference
from .notifications import queue_quote_notifications
from .serializers import QuoteRequestSerializer

logger = logging.getLogger(__name__)


class QuoteRequestCreateView(APIView):
    """POST /api/v1/quote-requests/ → 201 {"reference": "DRV-XXXXXX"}.

    The request is saved first; owner alerts are queued only after the
    transaction commits, so a provider outage can never lose a request.
    """

    authentication_classes = []
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
            quote = serializer.save(ip_address=request.META.get("REMOTE_ADDR") or None)
            transaction.on_commit(lambda: queue_quote_notifications(quote))

        return Response({"reference": quote.reference}, status=status.HTTP_201_CREATED)
