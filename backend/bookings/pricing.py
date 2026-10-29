"""Turns a journey into a priced booking, using the website's content.

The service, city and vehicle are published content records, so admin edits
(new services, capacities, prices) apply to bookings straight away. The price
comes from the admin's price grid (content.ServicePrice): per journey, or per
hour for services priced by the hour (hourly hire).
"""

from dataclasses import dataclass
from decimal import Decimal

from content.models import City, Service, ServicePrice, Vehicle

from .models import Booking


class JourneyError(Exception):
    """Input the booking can't accept, with the field it belongs to."""

    def __init__(self, field, message):
        super().__init__(message)
        self.field = field
        self.message = message


@dataclass(frozen=True)
class Journey:
    service: Service
    city: City
    vehicle: Vehicle
    price_unit: str
    unit_price: Decimal

    @property
    def is_hourly(self):
        return self.price_unit == Booking.PriceUnit.HOUR

    def total(self, hours):
        return self.unit_price * hours if self.is_hourly else self.unit_price


def english_name(record):
    """A content record's English name, for staff and alerts."""
    name = getattr(record, "title", None) or getattr(record, "name", None) or {}
    return name.get("en") or record.pk


def resolve(service_id, city_id, vehicle_id):
    """The published content behind a booking and its price. Raises JourneyError."""
    service = Service.objects.filter(pk=service_id, published=True).first()
    if service is None:
        raise JourneyError("service", "Choose one of the services on the website.")
    city = City.objects.filter(pk=city_id, published=True).first()
    if city is None:
        raise JourneyError("city", "Choose one of the cities on the website.")
    if not city.services.filter(pk=service.pk).exists():
        raise JourneyError("service", "This service isn't offered in this city.")
    vehicle = Vehicle.objects.filter(pk=vehicle_id, published=True).first()
    if vehicle is None:
        raise JourneyError("vehicle", "Choose one of the vehicles on the website.")

    price = ServicePrice.objects.filter(service=service, city=city, vehicle=vehicle).first()
    if price is None:
        # The price grid has no amount for this combination yet.
        raise JourneyError("vehicle", "This car can't be booked online for this service and city yet.")
    unit = Booking.PriceUnit.HOUR if service.price_unit == "hour" else Booking.PriceUnit.TRIP
    return Journey(service=service, city=city, vehicle=vehicle, price_unit=unit, unit_price=price.amount)
