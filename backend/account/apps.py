from django.apps import AppConfig


class AccountConfig(AppConfig):
    name = "account"
    verbose_name = "Accounts"
    # User reuses Django's original auth_user table, whose id is a 32-bit integer.
    # Django 6 would give new models 64-bit ids, so the model and table would disagree.
    default_auto_field = "django.db.models.AutoField"
