# Parent Account Creation Flow

## Overview
Parents can only access the parent portal after the Principal/Admin creates an account for them using the email they provided during enrollment.

## Complete Flow

### Step 1: Parent Enrolls Child
1. Parent goes to `/enroll` (public enrollment form)
2. Fills out enrollment form including:
   - Student information
   - **Parent information** (Mother's email is REQUIRED, Father's email is optional)
   - Other required information
3. Submits enrollment application
4. Enrollment status: **PENDING**

### Step 2: Principal/Admin Reviews Enrollment
1. Principal/Admin logs in to `/admin/dashboard`
2. Views all enrollment applications
3. Reviews enrollment details at `/admin/enrollments/[id]`
4. Can see:
   - Student information
   - Parent information (including mother's and father's email)
   - All uploaded documents
5. Makes decision: **APPROVE** or **REJECT**

### Step 3: Create Parent Account (After Approval)
1. After approving enrollment, Principal/Admin sees "Create Account" button
2. Clicks "Create Account" button
3. System uses the **mother's email** from enrollment (primary email)
4. Creates parent user account with:
   - Email: Mother's email from enrollment
   - Password: `password123` (default, must be changed on first login)
   - Role: PARENT
   - Name: Combined father/mother names
5. Links the enrollment to the parent user account
6. Button changes to "✓ Created" badge

### Step 4: Parent Logs In
1. Parent receives credentials (email + default password)
2. Goes to `/parent/dashboard` or clicks "Parent Portal" on home page
3. Redirected to `/auth/signin` if not logged in
4. Logs in with:
   - Email: The email they provided during enrollment (mother's email)
   - Password: `password123`
5. Redirected to `/parent/dashboard`
6. Can view:
   - Student information
   - Bills and payments
   - School announcements
   - Class schedule
   - Academic performance
   - Attendance

## Email Priority

The system uses this priority for parent account creation:
1. **Mother's Email** (primary, required field)
2. Father's Email (optional, fallback)

## Current Implementation Status

### ✅ Already Working:
- Enrollment form collects mother's email (required) and father's email (optional)
- Admin dashboard shows all enrollments
- "Create Parent Account" button in admin dashboard
- API endpoint `/api/admin/create-parent-account` creates accounts
- Parent dashboard with fake data

### ⏳ To Be Enhanced:
- Show parent account status more clearly in enrollment list
- Show which email was used for the account
- Allow parent to change password on first login
- Email notification to parent with login credentials
- Link parent account to actual student data (after Phase 2)

## Database Relationships

```
Enrollment (1) -----> (1) User (Parent)
   |
   └─> userId field links to User.id
```

When parent account is created:
- `Enrollment.userId` is set to the new `User.id`
- This links the enrollment to the parent account

## Security Notes

1. **Default Password**: `password123` is temporary
   - Parents should be required to change it on first login
   - Consider implementing password reset functionality

2. **Email Verification**: Consider adding email verification
   - Send verification email when account is created
   - Require email verification before first login

3. **One Email, Multiple Children**: 
   - If same email is used for multiple enrollments
   - System links all enrollments to the same parent account
   - Parent can see all their children in the portal

## Future Enhancements

1. **Email Notifications**
   - Send email to parent when account is created
   - Include login credentials and instructions
   - Send password reset link

2. **Password Management**
   - Force password change on first login
   - Password reset functionality
   - Password strength requirements

3. **Multiple Children Support**
   - Parent dashboard shows all children
   - Switch between children
   - Aggregate view of all children's information

4. **Account Settings**
   - Update contact information
   - Change password
   - Notification preferences

## Testing

### Test Accounts

**Principal Account:**
- Email: `jeon@admin.com`
- Password: `password123`
- Can create parent accounts

**Parent Account (Test):**
- Email: `parent@test.com`
- Password: `password123`
- Already created for testing

### Test Flow:
1. Login as principal (`jeon@admin.com`)
2. Go to dashboard
3. Find an approved enrollment
4. Click "Create Account" button
5. Logout
6. Login as parent with the email from enrollment
7. View parent dashboard

## API Endpoints

### Create Parent Account
```
POST /api/admin/create-parent-account
Authorization: ADMIN or PRINCIPAL only

Body:
{
  "enrollmentId": "enr_123",
  "email": "parent@example.com"
}

Response:
{
  "success": true,
  "userId": "user_123",
  "email": "parent@example.com",
  "defaultPassword": "password123"
}
```

### Get Enrollments (with parent account status)
```
GET /api/enrollments
Authorization: Required

Response:
{
  "enrollments": [
    {
      "id": "enr_123",
      "userId": "user_123",  // null if no account created
      "hasParentAccount": true,
      "parentEmail": "parent@example.com",
      ...
    }
  ]
}
```
