/**
 * Property-Based Tests for File Storage
 * 
 * Tests file storage round-trip properties:
 * - Property 9: Profile Picture Storage Round-Trip
 * - Property 14: Document Storage Round-Trip
 * 
 * Validates: Requirements 3.3, 4.6
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { FileUploadHandler } from '@/lib/file-upload-handler';
import { DocumentType } from '@/types/enrollment';
import fs from 'fs/promises';
import path from 'path';

// Mock the fs module
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

describe('File Storage Property Tests', () => {
  let handler: FileUploadHandler;
  const testEnrollmentIds: string[] = [];
  const fileStorage = new Map<string, Buffer>(); // In-memory storage for mocked files

  beforeEach(() => {
    handler = new FileUploadHandler();
    fileStorage.clear();
    vi.clearAllMocks();
    
    // Setup default mock behaviors
    vi.mocked(fs.access).mockRejectedValue(new Error('Directory does not exist'));
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    
    // Mock writeFile to store in memory
    vi.mocked(fs.writeFile).mockImplementation(async (filePath: any, data: any) => {
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
      fileStorage.set(filePath.toString(), buffer);
      return undefined;
    });
    
    // Mock readFile to retrieve from memory
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

  afterEach(() => {
    testEnrollmentIds.length = 0;
    fileStorage.clear();
    vi.restoreAllMocks();
  });

  // Generator for enrollment IDs
  const enrollmentIdGenerator = fc.uuid().map(id => {
    testEnrollmentIds.push(id);
    return id;
  });

  // Generator for valid image file content (random bytes)
  const imageContentGenerator = fc.uint8Array({ minLength: 100, maxLength: 10000 });

  // Generator for valid image filenames
  const imageFilenameGenerator = fc.record({
    name: fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
    ext: fc.constantFrom('.jpg', '.jpeg', '.png'),
  }).map(({ name, ext }) => `${name}${ext}`);

  // Generator for valid image MIME types
  const imageMimeTypeGenerator = fc.constantFrom('image/jpeg', 'image/png');

  // Generator for valid profile picture files
  const profilePictureGenerator = fc.tuple(
    imageContentGenerator,
    imageFilenameGenerator,
    imageMimeTypeGenerator
  ).map(([content, filename, mimeType]) => {
    // Convert Uint8Array to regular array to avoid type issues
    const buffer = Buffer.from(content);
    return new File([buffer], filename, { type: mimeType });
  });

  // Generator for document types
  const documentTypeGenerator = fc.constantFrom<DocumentType>(
    'REPORT_CARD',
    'BIRTH_CERTIFICATE',
    'GOOD_MORAL',
    'MARRIAGE_CONTRACT',
    'MEDICAL_RECORDS',
    'SPECIAL_NEEDS_DIAGNOSIS',
    'PROOF_OF_PAYMENT'
  );

  // Generator for valid document file content
  const documentContentGenerator = fc.uint8Array({ minLength: 100, maxLength: 50000 });

  // Generator for valid document filenames
  const documentFilenameGenerator = fc.record({
    name: fc.stringMatching(/^[a-zA-Z0-9_-]+$/),
    ext: fc.constantFrom('.pdf', '.jpg', '.jpeg', '.png'),
  }).map(({ name, ext }) => `${name}${ext}`);

  // Generator for valid document MIME types
  const documentMimeTypeGenerator = fc.constantFrom(
    'application/pdf',
    'image/jpeg',
    'image/png'
  );

  // Generator for valid document files
  const documentFileGenerator = fc.tuple(
    documentContentGenerator,
    documentFilenameGenerator,
    documentMimeTypeGenerator
  ).map(([content, filename, mimeType]) => {
    // Convert Uint8Array to regular array to avoid type issues
    const buffer = Buffer.from(content);
    return new File([buffer], filename, { type: mimeType });
  });

  /**
   * Property 9: Profile Picture Storage Round-Trip
   * 
   * For any valid profile picture upload, storing the image and then retrieving it
   * by the returned URL should produce the same image data.
   * 
   * **Validates: Requirements 3.3**
   */
  it('Property 9: Profile Picture Storage Round-Trip', async () => {
    await fc.assert(
      fc.asyncProperty(
        enrollmentIdGenerator,
        profilePictureGenerator,
        async (enrollmentId, profilePicture) => {
          // Store the profile picture
          const uploadResult = await handler.uploadProfilePicture(enrollmentId, profilePicture);

          // Verify upload was successful
          expect(uploadResult.success).toBe(true);
          expect(uploadResult.fileUrl).toBeDefined();
          expect(uploadResult.filePath).toBeDefined();

          // Retrieve the file from the filesystem using the returned URL
          const filePath = path.join(process.cwd(), 'public', uploadResult.fileUrl!);
          const retrievedBuffer = await fs.readFile(filePath);

          // Get original file content
          const originalBuffer = Buffer.from(await profilePicture.arrayBuffer());

          // Verify the retrieved data matches the original data
          expect(retrievedBuffer.equals(originalBuffer)).toBe(true);
          expect(retrievedBuffer.length).toBe(originalBuffer.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 14: Document Storage Round-Trip
   * 
   * For any valid document upload, storing the document and then retrieving it
   * by the returned URL should produce the same file data with the same filename and size.
   * 
   * **Validates: Requirements 4.6**
   */
  it('Property 14: Document Storage Round-Trip', async () => {
    await fc.assert(
      fc.asyncProperty(
        enrollmentIdGenerator,
        documentTypeGenerator,
        documentFileGenerator,
        async (enrollmentId, documentType, documentFile) => {
          // Store the document
          const uploadResult = await handler.uploadDocument(
            enrollmentId,
            documentType,
            documentFile
          );

          // Verify upload was successful
          expect(uploadResult.success).toBe(true);
          expect(uploadResult.fileUrl).toBeDefined();
          expect(uploadResult.filePath).toBeDefined();

          // Retrieve the file from the filesystem using the returned URL
          const filePath = path.join(process.cwd(), 'public', uploadResult.fileUrl!);
          const retrievedBuffer = await fs.readFile(filePath);

          // Get original file content
          const originalBuffer = Buffer.from(await documentFile.arrayBuffer());

          // Verify the retrieved data matches the original data
          expect(retrievedBuffer.equals(originalBuffer)).toBe(true);
          expect(retrievedBuffer.length).toBe(originalBuffer.length);

          // Verify the file size matches
          expect(retrievedBuffer.length).toBe(documentFile.size);

          // Verify the filename is preserved (with timestamp prefix)
          const retrievedFilename = path.basename(uploadResult.fileUrl!);
          expect(retrievedFilename).toMatch(new RegExp(`\\d+-${documentFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`));
        }
      ),
      { numRuns: 100 }
    );
  });
});
