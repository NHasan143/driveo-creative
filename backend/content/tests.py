from unittest import mock

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client, TestCase, override_settings
from django.urls import reverse
from rest_framework.throttling import ScopedRateThrottle

from .models import City, Service, ServiceVehicle, SiteSettings, Vehicle

IN_MEMORY_STORAGE = {
    "default": {"BACKEND": "django.core.files.storage.InMemoryStorage"},
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
}
JPEG = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01" + b"\x00" * 64

SERVICES = reverse("content-services-list")
VEHICLES = reverse("content-vehicles-list")
CITIES = reverse("content-cities-list")
SETTINGS = reverse("content-settings")


def text(en="", **others):
    return {"en": en, "fr": others.get("fr", ""), "bg": others.get("bg", ""), "ar": others.get("ar", "")}


def vehicle_payload(**overrides):
    data = {
        "slug": "first-class",
        "status": "published",
        "name": text("First Class", fr="Première classe"),
        "model": "Mercedes-Benz S-Class · 2026",
        "description": text("Flagship saloon."),
        "passengers": 3,
        "luggage": 2,
        "features": [text("Wi-Fi")],
        "image": "/media/fleet-first-2026-front.jpg",
    }
    data.update(overrides)
    return data


def service_payload(**overrides):
    titled = {"title": text("Meet and greet"), "copy": text("Your chauffeur waits at arrivals.")}
    data = {
        "slug": "airport-transfer",
        "status": "published",
        "icon": "plane",
        "label": text("Transfer"),
        "title": text("Airport transfer"),
        "summary": text("Door to terminal."),
        "headline": text("Arrive composed"),
        "included": [text("Flight tracking")],
        "facts": [{"value": text("60 min"), "label": text("Free waiting")}],
        "overviewTitle": text("Overview"),
        "overviewBody": text("Body copy."),
        "features": [titled],
        "steps": [titled],
        "heroImage": "/media/london-thames-night.jpg",
        "overviewImage": "/media/paris-hotel-evening.jpg",
        "vehicleIds": [],
        "seoTitle": text(),
        "seoDescription": text(),
    }
    data.update(overrides)
    return data


def city_payload(**overrides):
    data = {"slug": "london", "status": "published", "name": text("London", fr="Londres"), "serviceIds": []}
    data.update(overrides)
    return data


def settings_payload(**overrides):
    data = {
        "companyName": "Driveo Exclusive Ltd",
        "tagline": text("Arrive composed."),
        "phone": "+44 330 043 0976",
        "email": "info@driveoexclusive.com",
        "whatsapp": "+443300430976",
        "social": {"linkedin": "https://linkedin.com/company/driveo", "instagram": "", "facebook": "", "tiktok": "", "snapchat": ""},
        "testimonials": [
            {"id": "testimonial-1", "quote": text("Faultless."), "attribution": text("Private client"), "published": True},
            {"id": "testimonial-2", "quote": text("Draft."), "attribution": text("Someone"), "published": False},
        ],
    }
    data.update(overrides)
    return data


class ContentApiTestCase(TestCase):
    def setUp(self):
        users = get_user_model().objects
        self.staff = users.create_user("editor", "editor@example.com", "correct-horse-9", is_staff=True)
        self.client.force_login(self.staff)

    def post(self, url, data):
        return self.client.post(url, data, content_type="application/json")

    def put(self, url, data):
        return self.client.put(url, data, content_type="application/json")

    def create(self, url, data):
        response = self.post(url, data)
        self.assertEqual(response.status_code, 201, response.content)
        return response.json()


class PermissionTests(ContentApiTestCase):
    def test_anonymous_cannot_read_or_write(self):
        self.client.logout()
        self.assertEqual(self.client.get(SERVICES).status_code, 403)
        self.assertEqual(self.post(VEHICLES, vehicle_payload()).status_code, 403)
        self.assertEqual(self.put(SETTINGS, settings_payload()).status_code, 403)
        self.assertEqual(self.client.get(reverse("content-snapshot")).status_code, 403)
        self.assertFalse(Vehicle.objects.exists())

    def test_signed_in_non_staff_is_refused(self):
        user = get_user_model().objects.create_user("visitor", password="correct-horse-9")
        self.client.force_login(user)
        self.assertEqual(self.client.get(SERVICES).status_code, 403)
        self.assertEqual(self.post(VEHICLES, vehicle_payload()).status_code, 403)

    def test_staff_writes_need_the_csrf_token(self):
        client = Client(enforce_csrf_checks=True)
        client.force_login(self.staff)
        response = client.post(VEHICLES, vehicle_payload(), content_type="application/json")
        self.assertEqual(response.status_code, 403)
        self.assertIn("CSRF", response.json()["detail"])

        token = client.get(reverse("auth-csrf")).json()["csrfToken"]
        response = client.post(VEHICLES, vehicle_payload(), content_type="application/json", headers={"X-CSRFToken": token})
        self.assertEqual(response.status_code, 201)

    def test_public_endpoint_needs_no_sign_in(self):
        self.client.logout()
        self.assertEqual(self.client.get(reverse("content-published")).status_code, 200)


