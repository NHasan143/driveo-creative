"""Emails to the customer about their booking, in the language they booked in."""

from django.conf import settings
from django.utils.http import urlencode

SUBJECTS = {
    "created": {
        "en": "Booking received: {reference}",
        "fr": "Réservation reçue : {reference}",
        "bg": "Получена резервация: {reference}",
        "ar": "تم استلام الحجز: {reference}",
    },
    "changed": {
        "en": "Booking changed: {reference}",
        "fr": "Réservation modifiée : {reference}",
        "bg": "Променена резервация: {reference}",
        "ar": "تم تعديل الحجز: {reference}",
    },
    "confirmed": {
        "en": "Booking confirmed: {reference}",
        "fr": "Réservation confirmée : {reference}",
        "bg": "Потвърдена резервация: {reference}",
        "ar": "تم تأكيد الحجز: {reference}",
    },
    "cancelled": {
        "en": "Booking cancelled: {reference}",
        "fr": "Réservation annulée : {reference}",
        "bg": "Отменена резервация: {reference}",
        "ar": "تم إلغاء الحجز: {reference}",
    },
}

OPENINGS = {
    "created": {
        "en": "Thank you, {name}. We have your booking and will confirm it shortly, with your chauffeur's details.",
        "fr": "Merci, {name}. Nous avons bien reçu votre réservation et la confirmerons sous peu, avec les coordonnées de votre chauffeur.",
        "bg": "Благодарим ви, {name}. Получихме резервацията ви и скоро ще я потвърдим заедно с данните на шофьора ви.",
        "ar": "شكرًا لك، {name}. استلمنا حجزك وسنؤكده قريبًا مع بيانات السائق.",
    },
    "changed": {
        "en": "{name}, your booking has been changed. We will confirm the new details shortly.",
        "fr": "{name}, votre réservation a été modifiée. Nous confirmerons les nouveaux détails sous peu.",
        "bg": "{name}, резервацията ви е променена. Скоро ще потвърдим новите данни.",
        "ar": "{name}، تم تعديل حجزك. سنؤكد التفاصيل الجديدة قريبًا.",
    },
    "confirmed": {
        "en": "{name}, your booking is confirmed. Your chauffeur will be there on time.",
        "fr": "{name}, votre réservation est confirmée. Votre chauffeur sera là à l'heure.",
        "bg": "{name}, резервацията ви е потвърдена. Шофьорът ви ще бъде там навреме.",
        "ar": "{name}، تم تأكيد حجزك. سيصل السائق في الموعد.",
    },
    "cancelled": {
        "en": "{name}, your booking has been cancelled. Nothing is due.",
        "fr": "{name}, votre réservation a été annulée. Aucun montant n'est dû.",
        "bg": "{name}, резервацията ви е отменена. Не дължите нищо.",
        "ar": "{name}، تم إلغاء حجزك. لا يوجد أي مبلغ مستحق.",
    },
}

