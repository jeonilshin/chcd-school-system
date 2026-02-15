# Teacher Management Feature

## Overview
The Teacher Management feature is exclusive to the PRINCIPAL role, providing a distinct capability that differentiates Principals from Admins.

## Role Differences

### ADMIN Role
- View and manage student enrollments
- Approve/reject enrollment applications
- Create parent accounts
- View all documents and submissions

### PRINCIPAL Role
All ADMIN capabilities PLUS:
- **Manage Teachers** - Add, edit, delete, and view teacher records
- Access to Teachers Management page at `/principal/teachers`

## Teacher Management Features

### View Teachers
- List all teachers in a table format
- Search by name, employee ID, subject, or class
- Select multiple teachers with checkboxes
- View teacher profile pictures

### Add New Teacher
Required fields:
- Full Name
- Employee ID (unique)
- Email (unique)
- Phone
- Address
- Subject (Mathematics, English, Physics, Literature, Science, History, Arts)
- Class (e.g., 01, 02, 03)
- Profile Picture URL (optional)

### Edit Teacher
- Update any teacher information
- Employee ID cannot be changed after creation

### Delete Teacher
- Remove teacher records
- Confirmation required before deletion

## API Endpoints

### GET /api/teachers
Get all teachers (Principal only)

Query parameters:
- `search` - Search by name or employee ID
- `subject` - Filter by subject
- `class` - Filter by class

### POST /api/teachers
Create a new teacher (Principal only)

Request body:
```json
{
  "name": "John Doe",
  "email": "john@school.com",
  "phone": "+123456789",
  "address": "123 Main St",
  "subject": "Mathematics",
  "class": "01",
  "employeeId": "0001",
  "profileUrl": "https://..."
}
```

### GET /api/teachers/[id]
Get a specific teacher (Principal only)

### PATCH /api/teachers/[id]
Update a teacher (Principal only)

### DELETE /api/teachers/[id]
Delete a teacher (Principal only)

## Database Schema

```prisma
model Teacher {
  id          String   @id
  name        String
  email       String   @unique
  phone       String
  address     String
  subject     String
  class       String
  employeeId  String   @unique
  profileUrl  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([employeeId])
  @@index([subject])
}
```

## Seeding Sample Data

To add sample teachers to the database:

```bash
npx tsx prisma/seed-teachers.ts
```

This will create 5 sample teachers with different subjects and classes.

## Access Control

All teacher management endpoints are protected with:
```typescript
await requireRole([Role.PRINCIPAL]);
```

Only users with the PRINCIPAL role can:
- Access `/principal/teachers` page
- Call any `/api/teachers/*` endpoints
- View, create, edit, or delete teacher records

Admins attempting to access these features will receive a 403 Forbidden error.

## UI Components

### TeachersManagement Component
Location: `src/components/teachers-management.tsx`

Features:
- Responsive table layout
- Search functionality
- Bulk selection with checkboxes
- Add/Edit modal dialog
- Delete confirmation
- Profile picture display

### Teachers Page
Location: `src/app/principal/teachers/page.tsx`

Protected route that renders the TeachersManagement component.

## Navigation

Principals will see a "Manage Teachers" button on their dashboard that links to the teachers management page.

## Future Enhancements

Potential features to add:
- Teacher attendance tracking
- Class assignment management
- Performance reviews
- Document uploads for teachers
- Teacher schedules
- Subject-specific permissions
