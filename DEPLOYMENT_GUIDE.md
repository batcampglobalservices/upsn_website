# ==============================================
# RENDER DEPLOYMENT GUIDE
# ==============================================

## 📦 What Was Created

### Backend Files:
1. ✅ `backend/Dockerfile` - Multi-stage Docker build for Django
2. ✅ `backend/.dockerignore` - Excludes unnecessary files
3. ✅ `backend/build.sh` - Render build script
4. ✅ `backend/.env.production` - Production environment template
5. ✅ `backend/requirements.txt` - Copied from root

### Frontend Files:
6. ✅ `frontend/Dockerfile` - Multi-stage build (Node + Nginx)
7. ✅ `frontend/.dockerignore` - Keeps image small
8. ✅ `frontend/nginx.conf` - Nginx configuration with API proxy
9. ✅ `frontend/.env.production` - Production environment template

### Root Files:
10. ✅ `docker-compose.yml` - Local development with Docker
11. ✅ `render.yaml` - Render blueprint (optional)

## 🚀 Render Deployment Guide - FIXED

## ⚠️ CRITICAL FIX: ModuleNotFoundError: No module named 'backend.wsgi'

### Root Cause
When Render deploys from the repository root, the gunicorn command `backend.wsgi:application` fails because Python can't find the module path.

### ✅ Solution (Choose One)

#### **Solution 1: Use Start Script (RECOMMENDED)**
```bash
# Start command in Render:
./start-backend.sh
```

#### **Solution 2: Change Directory in Command**
```bash
# Start command in Render:
cd backend && gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
```

#### **Solution 3: Set Root Directory**
In Render Dashboard → Settings → Root Directory: `backend`

---

# 🚀 Deployment Guide - EduPro School Management System

### Step 1: Prepare Your Repository

1. **Commit all files to Git:**
   ```bash
   git add .
   git commit -m "Add Docker and Render configuration"
   git push origin main
   ```

2. **Create a Render account:** https://render.com

### Step 2: Deploy Backend (Django + DRF)

1. **Go to Render Dashboard** → **New** → **Web Service**

2. **Connect your GitHub repository**

3. **Configure Backend Service:**
   ```
   Name: edupro-backend
   Environment: Python 3
   Region: Oregon (or closest to you)
   Branch: main
   Root Directory: backend
   Build Command: ./build.sh
   Start Command: gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT --workers 4 --timeout 120
   Plan: Free
   ```

4. **Add Environment Variables** (Click "Advanced" → "Add Environment Variable"):
   ```
   SECRET_KEY=<generate-random-50-char-string>
   DEBUG=False
   ALLOWED_HOSTS=.onrender.com
   
   # Supabase Database (from your Supabase dashboard)
   DB_NAME=postgres
   DB_USER=postgres.your-project-ref
   DB_PASSWORD=your_supabase_password
   DB_HOST=aws-0-us-east-1.pooler.supabase.com
   DB_PORT=6543
   
   # CORS (will update after frontend deployment)
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   
   PYTHON_VERSION=3.11.0
   ```

5. **Click "Create Web Service"**
   - Wait 5-10 minutes for build
   - Note your backend URL: `https://edupro-backend.onrender.com`

### Step 3: Deploy Frontend (React + Vite)

1. **Go to Render Dashboard** → **New** → **Static Site**

2. **Connect your GitHub repository** (same repo)

3. **Configure Frontend Service:**
   ```
   Name: edupro-frontend
   Environment: Node
   Region: Oregon (same as backend)
   Branch: main
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   Plan: Free
   ```

4. **Add Environment Variables:**
   ```
   VITE_API_URL=https://edupro-backend.onrender.com
   NODE_VERSION=20.0.0
   ```

5. **Click "Create Static Site"**
   - Wait 3-5 minutes for build
   - Note your frontend URL: `https://edupro-frontend.onrender.com`

### Step 4: Update CORS Settings

1. **Go back to Backend service** on Render
2. **Update Environment Variable:**
   ```
   CORS_ALLOWED_ORIGINS=https://edupro-frontend.onrender.com,http://localhost:5173
   ```
3. **Save and trigger manual deploy** (or wait for auto-redeploy)

### Step 5: Update Frontend API URL

1. **Update `frontend/src/api/axios.js`:**
   ```javascript
   const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
   ```

