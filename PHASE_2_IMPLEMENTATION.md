# Phase 2: Student Management Implementation

## Overview
Building a complete student management system that allows admins and principals to manage students, classes, and admissions.

## Database Models Added

### Student Model
- Stores active student records
- Links to enrollment (one-to-one)
- Links to class (many-to-one)
- Status: ACTIVE, INACTIVE, GRADUATED, TRANSFERRED, WITHDRAWN
- Includes personal info, parent info, and academic info

### Class Model
- Represents classes/sections (e.g., "Playschool AM - Section A")
- Links to teacher (class adviser)
- Has capacity limit
- Tracks students enrolled

## Features to Implement

### 1. Students List Page (`/admin/students`)
**For:** ADMIN & PRINCIPAL

**Features:**
- View all active students
- Filter by:
  - Status (Active, Inactive, Graduated, etc.)
  - Program (Playschool AM/PM, Nursery, Kinder)
  - Class
  - School Year
- Search by name or student ID
- Table columns:
  - Student ID
  - Name
  - Program
  - Class
  - Status
  - Parent Contact
  - Actions (View Details)

### 2. Student Details Page (`/admin/students/[id]`)
**For:** ADMIN & PRINCIPAL

**Tabs:**
- **Overview** - Personal info, parent info, profile picture
- **Academic** - Program, class, school year
- **Documents** - Uploaded documents from enrollment
- **History** - Enrollment history, class changes

**Actions:**
- Edit student information
- Change class
- Change status (Active/Inactive/etc.)
- View enrollment application

### 3. Classes Management (`/admin/classes`)
**For:** ADMIN & PRINCIPAL

**Features:**
- View all classes
- Create new class
- Edit class details
- Assign class teacher
- View class roster
- Set capacity

**Table columns:**
- Class Name
- Program
- School Year
- Teacher
- Students Enrolled / Capacity
- Actions

### 4. Class Details Page (`/admin/classes/[id]`)
**For:** ADMIN & PRINCIPAL

**Features:**
- Class information
- Class roster (list of students)
- Assign/remove students
- Change class teacher

### 5. Student Admission (`/admin/admissions`)
**For:** ADMIN & PRINCIPAL

**Features:**
- View approved enrollments ready for admission
- Convert enrollment to student record
- Assign student ID (auto-generated)
- Assign to class
- Set admission date

**Process:**
1. Select approved enrollment
2. Generate student ID
3. Select class to assign
4. Confirm admission
5. Create student record

## API Endpoints

### Students
- `GET /api/students` - List all students with filters
- `POST /api/students` - Create student (from enrollment)
- `GET /api/students/[id]` - Get student details
- `PATCH /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student (soft delete)
- `PATCH /api/students/[id]/status` - Change student status
- `PATCH /api/students/[id]/class` - Change student class

### Classes
- `GET /api/classes` - List all classes
- `POST /api/classes` - Create class
- `GET /api/classes/[id]` - Get class details
- `PATCH /api/classes/[id]` - Update class
- `DELETE /api/classes/[id]` - Delete class
- `GET /api/classes/[id]/roster` - Get class roster
- `POST /api/classes/[id]/students` - Add student to class
- `DELETE /api/classes/[id]/students/[studentId]` - Remove student from class

### Admissions
- `GET /api/admissions/pending` - Get approved enrollments ready for admission
- `POST /api/admissions/admit` - Admit student (create from enrollment)

## UI Components

### Students
- `students-list.tsx` - Main students table with filters
- `student-details.tsx` - Student profile page
- `student-form.tsx` - Edit student form
- `student-status-badge.tsx` - Status indicator

### Classes
- `classes-list.tsx` - Classes table
- `class-details.tsx` - Class roster and details
- `class-form.tsx` - Create/edit class form
- `class-roster.tsx` - List of students in class

### Admissions
- `admissions-list.tsx` - Pending admissions table
- `admission-form.tsx` - Admit student form

## Sidebar Navigation Update

```
📊 Dashboard
👥 Students
   - All Students
   - Admissions
🎓 Teachers (Principal only)
   - All Teachers
📚 Classes
   - All Classes
   - Create Class
```

## Implementation Steps

1. ✅ Create database models (Student, Class)
2. ⏳ Create API routes for students
3. ⏳ Create API routes for classes
4. ⏳ Create API routes for admissions
5. ⏳ Update sidebar navigation
6. ⏳ Create students list page
7. ⏳ Create student details page
8. ⏳ Create classes list page
9. ⏳ Create class details page
10. ⏳ Create admissions page

## Student ID Format
`STU-{YEAR}-{SEQUENTIAL}`

Example: `STU-2026-0001`, `STU-2026-0002`

## Notes
- Students are created from approved enrollments
- One enrollment = One student (one-to-one relationship)
- Students can be reassigned to different classes
- Class capacity is enforced when assigning students
- Student status can be changed (Active → Graduated, etc.)
