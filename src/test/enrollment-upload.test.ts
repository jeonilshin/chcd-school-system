import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { $Enums } from '@prisma/client';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    enrollment: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    document: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth-middleware', () => ({
  requireRole: vi.fn(),
}));

vi.mock('@/lib/file-upload-handler', () => ({
  FileUploadHandler: vi.fn().mockImplementation(() => ({
    uploadProfilePicture: vi.fn(),
    uploadDocument: vi.fn(),
    deleteFile: vi.fn(),
  })),
}));

// Import after mocks
import { POST } from '@/app/api/enrollments/[id]/upload/route';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-middleware';
import { FileUploadHandler } from '@/lib/file-upload-handler';

describe('POST /api/enrollments/[id]/upload', () => {
  const mockUser = {
    id: 'user_123',
    email: 'parent@example.com',
    name: 'Test Parent',
    role: $Enums.Role.PARENT,
  };

  const mockEnrollment = {
    id: 'enr_123',
    userId: 'user_123',
    schoolYear: '2024',
    program: 'Playschool AM',
    studentStatus: 'NEW_STUDENT',
    status: 'PENDING',
  };

  // Mock FileUploadHandler methods
  let mockUploadProfilePicture: any;
  let mockUploadDocument: any;
  let mockDeleteFile: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Get the mocked constructor and set up method mocks
    const MockedFileUploadHandler = vi.mocked(FileUploadHandler);
    mockUploadProfilePicture = vi.fn();
    mockUploadDocument = vi.fn();
    mockDeleteFile = vi.fn();
    
    MockedFileUploadHandler.mockImplementation(() => ({
      uploadProfilePicture: mockUploadProfilePicture,
      uploadDocument: mockUploadDocument,
      deleteFile: mockDeleteFile,
    } as any));
    
    vi.mocked(requireRole).mockResolvedValue(mockUser);
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(mockEnrollment as any);
  });

  describe('Profile Picture Upload', () => {
    it('should upload profile picture successfully', async () => {
      const mockFile = new File(['test'], 'profile.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 }); // 1MB

      mockUploadProfilePicture.mockResolvedValue({
        success: true,
        fileUrl: '/uploads/profile-pictures/enr_123/profile.jpg',
        filePath: '/path/to/file',
      });

      vi.mocked(prisma.enrollment.update).mockResolvedValue({
        ...mockEnrollment,
        profilePictureUrl: '/uploads/profile-pictures/enr_123/profile.jpg',
      } as any);

      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('isProfilePicture', 'true');

      const request = new NextRequest('http://localhost:3000/api/enrollments/enr_123/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request, { params: { id: 'enr_123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.fileUrl).toBe('/uploads/profile-pictures/enr_123/profile.jpg');
      expect(data.message).toBe('Profile picture uploaded successfully');
      expect(mockUploadProfilePicture).toHaveBeenCalledWith('enr_123', mockFile);
      expect(prisma.enrollment.update).toHaveBeenCalled();
    });

    it('should reject profile picture exceeding size limit', async () => {
      // Create a large buffer to simulate a file exceeding 100MB
      const largeBuffer = Buffer.alloc(101 * 1024 * 1024); // 101MB
      const mockFile = new File([largeBuffer], 'profile.jpg', { type: 'image/jpeg' });

      // Mock the validator to return an error for oversized file
      mockUploadProfilePicture.mockResolvedValue({
        success: true,
        fileUrl: '/uploads/profile-pictures/enr_123/profile.jpg',
        filePath: '/path/to/file',
      });

      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('isProfilePicture', 'true');

      const request = new NextRequest('http://localhost:3000/api/enrollments/enr_123/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request, { params: { id: 'enr_123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toBeDefined();
      expect(data.errors.some((e: any) => e.field === 'profilePicture')).toBe(true);
      expect(mockUploadProfilePicture).not.toHaveBeenCalled();
    });

    it('should reject profile picture with invalid format', async () => {
      const mockFile = new File(['test'], 'profile.txt', { type: 'text/plain' });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 }); // 1MB

      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('isProfilePicture', 'true');

      const request = new NextRequest('http://localhost:3000/api/enrollments/enr_123/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request, { params: { id: 'enr_123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toBeDefined();
      expect(data.errors.some((e: any) => e.field === 'profilePicture')).toBe(true);
      expect(mockUploadProfilePicture).not.toHaveBeenCalled();
    });
  });

  describe('Document Upload', () => {
    it('should upload document successfully', async () => {
      const mockFile = new File(['test'], 'report-card.pdf', { type: 'application/pdf' });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 }); // 1MB

      mockUploadDocument.mockResolvedValue({
        success: true,
        fileUrl: '/uploads/documents/enr_123/report_card/report-card.pdf',
        filePath: '/path/to/file',
      });

      const mockDocument = {
        id: 'doc_123',
        enrollmentId: 'enr_123',
        type: 'REPORT_CARD',
        fileName: 'report-card.pdf',
        fileSize: 1024 * 1024,
        fileUrl: '/uploads/documents/enr_123/report_card/report-card.pdf',
        mimeType: 'application/pdf',
        uploadedAt: new Date(),
      };

      vi.mocked(prisma.document.create).mockResolvedValue(mockDocument as any);

      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('documentType', 'REPORT_CARD');

      const request = new NextRequest('http://localhost:3000/api/enrollments/enr_123/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request, { params: { id: 'enr_123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.documentId).toBe('doc_123');
      expect(data.fileUrl).toBe('/uploads/documents/enr_123/report_card/report-card.pdf');
      expect(data.message).toBe('Document uploaded successfully');
      expect(mockUploadDocument).toHaveBeenCalledWith('enr_123', 'REPORT_CARD', mockFile);
      expect(prisma.document.create).toHaveBeenCalled();
    });

    it('should reject document with invalid format', async () => {
      const mockFile = new File(['test'], 'document.txt', { type: 'text/plain' });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 }); // 1MB

      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('documentType', 'REPORT_CARD');

      const request = new NextRequest('http://localhost:3000/api/enrollments/enr_123/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request, { params: { id: 'enr_123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.errors).toBeDefined();
      expect(data.errors.some((e: any) => e.field === 'REPORT_CARD')).toBe(true);
      expect(mockUploadDocument).not.toHaveBeenCalled();
    });
  });

  describe('Authorization and Validation', () => {
    it('should return 404 if enrollment not found', async () => {
      vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null);

      const mockFile = new File(['test'], 'profile.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 });

      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('isProfilePicture', 'true');

      const request = new NextRequest('http://localhost:3000/api/enrollments/enr_999/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request, { params: { id: 'enr_999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Enrollment not found');
    });

    it('should return 403 if user does not own enrollment', async () => {
      vi.mocked(prisma.enrollment.findUnique).mockResolvedValue({
        ...mockEnrollment,
        userId: 'different_user',
      } as any);

      const mockFile = new File(['test'], 'profile.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 });

      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('isProfilePicture', 'true');

      const request = new NextRequest('http://localhost:3000/api/enrollments/enr_123/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request, { params: { id: 'enr_123' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized to upload files for this enrollment');
    });

    it('should return 400 if no file provided', async () => {
      const formData = new FormData();
      formData.append('isProfilePicture', 'true');

      const request = new NextRequest('http://localhost:3000/api/enrollments/enr_123/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request, { params: { id: 'enr_123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('No file provided');
    });

    it('should return 400 if neither isProfilePicture nor documentType specified', async () => {
      const mockFile = new File(['test'], 'file.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 });

      const formData = new FormData();
      formData.append('file', mockFile);

      const request = new NextRequest('http://localhost:3000/api/enrollments/enr_123/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request, { params: { id: 'enr_123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Must specify either isProfilePicture or documentType');
    });

    it('should require PARENT role', async () => {
      vi.mocked(requireRole).mockRejectedValue({
        name: 'ForbiddenError',
        message: 'Insufficient permissions',
      });

      const mockFile = new File(['test'], 'profile.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 });

      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('isProfilePicture', 'true');

      const request = new NextRequest('http://localhost:3000/api/enrollments/enr_123/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request, { params: { id: 'enr_123' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Insufficient permissions');
    });
  });

  describe('File Storage Transaction Ordering', () => {
    it('should store file before creating database record', async () => {
      const mockFile = new File(['test'], 'report-card.pdf', { type: 'application/pdf' });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 });

      const uploadOrder: string[] = [];

      mockUploadDocument.mockImplementation(async () => {
        uploadOrder.push('file-upload');
        return {
          success: true,
          fileUrl: '/uploads/documents/enr_123/report_card/report-card.pdf',
          filePath: '/path/to/file',
        };
      });

      const mockDocumentCreate = vi.fn().mockImplementation(async () => {
        uploadOrder.push('database-create');
        return {
          id: 'doc_123',
          enrollmentId: 'enr_123',
          type: 'REPORT_CARD',
          fileName: 'report-card.pdf',
          fileSize: 1024 * 1024,
          fileUrl: '/uploads/documents/enr_123/report_card/report-card.pdf',
          mimeType: 'application/pdf',
          uploadedAt: new Date(),
        };
      });

      vi.mocked(prisma.document.create).mockImplementation(mockDocumentCreate as any);

      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('documentType', 'REPORT_CARD');

      const request = new NextRequest('http://localhost:3000/api/enrollments/enr_123/upload', {
        method: 'POST',
        body: formData,
      });

      await POST(request, { params: { id: 'enr_123' } });

      // Verify file upload happened before database create
      expect(uploadOrder).toEqual(['file-upload', 'database-create']);
    });

    it('should clean up uploaded file if database operation fails', async () => {
      const mockFile = new File(['test'], 'report-card.pdf', { type: 'application/pdf' });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 });

      mockUploadDocument.mockResolvedValue({
        success: true,
        fileUrl: '/uploads/documents/enr_123/report_card/report-card.pdf',
        filePath: '/path/to/file',
      });

      vi.mocked(prisma.document.create).mockRejectedValue(new Error('Database error'));

      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('documentType', 'REPORT_CARD');

      const request = new NextRequest('http://localhost:3000/api/enrollments/enr_123/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request, { params: { id: 'enr_123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to save file information to database');
      
      // Verify file cleanup was attempted
      expect(mockDeleteFile).toHaveBeenCalledWith('/uploads/documents/enr_123/report_card/report-card.pdf');
    });

    it('should return error if file upload fails', async () => {
      const mockFile = new File(['test'], 'report-card.pdf', { type: 'application/pdf' });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 });

      mockUploadDocument.mockResolvedValue({
        success: false,
        error: 'File system error',
      });

      const formData = new FormData();
      formData.append('file', mockFile);
      formData.append('documentType', 'REPORT_CARD');

      const request = new NextRequest('http://localhost:3000/api/enrollments/enr_123/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request, { params: { id: 'enr_123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('File system error');
      
      // Verify database operation was not attempted
      expect(prisma.document.create).not.toHaveBeenCalled();
      expect(prisma.enrollment.update).not.toHaveBeenCalled();
    });
  });
});
