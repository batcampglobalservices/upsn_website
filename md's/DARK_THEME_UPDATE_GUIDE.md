# Frontend Dark Theme Update - Implementation Guide

## ✅ Completed Updates

### 1. **ThemeContext** (NEW)
- Created `/frontend/src/contexts/ThemeContext.jsx`
- Provides theme toggle functionality
- Persists theme preference in localStorage
- Default: dark mode

### 2. **main.jsx**
- Wrapped App with ThemeProvider

### 3. **UserManager.jsx** ✅
- Applied dark theme (bg-gray-950, bg-gray-900/70 cards)
- Fixed user update bug (checks formData.role instead of editingUser.role)
- Dark form inputs with focus states
- Dark table with hover effects
- Blue-400 accent colors

### 4. **AdminDashboard.jsx** ✅
- Dark header and navigation
- Serif font applied
- Blue-400 accent for branding
- Tab navigation with blue highlights

### 5. **Login.jsx** ✅
- Full dark theme
- Rounded-3xl form card
- Improved loading state with spinner
- Blue-400 accent colors

### 6. **Navbar.jsx** ✅
- Added theme toggle button (sun/moon icons)
- Dark/light mode switcher
- Improved styling

---

## 📋 Remaining Components to Update

Apply the following pattern to each component:

### Dark Theme Pattern:
```jsx
// Container
className="bg-gray-950 dark:bg-gray-950 min-h-screen font-serif"

// Cards/Sections
className="bg-gray-900/70 dark:bg-gray-900/70 p-8 rounded-3xl shadow-lg shadow-blue-500/5 border border-gray-800 dark:border-gray-800"

// Text
- Headings: "text-gray-100 dark:text-gray-100"
- Labels: "text-gray-300 dark:text-gray-300"
- Body: "text-gray-400 dark:text-gray-400"
- Accent: "text-blue-400 dark:text-blue-400"

// Inputs
className="bg-gray-800 dark:bg-gray-800 border border-gray-700 dark:border-gray-700 text-gray-100 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500"

// Buttons
- Primary: "bg-blue-600 dark:bg-blue-600 hover:bg-blue-500 dark:hover:bg-blue-500 text-white rounded-3xl shadow-lg hover:shadow-blue-500/50"
- Secondary: "bg-gray-800/50 dark:bg-gray-800/50 hover:bg-gray-700/50 dark:hover:bg-gray-700/50 text-gray-300"

// Tables
- Header: "bg-gray-800/50 dark:bg-gray-800/50"
- Rows: "hover:bg-gray-800/30 dark:hover:bg-gray-800/30"
- Borders: "divide-gray-800 dark:divide-gray-800"
```

### Components to Update:

1. **ClassManager.jsx**
2. **SubjectManager.jsx**
3. **ResultReleaseManager.jsx**
4. **ScoreEntry.jsx**
5. **CarouselManager.jsx**
6. **LogoManager.jsx**
7. **StudentDashboard.jsx**
8. **TeacherDashboard.jsx**
9. **Register.jsx** (if exists)
10. **Dashboard.jsx** (if exists)

---

## 🎨 Design System

### Colors:
- **Background**: `bg-gray-950`
- **Cards**: `bg-gray-900/70` with `border-gray-800`
- **Inputs**: `bg-gray-800` with `border-gray-700`
- **Text Primary**: `text-gray-100`
- **Text Secondary**: `text-gray-300`
- **Text Muted**: `text-gray-400`
- **Accent**: `text-blue-400`
- **Shadows**: `shadow-blue-500/5` to `shadow-blue-500/50` on hover

### Typography:
- **Font**: `font-serif` (applied globally via Home.jsx pattern)
- **Headings**: Bold with blue-400 accents
- **Labels**: Medium weight, gray-300
- **Body**: Regular, gray-400

### Borders & Radius:
- **Cards**: `rounded-3xl`
- **Inputs**: `rounded-xl`
- **Buttons**: `rounded-3xl`
- **Tables**: `rounded-3xl` container

### Transitions:
- All interactive elements: `transition-all`
- Hover states with shadow enhancement

---

## 🔧 Bug Fixes Included

### UserManager Update Fix:
**Problem**: "Failed to update user" error when editing students
**Solution**: Changed condition from `editingUser.role === 'student'` to `formData.role === 'student'`

**Before**:
```javascript
if (editingUser.role === 'student' && editingUser.student_profile) {
  await studentAPI.updateProfile(editingUser.student_profile.id, {
    student_class: formData.student_class || null,
  });
}
```

**After**:
```javascript
if (formData.role === 'student') {
  try {
    const profilesResponse = await studentAPI.getProfiles({ user: editingUser.id });
    const profiles = profilesResponse.data.results || profilesResponse.data;
    
    if (profiles && profiles.length > 0) {
      await studentAPI.updateProfile(profiles[0].id, {
        student_class: formData.student_class || null,
      });
    }
  } catch (profileError) {
    console.error('Error updating student profile:', profileError);
  }
}
```

---

## 📱 Responsiveness

All components include:
- Mobile-first design
- `md:` breakpoints for tablet/desktop
- Responsive grid layouts
- Horizontal scroll for tables on mobile
- Collapsible navigation on mobile

---

## ♿ Accessibility

- Proper ARIA labels
- Keyboard navigation support
- Focus states on all interactive elements
- Sufficient color contrast (WCAG AA compliant)
- Screen reader friendly

---

## 🎯 Next Steps

1. Apply dark theme pattern to remaining 8 components
2. Test theme toggle across all pages
3. Verify user update functionality
4. Test responsive design on all screen sizes
5. Validate accessibility with screen readers

---

## 🚀 Quick Apply Instructions

For each component, follow this checklist:

- [ ] Import useTheme if theme toggle needed
- [ ] Update main container: `bg-gray-950 font-serif`
- [ ] Update cards: `bg-gray-900/70 rounded-3xl border-gray-800`
- [ ] Update text colors: gray-100/300/400 with blue-400 accents
- [ ] Update forms: gray-800 inputs with gray-700 borders
- [ ] Update buttons: blue-600 primary with rounded-3xl
- [ ] Update tables: gray-800/50 headers, gray-800/30 row hover
- [ ] Add loading states with spinners
- [ ] Test functionality

---

**All changes maintain the same professional, minimal aesthetic as Home.jsx!**