class SignInTests(TestCase):
    URL = reverse("auth-session")

    def setUp(self):
        cache.clear()  # Reset the sign-in rate limit.
        users = get_user_model().objects
        users.create_user("editor", "editor@example.com", "correct-horse-9", is_staff=True, first_name="Eve")
        users.create_user("visitor", "visitor@example.com", "correct-horse-9")
        self.client = Client(enforce_csrf_checks=True)
        self.token = self.client.get(reverse("auth-csrf")).json()["csrfToken"]

    def sign_in(self, username, password="correct-horse-9", token=None):
        return self.client.post(
            self.URL,
            {"username": username, "password": password},
            content_type="application/json",
            headers={"X-CSRFToken": token or self.token},
        )

    def test_staff_signs_in_and_out(self):
        self.assertEqual(self.client.get(self.URL).status_code, 403)

        response = self.sign_in("editor")
        self.assertEqual(response.status_code, 200, response.content)
        body = response.json()
        self.assertEqual(
            body["user"], {"username": "editor", "name": "Eve", "email": "editor@example.com", "isSuperuser": False}
        )
        # Signing in rotates the CSRF token; the new one comes back in the body.
        self.assertNotEqual(body["csrfToken"], self.token)
        self.assertEqual(self.client.get(self.URL).json()["user"]["username"], "editor")

        response = self.client.delete(self.URL, headers={"X-CSRFToken": body["csrfToken"]})
        self.assertEqual(response.status_code, 204)
        self.assertEqual(self.client.get(self.URL).status_code, 403)

    def test_email_works_as_username(self):
        self.assertEqual(self.sign_in("Editor@Example.com").status_code, 200)

    def test_wrong_password(self):
        response = self.sign_in("editor", password="nope")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["detail"], "Incorrect username or password.")

    def test_non_staff_cannot_sign_in(self):
        self.assertEqual(self.sign_in("visitor").status_code, 403)
        self.assertEqual(self.client.get(self.URL).status_code, 403)

    def test_sign_in_needs_the_csrf_token(self):
        response = self.client.post(
            self.URL, {"username": "editor", "password": "correct-horse-9"}, content_type="application/json"
        )
        self.assertEqual(response.status_code, 403)

    @mock.patch.object(ScopedRateThrottle, "THROTTLE_RATES", {"staff_sign_in": "2/hour"})
    def test_sign_in_is_rate_limited(self):
        self.sign_in("editor", password="nope")
        self.sign_in("editor", password="nope")
        self.assertEqual(self.sign_in("editor").status_code, 429)


