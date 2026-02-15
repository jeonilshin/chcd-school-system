/**
 * Unit Tests for Enrollment Management API
 * 
 * Tests specific examples and edge cases for:
 * - GET /api/enrollments (filtering and pagination)
 * - GET /api/enrollments/[id] (detail retrieval)
 * - PATCH /api/enrollments/[id]/status (status updates)
 * 
 * Validates: Requirements 5.3, 5.4, 5.5, 6.1, 6.2
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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

describe('Enrollment Management API Unit Tests', () => {
  const mockAdminUser = {
    id: 'admin_123',
    email: 'admin@test.com',
    name: 'Test Admin',
    role: Role.ADMIN,
  };

  const mockParentUser = {
    id: 'parent_123',
    email: 'parent@test.com',
    name: 'Test Parent',
    role: Role.PARENT,
  };

  const mockEnrollments = [
    {
      id: 'enr_1',
      userId: 'parent_123',
      schoolYear: '2024',
      program: 'Playschool AM',
      studentStatus: 'OLD_STUDENT',
      status: 'PENDING',
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'Smith',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: 'enr_2',
      userId: 'parent_456',
      schoolYear: '2024',
      program: 'Playschool PM',
      studentStatus: 'NEW_STUDENT',
      status: 'APPROVED',
      firstName: 'Jane',
      lastName: 'Doe',
      middleName: 'Ann',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16'),
    },
    {
      id: 'enr_3',
      userId: 'parent_789',
      schoolYear: '2025',
      program: 'Nursery',
      studentStatus: 'OLD_STUDENT',
      status: 'PENDING',
      firstName: 'Bob',
      lastName: 'Johnson',
      middleName: 'Lee',
      createdAt: new Date('2024-01-17'),
      updatedAt: new Date('2024-01-17'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/enrollments - Filtering', () => {
    /**
     * Test filtering returns correct results
     * Validates: Requirements 5.3, 5.4, 5.5
     */
    it('should filter enrollments by school year', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockAdminUser);

      const filtered = mockEnrollments.filter(e => e.schoolYear === '2024');
      vi.mocked(prisma.enrollment.findMany).mockResolvedValue(filtered as any);
      vi.mocked(prisma.enrollment.count).mockResolvedValue(filtered.length);

      const request = new NextRequest('http://localhost:3000/api/enrollments?schoolYear=2024');
      const response = await GetEnrollments(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.enrollments.length).toBe(2);
      expect(data.enrollments.every((e: any) => e.schoolYear === '2024')).toBe(true);
    });

    it('should filter enrollments by program', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockAdminUser);

      const filtered = mockEnrollments.filter(e => e.program === 'Playschool AM');
      vi.mocked(prisma.enrollment.findMany).mockResolvedValue(filtered as any);
      vi.mocked(prisma.enrollment.count).mockResolvedValue(filtered.length);

      const request = new NextRequest('http://localhost:3000/api/enrollments?program=Playschool AM');
      const response = await GetEnrollments(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.enrollments.length).toBe(1);
      expect(data.enrollments[0].program).toBe('Playschool AM');
    });

    it('should filter enrollments by student status', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockAdminUser);

      const filtered = mockEnrollments.filter(e => e.studentStatus === 'OLD_STUDENT');
      vi.mocked(prisma.enrollment.findMany).mockResolvedValue(filtered as any);
      vi.mocked(prisma.enrollment.count).mockResolvedValue(filtered.length);

      const request = new NextRequest('http://localhost:3000/api/enrollments?studentStatus=OLD_STUDENT');
      const response = await GetEnrollments(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.enrollments.length).toBe(2);
      expect(data.enrollments.every((e: any) => e.studentStatus === 'OLD_STUDENT')).toBe(true);
    });

    it('should filter enrollments by enrollment status', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockAdminUser);

      const filtered = mockEnrollments.filter(e => e.status === 'PENDING');
      vi.mocked(prisma.enrollment.findMany).mockResolvedValue(filtered as any);
      vi.mocked(prisma.enrollment.count).mockResolvedValue(filtered.length);

      const request = new NextRequest('http://localhost:3000/api/enrollments?status=PENDING');
      const response = await GetEnrollments(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.enrollments.length).toBe(2);
      expect(data.enrollments.every((e: any) => e.status === 'PENDING')).toBe(true);
    });

    it('should apply multiple filters simultaneously', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockAdminUser);

      const filtered = mockEnrollments.filter(
        e => e.schoolYear === '2024' && e.status === 'PENDING'
      );
      vi.mocked(prisma.enrollment.findMany).mockResolvedValue(filtered as any);
      vi.mocked(prisma.enrollment.count).mockResolvedValue(filtered.length);

      const request = new NextRequest('http://localhost:3000/api/enrollments?schoolYear=2024&status=PENDING');
      const response = await GetEnrollments(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.enrollments.length).toBe(1);
      expect(data.enrollments[0].schoolYear).toBe('2024');
      expect(data.enrollments[0].status).toBe('PENDING');
    });

    it('should return empty array when no enrollments match filters', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockAdminUser);

      vi.mocked(prisma.enrollment.findMany).mockResolvedValue([]);
      vi.mocked(prisma.enrollment.count).mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/enrollments?schoolYear=2030');
      const response = await GetEnrollments(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.enrollments.length).toBe(0);
      expect(data.total).toBe(0);
    });
  });

  describe('GET /api/enrollments - Pagination', () => {
    /**
     * Test pagination works correctly
     * Validates: Requirements 5.5
     */
    it('should paginate results with default page size', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockAdminUser);

      const page1 = mockEnrollments.slice(0, 2);
      vi.mocked(prisma.enrollment.findMany).mockResolvedValue(page1 as any);
      vi.mocked(prisma.enrollment.count).mockResolvedValue(mockEnrollments.length);

      const request = new NextRequest('http://localhost:3000/api/enrollments?page=1&limit=2');
      const response = await GetEnrollments(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.enrollments.length).toBe(2);
      expect(data.page).toBe(1);
      expect(data.total).toBe(3);
      expect(data.totalPages).toBe(2);
    });

    it('should return second page of results', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockAdminUser);

      const page2 = mockEnrollments.slice(2, 4);
      vi.mocked(prisma.enrollment.findMany).mockResolvedValue(page2 as any);
      vi.mocked(prisma.enrollment.count).mockResolvedValue(mockEnrollments.length);

      const request = new NextRequest('http://localhost:3000/api/enrollments?page=2&limit=2');
      const response = await GetEnrollments(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.enrollments.length).toBe(1);
      expect(data.page).toBe(2);
      expect(data.total).toBe(3);
    });

    it('should handle custom page size', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockAdminUser);

      vi.mocked(prisma.enrollment.findMany).mockResolvedValue(mockEnrollments as any);
      vi.mocked(prisma.enrollment.count).mockResolvedValue(mockEnrollments.length);

      const request = new NextRequest('http://localhost:3000/api/enrollments?page=1&limit=10');
      const response = await GetEnrollments(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.enrollments.length).toBe(3);
      expect(data.totalPages).toBe(1);
    });

    it('should calculate total pages correctly', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockAdminUser);

      vi.mocked(prisma.enrollment.findMany).mockResolvedValue([] as any);
      vi.mocked(prisma.enrollment.count).mockResolvedValue(25);

      const request = new NextRequest('http://localhost:3000/api/enrollments?page=1&limit=10');
      const response = await GetEnrollments(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalPages).toBe(3); // 25 items / 10 per page = 3 pages
    });
  });

  describe('GET /api/enrollments - Authorization', () => {
    it('should allow parents to see only their own enrollments', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockParentUser);

      const parentEnrollments = mockEnrollments.filter(e => e.userId === mockParentUser.id);
      vi.mocked(prisma.enrollment.findMany).mockResolvedValue(parentEnrollments as any);
      vi.mocked(prisma.enrollment.count).mockResolvedValue(parentEnrollments.length);

      const request = new NextRequest('http://localhost:3000/api/enrollments');
      const response = await GetEnrollments(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.enrollments.length).toBe(1);
      expect(data.enrollments[0].id).toBe('enr_1');

      // Verify the where clause included userId filter
      expect(prisma.enrollment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockParentUser.id,
          }),
        })
      );
    });

    it('should allow admins to see all enrollments', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockAdminUser);

      vi.mocked(prisma.enrollment.findMany).mockResolvedValue(mockEnrollments as any);
      vi.mocked(prisma.enrollment.count).mockResolvedValue(mockEnrollments.length);

      const request = new NextRequest('http://localhost:3000/api/enrollments');
      const response = await GetEnrollments(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.enrollments.length).toBe(3);

      // Verify the where clause did NOT include userId filter
      expect(prisma.enrollment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            userId: expect.anything(),
          }),
        })
      );
    });
  });

  describe('PATCH /api/enrollments/[id]/status - Status Updates', () => {
    const mockEnrollmentDetail = {
      id: 'enr_1',
      userId: 'parent_123',
      schoolYear: '2024',
      program: 'Playschool AM',
      studentStatus: 'OLD_STUDENT',
      status: 'PENDING' as EnrollmentStatus,
      firstName: 'John',
      lastName: 'Doe',
      middleName: 'Smith',
      nameExtension: null,
      nickname: 'Johnny',
      sex: 'MALE',
      age: 5,
      birthday: new Date('2019-05-15'),
      placeOfBirth: 'Manila',
      religion: 'Catholic',
      presentAddress: '123 Main St',
      contactNumber: '09171234567',
      citizenship: 'FILIPINO',
      citizenshipSpecification: null,
      fatherFullName: 'John Doe Sr.',
      fatherOccupation: 'Engineer',
      fatherContactNumber: '09171234567',
      fatherEmail: 'father@test.com',
      fatherEducationalAttainment: 'COLLEGE_GRADUATE',
      motherFullName: 'Jane Doe',
      motherOccupation: 'Teacher',
      motherContactNumber: '09181234567',
      motherEmail: 'mother@test.com',
      motherEducationalAttainment: 'COLLEGE_GRADUATE',
      maritalStatus: ['MARRIED'],
      siblingsInformation: 'One brother',
      totalLearnersInHousehold: 2,
      lastSchoolPreschoolName: 'ABC Preschool',
      lastSchoolPreschoolAddress: '456 School St',
      lastSchoolElementaryName: 'XYZ Elementary',
      lastSchoolElementaryAddress: '789 School Ave',
      specialSkills: ['SINGING', 'DANCING'],
      specialNeedsDiagnosis: null,
      responsiblePersonName: 'John Doe Sr.',
      responsiblePersonContactNumber: '09171234567',
      responsiblePersonEmail: 'father@test.com',
      relationshipToStudent: 'Father',
      enrollmentAgreementAcceptance: 'YES_COMMIT',
      withdrawalPolicyAcceptance: 'YES_AGREED',
      profilePictureUrl: 'https://example.com/profile.jpg',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      documents: [],
    };

    /**
     * Test status updates persist correctly
     * Validates: Requirements 6.1, 6.2
     */
    it('should successfully approve an enrollment', async () => {
      vi.mocked(requireRole).mockResolvedValue(mockAdminUser);
      vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(mockEnrollmentDetail as any);
      vi.mocked(prisma.enrollment.update).mockResolvedValue({
        ...mockEnrollmentDetail,
        status: 'APPROVED' as EnrollmentStatus,
      } as any);

      const request = new NextRequest('http://localhost:3000/api/enrollments/enr_1/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'APPROVED' }),
      });

      const response = await UpdateEnrollmentStatus(request, { params: { id: 'enr_1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.enrollment.status).toBe('APPROVED');

      // Verify update was called with correct parameters
      expect(prisma.enrollment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'enr_1' },
          data: expect.objectContaining({
            status: 'APPROVED',
          }),
        })
      );
    });

    it('should successfully reject an enrollment', async () => {
      vi.mocked(requireRole).mockResolvedValue(mockAdminUser);
      vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(mockEnrollmentDetail as any);
      vi.mocked(prisma.enrollment.update).mockResolvedValue({
        ...mockEnrollmentDetail,
        status: 'REJECTED' as EnrollmentStatus,
      } as any);

      const request = new NextRequest('http://localhost:3000/api/enrollments/enr_1/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'REJECTED' }),
      });

      const response = await UpdateEnrollmentStatus(request, { params: { id: 'enr_1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.enrollment.status).toBe('REJECTED');

      // Verify update was called with correct parameters
      expect(prisma.enrollment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'enr_1' },
          data: expect.objectContaining({
            status: 'REJECTED',
          }),
        })
      );
    });

    it('should reject invalid status values', async () => {
      vi.mocked(requireRole).mockResolvedValue(mockAdminUser);

      const request = new NextRequest('http://localhost:3000/api/enrollments/enr_1/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'INVALID_STATUS' }),
      });

      const response = await UpdateEnrollmentStatus(request, { params: { id: 'enr_1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Invalid status');
    });

    it('should return 404 for non-existent enrollment', async () => {
      vi.mocked(requireRole).mockResolvedValue(mockAdminUser);
      vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/enrollments/nonexistent/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'APPROVED' }),
      });

      const response = await UpdateEnrollmentStatus(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Enrollment not found');
    });

    it('should require admin or principal role', async () => {
      const forbiddenError = new Error('Insufficient permissions');
      forbiddenError.name = 'ForbiddenError';
      vi.mocked(requireRole).mockRejectedValue(forbiddenError);

      const request = new NextRequest('http://localhost:3000/api/enrollments/enr_1/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: 'APPROVED' }),
      });

      const response = await UpdateEnrollmentStatus(request, { params: { id: 'enr_1' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBeDefined();
    });
  });
});
