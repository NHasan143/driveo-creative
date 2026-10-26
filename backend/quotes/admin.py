from django.contrib import admin, messages
from django.db.models import Count, Q
from django.utils.html import format_html_join

from .models import Notification, QuoteRequest
from .notifications import enqueue, reply_email_url, whatsapp_chat_url


class NotificationInline(admin.TabularInline):
    model = Notification
    extra = 0
    can_delete = False
    fields = ["channel", "recipient", "status", "attempts", "sent_at", "error"]
    readonly_fields = fields

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(QuoteRequest)
class QuoteRequestAdmin(admin.ModelAdmin):
    list_display = [
        "reference",
        "created_at",
        "full_name",
        "service_type",
        "city",
        "journey_date",
        "status",
        "alerts",
    ]
    list_filter = ["status", "city", "service_type", "vehicle_class", "created_at"]
    list_editable = ["status"]
    search_fields = ["reference", "first_name", "last_name", "email", "phone"]
    date_hierarchy = "created_at"
    inlines = [NotificationInline]
    actions = ["resend_failed_alerts"]
    readonly_fields = [
        "reference",
        "first_name",
        "last_name",
        "email",
        "phone",
        "city",
        "service_type",
        "vehicle_class",
        "pickup_location",
        "destination",
        "hire_hours",
        "journey_date",
        "journey_time",
        "passengers",
        "luggage",
        "notes",
        "locale",
        "ip_address",
        "created_at",
        "updated_at",
        "reply",
    ]
    fieldsets = [
        (None, {"fields": ["reference", "status", "staff_notes"]}),
        (
            "Customer",
            {"fields": ["first_name", "last_name", "email", "phone", "locale", "reply"]},
        ),
        (
            "Journey",
            {
                "fields": [
                    "city",
                    "service_type",
                    "vehicle_class",
                    "pickup_location",
                    "destination",
                    "hire_hours",
                    ("journey_date", "journey_time"),
                    ("passengers", "luggage"),
                    "notes",
                ]
            },
        ),
        ("Record", {"fields": ["ip_address", "created_at", "updated_at"]}),
    ]

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .annotate(
                alerts_sent=Count("notifications", filter=Q(notifications__status="sent")),
                alerts_failed=Count("notifications", filter=Q(notifications__status="failed")),
            )
        )

    def has_add_permission(self, request):
        return False  # Requests come from the website and apps only.

    @admin.display(description="Customer", ordering="last_name")
    def full_name(self, obj):
        return obj.full_name

    @admin.display(description="Reply")
    def reply(self, obj):
        """Links for answering the customer personally; set the status afterwards."""
        links = [("Email", reply_email_url(obj))]
        if whatsapp_url := whatsapp_chat_url(obj.phone):
            links.append(("WhatsApp", whatsapp_url))
        links.append(("Call", f"tel:{obj.phone}"))
        return format_html_join(
            " · ",
            '<a href="{}" target="_blank" rel="noopener">{}</a>',
            ((url, label) for label, url in links),
        )

    @admin.display(description="Alerts")
    def alerts(self, obj):
        text = f"{obj.alerts_sent} sent"
        return f"{text}, {obj.alerts_failed} failed" if obj.alerts_failed else text

    @admin.action(description="Resend failed alerts")
    def resend_failed_alerts(self, request, queryset):
        failed = Notification.objects.filter(
            quote_request__in=queryset, status=Notification.Status.FAILED
        )
        count = 0
        for row in failed:
            row.status = Notification.Status.PENDING
            row.save(update_fields=["status", "updated_at"])
            enqueue(row)
            count += 1
        self.message_user(request, f"Queued {count} alert(s) again.", messages.SUCCESS)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["quote_request", "channel", "recipient", "status", "attempts", "sent_at"]
    list_filter = ["status", "channel", "created_at"]
    search_fields = ["quote_request__reference", "recipient", "provider_message_id"]
    readonly_fields = [field.name for field in Notification._meta.fields]
    list_select_related = ["quote_request"]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
