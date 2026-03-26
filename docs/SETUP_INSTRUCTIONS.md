# Setup Instructions for Messaging & Assignments

## ✅ What's Been Created

### API Endpoints (Complete)
- ✅ `/api/conversations` - List and create conversations
- ✅ `/api/conversations/[id]` - Get conversation details
- ✅ `/api/messages` - Send messages
- ✅ `/api/assignments` - List and create assignments
- ✅ `/api/assignments/[id]` - Get, update, delete assignments
- ✅ `/api/teachers/account` - Create teacher accounts

### Parent Pages (Complete)
- ✅ `/parent/messages` - Messaging interface
- ✅ `/parent/assignments` - View assignments

### Components (Complete)
- ✅ `parent-messaging.tsx` - Full chat interface
- ✅ `parent-assignments.tsx` - Assignment list

## 🔧 What You Need To Do

### Step 1: Add Navigation Links

Update the parent portal navigation to include the new pages.

**File to edit:** `src/app/parent/coming-soon/page.tsx` or create a parent layout

Add these links:
```tsx
<Link href="/parent/messages">Messages</Link>
<Link href="/parent/assignments">Assignments</Link>
```

### Step 2: Create Teacher Portal (Optional but Recommended)

Create these files:

**`src/app/teacher/dashboard/page.tsx`**
```tsx
'use client';

import { ProtectedRoute } from '@/components/protected-route';

export default function TeacherDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['TEACHER']}>
      <div className="p-8">
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        {/* Add teacher dashboard content */}
      </div>
    </ProtectedRoute>
  );
}
```

### Step 3: Add Teacher Account Creation to Admin Panel

Update `src/components/teachers-management.tsx` to add a button that creates teacher login accounts.

Add this function:
```tsx
const createTeacherAccount = async (teacherId: string) => {
  const response = await fetch('/api/teachers/account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      teacherId,
      email: `teacher${teacherId}@school.com`,
      password: 'password123',
      name: 'Teacher Name'
    })
  });
  // Handle response
};
```

### Step 4: Test the Features

1. **Login as parent** (`parent@test.com` / `password123`)
2. **Go to** `/parent/messages` - You should see the messaging interface
3. **Go to** `/parent/assignments` - You should see assignments (empty for now)

### Step 5: Create Sample Data

Run this to create a teacher with an account:

```bash
# First, create a teacher via the admin panel
# Then create their account via API or add to seed script
```

## 🎯 Quick Test Flow

1. **As Admin:**
   - Create a teacher
   - Create a teacher account for them
   - Assign teacher to a class

2. **As Teacher:**
   - Login with teacher credentials
   - Create an assignment for your class
   - Respond to parent messages

3. **As Parent:**
   - View assignments for your child's class
   - Send message to teacher or admin
   - Receive responses

## 📝 Next Steps (Optional Enhancements)

- [ ] Add real-time updates (WebSocket or polling)
- [ ] Add file attachments to messages
- [ ] Add push notifications
- [ ] Create teacher assignment management UI
- [ ] Add announcement system
- [ ] Add message search
- [ ] Add conversation archiving

## 🐛 Troubleshooting

**Messages not showing?**
- Check that conversations exist in database
- Verify user roles are correct
- Check browser console for errors

**Assignments not visible?**
- Ensure student is enrolled and approved
- Verify student has a classId
- Check that teacher created assignment for that class

**Can't create teacher account?**
- Verify you're logged in as ADMIN or PRINCIPAL
- Check that teacher exists in database
- Ensure email is unique

## 🔐 Security Notes

- All endpoints check user authentication
- Parents can only see their children's data
- Teachers can only manage their own classes
- Admins have full access
- Passwords are hashed with bcrypt

## 📱 Mobile Responsive

The messaging and assignment interfaces are responsive and work on mobile devices.

## 🎨 Theming

The components use the `useThemeColor` hook to match your school's branding colors set in Settings.
