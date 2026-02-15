import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { POST } from '@/app/api/enrollments/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-middleware';
import { Role } from '@prisma/client';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    enrollment: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth-middleware', () => ({
  requireRole: vi.fn(),
}));

describe('POST /api/enrollments', () => {
  const mockUser = {
    id: 'user_123',
    email: 'parent@example.com',
    name: 'Test Parent',
    role: Role.PARENT,
  };

  const validEnrollmentData = {
    schoolYear: '2024',
    program: 'Playschool AM',
    studentStatus: 'NEW_STUDENT',
    profilePictureUrl: 'https://example.com/profile.jpg',
    personalInfo: {
      lastName: 'Doe',
      firstName: 'John',
      middleName: 'Smith',
      nameExtension: 'Jr.',
      nickname: 'Johnny',
      sex: 'MALE',
      age: 5,
      birthday: '2019-01-15',
      placeOfBirth: 'Manila',
      religion: 'Catholic',
      presentAddress: '123 Main St, Manila',
      contactNumber: '09171234567',
      citizenship: 'FILIPINO',
    },
    parentInfo: {
      fatherFullName: 'John Doe Sr.',
      fatherOccupation: 'Engineer',
      fatherContactNumber: '09171234567',
      fatherEmail: 'father@example.com',
      fatherEducationalAttainment: 'COLLEGE_GRADUATE',
      motherFullName: 'Jane Doe',
      motherOccupation: 'Teacher',
      motherContactNumber: '09181234567',
      motherEmail: 'mother@example.com',
      motherEducationalAttainment: 'COLLEGE_GRADUATE',
      maritalStatus: ['MARRIED'],
    },
    studentHistory: {
      siblingsInformation: 'One older brother',
      totalLearnersInHousehold: 2,
      lastSchoolPreschoolName: 'ABC Preschool',
      lastSchoolPreschoolAddress: '456 School St',
      lastSchoolElementaryName: 'XYZ Elementary',
      lastSchoolElementaryAddress: '789 Education Ave',
    },
    studentSkills: {
      specialSkills: ['SINGING', 'DANCING'],
      specialNeedsDiagnosis: null,
    },
    enrollmentAgreement: {
      responsiblePersonName: 'John Doe Sr.',
      responsiblePersonContactNumber: '09171234567',
      responsiblePersonEmail: 'father@example.com',
      relationshipToStudent: 'Father',
      enrollmentAgreementAcceptance: 'YES_COMMIT',
      withdrawalPolicyAcceptance: 'YES_AGREED',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireRole).mockResolvedValue(mockUser);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create enrollment with valid data', async () => {
    const mockEnrollment = {
      id: 'enr_123',
      userId: mockUser.id,
      schoolYear: validEnrollmentData.schoolYear,
      program: validEnrollmentData.program,
      studentStatus: validEnrollmentData.studentStatus,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastName: validEnrollmentData.personalInfo.lastName,
      firstName: validEnrollmentData.personalInfo.firstName,
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
      return callback({
        enrollment: {
          create: vi.fn().mockResolvedValue(mockEnrollment),
        },
      });
    });

    const request = new NextRequest('http://localhost:3000/api/enrollments', {
      method: 'POST',
      body: JSON.stringify(validEnrollmentData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.enrollmentId).toBeDefined();
    expect(data.enrollment).toBeDefined();
    expect(data.enrollment.schoolYear).toBe('2024');
    expect(data.enrollment.status).toBe('PENDING');
  });

  it('should reject enrollment with missing required personal info fields', async () => {
    const invalidData = {
      ...validEnrollmentData,
      personalInfo: {
        ...validEnrollmentData.personalInfo,
        lastName: '', // Missing required field
        firstName: '', // Missing required field
      },
    };

    const request = new NextRequest('http://localhost:3000/api/enrollments', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
    expect(data.errors.length).toBeGreaterThan(0);
    expect(data.errors.some((e: any) => e.field === 'lastName')).toBe(true);
    expect(data.errors.some((e: any) => e.field === 'firstName')).toBe(true);
  });

  it('should reject enrollment with invalid birthday', async () => {
    const invalidData = {
      ...validEnrollmentData,
      personalInfo: {
        ...validEnrollmentData.personalInfo,
        birthday: 'invalid-date',
      },
    };

    const request = new NextRequest('http://localhost:3000/api/enrollments', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
    expect(data.errors.some((e: any) => e.field === 'birthday')).toBe(true);
  });

  it('should require citizenship specification for FOREIGNER', async () => {
    const invalidData = {
      ...validEnrollmentData,
      personalInfo: {
        ...validEnrollmentData.personalInfo,
        citizenship: 'FOREIGNER',
        citizenshipSpecification: '', // Missing required for FOREIGNER
      },
    };

    const request = new NextRequest('http://localhost:3000/api/enrollments', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
    expect(data.errors.some((e: any) => e.field === 'citizenshipSpecification')).toBe(true);
  });

  it('should reject enrollment with missing parent info fields', async () => {
    const invalidData = {
      ...validEnrollmentData,
      parentInfo: {
        ...validEnrollmentData.parentInfo,
        fatherFullName: '',
        motherEmail: '',
      },
    };

    const request = new NextRequest('http://localhost:3000/api/enrollments', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
    expect(data.errors.some((e: any) => e.field === 'fatherFullName')).toBe(true);
    expect(data.errors.some((e: any) => e.field === 'motherEmail')).toBe(true);
  });

  it('should reject enrollment with invalid email format', async () => {
    const invalidData = {
      ...validEnrollmentData,
      parentInfo: {
        ...validEnrollmentData.parentInfo,
        motherEmail: 'invalid-email',
      },
    };

    const request = new NextRequest('http://localhost:3000/api/enrollments', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
    expect(data.errors.some((e: any) => e.field === 'motherEmail')).toBe(true);
  });

  it('should reject enrollment with invalid phone number format', async () => {
    const invalidData = {
      ...validEnrollmentData,
      parentInfo: {
        ...validEnrollmentData.parentInfo,
        fatherContactNumber: '123', // Invalid phone number
      },
    };

    const request = new NextRequest('http://localhost:3000/api/enrollments', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
    expect(data.errors.some((e: any) => e.field === 'fatherContactNumber')).toBe(true);
  });

  it('should reject enrollment without marital status', async () => {
    const invalidData = {
      ...validEnrollmentData,
      parentInfo: {
        ...validEnrollmentData.parentInfo,
        maritalStatus: [],
      },
    };

    const request = new NextRequest('http://localhost:3000/api/enrollments', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
    expect(data.errors.some((e: any) => e.field === 'maritalStatus')).toBe(true);
  });

  it('should reject enrollment with non-positive totalLearnersInHousehold', async () => {
    const invalidData = {
      ...validEnrollmentData,
      studentHistory: {
        ...validEnrollmentData.studentHistory,
        totalLearnersInHousehold: 0,
      },
    };

    const request = new NextRequest('http://localhost:3000/api/enrollments', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
    expect(data.errors.some((e: any) => e.field === 'totalLearnersInHousehold')).toBe(true);
  });

  it('should reject enrollment with missing student history fields', async () => {
    const invalidData = {
      ...validEnrollmentData,
      studentHistory: {
        ...validEnrollmentData.studentHistory,
        lastSchoolPreschoolName: '',
        lastSchoolElementaryName: '',
      },
    };

    const request = new NextRequest('http://localhost:3000/api/enrollments', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
    expect(data.errors.some((e: any) => e.field === 'lastSchoolPreschoolName')).toBe(true);
    expect(data.errors.some((e: any) => e.field === 'lastSchoolElementaryName')).toBe(true);
  });

  it('should reject enrollment with OTHER enrollment agreement acceptance', async () => {
    const invalidData = {
      ...validEnrollmentData,
      enrollmentAgreement: {
        ...validEnrollmentData.enrollmentAgreement,
        enrollmentAgreementAcceptance: 'OTHER',
      },
    };

    const request = new NextRequest('http://localhost:3000/api/enrollments', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
    expect(data.errors.some((e: any) => e.field === 'enrollmentAgreementAcceptance')).toBe(true);
  });

  it('should reject enrollment with NO_DISAGREE withdrawal policy acceptance', async () => {
    const invalidData = {
      ...validEnrollmentData,
      enrollmentAgreement: {
        ...validEnrollmentData.enrollmentAgreement,
        withdrawalPolicyAcceptance: 'NO_DISAGREE',
      },
    };

    const request = new NextRequest('http://localhost:3000/api/enrollments', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
    expect(data.errors.some((e: any) => e.field === 'withdrawalPolicyAcceptance')).toBe(true);
  });

  it('should reject enrollment with missing top-level fields', async () => {
    const invalidData = {
      ...validEnrollmentData,
      schoolYear: '',
      program: '',
      studentStatus: '',
    };

    const request = new NextRequest('http://localhost:3000/api/enrollments', {
      method: 'POST',
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
    expect(data.errors.some((e: any) => e.field === 'schoolYear')).toBe(true);
    expect(data.errors.some((e: any) => e.field === 'program')).toBe(true);
    expect(data.errors.some((e: any) => e.field === 'studentStatus')).toBe(true);
  });

  it('should handle database errors with rollback', async () => {
    vi.mocked(prisma.$transaction).mockRejectedValue(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost:3000/api/enrollments', {
      method: 'POST',
      body: JSON.stringify(validEnrollmentData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.errors).toBeDefined();
    expect(data.errors.some((e: any) => e.field === 'database')).toBe(true);
  });

  it('should require PARENT role', async () => {
    vi.mocked(requireRole).mockRejectedValue({
      name: 'ForbiddenError',
      message: 'Insufficient permissions',
    });

    const request = new NextRequest('http://localhost:3000/api/enrollments', {
      method: 'POST',
      body: JSON.stringify(validEnrollmentData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Insufficient permissions');
  });

  it('should accept optional fields as null or undefined', async () => {
    const dataWithOptionalFields = {
      ...validEnrollmentData,
      personalInfo: {
        ...validEnrollmentData.personalInfo,
        nameExtension: undefined, // Optional
        citizenshipSpecification: undefined, // Optional for FILIPINO
      },
      parentInfo: {
        ...validEnrollmentData.parentInfo,
        fatherOccupation: undefined, // Optional
        fatherEmail: undefined, // Optional
        motherOccupation: undefined, // Optional
      },
      studentHistory: {
        ...validEnrollmentData.studentHistory,
        siblingsInformation: undefined, // Optional
        lastSchoolPreschoolAddress: undefined, // Optional
        lastSchoolElementaryAddress: undefined, // Optional
      },
      studentSkills: {
        specialSkills: [],
        specialNeedsDiagnosis: undefined, // Optional
      },
      enrollmentAgreement: {
        ...validEnrollmentData.enrollmentAgreement,
        relationshipToStudent: undefined, // Optional
      },
    };

    const mockEnrollment = {
      id: 'enr_123',
      userId: mockUser.id,
      schoolYear: dataWithOptionalFields.schoolYear,
      program: dataWithOptionalFields.program,
      studentStatus: dataWithOptionalFields.studentStatus,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
      return callback({
        enrollment: {
          create: vi.fn().mockResolvedValue(mockEnrollment),
        },
      });
    });

    const request = new NextRequest('http://localhost:3000/api/enrollments', {
      method: 'POST',
      body: JSON.stringify(dataWithOptionalFields),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
  });
});
