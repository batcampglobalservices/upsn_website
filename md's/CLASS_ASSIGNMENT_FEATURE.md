# User Class Assignment Feature

## Date: October 13, 2025

## Overview
Added **class assignment** functionality to the user creation/edit process. When admins create or edit student accounts, they can now assign students to specific classes. This enables teachers to see students in their assigned classes.

---

## Features Added

### 1. **Class Selection in User Creation Form**
- ✅ New dropdown field for class assignment (visible only for students)
- ✅ Optional field - students can be created without a class
- ✅ Shows all available classes in the dropdown
- ✅ Helper text: "Assign student to a class so teachers can see them"

### 2. **Class Display in User Table**
- ✅ New "Class" column in the user management table
- ✅ Shows assigned class name for students
- ✅ Shows "-" for teachers and admins
- ✅ Displays "N/A" if no class assigned to student
- ✅ Color-coded: Blue text for assigned classes, gray for unassigned

### 3. **Edit Existing User's Class**
- ✅ Can edit a student's class assignment
- ✅ Pre-populates current class in edit form
- ✅ Can change or remove class assignment

### 4. **Backend Integration**
- ✅ Updated `UserSerializer` to include student profile data
- ✅ Returns `student_class` and `student_class_name` for students
- ✅ Auto-creates StudentProfile when creating student users
- ✅ Updates StudentProfile when editing users

---

## How to Use

### Creating a New Student with Class Assignment:

1. **Login as Admin**
   - Username: `1001`
   - Password: `admin123`

2. **Navigate to User Management**
   - Go to **Admin Dashboard**
   - Click **"User Management"** tab

3. **Click "Add New User"**

4. **Fill in User Details**:
   - **Username**: Enter numeric ID (e.g., `20241461`)
   - **Full Name**: Student's full name
   - **Role**: Select **"Student"** (triggers class dropdown)
   - **Class Assignment**: Select class from dropdown (Optional)
     - Shows all available classes
     - Can leave as "No Class Assigned"
   - **Email**: Optional email address
   - **Phone Number**: Optional phone
   - **Password**: Required for new users
   - **Confirm Password**: Must match password

5. **Click "Create User"**
   - User is created with assigned class
   - Student profile is automatically created
   - Class assignment is saved to student profile

### Editing a Student's Class:

1. **Find the Student**
   - In User Management table
   - Locate the student row

2. **Click "Edit"**
   - Form opens with current data
   - Class dropdown shows current assignment

3. **Change Class**
   - Select different class from dropdown
   - Or select "No Class Assigned" to remove

4. **Click "Update User"**
   - Class assignment is updated
   - Teacher will see student in new class

---

## User Interface

### Form - Student Role Selected:
```
┌─────────────────────────────────────────┐
│ Create New User                         │
├─────────────────────────────────────────┤
│ Username (Numeric ID):  [20241461]      │
│ Full Name:              [John Doe]      │
│ Role:                   [Student ▼]     │
│ Class Assignment:       [JSS1A ▼]       │ ← NEW FIELD
│   ℹ️ Assign student to a class so      │
│     teachers can see them               │
│ Email:                  [john@...]      │
│ Phone Number:           [080...]        │
│ Password:               [******]        │
│ Confirm Password:       [******]        │
│                                         │
│ [Create User]                           │
└─────────────────────────────────────────┘
```

### User Table with Class Column:
```
┌────────┬────────────┬────────┬────────┬────────┬────────┬─────────┐
│Username│ Full Name  │  Role  │ Class  │ Email  │ Status │ Actions │
├────────┼────────────┼────────┼────────┼────────┼────────┼─────────┤
│ 1001   │ Admin User │ Admin  │   -    │ admin@ │ Active │ [Edit]  │
│ 2001   │ John Teach │Teacher │   -    │ john@  │ Active │ [Edit]  │
│20241460│ Jane Stud  │Student │ JSS1A  │ jane@  │ Active │ [Edit]  │ ← Shows class
│20241461│ Bob Smith  │Student │  N/A   │ bob@   │ Active │ [Edit]  │ ← No class
└────────┴────────────┴────────┴────────┴────────┴────────┴─────────┘
```

---

## Technical Details

### Frontend Changes

#### `UserManager.jsx`:
1. **New State**:
   ```javascript
   const [classes, setClasses] = useState([]);
   // Added student_class to formData
   ```

2. **New Function**:
   ```javascript
   const fetchClasses = async () => {
     // Fetches all available classes
   }
   ```

3. **Updated handleSubmit**:
   ```javascript
   // On create: Creates user, then updates student profile with class
   // On edit: Updates user and student profile separately
   ```

4. **New Form Field** (conditional on role === 'student'):
   ```jsx
   <select name="student_class">
     <option value="">No Class Assigned</option>
     {classes.map(classItem => (
       <option value={classItem.id}>{classItem.name}</option>
     ))}
   </select>
   ```

5. **Updated Table**:
   - Added "Class" column header
   - Shows class name or "N/A" for students
   - Shows "-" for non-students

### Backend Changes

#### `accounts/serializers.py`:
1. **UserSerializer**:
   ```python
   student_profile = serializers.SerializerMethodField()
   
   def get_student_profile(self, obj):
       if obj.role == 'student':
           return {
               'id': profile.id,
               'student_class': profile.student_class.id,
               'student_class_name': profile.student_class.name,
               'admission_number': profile.admission_number,
           }
       return None
   ```

