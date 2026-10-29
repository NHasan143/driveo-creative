from django.contrib import admin, messages
from django.db import transaction
from django.db.models import Count, Q
from django.utils import timezone
from django.utils.html import format_html_join

from .models import Booking, Notification
from .notifications import enqueue, queue_booking_notifications, whatsapp_chat_url


class NotificationInline(admin.TabularInline):
    model = Notification
    extra = 0
    can_delete = False
    fields = ["event", "audience", "channel", "recipient", "status", "attempts", "sent_at", "error"]
    readonly_fields = fields

    def has_add_permission(self, request, obj=None):
        return False


def apply_status(booking, new_status):
    """Sets a staff-chosen status and emails the customer when it matters to them.

    Returns True when the status changed.
    """
    if booking.status == new_status:
        return False
    booking.status = new_status
    event = None
    if new_status == Booking.Status.CONFIRMED:
        booking.confirmed_at = timezone.now()
        event = Notification.Event.CONFIRMED
    elif new_status == Booking.Status.CANCELLED:
        booking.cancelled_at = timezone.now()
        booking.cancelled_by = Booking.CancelledBy.STAFF
        event = Notification.Event.CANCELLED
    booking.save()
    if event:
        # Staff made the change, so only the customer needs telling.
        transaction.on_commit(lambda: queue_booking_notifications(booking, event, owner=False))
    return True


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        "reference",
        "pickup",
        "full_name",
        "service",
        "city",
        "vehicle",
        "price",
        "status",
        "message_count",
    ]
    list_filter = ["status", "city", "service", "vehicle", "journey_date"]
    search_fields = ["reference", "first_name", "last_name", "email", "phone", "chauffeur_name"]
    date_hierarchy = "journey_date"
    ordering = ["journey_date", "journey_time"]
    inlines = [NotificationInline]
    actions = ["confirm", "complete", "cancel", "resend_failed_messages"]
    readonly_fields = [
        "reference",
        "first_name",
        "last_name",
        "email",
        "phone",
        "locale",
        "customer",
        "contact",
        "service",
        "city",
        "vehicle",
        "pickup_location",
        "destination",
        "hire_hours",
        "flight_number",
        "journey_date",
        "journey_time",
        "passengers",
        "luggage",
        "notes",
        "currency",
        "price_unit",
        "unit_price",
        "total_price",
        "confirmed_at",
        "cancelled_at",
        "cancelled_by",
        "ip_address",
        "created_at",
        "updated_at",
    ]
    fieldsets = [
        (None, {"fields": ["reference", "status", "staff_notes"]}),
        (
            "Chauffeur (sent to the customer when you confirm)",
            {"fields": ["chauffeur_name", "chauffeur_phone", "vehicle_details"]},
        ),
        ("Customer", {"fields": ["first_name", "last_name", "email", "phone", "locale", "customer", "contact"]}),
        (
            "Journey",
            {
                "fields": [
                    ("service", "city", "vehicle"),
                    "pickup_location",
                    "destination",
                    "hire_hours",
                    "flight_number",
                    ("journey_date", "journey_time"),
                    ("passengers", "luggage"),
                    "notes",
                ]
            },
        ),
        ("Price (paid later)", {"fields": [("total_price", "currency"), ("unit_price", "price_unit")]}),
        (
            "Record",
            {"fields": ["confirmed_at", "cancelled_at", "cancelled_by", "ip_address", "created_at", "updated_at"]},
        ),
    ]

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .annotate(
                messages_sent=Count("notifications", filter=Q(notifications__status="sent")),
                messages_failed=Count("notifications", filter=Q(notifications__status="failed")),
            )
        )

    def has_add_permission(self, request):
        return False  # Bookings come from the website and apps.

    def save_model(self, request, obj, form, change):
        new_status = obj.status
        if change and "status" in form.changed_data:
            obj.status = form.initial["status"]
            obj.save()  # Other edits first, then the status with its email.
            apply_status(obj, new_status)
        else:
            super().save_model(request, obj, form, change)

    @admin.display(description="Pickup", ordering="journey_date")
    def pickup(self, obj):
        return f"{obj.journey_date:%d %b %Y}, {obj.journey_time:%H:%M}"

    @admin.display(description="Customer", ordering="last_name")
    def full_name(self, obj):
        return obj.full_name

    @admin.display(description="Price", ordering="total_price")
    def price(self, obj):
        return f"{obj.total_price} {obj.currency}"

    @admin.display(description="Contact")
    def contact(self, obj):
        links = [("Email", f"mailto:{obj.email}")]
        if whatsapp_url := whatsapp_chat_url(obj.phone):
            links.append(("WhatsApp", whatsapp_url))
        links.append(("Call", f"tel:{obj.phone}"))
        return format_html_join(
            " · ",
            '<a href="{}" target="_blank" rel="noopener">{}</a>',
            ((url, label) for label, url in links),
        )

    @admin.display(description="Messages")
    def message_count(self, obj):
        text = f"{obj.messages_sent} sent"
        return f"{text}, {obj.messages_failed} failed" if obj.messages_failed else text

    def _set_status(self, request, queryset, new_status, allowed_from, verb):
        changed = 0
        with transaction.atomic():
            for booking in queryset.filter(status__in=allowed_from):
                changed += apply_status(booking, new_status)
        skipped = queryset.count() - changed
        message = f"{verb} {changed} booking(s)."
        if skipped:
            message += f" {skipped} skipped (not in a status that allows it)."
        self.message_user(request, message, messages.SUCCESS if changed else messages.WARNING)

    @admin.action(description="Confirm (emails the customer)")
    def confirm(self, request, queryset):
        self._set_status(request, queryset, Booking.Status.CONFIRMED, [Booking.Status.PENDING], "Confirmed")

    @admin.action(description="Mark completed")
    def complete(self, request, queryset):
        self._set_status(request, queryset, Booking.Status.COMPLETED, [Booking.Status.CONFIRMED], "Completed")

    @admin.action(description="Cancel (emails the customer)")
    def cancel(self, request, queryset):
        open_statuses = [Booking.Status.PENDING, Booking.Status.CONFIRMED]
        self._set_status(request, queryset, Booking.Status.CANCELLED, open_statuses, "Cancelled")

    @admin.action(description="Resend failed messages")
    def resend_failed_messages(self, request, queryset):
        failed = Notification.objects.filter(booking__in=queryset, status=Notification.Status.FAILED)
        count = 0
        for row in failed:
            row.status = Notification.Status.PENDING
            row.save(update_fields=["status", "updated_at"])
            enqueue(row)
            count += 1
        self.message_user(request, f"Queued {count} message(s) again.", messages.SUCCESS)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["booking", "event", "audience", "channel", "recipient", "status", "attempts", "sent_at"]
    list_filter = ["status", "event", "audience", "channel", "created_at"]
    search_fields = ["booking__reference", "recipient", "provider_message_id"]
    readonly_fields = [field.name for field in Notification._meta.fields]
    list_select_related = ["booking"]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
