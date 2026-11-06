"""Gunicorn settings for the API container (see Dockerfile)."""

import os

bind = "0.0.0.0:8000"
# Worker processes; 2–4 per CPU core is typical, so it follows the VPS size.
workers = int(os.environ.get("WEB_CONCURRENCY", "3"))
timeout = 30
# Workers' heartbeat files in memory rather than on the container's disk.
worker_tmp_dir = "/dev/shm"
# Logs go to the console (docker logs).
accesslog = "-"
errorlog = "-"
# Only Nginx can reach this container, so trust its X-Forwarded-* headers.
forwarded_allow_ips = "*"
# Docker manages the process, so gunicorn's control socket (for `gunicornc`,
# gunicorn 26+) isn't needed; it would also fail: the user has no home folder.
control_socket_disable = True
