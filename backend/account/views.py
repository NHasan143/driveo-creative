"""Customer accounts for the website: /api/v1/account/.

Same mechanism as staff sign-in (core/auth_views.py): Django's HttpOnly
session cookie, plus a CSRF token handed out in JSON because the website runs
on another origin. Every response that signs someone in carries a fresh token.
"""

from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.db import IntegrityError, transaction
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .emails import send_password_reset
from .models import User
from .serializers import (
    EMAIL_TAKEN,
    PasswordChangeSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetSerializer,
    ProfileSerializer,
    RegisterSerializer,
    SignInSerializer,
    UserSerializer,
)



def session_payload(request, user):
    return {
        "user": UserSerializer(user).data if user.is_authenticated else None,
        "csrf_token": get_token(request),
    }


def enforce_csrf(request):
    """DRF only checks CSRF for signed-in users; the forms below need it for everyone."""
    SessionAuthentication().enforce_csrf(request)


class AnonymousWriteView(APIView):
    """Base for POST endpoints anyone may call (sign in, register, password reset)."""

    permission_classes = [AllowAny]
    # Rate limit for POST, per IP (REST_FRAMEWORK DEFAULT_THROTTLE_RATES); None = no limit.
    throttle_scope = None

    def get_throttles(self):
        return [ScopedRateThrottle()] if self.request.method == "POST" and self.throttle_scope else []


class SessionView(AnonymousWriteView):
    """/api/v1/account/session/

    GET    → 200 {"user": {...} | null, "csrf_token"}; never an error, so pages
             can ask "who is signed in?" and get a CSRF token in one call.
    POST   {"email", "password"} → signs in (rate limited).
    DELETE → signs out.
    """

    throttle_scope = "account_sign_in"

    def get(self, request):
        return Response(session_payload(request, request.user))

    def post(self, request):
        enforce_csrf(request)
        serializer = SignInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data["email"].strip()

        if "@" in identifier:
            match = User.objects.filter(email__iexact=identifier).first()
            identifier = match.get_username() if match else identifier
        user = authenticate(request._request, username=identifier, password=serializer.validated_data["password"])
        if user is None:
            return Response({"detail": "Incorrect email or password."}, status=status.HTTP_400_BAD_REQUEST)

        login(request._request, user)  # New session key and CSRF token.
        return Response(session_payload(request, user))

    def delete(self, request):
        logout(request._request)
        return Response(status=status.HTTP_204_NO_CONTENT)


class RegisterView(AnonymousWriteView):
    """POST /api/v1/account/register/ → 201, signed in as the new customer."""

    throttle_scope = "account_register"

    def post(self, request):
        enforce_csrf(request)
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                user = serializer.save()
        except IntegrityError:
            # Someone registered the same email a moment earlier.
            return Response({"email": [EMAIL_TAKEN]}, status=status.HTTP_400_BAD_REQUEST)

        login(request._request, user, backend="django.contrib.auth.backends.ModelBackend")
        return Response(session_payload(request, user), status=status.HTTP_201_CREATED)


class ProfileView(APIView):
    """GET / PATCH /api/v1/account/profile/ (name, email, phone, language)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = ProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        try:
            with transaction.atomic():
                user = serializer.save()
        except IntegrityError:
            return Response({"email": [EMAIL_TAKEN]}, status=status.HTTP_400_BAD_REQUEST)
        return Response(UserSerializer(user).data)


class PasswordView(APIView):
    """POST /api/v1/account/password/ {"current_password", "new_password"} → 204."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={"user": request.user})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        # Keeps this session signed in; other sessions of this person end.
        update_session_auth_hash(request._request, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordResetView(AnonymousWriteView):
    """POST /api/v1/account/password-reset/ {"email", "locale"?} → always 204.

    The answer is the same whether or not the address has an account, so the
    endpoint can't be used to find out who is a customer.
    """

    throttle_scope = "password_reset"

    def post(self, request):
        enforce_csrf(request)
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(email__iexact=serializer.validated_data["email"], is_active=True).first()
        if user is not None and user.has_usable_password():
            send_password_reset(user, serializer.validated_data.get("locale"))
        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordResetConfirmView(AnonymousWriteView):
    """POST /api/v1/account/password-reset/confirm/ {"uid", "token", "new_password"} → 204."""

    def post(self, request):
        enforce_csrf(request)
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])  # Also invalidates the link.
        return Response(status=status.HTTP_204_NO_CONTENT)

