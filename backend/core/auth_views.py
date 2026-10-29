"""Staff sign-in for the Next.js content admin, which runs on another origin.

Session cookie + CSRF token, the same mechanism as Django's own admin:

- The session cookie is HttpOnly, so page scripts (and any XSS) never see a
  credential; signing out or deactivating a user ends access at once.
- The admin's origin can't read this API's cookies, so the CSRF token comes in
  the JSON body (GET /auth/csrf/, and again after sign-in, which rotates it).
  The admin sends it back as X-CSRFToken on every write.
- Browsers send the cookies with `credentials: "include"` when the admin and
  API are on the same site (localhost:3000 → localhost:8000, or
  driveoexclusive.com → api.driveoexclusive.com). See SESSION_COOKIE_SAMESITE.
"""

from django.contrib.auth import authenticate, get_user_model, login, logout
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import serializers, status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView


class CsrfView(APIView):
    """GET /api/v1/auth/csrf/ → {"csrfToken": "..."} and the csrftoken cookie."""

    authentication_classes = []
    permission_classes = [AllowAny]

    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        return Response({"csrfToken": get_token(request)})


class SignInSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=254, help_text="Username or email address.")
    password = serializers.CharField(max_length=128, trim_whitespace=False)


def staff_payload(request, user):
    return {
        "user": {
            "username": user.get_username(),
            "name": user.get_full_name() or user.get_username(),
            "email": user.email,
            # Superusers also manage staff accounts in the admin.
            "isSuperuser": user.is_superuser,
        },
        "csrfToken": get_token(request),
    }


class SessionView(APIView):
    """/api/v1/auth/session/

    GET    → 200 {"user", "csrfToken"} for a signed-in staff member, else 403.
    POST   {"username", "password"} → signs in a staff member (rate limited).
    DELETE → signs out.
    """

    throttle_scope = "staff_sign_in"

    def get_permissions(self):
        return [AllowAny()] if self.request.method == "POST" else [IsAdminUser()]

    def get_throttles(self):
        return [ScopedRateThrottle()] if self.request.method == "POST" else []

    def get(self, request):
        return Response(staff_payload(request, request.user))

    def post(self, request):
        # DRF only checks CSRF for signed-in users; check it here too (login CSRF).
        SessionAuthentication().enforce_csrf(request)
        serializer = SignInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data["username"].strip()

        if "@" in identifier:
            match = get_user_model().objects.filter(email__iexact=identifier).first()
            identifier = match.get_username() if match else identifier
        user = authenticate(request._request, username=identifier, password=serializer.validated_data["password"])

        if user is None:
            return Response({"detail": "Incorrect username or password."}, status=status.HTTP_400_BAD_REQUEST)
        if not user.is_staff:
            return Response(
                {"detail": "This account can't use the content admin. Ask an administrator for staff access."},
                status=status.HTTP_403_FORBIDDEN,
            )
        login(request._request, user)  # New session key and CSRF token.
        return Response(staff_payload(request, user))

    def delete(self, request):
        logout(request._request)
        return Response(status=status.HTTP_204_NO_CONTENT)
