#!/bin/sh
set -e

echo "Running Alembic migrations..."
alembic upgrade head

echo "Starting Gunicorn..."
exec gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
