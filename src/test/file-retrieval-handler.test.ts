/**
 * Unit tests for File Retrieval Handler
 * 
 * Tests secure file serving with authorization checks
 * Requirements: 8.2, 8.3, 8.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FileRetrievalHandler } from '@/lib/file-retrieval-handler';
import { Role } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

// Mock dependencies
vi.mock('@/lib/auth-middleware', () => ({
  isAuthorizedOrOwner: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    document: {
      findUnique: vi.fn(),
    },
    enrollment: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('fs/promises');

import { isAuthorizedOrOwner } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

describe('FileRetrievalHandler', () => {
  let handler: FileRetrievalHandler;

  beforeEach(() => {
    handler = new FileRetrievalHandler();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getDocument', () => {
    it('should return document when user is authorized', async () => {
      // Arrange
      const documentId = 'doc-123';
      const mockDocument = {
        id: documentId,
        enrollmentId: 'enroll-123',
        fileName: 'test-document.pdf',
        fileUrl: '/uploads/documents/enroll-123/report_card/test-document.pdf',
        mimeType: 'application/pdf',
        Enrollment: {
          userId: 'user-123',
        },
      };

      const mockFileBuffer = Buffer.from('test file content');

      vi.mocked(prisma.document.findUnique).mockResolvedValue(mockDocument as any);
      vi.mocked(isAuthorizedOrOwner).mockResolvedValue(true);
      vi.mocked(fs.readFile).mockResolvedValue(mockFileBuffer);

      // Act
      const result = await handler.getDocument(documentId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.fileBuffer).toEqual(mockFileBuffer);
      expect(result.fileName).toBe('test-document.pdf');
      expect(result.mimeType).toBe('application/pdf');
      expect(prisma.document.findUnique).toHaveBeenCalledWith({
        where: { id: documentId },
        include: {
          Enrollment: {
            select: {
              userId: true,
            },
          },
        },
      });
      expect(isAuthorizedOrOwner).toHaveBeenCalledWith(
        [Role.ADMIN, Role.PRINCIPAL],
        'user-123'
      );
    });

    it('should return 404 when document does not exist', async () => {
      // Arrange
      vi.mocked(prisma.document.findUnique).mockResolvedValue(null);

      // Act
      const result = await handler.getDocument('non-existent-doc');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Document not found');
      expect(result.statusCode).toBe(404);
    });

    it('should return 403 when user is not authorized', async () => {
      // Arrange
      const mockDocument = {
        id: 'doc-123',
        enrollmentId: 'enroll-123',
        fileName: 'test-document.pdf',
        fileUrl: '/uploads/documents/enroll-123/report_card/test-document.pdf',
        mimeType: 'application/pdf',
        Enrollment: {
          userId: 'user-123',
        },
      };

      vi.mocked(prisma.document.findUnique).mockResolvedValue(mockDocument as any);
      vi.mocked(isAuthorizedOrOwner).mockResolvedValue(false);

      // Act
      const result = await handler.getDocument('doc-123');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized access to document');
      expect(result.statusCode).toBe(403);
      expect(fs.readFile).not.toHaveBeenCalled();
    });

    it('should return 500 when file read fails', async () => {
      // Arrange
      const mockDocument = {
        id: 'doc-123',
        enrollmentId: 'enroll-123',
        fileName: 'test-document.pdf',
        fileUrl: '/uploads/documents/enroll-123/report_card/test-document.pdf',
        mimeType: 'application/pdf',
        Enrollment: {
          userId: 'user-123',
        },
      };

      vi.mocked(prisma.document.findUnique).mockResolvedValue(mockDocument as any);
      vi.mocked(isAuthorizedOrOwner).mockResolvedValue(true);
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found on disk'));

      // Act
      const result = await handler.getDocument('doc-123');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('File not found on disk');
      expect(result.statusCode).toBe(500);
    });
  });

  describe('getProfilePicture', () => {
    it('should return profile picture when user is authorized', async () => {
      // Arrange
      const enrollmentId = 'enroll-123';
      const fileName = '1234567890-profile.jpg';
      const mockEnrollment = {
        userId: 'user-123',
        profilePictureUrl: `/uploads/profile-pictures/${enrollmentId}/${fileName}`,
      };

      const mockFileBuffer = Buffer.from('test image content');

      vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(mockEnrollment as any);
      vi.mocked(isAuthorizedOrOwner).mockResolvedValue(true);
      vi.mocked(fs.readFile).mockResolvedValue(mockFileBuffer);

      // Act
      const result = await handler.getProfilePicture(enrollmentId, fileName);

      // Assert
      expect(result.success).toBe(true);
      expect(result.fileBuffer).toEqual(mockFileBuffer);
      expect(result.fileName).toBe(fileName);
      expect(result.mimeType).toBe('image/jpeg');
      expect(prisma.enrollment.findUnique).toHaveBeenCalledWith({
        where: { id: enrollmentId },
        select: {
          userId: true,
          profilePictureUrl: true,
        },
      });
      expect(isAuthorizedOrOwner).toHaveBeenCalledWith(
        [Role.ADMIN, Role.PRINCIPAL],
        'user-123'
      );
    });

    it('should return 404 when enrollment does not exist', async () => {
      // Arrange
      vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null);

      // Act
      const result = await handler.getProfilePicture('non-existent-enroll', 'profile.jpg');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Enrollment not found');
      expect(result.statusCode).toBe(404);
    });

    it('should return 403 when user is not authorized', async () => {
      // Arrange
      const enrollmentId = 'enroll-123';
      const fileName = '1234567890-profile.jpg';
      const mockEnrollment = {
        userId: 'user-123',
        profilePictureUrl: `/uploads/profile-pictures/${enrollmentId}/${fileName}`,
      };

      vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(mockEnrollment as any);
      vi.mocked(isAuthorizedOrOwner).mockResolvedValue(false);

      // Act
      const result = await handler.getProfilePicture(enrollmentId, fileName);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized access to profile picture');
      expect(result.statusCode).toBe(403);
      expect(fs.readFile).not.toHaveBeenCalled();
    });

    it('should return 404 when requested file does not match enrollment profile picture', async () => {
      // Arrange
      const enrollmentId = 'enroll-123';
      const fileName = 'wrong-file.jpg';
      const mockEnrollment = {
        userId: 'user-123',
        profilePictureUrl: `/uploads/profile-pictures/${enrollmentId}/correct-file.jpg`,
      };

      vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(mockEnrollment as any);
      vi.mocked(isAuthorizedOrOwner).mockResolvedValue(true);

      // Act
      const result = await handler.getProfilePicture(enrollmentId, fileName);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Profile picture not found');
      expect(result.statusCode).toBe(404);
      expect(fs.readFile).not.toHaveBeenCalled();
    });

    it('should correctly determine MIME type for PNG files', async () => {
      // Arrange
      const enrollmentId = 'enroll-123';
      const fileName = '1234567890-profile.png';
      const mockEnrollment = {
        userId: 'user-123',
        profilePictureUrl: `/uploads/profile-pictures/${enrollmentId}/${fileName}`,
      };

      const mockFileBuffer = Buffer.from('test image content');

      vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(mockEnrollment as any);
      vi.mocked(isAuthorizedOrOwner).mockResolvedValue(true);
      vi.mocked(fs.readFile).mockResolvedValue(mockFileBuffer);

      // Act
      const result = await handler.getProfilePicture(enrollmentId, fileName);

      // Assert
      expect(result.success).toBe(true);
      expect(result.mimeType).toBe('image/png');
    });
  });

  describe('getFileByUrl', () => {
    it('should return file when user is authorized for profile picture URL', async () => {
      // Arrange
      const enrollmentId = 'enroll-123';
      const fileName = '1234567890-profile.jpg';
      const fileUrl = `/uploads/profile-pictures/${enrollmentId}/${fileName}`;
      const mockEnrollment = {
        userId: 'user-123',
      };

      const mockFileBuffer = Buffer.from('test file content');

      vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(mockEnrollment as any);
      vi.mocked(isAuthorizedOrOwner).mockResolvedValue(true);
      vi.mocked(fs.readFile).mockResolvedValue(mockFileBuffer);

      // Act
      const result = await handler.getFileByUrl(fileUrl);

      // Assert
      expect(result.success).toBe(true);
      expect(result.fileBuffer).toEqual(mockFileBuffer);
      expect(result.fileName).toBe(fileName);
      expect(result.mimeType).toBe('image/jpeg');
    });

    it('should return file when user is authorized for document URL', async () => {
      // Arrange
      const enrollmentId = 'enroll-123';
      const fileName = '1234567890-document.pdf';
      const fileUrl = `/uploads/documents/${enrollmentId}/report_card/${fileName}`;
      const mockEnrollment = {
        userId: 'user-123',
      };

      const mockFileBuffer = Buffer.from('test file content');

      vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(mockEnrollment as any);
      vi.mocked(isAuthorizedOrOwner).mockResolvedValue(true);
      vi.mocked(fs.readFile).mockResolvedValue(mockFileBuffer);

      // Act
      const result = await handler.getFileByUrl(fileUrl);

      // Assert
      expect(result.success).toBe(true);
      expect(result.fileBuffer).toEqual(mockFileBuffer);
      expect(result.fileName).toBe(fileName);
      expect(result.mimeType).toBe('application/pdf');
    });

    it('should return 400 for invalid URL format', async () => {
      // Act
      const result = await handler.getFileByUrl('/invalid/url');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid file URL');
      expect(result.statusCode).toBe(400);
    });

    it('should return 404 when enrollment does not exist', async () => {
      // Arrange
      const fileUrl = '/uploads/profile-pictures/non-existent/file.jpg';
      vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null);

      // Act
      const result = await handler.getFileByUrl(fileUrl);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Enrollment not found');
      expect(result.statusCode).toBe(404);
    });

    it('should return 403 when user is not authorized', async () => {
      // Arrange
      const fileUrl = '/uploads/profile-pictures/enroll-123/file.jpg';
      const mockEnrollment = {
        userId: 'user-123',
      };

      vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(mockEnrollment as any);
      vi.mocked(isAuthorizedOrOwner).mockResolvedValue(false);

      // Act
      const result = await handler.getFileByUrl(fileUrl);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized access to file');
      expect(result.statusCode).toBe(403);
      expect(fs.readFile).not.toHaveBeenCalled();
    });
  });

  describe('MIME type detection', () => {
    it('should return correct MIME type for JPEG files', async () => {
      // Arrange
      const enrollmentId = 'enroll-123';
      const fileName = 'test.jpeg';
      const fileUrl = `/uploads/profile-pictures/${enrollmentId}/${fileName}`;
      const mockEnrollment = { userId: 'user-123' };
      const mockFileBuffer = Buffer.from('test');

      vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(mockEnrollment as any);
      vi.mocked(isAuthorizedOrOwner).mockResolvedValue(true);
      vi.mocked(fs.readFile).mockResolvedValue(mockFileBuffer);

      // Act
      const result = await handler.getFileByUrl(fileUrl);

      // Assert
      expect(result.mimeType).toBe('image/jpeg');
    });

    it('should return correct MIME type for PDF files', async () => {
      // Arrange
      const enrollmentId = 'enroll-123';
      const fileName = 'test.pdf';
      const fileUrl = `/uploads/documents/${enrollmentId}/report_card/${fileName}`;
      const mockEnrollment = { userId: 'user-123' };
      const mockFileBuffer = Buffer.from('test');

      vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(mockEnrollment as any);
      vi.mocked(isAuthorizedOrOwner).mockResolvedValue(true);
      vi.mocked(fs.readFile).mockResolvedValue(mockFileBuffer);

      // Act
      const result = await handler.getFileByUrl(fileUrl);

      // Assert
      expect(result.mimeType).toBe('application/pdf');
    });

    it('should return default MIME type for unknown extensions', async () => {
      // Arrange
      const enrollmentId = 'enroll-123';
      const fileName = 'test.unknown';
      const fileUrl = `/uploads/documents/${enrollmentId}/report_card/${fileName}`;
      const mockEnrollment = { userId: 'user-123' };
      const mockFileBuffer = Buffer.from('test');

      vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(mockEnrollment as any);
      vi.mocked(isAuthorizedOrOwner).mockResolvedValue(true);
      vi.mocked(fs.readFile).mockResolvedValue(mockFileBuffer);

      // Act
      const result = await handler.getFileByUrl(fileUrl);

      // Assert
      expect(result.mimeType).toBe('application/octet-stream');
    });
  });
});
