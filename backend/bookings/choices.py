"""Booking vocabulary shared with the website.

Services, cities and vehicles are content (backend/content/): a booking stores
their ids, e.g. "airport_transfer", "london", "first_class". Labels shown to
staff come from the content's English names.
"""

from django.db import models


class Locale(models.TextChoices):
    EN = "en", "English"
    FR = "fr", "French"
    BG = "bg", "Bulgarian"
    AR = "ar", "Arabic"


HIRE_HOURS_MIN = 2
HIRE_HOURS_MAX = 16

# Journeys happen in the city's local time; notice periods are measured there.
CITY_TIMEZONES = {
    "london": "Europe/London",
    "paris": "Europe/Paris",
    "bulgaria": "Europe/Sofia",
    "dubai": "Asia/Dubai",
}
DEFAULT_TIMEZONE = "Europe/London"
