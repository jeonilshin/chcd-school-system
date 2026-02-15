/**
 * Property-Based Tests for Document Access
 * 
 * Tests document access properties:
 * - Property 24: Authorized Document Access
 * - Property 25: Unauthorized Document Access Prevention
 * 
 * Validates: Requirements 8.2, 8.3, 8.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { prisma } from '@/lib/prisma';
import { fileRetrievalHandler } from '@/lib/file-retrieval-handler';
import { getServerSession } from '@/lib/auth';
import { Role } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    document: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock filesystem
vi.mock('fs/promises');

describe('Document Access Property Tests', () => {
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

  const documentTypeGenerator = fc.constantFrom(
    'REPORT_CARD',
    'BIRTH_CERTIFICATE',
    'GOOD_MORAL',
    'MARRIAGE_CONTRACT',
    'MEDICAL_RECORDS',
    'SPECIAL_NEEDS_DIAGNOSIS',
    'PROOF_OF_PAYMENT'
  );

  const mimeTypeGenerator = fc.constantFrom(
    'application/pdf',
    'image/jpeg',
    'image/png'
  );

  const documentGenerator = fc.record({
    id: fc.uuid(),
    enrollmentId: fc.uuid(),
    type: documentTypeGenerator,
    fileName: fc.string({ minLength: 5, maxLength: 50 }).map(s => `${s}.pdf`),
    fileSize: fc.integer({ min: 1000, max: 10000000 }),
    fileUrl: fc.uuid().map(id => `/uploads/documents/${id}/document.pdf`),
    mimeType: mimeTypeGenerator,
    uploadedAt: fc.date({ min: new Date('2024-01-01'), max: new Date() }),
  });

  const fileContentGenerator = fc.uint8Array({ minLength: 100, maxLength: 10000 });

  // ===== PROPERTY TESTS =====

  /**
   * Property 24: Authorized Document Access
   * 
   * For any document, when an authorized user (ADMIN, PRINCIPAL, or the parent
   * who owns the enrollment) requests it, the system should serve the file.
   * 
   * **Validates: Requirements 8.2, 8.3**
   */
  it('Property 24: Authorized Document Access', async () => {
    await fc.assert(
      fc.asyncProperty(
        documentGenerator,
        fileContentGenerator,
        fc.constantFrom(
          { user: mockAdminUser, isOwner: false },
          { user: mockPrincipalUser, isOwner: false },
          { user: mockParentUser, isOwner: true }
        ),
        async (document, fileContent, { user, isOwner }) => {
          // Setup: Mock authenticated user
          vi.mocked(getServerSession).mockResolvedValue({
            user,
            expires: '2024-12-31',
          });

          // Setup: Mock document in database
          const documentWithEnrollment = {
            ...document,
            Enrollment: {
              userId: isOwner ? user.id : 'different_user_id',
            },
          };

          vi.mocked(prisma.document.findUnique).mockResolvedValue(documentWithEnrollment as any);

          // Setup: Mock file system
          const fileBuffer = Buffer.from(fileContent);
          vi.mocked(fs.readFile).mockResolvedValue(fileBuffer);

          // Execute: Retrieve document
          const result = await fileRetrievalHandler.getDocument(document.id);

          // Verify: Should succeed
          expect(result.success).toBe(true);
          expect(result.fileBuffer).toBeDefined();
          expect(result.fileName).toBe(document.fileName);
          expect(result.mimeType).toBe(document.mimeType);
          expect(result.error).toBeUndefined();

          // Verify: File content matches
          expect(result.fileBuffer?.equals(fileBuffer)).toBe(true);

          // Verify: Database was queried
          expect(prisma.document.findUnique).toHaveBeenCalledWith({
            where: { id: document.id },
            include: {
              Enrollment: {
                select: {
                  userId: true,
                },
              },
            },
          });

          // Verify: File was read from correct path
          const expectedPath = path.join(process.cwd(), 'public', document.fileUrl);
          expect(fs.readFile).toHaveBeenCalledWith(expectedPath);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 25: Unauthorized Document Access Prevention
   * 
   * For any document, when a user who is not authorized (not ADMIN, PRINCIPAL,
   * or the owning parent) attempts to access it, the system should deny access
   * with a 403 authorization error.
   * 
   * **Validates: Requirements 8.4**
   */
  it('Property 25: Unauthorized Document Access Prevention', async () => {
    await fc.assert(
      fc.asyncProperty(
        documentGenerator,
        async (document) => {
          // Setup: Mock authenticated user who is NOT the owner
          vi.mocked(getServerSession).mockResolvedValue({
            user: mockOtherParentUser,
            expires: '2024-12-31',
          });

          // Setup: Mock document in database with different owner
          const documentWithEnrollment = {
            ...document,
            Enrollment: {
              userId: mockParentUser.id, // Different from mockOtherParentUser
            },
          };

          vi.mocked(prisma.document.findUnique).mockResolvedValue(documentWithEnrollment as any);

          // Execute: Attempt to retrieve document
          const result = await fileRetrievalHandler.getDocument(document.id);

          // Verify: Should fail with 403
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
          expect(result.error).toContain('Unauthorized');
          expect(result.statusCode).toBe(403);
          expect(result.fileBuffer).toBeUndefined();

          // Verify: Database was queried
          expect(prisma.document.findUnique).toHaveBeenCalledWith({
            where: { id: document.id },
            include: {
              Enrollment: {
                select: {
                  userId: true,
                },
              },
            },
          });

          // Verify: File was NOT read (authorization failed before file access)
          expect(fs.readFile).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional Property: Unauthenticated Document Access Prevention
   * 
   * For any document, when an unauthenticated user attempts to access it,
   * the system should deny access with a 403 authorization error.
   */
  it('should prevent unauthenticated users from accessing documents', async () => {
    await fc.assert(
      fc.asyncProperty(
        documentGenerator,
        async (document) => {
          // Setup: Mock unauthenticated user (no session)
          vi.mocked(getServerSession).mockResolvedValue(null);

          // Setup: Mock document in database
          const documentWithEnrollment = {
            ...document,
            Enrollment: {
              userId: mockParentUser.id,
            },
          };

          vi.mocked(prisma.document.findUnique).mockResolvedValue(documentWithEnrollment as any);

          // Execute: Attempt to retrieve document
          const result = await fileRetrievalHandler.getDocument(document.id);

          // Verify: Should fail with 403
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
          expect(result.error).toContain('Unauthorized');
          expect(result.statusCode).toBe(403);
          expect(result.fileBuffer).toBeUndefined();

          // Verify: File was NOT read
          expect(fs.readFile).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional Property: Document Not Found Handling
   * 
   * For any document ID that doesn't exist, the system should return
   * a 404 error regardless of user authorization level.
   */
  it('should return 404 for non-existent documents', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.constantFrom(mockAdminUser, mockPrincipalUser, mockParentUser),
        async (documentId, user) => {
          // Setup: Mock authenticated user
          vi.mocked(getServerSession).mockResolvedValue({
            user,
            expires: '2024-12-31',
          });

          // Setup: Mock document not found
          vi.mocked(prisma.document.findUnique).mockResolvedValue(null);

          // Execute: Attempt to retrieve non-existent document
          const result = await fileRetrievalHandler.getDocument(documentId);

          // Verify: Should fail with 404
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
          expect(result.error).toContain('not found');
          expect(result.statusCode).toBe(404);
          expect(result.fileBuffer).toBeUndefined();

          // Verify: File was NOT read
          expect(fs.readFile).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional Property: Authorization Consistency
   * 
   * For any document, the authorization decision should be consistent
   * across multiple access attempts by the same user.
   */
  it('should have consistent authorization decisions across multiple attempts', async () => {
    await fc.assert(
      fc.asyncProperty(
        documentGenerator,
        fileContentGenerator,
        fc.constantFrom(
          { user: mockAdminUser, shouldSucceed: true },
          { user: mockOtherParentUser, shouldSucceed: false }
        ),
        async (document, fileContent, { user, shouldSucceed }) => {
          // Setup: Mock authenticated user
          vi.mocked(getServerSession).mockResolvedValue({
            user,
            expires: '2024-12-31',
          });

          // Setup: Mock document in database
          const documentWithEnrollment = {
            ...document,
            Enrollment: {
              userId: mockParentUser.id, // Owner is mockParentUser
            },
          };

          vi.mocked(prisma.document.findUnique).mockResolvedValue(documentWithEnrollment as any);

          // Setup: Mock file system
          const fileBuffer = Buffer.from(fileContent);
          vi.mocked(fs.readFile).mockResolvedValue(fileBuffer);

          // Execute: Attempt to retrieve document multiple times
          const results = await Promise.all([
            fileRetrievalHandler.getDocument(document.id),
            fileRetrievalHandler.getDocument(document.id),
            fileRetrievalHandler.getDocument(document.id),
          ]);

          // Verify: All attempts should have the same result
          results.forEach(result => {
            expect(result.success).toBe(shouldSucceed);
            if (shouldSucceed) {
              expect(result.fileBuffer).toBeDefined();
              expect(result.error).toBeUndefined();
            } else {
              expect(result.fileBuffer).toBeUndefined();
              expect(result.error).toBeDefined();
              expect(result.statusCode).toBe(403);
            }
          });

          // Verify: Consistency - all results should be identical
          const successStates = results.map(r => r.success);
          expect(new Set(successStates).size).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