class CollectionTests(ContentApiTestCase):
    def test_create_returns_the_frontend_shape(self):
        vehicle = self.create(VEHICLES, vehicle_payload())
        self.assertEqual(
            set(vehicle),
            {"id", "slug", "status", "order", "updatedAt", "name", "model", "description", "passengers", "luggage", "features", "image"},
        )
        self.assertEqual(vehicle["order"], 0)
        self.assertEqual(vehicle["status"], "published")
        self.assertEqual(vehicle["name"], text("First Class", fr="Première classe"))

        service = self.create(SERVICES, service_payload(vehicleIds=[vehicle["id"]]))
        self.assertEqual(set(service), set(service_payload()) | {"id", "order", "updatedAt", "priceUnit", "prices"})
        self.assertEqual((service["priceUnit"], service["prices"]), ("trip", []))
        self.assertEqual(service["vehicleIds"], [vehicle["id"]])
        self.assertEqual(service["facts"], [{"value": text("60 min"), "label": text("Free waiting")}])

        city = self.create(CITIES, city_payload(serviceIds=[service["id"]]))
        self.assertEqual(city["serviceIds"], [service["id"]])

    def test_new_items_go_last(self):
        self.create(VEHICLES, vehicle_payload(slug="business"))
        self.assertEqual(self.create(VEHICLES, vehicle_payload(slug="first"))["order"], 1)

    def test_list_and_get(self):
        first = self.create(VEHICLES, vehicle_payload(slug="business", status="draft"))
        self.create(VEHICLES, vehicle_payload(slug="first"))
        listed = self.client.get(VEHICLES).json()
        self.assertEqual([item["slug"] for item in listed], ["business", "first"])
        self.assertEqual(listed[0]["status"], "draft")

        response = self.client.get(reverse("content-vehicles-detail", args=[first["id"]]))
        self.assertEqual(response.json(), first)
        self.assertEqual(self.client.get(reverse("content-vehicles-detail", args=["missing"])).status_code, 404)

    def test_update_keeps_id_and_order(self):
        self.create(VEHICLES, vehicle_payload(slug="business"))
        vehicle = self.create(VEHICLES, vehicle_payload())
        url = reverse("content-vehicles-detail", args=[vehicle["id"]])
        # The admin sends the draft with its id; order and updatedAt are the server's.
        response = self.put(url, {**vehicle_payload(passengers=4), "id": vehicle["id"], "order": 9})
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json()["id"], vehicle["id"])
        self.assertEqual(response.json()["order"], 1)
        self.assertEqual(response.json()["passengers"], 4)
        self.assertGreater(response.json()["updatedAt"], vehicle["updatedAt"])

    def test_duplicate_slug_is_a_field_error(self):
        self.create(VEHICLES, vehicle_payload())
        response = self.post(VEHICLES, vehicle_payload())
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {"slug": ['The URL slug "first-class" is already used by another entry.']})

    def test_slug_is_unique_per_collection_only(self):
        self.create(VEHICLES, vehicle_payload(slug="london"))
        self.create(CITIES, city_payload(slug="london", serviceIds=[self.create(SERVICES, service_payload())["id"]]))

    def test_saving_with_its_own_slug_is_fine(self):
        vehicle = self.create(VEHICLES, vehicle_payload())
        response = self.put(reverse("content-vehicles-detail", args=[vehicle["id"]]), vehicle_payload())
        self.assertEqual(response.status_code, 200)

    def test_invalid_input_points_at_the_field(self):
        response = self.post(SERVICES, service_payload(
            slug="Not A Slug",
            title=text(""),
            facts=[{"value": text("x" * 17), "label": text("ok")}],
            icon="rocket",
        ))
        self.assertEqual(response.status_code, 400)
        errors = response.json()
        self.assertEqual(set(errors), {"slug", "title", "facts", "icon"})
        self.assertEqual(errors["title"], {"en": ["Please fill this in English."]})
        self.assertEqual(errors["facts"], {"0": {"value": {"en": ["Keep this under 16 characters."]}}})

    def test_optional_translations_may_be_empty(self):
        self.create(SERVICES, service_payload(seoTitle=text(""), title=text("Airport transfer")))

    def test_unknown_reference(self):
        response = self.post(SERVICES, service_payload(vehicleIds=["nope"]))
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {"vehicleIds": ["Unknown vehicle: nope."]})

    def test_city_needs_a_service(self):
        response = self.post(CITIES, city_payload(serviceIds=[]))
        self.assertEqual(response.json(), {"serviceIds": ["Choose at least one service offered in this city."]})

    def test_vehicle_order_within_a_service_is_kept(self):
        a = self.create(VEHICLES, vehicle_payload(slug="alpha"))["id"]
        b = self.create(VEHICLES, vehicle_payload(slug="bravo"))["id"]
        service = self.create(SERVICES, service_payload(vehicleIds=[b, a]))
        self.assertEqual(service["vehicleIds"], [b, a])

        url = reverse("content-services-detail", args=[service["id"]])
        self.assertEqual(self.put(url, service_payload(vehicleIds=[a])).json()["vehicleIds"], [a])
        self.assertEqual(self.client.get(url).json()["vehicleIds"], [a])

    def test_delete_detaches_references(self):
        vehicle = self.create(VEHICLES, vehicle_payload())
        service = self.create(SERVICES, service_payload(vehicleIds=[vehicle["id"]]))
        city = self.create(CITIES, city_payload(serviceIds=[service["id"]]))

        response = self.client.delete(reverse("content-vehicles-detail", args=[vehicle["id"]]))
        self.assertEqual(response.status_code, 204)
        self.assertEqual(self.client.get(reverse("content-services-detail", args=[service["id"]])).json()["vehicleIds"], [])

        self.client.delete(reverse("content-services-detail", args=[service["id"]]))
        self.assertEqual(self.client.get(reverse("content-cities-detail", args=[city["id"]])).json()["serviceIds"], [])
        self.assertFalse(ServiceVehicle.objects.exists())
        self.assertEqual(self.client.delete(reverse("content-services-detail", args=[service["id"]])).status_code, 404)

    def test_reorder(self):
        ids = [self.create(VEHICLES, vehicle_payload(slug=slug))["id"] for slug in ("alpha", "bravo", "charlie")]
        response = self.post(reverse("content-vehicles-reorder"), {"ids": [ids[2], ids[0], ids[1]]})
        self.assertEqual(response.status_code, 204)
        self.assertEqual([item["slug"] for item in self.client.get(VEHICLES).json()], ["charlie", "alpha", "bravo"])
        self.assertEqual([item["order"] for item in self.client.get(VEHICLES).json()], [0, 1, 2])

    def test_reorder_keeps_unlisted_items_after_the_listed_ones(self):
        ids = [self.create(VEHICLES, vehicle_payload(slug=slug))["id"] for slug in ("alpha", "bravo", "charlie")]
        self.post(reverse("content-vehicles-reorder"), {"ids": [ids[2]]})
        self.assertEqual([item["slug"] for item in self.client.get(VEHICLES).json()], ["charlie", "alpha", "bravo"])

    def test_reorder_rejects_unknown_ids(self):
        response = self.post(reverse("content-vehicles-reorder"), {"ids": ["nope"]})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {"ids": ["Unknown id: nope."]})


