# Parent Portal - Admin Features Required

## Overview
To make the parent portal work with real data, the following features need to be added to the admin/principal dashboard.

## Database Changes

### New Models Added to Schema

1. **Announcement Model**
   - Title, content, category, priority
   - Target audience (Parent, Student, All)
   - Publish and expiry dates
   - Categories: Academic, Event, Health, Library, General, Emergency

2. **Attendance Model**
   - Student ID, date, status
   - Time in/out
   - Status: Present, Absent, Late, Excused
   - Remarks field

3. **Grade Model**
   - Student ID, subject, quarter
   - Grade (numeric), remarks
   - Teacher name
   - School year

4. **Bill Model**
   - Student ID, invoice number
   - Description, amount, due date
   - Status: Pending, Paid, Overdue, Cancelled
   - Payment details (paid date, amount, method, receipt)

5. **ClassSchedule Model**
   - Class ID, day of week
   - Subject, start/end time
   - Teacher, room

## Admin Features to Implement

### 1. Announcements Management
**Location:** `/admin/announcements`

**Features:**
- Create new announcements
- Edit/delete existing announcements
- Set category (Academic, Event, Health, etc.)
- Set priority (High, Normal, Low)
- Set target audience (Parents, Students, All)
- Set publish and expiry dates
- View list of all announcements

**API Endpoints Needed:**
- `GET /api/announcements` - List all announcements
- `POST /api/announcements` - Create announcement
- `PATCH /api/announcements/[id]` - Update announcement
- `DELETE /api/announcements/[id]` - Delete announcement

### 2. Attendance Management
**Location:** `/admin/attendance` or within student detail page

**Features:**
- Mark daily attendance for students
- Bulk attendance marking by class
- Edit attendance records
- View attendance reports
- Filter by date, class, status
- Export attendance data

**API Endpoints Needed:**
- `GET /api/attendance` - List attendance records
- `POST /api/attendance` - Mark attendance
- `POST /api/attendance/bulk` - Bulk mark attendance
- `PATCH /api/attendance/[id]` - Update attendance
- `GET /api/attendance/student/[studentId]` - Get student attendance

### 3. Grades Management
**Location:** `/admin/grades` or within student detail page

**Features:**
- Input grades by subject and quarter
- Bulk grade entry by class
- Edit existing grades
- View grade reports
- Calculate general average
- Generate report cards

**API Endpoints Needed:**
- `GET /api/grades` - List grades
- `POST /api/grades` - Add grade
- `POST /api/grades/bulk` - Bulk add grades
- `PATCH /api/grades/[id]` - Update grade
- `GET /api/grades/student/[studentId]` - Get student grades
- `GET /api/grades/report/[studentId]` - Generate report card

### 4. Bills & Payments Management
**Location:** `/admin/billing`

**Features:**
- Create bills/invoices for students
- Record payments
- Mark bills as paid/overdue
- Generate invoice numbers automatically
- View payment history
- Send payment reminders
- Generate financial reports

**API Endpoints Needed:**
- `GET /api/bills` - List all bills
- `POST /api/bills` - Create bill
- `PATCH /api/bills/[id]` - Update bill
- `POST /api/bills/[id]/payment` - Record payment
- `GET /api/bills/student/[studentId]` - Get student bills
- `GET /api/bills/reports` - Financial reports

### 5. Class Schedule Management
**Location:** `/admin/classes/[id]/schedule`

**Features:**
- Create class schedules
- Set subjects, times, teachers, rooms
- Assign schedules to classes
- View weekly schedule
- Edit schedule entries
- Copy schedule to other classes

**API Endpoints Needed:**
- `GET /api/classes/[id]/schedule` - Get class schedule
- `POST /api/classes/[id]/schedule` - Add schedule entry
- `PATCH /api/schedule/[id]` - Update schedule entry
- `DELETE /api/schedule/[id]` - Delete schedule entry
- `POST /api/schedule/copy` - Copy schedule to another class

## Parent Portal API Endpoints

These endpoints will be used by the parent portal to fetch data:

1. **GET /api/parent/students** - Get parent's children
2. **GET /api/parent/announcements** - Get announcements for parents
3. **GET /api/parent/attendance/[studentId]** - Get student attendance
4. **GET /api/parent/grades/[studentId]** - Get student grades
5. **GET /api/parent/bills/[studentId]** - Get student bills
6. **GET /api/parent/schedule/[studentId]** - Get student's class schedule

## Implementation Priority

### Phase 1 (Essential)
1. Announcements Management
2. Class Schedule Management
3. Basic Attendance Tracking

### Phase 2 (Important)
4. Grades Management
5. Bills & Payments

### Phase 3 (Enhanced)
6. Reports and Analytics
7. Notifications
8. Payment Gateway Integration

## Migration Steps

1. Run migration: `npx prisma migrate dev --name add_parent_portal_features`
2. Generate Prisma client: `npx prisma generate`
3. Create API routes for each feature
4. Create admin UI components
5. Update parent portal to fetch real data
6. Test all features

## Notes

- All features should respect role-based access (ADMIN and PRINCIPAL only)
- Parent users should only see data for their own children
- Implement proper error handling and validation
- Add loading states and error messages
- Consider adding email notifications for important updates
