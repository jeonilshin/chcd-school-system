/**
 * Unit tests for FileUploadHandler
 * 
 * Tests file upload functionality including:
 * - Profile picture uploads
 * - Document uploads
 * - Directory structure creation
 * - Unique filename generation
 * - File deletion
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FileUploadHandler } from '@/lib/file-upload-handler';
import fs from 'fs/promises';
import path from 'path';

// Mock the fs module
vi.mock('fs/promises', () => ({
  default: {
    access: vi.fn(),
    mkdir: vi.fn(),
    writeFile: vi.fn(),
    unlink: vi.fn(),
    rm: vi.fn(),
    readFile: vi.fn(),
  },
}));

describe('FileUploadHandler', () => {
  let handler: FileUploadHandler;
  const testEnrollmentId = 'test-enrollment-123';
  const uploadBaseDir = path.join(process.cwd(), 'public', 'uploads');

  beforeEach(() => {
    handler = new FileUploadHandler();
    vi.clearAllMocks();
    
    // Setup default mock behaviors
    vi.mocked(fs.access).mockRejectedValue(new Error('Directory does not exist'));
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
    vi.mocked(fs.unlink).mockResolvedValue(undefined);
    vi.mocked(fs.rm).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('uploadProfilePicture', () => {
    it('should upload a profile picture successfully', async () => {
      // Create a test file
      const fileContent = 'test image content';
      const file = new File([fileContent], 'profile.jpg', { type: 'image/jpeg' });

      // Upload the file
      const result = await handler.uploadProfilePicture(testEnrollmentId, file);

      // Verify result
      expect(result.success).toBe(true);
      expect(result.fileUrl).toMatch(/^\/uploads\/profile-pictures\/test-enrollment-123\/\d+-profile\.jpg$/);
      expect(result.error).toBeUndefined();

      // Verify mkdir was called to create directory
      expect(fs.mkdir).toHaveBeenCalled();
      
      // Verify writeFile was called
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should create directory structure if it does not exist', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const result = await handler.uploadProfilePicture(testEnrollmentId, file);

      expect(result.success).toBe(true);

      // Verify mkdir was called with correct path
      const expectedPath = path.join(uploadBaseDir, 'profile-pictures', testEnrollmentId);
      expect(fs.mkdir).toHaveBeenCalledWith(expectedPath, { recursive: true });
    });

    it('should generate unique filenames with timestamps', async () => {
      const file1 = new File(['test1'], 'profile.jpg', { type: 'image/jpeg' });
      const file2 = new File(['test2'], 'profile.jpg', { type: 'image/jpeg' });

      const result1 = await handler.uploadProfilePicture(testEnrollmentId, file1);
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      const result2 = await handler.uploadProfilePicture(testEnrollmentId, file2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.fileUrl).not.toBe(result2.fileUrl);
    });

    it('should sanitize filenames with special characters', async () => {
      const file = new File(['test'], 'my file (1).jpg', { type: 'image/jpeg' });

      const result = await handler.uploadProfilePicture(testEnrollmentId, file);

      expect(result.success).toBe(true);
      expect(result.fileUrl).toMatch(/\d+-my_file__1_\.jpg$/);
    });
  });

  describe('uploadDocument', () => {
    it('should upload a document successfully', async () => {
      const fileContent = 'test document content';
      const file = new File([fileContent], 'report-card.pdf', { type: 'application/pdf' });

      const result = await handler.uploadDocument(testEnrollmentId, 'REPORT_CARD', file);

      expect(result.success).toBe(true);
      expect(result.fileUrl).toMatch(/^\/uploads\/documents\/test-enrollment-123\/report_card\/\d+-report-card\.pdf$/);
      expect(result.error).toBeUndefined();

      // Verify writeFile was called
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should create correct directory structure for documents', async () => {
      const file = new File(['test'], 'birth-cert.pdf', { type: 'application/pdf' });

      const result = await handler.uploadDocument(testEnrollmentId, 'BIRTH_CERTIFICATE', file);

      expect(result.success).toBe(true);

      // Verify mkdir was called with correct path
      const expectedPath = path.join(uploadBaseDir, 'documents', testEnrollmentId, 'birth_certificate');
      expect(fs.mkdir).toHaveBeenCalledWith(expectedPath, { recursive: true });
    });

    it('should handle different document types correctly', async () => {
      const documentTypes = [
        'REPORT_CARD',
        'BIRTH_CERTIFICATE',
        'GOOD_MORAL',
        'MARRIAGE_CONTRACT',
        'MEDICAL_RECORDS',
        'PROOF_OF_PAYMENT',
      ] as const;

      for (const docType of documentTypes) {
        const file = new File(['test'], `${docType}.pdf`, { type: 'application/pdf' });
        const result = await handler.uploadDocument(testEnrollmentId, docType, file);

        expect(result.success).toBe(true);
        expect(result.fileUrl).toContain(docType.toLowerCase());
      }
    });
  });

  describe('upload (generic method)', () => {
    it('should upload profile picture when isProfilePicture is true', async () => {
      const file = new File(['test'], 'profile.jpg', { type: 'image/jpeg' });

      const result = await handler.upload({
        enrollmentId: testEnrollmentId,
        file,
        isProfilePicture: true,
      });

      expect(result.success).toBe(true);
      expect(result.fileUrl).toContain('/profile-pictures/');
    });

    it('should upload document when documentType is provided', async () => {
      const file = new File(['test'], 'document.pdf', { type: 'application/pdf' });

      const result = await handler.upload({
        enrollmentId: testEnrollmentId,
        file,
        documentType: 'REPORT_CARD',
      });

      expect(result.success).toBe(true);
      expect(result.fileUrl).toContain('/documents/');
    });

    it('should return error when neither isProfilePicture nor documentType is provided', async () => {
      const file = new File(['test'], 'file.pdf', { type: 'application/pdf' });

      const result = await handler.upload({
        enrollmentId: testEnrollmentId,
        file,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Must specify either isProfilePicture or documentType');
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      // First upload a file
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const uploadResult = await handler.uploadProfilePicture(testEnrollmentId, file);

      expect(uploadResult.success).toBe(true);

      // Delete the file
      const deleteResult = await handler.deleteFile(uploadResult.fileUrl!);
      expect(deleteResult).toBe(true);

      // Verify unlink was called
      expect(fs.unlink).toHaveBeenCalled();
    });

    it('should return false when deleting non-existent file', async () => {
      // Mock unlink to throw an error
      vi.mocked(fs.unlink).mockRejectedValue(new Error('File not found'));
      
      const result = await handler.deleteFile('/uploads/non-existent/file.jpg');
      expect(result).toBe(false);
    });
  });

  describe('deleteEnrollmentFiles', () => {
    it('should delete all files for an enrollment', async () => {
      // Upload profile picture
      const profileFile = new File(['profile'], 'profile.jpg', { type: 'image/jpeg' });
      await handler.uploadProfilePicture(testEnrollmentId, profileFile);

      // Upload documents
      const docFile1 = new File(['doc1'], 'doc1.pdf', { type: 'application/pdf' });
      const docFile2 = new File(['doc2'], 'doc2.pdf', { type: 'application/pdf' });
      await handler.uploadDocument(testEnrollmentId, 'REPORT_CARD', docFile1);
      await handler.uploadDocument(testEnrollmentId, 'BIRTH_CERTIFICATE', docFile2);

      // Delete all enrollment files
      const result = await handler.deleteEnrollmentFiles(testEnrollmentId);
      expect(result).toBe(true);

      // Verify rm was called for both directories
      expect(fs.rm).toHaveBeenCalledTimes(2);
    });

    it('should handle deletion of non-existent enrollment files gracefully', async () => {
      const result = await handler.deleteEnrollmentFiles('non-existent-enrollment');
      expect(result).toBe(true);
    });
  });
});
