"""Switch an existing database over to account.User (run once per database).

Databases migrated before AUTH_USER_MODEL existed already have Django's
`auth_user` table, and admin's migrations recorded as depending on auth.User.
account.User reuses that table, so no data moves. This command only:

1. records account.0001_initial as applied (its table already exists), and
2. moves the user content type from `auth` to `account`, so existing
   permissions and admin log entries keep pointing at the right model.

Without step 1, `migrate` stops with InconsistentMigrationHistory. Then run
`migrate --database direct` as usual, which applies the remaining account
migrations (e.g. the unique-email constraint).

New, empty databases (tests, branches built from scratch) don't need this.
"""

from django.core.management.base import BaseCommand, CommandError
from django.db import connections, transaction

MIGRATION = ("account", "0001_initial")


class Command(BaseCommand):
    help = "One-time switch of an existing database to the custom user model (account.User)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--database",
            default="direct",
            help='Connection to use (default "direct", the unpooled URL used for migrations).',
        )

    def handle(self, *args, database, **options):
        connection = connections[database]
        tables = set(connection.introspection.table_names())

        if "django_migrations" not in tables:
            self.stdout.write("Empty database: nothing to adopt. Run migrate as usual.")
            return

        with transaction.atomic(using=database), connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM django_migrations WHERE app = %s AND name = %s", MIGRATION)
            if cursor.fetchone():
                self.stdout.write(self.style.SUCCESS("Already adopted. Run migrate as usual."))
                return
            if "auth_user" not in tables:
                raise CommandError("There is no auth_user table to adopt. Run migrate as usual.")

            cursor.execute(
                "INSERT INTO django_migrations (app, name, applied) VALUES (%s, %s, NOW())", MIGRATION
            )
            cursor.execute(
                "SELECT 1 FROM django_content_type WHERE app_label = 'account' AND model = 'user'"
            )
            if not cursor.fetchone():
                cursor.execute(
                    "UPDATE django_content_type SET app_label = 'account' "
                    "WHERE app_label = 'auth' AND model = 'user'"
                )
            cursor.execute("SELECT COUNT(*) FROM auth_user")
            (users,) = cursor.fetchone()

        self.stdout.write(
            self.style.SUCCESS(
                f"Adopted account.User on '{database}' ({users} existing user(s) kept). "
                f"Now run: manage.py migrate --database {database}"
            )
        )
