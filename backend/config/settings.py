import os
import sys
from pathlib import Path

import dj_database_url
from corsheaders.defaults import default_headers
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
    "bookings",
    "content",
    "account",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    # Serves the Django admin's CSS/JS from STATIC_ROOT, so production needs no
    # separate static file server.
    "whitenoise.middleware.WhiteNoiseMiddleware",
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
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
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

# Users: account.User (same fields as Django's, table auth_user). Databases
# created before it existed need `manage.py adopt_custom_user` once.
AUTH_USER_MODEL = "account.User"


# Internationalization
# https://docs.djangoproject.com/en/6.1/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.1/howto/static-files/

STATIC_URL = "static/"
# `collectstatic` copies the admin's assets here (the Docker image does it at build time).
STATIC_ROOT = BASE_DIR / "staticfiles"


def env_list(name):
    return [item.strip() for item in os.environ.get(name, "").split(",") if item.strip()]


def env_bool(name, default=False):
    value = os.environ.get(name, "")
    return value.lower() == "true" if value else default


# Production: HTTPS behind Cloudflare and Nginx
# Every switch below is off by default, so local http://localhost works as is.
# backend/.env.example lists the production values.

# Nginx passes the original scheme in X-Forwarded-Proto. Trust it only behind
# a proxy that overwrites it; otherwise any client could claim to be on HTTPS.
if env_bool("DJANGO_BEHIND_PROXY"):
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Cloudflare and Nginx already send http:// to https://; this is a second line.
SECURE_SSL_REDIRECT = env_bool("DJANGO_SSL_REDIRECT")
# Container health checks call the API over plain HTTP inside the network.
SECURE_REDIRECT_EXEMPT = [r"^api/v1/health/$"]
# Browsers remember to use HTTPS for this many seconds. Start short (3600) and
# raise it to a year (31536000) once HTTPS is known to work. Sent on HTTPS only.
SECURE_HSTS_SECONDS = int(os.environ.get("DJANGO_HSTS_SECONDS") or 0)
SECURE_HSTS_INCLUDE_SUBDOMAINS = env_bool("DJANGO_HSTS_INCLUDE_SUBDOMAINS")

# Rate limits (and the IP stored with bookings) use the visitor's IP.
# Behind proxies REMOTE_ADDR is the proxy's, so DRF reads X-Forwarded-For
# instead: set this to the number of proxies in front of Django (Cloudflare +
# Nginx = 2). Leave it empty when nothing sits in front of Django.
NUM_PROXIES = int(os.environ["DRF_NUM_PROXIES"]) if os.environ.get("DRF_NUM_PROXIES") else None

# Rate limits are counted in the cache. The default in-memory cache belongs to
# one process, so with several web workers each counts on its own. Production
# points this at Redis, e.g. redis://redis:6379/1 (Celery uses database 0).
if os.environ.get("CACHE_REDIS_URL"):
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.redis.RedisCache",
            "LOCATION": os.environ["CACHE_REDIS_URL"],
        },
    }


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
# A failed publish (Redis down) fails fast; the booking is already saved.
CELERY_BROKER_TRANSPORT_OPTIONS = {"max_retries": 1, "socket_connect_timeout": 2}
CELERY_TIMEZONE = TIME_ZONE
CELERY_BEAT_SCHEDULE = {
    "requeue-stale-notifications": {
        "task": "bookings.tasks.requeue_stale_notifications_task",
        "schedule": 600.0,
    },
}


# DRF

# Deny by default: a view is staff-only unless it opts out (the public booking
# form and health check set AllowAny). Session auth only, see core/auth_views.py.
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAdminUser",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "bookings": os.environ.get("BOOKINGS_RATE") or "10/hour",
        "staff_sign_in": os.environ.get("STAFF_SIGN_IN_RATE") or "20/hour",
        # Customer accounts (account app), per IP.
        "account_sign_in": os.environ.get("ACCOUNT_SIGN_IN_RATE") or "20/hour",
        "account_register": os.environ.get("ACCOUNT_REGISTER_RATE") or "10/hour",
        "password_reset": os.environ.get("PASSWORD_RESET_RATE") or "5/hour",
    },
    "NUM_PROXIES": NUM_PROXIES,
}

# The website calls the API from the browser, so its origin must be allowed.
# Comma-separated, scheme included, e.g. https://driveoexclusive.com
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS")
CORS_URLS_REGEX = r"^/api/.*$"
# The content admin (/admin on the website) signs staff in with the session
# cookie, so allowed origins may send cookies.
CORS_ALLOW_CREDENTIALS = True
# Guests open their booking with the private token from their email (bookings/views.py).
CORS_ALLOW_HEADERS = (*default_headers, "x-booking-token")

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


# Bookings (bookings app)

# Who hears about new, changed and cancelled bookings. Comma-separated; an
# empty list skips that channel (logged in the admin). The QUOTE_ALERT_* names
# from before bookings replaced quote requests still work.
BOOKING_ALERT_EMAILS = env_list("BOOKING_ALERT_EMAILS") or env_list("QUOTE_ALERT_EMAILS")
# E.164, e.g. +447700900123
BOOKING_ALERT_WHATSAPP = env_list("BOOKING_ALERT_WHATSAPP") or env_list("QUOTE_ALERT_WHATSAPP")
# Customers change or cancel online until this many hours before pickup.
BOOKING_CANCEL_NOTICE_HOURS = int(os.environ.get("BOOKING_CANCEL_NOTICE_HOURS") or 24)
# A new booking needs at least this much notice (city time); urgent ones are by phone.
BOOKING_MIN_NOTICE_HOURS = int(os.environ.get("BOOKING_MIN_NOTICE_HOURS") or 3)

TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "")
TWILIO_WHATSAPP_FROM = os.environ.get("TWILIO_WHATSAPP_FROM", "")
# Approved WhatsApp template; without it a free-form body is sent, which
# WhatsApp only delivers inside a 24-hour customer-service window.
TWILIO_WHATSAPP_CONTENT_SID = os.environ.get("TWILIO_WHATSAPP_CONTENT_SID", "")

# Used to build dashboard links in alerts.
BACKEND_BASE_URL = os.environ.get("BACKEND_BASE_URL") or "http://localhost:8000"

# Public website, used to build links in emails (e.g. password reset).
WEBSITE_BASE_URL = os.environ.get("WEBSITE_BASE_URL") or "http://localhost:3000"
# Password reset links stop working after this many seconds (and once used).
PASSWORD_RESET_TIMEOUT = 60 * 60 * 2


# Everything goes to the console (docker logs). Warnings and errors from any
# module, including unhandled request errors (django.request), reach it through
# the root logger.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "WARNING"},
    "loggers": {
        "bookings": {"handlers": ["console"], "level": "INFO", "propagate": False},
    },
}
