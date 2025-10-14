# 🔧 QUICK FIX: Render Deployment Error

## Error Message:
```
ModuleNotFoundError: No module named 'backend.wsgi'
```

## ✅ 3 Ways to Fix (Pick One):

### 1️⃣ Use Start Script (EASIEST)
**Render Dashboard → Start Command:**
```bash
./start-backend.sh
```

### 2️⃣ Change Directory
**Render Dashboard → Start Command:**
```bash
cd backend && gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
```

### 3️⃣ Set Root Directory
**Render Dashboard → Settings:**
- Root Directory: `backend`
- Start Command: `gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT`

---

## 📋 Complete Render Setup

### Backend Service:

**Build Command:**
```bash
cd backend
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn psycopg2-binary python-decouple
python manage.py collectstatic --noinput
python manage.py migrate --noinput
```

**Start Command (Pick one above)**

**Environment Variables:**
```
SECRET_KEY=<generate-random>
DEBUG=False
ALLOWED_HOSTS=.onrender.com
DB_NAME=postgres
DB_USER=postgres.your-project-ref
DB_PASSWORD=<your-supabase-password>
DB_HOST=aws-1-us-east-2.pooler.supabase.com
DB_PORT=6543
CORS_ALLOWED_ORIGINS=https://your-frontend.onrender.com
```

### Frontend Service:

**Build Command:**
```bash
cd frontend
npm install
npm run build
```

**Publish Directory:**
```
frontend/dist
```

**Environment Variables:**
```
VITE_API_URL=https://your-backend.onrender.com
```

---

## ✅ Verification

### Test Backend:
```bash
curl https://your-backend.onrender.com/api/
```

### Test Frontend:
Open: `https://your-frontend.onrender.com`

---

## 🆘 Still Not Working?

1. **Check Logs** in Render Dashboard
2. **Verify Build Command** completed successfully
3. **Test Supabase Connection** locally first
4. **Check Environment Variables** are set correctly
5. **Try Docker Locally:**
   ```bash
   docker-compose up --build
   ```

---

## 📞 Common Issues:

| Error | Fix |
|-------|-----|
| Module not found | Use one of the 3 solutions above |
| Static files 404 | Add collectstatic to build command |
| CORS errors | Update CORS_ALLOWED_ORIGINS |
| Database error | Check Supabase credentials |
| Port already in use | Use $PORT variable |

---

## ✨ Success Checklist:

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and loads
- [ ] Login works
- [ ] API calls successful
- [ ] Database connected
- [ ] No CORS errors

**You're done! 🎉**