class SettingsTests(ContentApiTestCase):
    def test_empty_database_returns_blank_settings(self):
        settings = self.client.get(SETTINGS).json()
        self.assertEqual(settings["companyName"], "")
        self.assertEqual(settings["tagline"], text())
        self.assertEqual(settings["testimonials"], [])
        self.assertEqual(settings["social"], {"linkedin": "", "instagram": "", "facebook": "", "tiktok": "", "snapchat": ""})

    def test_save(self):
        response = self.put(SETTINGS, settings_payload())
        self.assertEqual(response.status_code, 200, response.content)
        saved = response.json()
        self.assertEqual(saved, {**settings_payload(), "updatedAt": saved["updatedAt"]})
        self.assertEqual(self.client.get(SETTINGS).json(), saved)
        self.assertEqual(SiteSettings.objects.count(), 1)

    def test_invalid(self):
        response = self.put(SETTINGS, settings_payload(whatsapp="+44 330", social={**settings_payload()["social"], "tiktok": "tiktok.com/x"}))
        self.assertEqual(response.status_code, 400)
        self.assertEqual(set(response.json()), {"whatsapp", "social"})
        self.assertIn("tiktok", response.json()["social"])


@override_settings(STORAGES=IN_MEMORY_STORAGE, BACKEND_BASE_URL="https://api.example.com")
class ImageTests(ContentApiTestCase):
    UPLOAD = reverse("content-image-upload")

    def upload(self, content=JPEG, name="photo.jpg"):
        return self.client.post(self.UPLOAD, {"file": SimpleUploadedFile(name, content, content_type="image/jpeg")})

    def test_upload_and_use_a_photo(self):
        response = self.upload()
        self.assertEqual(response.status_code, 201, response.content)
        url = response.json()["url"]
        self.assertRegex(url, r"^https://api\.example\.com/api/v1/content/images/[0-9a-f]{32}\.jpg$")

        vehicle = self.create(VEHICLES, vehicle_payload(image=url))
        self.assertEqual(vehicle["image"], url)
        # Stored as the bucket key, not as a URL tied to one host.
        self.assertRegex(Vehicle.objects.get().image, r"^content/[0-9a-f]{32}\.jpg$")

        # The same photo coming back from another environment's URL still resolves.
        other_host = url.replace("https://api.example.com", "http://localhost:8000")
        self.assertEqual(self.put(reverse("content-vehicles-detail", args=[vehicle["id"]]), vehicle_payload(image=other_host)).json()["image"], url)

        redirect = self.client.get(url.removeprefix("https://api.example.com"))
        self.assertEqual(redirect.status_code, 302)
        self.assertIn(Vehicle.objects.get().image, redirect["Location"])

    def test_rejects_files_that_are_not_images(self):
        response = self.upload(b"<html>not a photo</html>", name="photo.jpg")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {"file": ["Please choose an image file (JPG, PNG or WebP)."]})

    def test_upload_is_staff_only(self):
        self.client.logout()
        self.assertEqual(self.upload().status_code, 403)

    def test_website_paths_are_kept(self):
        vehicle = self.create(VEHICLES, vehicle_payload(image="/media/fleet-van-vle.jpg"))
        self.assertEqual(vehicle["image"], "/media/fleet-van-vle.jpg")

    def test_data_urls_must_be_uploaded_first(self):
        response = self.post(VEHICLES, vehicle_payload(image="data:image/jpeg;base64,AAAA"))
        self.assertEqual(response.json(), {"image": ["Upload the photo before saving."]})

    def test_other_values_are_rejected(self):
        for value in ("https://evil.example.com/x.jpg", "//cdn.example.com/x.jpg", "javascript:alert(1)"):
            response = self.post(VEHICLES, vehicle_payload(image=value))
            self.assertEqual(response.status_code, 400, value)
        self.assertEqual(self.post(VEHICLES, vehicle_payload(image="")).json(), {"image": ["Please add a photo."]})


