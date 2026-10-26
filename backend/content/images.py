"""Content photos in the Neon `assets` bucket.

The bucket is private and its links are presigned for an hour, so content
never stores those links. A record keeps a reference instead:

- a website path, e.g. "/media/fleet-van-vle.jpg" (photos that ship with the site);
- an uploaded key, e.g. "content/3f2a….jpg" (photos uploaded through the admin).

The API shows an uploaded key as a stable URL on this backend,
/api/v1/content/images/<name>, which redirects to a fresh presigned link.
"""

import re
import uuid
from urllib.parse import urlsplit

from django.conf import settings
from django.core.files.storage import default_storage
from django.urls import reverse

UPLOAD_PREFIX = "content/"
MAX_UPLOAD_BYTES = 12 * 1024 * 1024
NAME_PATTERN = r"[0-9a-f]{32}\.(?:jpg|png|webp)"
_URL_PATH = re.compile(rf"/api/v1/content/images/(?P<name>{NAME_PATTERN})/?$")
_KEY = re.compile(rf"^{UPLOAD_PREFIX}{NAME_PATTERN}$")


class InvalidImage(ValueError):
    pass


def detect_extension(head: bytes):
    """File type from its first bytes; the browser's content type is not trusted."""
    if head.startswith(b"\xff\xd8\xff"):
        return "jpg"
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return "webp"
    return None


def save_upload(file):
    """Stores an uploaded photo and returns its reference."""
    if file.size > MAX_UPLOAD_BYTES:
        raise InvalidImage("That image is larger than 12 MB. Please choose a smaller one.")
    head = file.read(16)
    file.seek(0)
    extension = detect_extension(head)
    if extension is None:
        raise InvalidImage("Please choose an image file (JPG, PNG or WebP).")
    return default_storage.save(f"{UPLOAD_PREFIX}{uuid.uuid4().hex}.{extension}", file)


def is_upload_name(name):
    return re.fullmatch(NAME_PATTERN, name) is not None


def to_url(reference):
    """The URL the admin and website use for a stored reference."""
    if _KEY.match(reference):
        name = reference.removeprefix(UPLOAD_PREFIX)
        return settings.BACKEND_BASE_URL.rstrip("/") + reverse("content-image", args=[name])
    return reference


def to_reference(value):
    """Turns a URL from the admin back into a stored reference.

    Accepts a website path or one of this API's image URLs (on any host, so data
    copied between environments still resolves). Raises InvalidImage otherwise.
    """
    if value == "":
        return ""
    if value.startswith("data:"):
        raise InvalidImage("Upload the photo before saving.")
    path = urlsplit(value).path if value.startswith(("http://", "https://")) else value
    match = _URL_PATH.search(path)
    if match:
        return UPLOAD_PREFIX + match["name"]
    if value.startswith("/") and not value.startswith("//") and " " not in value:
        return value
    raise InvalidImage("Choose a photo from the library or upload one.")
