# syntax=docker/dockerfile:1

# One image for the API and its background jobs. The command picks the role:
#   (default)                                                      the API, gunicorn on port 8000
#   celery -A config worker -l info                                the alert worker
#   celery -A config beat -l info --schedule /tmp/celerybeat-schedule   the scheduler
# Migrations are a one-off step, never run at start-up (several containers start together):
#   python manage.py migrate --database direct
# All configuration comes from environment variables (backend/.env.example); the
# image contains no secrets (.dockerignore keeps .env.local out).

# ---- Dependencies --------------------------------------------------------
FROM python:3.12-slim AS deps
ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY requirements.txt .
RUN pip install -r requirements.txt

# ---- Runtime -------------------------------------------------------------
FROM python:3.12-slim AS runner
WORKDIR /app
ENV PATH="/opt/venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN groupadd --system --gid 1001 django && useradd --system --uid 1001 --gid django --no-create-home django

COPY --from=deps /opt/venv /opt/venv
COPY . .

# settings.py refuses to start without these. collectstatic only copies the
# Django admin's files into STATIC_ROOT and never touches the database or the
# bucket, so placeholders are enough at build time.
RUN DJANGO_SECRET_KEY=build-only \
    DATABASE_URL=postgres://build@localhost/build \
    DATABASE_URL_UNPOOLED=postgres://build@localhost/build \
    AWS_ENDPOINT_URL_S3=https://build.invalid \
    AWS_REGION=build \
    python manage.py collectstatic --noinput

USER django
EXPOSE 8000
# 200 only when the database and the bucket both answer. The worker and
# scheduler containers serve no HTTP: disable this check for them.
# DJANGO_ALLOWED_HOSTS must include localhost.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD python -c "import sys, urllib.request; sys.exit(urllib.request.urlopen('http://localhost:8000/api/v1/health/', timeout=4).status != 200)"

CMD ["gunicorn", "config.wsgi:application", "--config", "gunicorn.conf.py"]
