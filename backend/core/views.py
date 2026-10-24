from botocore.exceptions import BotoCoreError, ClientError
from django.core.files.storage import default_storage
from django.db import DatabaseError, connection
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthView(APIView):
    """Liveness check for the database and object storage.

    Reports only "ok" / "error" per service, so it is safe to leave public.
    """

    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        checks = {"database": self._check_database(), "storage": self._check_storage()}
        healthy = all(status == "ok" for status in checks.values())
        return Response(checks, status=200 if healthy else 503)

    @staticmethod
    def _check_database():
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        except DatabaseError:
            return "error"
        return "ok"

    @staticmethod
    def _check_storage():
        # HEAD on a key that need not exist: a 404 still proves the endpoint,
        # bucket and credentials work; a bad credential raises instead.
        try:
            default_storage.exists("healthcheck")
        except (BotoCoreError, ClientError):
            return "error"
        return "ok"
