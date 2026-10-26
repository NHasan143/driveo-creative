import os
import sys
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# All secrets live in backend/.env.local (template: .env.example).
# `neon deploy` / `neon env pull`, run from backend/, keep its Neon variables
# current and leave the Django lines alone. Real environment variables
# (Docker, CI) always win.
load_dotenv(BASE_DIR / ".env.local")


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DJANGO_DEBUG", "false").lower() == "true"

ALLOWED_HOSTS = [
    host for host in os.environ.get("DJANGO_ALLOWED_HOSTS", "").split(",") if host
]


# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "storages",
    "core",
    "quotes",
    "content",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    # Before CommonMiddleware, so CORS headers are added to every API response.
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# Database
# https://docs.djangoproject.com/en/6.1/ref/settings/#databases

# Lakebase Postgres on Neon, through psycopg 3.
# - "default" uses the pooled URL (PgBouncer, transaction mode) for app traffic.
#   Server-side cursors don't survive transaction pooling, so they're disabled.
# - "direct" uses the unpooled URL for session-level work: run migrations with
#   `python manage.py migrate --database direct`.
DATABASES = {
    "default": {
        **dj_database_url.parse(
            os.environ["DATABASE_URL"], conn_max_age=600, conn_health_checks=True
        ),
        "DISABLE_SERVER_SIDE_CURSORS": True,
    },
    "direct": {
        **dj_database_url.parse(os.environ["DATABASE_URL_UNPOOLED"]),
        "TEST": {"MIRROR": "default"},
    },
}

# `manage.py test` creates and drops a test database, and the pooler keeps
# server connections open that block the drop. Tests use the direct URL.
if sys.argv[1:2] == ["test"]:
    DATABASES["default"] = {
        **dj_database_url.parse(os.environ["DATABASE_URL_UNPOOLED"]),
        "DISABLE_SERVER_SIDE_CURSORS": True,
    }


# Uploaded files go to the Neon Object Storage bucket declared in neon.ts.
# boto3 reads AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY from the environment.
# The bucket is private, so file URLs are short-lived presigned links.
STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3.S3Storage",
        "OPTIONS": {
            "bucket_name": os.environ.get("AWS_STORAGE_BUCKET_NAME", "assets"),
            "endpoint_url": os.environ["AWS_ENDPOINT_URL_S3"],
            "region_name": os.environ["AWS_REGION"],
            "addressing_style": "path",
            "signature_version": "s3v4",
            "default_acl": None,
            "querystring_auth": True,
            "querystring_expire": 3600,
            "file_overwrite": False,
        },
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}


# Password validation
# https://docs.djangoproject.com/en/6.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.1/howto/static-files/

STATIC_URL = "static/"


def env_list(name):
    return [item.strip() for item in os.environ.get(name, "").split(",") if item.strip()]


# Email
# https://docs.djangoproject.com/en/6.1/topics/email/#topic-email-configuration
# With SMTP_HOST set, mail goes out over SMTP (any provider: Postmark, SES,
# Resend, Gmail...). Without it, emails are printed to the console.

if os.environ.get("SMTP_HOST"):
    MAILERS = {
        "default": {
            "BACKEND": "django.core.mail.backends.smtp.EmailBackend",
            "OPTIONS": {
                "host": os.environ["SMTP_HOST"],
                "port": int(os.environ.get("SMTP_PORT") or 587),
                "username": os.environ.get("SMTP_USERNAME", ""),
                "password": os.environ.get("SMTP_PASSWORD", ""),
                "use_tls": (os.environ.get("SMTP_USE_TLS") or "true").lower() == "true",
                "timeout": 20,
            },
        },
    }
else:
    MAILERS = {
        "default": {
            "BACKEND": "django.core.mail.backends.console.EmailBackend",
        },
    }

DEFAULT_FROM_EMAIL = (
    os.environ.get("DEFAULT_FROM_EMAIL") or "Driveo Exclusive <no-reply@driveoexclusive.com>"
)


# Celery (background jobs). Redis is the broker; results are not stored.
# CELERY_TASK_ALWAYS_EAGER=true runs tasks inside the request instead, for
# local work without Redis. Never use it in production.

CELERY_BROKER_URL = os.environ.get("REDIS_URL") or "redis://localhost:6379/0"
CELERY_TASK_ALWAYS_EAGER = os.environ.get("CELERY_TASK_ALWAYS_EAGER", "false").lower() == "true"
CELERY_TASK_IGNORE_RESULT = True
CELERY_TASK_ACKS_LATE = True
CELERY_WORKER_PREFETCH_MULTIPLIER = 1
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
# A failed publish (Redis down) fails fast; the quote is already saved.
CELERY_BROKER_TRANSPORT_OPTIONS = {"max_retries": 1, "socket_connect_timeout": 2}
CELERY_TIMEZONE = TIME_ZONE
CELERY_BEAT_SCHEDULE = {
    "requeue-stale-notifications": {
        "task": "quotes.tasks.requeue_stale_notifications_task",
        "schedule": 600.0,
    },
}


# DRF

# Deny by default: a view is staff-only unless it opts out (the public quote
# form and health check set AllowAny). Session auth only, see core/auth_views.py.
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAdminUser",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "quote_requests": os.environ.get("QUOTE_REQUESTS_RATE") or "10/hour",
        "staff_sign_in": os.environ.get("STAFF_SIGN_IN_RATE") or "20/hour",
    },
}

# The website calls the API from the browser, so its origin must be allowed.
# Comma-separated, scheme included, e.g. https://driveoexclusive.com
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS")
CORS_URLS_REGEX = r"^/api/.*$"
# The content admin (/admin on the website) signs staff in with the session
# cookie, so allowed origins may send cookies.
CORS_ALLOW_CREDENTIALS = True

# Staff sessions for the content admin (core/auth_views.py).
# The admin's origin must be trusted for CSRF; it is the website's origin.
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS") or CORS_ALLOWED_ORIGINS
# "Lax" works while the website and API share a site, e.g. driveoexclusive.com
# and api.driveoexclusive.com (or localhost:3000 and localhost:8000). On
# unrelated domains use "None" (HTTPS only), but browsers that block
# third-party cookies will then refuse to sign in.
SESSION_COOKIE_SAMESITE = os.environ.get("SESSION_COOKIE_SAMESITE") or "Lax"
CSRF_COOKIE_SAMESITE = SESSION_COOKIE_SAMESITE
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
# A working day; staff sign in again after that.
SESSION_COOKIE_AGE = 60 * 60 * 12


# Quote request alerts (quotes app)

# Comma-separated lists. An empty list skips that channel (logged in the admin).
QUOTE_ALERT_EMAILS = env_list("QUOTE_ALERT_EMAILS")
QUOTE_ALERT_WHATSAPP = env_list("QUOTE_ALERT_WHATSAPP")  # E.164, e.g. +447700900123

TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "")
TWILIO_WHATSAPP_FROM = os.environ.get("TWILIO_WHATSAPP_FROM", "")
# Approved WhatsApp template; without it a free-form body is sent, which
# WhatsApp only delivers inside a 24-hour customer-service window.
TWILIO_WHATSAPP_CONTENT_SID = os.environ.get("TWILIO_WHATSAPP_CONTENT_SID", "")

# Used to build dashboard links in alerts.
BACKEND_BASE_URL = os.environ.get("BACKEND_BASE_URL") or "http://localhost:8000"


LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "loggers": {
        "quotes": {"handlers": ["console"], "level": "INFO"},
    },
}
