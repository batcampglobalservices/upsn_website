# ==============================================
# QUICK START - DOCKER DEPLOYMENT
# ==============================================

## 🐳 Local Testing with Docker

### Prerequisites:
- Docker installed
- Docker Compose installed

### 1. Test Locally with Docker

```bash
# Navigate to project root
cd "/home/batombari/Documents/Full stack dev"

# Build and start all services
docker-compose up --build

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
# - Admin: http://localhost:8000/admin
```

### 2. Stop Services

```bash
# Stop containers (Ctrl+C or in another terminal)
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

## 🚀 Deploy to Render

### Quick Steps:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add Docker and Render configs"
   git push origin main
   ```

2. **Deploy Backend:**
   - Go to https://render.com
   - New → Web Service
   - Connect GitHub repo
   - Root Directory: `backend`
   - Build Command: `./build.sh`
   - Start Command: `gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT`
   - Add environment variables from `backend/.env.production`

3. **Deploy Frontend:**
   - New → Static Site
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Add `VITE_API_URL` with your backend URL

4. **Update CORS:**
   - Add frontend URL to backend's `CORS_ALLOWED_ORIGINS`

## 📁 Files Created

```
project-root/
├── docker-compose.yml          # Orchestrates both services
├── render.yaml                 # Render blueprint (optional)
├── DEPLOYMENT_GUIDE.md         # Full deployment guide
│
├── backend/
│   ├── Dockerfile              # Backend container
│   ├── .dockerignore           # Excludes unnecessary files
│   ├── build.sh                # Render build script
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Local environment
│   ├── .env.production         # Production template
│   └── ...
│
└── frontend/
    ├── Dockerfile              # Frontend container
    ├── .dockerignore           # Excludes node_modules
    ├── nginx.conf              # Nginx web server config
    ├── .env.local              # Local environment
    ├── .env.production         # Production template
    └── ...
```

## ✅ What to Check

### Backend:
- [ ] `backend/Dockerfile` exists
- [ ] `backend/.dockerignore` exists
- [ ] `backend/build.sh` is executable
- [ ] `backend/requirements.txt` has gunicorn
- [ ] `backend/.env` has database credentials

### Frontend:
- [ ] `frontend/Dockerfile` exists
- [ ] `frontend/.dockerignore` exists
- [ ] `frontend/nginx.conf` exists
- [ ] `frontend/src/api/axios.js` uses `import.meta.env.VITE_API_URL`

### Root:
- [ ] `docker-compose.yml` exists
- [ ] `render.yaml` exists (optional)

## 🧪 Test Checklist

### Local Docker Test:
```bash
# 1. Build images
docker-compose build

# 2. Start services
docker-compose up

# 3. Open browser
#    - Frontend: http://localhost:3000
#    - Backend: http://localhost:8000/admin

# 4. Test login
#    - Username: 2001
#    - Password: Admin@123

# 5. Check API
#    - http://localhost:8000/api/users/

# 6. Stop services
docker-compose down
```

### Production Render Test:
1. Deploy backend first
2. Note backend URL
3. Deploy frontend with backend URL
4. Update CORS in backend
5. Test login and API calls

## 🔧 Troubleshooting

### Docker Build Fails:
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Port Already in Use:
```bash
# Change ports in docker-compose.yml
ports:
  - "3001:80"  # Frontend
  - "8001:8000"  # Backend
```

### Database Connection:
```bash
# Verify .env has correct Supabase credentials
# Check DB_HOST uses pooler (port 6543)
```

## 📚 Full Documentation

See `DEPLOYMENT_GUIDE.md` for:
- Step-by-step Render deployment
- Environment variable setup
- CORS configuration
- Troubleshooting guide
- Security checklist

## 🎯 Next Steps

1. ✅ Test locally with Docker
2. ✅ Push to GitHub
3. ✅ Deploy to Render
4. ✅ Configure environment variables
5. ✅ Update CORS settings
6. ✅ Test production deployment

---

**Ready to deploy!** 🚀
