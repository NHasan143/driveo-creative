"""Bookings replaced quote requests (the former `quotes` app, removed on 2026-10-29).

Drops its tables and its bookkeeping on databases that had it. Nothing is
carried over: by then production held no quote requests, and dev only test data.
"""

from django.db import migrations


def forget_quotes_app(apps, schema_editor):
    ContentType = apps.get_model("contenttypes", "ContentType")
    # Also removes the app's permissions and admin log entries.
    ContentType.objects.using(schema_editor.connection.alias).filter(app_label="quotes").delete()
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("DELETE FROM django_migrations WHERE app = 'quotes'")


class Migration(migrations.Migration):
    dependencies = [
        ("bookings", "0001_initial"),
        ("contenttypes", "0002_remove_content_type_name"),
    ]

    operations = [
        migrations.RunSQL(
            "DROP TABLE IF EXISTS quotes_notification; DROP TABLE IF EXISTS quotes_quoterequest;",
            reverse_sql=migrations.RunSQL.noop,
        ),
        migrations.RunPython(forget_quotes_app, migrations.RunPython.noop),
    ]
