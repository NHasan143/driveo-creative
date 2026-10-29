import re
from io import StringIO

from django.contrib.auth import get_user_model
from django.core import mail
from django.core.cache import cache
from django.core.management import call_command
from django.db import IntegrityError
from django.test import Client, TestCase, override_settings
from django.urls import reverse

from quotes.models import QuoteRequest
from quotes.tests import payload as quote_payload

from .models import User

PASSWORD = "Silent-Mercedes-42"
SESSION = reverse("account-session")
REGISTER = reverse("account-register")
PROFILE = reverse("account-profile")
QUOTES = reverse("quote-request-create")


class UserModelTests(TestCase):
    def test_is_the_project_user_model(self):
        self.assertIs(get_user_model(), User)
        self.assertEqual(User._meta.db_table, "auth_user")

    def test_email_is_unique_whatever_the_case(self):
        User.objects.create_user("eve", "eve@example.com", "correct-horse-9")
        with self.assertRaises(IntegrityError):
            User.objects.create_user("eve2", "EVE@Example.com", "correct-horse-9")

    def test_accounts_without_email_are_allowed(self):
        User.objects.create_user("first", password="correct-horse-9")
        User.objects.create_user("second", password="correct-horse-9")
        self.assertEqual(User.objects.filter(email="").count(), 2)


class AdoptCustomUserTests(TestCase):
    def test_a_migrated_database_is_left_alone(self):
        # The test database is built from scratch, with account.0001 applied.
        out = StringIO()
        call_command("adopt_custom_user", database="default", stdout=out)
        self.assertIn("Already adopted", out.getvalue())


class WebsiteClientTestCase(TestCase):
    """A browser on the website: sends cookies, and the CSRF token from the API's JSON."""

    def setUp(self):
        cache.clear()  # Rate limits.
        self.client = Client(enforce_csrf_checks=True)
        self.token = self.client.get(SESSION).json()["csrf_token"]

    def send(self, method, url, data=None):
        response = getattr(self.client, method)(
            url, data, content_type="application/json", headers={"X-CSRFToken": self.token}
        )
        token = response.json().get("csrf_token") if response.get("Content-Type") == "application/json" else None
        if token:
            self.token = token  # Signing in rotates it.
        return response

    def register(self, **overrides):
        data = {
            "email": "Ada@Example.com",
            "first_name": "Ada",
            "last_name": "Lovelace",
            "phone": "+44 20 7946 0000",
            "locale": "fr",
            "password": PASSWORD,
        }
        data.update(overrides)
        return self.send("post", REGISTER, data)


class RegisterTests(WebsiteClientTestCase):
    def test_creates_a_signed_in_customer(self):
        response = self.register()
        self.assertEqual(response.status_code, 201, response.content)
        user = response.json()["user"]
        self.assertEqual(user["email"], "ada@example.com")
        self.assertEqual((user["first_name"], user["locale"], user["is_staff"]), ("Ada", "fr", False))
        self.assertEqual(self.client.get(SESSION).json()["user"]["email"], "ada@example.com")
        self.assertEqual(User.objects.get().username, "ada@example.com")

    def test_email_already_registered(self):
        self.register()
        self.client.logout()
        self.token = self.client.get(SESSION).json()["csrf_token"]
        response = self.register(email="ADA@example.com")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {"email": ["This email address is already registered."]})

    def test_weak_password(self):
        response = self.register(password="password")
        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.json())
        self.assertFalse(User.objects.exists())

    def test_needs_the_csrf_token(self):
        response = self.client.post(REGISTER, {"email": "x@example.com"}, content_type="application/json")
        self.assertEqual(response.status_code, 403)