class SnapshotTests(ContentApiTestCase):
    def setUp(self):
        super().setUp()
        self.live_vehicle = self.create(VEHICLES, vehicle_payload(slug="live"))
        self.draft_vehicle = self.create(VEHICLES, vehicle_payload(slug="draft", status="draft"))
        self.service = self.create(SERVICES, service_payload(vehicleIds=[self.draft_vehicle["id"], self.live_vehicle["id"]]))
        self.draft_service = self.create(SERVICES, service_payload(slug="draft-service", status="draft"))
        self.create(CITIES, city_payload(serviceIds=[self.service["id"], self.draft_service["id"]]))
        self.put(SETTINGS, settings_payload())

    def test_admin_snapshot_has_everything(self):
        snapshot = self.client.get(reverse("content-snapshot")).json()
        self.assertEqual(set(snapshot), {"services", "vehicles", "cities", "settings"})
        self.assertEqual(len(snapshot["vehicles"]), 2)
        self.assertEqual(len(snapshot["settings"]["testimonials"]), 2)

    def test_published_content_hides_drafts_and_links_to_them(self):
        self.client.logout()
        response = self.client.get(reverse("content-published"))
        content = response.json()
        self.assertEqual([v["slug"] for v in content["vehicles"]], ["live"])
        self.assertEqual([s["slug"] for s in content["services"]], ["airport-transfer"])
        self.assertEqual(content["services"][0]["vehicleIds"], [self.live_vehicle["id"]])
        self.assertEqual(content["cities"][0]["serviceIds"], [self.service["id"]])
        self.assertEqual([t["id"] for t in content["settings"]["testimonials"]], ["testimonial-1"])
        self.assertIn("max-age", response["Cache-Control"])


class ImportTests(ContentApiTestCase):
    URL = reverse("content-import")

    def setUp(self):
        super().setUp()
        self.admin = get_user_model().objects.create_superuser("owner", "owner@example.com", "correct-horse-9")
        self.client.force_login(self.admin)

    def seed(self):
        return {
            "vehicles": [
                {**vehicle_payload(slug="business-class"), "id": "business_class", "order": 1},
                {**vehicle_payload(slug="first-class"), "id": "first_class", "order": 0},
            ],
            "services": [{**service_payload(vehicleIds=["first_class", "business_class"]), "id": "airport_transfer", "order": 0}],
            "cities": [{**city_payload(serviceIds=["airport_transfer"]), "id": "london", "order": 0}],
            "settings": settings_payload(),
        }

    def test_replaces_everything_and_keeps_ids(self):
        self.create(VEHICLES, vehicle_payload(slug="old"))
        response = self.post(self.URL, self.seed())
        self.assertEqual(response.status_code, 200, response.content)
        content = response.json()
        self.assertEqual([(v["id"], v["order"]) for v in content["vehicles"]], [("first_class", 0), ("business_class", 1)])
        self.assertEqual(content["services"][0]["vehicleIds"], ["first_class", "business_class"])
        self.assertEqual(content["cities"][0]["serviceIds"], ["airport_transfer"])
        self.assertFalse(Vehicle.objects.filter(slug="old").exists())
        self.assertEqual(SiteSettings.load().company_name, "Driveo Exclusive Ltd")

    def test_any_error_rolls_everything_back(self):
        self.create(VEHICLES, vehicle_payload(slug="old"))
        seed = self.seed()
        seed["cities"][0]["name"] = text("")
        response = self.post(self.URL, seed)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {"cities": {"0": {"name": {"en": ["Please fill this in English."]}}}})
        self.assertEqual(list(Vehicle.objects.values_list("slug", flat=True)), ["old"])
        self.assertFalse(Service.objects.exists() or City.objects.exists())

    def test_superusers_only(self):
        self.client.force_login(self.staff)
        self.assertEqual(self.post(self.URL, self.seed()).status_code, 403)


