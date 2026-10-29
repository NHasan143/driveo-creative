"""JSON shapes of frontend/src/admin/lib/content/types.ts (camelCase).

Limits mirror the admin's zod schemas (frontend/src/admin/features/*/…-schema.ts),
so the API rejects what the forms would. Errors are keyed by the same field
paths the forms use, e.g. {"slug": [...]} or {"facts": {"1": {"value": {"en": [...]}}}}.
"""

from decimal import Decimal

from django.core.validators import RegexValidator
from django.db import IntegrityError, transaction
from rest_framework import serializers

from . import images
from .models import (
    DEFAULT_LOCALE,
    LOCALES,
    PRICE_UNITS,
    SERVICE_ICONS,
    City,
    Service,
    ServicePrice,
    ServiceVehicle,
    SiteSettings,
    Vehicle,
)

SLUG_VALIDATOR = RegexValidator(
    r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    "Use lowercase letters, numbers and single hyphens only, e.g. airport-transfer.",
)
ID_VALIDATOR = RegexValidator(r"^[A-Za-z0-9_-]+$", "Use letters, numbers, hyphens and underscores only.")


class LocalizedField(serializers.Field):
    """{"en", "fr", "bg", "ar"} text. English is required unless `optional`."""

    def __init__(self, max_length=160, optional=False, **kwargs):
        self.max_length = max_length
        self.optional = optional
        super().__init__(**kwargs)

    def to_internal_value(self, data):
        if not isinstance(data, dict):
            raise serializers.ValidationError("Expected text in each language.")
        value, errors = {}, {}
        for locale in LOCALES:
            text = data.get(locale, "")
            if not isinstance(text, str):
                errors[locale] = ["Expected text."]
            elif len(text) > self.max_length:
                errors[locale] = [f"Keep this under {self.max_length} characters."]
            elif locale == DEFAULT_LOCALE and not self.optional and not text.strip():
                errors[locale] = ["Please fill this in English."]
            value[locale] = text
        if errors:
            raise serializers.ValidationError(errors)
        return value

    def to_representation(self, value):
        return {locale: (value or {}).get(locale, "") for locale in LOCALES}


class StatusField(serializers.ChoiceField):
    """`published` boolean on the model, "published" | "draft" in the API."""

    def __init__(self, **kwargs):
        super().__init__(choices=["published", "draft"], source="published", **kwargs)

    def to_internal_value(self, data):
        return super().to_internal_value(data) == "published"

    def to_representation(self, value):
        return "published" if value else "draft"


class ImageField(serializers.CharField):
    """A photo URL in the API, an image reference in the database (see images.py)."""

    def __init__(self, **kwargs):
        kwargs.setdefault("max_length", 500)
        kwargs.setdefault("error_messages", {"blank": "Please add a photo."})
        super().__init__(**kwargs)

    def to_internal_value(self, data):
        value = super().to_internal_value(data)
        try:
            return images.to_reference(value)
        except images.InvalidImage as error:
            raise serializers.ValidationError(str(error)) from error

    def to_representation(self, value):
        return images.to_url(value)


class RelatedIdsField(serializers.ListField):
    """Ids of records in another collection, e.g. a service's `vehicleIds`.

    Reads `id_attr` from each object of the related manager; writes a list of
    model instances, in the order given.
    """

    def __init__(self, model, id_attr="pk", **kwargs):
        self.model = model
        self.id_attr = id_attr
        super().__init__(child=serializers.CharField(max_length=64), **kwargs)

    def to_representation(self, manager):
        return [getattr(item, self.id_attr) for item in manager.all()]

    def to_internal_value(self, data):
        ids = list(dict.fromkeys(super().to_internal_value(data)))
        found = self.model.objects.in_bulk(ids)
        missing = [pk for pk in ids if pk not in found]
        if missing:
            noun = self.model._meta.verbose_name
            raise serializers.ValidationError(f"Unknown {noun}: {', '.join(missing)}.")
        return [found[pk] for pk in ids]


class FactSerializer(serializers.Serializer):
    value = LocalizedField(16)
    label = LocalizedField(60)


class TitledCopySerializer(serializers.Serializer):
    title = LocalizedField(80)
    copy = LocalizedField(220)


