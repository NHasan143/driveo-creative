from unittest import mock

from django.test import Client, TestCase, override_settings
from django.urls import reverse

from .views import HealthView

HEALTH = reverse("health")
QUOTES = reverse("quote-request-create")

PRODUCTION = {
    "SECURE_SSL_REDIRECT": True,
    "SECURE_PROXY_SSL_HEADER": ("HTTP_X_FORWARDED_PROTO", "https"),
    "SECURE_HSTS_SECONDS": 3600,
}


@override_settings(**PRODUCTION)
class HttpsTests(TestCase):
    """The production switches in config/settings.py (DJANGO_SSL_REDIRECT etc.)."""

    def setUp(self):
        # A new client builds the middleware with these settings.
        self.client = Client()

    def test_plain_http_is_redirected_to_https(self):
        response = self.client.get(QUOTES)
        self.assertEqual(response.status_code, 301)
        self.assertTrue(response["Location"].startswith("https://"))

    def test_https_from_the_proxy_is_trusted(self):
        response = self.client.get(QUOTES, headers={"X-Forwarded-Proto": "https"})
        self.assertNotEqual(response.status_code, 301)
        self.assertEqual(response["Strict-Transport-Security"], "max-age=3600")

    @mock.patch.object(HealthView, "_check_storage", return_value="ok")
    def test_container_health_checks_stay_on_plain_http(self, _storage):
        response = self.client.get(HEALTH)
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("Strict-Transport-Security", response)

