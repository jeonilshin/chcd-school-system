# Implementation Guide: Messaging & Assignments

## Status: Database Schema Updated ✓

The database has been updated with:
- Message and Conversation models
- Assignment model  
- TEACHER role added to Role enum
- Relations added to Teacher and Class models

## Next Steps

### 1. Create Messaging API Endpoints

Create these files:

**`src/app/api/conversations/route.ts`** - List and create conversations
**`src/app/api/conversations/[id]/route.ts`** - Get conversation details
**`src/app/api/messages/route.ts`** - Send messages
**`src/app/api/messages/[id]/read/route.ts`** - Mark messages as read

### 2. Create Assignment API Endpoints

**`src/app/api/assignments/route.ts`** - List and create assignments
**`src/app/api/assignments/[id]/route.ts`** - Get, update, delete assignments

### 3. Build UI Components

**For Parents:**
- `src/app/parent/messages/page.tsx` - Messages inbox
- `src/app/parent/assignments/page.tsx` - View assignments
- `src/components/message-list.tsx` - Conversation list
- `src/components/chat-interface.tsx` - Chat UI

**For Teachers:**
- `src/app/teacher/dashboard/page.tsx` - Teacher dashboard
- `src/app/teacher/messages/page.tsx` - Messages
- `src/app/teacher/assignments/page.tsx` - Manage assignments
- `src/components/assignment-form.tsx` - Create/edit assignments

**For Admins:**
- Update `src/components/teachers-management.tsx` - Add account creation
- `src/app/admin/messages/page.tsx` - Admin messages

### 4. Update Navigation

Add new menu items to:
- Parent layout
- Teacher layout (new)
- Admin layout

## Quick Start Commands

```bash
# The schema is already updated and pushed
# Now you can start building the features

# Create a teacher account via API:
POST /api/teachers/account
{
  "teacherId": "teacher-id",
  "email": "teacher@school.com",
  "password": "password123",
  "name": "Teacher Name"
}
```

## Sample Data

Run this to add sample teachers with accounts:
```bash
npx tsx prisma/seed-teachers.ts
```

## Architecture

### Messaging Flow
1. Parent/Teacher initiates conversation
2. System creates Conversation record
3. Messages are linked to conversation
4. Real-time updates via polling (every 5 seconds)
5. Unread count displayed in navigation

### Assignment Flow
1. Teacher creates assignment for their class
2. Assignment linked to class
3. Parents of students in that class can view
4. Due date reminders
5. Optional file attachments

## Security
- All endpoints check user role
- Parents can only message their child's teachers
- Teachers can only create assignments for their classes
- Admins have full access

## File Structure
```
src/
├── app/
│   ├── api/
│   │   ├── conversations/
│   │   ├── messages/
│   │   ├── assignments/
│   │   └── teachers/account/
│   ├── parent/
│   │   ├── messages/
│   │   └── assignments/
│   ├── teacher/
│   │   ├── dashboard/
│   │   ├── messages/
│   │   └── assignments/
│   └── admin/
│       └── messages/
└── components/
    ├── message-list.tsx
    ├── chat-interface.tsx
    ├── assignment-form.tsx
    └── assignment-card.tsx
```

## Testing

Test accounts after seeding:
- Parent: parent@test.com / password123
- Admin: admin@test.com / password123
- Teacher: (create via admin panel)

## Future Enhancements
- WebSocket for real-time messaging
- Push notifications
- File attachments in messages
- Group messaging
- Message search
- Archived conversations