2. **Commit and push:**
   ```bash
   git add frontend/src/api/axios.js
   git commit -m "Use environment variable for API URL"
   git push origin main
   ```

3. **Render will auto-redeploy** your frontend

## 🐳 LOCAL TESTING WITH DOCKER

### Test Both Services Locally:

```bash
# Build and start containers
docker-compose up --build

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

### Stop containers:
```bash
docker-compose down
```

### Rebuild after changes:
```bash
docker-compose up --build --force-recreate
```

## 🔧 TROUBLESHOOTING

### Backend Issues:

**1. Build Fails:**
```bash
# Check build logs in Render dashboard
# Common issues:
- Missing dependencies in requirements.txt
- Python version mismatch
- Database connection errors
```

**2. Static Files Not Loading:**
```bash
# In settings.py, ensure:
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Whitenoise should be configured
```

**3. Database Connection Errors:**
```bash
# Verify Supabase credentials
# Check that DB_HOST uses connection pooler
# Port should be 6543 (pooler) not 5432 (direct)
```

### Frontend Issues:

**1. API Calls Failing:**
```bash
# Check CORS settings in Django
# Verify VITE_API_URL is correct
# Check browser console for errors
```

**2. Build Fails:**
```bash
# Ensure package.json has correct build script:
"scripts": {
  "build": "vite build"
}
```

**3. 404 on Refresh:**
```bash
# Nginx config should have:
try_files $uri $uri/ /index.html;
```

## 📊 RENDER FREE TIER LIMITS

### Backend (Web Service):
- ✅ 512 MB RAM
- ✅ 0.1 CPU
- ✅ Spins down after 15 min inactivity
- ✅ 750 hours/month free

### Frontend (Static Site):
- ✅ 100 GB bandwidth/month
- ✅ Global CDN
- ✅ Always on (no spin down)

### Important Notes:
- ⚠️ First request after spin-down takes 30-60 seconds
- ⚠️ Consider keeping backend awake with cron job pings
- ⚠️ Free tier databases are NOT recommended (use Supabase)

## 🔐 SECURITY CHECKLIST

- [x] DEBUG=False in production
- [x] SECRET_KEY is randomized and secret
- [x] ALLOWED_HOSTS configured
- [x] CORS properly configured
- [x] Database uses SSL (Supabase does by default)
- [x] Environment variables not in code
- [x] Static files served by WhiteNoise
- [x] Nginx gzip compression enabled

## 📝 MAINTENANCE

### Update Dependencies:
```bash
# Backend
cd backend
pip install --upgrade <package>
pip freeze > requirements.txt

# Frontend
cd frontend
npm update
```

### Database Migrations:
```bash
# Migrations run automatically on deploy via build.sh
# Manual migration if needed:
# In Render dashboard → Shell → Run:
python manage.py migrate
```

### View Logs:
- Render Dashboard → Your Service → Logs tab
- Real-time log streaming available

## 🎉 SUCCESS CHECKLIST

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] API calls working (check Network tab)
- [ ] Login functionality works
- [ ] Database connections successful
- [ ] Static files loading (admin panel)
- [ ] Media uploads working (if applicable)
- [ ] CORS errors resolved
- [ ] Mobile responsive

## 🔗 USEFUL LINKS

- Render Dashboard: https://dashboard.render.com
- Render Docs: https://render.com/docs
- Supabase Dashboard: https://supabase.com/dashboard
- Docker Docs: https://docs.docker.com

## 💡 TIPS

1. **Keep Backend Awake:**
   - Use services like UptimeRobot to ping your backend every 14 minutes
   - Or upgrade to paid plan ($7/month) for always-on

2. **Optimize Build Times:**
   - Use Docker layer caching
   - Minimize dependencies
   - Use multi-stage builds (already done)

3. **Monitor Performance:**
   - Enable Render metrics
   - Use Django Debug Toolbar locally
   - Monitor Supabase query performance

4. **Backup Strategy:**
   - Supabase has automatic backups
   - Export important data regularly
   - Keep your Git history clean

---

## 🚨 EMERGENCY ROLLBACK

If deployment breaks:

1. **Render Dashboard** → Your Service
2. **Click "Rollback"** to previous deployment
3. Or **Trigger manual deploy** from a specific commit
4. Check logs to identify the issue

---

**Need help?** Check Render's support docs or their community forum!

🎊 **Your app is ready for deployment!** 🎊
