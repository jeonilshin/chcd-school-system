/**
 * Property-Based Tests for Referential Integrity
 * 
 * Tests referential integrity properties:
 * - Property 29: Referential Integrity for Documents
 * 
 * Validates: Requirements 10.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { prisma } from '@/lib/prisma';
import { DELETE } from '@/app/api/enrollments/[id]/route';
import { NextRequest } from 'next/server';
import { requireRoleOrOwner } from '@/lib/auth-middleware';
import { Role } from '@prisma/client';
import { FileUploadHandler } from '@/lib/file-upload-handler';
import fs from 'fs/promises';
import path from 'path';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    enrollment: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    document: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth-middleware', () => ({
  requireRoleOrOwner: vi.fn(),
}));

describe('Referential Integrity Property Tests', () => {
  const mockUser = {
    id: 'user_test_123',
    email: 'admin@test.com',
    name: 'Test Admin',
    role: Role.ADMIN,
  };

  const uploadBaseDir = path.join(process.cwd(), 'public', 'uploads');
  const testEnrollmentIds: string[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireRoleOrOwner).mockResolvedValue(mockUser);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    
    // Clean up test files
    for (const enrollmentId of testEnrollmentIds) {
      try {
        await fs.rm(path.join(uploadBaseDir, 'profile-pictures', enrollmentId), {
          recursive: true,
          force: true,
        });
        await fs.rm(path.join(uploadBaseDir, 'documents', enrollmentId), {
          recursive: true,
          force: true,
        });
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    testEnrollmentIds.length = 0;
  });

  // ===== GENERATORS =====

  // Generator for enrollment IDs
  const enrollmentIdGenerator = fc.uuid().map(id => `enr_${id}`);

  // Generator for document types
  const documentTypeGenerator = fc.constantFrom(
    'REPORT_CARD',
    'BIRTH_CERTIFICATE',
    'GOOD_MORAL',
    'MARRIAGE_CONTRACT',
    'MEDICAL_RECORDS',
    'SPECIAL_NEEDS_DIAGNOSIS',
    'PROOF_OF_PAYMENT'
  );

  // Generator for document metadata
  const documentGenerator = fc.record({
    id: fc.uuid().map(id => `doc_${id}`),
    type: documentTypeGenerator,
    fileName: fc.stringMatching(/^[a-zA-Z0-9_-]{5,50}$/).map(s => `${s}.pdf`),
    fileSize: fc.integer({ min: 1000, max: 1000000 }),
    fileUrl: fc.stringMatching(/^[a-zA-Z0-9_/-]{10,100}$/),
    mimeType: fc.constantFrom('application/pdf', 'image/jpeg', 'image/png'),
  });

  // Generator for enrollment with documents
  const enrollmentWithDocumentsGenerator = fc.record({
    enrollmentId: enrollmentIdGenerator,
    documents: fc.array(documentGenerator, { minLength: 1, maxLength: 5 }),
  });

  // ===== PROPERTY TESTS =====

  /**
   * Property 29: Referential Integrity for Documents
   * 
   * For any enrollment, when the enrollment is deleted from the database,
   * all associated documents should also be deleted from both the database
   * and file storage (cascade delete).
   * 
   * **Validates: Requirements 10.4**
   */
  it('Property 29: Referential Integrity for Documents', async () => {
    await fc.assert(
      fc.asyncProperty(
        enrollmentWithDocumentsGenerator,
        async ({ enrollmentId, documents }) => {
          testEnrollmentIds.push(enrollmentId);

          // Create test files on filesystem
          const fileHandler = new FileUploadHandler();
          const createdFiles: string[] = [];

          // Create profile picture directory and file
          const profilePicDir = path.join(uploadBaseDir, 'profile-pictures', enrollmentId);
          await fs.mkdir(profilePicDir, { recursive: true });
          const profilePicPath = path.join(profilePicDir, 'profile.jpg');
          await fs.writeFile(profilePicPath, Buffer.from('test profile picture'));
          createdFiles.push(profilePicPath);

          // Create document files
          const documentsDir = path.join(uploadBaseDir, 'documents', enrollmentId);
          await fs.mkdir(documentsDir, { recursive: true });
          
          for (const doc of documents) {
            const docPath = path.join(documentsDir, doc.fileName);
            await fs.writeFile(docPath, Buffer.from(`test document ${doc.id}`));
            createdFiles.push(docPath);
          }

          // Verify files exist before deletion
          for (const filePath of createdFiles) {
            const exists = await fs.access(filePath).then(() => true).catch(() => false);
            expect(exists).toBe(true);
          }

          // Mock enrollment lookup
          vi.mocked(prisma.enrollment.findUnique).mockResolvedValue({
            id: enrollmentId,
            userId: mockUser.id,
            schoolYear: '2024',
            program: 'Kindergarten',
            studentStatus: 'NEW_STUDENT',
            status: 'PENDING',
            lastName: 'Test',
            firstName: 'Student',
            middleName: 'Middle',
            nameExtension: null,
            nickname: 'Testy',
            sex: 'MALE',
            age: 5,
            birthday: new Date('2019-01-01'),
            placeOfBirth: 'Test City',
            religion: 'Test Religion',
            presentAddress: 'Test Address',
            contactNumber: '09171234567',
            citizenship: 'FILIPINO',
            citizenshipSpecification: null,
            fatherFullName: 'Test Father',
            fatherOccupation: null,
            fatherContactNumber: '09171234567',
            fatherEmail: null,
            fatherEducationalAttainment: 'COLLEGE_GRADUATE',
            motherFullName: 'Test Mother',
            motherOccupation: null,
            motherContactNumber: '09181234567',
            motherEmail: 'mother@test.com',
            motherEducationalAttainment: 'COLLEGE_GRADUATE',
            maritalStatus: ['MARRIED'],
            siblingsInformation: null,
            totalLearnersInHousehold: 2,
            lastSchoolPreschoolName: 'Test Preschool',
            lastSchoolPreschoolAddress: null,
            lastSchoolElementaryName: 'Test Elementary',
            lastSchoolElementaryAddress: null,
            specialSkills: [],
            specialNeedsDiagnosis: null,
            responsiblePersonName: 'Test Parent',
            responsiblePersonContactNumber: '09171234567',
            responsiblePersonEmail: 'parent@test.com',
            relationshipToStudent: null,
            enrollmentAgreementAcceptance: 'YES_COMMIT',
            withdrawalPolicyAcceptance: 'YES_AGREED',
            profilePictureUrl: '/uploads/profile-pictures/' + enrollmentId + '/profile.jpg',
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          // Mock enrollment deletion (cascade deletes documents in DB)
          vi.mocked(prisma.enrollment.delete).mockResolvedValue({
            id: enrollmentId,
            userId: mockUser.id,
            schoolYear: '2024',
            program: 'Kindergarten',
            studentStatus: 'NEW_STUDENT',
            status: 'PENDING',
            lastName: 'Test',
            firstName: 'Student',
            middleName: 'Middle',
            nameExtension: null,
            nickname: 'Testy',
            sex: 'MALE',
            age: 5,
            birthday: new Date('2019-01-01'),
            placeOfBirth: 'Test City',
            religion: 'Test Religion',
            presentAddress: 'Test Address',
            contactNumber: '09171234567',
            citizenship: 'FILIPINO',
            citizenshipSpecification: null,
            fatherFullName: 'Test Father',
            fatherOccupation: null,
            fatherContactNumber: '09171234567',
            fatherEmail: null,
            fatherEducationalAttainment: 'COLLEGE_GRADUATE',
            motherFullName: 'Test Mother',
            motherOccupation: null,
            motherContactNumber: '09181234567',
            motherEmail: 'mother@test.com',
            motherEducationalAttainment: 'COLLEGE_GRADUATE',
            maritalStatus: ['MARRIED'],
            siblingsInformation: null,
            totalLearnersInHousehold: 2,
            lastSchoolPreschoolName: 'Test Preschool',
            lastSchoolPreschoolAddress: null,
            lastSchoolElementaryName: 'Test Elementary',
            lastSchoolElementaryAddress: null,
            specialSkills: [],
            specialNeedsDiagnosis: null,
            responsiblePersonName: 'Test Parent',
            responsiblePersonContactNumber: '09171234567',
            responsiblePersonEmail: 'parent@test.com',
            relationshipToStudent: null,
            enrollmentAgreementAcceptance: 'YES_COMMIT',
            withdrawalPolicyAcceptance: 'YES_AGREED',
            profilePictureUrl: '/uploads/profile-pictures/' + enrollmentId + '/profile.jpg',
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          // Delete enrollment via API
          const request = new NextRequest(
            `http://localhost:3000/api/enrollments/${enrollmentId}`,
            { method: 'DELETE' }
          );

          const response = await DELETE(request, { params: { id: enrollmentId } });
          const data = await response.json();

          // Verify deletion was successful
          expect(response.status).toBe(200);
          expect(data.success).toBe(true);

          // Verify database delete was called
          expect(prisma.enrollment.delete).toHaveBeenCalledWith({
            where: { id: enrollmentId },
          });

          // Verify all files were deleted from filesystem (Requirement 10.4)
          for (const filePath of createdFiles) {
            const exists = await fs.access(filePath).then(() => true).catch(() => false);
            expect(exists).toBe(false);
          }

          // Verify directories were also cleaned up
          const profileDirExists = await fs.access(profilePicDir).then(() => true).catch(() => false);
          const documentsDirExists = await fs.access(documentsDir).then(() => true).catch(() => false);
          
          expect(profileDirExists).toBe(false);
          expect(documentsDirExists).toBe(false);
        }
      ),
      { numRuns: 50 } // Reduced runs due to file I/O operations
    );
  });
});
