# 🚀 QUICK START - Supabase Database

## ⚡ Fast Setup (3 Steps)

### Step 1: Update .env with Supabase Credentials
Open `backend/.env` and replace these values:

```bash
DB_USER=postgres.YOUR_PROJECT_REF      # Get from Supabase
DB_PASSWORD=YOUR_PASSWORD              # Your Supabase password
DB_HOST=aws-0-us-east-1.pooler.supabase.com  # Get from Supabase
```

**Where to find:**
- Go to https://supabase.com → Your Project
- Settings → Database → Connection pooling

### Step 2: Run Migrations
```bash
cd backend
source venv/bin/activate
python manage.py migrate
python manage.py createsuperuser
```

### Step 3: Start Servers
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
python manage.py runserver

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## ✅ Done!
- Navigate to http://localhost:5173
- Login with your superuser credentials
- Everything should work!

## 🔧 If Migration Fails:
1. Check your Supabase project is not paused
2. Verify password has no extra spaces
3. Confirm you're using connection pooler (port 6543)
4. Test connection: `psql "postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?sslmode=require"`

## 📝 Note
Your SQLite data won't transfer automatically. After migration, you'll need to:
1. Create users via admin panel
2. Add classes and subjects again
3. Set up academic sessions

For detailed instructions, see `SUPABASE_SETUP.md`
