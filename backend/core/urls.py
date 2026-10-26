from django.urls import path

from .auth_views import CsrfView, SessionView
from .views import HealthView

urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("auth/csrf/", CsrfView.as_view(), name="auth-csrf"),
    path("auth/session/", SessionView.as_view(), name="auth-session"),
]
