from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand

from content.images import UPLOAD_PREFIX
from content.models import Service, Vehicle


class Command(BaseCommand):
    help = "Find and delete unreferenced uploaded photos from the assets storage bucket."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show unreferenced images without deleting them.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]

        # Collect all active references from services and vehicles
        referenced = set()
        for hero, overview in Service.objects.values_list("hero_image", "overview_image"):
            if hero and hero.startswith(UPLOAD_PREFIX):
                referenced.add(hero)
            if overview and overview.startswith(UPLOAD_PREFIX):
                referenced.add(overview)

        for (img,) in Vehicle.objects.values_list("image"):
            if img and img.startswith(UPLOAD_PREFIX):
                referenced.add(img)

        try:
            _, files = default_storage.listdir(UPLOAD_PREFIX)
        except Exception as err:
            self.stderr.write(f"Could not list files from storage: {err}")
            return

        unreferenced = [
            f"{UPLOAD_PREFIX}{filename}"
            for filename in files
            if f"{UPLOAD_PREFIX}{filename}" not in referenced
        ]

        if not unreferenced:
            self.stdout.write(self.style.SUCCESS("No unreferenced images found in storage."))
            return

        self.stdout.write(f"Found {len(unreferenced)} unreferenced image(s).")
        for key in unreferenced:
            if dry_run:
                self.stdout.write(f"[dry-run] Would delete: {key}")
            else:
                default_storage.delete(key)
                self.stdout.write(f"Deleted: {key}")

        if not dry_run:
            self.stdout.write(self.style.SUCCESS(f"Successfully cleaned up {len(unreferenced)} unused image(s)."))
