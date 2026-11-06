"""Website content edited in the Next.js admin (/admin).

The shapes mirror frontend/src/admin/lib/content/types.ts.

Translations: every translatable value is one JSON object per field,
{"en": "...", "fr": "...", "bg": "...", "ar": "..."}, rather than a column per
language. The admin and website already handle text in that shape; the
repeatable parts of a service (included items, facts, features, steps) are
lists of such objects, which per-language columns cannot express; and adding a
language is a data change, not a migration of every table. The serializers
validate the keys and lengths, which is what columns would otherwise enforce.
"""

import secrets

from django.db import models

LOCALES = ("en", "fr", "bg", "ar")
DEFAULT_LOCALE = "en"

SERVICE_ICONS = ("plane", "route", "clock", "sparkles", "briefcase", "heart", "map", "star")

# What a service's guide prices are for: one journey, or one hour (hourly hire).
PRICE_UNITS = ("trip", "hour")


def empty_localized():
    return {locale: "" for locale in LOCALES}


def new_id():
    return secrets.token_hex(6)


class Entry(models.Model):
    """Fields shared by services, vehicles and cities."""

    # A string, so ids the website already uses (e.g. "airport_transfer") survive an import.
    id = models.CharField(primary_key=True, max_length=64, default=new_id, editable=False)
    # Unique per collection: a service and a city may share a slug.
    slug = models.SlugField(max_length=60, unique=True)
    published = models.BooleanField(default=False)
    # Position in lists on the website (ascending).
    order = models.PositiveIntegerField(default=0, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["order", "created_at"]

    def __str__(self):
        return self.slug


class Vehicle(Entry):
    name = models.JSONField(default=empty_localized)
    # Manufacturer model, e.g. "Mercedes-Benz S-Class · 2026". Not translated.
    model = models.CharField(max_length=60)
    description = models.JSONField(default=empty_localized)
    passengers = models.PositiveSmallIntegerField()
    luggage = models.PositiveSmallIntegerField()
    features = models.JSONField(default=list)  # [localized]
    image = models.CharField(max_length=500, blank=True)

    class Meta(Entry.Meta):
        pass


class Service(Entry):
    icon = models.CharField(max_length=20, choices=[(icon, icon) for icon in SERVICE_ICONS])
    label = models.JSONField(default=empty_localized)
    title = models.JSONField(default=empty_localized)
    summary = models.JSONField(default=empty_localized)
    headline = models.JSONField(default=empty_localized)
    included = models.JSONField(default=list)  # [localized]
    facts = models.JSONField(default=list)  # [{value, label}]
    overview_title = models.JSONField(default=empty_localized)
    overview_body = models.JSONField(default=empty_localized)
    features = models.JSONField(default=list)  # [{title, copy}]
    steps = models.JSONField(default=list)  # [{title, copy}]
    # Image references: a website path ("/media/x.jpg") or an uploaded key (see images.py).
    hero_image = models.CharField(max_length=500, blank=True)
    overview_image = models.CharField(max_length=500, blank=True)
    vehicles = models.ManyToManyField(
        Vehicle, through="ServiceVehicle", related_name="services", blank=True
    )
    seo_title = models.JSONField(default=empty_localized)
    seo_description = models.JSONField(default=empty_localized)
    price_unit = models.CharField(max_length=4, choices=[(unit, unit) for unit in PRICE_UNITS], default="trip")

    class Meta(Entry.Meta):
        pass


class ServiceVehicle(models.Model):
    """A recommended vehicle for a service, in the order the editor chose."""

    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="vehicle_links")
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name="service_links")
    position = models.PositiveSmallIntegerField()

    class Meta:
        ordering = ["position"]
        constraints = [
            models.UniqueConstraint(fields=["service", "vehicle"], name="unique_service_vehicle"),
        ]


class City(Entry):
    name = models.JSONField(default=empty_localized)
    services = models.ManyToManyField(Service, related_name="cities", blank=True)

    class Meta(Entry.Meta):
        verbose_name_plural = "cities"


class ServicePrice(models.Model):
    """The price in euros of one service with one vehicle class in one city.

    Bookings are priced from it (backend/bookings/pricing.py); the website also
    shows the lowest one as a "from" price.
    Deleting the city or vehicle removes its prices.
    """

    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name="prices")
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name="service_prices")
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name="service_prices")
    amount = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        ordering = ["pk"]
        constraints = [
            models.UniqueConstraint(fields=["service", "city", "vehicle"], name="unique_service_price"),
        ]


class SiteSettings(models.Model):
    """Single row (pk=1) with the company details shown across the website."""

    company_name = models.CharField(max_length=80, blank=True)
    tagline = models.JSONField(default=empty_localized)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    whatsapp = models.CharField(max_length=16, blank=True)
    social = models.JSONField(default=dict)  # {linkedin, instagram, facebook, tiktok, snapchat}
    # [{id, quote, attribution, published}], edited together with the settings.
    testimonials = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "site settings"

    def __str__(self):
        return "Site settings"

    @classmethod
    def load(cls):
        settings, _ = cls.objects.get_or_create(pk=1)
        return settings
