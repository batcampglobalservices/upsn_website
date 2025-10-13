# School Result Management System - API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
All protected endpoints require JWT authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### 1. Login
**POST** `/auth/login/`
- **Description**: Login with numeric username and password
- **Authentication**: None (public)
- **Request Body**:
```json
{
  "username": "12345",
  "password": "password123"
}
```
- **Response** (200):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "12345",
    "full_name": "John Doe",
    "role": "student",
    "email": "john@example.com",
    "phone_number": "08012345678",
    "profile_image": "http://localhost:8000/media/profiles/image.jpg"
  }
}
```

### 2. Register (Admin Only)
**POST** `/auth/register/`
- **Description**: Create new user
- **Authentication**: Admin only
- **Request Body**:
```json
{
  "username": "23456",
  "password": "password123",
  "confirm_password": "password123",
  "full_name": "Jane Smith",
  "role": "teacher",
  "email": "jane@example.com",
  "phone_number": "08098765432"
}
```

### 3. Refresh Token
**POST** `/auth/token/refresh/`
- **Description**: Refresh access token
- **Request Body**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 4. Get Profile
**GET** `/auth/profile/`
- **Description**: Get current user profile
- **Authentication**: Required

### 5. Update Profile
**PUT/PATCH** `/auth/profile/update/`
- **Description**: Update current user profile
- **Authentication**: Required
- **Note**: Only admins can update username and password

---

## User Management (Admin Only)

### 1. List Users
**GET** `/users/`
- **Query Params**: `role`, `is_active`, `search`

### 2. Get User
**GET** `/users/<id>/`

### 3. Create User
**POST** `/users/`

### 4. Update User
**PUT** `/users/<id>/`

### 5. Deactivate User
**POST** `/users/<id>/deactivate/`

### 6. Activate User
**POST** `/users/<id>/activate/`

---

## Class Management

### 1. List Classes
**GET** `/classes/`
- **Authentication**: Required
- **Access**: Admin (all), Teacher (assigned), Student (own class)

### 2. Get Class
**GET** `/classes/<id>/`

### 3. Create Class (Admin Only)
**POST** `/classes/`
- **Request Body**:
```json
{
  "name": "JSS1A",
  "level": "JSS1",
  "assigned_teacher": 2,
  "description": "Junior Secondary 1A"
}
```

### 4. Get Class Students
**GET** `/classes/<id>/students/`

---

## Subject Management

### 1. List Subjects
**GET** `/subjects/`
- **Query Params**: `assigned_class`, `assigned_teacher`

### 2. Create Subject (Admin Only)
**POST** `/subjects/`
- **Request Body**:
```json
{
  "name": "Mathematics",
  "code": "MATH101",
  "assigned_class": 1,
  "assigned_teacher": 2
}
```

---

## Academic Session Management

### 1. List Sessions
**GET** `/sessions/`

### 2. Get Active Session
**GET** `/sessions/active/`

### 3. Create Session (Admin Only)
**POST** `/sessions/`
- **Request Body**:
```json
{
  "name": "2024/2025",
  "start_date": "2024-09-01",
  "end_date": "2025-07-31",
  "is_active": true
}
```

---

## Result Management

### 1. List Results
**GET** `/results/`
- **Access**: Admin (all), Teacher (their class), Student (own results)
- **Query Params**: `student`, `subject`, `session`, `term`, `grade`

### 2. Create Result (Admin/Teacher)
**POST** `/results/`
- **Request Body**:
```json
{
  "student": 5,
  "subject": 1,
  "session": 1,
  "term": "first",
  "test_score": 25.5,
  "exam_score": 65.0,
  "teacher_comment": "Good performance"
}
```
- **Auto-calculated**: `total`, `grade`

### 3. Bulk Create Results (Admin/Teacher)
**POST** `/results/bulk_create/`
- **Request Body**:
```json
{
  "session": 1,
  "term": "first",
  "subject": 1,
  "results": [
    {
      "student_id": 5,
      "test_score": 25,
      "exam_score": 60,
      "teacher_comment": "Good"
    },
    {
      "student_id": 6,
      "test_score": 28,
      "exam_score": 65,
      "teacher_comment": "Excellent"
    }
  ]
}
```

### 4. Get My Results (Student)
**GET** `/results/my_results/`
- **Query Params**: `session`, `term`

---

## Result Summary Management

### 1. List Summaries
**GET** `/summaries/`
- **Query Params**: `student`, `session`, `term`

### 2. Generate Summary
**POST** `/summaries/generate_summary/`
- **Request Body**:
```json
{
  "student": 5,
  "session": 1,
  "term": "first"
}
```
- **Description**: Auto-calculates average, total subjects, and overall grade

### 3. Download Result PDF
**GET** `/summaries/<id>/pdf/`
- **Response**: PDF file download

### 4. Calculate Summary
**POST** `/summaries/<id>/calculate/`
- **Description**: Recalculate summary from results

---

## Media Management

### 1. List Carousel Images
**GET** `/media/carousel/`
- **Authentication**: None (public)

### 2. Get Active Carousel Images
**GET** `/media/carousel/active_images/`
- **Authentication**: None (public)

### 3. Create Carousel Image (Admin Only)
**POST** `/media/carousel/`
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `image`: File
  - `title`: String
  - `caption`: String
  - `order`: Integer
  - `is_active`: Boolean

### 4. Delete Carousel Image (Admin Only)
**DELETE** `/media/carousel/<id>/`

### 5. Get Active Logo
**GET** `/media/logo/active_logo/`
- **Authentication**: None (public)

### 6. Upload/Update Logo (Admin Only)
**POST** `/media/logo/`
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `logo`: File
  - `title`: String
  - `is_active`: Boolean

---

## Grading System

- **A**: 70-100 (Excellent)
- **B**: 60-69 (Very Good)
- **C**: 50-59 (Good)
- **D**: 45-49 (Pass)
- **F**: 0-44 (Fail)

## Score Distribution

- **Test Score**: 0-30
- **Exam Score**: 0-70
- **Total**: 0-100 (auto-calculated)

---

## Frontend Integration Guide

### 1. Install Dependencies
```bash
npm install axios jwt-decode
```

### 2. Configure API Base URL
Update `frontend/src/api/axios.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

### 3. Login Flow
```javascript
import { useAuth } from './hooks/useAuth';

const { login } = useAuth();
const result = await login(username, password);

if (result.success) {
  // Redirect based on role
  if (result.user.role === 'admin') navigate('/admin-dashboard');
  else if (result.user.role === 'teacher') navigate('/teacher-dashboard');
  else navigate('/student-dashboard');
}
```

### 4. Fetch Data
```javascript
import { useFetchData } from './hooks/useData';

const { data, loading, error } = useFetchData('/classes/');
```

### 5. Submit Form
```javascript
import { useSubmitForm } from './hooks/useData';

const { submitForm, loading } = useSubmitForm();
const result = await submitForm('POST', '/users/', userData);
```

---

## Running the Application

### Backend (Django)
```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

Access:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173 (or 3000)
- Admin Panel: http://localhost:8000/admin

---

## Default Admin Setup

After running migrations, create a superuser:
```bash
python manage.py createsuperuser
```

Then update the user role to 'admin' via Django admin panel or shell:
```python
from accounts.models import CustomUser
user = CustomUser.objects.get(username='admin_username')
user.role = 'admin'
user.save()
```

---

## CORS Configuration

The backend is configured to accept requests from:
- http://localhost:3000
- http://localhost:5173
- http://127.0.0.1:3000
- http://127.0.0.1:5173

To add more origins, update `backend/backend/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://your-domain.com",
]
```
