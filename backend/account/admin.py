from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["username", "email", "first_name", "last_name", "is_staff", "is_active", "date_joined"]
    list_filter = ["is_staff", "is_superuser", "is_active", "locale"]
    fieldsets = [
        *BaseUserAdmin.fieldsets[:1],
        ("Personal info", {"fields": ["first_name", "last_name", "email", "phone", "locale"]}),
        *BaseUserAdmin.fieldsets[2:],
    ]
