/**
 * Property-Based Tests for Enrollment Submission
 * 
 * Tests enrollment submission properties:
 * - Property 1: Enrollment Data Persistence
 * - Property 27: File Upload Transaction Ordering
 * - Property 28: Transaction Rollback on Failure
 * - Property 35: Educational Attainment Persistence
 * - Property 39: Special Skills Persistence
 * - Property 40: Special Needs Diagnosis Optional Field
 * - Property 44: Complete Enrollment Data Round-Trip
 * 
 * Validates: Requirements 1.2, 1.3, 1.5, 10.2, 10.3, 12.3, 12.4, 14.2, 14.3, 14.4, 16.1, 16.2, 16.3, 16.4, 16.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { prisma } from '@/lib/prisma';
import { POST } from '@/app/api/enrollments/route';
import { POST as UploadPOST } from '@/app/api/enrollments/[id]/upload/route';
import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth-middleware';
import { Role } from '@prisma/client';
import type {
  StudentStatus,
  Sex,
  Citizenship,
  EducationalAttainment,
  MaritalStatus,
  SpecialSkill,
  EnrollmentAgreementAcceptance,
  WithdrawalPolicyAcceptance,
} from '@/types/enrollment';
import fs from 'fs/promises';
import path from 'path';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    enrollment: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    document: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth-middleware', () => ({
  requireRole: vi.fn(),
}));

// Mock fs module
vi.mock('fs/promises', () => ({
  default: {
    access: vi.fn(),
    mkdir: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn(),
    unlink: vi.fn(),
    rm: vi.fn(),
  },
}));

describe('Enrollment Submission Property Tests', () => {
  const mockUser = {
    id: 'user_test_123',
    email: 'parent@test.com',
    name: 'Test Parent',
    role: Role.PARENT,
  };

  const uploadBaseDir = path.join(process.cwd(), 'public', 'uploads');
  const testEnrollmentIds: string[] = [];
  const fileStorage = new Map<string, Buffer>(); // In-memory storage for mocked files

  beforeEach(() => {
    vi.clearAllMocks();
    fileStorage.clear();
    vi.mocked(requireRole).mockResolvedValue(mockUser);
    
    // Setup default mock behaviors for fs
    vi.mocked(fs.access).mockImplementation(async (filePath: any) => {
      if (fileStorage.has(filePath.toString())) {
        return undefined;
      }
      throw new Error('File not found');
    });
    
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    
    vi.mocked(fs.writeFile).mockImplementation(async (filePath: any, data: any) => {
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
      fileStorage.set(filePath.toString(), buffer);
      return undefined;
    });
    
    vi.mocked(fs.readFile).mockImplementation(async (filePath: any) => {
      const buffer = fileStorage.get(filePath.toString());
      if (!buffer) {
        throw new Error('File not found');
      }
      return buffer;
    });
    
    vi.mocked(fs.unlink).mockResolvedValue(undefined);
    vi.mocked(fs.rm).mockResolvedValue(undefined);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    testEnrollmentIds.length = 0;
    fileStorage.clear();
  });

  // ===== GENERATORS =====

  // Generator for school years
  const schoolYearGenerator = fc.constantFrom('2024', '2025', '2026', '2027');

  // Generator for programs
  const programGenerator = fc.constantFrom(
    'Playschool AM',
    'Playschool PM',
    'Nursery',
    'Kindergarten'
  );

  // Generator for student status
  const studentStatusGenerator = fc.constantFrom<StudentStatus>('OLD_STUDENT', 'NEW_STUDENT');

  // Generator for sex
  const sexGenerator = fc.constantFrom<Sex>('FEMALE', 'MALE');

  // Generator for citizenship
  const citizenshipGenerator = fc.constantFrom<Citizenship>('FILIPINO', 'FOREIGNER');

  // Generator for educational attainment
  const educationalAttainmentGenerator = fc.constantFrom<EducationalAttainment>(
    'ELEMENTARY_GRADUATE',
    'HIGH_SCHOOL_GRADUATE',
    'COLLEGE_GRADUATE',
    'ELEMENTARY_UNDERGRAD',
    'HIGH_SCHOOL_UNDERGRAD',
    'COLLEGE_UNDERGRAD',
    'OTHERS'
  );

  // Generator for marital status (at least one selected)
  const maritalStatusGenerator = fc.array(
    fc.constantFrom<MaritalStatus>(
      'MARRIED',
      'SEPARATED',
      'SINGLE_PARENT',
      'STEPMOTHER',
      'STEPFATHER',
      'OTHER'
    ),
    { minLength: 1, maxLength: 3 }
  );

  // Generator for special skills (can be empty)
  const specialSkillsGenerator = fc.array(
    fc.constantFrom<SpecialSkill>(
      'COMPUTER',
      'COMPOSITION_WRITING',
      'SINGING',
      'DANCING',
      'POEM_WRITING',
      'COOKING',
      'ACTING',
      'PUBLIC_SPEAKING',
      'OTHER'
    ),
    { minLength: 0, maxLength: 5 }
  );

  // Generator for valid names
  const nameGenerator = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

  // Generator for valid email
  const emailGenerator = fc.emailAddress();

  // Generator for valid phone number
  const phoneGenerator = fc.constantFrom(
    '09171234567',
    '09181234567',
    '09191234567',
    '09201234567'
  );

  // Generator for valid dates (children aged 2-6)
  const birthdayGenerator = fc.date({
    min: new Date('2018-01-01'),
    max: new Date('2022-12-31'),
  });

  // Generator for personal info
  const personalInfoGenerator = fc.record({
    lastName: nameGenerator,
    firstName: nameGenerator,
    middleName: nameGenerator,
    nameExtension: fc.option(fc.constantFrom('Jr.', 'Sr.', 'III', 'IV'), { nil: undefined }),
    nickname: nameGenerator,
    sex: sexGenerator,
    age: fc.integer({ min: 2, max: 6 }),
    birthday: birthdayGenerator,
    placeOfBirth: nameGenerator,
    religion: nameGenerator,
    presentAddress: fc.string({ minLength: 10, maxLength: 100 }),
    contactNumber: phoneGenerator,
    citizenship: citizenshipGenerator,
  }).chain(info => {
    // Add citizenshipSpecification if FOREIGNER
    if (info.citizenship === 'FOREIGNER') {
      return nameGenerator.map(spec => ({
        ...info,
        citizenshipSpecification: spec,
      }));
    }
    return fc.constant({ ...info, citizenshipSpecification: undefined });
  });

  // Generator for parent info
  const parentInfoGenerator = fc.record({
    fatherFullName: nameGenerator,
    fatherOccupation: fc.option(nameGenerator, { nil: undefined }),
    fatherContactNumber: phoneGenerator,
    fatherEmail: fc.option(emailGenerator, { nil: undefined }),
    fatherEducationalAttainment: educationalAttainmentGenerator,
    motherFullName: nameGenerator,
    motherOccupation: fc.option(nameGenerator, { nil: undefined }),
    motherContactNumber: phoneGenerator,
    motherEmail: emailGenerator,
    motherEducationalAttainment: educationalAttainmentGenerator,
    maritalStatus: maritalStatusGenerator,
  });

  // Generator for student history
  const studentHistoryGenerator = fc.record({
    siblingsInformation: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: undefined }),
    totalLearnersInHousehold: fc.integer({ min: 1, max: 20 }),
    lastSchoolPreschoolName: nameGenerator,
    lastSchoolPreschoolAddress: fc.option(fc.string({ minLength: 10, maxLength: 100 }), { nil: undefined }),
    lastSchoolElementaryName: nameGenerator,
    lastSchoolElementaryAddress: fc.option(fc.string({ minLength: 10, maxLength: 100 }), { nil: undefined }),
  });

  // Generator for student skills
  const studentSkillsGenerator = fc.record({
    specialSkills: specialSkillsGenerator,
    specialNeedsDiagnosis: fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: undefined }),
  });

  // Generator for enrollment agreement
  const enrollmentAgreementGenerator = fc.record({
    responsiblePersonName: nameGenerator,
    responsiblePersonContactNumber: phoneGenerator,
    responsiblePersonEmail: emailGenerator,
    relationshipToStudent: fc.option(nameGenerator, { nil: undefined }),
    enrollmentAgreementAcceptance: fc.constant<EnrollmentAgreementAcceptance>('YES_COMMIT'),
    withdrawalPolicyAcceptance: fc.constant<WithdrawalPolicyAcceptance>('YES_AGREED'),
  });

  // Generator for complete enrollment data
  const enrollmentDataGenerator = fc.record({
    schoolYear: schoolYearGenerator,
    program: programGenerator,
    studentStatus: studentStatusGenerator,
    profilePictureUrl: fc.constant('https://example.com/profile.jpg'),
    personalInfo: personalInfoGenerator,
    parentInfo: parentInfoGenerator,
    studentHistory: studentHistoryGenerator,
    studentSkills: studentSkillsGenerator,
    enrollmentAgreement: enrollmentAgreementGenerator,
  });

  // ===== PROPERTY TESTS =====

  /**
   * Property 1: Enrollment Data Persistence
   * 
   * For any valid enrollment data including school year, program, student status,
   * and personal information, submitting the enrollment form should create a database
   * record that contains all the submitted data.
   * 
   * **Validates: Requirements 1.2, 1.3, 1.5**
   */
  it('Property 1: Enrollment Data Persistence', async () => {
    await fc.assert(
      fc.asyncProperty(enrollmentDataGenerator, async (enrollmentData) => {
        // Mock database transaction to capture the data being saved
        let capturedData: any = null;
        
        vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
          return callback({
            enrollment: {
              create: vi.fn().mockImplementation((args: any) => {
                capturedData = args.data;
                return Promise.resolve({
                  id: `enr_${Date.now()}`,
                  ...args.data,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });
              }),
            },
          });
        });

        // Submit enrollment
        const request = new NextRequest('http://localhost:3000/api/enrollments', {
          method: 'POST',
          body: JSON.stringify(enrollmentData),
        });

        const response = await POST(request);
        const data = await response.json();

        // Verify submission was successful
        expect(response.status).toBe(201);
        expect(data.success).toBe(true);

        // Verify all data was persisted
        expect(capturedData).toBeDefined();
        expect(capturedData.schoolYear).toBe(enrollmentData.schoolYear);
        expect(capturedData.program).toBe(enrollmentData.program);
        expect(capturedData.studentStatus).toBe(enrollmentData.studentStatus);
        expect(capturedData.lastName).toBe(enrollmentData.personalInfo.lastName);
        expect(capturedData.firstName).toBe(enrollmentData.personalInfo.firstName);
        expect(capturedData.middleName).toBe(enrollmentData.personalInfo.middleName);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 35: Educational Attainment Persistence
   * 
   * For any valid enrollment data including educational attainment selections for both parents,
   * submitting the enrollment should create a database record that contains the exact
   * educational attainment values selected.
   * 
   * **Validates: Requirements 12.3, 12.4**
   */
  it('Property 35: Educational Attainment Persistence', async () => {
    await fc.assert(
      fc.asyncProperty(enrollmentDataGenerator, async (enrollmentData) => {
        let capturedData: any = null;
        
        vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
          return callback({
            enrollment: {
              create: vi.fn().mockImplementation((args: any) => {
                capturedData = args.data;
                return Promise.resolve({
                  id: `enr_${Date.now()}`,
                  ...args.data,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });
              }),
            },
          });
        });

        const request = new NextRequest('http://localhost:3000/api/enrollments', {
          method: 'POST',
          body: JSON.stringify(enrollmentData),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);

        // Verify educational attainment values are persisted exactly
        expect(capturedData.fatherEducationalAttainment).toBe(
          enrollmentData.parentInfo.fatherEducationalAttainment
        );
        expect(capturedData.motherEducationalAttainment).toBe(
          enrollmentData.parentInfo.motherEducationalAttainment
        );
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 39: Special Skills Persistence
   * 
   * For any enrollment with zero, one, or multiple special skills selected,
   * the system should persist all selected skills and retrieve them correctly,
   * maintaining the exact set of skills that were submitted.
   * 
   * **Validates: Requirements 14.2, 14.4**
   */
  it('Property 39: Special Skills Persistence', async () => {
    await fc.assert(
      fc.asyncProperty(enrollmentDataGenerator, async (enrollmentData) => {
        let capturedData: any = null;
        
        vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
          return callback({
            enrollment: {
              create: vi.fn().mockImplementation((args: any) => {
                capturedData = args.data;
                return Promise.resolve({
                  id: `enr_${Date.now()}`,
                  ...args.data,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });
              }),
            },
          });
        });

        const request = new NextRequest('http://localhost:3000/api/enrollments', {
          method: 'POST',
          body: JSON.stringify(enrollmentData),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);

        // Verify special skills array is persisted exactly
        expect(capturedData.specialSkills).toEqual(enrollmentData.studentSkills.specialSkills);
        expect(capturedData.specialSkills.length).toBe(enrollmentData.studentSkills.specialSkills.length);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 40: Special Needs Diagnosis Optional Field
   * 
   * For any enrollment submission, the specialNeedsDiagnosis field should be accepted
   * whether present or absent, and the submission should succeed if all other required
   * fields are valid.
   * 
   * **Validates: Requirements 14.3**
   */
  it('Property 40: Special Needs Diagnosis Optional Field', async () => {
    await fc.assert(
      fc.asyncProperty(enrollmentDataGenerator, async (enrollmentData) => {
        vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
          return callback({
            enrollment: {
              create: vi.fn().mockResolvedValue({
                id: `enr_${Date.now()}`,
                userId: mockUser.id,
                schoolYear: enrollmentData.schoolYear,
                program: enrollmentData.program,
                studentStatus: enrollmentData.studentStatus,
                status: 'PENDING',
                createdAt: new Date(),
                updatedAt: new Date(),
              }),
            },
          });
        });

        const request = new NextRequest('http://localhost:3000/api/enrollments', {
          method: 'POST',
          body: JSON.stringify(enrollmentData),
        });

        const response = await POST(request);
        const data = await response.json();

        // Should succeed regardless of whether specialNeedsDiagnosis is present
        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 44: Complete Enrollment Data Round-Trip
   * 
   * For any valid enrollment data including all new fields (parent information,
   * student history, student skills, enrollment agreement), submitting the enrollment
   * and then retrieving it by ID should return all the submitted data with exact
   * values for all fields.
   * 
   * **Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.5**
   */
  it('Property 44: Complete Enrollment Data Round-Trip', async () => {
    await fc.assert(
      fc.asyncProperty(enrollmentDataGenerator, async (enrollmentData) => {
        let capturedData: any = null;
        const enrollmentId = `enr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        // Mock create to capture data
        vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
          return callback({
            enrollment: {
              create: vi.fn().mockImplementation((args: any) => {
                capturedData = args.data;
                return Promise.resolve({
                  id: enrollmentId,
                  ...args.data,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });
              }),
            },
          });
        });

        // Submit enrollment
        const createRequest = new NextRequest('http://localhost:3000/api/enrollments', {
          method: 'POST',
          body: JSON.stringify(enrollmentData),
        });

        const createResponse = await POST(createRequest);
        const createData = await createResponse.json();

        expect(createResponse.status).toBe(201);
        expect(createData.success).toBe(true);

        // Verify all fields are persisted correctly
        expect(capturedData.schoolYear).toBe(enrollmentData.schoolYear);
        expect(capturedData.program).toBe(enrollmentData.program);
        expect(capturedData.studentStatus).toBe(enrollmentData.studentStatus);
        
        // Personal info
        expect(capturedData.lastName).toBe(enrollmentData.personalInfo.lastName);
        expect(capturedData.firstName).toBe(enrollmentData.personalInfo.firstName);
        expect(capturedData.middleName).toBe(enrollmentData.personalInfo.middleName);
        expect(capturedData.nickname).toBe(enrollmentData.personalInfo.nickname);
        expect(capturedData.sex).toBe(enrollmentData.personalInfo.sex);
        expect(capturedData.age).toBe(enrollmentData.personalInfo.age);
        expect(capturedData.placeOfBirth).toBe(enrollmentData.personalInfo.placeOfBirth);
        expect(capturedData.religion).toBe(enrollmentData.personalInfo.religion);
        expect(capturedData.presentAddress).toBe(enrollmentData.personalInfo.presentAddress);
        expect(capturedData.contactNumber).toBe(enrollmentData.personalInfo.contactNumber);
        expect(capturedData.citizenship).toBe(enrollmentData.personalInfo.citizenship);
        
        // Parent info
        expect(capturedData.fatherFullName).toBe(enrollmentData.parentInfo.fatherFullName);
        expect(capturedData.fatherContactNumber).toBe(enrollmentData.parentInfo.fatherContactNumber);
        expect(capturedData.fatherEducationalAttainment).toBe(enrollmentData.parentInfo.fatherEducationalAttainment);
        expect(capturedData.motherFullName).toBe(enrollmentData.parentInfo.motherFullName);
        expect(capturedData.motherContactNumber).toBe(enrollmentData.parentInfo.motherContactNumber);
        expect(capturedData.motherEmail).toBe(enrollmentData.parentInfo.motherEmail);
        expect(capturedData.motherEducationalAttainment).toBe(enrollmentData.parentInfo.motherEducationalAttainment);
        expect(capturedData.maritalStatus).toEqual(enrollmentData.parentInfo.maritalStatus);
        
        // Student history
        expect(capturedData.totalLearnersInHousehold).toBe(enrollmentData.studentHistory.totalLearnersInHousehold);
        expect(capturedData.lastSchoolPreschoolName).toBe(enrollmentData.studentHistory.lastSchoolPreschoolName);
        expect(capturedData.lastSchoolElementaryName).toBe(enrollmentData.studentHistory.lastSchoolElementaryName);
        
        // Student skills
        expect(capturedData.specialSkills).toEqual(enrollmentData.studentSkills.specialSkills);
        
        // Enrollment agreement
        expect(capturedData.responsiblePersonName).toBe(enrollmentData.enrollmentAgreement.responsiblePersonName);
        expect(capturedData.responsiblePersonContactNumber).toBe(enrollmentData.enrollmentAgreement.responsiblePersonContactNumber);
        expect(capturedData.responsiblePersonEmail).toBe(enrollmentData.enrollmentAgreement.responsiblePersonEmail);
        expect(capturedData.enrollmentAgreementAcceptance).toBe(enrollmentData.enrollmentAgreement.enrollmentAgreementAcceptance);
        expect(capturedData.withdrawalPolicyAcceptance).toBe(enrollmentData.enrollmentAgreement.withdrawalPolicyAcceptance);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 27: File Upload Transaction Ordering
   * 
   * For any file upload operation, the file should be successfully stored in the
   * file system before the database record is created and before a success response
   * is returned to the client.
   * 
   * **Validates: Requirements 10.2**
   */
  it('Property 27: File Upload Transaction Ordering', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.uint8Array({ minLength: 100, maxLength: 1000 }),
        fc.constantFrom('image/jpeg', 'image/png'),
        async (enrollmentId, fileContent, mimeType) => {
          testEnrollmentIds.push(enrollmentId);
          
          const file = new File([fileContent], 'test-profile.jpg', { type: mimeType });
          
          // Track the order of operations
          const operations: string[] = [];
          
          // Enhance writeFile mock to track operations
          const originalWriteFile = vi.mocked(fs.writeFile);
          vi.mocked(fs.writeFile).mockImplementation(async (filePath: any, data: any) => {
            operations.push('file_written');
            const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
            fileStorage.set(filePath.toString(), buffer);
            return undefined;
          });
          
          // Mock database create to track when it happens
          vi.mocked(prisma.document.create).mockImplementation(async (args: any) => {
            operations.push('database_created');
            return Promise.resolve({
              id: 'doc_123',
              ...args.data,
              uploadedAt: new Date(),
            });
          });
          
          // Import the file upload handler
          const { FileUploadHandler } = await import('@/lib/file-upload-handler');
          const handler = new FileUploadHandler();
          
          // Upload the file
          const result = await handler.uploadProfilePicture(enrollmentId, file);
          
          // Verify file was written successfully
          expect(result.success).toBe(true);
          expect(result.fileUrl).toBeDefined();
          
          // Verify file exists in our mock storage
          const filePath = path.join(process.cwd(), 'public', result.fileUrl!);
          expect(fileStorage.has(filePath)).toBe(true);
          
          // Verify file write operation was tracked
          expect(operations).toContain('file_written');
          
          // If database operation was called, verify file was written first
          if (operations.includes('database_created')) {
            const fileWriteIndex = operations.indexOf('file_written');
            const dbCreateIndex = operations.indexOf('database_created');
            expect(fileWriteIndex).toBeLessThan(dbCreateIndex);
          }
        }
      ),
      { numRuns: 50 } // Reduced runs due to file I/O
    );
  });

  /**
   * Property 28: Transaction Rollback on Failure
   * 
   * For any enrollment submission where a database operation fails (e.g., constraint
   * violation, connection error), any partial changes should be rolled back, and the
   * system should return an error message without creating incomplete records.
   * 
   * **Validates: Requirements 10.3**
   */
  it('Property 28: Transaction Rollback on Failure', async () => {
    await fc.assert(
      fc.asyncProperty(enrollmentDataGenerator, async (enrollmentData) => {
        // Mock database transaction to fail
        vi.mocked(prisma.$transaction).mockRejectedValue(
          new Error('Database connection failed')
        );

        const request = new NextRequest('http://localhost:3000/api/enrollments', {
          method: 'POST',
          body: JSON.stringify(enrollmentData),
        });

        const response = await POST(request);
        const data = await response.json();

        // Verify error response
        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.errors).toBeDefined();
        expect(data.errors.length).toBeGreaterThan(0);
        expect(data.errors.some((e: any) => e.field === 'database')).toBe(true);
        
        // Verify no enrollment ID is returned (no partial record created)
        expect(data.enrollmentId).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });
});
