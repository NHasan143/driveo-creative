from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.files.storage import default_storage
from django.db import transaction
from django.db.models import Max
from django.http import HttpResponseRedirect
from django.views.decorators.http import require_GET
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny, BasePermission, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from . import images
from .models import City, Service, SiteSettings, Vehicle, new_id
from .serializers import (
    COLLECTIONS,
    ID_VALIDATOR,
    CitySerializer,
    ReorderSerializer,
    ServiceSerializer,
    SiteSettingsSerializer,
    VehicleSerializer,
)

# Every view here is staff-only (the project default, IsAdminUser) unless it says otherwise.


class IsSuperuser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


class CollectionViewSet(viewsets.ModelViewSet):
    """/api/v1/content/<collection>/ — list, create, retrieve, update, delete, reorder.

    Lists include drafts and are not paginated (a handful of records each).
    """

    permission_classes = [IsAdminUser]
    http_method_names = ["get", "post", "put", "delete", "head", "options"]

    def perform_create(self, serializer):
        last = self.queryset.model.objects.aggregate(last=Max("order"))["last"]
        serializer.save(order=0 if last is None else last + 1)

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        """{"ids": [...]} in display order. Items left out keep their relative order after them."""
        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ids = list(dict.fromkeys(serializer.validated_data["ids"]))
        model = self.queryset.model

        with transaction.atomic():
            items = {item.pk: item for item in model.objects.select_for_update()}
            unknown = [pk for pk in ids if pk not in items]
            if unknown:
                raise ValidationError({"ids": [f"Unknown id: {', '.join(unknown)}."]})
            listed = set(ids)
            ordered = [items[pk] for pk in ids] + [item for item in items.values() if item.pk not in listed]
            for position, item in enumerate(ordered):
                item.order = position
            model.objects.bulk_update(ordered, ["order"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class ServiceViewSet(CollectionViewSet):
    queryset = Service.objects.prefetch_related("vehicle_links", "prices")
    serializer_class = ServiceSerializer


class VehicleViewSet(CollectionViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer


class CityViewSet(CollectionViewSet):
    queryset = City.objects.prefetch_related("services")
    serializer_class = CitySerializer


class SiteSettingsView(APIView):
    """GET / PUT /api/v1/content/settings/"""

    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(SiteSettingsSerializer(SiteSettings.load()).data)

    def put(self, request):
        serializer = SiteSettingsSerializer(SiteSettings.load(), data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


def snapshot(published_only=False):
    """Everything, in the ContentSnapshot shape the admin and website use."""
    data = {
        "services": ServiceSerializer(ServiceViewSet.queryset.all(), many=True).data,
        "vehicles": VehicleSerializer(VehicleViewSet.queryset.all(), many=True).data,
        "cities": CitySerializer(CityViewSet.queryset.all(), many=True).data,
        "settings": SiteSettingsSerializer(SiteSettings.load()).data,
    }
    if published_only:
        for collection in COLLECTIONS:
            data[collection] = [item for item in data[collection] if item["status"] == "published"]
        live_vehicles = {item["id"] for item in data["vehicles"]}
        live_services = {item["id"] for item in data["services"]}
        live_cities = {item["id"] for item in data["cities"]}
        for service in data["services"]:
            service["vehicleIds"] = [pk for pk in service["vehicleIds"] if pk in live_vehicles]
            service["prices"] = [
                price
                for price in service["prices"]
                if price["cityId"] in live_cities and price["vehicleId"] in live_vehicles
            ]
        for city in data["cities"]:
            city["serviceIds"] = [pk for pk in city["serviceIds"] if pk in live_services]
        data["settings"]["testimonials"] = [t for t in data["settings"]["testimonials"] if t["published"]]
    return data


class SnapshotView(APIView):
    """GET /api/v1/content/snapshot/ — all content, drafts included."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response(snapshot())


class PublishedContentView(APIView):
    """GET /api/v1/content/published/ — public: published content only, for the website."""

    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        response = Response(snapshot(published_only=True))
        response["Cache-Control"] = "public, max-age=60"
        return response


class ImportView(APIView):
    """POST /api/v1/content/import/ — replaces ALL content with a ContentSnapshot.

    Used to load the website's original copy into an empty database (the admin's
    "Restore original content"). Ids and order are kept, so references between
    records survive. Superusers only; all or nothing.
    """

    permission_classes = [IsSuperuser]

    def post(self, request):
        if not isinstance(request.data, dict):
            raise ValidationError({"detail": "Expected a content snapshot."})
        errors = {}

        with transaction.atomic():
            City.objects.all().delete()
            Service.objects.all().delete()
            Vehicle.objects.all().delete()

            # Vehicles first: services point at vehicles, cities at services. A service's
            # prices point at cities too, so they are set once the cities exist.
            services = request.data.get("services", [])
            prices = self._take_prices(services) if isinstance(services, list) else {}
            for collection in ("vehicles", "services", "cities"):
                items = services if collection == "services" else request.data.get(collection, [])
                if not isinstance(items, list):
                    errors[collection] = ["Expected a list."]
                    continue
                item_errors = self._import_collection(collection, items)
                if item_errors:
                    errors[collection] = item_errors
            price_errors = self._import_prices(prices)
            if price_errors:
                errors.setdefault("services", {}).update(price_errors)

            if "settings" in request.data:
                settings = SiteSettingsSerializer(SiteSettings.load(), data=request.data["settings"])
                if settings.is_valid():
                    settings.save()
                else:
                    errors["settings"] = settings.errors

            if errors:
                raise ValidationError(errors)  # Rolls the whole import back.

        return Response(snapshot())

    @staticmethod
    def _take_prices(services):
        """Removes `prices` from each service item: {index: (id, prices)}."""
        taken = {}
        for index, item in enumerate(services):
            if isinstance(item, dict) and "prices" in item:
                taken[index] = (item.get("id"), item["prices"])
                services[index] = {key: value for key, value in item.items() if key != "prices"}
        return taken

    @staticmethod
    def _import_prices(prices):
        errors = {}
        for index, (pk, items) in prices.items():
            if not isinstance(pk, str) or not pk:
                errors[str(index)] = {"prices": ["Give the service an id so its prices can be imported."]}
                continue
            service = Service.objects.filter(pk=pk).first()
            if service is None:
                continue  # The service itself failed to import; that error is already reported.
            serializer = ServiceSerializer(service, data={"prices": items}, partial=True)
            if serializer.is_valid():
                serializer.save()
            else:
                errors[str(index)] = serializer.errors
        return errors

    @staticmethod
    def _import_collection(collection, items):
        errors = {}
        ranked = sorted(enumerate(items), key=lambda pair: _order_of(pair[1], pair[0]))
        for position, (index, item) in enumerate(ranked):
            if not isinstance(item, dict):
                errors[str(index)] = {"detail": ["Expected an object."]}
                continue
            pk = item.get("id") or new_id()
            try:
                if not isinstance(pk, str) or len(pk) > 64:
                    raise DjangoValidationError("Invalid id.")
                ID_VALIDATOR(pk)
            except DjangoValidationError:
                errors[str(index)] = {"id": [f"Invalid id: {pk}."]}
                continue
            serializer = COLLECTIONS[collection](data=item)
            if serializer.is_valid():
                serializer.save(id=pk, order=position)
            else:
                errors[str(index)] = serializer.errors
        return errors


def _order_of(item, default):
    order = item.get("order") if isinstance(item, dict) else None
    return order if isinstance(order, int) else default


class ImageUploadView(APIView):
    """POST /api/v1/content/images/ (multipart, `file`) → 201 {"url": ...}."""

    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get("file")
        if file is None:
            raise ValidationError({"file": ["Choose a photo to upload."]})
        try:
            reference = images.save_upload(file)
        except images.InvalidImage as error:
            raise ValidationError({"file": [str(error)]}) from error
        return Response({"url": images.to_url(reference)}, status=status.HTTP_201_CREATED)


@require_GET
def image_redirect(request, name):
    """GET /api/v1/content/images/<name> — public; redirects to a fresh presigned link."""
    response = HttpResponseRedirect(default_storage.url(images.UPLOAD_PREFIX + name))
    # Shorter than the link's one-hour lifetime, so a cached redirect never points at an expired link.
    response["Cache-Control"] = "public, max-age=600"
    return response
