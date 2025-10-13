# School Result Management System

A complete school result management system built with Django Rest Framework (Backend) and React (Frontend).

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Teacher, Student)
- Numeric username login system
- Secure password management (Admin-only editing)

### 👥 User Management
- **Admin**: Full user management (create, edit, deactivate)
- **Teacher**: View assigned classes and students
- **Student**: View personal profile and results

### 📚 Academic Management
- Class management (JSS1-SS3)
- Subject assignment to classes and teachers
- Academic session and term management

### 📊 Result Management
- Test (30 marks) and Exam (70 marks) score entry
- Automatic total calculation and grading
- Bulk result upload
- Result summary with average calculation
- PDF result sheet generation with school logo

### 🎨 Media Management
- Carousel image management for homepage
- School logo upload and management
- Images accessible by React frontend

### 📈 Grading System
- A: 70-100 (Excellent)
- B: 60-69 (Very Good)
- C: 50-59 (Good)
- D: 45-49 (Pass)
- F: 0-44 (Fail)

## Tech Stack

### Backend
- Python 3.12+
- Django 5.x
- Django Rest Framework
- Simple JWT
- ReportLab (PDF generation)
- Pillow (Image handling)
- Django CORS Headers
- Django Filter

### Frontend
- React 19.x
- React Router DOM
- Axios
- JWT Decode
- Tailwind CSS
- AOS (Animations)
- Framer Motion

## Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 16+
- pip
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create and activate virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r ../requirements.txt
```

4. **Run migrations**
```bash
python manage.py migrate
```

5. **Create superuser**
```bash
python manage.py createsuperuser
# Follow prompts to create admin user
```

6. **Update admin role** (Important!)
```bash
python manage.py shell
```
```python
from accounts.models import CustomUser
user = CustomUser.objects.get(username='your_admin_username')
user.role = 'admin'
user.full_name = 'Admin Name'
user.save()
exit()
```

7. **Create media directories**
```bash
mkdir -p media/profiles media/carousel media/logo
```

8. **Run development server**
```bash
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure API URL** (if needed)
Edit `frontend/src/api/axios.js` and update:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

4. **Run development server**
```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173` or `http://localhost:3000`

## Usage Guide

### Admin Dashboard
1. Login with admin credentials (numeric username)
2. Access admin dashboard at `/admin-dashboard`
3. Manage:
   - Users (create teachers and students)
   - Classes (create and assign teachers)
   - Subjects (assign to classes)
   - Carousel images
   - School logo

### Teacher Dashboard
1. Login with teacher credentials
2. Access teacher dashboard at `/teacher-dashboard`
3. View assigned classes and students
4. Can add results via API or admin panel

### Student Dashboard
1. Login with student ID
2. Access student dashboard at `/student-dashboard`
3. View profile and results
4. Download result PDFs

### Creating Sample Data

#### 1. Create Academic Session
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
```

#### 2. Create Class
Via Django admin or API:
```json
POST /api/classes/
{
  "name": "JSS1A",
  "level": "JSS1",
  "assigned_teacher": <teacher_id>
}
```

#### 3. Create Subject
```json
POST /api/subjects/
{
  "name": "Mathematics",
  "code": "MATH101",
  "assigned_class": <class_id>,
  "assigned_teacher": <teacher_id>
}
```

#### 4. Create Student
```json
POST /api/auth/register/
{
  "username": "20241001",
  "password": "student123",
  "confirm_password": "student123",
  "full_name": "John Doe",
  "role": "student",
  "email": "john@school.com"
}
```

#### 5. Assign Student to Class
Update student profile via API or admin panel.

#### 6. Add Results
```json
POST /api/results/
{
  "student": <student_id>,
  "subject": <subject_id>,
  "session": <session_id>,
  "term": "first",
  "test_score": 25,
  "exam_score": 65
}
```

#### 7. Generate Result Summary
```json
POST /api/summaries/generate_summary/
{
  "student": <student_id>,
  "session": <session_id>,
  "term": "first"
}
```

## API Endpoints

Comprehensive API documentation available in `API_DOCUMENTATION.md`

Key endpoints:
- `/api/auth/login/` - Login
- `/api/auth/register/` - Register (Admin only)
- `/api/users/` - User management
- `/api/classes/` - Class management
- `/api/subjects/` - Subject management
- `/api/results/` - Result management
- `/api/summaries/` - Result summaries
- `/api/summaries/<id>/pdf/` - Download PDF
- `/api/media/carousel/` - Carousel images
- `/api/media/logo/` - School logo

## Project Structure

```
├── backend/
│   ├── accounts/          # User authentication & management
│   ├── classes/           # Class & subject management
│   ├── results/           # Result management & PDF generation
│   ├── media_manager/     # Media files (carousel, logo)
│   └── backend/           # Main project settings
│
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios configuration
│   │   ├── components/   # Reusable components
│   │   ├── hooks/        # Custom hooks (useAuth, useData)
│   │   ├── pages/        # Page components
│   │   └── App.jsx       # Main app with routing
│   │
│   └── package.json
│
├── requirements.txt       # Python dependencies
└── API_DOCUMENTATION.md  # Complete API documentation
```

## Security Features

- JWT token-based authentication
- Automatic token refresh
- Password validation
- Role-based permissions
- CSRF protection
- Numeric username validation
- Admin-only username/password editing

## Development Notes

### Adding New Features
1. Backend: Create models → serializers → views → URLs
2. Frontend: Create API calls → hooks/components → routes

### Database Migrations
After model changes:
```bash
python manage.py makemigrations
python manage.py migrate
```

### Testing API
Use Postman, Thunder Client, or Django REST Framework browsable API at:
`http://localhost:8000/api/`

## Troubleshooting

### CORS Errors
Ensure frontend URL is in `backend/backend/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]
```

### Media Files Not Loading
1. Check `MEDIA_ROOT` and `MEDIA_URL` in settings
2. Ensure media directories exist
3. In production, use proper media server (nginx, S3, etc.)

### Authentication Issues
1. Verify JWT tokens in localStorage
2. Check token expiration
3. Ensure user has correct role assigned

## Production Deployment

### Backend
1. Set `DEBUG = False`
2. Configure proper `ALLOWED_HOSTS`
3. Use PostgreSQL/MySQL instead of SQLite
4. Set up proper static/media file serving
5. Use gunicorn/uwsgi
6. Configure HTTPS

### Frontend
1. Build production bundle: `npm run build`
2. Serve with nginx or deploy to Vercel/Netlify
3. Update API_BASE_URL to production URL

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

MIT License

## Support

For issues and questions, please create an issue in the repository.

---

**Built with ❤️ for educational institutions**
# upsn_website