2. **Returns**:
   - `student_profile` object for students
   - Includes `student_class` ID and `student_class_name`
   - Returns `None` for teachers and admins

---

## API Endpoints Used

### Get All Classes:
```
GET /api/classes/
Response: List of all classes with id and name
```

### Create User:
```
POST /api/users/
Body: {
  username, full_name, role, email, 
  phone_number, password
}
Response: Created user object
```

### Update Student Profile:
```
PUT /api/student-profiles/{id}/
Body: {
  student_class: <class_id>
}
Response: Updated profile
```

### Get Student Profiles:
```
GET /api/student-profiles/?user={user_id}
Response: Student profile with class info
```

---

## Database Schema

### CustomUser Model:
```
username       VARCHAR(20)  UNIQUE
full_name      VARCHAR(200)
role           VARCHAR(20)  [admin, teacher, student]
email          VARCHAR      NULLABLE
phone_number   VARCHAR(15)  NULLABLE
...
```

### StudentProfile Model:
```
id                INTEGER   PRIMARY KEY
user_id           INTEGER   FOREIGN KEY → CustomUser
student_class_id  INTEGER   FOREIGN KEY → Class (NULLABLE) ← UPDATED
admission_number  VARCHAR(50)
guardian_name     VARCHAR(200)
...
```

---

## Benefits

### For Admins:
- ✅ **Organized Student Management** - Assign students to classes during creation
- ✅ **Bulk Organization** - Quickly see which students are in which classes
- ✅ **Flexibility** - Can create students without classes initially
- ✅ **Easy Updates** - Change student classes anytime via edit

### For Teachers:
- ✅ **See Their Students** - Students assigned to their class appear in class view
- ✅ **Better Organization** - Know which students they're responsible for
- ✅ **Score Entry** - Can enter test scores for students in their class
- ✅ **Class Management** - View student lists for their assigned classes

### For Students:
- ✅ **Proper Assignment** - Linked to the correct class from day one
- ✅ **Correct Results** - Results are associated with their class
- ✅ **Teacher Visibility** - Teachers can track their progress

---

## Testing Guide

### Test Case 1: Create Student with Class

```bash
1. Login as admin (1001/admin123)
2. Go to Admin Dashboard → User Management
3. Click "Add New User"
4. Enter:
   - Username: 20241462
   - Full Name: Test Student
   - Role: Student (class dropdown appears)
   - Class: Select JSS1A
   - Password: test123
   - Confirm Password: test123
5. Click "Create User"
6. Success message appears
7. Check table - should show "JSS1A" in Class column
8. Login as teacher assigned to JSS1A
9. Go to Teacher Dashboard → My Classes
10. Click on JSS1A
11. Verify "Test Student" appears in the list
```

### Test Case 2: Create Student without Class

```bash
1. Follow steps 1-4 from Test Case 1
2. For Class: Select "No Class Assigned"
3. Complete creation
4. Check table - should show "N/A" in Class column
5. Teacher won't see this student in any class list
```

### Test Case 3: Edit Student's Class

```bash
1. Login as admin
2. Find student with no class (shows "N/A")
3. Click "Edit"
4. Change Class dropdown to "JSS1A"
5. Click "Update User"
6. Success message appears
7. Table now shows "JSS1A"
8. Teacher can now see this student
```

### Test Case 4: Change Student's Class

```bash
1. Find student in JSS1A
2. Click "Edit"
3. Change class to "JSS2A"
4. Click "Update User"
5. Student moves to JSS2A
6. JSS1A teacher won't see student anymore
7. JSS2A teacher will see student
```

---

## Troubleshooting

### Issue: Class dropdown doesn't appear
**Solution**: Ensure "Student" is selected in Role dropdown. Field only shows for students.

### Issue: No classes in dropdown
**Solution**: 
1. Check that classes exist (Admin Dashboard → Class Management)
2. Create a class first if none exist
3. Refresh the page

### Issue: Student doesn't appear in teacher's class list
**Solution**:
1. Verify student is assigned to the class
2. Check that teacher is assigned to that same class
3. Refresh teacher dashboard

### Issue: Can't update student's class
**Solution**:
1. Ensure you're logged in as admin
2. Student profile must exist (auto-created for students)
3. Check browser console for errors

---

## Future Enhancements

### Planned Features:
- [ ] **Bulk Class Assignment** - Assign multiple students to a class at once
- [ ] **CSV Import** - Upload student list with class assignments
- [ ] **Class Transfer History** - Track when students change classes
- [ ] **Auto-Assignment Rules** - Auto-assign based on admission number pattern
- [ ] **Class Capacity Limits** - Set maximum students per class
- [ ] **Class Promotion** - Bulk promote students to next grade level

---

## Summary

### What Changed:
1. ✅ Added **Class Assignment** dropdown to user creation form (students only)
2. ✅ Added **Class** column to user management table
3. ✅ Updated backend serializer to return student profile with class info
4. ✅ Implemented class assignment on user creation
5. ✅ Implemented class update on user edit
6. ✅ Teachers can now see students assigned to their classes

### Files Modified:
- `frontend/src/components/UserManager.jsx` - Added class selection UI
- `backend/accounts/serializers.py` - Added student_profile to UserSerializer

### Impact:
- **Better Organization**: Students properly assigned to classes
- **Teacher Visibility**: Teachers see their students in class views
- **Seamless Integration**: Works with existing score entry and result systems
- **User-Friendly**: Simple dropdown interface for admins

---

**Feature is fully functional and ready to use!** 🎉
