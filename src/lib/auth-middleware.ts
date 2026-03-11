import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from './auth';
import { Role } from '@prisma/client';

/**
 * Authentication and authorization middleware for API routes
 * Provides role-based access control and helper functions
 */

/**
 * Error response for unauthorized access
 */
export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Error response for forbidden access
 */
export class ForbiddenError extends Error {
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Get the current authenticated user from the session
 * Throws UnauthorizedError if user is not authenticated
 * 
 * @returns The authenticated user with id, email, name, and role
 * @throws UnauthorizedError if no session exists
 */
export async function requireAuth() {
  const session = await getServerSession();
  
  if (!session || !session.user) {
    throw new UnauthorizedError('Authentication required');
  }
  
  return session.user;
}

/**
 * Require that the authenticated user has one of the specified roles
 * Throws UnauthorizedError if not authenticated
 * Throws ForbiddenError if user doesn't have required role
 * 
 * @param allowedRoles - Array of roles that are allowed to access the resource
 * @returns The authenticated user if they have one of the allowed roles
 * @throws UnauthorizedError if not authenticated
 * @throws ForbiddenError if user doesn't have required role
 * 
 * @example
 * // In an API route - only allow admins and principals
 * const user = await requireRole([Role.ADMIN, Role.PRINCIPAL]);
 */
export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth();
  
  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError('Insufficient permissions');
  }
  
  return user;
}

/**
 * Check if the current user is authorized to access a resource
 * Returns true if user is authenticated and has one of the allowed roles
 * Returns false otherwise (does not throw errors)
 * 
 * @param allowedRoles - Array of roles that are allowed to access the resource
 * @returns true if user is authenticated and has required role, false otherwise
 * 
 * @example
 * // Check if user can approve enrollments
 * const canApprove = await isAuthorized([Role.ADMIN, Role.PRINCIPAL]);
 * if (canApprove) {
 *   // Show approve button
 * }
 */
export async function isAuthorized(allowedRoles: Role[]): Promise<boolean> {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return false;
    }
    
    return allowedRoles.includes(session.user.role);
  } catch (error) {
    return false;
  }
}

/**
 * Check if the current user owns a resource (by userId)
 * Returns true if user is authenticated and their id matches the ownerId
 * 
 * @param ownerId - The user ID of the resource owner
 * @returns true if current user owns the resource, false otherwise
 * 
 * @example
 * // Check if user owns an enrollment
 * const enrollment = await prisma.enrollment.findUnique({ where: { id } });
 * const isOwner = await isOwner(enrollment.userId);
 */
export async function isOwner(ownerId: string): Promise<boolean> {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return false;
    }
    
    return session.user.id === ownerId;
  } catch (error) {
    return false;
  }
}

/**
 * Check if user is authorized by role OR by ownership
 * Useful for resources that can be accessed by admins/principals OR the owner
 * 
 * @param allowedRoles - Array of roles that are allowed to access the resource
 * @param ownerId - The user ID of the resource owner
 * @returns true if user has required role OR is the owner, false otherwise
 * 
 * @example
 * // Allow admins, principals, or the parent who created the enrollment
 * const canAccess = await isAuthorizedOrOwner(
 *   [Role.ADMIN, Role.PRINCIPAL],
 *   enrollment.userId
 * );
 */
export async function isAuthorizedOrOwner(
  allowedRoles: Role[],
  ownerId: string
): Promise<boolean> {
  try {
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return false;
    }
    
    // Check if user has required role
    if (allowedRoles.includes(session.user.role)) {
      return true;
    }
    
    // Check if user is the owner
    return session.user.id === ownerId;
  } catch (error) {
    return false;
  }
}

/**
 * Require that user is authorized by role OR by ownership
 * Throws UnauthorizedError if not authenticated
 * Throws ForbiddenError if user doesn't have required role and is not the owner
 * 
 * @param allowedRoles - Array of roles that are allowed to access the resource
 * @param ownerId - The user ID of the resource owner
 * @returns The authenticated user if authorized
 * @throws UnauthorizedError if not authenticated
 * @throws ForbiddenError if not authorized
 * 
 * @example
 * // In an API route - allow admins, principals, or the enrollment owner
 * const user = await requireRoleOrOwner(
 *   [Role.ADMIN, Role.PRINCIPAL],
 *   enrollment.userId
 * );
 */
export async function requireRoleOrOwner(
  allowedRoles: Role[],
  ownerId?: string | null
) {
  const user = await requireAuth();
  
  // Check if user has required role
  if (allowedRoles.includes(user.role)) {
    return user;
  }
  
  // Check if user is the owner
  if (ownerId && user.id === ownerId) {
    return user;
  }
  
  throw new ForbiddenError('Insufficient permissions');
}

/**
 * Middleware wrapper for API routes that require authentication
 * Automatically handles authentication errors and returns appropriate responses
 * 
 * @param handler - The API route handler function
 * @returns Wrapped handler with authentication
 * 
 * @example
 * // In an API route
 * export const GET = withAuth(async (req: NextRequest) => {
 *   // User is guaranteed to be authenticated here
 *   const user = await requireAuth();
 *   return NextResponse.json({ user });
 * });
 */
export function withAuth(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
      }
      if (error instanceof ForbiddenError) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
      throw error;
    }
  };
}

/**
 * Middleware wrapper for API routes that require specific roles
 * Automatically handles authentication and authorization errors
 * 
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @param handler - The API route handler function
 * @returns Wrapped handler with role-based authorization
 * 
 * @example
 * // In an API route - only allow admins and principals
 * export const PATCH = withRole(
 *   [Role.ADMIN, Role.PRINCIPAL],
 *   async (req: NextRequest) => {
 *     // User is guaranteed to have ADMIN or PRINCIPAL role here
 *     return NextResponse.json({ success: true });
 *   }
 * );
 */
export function withRole(
  allowedRoles: Role[],
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return withAuth(async (req: NextRequest) => {
    await requireRole(allowedRoles);
    return handler(req);
  });
}
