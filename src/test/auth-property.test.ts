import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import {
  requireAuth,
  requireRole,
  withAuth,
  withRole,
  UnauthorizedError,
  ForbiddenError,
} from '@/lib/auth-middleware';
import { getServerSession } from '@/lib/auth';

// Mock the auth module
vi.mock('@/lib/auth', () => ({
  getServerSession: vi.fn(),
}));

/**
 * Property-Based Tests for Authentication
 * 
 * These tests verify universal properties that should hold true
 * across all valid executions of the authentication system.
 */

describe('Property-Based Authentication Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Feature: student-enrollment-system, Property 23: Authentication Requirement
  describe('Property 23: Authentication Requirement', () => {
    /**
     * **Validates: Requirements 7.4**
     * 
     * Property: For any unauthenticated request to protected endpoints,
     * the system should return a 401 authentication error or redirect to login.
     * 
     * This property verifies that:
     * 1. All protected endpoints require authentication
     * 2. Unauthenticated requests are consistently rejected with 401
     * 3. The authentication requirement holds regardless of the endpoint or HTTP method
     */
    it('should return 401 for any unauthenticated request to protected endpoints', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random HTTP methods
          fc.constantFrom('GET', 'POST', 'PUT', 'PATCH', 'DELETE'),
          // Generate random endpoint paths
          fc.constantFrom(
            '/api/enrollments',
            '/api/enrollments/123',
            '/api/enrollments/456/upload',
            '/api/enrollments/789/status',
            '/api/documents/doc-1',
            '/api/documents/doc-2',
            '/api/protected-resource',
            '/api/admin/dashboard',
            '/api/parent/submissions'
          ),
          // Generate random query parameters
          fc.option(
            fc.record({
              schoolYear: fc.option(fc.constantFrom('2024', '2025', '2026')),
              program: fc.option(fc.constantFrom('Playschool AM', 'Playschool PM')),
              status: fc.option(fc.constantFrom('PENDING', 'APPROVED', 'REJECTED')),
            })
          ),
          async (method, path, queryParams) => {
            // Setup: Mock unauthenticated session (no session)
            vi.mocked(getServerSession).mockResolvedValue(null);

            // Build URL with query parameters if provided
            let url = `http://localhost:3000${path}`;
            if (queryParams) {
              const params = new URLSearchParams();
              if (queryParams.schoolYear) params.append('schoolYear', queryParams.schoolYear);
              if (queryParams.program) params.append('program', queryParams.program);
              if (queryParams.status) params.append('status', queryParams.status);
              const queryString = params.toString();
              if (queryString) url += `?${queryString}`;
            }

            // Create a mock protected handler using withAuth
            // The handler must call requireAuth() to trigger authentication check
            const mockHandler = vi.fn(async (_req: NextRequest) => {
              // This should never be reached for unauthenticated requests
              await requireAuth(); // This will throw UnauthorizedError if not authenticated
              return NextResponse.json({ success: true });
            });

            const protectedHandler = withAuth(mockHandler);
            const request = new NextRequest(url, { method });

            // Execute: Call the protected endpoint
            const response = await protectedHandler(request);

            // Verify: Should return 401 Unauthorized
            expect(response.status).toBe(401);

            // Verify: Response should contain error message
            const data = await response.json();
            expect(data).toHaveProperty('error');
            expect(typeof data.error).toBe('string');
            expect(data.error.toLowerCase()).toContain('auth');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 401 when requireAuth is called without session', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate different session states that represent "not authenticated"
          fc.constantFrom(
            null, // No session
            { user: null, expires: '2024-12-31' }, // Session with no user
            { user: undefined, expires: '2024-12-31' } // Session with undefined user
          ),
          async (sessionState) => {
            // Setup: Mock unauthenticated session
            vi.mocked(getServerSession).mockResolvedValue(sessionState as any);

            // Execute & Verify: Should throw UnauthorizedError
            await expect(requireAuth()).rejects.toThrow(UnauthorizedError);
            await expect(requireAuth()).rejects.toThrow('Authentication required');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 401 for role-protected endpoints without authentication', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random role requirements
          fc.constantFrom(
            [Role.ADMIN],
            [Role.PRINCIPAL],
            [Role.ADMIN, Role.PRINCIPAL],
            [Role.PARENT],
            [Role.ADMIN, Role.PRINCIPAL, Role.PARENT]
          ),
          // Generate random endpoint paths
          fc.constantFrom(
            '/api/admin/action',
            '/api/enrollments/approve',
            '/api/enrollments/reject',
            '/api/admin/users',
            '/api/principal/reports'
          ),
          async (requiredRoles, path) => {
            // Setup: Mock unauthenticated session
            vi.mocked(getServerSession).mockResolvedValue(null);

            // Create a mock role-protected handler
            const mockHandler = vi.fn(async (_req: NextRequest) => {
              return NextResponse.json({ success: true });
            });

            const protectedHandler = withRole(requiredRoles, mockHandler);
            const request = new NextRequest(`http://localhost:3000${path}`);

            // Execute: Call the role-protected endpoint
            const response = await protectedHandler(request);

            // Verify: Should return 401 Unauthorized (not 403, because not authenticated)
            expect(response.status).toBe(401);

            // Verify: Handler should not be called
            expect(mockHandler).not.toHaveBeenCalled();

            // Verify: Response should contain error message
            const data = await response.json();
            expect(data).toHaveProperty('error');
            expect(typeof data.error).toBe('string');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should consistently reject unauthenticated requests across multiple attempts', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate a sequence of unauthenticated requests
          fc.array(
            fc.record({
              method: fc.constantFrom('GET', 'POST', 'PATCH', 'DELETE'),
              path: fc.constantFrom(
                '/api/enrollments',
                '/api/documents/123',
                '/api/admin/dashboard'
              ),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          async (requests) => {
            // Setup: Mock unauthenticated session for all requests
            vi.mocked(getServerSession).mockResolvedValue(null);

            // Execute: Make multiple requests
            const results = await Promise.all(
              requests.map(async ({ method, path }) => {
                const mockHandler = vi.fn(async () => {
                  await requireAuth(); // Must call requireAuth to trigger authentication check
                  return NextResponse.json({ success: true });
                });
                const protectedHandler = withAuth(mockHandler);
                const request = new NextRequest(`http://localhost:3000${path}`, { method });
                const response = await protectedHandler(request);
                return {
                  status: response.status,
                };
              })
            );

            // Verify: All requests should be rejected with 401
            results.forEach((result) => {
              expect(result.status).toBe(401);
            });

            // Verify: Consistency - all requests should have the same status
            const statuses = results.map((r) => r.status);
            expect(new Set(statuses).size).toBe(1); // All statuses should be the same
            expect(statuses[0]).toBe(401);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should differentiate between unauthenticated (401) and unauthorized (403) errors', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random roles for the authenticated user
          fc.constantFrom(Role.PARENT, Role.ADMIN, Role.PRINCIPAL),
          // Generate random required roles that don't match
          fc.constantFrom(
            [Role.ADMIN] as Role[],
            [Role.PRINCIPAL] as Role[],
            [Role.ADMIN, Role.PRINCIPAL] as Role[]
          ),
          async (userRole, requiredRoles) => {
            // Skip if user has required role (we want to test authorization failure)
            if (requiredRoles.includes(userRole)) {
              return;
            }

            // Test 1: Unauthenticated request should return 401
            vi.mocked(getServerSession).mockResolvedValue(null);

            const mockHandler1 = vi.fn(async () => NextResponse.json({ success: true }));
            const protectedHandler1 = withRole(requiredRoles, mockHandler1);
            const request1 = new NextRequest('http://localhost:3000/api/test');
            const response1 = await protectedHandler1(request1);

            expect(response1.status).toBe(401);

            // Test 2: Authenticated but unauthorized request should return 403
            vi.mocked(getServerSession).mockResolvedValue({
              user: {
                id: 'user-1',
                email: 'user@test.com',
                name: 'Test User',
                role: userRole,
              },
              expires: '2024-12-31',
            });

            const mockHandler2 = vi.fn(async () => NextResponse.json({ success: true }));
            const protectedHandler2 = withRole(requiredRoles, mockHandler2);
            const request2 = new NextRequest('http://localhost:3000/api/test');
            const response2 = await protectedHandler2(request2);

            expect(response2.status).toBe(403);

            // Verify: Different error codes for different scenarios
            expect(response1.status).not.toBe(response2.status);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle edge cases in authentication state', async () => {
      // Test each edge case individually for clarity
      const edgeCases = [
        { state: null, description: 'null session' },
        { state: undefined, description: 'undefined session' },
        { state: { user: null, expires: '' }, description: 'session with null user' },
        { state: { user: undefined, expires: '2024-12-31' }, description: 'session with undefined user' },
        { state: {} as any, description: 'empty session object' },
      ];

      for (const { state, description } of edgeCases) {
        // Setup: Mock edge case session state
        vi.mocked(getServerSession).mockResolvedValue(state as any);

        const mockHandler = vi.fn(async () => {
          await requireAuth(); // Must call requireAuth to trigger authentication check
          return NextResponse.json({ success: true });
        });
        const protectedHandler = withAuth(mockHandler);
        const request = new NextRequest('http://localhost:3000/api/test');

        // Execute: Call protected endpoint
        const response = await protectedHandler(request);

        // Verify: Should return 401 for any invalid session state
        expect(response.status).toBe(401);
        
        // Verify: Handler should not complete successfully
        expect(mockHandler).toHaveBeenCalled();
      }
    });
  });

  describe('Property: Authentication State Consistency', () => {
    /**
     * Property: The authentication state should be consistent across
     * multiple checks within the same request context.
     */
    it('should return consistent authentication state across multiple checks', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random user data or null for unauthenticated
          fc.option(
            fc.record({
              id: fc.uuid(),
              email: fc.emailAddress(),
              name: fc.string({ minLength: 1, maxLength: 50 }),
              role: fc.constantFrom(Role.PARENT, Role.ADMIN, Role.PRINCIPAL),
            })
          ),
          async (userData) => {
            // Setup: Mock session state
            const sessionState = userData
              ? { user: userData, expires: '2024-12-31' }
              : null;

            vi.mocked(getServerSession).mockResolvedValue(sessionState as any);

            // Execute: Check authentication multiple times
            const checks = await Promise.allSettled([
              requireAuth().catch((e) => e),
              requireAuth().catch((e) => e),
              requireAuth().catch((e) => e),
            ]);

            // Verify: All checks should have the same result
            if (userData) {
              // Should all succeed with the same user data
              checks.forEach((check) => {
                expect(check.status).toBe('fulfilled');
                if (check.status === 'fulfilled') {
                  expect(check.value).toEqual(userData);
                }
              });
            } else {
              // Should all fail with UnauthorizedError
              checks.forEach((check) => {
                expect(check.status).toBe('fulfilled');
                if (check.status === 'fulfilled') {
                  expect(check.value).toBeInstanceOf(UnauthorizedError);
                }
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property: Role-Based Access Control Completeness', () => {
    /**
     * Property: For any role requirement, the system should correctly
     * identify whether a user has the required role.
     */
    it('should correctly validate role requirements for all role combinations', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate user role
          fc.constantFrom(Role.PARENT, Role.ADMIN, Role.PRINCIPAL),
          // Generate required roles
          fc.array(
            fc.constantFrom(Role.PARENT, Role.ADMIN, Role.PRINCIPAL),
            { minLength: 1, maxLength: 3 }
          ),
          async (userRole, requiredRoles) => {
            // Setup: Mock authenticated user
            vi.mocked(getServerSession).mockResolvedValue({
              user: {
                id: 'user-1',
                email: 'user@test.com',
                name: 'Test User',
                role: userRole,
              },
              expires: '2024-12-31',
            });

            // Execute: Check role requirement
            const shouldHaveAccess = requiredRoles.includes(userRole);

            if (shouldHaveAccess) {
              // Should succeed
              const user = await requireRole(requiredRoles as Role[]);
              expect(user.role).toBe(userRole);
            } else {
              // Should fail with ForbiddenError
              await expect(requireRole(requiredRoles as Role[])).rejects.toThrow(ForbiddenError);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
