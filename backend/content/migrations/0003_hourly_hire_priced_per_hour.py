from django.db import migrations


def price_hourly_hire_per_hour(apps, schema_editor):
    apps.get_model("content", "Service").objects.filter(pk="hourly_hire").update(price_unit="hour")


def price_hourly_hire_per_trip(apps, schema_editor):
    apps.get_model("content", "Service").objects.filter(pk="hourly_hire").update(price_unit="trip")


class Migration(migrations.Migration):
    dependencies = [
        ("content", "0002_service_prices"),
    ]

    operations = [
        migrations.RunPython(price_hourly_hire_per_hour, price_hourly_hire_per_trip),
    ]
