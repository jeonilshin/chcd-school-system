# Authentication Middleware Documentation

This document describes the authentication and authorization middleware for the Student Enrollment System.

## Overview

The authentication middleware provides role-based access control (RBAC) for API routes. It includes helper functions for checking authentication, verifying roles, and protecting routes.

## Core Functions

### `requireAuth()`

Requires that the user is authenticated. Throws `UnauthorizedError` if not authenticated.

```typescript
import { requireAuth } from '@/lib/auth-middleware';

export async function GET(req: NextRequest) {
  const user = await requireAuth();
  // user is guaranteed to be authenticated here
  return NextResponse.json({ userId: user.id });
}
```

**Returns:** The authenticated user object with `id`, `email`, `name`, and `role`  
**Throws:** `UnauthorizedError` if not authenticated

---

### `requireRole(allowedRoles)`

Requires that the user has one of the specified roles. Throws `UnauthorizedError` if not authenticated, or `ForbiddenError` if the user doesn't have the required role.

```typescript
import { requireRole } from '@/lib/auth-middleware';
import { Role } from '@prisma/client';

export async function POST(req: NextRequest) {
  // Only admins and principals can access
  const user = await requireRole([Role.ADMIN, Role.PRINCIPAL]);
  
  // Perform admin action
  return NextResponse.json({ success: true });
}
```

**Parameters:**
- `allowedRoles: Role[]` - Array of roles that are allowed to access the resource

**Returns:** The authenticated user object  
**Throws:** 
- `UnauthorizedError` if not authenticated
- `ForbiddenError` if user doesn't have required role

---

### `isAuthorized(allowedRoles)`

Checks if the user is authorized (has one of the specified roles). Returns `true` or `false` without throwing errors.

```typescript
import { isAuthorized } from '@/lib/auth-middleware';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  const canApprove = await isAuthorized([Role.ADMIN, Role.PRINCIPAL]);
  
  return NextResponse.json({
    canApprove,
    message: canApprove ? 'You can approve enrollments' : 'View only',
  });
}
```

**Parameters:**
- `allowedRoles: Role[]` - Array of roles to check

**Returns:** `boolean` - `true` if authorized, `false` otherwise  
**Throws:** Never throws (returns `false` on errors)

---

### `isOwner(ownerId)`

Checks if the current user owns a resource (by comparing user ID with owner ID).

```typescript
import { isOwner } from '@/lib/auth-middleware';

export async function GET(req: NextRequest) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
  });
  
  const userOwnsEnrollment = await isOwner(enrollment.userId);
  
  if (!userOwnsEnrollment) {
    return NextResponse.json({ error: 'Not your enrollment' }, { status: 403 });
  }
  
  return NextResponse.json(enrollment);
}
```

**Parameters:**
- `ownerId: string` - The user ID of the resource owner

**Returns:** `boolean` - `true` if current user is the owner, `false` otherwise  
**Throws:** Never throws (returns `false` on errors)

---

### `isAuthorizedOrOwner(allowedRoles, ownerId)`

Checks if the user is authorized by role OR by ownership. Useful for resources that can be accessed by admins/principals OR the owner.

```typescript
import { isAuthorizedOrOwner } from '@/lib/auth-middleware';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
  });
  
  // Allow admins, principals, or the parent who created the enrollment
  const canAccess = await isAuthorizedOrOwner(
    [Role.ADMIN, Role.PRINCIPAL],
    enrollment.userId
  );
  
  if (!canAccess) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  return NextResponse.json(enrollment);
}
```

**Parameters:**
- `allowedRoles: Role[]` - Array of roles that are allowed
- `ownerId: string` - The user ID of the resource owner

**Returns:** `boolean` - `true` if authorized by role or ownership, `false` otherwise  
**Throws:** Never throws (returns `false` on errors)

---

### `requireRoleOrOwner(allowedRoles, ownerId)`

Requires that the user is authorized by role OR by ownership. Throws errors if not authorized.

```typescript
import { requireRoleOrOwner } from '@/lib/auth-middleware';
import { Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
  });
  
  // Throws error if user is not admin/principal and not the owner
  const user = await requireRoleOrOwner(
    [Role.ADMIN, Role.PRINCIPAL],
    enrollment.userId
  );
  
  return NextResponse.json(enrollment);
}
```

**Parameters:**
- `allowedRoles: Role[]` - Array of roles that are allowed
- `ownerId: string` - The user ID of the resource owner

**Returns:** The authenticated user object  
**Throws:**
- `UnauthorizedError` if not authenticated
- `ForbiddenError` if not authorized by role or ownership

---

## Middleware Wrappers

### `withAuth(handler)`

Wraps an API route handler to automatically handle authentication errors. Returns 401 for `UnauthorizedError` and 403 for `ForbiddenError`.

```typescript
import { withAuth, requireAuth } from '@/lib/auth-middleware';

export const GET = withAuth(async (req: NextRequest) => {
  const user = await requireAuth();
  return NextResponse.json({ user });
});
```

