/**
 * Property-Based Tests for Role-Based Access Control
 * 
 * Tests role permission properties:
 * - Property 20: Unauthorized Status Change Prevention
 * - Property 21: Parent Role Permissions
 * - Property 22: Admin and Principal Role Permissions
 * - Property 26: Parent Submission Visibility
 * 
 * Validates: Requirements 6.4, 7.1, 7.2, 7.3, 7.5, 9.1, 9.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { prisma } from '@/lib/prisma';
import { GET as GetEnrollments } from '@/app/api/enrollments/route';
import { POST as CreateEnrollment } from '@/app/api/enrollments/route';
import { PATCH as UpdateEnrollmentStatus } from '@/app/api/enrollments/[id]/status/route';
import { NextRequest } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth-middleware';
import { Role, EnrollmentStatus } from '@prisma/client';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    enrollment: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('@/lib/auth-middleware', () => ({
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
}));

describe('Role-Based Access Control Property Tests', () => {
  const mockAdminUser = {
    id: 'admin_123',
    email: 'admin@test.com',
    name: 'Test Admin',
    role: Role.ADMIN,
  };

  const mockPrincipalUser = {
    id: 'principal_123',
    email: 'principal@test.com',
    name: 'Test Principal',
    role: Role.PRINCIPAL,
  };

  const mockParentUser = {
    id: 'parent_123',
    email: 'parent@test.com',
    name: 'Test Parent',
    role: Role.PARENT,
  };

  const mockOtherParentUser = {
    id: 'other_parent_456',
    email: 'other@test.com',
    name: 'Other Parent',
    role: Role.PARENT,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===== GENERATORS =====

  const schoolYearGenerator = fc.constantFrom('2024', '2025', '2026', '2027');
  const programGenerator = fc.constantFrom('Playschool AM', 'Playschool PM', 'Nursery', 'Kindergarten');
  const studentStatusGenerator = fc.constantFrom('OLD_STUDENT', 'NEW_STUDENT');
  const enrollmentStatusGenerator = fc.constantFrom<EnrollmentStatus>('PENDING', 'APPROVED', 'REJECTED');

  const enrollmentGenerator = fc.record({
    id: fc.uuid(),
    userId: fc.uuid(),
    schoolYear: schoolYearGenerator,
    program: programGenerator,
    studentStatus: studentStatusGenerator,
    status: enrollmentStatusGenerator,
    firstName: fc.string({ minLength: 1, maxLength: 50 }),
    lastName: fc.string({ minLength: 1, maxLength: 50 }),
    middleName: fc.string({ minLength: 1, maxLength: 50 }),
    createdAt: fc.date({ min: new Date('2024-01-01'), max: new Date() }),
    updatedAt: fc.date({ min: new Date('2024-01-01'), max: new Date() }),
  });

  // Generator for non-empty strings (no whitespace-only strings)
  const nonEmptyStringGenerator = (minLength: number, maxLength: number) =>
    fc.string({ minLength, maxLength })
      .filter(s => s.trim().length >= minLength)
      .map(s => s.trim().length > 0 ? s.trim() : 'A'.repeat(minLength));

  // Generator for personal info with conditional citizenship validation
  const personalInfoGenerator = fc.constantFrom('FILIPINO', 'FOREIGNER').chain(citizenship => {
    return fc.record({
      lastName: nonEmptyStringGenerator(2, 50),
      firstName: nonEmptyStringGenerator(2, 50),
      middleName: nonEmptyStringGenerator(2, 50),
      nameExtension: fc.option(fc.constantFrom('Jr.', 'Sr.', 'III'), { nil: null }),
      nickname: nonEmptyStringGenerator(2, 30),
      sex: fc.constantFrom('FEMALE', 'MALE'),
      age: fc.integer({ min: 2, max: 6 }),
      birthday: fc.date({ min: new Date('2018-01-01'), max: new Date('2022-12-31') }).map(d => d.toISOString()),
      placeOfBirth: nonEmptyStringGenerator(2, 50),
      religion: nonEmptyStringGenerator(2, 50),
      presentAddress: nonEmptyStringGenerator(10, 100),
      contactNumber: fc.constantFrom('09171234567', '09181234567'),
      citizenship: fc.constant(citizenship),
      citizenshipSpecification: citizenship === 'FOREIGNER' 
        ? nonEmptyStringGenerator(2, 50) 
        : fc.option(nonEmptyStringGenerator(2, 50), { nil: null }),
    });
  });

  const validEnrollmentDataGenerator = fc.record({
    schoolYear: schoolYearGenerator,
    program: programGenerator,
    studentStatus: studentStatusGenerator,
    profilePictureUrl: fc.constant('https://example.com/profile.jpg'),
    personalInfo: personalInfoGenerator,
    parentInfo: fc.record({
      fatherFullName: nonEmptyStringGenerator(2, 50),
      fatherOccupation: fc.option(nonEmptyStringGenerator(2, 50), { nil: null }),
      fatherContactNumber: fc.constantFrom('09171234567', '09181234567'),
      fatherEmail: fc.option(fc.emailAddress(), { nil: null }),
      fatherEducationalAttainment: fc.constantFrom('ELEMENTARY_GRADUATE', 'HIGH_SCHOOL_GRADUATE', 'COLLEGE_GRADUATE'),
      motherFullName: nonEmptyStringGenerator(2, 50),
      motherOccupation: fc.option(nonEmptyStringGenerator(2, 50), { nil: null }),
      motherContactNumber: fc.constantFrom('09171234567', '09181234567'),
      motherEmail: fc.emailAddress(),
      motherEducationalAttainment: fc.constantFrom('ELEMENTARY_GRADUATE', 'HIGH_SCHOOL_GRADUATE', 'COLLEGE_GRADUATE'),
      maritalStatus: fc.array(fc.constantFrom('MARRIED', 'SEPARATED', 'SINGLE_PARENT'), { minLength: 1, maxLength: 2 }),
    }),
    studentHistory: fc.record({
      siblingsInformation: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: null }),
      totalLearnersInHousehold: fc.integer({ min: 1, max: 20 }),
      lastSchoolPreschoolName: nonEmptyStringGenerator(2, 50),
      lastSchoolPreschoolAddress: fc.option(nonEmptyStringGenerator(10, 100), { nil: null }),
      lastSchoolElementaryName: nonEmptyStringGenerator(2, 50),
      lastSchoolElementaryAddress: fc.option(nonEmptyStringGenerator(10, 100), { nil: null }),
    }),
    studentSkills: fc.record({
      specialSkills: fc.array(fc.constantFrom('COMPUTER', 'SINGING', 'DANCING'), { minLength: 0, maxLength: 3 }),
      specialNeedsDiagnosis: fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: null }),
    }),
    enrollmentAgreement: fc.record({
      responsiblePersonName: nonEmptyStringGenerator(2, 50),
      responsiblePersonContactNumber: fc.constantFrom('09171234567', '09181234567'),
      responsiblePersonEmail: fc.emailAddress(),
      relationshipToStudent: fc.option(nonEmptyStringGenerator(2, 50), { nil: null }),
      enrollmentAgreementAcceptance: fc.constant('YES_COMMIT'),
      withdrawalPolicyAcceptance: fc.constant('YES_AGREED'),
    }),
  });

  // ===== PROPERTY TESTS =====

  /**
   * Property 20: Unauthorized Status Change Prevention
   * 
   * For any user without ADMIN or PRINCIPAL role, attempts to approve or reject
   * enrollments should be denied with a 403 authorization error.
   * 
   * **Validates: Requirements 6.4**
   */
  it('Property 20: Unauthorized Status Change Prevention', async () => {
    await fc.assert(
      fc.asyncProperty(
        enrollmentGenerator,
        fc.constantFrom<EnrollmentStatus>('APPROVED', 'REJECTED'),
        async (enrollment, newStatus) => {
          // Setup: Mock parent user (unauthorized for status changes)
          vi.mocked(requireRole).mockRejectedValue({
            name: 'ForbiddenError',
            message: 'Insufficient permissions',
          });

          // Execute: Attempt to update enrollment status as parent
          const request = new NextRequest(
            `http://localhost:3000/api/enrollments/${enrollment.id}/status`,
            {
              method: 'PATCH',
              body: JSON.stringify({ status: newStatus }),
            }
          );

          const response = await UpdateEnrollmentStatus(request, { params: { id: enrollment.id } });
          const data = await response.json();

          // Verify: Should be denied with 403
          expect(response.status).toBe(403);
          expect(data.error).toBeDefined();
          expect(typeof data.error).toBe('string');

          // Verify: requireRole was called with correct roles
          expect(requireRole).toHaveBeenCalledWith([Role.ADMIN, Role.PRINCIPAL]);

          // Verify: Database update was NOT called
          expect(prisma.enrollment.update).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 21: Parent Role Permissions
   * 
   * For any user with PARENT role, they should be able to submit enrollment forms
   * and view their own submissions, but should be denied access to admin features
   * like viewing all enrollments or approving/rejecting applications.
   * 
   * **Validates: Requirements 7.1, 7.5**
   */
  it('Property 21: Parent Role Permissions - Can submit enrollments', async () => {
    await fc.assert(
      fc.asyncProperty(
        validEnrollmentDataGenerator,
        async (enrollmentData) => {
          // Setup: Mock parent user
          vi.mocked(requireRole).mockResolvedValue(mockParentUser);

          // Mock transaction to return created enrollment
          const mockEnrollmentId = `enr_${Date.now()}_test`;
          const mockCreatedEnrollment = {
            id: mockEnrollmentId,
            userId: mockParentUser.id,
            schoolYear: enrollmentData.schoolYear,
            program: enrollmentData.program,
            studentStatus: enrollmentData.studentStatus,
            status: 'PENDING' as EnrollmentStatus,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
            return callback({
              enrollment: {
                create: vi.fn().mockResolvedValue(mockCreatedEnrollment),
              },
            });
          });

          // Execute: Submit enrollment as parent
          const request = new NextRequest('http://localhost:3000/api/enrollments', {
            method: 'POST',
            body: JSON.stringify(enrollmentData),
          });

          const response = await CreateEnrollment(request);
          const data = await response.json();

          // Verify: Should succeed
          expect(response.status).toBe(201);
          expect(data.success).toBe(true);
          expect(data.enrollmentId).toBeDefined();

          // Verify: requireRole was called with PARENT role
          expect(requireRole).toHaveBeenCalledWith([Role.PARENT]);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 21: Parent Role Permissions - Can view own submissions only', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(enrollmentGenerator, { minLength: 3, maxLength: 10 }),
        async (allEnrollments) => {
          // Setup: Mock parent user
          vi.mocked(requireAuth).mockResolvedValue(mockParentUser);

          // Filter to only parent's enrollments
          const parentEnrollments = allEnrollments.map(e => ({
            ...e,
            userId: mockParentUser.id,
          }));

          // Mock database to return only parent's enrollments
          vi.mocked(prisma.enrollment.findMany).mockResolvedValue(
            parentEnrollments.map(e => ({
              id: e.id,
              schoolYear: e.schoolYear,
              program: e.program,
              studentStatus: e.studentStatus,
              status: e.status,
              firstName: e.firstName,
              lastName: e.lastName,
              middleName: e.middleName,
              createdAt: e.createdAt,
              updatedAt: e.updatedAt,
            })) as any
          );

          vi.mocked(prisma.enrollment.count).mockResolvedValue(parentEnrollments.length);

          // Execute: Get enrollments as parent
          const request = new NextRequest('http://localhost:3000/api/enrollments');
          const response = await GetEnrollments(request);
          const data = await response.json();

          // Verify: Should succeed
          expect(response.status).toBe(200);
          expect(data.enrollments).toBeDefined();

          // Verify: Database was queried with userId filter
          expect(prisma.enrollment.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
              where: expect.objectContaining({
                userId: mockParentUser.id,
              }),
            })
          );

          // Verify: All returned enrollments belong to the parent
          data.enrollments.forEach((enrollment: any) => {
            const found = parentEnrollments.find(e => e.id === enrollment.id);
            expect(found).toBeDefined();
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 21: Parent Role Permissions - Cannot approve/reject enrollments', async () => {
    await fc.assert(
      fc.asyncProperty(
        enrollmentGenerator,
        async (enrollment) => {
          // Setup: Mock parent user attempting admin action
          vi.mocked(requireRole).mockRejectedValue({
            name: 'ForbiddenError',
            message: 'Insufficient permissions',
          });

          // Execute: Attempt to approve enrollment as parent
          const request = new NextRequest(
            `http://localhost:3000/api/enrollments/${enrollment.id}/status`,
            {
              method: 'PATCH',
              body: JSON.stringify({ status: 'APPROVED' }),
            }
          );

          const response = await UpdateEnrollmentStatus(request, { params: { id: enrollment.id } });
          const data = await response.json();

          // Verify: Should be denied
          expect(response.status).toBe(403);
          expect(data.error).toBeDefined();

          // Verify: Database was NOT updated
          expect(prisma.enrollment.update).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 22: Admin and Principal Role Permissions
   * 
   * For any user with ADMIN or PRINCIPAL role, they should be able to access
   * all enrollments, view enrollment details, and approve or reject applications.
   * 
   * **Validates: Requirements 7.2, 7.3**
   */
  it('Property 22: Admin and Principal Role Permissions - Can view all enrollments', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(mockAdminUser, mockPrincipalUser),
        fc.array(enrollmentGenerator, { minLength: 1, maxLength: 20 }),
        async (user, enrollments) => {
          // Setup: Mock admin or principal user
          vi.mocked(requireAuth).mockResolvedValue(user);

          // Mock database to return all enrollments (no userId filter)
          vi.mocked(prisma.enrollment.findMany).mockResolvedValue(
            enrollments.map(e => ({
              id: e.id,
              schoolYear: e.schoolYear,
              program: e.program,
              studentStatus: e.studentStatus,
              status: e.status,
              firstName: e.firstName,
              lastName: e.lastName,
              middleName: e.middleName,
              createdAt: e.createdAt,
              updatedAt: e.updatedAt,
            })) as any
          );

          vi.mocked(prisma.enrollment.count).mockResolvedValue(enrollments.length);

          // Execute: Get enrollments as admin/principal
          const request = new NextRequest('http://localhost:3000/api/enrollments');
          const response = await GetEnrollments(request);
          const data = await response.json();

          // Verify: Should succeed
          expect(response.status).toBe(200);
          expect(data.enrollments).toBeDefined();
          expect(data.enrollments.length).toBe(enrollments.length);

          // Verify: Database was queried WITHOUT userId filter
          expect(prisma.enrollment.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
              where: expect.not.objectContaining({
                userId: expect.anything(),
              }),
            })
          );

          // Verify: All enrollments are returned
          enrollments.forEach(enrollment => {
            const found = data.enrollments.find((e: any) => e.id === enrollment.id);
            expect(found).toBeDefined();
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 22: Admin and Principal Role Permissions - Can approve enrollments', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(mockAdminUser, mockPrincipalUser),
        enrollmentGenerator,
        async (user, enrollment) => {
          // Setup: Mock admin or principal user
          vi.mocked(requireRole).mockResolvedValue(user);

          // Mock database operations
          const pendingEnrollment = { ...enrollment, status: 'PENDING' as EnrollmentStatus };
          vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(pendingEnrollment as any);

          vi.mocked(prisma.enrollment.update).mockResolvedValue({
            ...pendingEnrollment,
            status: 'APPROVED' as EnrollmentStatus,
            documents: [],
          } as any);

          // Execute: Approve enrollment
          const request = new NextRequest(
            `http://localhost:3000/api/enrollments/${enrollment.id}/status`,
            {
              method: 'PATCH',
              body: JSON.stringify({ status: 'APPROVED' }),
            }
          );

          const response = await UpdateEnrollmentStatus(request, { params: { id: enrollment.id } });
          const data = await response.json();

          // Verify: Should succeed
          expect(response.status).toBe(200);
          expect(data.success).toBe(true);
          expect(data.enrollment).toBeDefined();
          expect(data.enrollment.status).toBe('APPROVED');

          // Verify: requireRole was called with correct roles
          expect(requireRole).toHaveBeenCalledWith([Role.ADMIN, Role.PRINCIPAL]);

          // Verify: Database was updated
          expect(prisma.enrollment.update).toHaveBeenCalledWith(
            expect.objectContaining({
              where: { id: enrollment.id },
              data: expect.objectContaining({
                status: 'APPROVED',
              }),
            })
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 22: Admin and Principal Role Permissions - Can reject enrollments', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(mockAdminUser, mockPrincipalUser),
        enrollmentGenerator,
        async (user, enrollment) => {
          // Setup: Mock admin or principal user
          vi.mocked(requireRole).mockResolvedValue(user);

          // Mock database operations
          const pendingEnrollment = { ...enrollment, status: 'PENDING' as EnrollmentStatus };
          vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(pendingEnrollment as any);

          vi.mocked(prisma.enrollment.update).mockResolvedValue({
            ...pendingEnrollment,
            status: 'REJECTED' as EnrollmentStatus,
            documents: [],
          } as any);

          // Execute: Reject enrollment
          const request = new NextRequest(
            `http://localhost:3000/api/enrollments/${enrollment.id}/status`,
            {
              method: 'PATCH',
              body: JSON.stringify({ status: 'REJECTED' }),
            }
          );

          const response = await UpdateEnrollmentStatus(request, { params: { id: enrollment.id } });
          const data = await response.json();

          // Verify: Should succeed
          expect(response.status).toBe(200);
          expect(data.success).toBe(true);
          expect(data.enrollment).toBeDefined();
          expect(data.enrollment.status).toBe('REJECTED');

          // Verify: requireRole was called with correct roles
          expect(requireRole).toHaveBeenCalledWith([Role.ADMIN, Role.PRINCIPAL]);

          // Verify: Database was updated
          expect(prisma.enrollment.update).toHaveBeenCalledWith(
            expect.objectContaining({
              where: { id: enrollment.id },
              data: expect.objectContaining({
                status: 'REJECTED',
              }),
            })
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 26: Parent Submission Visibility
   * 
   * For any parent user, accessing their submissions should return all enrollments
   * they created, with current status for each, and should not include enrollments
   * created by other parents.
   * 
   * **Validates: Requirements 9.1, 9.5**
   */
  it('Property 26: Parent Submission Visibility', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(enrollmentGenerator, { minLength: 5, maxLength: 20 }),
        async (allEnrollments) => {
          // Setup: Mock parent user
          vi.mocked(requireAuth).mockResolvedValue(mockParentUser);

          // Split enrollments: some belong to parent, some to others
          const parentEnrollments = allEnrollments.slice(0, Math.floor(allEnrollments.length / 2)).map(e => ({
            ...e,
            userId: mockParentUser.id,
          }));

          const otherEnrollments = allEnrollments.slice(Math.floor(allEnrollments.length / 2)).map(e => ({
            ...e,
            userId: mockOtherParentUser.id,
          }));

          // Mock database to return only parent's enrollments
          vi.mocked(prisma.enrollment.findMany).mockResolvedValue(
            parentEnrollments.map(e => ({
              id: e.id,
              schoolYear: e.schoolYear,
              program: e.program,
              studentStatus: e.studentStatus,
              status: e.status,
              firstName: e.firstName,
              lastName: e.lastName,
              middleName: e.middleName,
              createdAt: e.createdAt,
              updatedAt: e.updatedAt,
            })) as any
          );

          vi.mocked(prisma.enrollment.count).mockResolvedValue(parentEnrollments.length);

          // Execute: Get enrollments as parent
          const request = new NextRequest('http://localhost:3000/api/enrollments');
          const response = await GetEnrollments(request);
          const data = await response.json();

          // Verify: Should succeed
          expect(response.status).toBe(200);
          expect(data.enrollments).toBeDefined();

          // Verify: Only parent's enrollments are returned
          expect(data.enrollments.length).toBe(parentEnrollments.length);

          // Verify: All returned enrollments belong to the parent
          data.enrollments.forEach((enrollment: any) => {
            const found = parentEnrollments.find(e => e.id === enrollment.id);
            expect(found).toBeDefined();
            expect(found?.userId).toBe(mockParentUser.id);
          });

          // Verify: No other parent's enrollments are included
          otherEnrollments.forEach(otherEnrollment => {
            const found = data.enrollments.find((e: any) => e.id === otherEnrollment.id);
            expect(found).toBeUndefined();
          });

          // Verify: Each enrollment includes status
          data.enrollments.forEach((enrollment: any) => {
            expect(enrollment.status).toBeDefined();
            expect(['PENDING', 'APPROVED', 'REJECTED']).toContain(enrollment.status);
          });

          // Verify: Database was queried with userId filter
          expect(prisma.enrollment.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
              where: expect.objectContaining({
                userId: mockParentUser.id,
              }),
            })
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional Property: Role Permission Consistency
   * 
   * For any user, their role permissions should be consistent across
   * multiple requests and operations.
   */
  it('should maintain consistent role permissions across multiple operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          { user: mockParentUser, canApprove: false },
          { user: mockAdminUser, canApprove: true },
          { user: mockPrincipalUser, canApprove: true }
        ),
        fc.array(enrollmentGenerator, { minLength: 3, maxLength: 5 }),
        async ({ user, canApprove }, enrollments) => {
          // Test multiple operations with the same user
          const operations = enrollments.map(enrollment => async () => {
            if (canApprove) {
              vi.mocked(requireRole).mockResolvedValue(user);
              vi.mocked(prisma.enrollment.findUnique).mockResolvedValue({
                ...enrollment,
                status: 'PENDING' as EnrollmentStatus,
              } as any);
              vi.mocked(prisma.enrollment.update).mockResolvedValue({
                ...enrollment,
                status: 'APPROVED' as EnrollmentStatus,
                documents: [],
              } as any);
            } else {
              vi.mocked(requireRole).mockRejectedValue({
                name: 'ForbiddenError',
                message: 'Insufficient permissions',
              });
            }

            const request = new NextRequest(
              `http://localhost:3000/api/enrollments/${enrollment.id}/status`,
              {
                method: 'PATCH',
                body: JSON.stringify({ status: 'APPROVED' }),
              }
            );

            return UpdateEnrollmentStatus(request, { params: { id: enrollment.id } });
          });

          // Execute all operations
          const responses = await Promise.all(operations.map(op => op()));

          // Verify: All operations should have consistent results
          responses.forEach(response => {
            if (canApprove) {
              expect(response.status).toBe(200);
            } else {
              expect(response.status).toBe(403);
            }
          });

          // Verify: Consistency - all responses should have the same status
          const statuses = responses.map(r => r.status);
          expect(new Set(statuses).size).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
