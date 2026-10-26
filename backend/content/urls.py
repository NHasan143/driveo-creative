from django.urls import path, re_path
from rest_framework.routers import SimpleRouter

from .images import NAME_PATTERN
from .views import (
    CityViewSet,
    ImageUploadView,
    ImportView,
    PublishedContentView,
    ServiceViewSet,
    SiteSettingsView,
    SnapshotView,
    VehicleViewSet,
    image_redirect,
)

router = SimpleRouter()
router.register("content/services", ServiceViewSet, basename="content-services")
router.register("content/vehicles", VehicleViewSet, basename="content-vehicles")
router.register("content/cities", CityViewSet, basename="content-cities")

urlpatterns = [
    path("content/settings/", SiteSettingsView.as_view(), name="content-settings"),
    path("content/snapshot/", SnapshotView.as_view(), name="content-snapshot"),
    path("content/published/", PublishedContentView.as_view(), name="content-published"),
    path("content/import/", ImportView.as_view(), name="content-import"),
    path("content/images/", ImageUploadView.as_view(), name="content-image-upload"),
    re_path(rf"^content/images/(?P<name>{NAME_PATTERN})$", image_redirect, name="content-image"),
    *router.urls,
]
