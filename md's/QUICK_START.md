# Quick Start Guide

## Prerequisites Check
- [ ] Python 3.10+ installed
- [ ] Node.js 16+ installed
- [ ] pip installed
- [ ] npm installed

## 5-Minute Setup

### Step 1: Backend Setup (2 minutes)
```bash
cd backend

# Install dependencies (if not already done)
pip install -r ../requirements.txt

# Run migrations (already done, but run again if needed)
python manage.py migrate

# Create superuser
python manage.py createsuperuser
# Enter username (numeric, e.g., 1001), email, and password
```

### Step 2: Update Admin Role (30 seconds)
```bash
python manage.py shell
```
```python
from accounts.models import CustomUser
user = CustomUser.objects.get(username='1001')  # Your admin username
user.role = 'admin'
user.full_name = 'Admin Name'
user.save()
exit()
```

### Step 3: Create Media Directories (10 seconds)
```bash
mkdir -p media/profiles media/carousel media/logo
```

### Step 4: Start Backend (10 seconds)
```bash
python manage.py runserver
```
✅ Backend running at: http://localhost:8000

### Step 5: Frontend Setup (2 minutes)
Open a new terminal:
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
✅ Frontend running at: http://localhost:5173

## First Login

1. Go to http://localhost:5173/login
2. Enter admin username (e.g., 1001)
3. Enter password
4. You'll be redirected to admin dashboard

## Create Your First Student

### Via Admin Dashboard (Easy)
1. Login as admin
2. Go to "User Management" tab
3. Click "Add New User"
4. Fill in:
   - Username: 20241001 (numeric)
   - Full Name: John Doe
   - Role: Student
   - Email: john@school.com
   - Password: student123
   - Confirm Password: student123
5. Click "Create User"

### Via API (Alternative)
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "20241001",
    "password": "student123",
    "confirm_password": "student123",
    "full_name": "John Doe",
    "role": "student",
    "email": "john@school.com"
  }'
```

## Create Your First Class

### Via Admin Dashboard
1. Go to "Class Management" tab
2. Click "Add New Class"
3. Fill in:
   - Class Name: JSS1A
   - Level: JSS 1
   - Description: Junior Secondary 1A
4. Click "Create Class"

## Create Academic Session

### Via Django Admin
1. Go to http://localhost:8000/admin
2. Login with admin credentials
3. Click "Academic sessions" → "Add"
4. Fill in:
   - Name: 2024/2025
   - Start date: 2024-09-01
   - End date: 2025-07-31
   - Is active: ✓
5. Click "Save"

### Via Django Shell (Alternative)
```bash
python manage.py shell
```
```python
from results.models import AcademicSession
from datetime import date

session = AcademicSession.objects.create(
    name='2024/2025',
    start_date=date(2024, 9, 1),
    end_date=date(2025, 7, 31),
    is_active=True
)
print(f"Created session: {session.name}")
exit()
```

## Test Login as Different Roles

### As Admin
- Username: 1001 (or your admin username)
- Password: [your admin password]
- Dashboard: http://localhost:5173/admin-dashboard

### As Student
- Username: 20241001
- Password: student123
- Dashboard: http://localhost:5173/student-dashboard

## Common Tasks

### Upload School Logo
1. Login as admin
2. Go to "School Logo" tab
3. Click "Choose File"
4. Select logo image (PNG/JPG, square recommended)
5. Click "Upload Logo"

### Upload Carousel Image
1. Login as admin
2. Go to "Carousel Images" tab
3. Fill in title and caption
4. Choose image file
5. Set order (0 = first)
6. Check "Active"
7. Click "Upload Image"

### Add Result
Use Django Admin:
1. Go to http://localhost:8000/admin
2. Navigate to Results → Add
3. Select student, subject, session, term
4. Enter test score (0-30)
5. Enter exam score (0-70)
6. Total and grade will calculate automatically
7. Save

### Generate Result Summary
Use Django Admin:
1. Go to http://localhost:8000/admin
2. Navigate to Result Summaries → Add
3. Select student, session, term
4. Save (it will auto-calculate)

### Download Result PDF
1. Login as student
2. View dashboard
3. Find your result summary
4. Click "Download PDF"

## API Testing

### Get Access Token
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "1001",
    "password": "your_password"
  }'
```

### Use Token in Requests
```bash
curl http://localhost:8000/api/users/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Troubleshooting

### "No module named 'rest_framework'"
```bash
pip install -r requirements.txt
```

### "Access token expired"
Frontend auto-refreshes tokens. If issue persists:
1. Clear localStorage
2. Login again

### "CORS error"
Ensure backend settings.py has:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]
```

### Media files not showing
1. Check media directory exists
2. Verify settings.py has MEDIA_ROOT and MEDIA_URL
3. Ensure DEBUG=True for development

### Cannot create user
Ensure username is numeric (e.g., 1001, 20241001)

## Default Ports

- Backend: 8000
- Frontend: 5173 (Vite) or 3000
- Can be changed in respective configs

## File Locations

- Backend: `./backend/`
- Frontend: `./frontend/`
- Media files: `./backend/media/`
- Database: `./backend/db.sqlite3`
- API docs: `./API_DOCUMENTATION.md`
- Full guide: `./README.md`

## Quick Commands Reference

```bash
# Backend
cd backend
python manage.py runserver          # Start server
python manage.py migrate            # Run migrations
python manage.py createsuperuser    # Create admin
python manage.py shell              # Open shell

# Frontend
cd frontend
npm install                         # Install dependencies
npm run dev                         # Start dev server
npm run build                       # Build for production

# Both
./setup.sh                          # Run setup script
```

## Next Steps

1. ✅ Set up backend
2. ✅ Set up frontend
3. ✅ Create admin user
4. ✅ Login to system
5. ⏭️ Create classes and subjects
6. ⏭️ Add students and teachers
7. ⏭️ Enter results
8. ⏭️ Generate result summaries
9. ⏭️ Download PDFs
10. ⏭️ Customize media (logo, carousel)

## Support

- Check `README.md` for detailed documentation
- Check `API_DOCUMENTATION.md` for API details
- Check `IMPLEMENTATION_SUMMARY.md` for technical details

---

**You're all set! Happy coding! 🚀**