**Parameters:**
- `handler: (req: NextRequest) => Promise<NextResponse>` - The API route handler

**Returns:** Wrapped handler with automatic error handling

---

### `withRole(allowedRoles, handler)`

Wraps an API route handler to require specific roles. Automatically handles authentication and authorization errors.

```typescript
import { withRole } from '@/lib/auth-middleware';
import { Role } from '@prisma/client';

// Only admins and principals can access this route
export const POST = withRole(
  [Role.ADMIN, Role.PRINCIPAL],
  async (req: NextRequest) => {
    // User is guaranteed to have ADMIN or PRINCIPAL role here
    return NextResponse.json({ success: true });
  }
);
```

**Parameters:**
- `allowedRoles: Role[]` - Array of roles that are allowed
- `handler: (req: NextRequest) => Promise<NextResponse>` - The API route handler

**Returns:** Wrapped handler with role-based authorization

---

## Error Classes

### `UnauthorizedError`

Thrown when a user is not authenticated. Should result in a 401 response.

```typescript
throw new UnauthorizedError('Authentication required');
```

### `ForbiddenError`

Thrown when a user is authenticated but doesn't have permission. Should result in a 403 response.

```typescript
throw new ForbiddenError('Insufficient permissions');
```

---

## Usage Patterns

### Pattern 1: Simple Authentication

Any authenticated user can access:

```typescript
export const GET = withAuth(async (req: NextRequest) => {
  const user = await requireAuth();
  return NextResponse.json({ user });
});
```

### Pattern 2: Role-Based Access

Only specific roles can access:

```typescript
export const POST = withRole(
  [Role.ADMIN, Role.PRINCIPAL],
  async (req: NextRequest) => {
    // Admin/Principal only logic
    return NextResponse.json({ success: true });
  }
);
```

### Pattern 3: Owner or Admin Access

Resource owner or admins can access:

```typescript
export async function GET(req: NextRequest) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
  });
  
  const user = await requireRoleOrOwner(
    [Role.ADMIN, Role.PRINCIPAL],
    enrollment.userId
  );
  
  return NextResponse.json(enrollment);
}
```

### Pattern 4: Conditional UI Elements

Show/hide UI elements based on permissions:

```typescript
export async function GET(req: NextRequest) {
  const canApprove = await isAuthorized([Role.ADMIN, Role.PRINCIPAL]);
  const canEdit = await isOwner(resourceOwnerId);
  
  return NextResponse.json({
    showApproveButton: canApprove,
    showEditButton: canEdit,
  });
}
```

### Pattern 5: Manual Error Handling

When you need custom error handling:

```typescript
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireRole([Role.ADMIN]);
    // Your logic here
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      // Custom 401 handling
      return NextResponse.json(
        { error: 'Please log in', redirectTo: '/login' },
        { status: 401 }
      );
    }
    if (error instanceof ForbiddenError) {
      // Custom 403 handling
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    throw error;
  }
}
```

---

## Role Definitions

The system supports three roles:

- **`Role.PARENT`**: Can submit enrollments and view their own submissions
- **`Role.ADMIN`**: Can view all enrollments, approve/reject applications, access all documents
- **`Role.PRINCIPAL`**: Same permissions as ADMIN

---

## Best Practices

1. **Use wrapper functions when possible**: `withAuth()` and `withRole()` provide automatic error handling
2. **Check ownership for parent resources**: Parents should only access their own enrollments
3. **Use `isAuthorized()` for conditional logic**: When you need to check permissions without throwing errors
4. **Combine role and ownership checks**: Use `requireRoleOrOwner()` for resources that can be accessed by admins or owners
5. **Handle errors gracefully**: Provide clear error messages to users
6. **Test authorization logic**: Write tests for all authorization scenarios

---

## Testing

The middleware includes comprehensive unit tests covering:
- Authentication checks
- Role-based authorization
- Ownership verification
- Error handling
- Edge cases

Run tests with:
```bash
npm test src/test/auth-middleware.test.ts
```

---

## Requirements Validation

This middleware satisfies the following requirements:

- **Requirement 6.4**: Prevent unauthorized users from approving or rejecting applications
- **Requirement 7.4**: Redirect unauthenticated users to authentication
- **Requirement 7.5**: Deny access to parents attempting to access admin features
- **Requirement 8.2**: Verify authorization before serving documents
- **Requirement 8.4**: Deny access to unauthorized users attempting to access documents

---

## Example: Complete API Route

Here's a complete example of an enrollment detail API route:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { requireRoleOrOwner } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch the enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: params.id },
      include: { documents: true },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Check authorization: admins/principals or the parent who created it
    await requireRoleOrOwner(
      [Role.ADMIN, Role.PRINCIPAL],
      enrollment.userId
    );

    // Return the enrollment data
    return NextResponse.json(enrollment);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (error instanceof ForbiddenError) {
      return NextResponse.json(
        { error: 'You do not have permission to view this enrollment' },
        { status: 403 }
      );
    }
    
    console.error('Error fetching enrollment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```
