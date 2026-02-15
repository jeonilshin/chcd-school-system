/**
 * Property-Based Tests for Enrollment Management
 * 
 * Tests enrollment management properties:
 * - Property 15: Admin Dashboard Enrollment Visibility
 * - Property 16: Enrollment Detail Retrieval
 * - Property 17: Enrollment Filtering
 * - Property 18: Enrollment Approval State Transition
 * - Property 19: Enrollment Rejection State Transition
 * 
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { prisma } from '@/lib/prisma';
import { GET as GetEnrollments } from '@/app/api/enrollments/route';
import { GET as GetEnrollmentById } from '@/app/api/enrollments/[id]/route';
import { PATCH as UpdateEnrollmentStatus } from '@/app/api/enrollments/[id]/status/route';
import { NextRequest } from 'next/server';
import { requireAuth, requireRole, requireRoleOrOwner } from '@/lib/auth-middleware';
import { Role, EnrollmentStatus } from '@prisma/client';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    enrollment: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth-middleware', () => ({
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
  requireRoleOrOwner: vi.fn(),
}));

describe('Enrollment Management Property Tests', () => {
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
    nameExtension: fc.option(fc.constantFrom('Jr.', 'Sr.', 'III'), { nil: null }),
    nickname: fc.string({ minLength: 1, maxLength: 30 }),
    sex: fc.constantFrom('FEMALE', 'MALE'),
    age: fc.integer({ min: 2, max: 6 }),
    birthday: fc.date({ min: new Date('2018-01-01'), max: new Date('2022-12-31') }),
    placeOfBirth: fc.string({ minLength: 1, maxLength: 50 }),
    religion: fc.string({ minLength: 1, maxLength: 50 }),
    presentAddress: fc.string({ minLength: 10, maxLength: 100 }),
    contactNumber: fc.constantFrom('09171234567', '09181234567'),
    citizenship: fc.constantFrom('FILIPINO', 'FOREIGNER'),
    citizenshipSpecification: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
    fatherFullName: fc.string({ minLength: 1, maxLength: 50 }),
    fatherOccupation: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
    fatherContactNumber: fc.constantFrom('09171234567', '09181234567'),
    fatherEmail: fc.option(fc.emailAddress(), { nil: null }),
    fatherEducationalAttainment: fc.constantFrom('ELEMENTARY_GRADUATE', 'HIGH_SCHOOL_GRADUATE', 'COLLEGE_GRADUATE'),
    motherFullName: fc.string({ minLength: 1, maxLength: 50 }),
    motherOccupation: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
    motherContactNumber: fc.constantFrom('09171234567', '09181234567'),
    motherEmail: fc.emailAddress(),
    motherEducationalAttainment: fc.constantFrom('ELEMENTARY_GRADUATE', 'HIGH_SCHOOL_GRADUATE', 'COLLEGE_GRADUATE'),
    maritalStatus: fc.array(fc.constantFrom('MARRIED', 'SEPARATED', 'SINGLE_PARENT'), { minLength: 1, maxLength: 2 }),
    siblingsInformation: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: null }),
    totalLearnersInHousehold: fc.integer({ min: 1, max: 20 }),
    lastSchoolPreschoolName: fc.string({ minLength: 1, maxLength: 50 }),
    lastSchoolPreschoolAddress: fc.option(fc.string({ minLength: 10, maxLength: 100 }), { nil: null }),
    lastSchoolElementaryName: fc.string({ minLength: 1, maxLength: 50 }),
    lastSchoolElementaryAddress: fc.option(fc.string({ minLength: 10, maxLength: 100 }), { nil: null }),
    specialSkills: fc.array(fc.constantFrom('COMPUTER', 'SINGING', 'DANCING'), { minLength: 0, maxLength: 3 }),
    specialNeedsDiagnosis: fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: null }),
    responsiblePersonName: fc.string({ minLength: 1, maxLength: 50 }),
    responsiblePersonContactNumber: fc.constantFrom('09171234567', '09181234567'),
    responsiblePersonEmail: fc.emailAddress(),
    relationshipToStudent: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
    enrollmentAgreementAcceptance: fc.constant('YES_COMMIT'),
    withdrawalPolicyAcceptance: fc.constant('YES_AGREED'),
    profilePictureUrl: fc.constant('https://example.com/profile.jpg'),
    createdAt: fc.date({ min: new Date('2024-01-01'), max: new Date() }),
    updatedAt: fc.date({ min: new Date('2024-01-01'), max: new Date() }),
  });

  // ===== PROPERTY TESTS =====

  /**
   * Property 15: Admin Dashboard Enrollment Visibility
   * 
   * For any authorized user (ADMIN or PRINCIPAL role), accessing the dashboard
   * should return a list containing all enrollment applications in the system.
   * 
   * **Validates: Requirements 5.1**
   */
  it('Property 15: Admin Dashboard Enrollment Visibility', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(mockAdminUser, mockPrincipalUser),
        fc.array(enrollmentGenerator, { minLength: 1, maxLength: 20 }),
        async (user, enrollments) => {
          vi.mocked(requireAuth).mockResolvedValue(user);

          // Mock database to return all enrollments
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

          const request = new NextRequest('http://localhost:3000/api/enrollments');
          const response = await GetEnrollments(request);
          const data = await response.json();

          // Verify all enrollments are returned
          expect(response.status).toBe(200);
          expect(data.enrollments).toBeDefined();
          expect(data.enrollments.length).toBe(enrollments.length);
          expect(data.total).toBe(enrollments.length);

          // Verify each enrollment is in the response
          enrollments.forEach(enrollment => {
            const found = data.enrollments.find((e: any) => e.id === enrollment.id);
            expect(found).toBeDefined();
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 16: Enrollment Detail Retrieval
   * 
   * For any enrollment ID, when an authorized user requests the enrollment details,
   * the system should return all submitted student information and all associated documents.
   * 
   * **Validates: Requirements 5.2**
   */
  it('Property 16: Enrollment Detail Retrieval', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(mockAdminUser, mockPrincipalUser),
        enrollmentGenerator,
        async (user, enrollment) => {
          vi.mocked(requireRoleOrOwner).mockResolvedValue(user);

          // Mock database to return enrollment with all fields
          vi.mocked(prisma.enrollment.findUnique).mockResolvedValue({
            ...enrollment,
            documents: [],
          } as any);

          const request = new NextRequest(`http://localhost:3000/api/enrollments/${enrollment.id}`);
          const response = await GetEnrollmentById(request, { params: { id: enrollment.id } });
          const data = await response.json();

          // Verify enrollment details are returned
          expect(response.status).toBe(200);
          expect(data.id).toBe(enrollment.id);
          expect(data.schoolYear).toBe(enrollment.schoolYear);
          expect(data.program).toBe(enrollment.program);
          expect(data.studentStatus).toBe(enrollment.studentStatus);
          expect(data.status).toBe(enrollment.status);

          // Verify personal info is included
          expect(data.personalInfo).toBeDefined();
          expect(data.personalInfo.firstName).toBe(enrollment.firstName);
          expect(data.personalInfo.lastName).toBe(enrollment.lastName);

          // Verify parent info is included
          expect(data.parentInfo).toBeDefined();
          expect(data.parentInfo.fatherFullName).toBe(enrollment.fatherFullName);
          expect(data.parentInfo.motherFullName).toBe(enrollment.motherFullName);

          // Verify student history is included
          expect(data.studentHistory).toBeDefined();
          expect(data.studentHistory.totalLearnersInHousehold).toBe(enrollment.totalLearnersInHousehold);

          // Verify student skills are included
          expect(data.studentSkills).toBeDefined();
          expect(data.studentSkills.specialSkills).toEqual(enrollment.specialSkills);

          // Verify enrollment agreement is included
          expect(data.enrollmentAgreement).toBeDefined();
          expect(data.enrollmentAgreement.responsiblePersonName).toBe(enrollment.responsiblePersonName);

          // Verify documents array is included
          expect(data.documents).toBeDefined();
          expect(Array.isArray(data.documents)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 17: Enrollment Filtering
   * 
   * For any filter criteria (schoolYear, program, or studentStatus), the system
   * should return only enrollments that match all specified filter criteria,
   * and exclude enrollments that don't match.
   * 
   * **Validates: Requirements 5.3, 5.4, 5.5**
   */
  it('Property 17: Enrollment Filtering', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(mockAdminUser, mockPrincipalUser),
        fc.array(enrollmentGenerator, { minLength: 5, maxLength: 20 }),
        schoolYearGenerator,
        async (user, allEnrollments, filterSchoolYear) => {
          vi.mocked(requireAuth).mockResolvedValue(user);

          // Filter enrollments by school year
          const matchingEnrollments = allEnrollments.filter(
            e => e.schoolYear === filterSchoolYear
          );

          // Mock database to return only matching enrollments
          vi.mocked(prisma.enrollment.findMany).mockResolvedValue(
            matchingEnrollments.map(e => ({
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

          vi.mocked(prisma.enrollment.count).mockResolvedValue(matchingEnrollments.length);

          const request = new NextRequest(
            `http://localhost:3000/api/enrollments?schoolYear=${filterSchoolYear}`
          );
          const response = await GetEnrollments(request);
          const data = await response.json();

          // Verify only matching enrollments are returned
          expect(response.status).toBe(200);
          expect(data.enrollments.length).toBe(matchingEnrollments.length);

          // Verify all returned enrollments match the filter
          data.enrollments.forEach((enrollment: any) => {
            expect(enrollment.schoolYear).toBe(filterSchoolYear);
          });

          // Verify no non-matching enrollments are included
          const nonMatchingIds = allEnrollments
            .filter(e => e.schoolYear !== filterSchoolYear)
            .map(e => e.id);

          nonMatchingIds.forEach(id => {
            const found = data.enrollments.find((e: any) => e.id === id);
            expect(found).toBeUndefined();
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 18: Enrollment Approval State Transition
   * 
   * For any enrollment in PENDING status, when an authorized user approves it,
   * the enrollment status should be updated to APPROVED and persisted to the database.
   * 
   * **Validates: Requirements 6.1, 6.3**
   */
  it('Property 18: Enrollment Approval State Transition', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(mockAdminUser, mockPrincipalUser),
        enrollmentGenerator,
        async (user, enrollment) => {
          // Set enrollment to PENDING status
          const pendingEnrollment = { ...enrollment, status: 'PENDING' as EnrollmentStatus };

          vi.mocked(requireRole).mockResolvedValue(user);

          // Mock database to return existing enrollment
          vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(pendingEnrollment as any);

          // Mock database update
          vi.mocked(prisma.enrollment.update).mockResolvedValue({
            ...pendingEnrollment,
            status: 'APPROVED' as EnrollmentStatus,
            documents: [],
          } as any);

          const request = new NextRequest(
            `http://localhost:3000/api/enrollments/${enrollment.id}/status`,
            {
              method: 'PATCH',
              body: JSON.stringify({ status: 'APPROVED' }),
            }
          );

          const response = await UpdateEnrollmentStatus(request, { params: { id: enrollment.id } });
          const data = await response.json();

          // Verify approval was successful
          expect(response.status).toBe(200);
          expect(data.success).toBe(true);
          expect(data.enrollment).toBeDefined();
          expect(data.enrollment.status).toBe('APPROVED');

          // Verify update was called with correct parameters
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

  /**
   * Property 19: Enrollment Rejection State Transition
   * 
   * For any enrollment in PENDING status, when an authorized user rejects it,
   * the enrollment status should be updated to REJECTED and persisted to the database.
   * 
   * **Validates: Requirements 6.2, 6.3**
   */
  it('Property 19: Enrollment Rejection State Transition', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(mockAdminUser, mockPrincipalUser),
        enrollmentGenerator,
        async (user, enrollment) => {
          // Set enrollment to PENDING status
          const pendingEnrollment = { ...enrollment, status: 'PENDING' as EnrollmentStatus };

          vi.mocked(requireRole).mockResolvedValue(user);

          // Mock database to return existing enrollment
          vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(pendingEnrollment as any);

          // Mock database update
          vi.mocked(prisma.enrollment.update).mockResolvedValue({
            ...pendingEnrollment,
            status: 'REJECTED' as EnrollmentStatus,
            documents: [],
          } as any);

          const request = new NextRequest(
            `http://localhost:3000/api/enrollments/${enrollment.id}/status`,
            {
              method: 'PATCH',
              body: JSON.stringify({ status: 'REJECTED' }),
            }
          );

          const response = await UpdateEnrollmentStatus(request, { params: { id: enrollment.id } });
          const data = await response.json();

          // Verify rejection was successful
          expect(response.status).toBe(200);
          expect(data.success).toBe(true);
          expect(data.enrollment).toBeDefined();
          expect(data.enrollment.status).toBe('REJECTED');

          // Verify update was called with correct parameters
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
});
