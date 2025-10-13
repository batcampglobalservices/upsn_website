# Supabase Database Setup Instructions

## Step 1: Get Your Supabase Connection Details

1. Log in to your Supabase project at https://supabase.com
2. Go to **Settings** → **Database**
3. Scroll down to **Connection string** section
4. Look for the **Connection pooling** section (recommended for Django)
5. Copy these values:
   - **Host**: `aws-0-[region].pooler.supabase.com` or `db.[project-ref].supabase.co`
   - **Database**: `postgres`
   - **Port**: `6543` (for pooling) or `5432` (direct)
   - **User**: `postgres.[project-ref]`
   - **Password**: Your database password (you set this when creating the project)

## Step 2: Update the .env File

Edit `/backend/.env` and replace the placeholder values:

```env
# Supabase PostgreSQL Database
DB_NAME=postgres
DB_USER=postgres.your-project-ref     # Replace with your actual user
DB_PASSWORD=YOUR_ACTUAL_PASSWORD      # Replace with your actual password
DB_HOST=aws-0-us-east-1.pooler.supabase.com  # Replace with your actual host
DB_PORT=6543  # or 5432 for direct connection
```

## Step 3: Run Migrations

After updating the .env file:

```bash
cd backend
source venv/bin/activate  # Activate virtual environment
python manage.py makemigrations
python manage.py migrate
```

## Step 4: Create Superuser

```bash
python manage.py createsuperuser
```

## Step 5: Start the Backend Server

```bash
python manage.py runserver
```

## Troubleshooting

### Connection Error
- Make sure your Supabase project is not paused
- Check that you're using the correct connection pooler host
- Verify your password is correct (no extra spaces)

### SSL Error
The `sslmode: require` option is already configured in settings.py

### Port Issues
- Use port `6543` for connection pooling (recommended)
- Use port `5432` for direct connection (less recommended for serverless)

## Notes
- The virtual environment is at `/backend/venv/`
- Always activate it before running Django commands
- Your SQLite data (db.sqlite3) will not be migrated automatically
- You'll need to manually recreate users and data in Supabase if needed
