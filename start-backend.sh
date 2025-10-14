#!/usr/bin/env bash
# Render start script for backend
set -o errexit

cd backend
exec gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
