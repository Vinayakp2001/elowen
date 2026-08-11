#!/bin/sh
set -e

echo "Starting Gunicorn..."
exec python -m gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
