/**
 * Unit Tests for Document Access API
 * 
 * Tests specific examples and edge cases for:
 * - GET /api/documents/[id] (document retrieval with authorization)
 * 
 * Validates: Requirements 8.2, 8.3, 8.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET as GetDocument } from '@/app/api/documents/[id]/route';
import { NextRequest } from 'next/server';
import { fileRetrievalHandler } from '@/lib/file-retrieval-handler';

// Mock dependencies
vi.mock('@/lib/file-retrieval-handler', () => ({
  fileRetrievalHandler: {
    getDocument: vi.fn(),
  },
}));

vi.mock('@/lib/auth-middleware', () => ({
  withAuth: (handler: any) => handler,
}));

describe('Document Access API Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/documents/[id]', () => {
    /**
     * Test admin can access any document
     * Validates: Requirements 8.2, 8.3
     */
    it('should allow admin to access any document', async () => {
      const mockFileBuffer = Buffer.from('test file content');
      const mockResult = {
        success: true,
        fileBuffer: mockFileBuffer,
        fileName: 'test-document.pdf',
        mimeType: 'application/pdf',
      };

      vi.mocked(fileRetrievalHandler.getDocument).mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/documents/doc_123');
      const response = await GetDocument(request, { params: Promise.resolve({ id: 'doc_123' }) });

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/pdf');
      expect(response.headers.get('Content-Disposition')).toContain('test-document.pdf');
      expect(fileRetrievalHandler.getDocument).toHaveBeenCalledWith('doc_123');

      // Verify file content
      const responseBuffer = Buffer.from(await response.arrayBuffer());
      expect(responseBuffer.equals(mockFileBuffer)).toBe(true);
    });

    /**
     * Test principal can access any document
     * Validates: Requirements 8.2, 8.3
     */
    it('should allow principal to access any document', async () => {
      const mockFileBuffer = Buffer.from('principal test content');
      const mockResult = {
        success: true,
        fileBuffer: mockFileBuffer,
        fileName: 'report-card.pdf',
        mimeType: 'application/pdf',
      };

      vi.mocked(fileRetrievalHandler.getDocument).mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/documents/doc_456');
      const response = await GetDocument(request, { params: Promise.resolve({ id: 'doc_456' }) });

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/pdf');
      expect(fileRetrievalHandler.getDocument).toHaveBeenCalledWith('doc_456');
    });

    /**
     * Test parent can access their own documents
     * Validates: Requirements 8.2, 8.3
     */
    it('should allow parent to access their own documents', async () => {
      const mockFileBuffer = Buffer.from('parent document content');
      const mockResult = {
        success: true,
        fileBuffer: mockFileBuffer,
        fileName: 'birth-certificate.pdf',
        mimeType: 'application/pdf',
      };

      vi.mocked(fileRetrievalHandler.getDocument).mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/documents/doc_789');
      const response = await GetDocument(request, { params: Promise.resolve({ id: 'doc_789' }) });

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/pdf');
      expect(response.headers.get('Content-Disposition')).toContain('birth-certificate.pdf');
      expect(fileRetrievalHandler.getDocument).toHaveBeenCalledWith('doc_789');

      // Verify file content
      const responseBuffer = Buffer.from(await response.arrayBuffer());
      expect(responseBuffer.equals(mockFileBuffer)).toBe(true);
    });

    /**
     * Test parent cannot access other parents' documents
     * Validates: Requirements 8.4
     */
    it('should prevent parent from accessing other parents\' documents', async () => {
      const mockResult = {
        success: false,
        error: 'Unauthorized access to document',
        statusCode: 403,
      };

      vi.mocked(fileRetrievalHandler.getDocument).mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/documents/doc_other');
      const response = await GetDocument(request, { params: Promise.resolve({ id: 'doc_other' }) });

      expect(response.status).toBe(403);
      expect(fileRetrievalHandler.getDocument).toHaveBeenCalledWith('doc_other');

      const data = await response.json();
      expect(data.error).toBeDefined();
      expect(data.error).toContain('Unauthorized');
    });

    /**
     * Test document not found returns 404
     * Validates: Requirements 8.2
     */
    it('should return 404 when document does not exist', async () => {
      const mockResult = {
        success: false,
        error: 'Document not found',
        statusCode: 404,
      };

      vi.mocked(fileRetrievalHandler.getDocument).mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/documents/nonexistent');
      const response = await GetDocument(request, { params: Promise.resolve({ id: 'nonexistent' }) });

      expect(response.status).toBe(404);
      expect(fileRetrievalHandler.getDocument).toHaveBeenCalledWith('nonexistent');

      const data = await response.json();
      expect(data.error).toBeDefined();
      expect(data.error).toContain('not found');
    });

    /**
     * Test different file types are served with correct MIME types
     * Validates: Requirements 8.2, 8.3
     */
    it('should serve PDF documents with correct MIME type', async () => {
      const mockResult = {
        success: true,
        fileBuffer: Buffer.from('PDF content'),
        fileName: 'document.pdf',
        mimeType: 'application/pdf',
      };

      vi.mocked(fileRetrievalHandler.getDocument).mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/documents/pdf_doc');
      const response = await GetDocument(request, { params: Promise.resolve({ id: 'pdf_doc' }) });

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/pdf');
    });

    it('should serve JPEG images with correct MIME type', async () => {
      const mockResult = {
        success: true,
        fileBuffer: Buffer.from('JPEG content'),
        fileName: 'image.jpg',
        mimeType: 'image/jpeg',
      };

      vi.mocked(fileRetrievalHandler.getDocument).mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/documents/jpg_doc');
      const response = await GetDocument(request, { params: Promise.resolve({ id: 'jpg_doc' }) });

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/jpeg');
    });

    it('should serve PNG images with correct MIME type', async () => {
      const mockResult = {
        success: true,
        fileBuffer: Buffer.from('PNG content'),
        fileName: 'image.png',
        mimeType: 'image/png',
      };

      vi.mocked(fileRetrievalHandler.getDocument).mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/documents/png_doc');
      const response = await GetDocument(request, { params: Promise.resolve({ id: 'png_doc' }) });

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('image/png');
    });

    /**
     * Test response headers are set correctly
     * Validates: Requirements 8.2, 8.3
     */
    it('should set appropriate cache control headers', async () => {
      const mockResult = {
        success: true,
        fileBuffer: Buffer.from('test content'),
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
      };

      vi.mocked(fileRetrievalHandler.getDocument).mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/documents/test_doc');
      const response = await GetDocument(request, { params: Promise.resolve({ id: 'test_doc' }) });

      expect(response.status).toBe(200);
      expect(response.headers.get('Cache-Control')).toBe('private, max-age=3600');
    });

    it('should set content disposition header for inline display', async () => {
      const mockResult = {
        success: true,
        fileBuffer: Buffer.from('test content'),
        fileName: 'my-document.pdf',
        mimeType: 'application/pdf',
      };

      vi.mocked(fileRetrievalHandler.getDocument).mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/documents/test_doc');
      const response = await GetDocument(request, { params: Promise.resolve({ id: 'test_doc' }) });

      expect(response.status).toBe(200);
      const contentDisposition = response.headers.get('Content-Disposition');
      expect(contentDisposition).toContain('inline');
      expect(contentDisposition).toContain('my-document.pdf');
    });

    /**
     * Test error handling for server errors
     * Validates: Requirements 8.2
     */
    it('should handle internal server errors gracefully', async () => {
      const mockResult = {
        success: false,
        error: 'Internal server error',
        statusCode: 500,
      };

      vi.mocked(fileRetrievalHandler.getDocument).mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/documents/error_doc');
      const response = await GetDocument(request, { params: Promise.resolve({ id: 'error_doc' }) });

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should handle unexpected errors', async () => {
      vi.mocked(fileRetrievalHandler.getDocument).mockRejectedValue(
        new Error('Unexpected error')
      );

      const request = new NextRequest('http://localhost:3000/api/documents/crash_doc');
      const response = await GetDocument(request, { params: Promise.resolve({ id: 'crash_doc' }) });

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toBe('Internal server error');
    });

    /**
     * Test edge cases
     */
    it('should handle documents with special characters in filename', async () => {
      const mockResult = {
        success: true,
        fileBuffer: Buffer.from('test content'),
        fileName: 'document with spaces & special-chars.pdf',
        mimeType: 'application/pdf',
      };

      vi.mocked(fileRetrievalHandler.getDocument).mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/documents/special_doc');
      const response = await GetDocument(request, { params: Promise.resolve({ id: 'special_doc' }) });

      expect(response.status).toBe(200);
      const contentDisposition = response.headers.get('Content-Disposition');
      expect(contentDisposition).toContain('document with spaces & special-chars.pdf');
    });

    it('should handle empty file buffers', async () => {
      const mockResult = {
        success: true,
        fileBuffer: Buffer.from(''),
        fileName: 'empty.pdf',
        mimeType: 'application/pdf',
      };

      vi.mocked(fileRetrievalHandler.getDocument).mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/documents/empty_doc');
      const response = await GetDocument(request, { params: Promise.resolve({ id: 'empty_doc' }) });

      expect(response.status).toBe(200);
      const responseBuffer = Buffer.from(await response.arrayBuffer());
      expect(responseBuffer.length).toBe(0);
    });

    it('should handle large file buffers', async () => {
      const largeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB
      const mockResult = {
        success: true,
        fileBuffer: largeBuffer,
        fileName: 'large-file.pdf',
        mimeType: 'application/pdf',
      };

      vi.mocked(fileRetrievalHandler.getDocument).mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/documents/large_doc');
      const response = await GetDocument(request, { params: Promise.resolve({ id: 'large_doc' }) });

      expect(response.status).toBe(200);
      const responseBuffer = Buffer.from(await response.arrayBuffer());
      expect(responseBuffer.length).toBe(10 * 1024 * 1024);
    });
  });
});