class SessionTests(WebsiteClientTestCase):
    def setUp(self):
        super().setUp()
        User.objects.create_user("ada@example.com", "ada@example.com", PASSWORD, first_name="Ada")

    def test_anonymous_session(self):
        self.assertEqual(self.client.get(SESSION).json()["user"], None)

    def test_sign_in_and_out(self):
        response = self.send("post", SESSION, {"email": "ADA@example.com", "password": PASSWORD})
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json()["user"]["first_name"], "Ada")

        self.assertEqual(self.send("delete", SESSION).status_code, 204)
        self.assertIsNone(self.client.get(SESSION).json()["user"])

    def test_wrong_password(self):
        response = self.send("post", SESSION, {"email": "ada@example.com", "password": "nope"})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {"detail": "Incorrect email or password."})

    def test_deactivated_accounts_cannot_sign_in(self):
        User.objects.update(is_active=False)
        response = self.send("post", SESSION, {"email": "ada@example.com", "password": PASSWORD})
        self.assertEqual(response.status_code, 400)


class SignedInTestCase(WebsiteClientTestCase):
    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user("ada@example.com", "ada@example.com", PASSWORD, first_name="Ada")
        self.send("post", SESSION, {"email": "ada@example.com", "password": PASSWORD})


class ProfileTests(SignedInTestCase):
    def test_edit_profile(self):
        response = self.send("patch", PROFILE, {"first_name": "Augusta", "phone": "+33 1 23 45 67 89", "locale": "ar"})
        self.assertEqual(response.status_code, 200, response.content)
        self.user.refresh_from_db()
        self.assertEqual((self.user.first_name, self.user.phone, self.user.locale), ("Augusta", "+33 1 23 45 67 89", "ar"))

    def test_email_belonging_to_someone_else(self):
        User.objects.create_user("other", "other@example.com", PASSWORD)
        response = self.send("patch", PROFILE, {"email": "Other@Example.com"})
        self.assertEqual(response.json(), {"email": ["This email address is already registered."]})

    def test_signed_out(self):
        self.send("delete", SESSION)
        self.assertEqual(self.client.get(PROFILE).status_code, 403)


class PasswordChangeTests(SignedInTestCase):
    URL = reverse("account-password")

    def test_change_password_and_stay_signed_in(self):
        response = self.send("post", self.URL, {"current_password": PASSWORD, "new_password": "Quiet-Arrival-77"})
        self.assertEqual(response.status_code, 204)
        self.assertIsNotNone(self.client.get(SESSION).json()["user"])
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("Quiet-Arrival-77"))

    def test_wrong_current_password(self):
        response = self.send("post", self.URL, {"current_password": "nope", "new_password": "Quiet-Arrival-77"})
        self.assertEqual(response.json(), {"current_password": ["Your current password is not correct."]})


