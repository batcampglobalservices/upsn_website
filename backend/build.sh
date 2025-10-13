# Build script for Render backend deployment
#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn psycopg2-binary python-decouple

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate --no-input