LABELS = {
    "en": {
        "reference": "Reference", "journey": "Journey", "when": "When", "from": "From", "to": "To",
        "hours": "hours", "vehicle": "Vehicle", "passengers": "Passengers", "flight": "Flight",
        "price": "Price", "per_hour": "per hour", "pay": "Paid to your chauffeur or by invoice; no payment is taken online.",
        "chauffeur": "Chauffeur", "car": "Car",
        "manage": "View, change or cancel your booking (until {hours} hours before pickup):",
        "signature": "Driveo Exclusive",
    },
    "fr": {
        "reference": "Référence", "journey": "Trajet", "when": "Quand", "from": "Départ", "to": "Arrivée",
        "hours": "heures", "vehicle": "Véhicule", "passengers": "Passagers", "flight": "Vol",
        "price": "Prix", "per_hour": "par heure", "pay": "Réglé à votre chauffeur ou sur facture ; aucun paiement en ligne.",
        "chauffeur": "Chauffeur", "car": "Voiture",
        "manage": "Consulter, modifier ou annuler votre réservation (jusqu'à {hours} heures avant la prise en charge) :",
        "signature": "Driveo Exclusive",
    },
    "bg": {
        "reference": "Номер", "journey": "Пътуване", "when": "Кога", "from": "От", "to": "До",
        "hours": "часа", "vehicle": "Автомобил", "passengers": "Пътници", "flight": "Полет",
        "price": "Цена", "per_hour": "на час", "pay": "Плаща се на шофьора или по фактура; онлайн плащане не се взима.",
        "chauffeur": "Шофьор", "car": "Автомобил",
        "manage": "Вижте, променете или отменете резервацията си (до {hours} часа преди качването):",
        "signature": "Driveo Exclusive",
    },
    "ar": {
        "reference": "المرجع", "journey": "الرحلة", "when": "الموعد", "from": "من", "to": "إلى",
        "hours": "ساعات", "vehicle": "السيارة", "passengers": "الركاب", "flight": "الرحلة الجوية",
        "price": "السعر", "per_hour": "للساعة", "pay": "يُدفع للسائق أو بفاتورة؛ لا يُحصَّل أي دفع عبر الإنترنت.",
        "chauffeur": "السائق", "car": "السيارة",
        "manage": "اعرض حجزك أو عدّله أو ألغه (حتى {hours} ساعة قبل موعد الانطلاق):",
        "signature": "Driveo Exclusive",
    },
}


def manage_url(booking):
    query = urlencode({"lang": booking.locale, "ref": booking.reference, "token": booking.manage_token})
    return f"{settings.WEBSITE_BASE_URL.rstrip('/')}/booking?{query}"


def localized_name(model, pk, attr, locale):
    record = model.objects.filter(pk=pk).first()
    names = getattr(record, attr, None) or {}
    return names.get(locale) or names.get("en") or pk


def render(booking, event):
    """(subject, body) of the email for this event, in the booking's language."""
    from content.models import City, Service, Vehicle

    locale = booking.locale if booking.locale in LABELS else "en"
    t = LABELS[locale]
    service = localized_name(Service, booking.service, "title", locale)
    city = localized_name(City, booking.city, "name", locale)
    vehicle = localized_name(Vehicle, booking.vehicle, "name", locale)

    lines = [OPENINGS[event][locale].format(name=booking.first_name), ""]
    lines.append(f"{t['reference']}: {booking.reference}")
    lines.append(f"{t['journey']}: {service} · {city}")
    lines.append(f"{t['when']}: {booking.journey_date:%d.%m.%Y}, {booking.journey_time:%H:%M}")
    lines.append(f"{t['from']}: {booking.pickup_location}")
    if booking.is_hourly:
        lines.append(f"{booking.hire_hours} {t['hours']}")
    else:
        lines.append(f"{t['to']}: {booking.destination}")
    if booking.flight_number:
        lines.append(f"{t['flight']}: {booking.flight_number}")
    lines.append(f"{t['vehicle']}: {vehicle} · {t['passengers']}: {booking.passengers}")
    price = f"{booking.total_price} {booking.currency}"
    if booking.is_hourly:
        price += f" ({booking.unit_price} {booking.currency} {t['per_hour']})"
    if event != "cancelled":
        lines.append(f"{t['price']}: {price}")
        lines.append(t["pay"])
    if event == "confirmed" and (booking.chauffeur_name or booking.vehicle_details):
        lines.append("")
        if booking.chauffeur_name:
            lines.append(f"{t['chauffeur']}: {booking.chauffeur_name} {booking.chauffeur_phone}".rstrip())
        if booking.vehicle_details:
            lines.append(f"{t['car']}: {booking.vehicle_details}")
    if event != "cancelled":
        lines += ["", t["manage"].format(hours=settings.BOOKING_CANCEL_NOTICE_HOURS), manage_url(booking)]
    lines += ["", t["signature"]]

    subject = SUBJECTS[event][locale].format(reference=booking.reference)
    return subject, "\n".join(lines)