class ServicePriceSerializer(serializers.Serializer):
    """One guide price in euros: {cityId, vehicleId, amount}."""

    cityId = serializers.CharField(max_length=64, source="city_id")
    vehicleId = serializers.CharField(max_length=64, source="vehicle_id")
    amount = serializers.DecimalField(
        max_digits=8,
        decimal_places=2,
        min_value=Decimal("1"),
        max_value=Decimal("100000"),
        coerce_to_string=False,
        error_messages={"min_value": "Enter a price of at least €1, or leave it empty."},
    )


class EntrySerializer(serializers.ModelSerializer):
    """Fields shared by every collection. Subclasses list theirs in Meta.fields."""

    id = serializers.CharField(read_only=True)
    slug = serializers.CharField(min_length=2, max_length=60, validators=[SLUG_VALIDATOR])
    status = StatusField()
    order = serializers.IntegerField(read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    ENTRY_FIELDS = ["id", "slug", "status", "order", "updatedAt"]
    # Many-to-many fields, set after the record is saved: {validated key: setter name}.
    relations = {}

    def validate_slug(self, value):
        value = value.strip()
        others = self.Meta.model.objects.filter(slug=value)
        if self.instance is not None:
            others = others.exclude(pk=self.instance.pk)
        if others.exists():
            raise serializers.ValidationError(self.slug_taken(value))
        return value

    @staticmethod
    def slug_taken(slug):
        return f'The URL slug "{slug}" is already used by another entry.'

    def create(self, validated_data):
        return self._write(self.Meta.model(), validated_data)

    def update(self, instance, validated_data):
        return self._write(instance, validated_data)

    def _write(self, instance, validated_data):
        related = {key: validated_data.pop(key) for key in self.relations if key in validated_data}
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        try:
            # A savepoint, so a lost race on the slug leaves the outer transaction usable.
            with transaction.atomic():
                instance.save()
                for key, items in related.items():
                    getattr(self, self.relations[key])(instance, items)
        except IntegrityError as error:
            if self.Meta.model.objects.filter(slug=instance.slug).exclude(pk=instance.pk).exists():
                raise serializers.ValidationError({"slug": [self.slug_taken(instance.slug)]}) from error
            raise
        return instance


class VehicleSerializer(EntrySerializer):
    name = LocalizedField(40)
    model = serializers.CharField(min_length=2, max_length=60)
    description = LocalizedField(320)
    passengers = serializers.IntegerField(min_value=1, max_value=16)
    luggage = serializers.IntegerField(min_value=0, max_value=20)
    features = serializers.ListField(child=LocalizedField(60), max_length=8)
    image = ImageField()

    class Meta:
        model = Vehicle
        fields = [*EntrySerializer.ENTRY_FIELDS, "name", "model", "description", "passengers", "luggage", "features", "image"]


class ServiceSerializer(EntrySerializer):
    icon = serializers.ChoiceField(choices=SERVICE_ICONS)
    label = LocalizedField(30)
    title = LocalizedField(60)
    summary = LocalizedField(320)
    headline = LocalizedField(90)
    included = serializers.ListField(child=LocalizedField(90), max_length=8)
    facts = serializers.ListField(child=FactSerializer(), max_length=6)
    overviewTitle = LocalizedField(90, source="overview_title")
    overviewBody = LocalizedField(700, source="overview_body")
    features = serializers.ListField(child=TitledCopySerializer(), max_length=8)
    steps = serializers.ListField(child=TitledCopySerializer(), max_length=6)
    heroImage = ImageField(source="hero_image")
    overviewImage = ImageField(source="overview_image")
    vehicleIds = RelatedIdsField(Vehicle, id_attr="vehicle_id", source="vehicle_links")
    seoTitle = LocalizedField(70, optional=True, source="seo_title")
    seoDescription = LocalizedField(170, optional=True, source="seo_description")
    priceUnit = serializers.ChoiceField(choices=PRICE_UNITS, source="price_unit", required=False)
    prices = ServicePriceSerializer(many=True, required=False, max_length=200)

    relations = {"vehicle_links": "set_vehicles", "prices": "set_prices"}

    class Meta:
        model = Service
        fields = [
            *EntrySerializer.ENTRY_FIELDS,
            "icon",
            "label",
            "title",
            "summary",
            "headline",
            "included",
            "facts",
            "overviewTitle",
            "overviewBody",
            "features",
            "steps",
            "heroImage",
            "overviewImage",
            "vehicleIds",
            "seoTitle",
            "seoDescription",
            "priceUnit",
            "prices",
        ]

    def validate_prices(self, prices):
        city_ids = {price["city_id"] for price in prices}
        vehicle_ids = {price["vehicle_id"] for price in prices}
        known_cities = set(City.objects.filter(pk__in=city_ids).values_list("pk", flat=True))
        known_vehicles = set(Vehicle.objects.filter(pk__in=vehicle_ids).values_list("pk", flat=True))
        errors, seen = {}, set()
        for index, price in enumerate(prices):
            key = (price["city_id"], price["vehicle_id"])
            if price["city_id"] not in known_cities:
                errors[str(index)] = {"cityId": [f"Unknown city: {price['city_id']}."]}
            elif price["vehicle_id"] not in known_vehicles:
                errors[str(index)] = {"vehicleId": [f"Unknown vehicle: {price['vehicle_id']}."]}
            elif key in seen:
                errors[str(index)] = {"amount": ["This city and vehicle already have a price."]}
            seen.add(key)
        if errors:
            raise serializers.ValidationError(errors)
        return prices

    @staticmethod
    def set_prices(service, prices):
        service.prices.all().delete()
        ServicePrice.objects.bulk_create(ServicePrice(service=service, **price) for price in prices)

    @staticmethod
    def set_vehicles(service, vehicles):
        service.vehicle_links.all().delete()
        ServiceVehicle.objects.bulk_create(
            ServiceVehicle(service=service, vehicle=vehicle, position=position)
            for position, vehicle in enumerate(vehicles)
        )


class CitySerializer(EntrySerializer):
    name = LocalizedField(40)
    serviceIds = RelatedIdsField(
        Service,
        source="services",
        allow_empty=False,
        error_messages={"empty": "Choose at least one service offered in this city."},
    )

    relations = {"services": "set_services"}

    class Meta:
        model = City
        fields = [*EntrySerializer.ENTRY_FIELDS, "name", "serviceIds"]

    @staticmethod
    def set_services(city, services):
        city.services.set(services)


SOCIAL_URL = RegexValidator(r"^https://\S+\.\S+", "Paste the full link starting with https://, or leave it empty.")


class SocialSerializer(serializers.Serializer):
    linkedin = serializers.CharField(max_length=300, allow_blank=True, validators=[SOCIAL_URL])
    instagram = serializers.CharField(max_length=300, allow_blank=True, validators=[SOCIAL_URL])
    facebook = serializers.CharField(max_length=300, allow_blank=True, validators=[SOCIAL_URL])
    tiktok = serializers.CharField(max_length=300, allow_blank=True, validators=[SOCIAL_URL])
    snapchat = serializers.CharField(max_length=300, allow_blank=True, validators=[SOCIAL_URL])

    def to_representation(self, instance):
        return {name: (instance or {}).get(name, "") for name in self.fields}


class TestimonialSerializer(serializers.Serializer):
    id = serializers.CharField(max_length=64, validators=[ID_VALIDATOR])
    quote = LocalizedField(400)
    attribution = LocalizedField(80)
    published = serializers.BooleanField()


class SiteSettingsSerializer(serializers.ModelSerializer):
    companyName = serializers.CharField(source="company_name", min_length=2, max_length=80)
    tagline = LocalizedField(80)
    phone = serializers.CharField(
        max_length=20,
        validators=[RegexValidator(r"^\+?[0-9 ()-]{7,20}$", "Use digits, spaces and an optional leading +, e.g. +44 330 043 0976.")],
    )
    email = serializers.EmailField()
    whatsapp = serializers.CharField(
        max_length=16,
        validators=[RegexValidator(r"^\+[1-9]\d{6,14}$", "Use international format without spaces, e.g. +443300430976.")],
    )
    social = SocialSerializer()
    testimonials = serializers.ListField(child=TestimonialSerializer(), max_length=12)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = SiteSettings
        fields = ["companyName", "tagline", "phone", "email", "whatsapp", "social", "testimonials", "updatedAt"]

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class ReorderSerializer(serializers.Serializer):
    ids = serializers.ListField(child=serializers.CharField(max_length=64))


COLLECTIONS = {
    "services": ServiceSerializer,
    "vehicles": VehicleSerializer,
    "cities": CitySerializer,
}