class PriceTests(ContentApiTestCase):
    def setUp(self):
        super().setUp()
        self.vehicle = self.create(VEHICLES, vehicle_payload())
        self.service = self.create(SERVICES, service_payload())
        self.city = self.create(CITIES, city_payload(serviceIds=[self.service["id"]]))
        self.url = reverse("content-services-detail", args=[self.service["id"]])

    def price(self, amount=95, **overrides):
        return {"cityId": self.city["id"], "vehicleId": self.vehicle["id"], "amount": amount, **overrides}

    def save_prices(self, prices, **overrides):
        return self.put(self.url, service_payload(prices=prices, **overrides))

    def test_save_and_read_prices(self):
        response = self.save_prices([self.price(149.5)], priceUnit="hour")
        self.assertEqual(response.status_code, 200, response.content)
        service = self.client.get(self.url).json()
        self.assertEqual(service["priceUnit"], "hour")
        self.assertEqual(service["prices"], [self.price(149.5)])

    def test_saving_replaces_the_price_list(self):
        self.save_prices([self.price(95)])
        self.save_prices([])
        self.assertEqual(self.client.get(self.url).json()["prices"], [])

    def test_leaving_prices_out_keeps_them(self):
        self.save_prices([self.price(95)])
        self.put(self.url, service_payload())
        self.assertEqual(len(self.client.get(self.url).json()["prices"]), 1)

    def test_too_low_price_points_at_the_row(self):
        response = self.save_prices([self.price(95), self.price(0, vehicleId="other")])
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["prices"], {"1": {"amount": ["Enter a price of at least €1, or leave it empty."]}})

    def test_unknown_and_duplicate_rows_point_at_the_row(self):
        response = self.save_prices([self.price(95), self.price(80, cityId="nowhere"), self.price(70)])
        self.assertEqual(response.status_code, 400)
        errors = response.json()["prices"]
        self.assertEqual(errors["1"], {"cityId": ["Unknown city: nowhere."]})
        self.assertEqual(errors["2"], {"amount": ["This city and vehicle already have a price."]})

    def test_unknown_price_unit(self):
        response = self.save_prices([], priceUnit="day")
        self.assertEqual(response.status_code, 400)
        self.assertIn("priceUnit", response.json())

    def test_deleting_a_city_or_vehicle_removes_its_prices(self):
        self.save_prices([self.price(95)])
        self.client.delete(reverse("content-cities-detail", args=[self.city["id"]]))
        self.assertEqual(self.client.get(self.url).json()["prices"], [])

    def test_published_content_hides_prices_for_drafts(self):
        draft_city = self.create(CITIES, city_payload(slug="paris", status="draft", serviceIds=[self.service["id"]]))
        self.save_prices([self.price(95), self.price(120, cityId=draft_city["id"])])
        self.client.logout()
        service = self.client.get(reverse("content-published")).json()["services"][0]
        self.assertEqual(service["prices"], [self.price(95)])


class ImportPriceTests(ImportTests):
    def test_prices_are_imported_after_cities(self):
        seed = self.seed()
        seed["services"][0]["prices"] = [{"cityId": "london", "vehicleId": "first_class", "amount": 120}]
        response = self.post(self.URL, seed)
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json()["services"][0]["prices"], seed["services"][0]["prices"])

    def test_a_bad_price_rolls_everything_back(self):
        seed = self.seed()
        seed["services"][0]["prices"] = [{"cityId": "nowhere", "vehicleId": "first_class", "amount": 120}]
        response = self.post(self.URL, seed)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {"services": {"0": {"prices": {"0": {"cityId": ["Unknown city: nowhere."]}}}}})
        self.assertFalse(Service.objects.exists())
