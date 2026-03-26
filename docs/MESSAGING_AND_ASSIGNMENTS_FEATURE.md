# Messaging, Assignments & Announcements Feature

## Overview
This document outlines the implementation of real-time messaging, assignment posting, and announcement features for the school management system.

## Features

### 1. Messaging System
Real-time chat between:
- **Parent ↔ Teacher**: Questions about assignments, student progress
- **Parent ↔ Admin**: Inquiries, payment discussions, general questions

**Key Features:**
- Real-time message delivery
- Conversation threads
- Read/unread status
- Message history
- User-friendly chat interface

### 2. Assignment Management
Teachers can:
- Create assignments for their classes
- Set due dates
- Attach files/resources
- Edit/delete assignments

Parents can:
- View assignments for their children's classes
- See due dates
- Download attachments
- Ask questions via messaging

### 3. Announcements
Teachers and Admins can:
- Post announcements to specific classes or school-wide
- Set priority levels (Low, Normal, High, Urgent)
- Schedule announcements
- Target specific audiences

Parents can:
- View announcements for their children's classes
- See school-wide announcements
- Filter by priority

### 4. Teacher Account Management
Admins can:
- Create teacher accounts with login credentials
- Assign teachers to classes
- Manage teacher profiles
- View teacher details

## Database Schema

### Message Model
```prisma
model Message {
  id              String   @id @default(cuid())
  conversationId  String
  senderId        String
  senderRole      Role
  content         String   @db.Text
  isRead          Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  Conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}
```

### Conversation Model
```prisma
model Conversation {
  id              String   @id @default(cuid())
  parentId        String
  recipientId     String
  recipientRole   Role
  subject         String?
  lastMessageAt   DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  Messages        Message[]
}
```

### Assignment Model
```prisma
model Assignment {
  id              String   @id @default(cuid())
  classId         String
  teacherId       String
  title           String
  description     String   @db.Text
  dueDate         DateTime?
  attachmentUrl   String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  Class           Class    @relation(fields: [classId], references: [id], onDelete: Cascade)
  Teacher         Teacher  @relation(fields: [teacherId], references: [id])
}
```

## Implementation Plan

### Phase 1: Teacher Account Management ✓
- [x] Update database schema
- [ ] Create teacher account creation API
- [ ] Add teacher login credentials
- [ ] Build teacher account management UI in admin panel

### Phase 2: Messaging System
- [ ] Create messaging API endpoints
- [ ] Build conversation list UI
- [ ] Build chat interface
- [ ] Implement real-time updates (polling or WebSocket)
- [ ] Add message notifications

### Phase 3: Assignment Management
- [ ] Create assignment API endpoints
- [ ] Build assignment creation UI for teachers
- [ ] Build assignment viewing UI for parents
- [ ] Add file upload for attachments

### Phase 4: Announcements
- [ ] Update announcement API for new features
- [ ] Build announcement creation UI
- [ ] Build announcement viewing UI
- [ ] Add priority filtering

## API Endpoints

### Messaging
- `GET /api/conversations` - List conversations
- `GET /api/conversations/[id]` - Get conversation with messages
- `POST /api/conversations` - Create new conversation
- `POST /api/messages` - Send message
- `PATCH /api/messages/[id]/read` - Mark as read

### Assignments
- `GET /api/assignments` - List assignments (filtered by class/teacher)
- `GET /api/assignments/[id]` - Get assignment details
- `POST /api/assignments` - Create assignment (teacher only)
- `PATCH /api/assignments/[id]` - Update assignment
- `DELETE /api/assignments/[id]` - Delete assignment

### Teacher Management
- `POST /api/teachers/account` - Create teacher account with credentials
- `GET /api/teachers/[id]/account` - Get teacher account details
- `PATCH /api/teachers/[id]/account` - Update teacher account

## UI Components

### For Parents
- Messages inbox
- Chat interface
- Assignment list
- Announcement feed

### For Teachers
- Messages inbox
- Chat interface
- Assignment management
- Announcement creation
- Class roster

### For Admins
- Messages inbox
- Teacher account management
- Announcement creation
- System-wide announcements

## Security Considerations
- Role-based access control
- Message encryption (future enhancement)
- File upload validation
- Rate limiting for messages
- Input sanitization

## Future Enhancements
- Push notifications
- Email notifications
- File attachments in messages
- Message search
- Archived conversations
- Group messaging
- Video/voice calls
