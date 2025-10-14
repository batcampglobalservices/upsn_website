#!/usr/bin/env bash
# Render start script for backend
set -o errexit

# Change to backend directory
cd backend

# Ensure gunicorn is available (Render should have installed it)
# Use python -m gunicorn as fallback if direct command fails
if command -v gunicorn &> /dev/null; then
    exec gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
else
    exec python -m gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
fi
