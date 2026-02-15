import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { requireAuth, requireRole, withAuth, withRole } from '@/lib/auth-middleware';

/**
 * Example API route demonstrating authentication middleware usage
 * 
 * This file shows different patterns for protecting API routes:
 * 1. Using requireAuth() for any authenticated user
 * 2. Using requireRole() for specific roles
 * 3. Using withAuth() wrapper for automatic error handling
 * 4. Using withRole() wrapper for role-based protection
 */

// Example 1: Basic authentication - any authenticated user can access
export const GET = withAuth(async (req: NextRequest) => {
  // User is guaranteed to be authenticated here
  const user = await requireAuth();
  
  return NextResponse.json({
    message: 'You are authenticated',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

// Example 2: Role-based protection - only admins and principals can access
export const POST = withRole(
  [Role.ADMIN, Role.PRINCIPAL],
  async (req: NextRequest) => {
    // User is guaranteed to have ADMIN or PRINCIPAL role here
    const user = await requireAuth();
    
    return NextResponse.json({
      message: 'You have admin or principal access',
      user: {
        id: user.id,
        role: user.role,
      },
    });
  }
);

// Example 3: Manual error handling (if you need custom logic)
export async function PATCH(req: NextRequest) {
  try {
    // Check authentication
    const user = await requireAuth();
    
    // Check role
    await requireRole([Role.ADMIN]);
    
    // Your business logic here
    return NextResponse.json({
      message: 'Admin action completed',
      userId: user.id,
    });
  } catch (error) {
    // Custom error handling
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.name === 'UnauthorizedError' ? 401 : 403 }
      );
    }
    throw error;
  }
}