@override_settings(WEBSITE_BASE_URL="https://driveo.example")
class PasswordResetTests(WebsiteClientTestCase):
    REQUEST = reverse("account-password-reset")
    CONFIRM = reverse("account-password-reset-confirm")

    def setUp(self):
        super().setUp()
        self.user = User.objects.create_user("ada@example.com", "ada@example.com", PASSWORD, first_name="Ada")

    def reset_link(self):
        self.assertEqual(len(mail.outbox), 1)
        return re.search(r"https://driveo\.example/account/reset-password\?\S+", mail.outbox[0].body).group(0)

    def test_full_reset(self):
        self.assertEqual(self.send("post", self.REQUEST, {"email": "ADA@example.com", "locale": "fr"}).status_code, 204)
        self.assertEqual(mail.outbox[0].subject, "Réinitialisez votre mot de passe Driveo")
        link = self.reset_link()
        self.assertIn("lang=fr", link)
        uid = re.search(r"uid=([^&]+)", link).group(1)
        token = re.search(r"token=([^&\s]+)", link).group(1)

        data = {"uid": uid, "token": token, "new_password": "Quiet-Arrival-77"}
        self.assertEqual(self.send("post", self.CONFIRM, data).status_code, 204)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("Quiet-Arrival-77"))

        # A link works once.
        response = self.send("post", self.CONFIRM, {**data, "new_password": "Another-Pass-88"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("token", response.json())

    def test_unknown_email_looks_the_same(self):
        self.assertEqual(self.send("post", self.REQUEST, {"email": "nobody@example.com"}).status_code, 204)
        self.assertEqual(len(mail.outbox), 0)

    def test_bad_token(self):
        response = self.send("post", self.CONFIRM, {"uid": "MQ", "token": "nope", "new_password": "Quiet-Arrival-77"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("token", response.json())


class MyQuoteRequestsTests(SignedInTestCase):
    URL = reverse("account-quote-requests")

    def test_requests_sent_while_signed_in_are_listed(self):
        self.assertEqual(self.send("post", QUOTES, quote_payload()).status_code, 201)
        anonymous = Client(enforce_csrf_checks=True)
        anonymous.post(QUOTES, quote_payload(notes="Not mine"), content_type="application/json")

        listed = self.client.get(self.URL).json()
        self.assertEqual(len(listed), 1)
        self.assertEqual(listed[0]["reference"], QuoteRequest.objects.get(customer=self.user).reference)
        self.assertNotIn("staff_notes", listed[0])

    def test_signed_in_quote_requests_need_the_csrf_token(self):
        response = self.client.post(QUOTES, quote_payload(), content_type="application/json")
        self.assertEqual(response.status_code, 403)
        self.assertFalse(QuoteRequest.objects.exists())


class StaffApiTests(TestCase):
    CUSTOMERS = reverse("staff-customers")
    USERS = reverse("staff-users")

    def setUp(self):
        self.owner = User.objects.create_superuser("owner", "owner@example.com", PASSWORD)
        self.editor = User.objects.create_user("editor", "editor@example.com", PASSWORD, is_staff=True)
        self.customer = User.objects.create_user("ada@example.com", "ada@example.com", PASSWORD, first_name="Ada")
        QuoteRequest.objects.create(**{**quote_payload_fields(), "customer": self.customer})

    def test_staff_see_customers_with_their_requests(self):
        self.client.force_login(self.editor)
        listing = self.client.get(self.CUSTOMERS, {"search": "ADA"}).json()
        self.assertEqual(listing["count"], 1)
        self.assertEqual(listing["results"][0]["quote_count"], 1)

        detail = self.client.get(reverse("staff-customer", args=[self.customer.pk])).json()
        self.assertEqual(len(detail["quote_requests"]), 1)

        response = self.client.patch(
            reverse("staff-customer", args=[self.customer.pk]), {"is_active": False}, content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.customer.refresh_from_db()
        self.assertFalse(self.customer.is_active)

    def test_customers_cannot_use_staff_endpoints(self):
        self.client.force_login(self.customer)
        self.assertEqual(self.client.get(self.CUSTOMERS).status_code, 403)
        self.assertEqual(self.client.get(self.USERS).status_code, 403)

    def test_only_superusers_manage_staff(self):
        self.client.force_login(self.editor)
        self.assertEqual(self.client.get(self.USERS).status_code, 403)

        self.client.force_login(self.owner)
        response = self.client.post(
            self.USERS,
            {"username": "driver-desk", "email": "desk@example.com", "first_name": "Desk", "password": PASSWORD},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201, response.content)
        self.assertTrue(User.objects.get(username="driver-desk").is_staff)
        self.assertEqual(len(self.client.get(self.USERS).json()), 3)

    def test_superusers_cannot_lock_themselves_out(self):
        self.client.force_login(self.owner)
        url = reverse("staff-user", args=[self.owner.pk])
        response = self.client.patch(url, {"is_active": False}, content_type="application/json")
        self.assertEqual(response.json(), {"is_active": ["You can't deactivate your own account."]})

    def test_set_a_staff_password(self):
        self.client.force_login(self.owner)
        url = reverse("staff-user-password", args=[self.editor.pk])
        self.assertEqual(self.client.post(url, {"password": "short"}, content_type="application/json").status_code, 400)
        self.assertEqual(
            self.client.post(url, {"password": "Quiet-Arrival-77"}, content_type="application/json").status_code, 204
        )
        self.editor.refresh_from_db()
        self.assertTrue(self.editor.check_password("Quiet-Arrival-77"))


def quote_payload_fields():
    """A saved QuoteRequest's fields (the API payload without its extras)."""
    data = quote_payload()
    data.pop("honeypot")
    data["journey_time"] = "09:30"
    return {**data, "reference": "DRV-TEST01"}
