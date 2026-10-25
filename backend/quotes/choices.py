"""Booking vocabulary shared with the website.

The values are stable API ids and must match frontend/src/domain/booking.ts.
Labels are English and only used inside the business (admin, alerts).
"""

from django.db import models


class City(models.TextChoices):
    LONDON = "london", "London"
    PARIS = "paris", "Paris"
    BULGARIA = "bulgaria", "Bulgaria"
    DUBAI = "dubai", "Dubai"


class ServiceType(models.TextChoices):
    AIRPORT_TRANSFER = "airport_transfer", "Airport transfer"
    POINT_TO_POINT = "point_to_point", "Point-to-point"
    HOURLY_HIRE = "hourly_hire", "Hourly hire"
    PRIVATE_EVENT = "private_event", "Private event"


class VehicleClass(models.TextChoices):
    BUSINESS_CLASS = "business_class", "Business Class (E-Class)"
    FIRST_CLASS = "first_class", "First Class (S-Class)"
    BUSINESS_VAN = "business_van", "Business Van (VLE)"
    PLEASE_ADVISE = "please_advise", "Please advise"


class Locale(models.TextChoices):
    EN = "en", "English"
    FR = "fr", "French"
    BG = "bg", "Bulgarian"
    AR = "ar", "Arabic"


# (max passengers, max luggage). Every class except the van seats 4 with 3 bags.
STANDARD_CAPACITY = (4, 3)
VEHICLE_CAPACITY = {VehicleClass.BUSINESS_VAN: (7, 8)}

HIRE_HOURS_MIN = 2
HIRE_HOURS_MAX = 16


def vehicle_capacity(vehicle_class):
    return VEHICLE_CAPACITY.get(vehicle_class, STANDARD_CAPACITY)
