/**
 * File Retrieval Handler for Student Enrollment System
 * 
 * Handles secure file serving with authorization checks.
 * Verifies user permissions before serving files.
 * 
 * Requirements: 8.2, 8.3, 8.4
 */

import fs from 'fs/promises';
import path from 'path';
import { Role } from '@prisma/client';
import { isAuthorizedOrOwner } from './auth-middleware';
import { prisma } from './prisma';

/**
 * Result of a file retrieval operation
 */
export interface FileRetrievalResult {
  success: boolean;
  fileBuffer?: Buffer;
  fileName?: string;
  mimeType?: string;
  error?: string;
  statusCode?: number;
}

/**
 * FileRetrievalHandler class provides methods for securely serving files
 * with proper authorization checks.
 */
export class FileRetrievalHandler {
  /**
   * Retrieves a document by ID with authorization checks
   * 
   * Authorization rules:
   * - ADMIN and PRINCIPAL can access any file
   * - PARENT can only access their own enrollment files
   * 
   * @param documentId - The document ID to retrieve
   * @returns FileRetrievalResult with file data or error
   */
  async getDocument(documentId: string): Promise<FileRetrievalResult> {
    try {
      // Fetch document from database with enrollment relationship
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          Enrollment: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (!document) {
        return {
          success: false,
          error: 'Document not found',
          statusCode: 404,
        };
      }

      // Check authorization
      const authorized = await isAuthorizedOrOwner(
        [Role.ADMIN, Role.PRINCIPAL],
        document.Enrollment.userId
      );

      if (!authorized) {
        return {
          success: false,
          error: 'Unauthorized access to document',
          statusCode: 403,
        };
      }

      // Read file from filesystem
      const filePath = path.join(process.cwd(), 'public', document.fileUrl);
      const fileBuffer = await fs.readFile(filePath);

      return {
        success: true,
        fileBuffer,
        fileName: document.fileName,
        mimeType: document.mimeType,
      };
    } catch (error) {
      console.error('Error retrieving document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during file retrieval',
        statusCode: 500,
      };
    }
  }

  /**
   * Retrieves a profile picture by enrollment ID with authorization checks
   * 
   * Authorization rules:
   * - ADMIN and PRINCIPAL can access any profile picture
   * - PARENT can only access their own enrollment profile pictures
   * 
   * @param enrollmentId - The enrollment ID
   * @param fileName - The profile picture filename
   * @returns FileRetrievalResult with file data or error
   */
  async getProfilePicture(
    enrollmentId: string,
    fileName: string
  ): Promise<FileRetrievalResult> {
    try {
      // Fetch enrollment to check ownership
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        select: {
          userId: true,
          profilePictureUrl: true,
        },
      });

      if (!enrollment) {
        return {
          success: false,
          error: 'Enrollment not found',
          statusCode: 404,
        };
      }

      // Check authorization
      const authorized = await isAuthorizedOrOwner(
        [Role.ADMIN, Role.PRINCIPAL],
        enrollment.userId
      );

      if (!authorized) {
        return {
          success: false,
          error: 'Unauthorized access to profile picture',
          statusCode: 403,
        };
      }

      // Verify the requested file matches the enrollment's profile picture
      const expectedUrl = `/uploads/profile-pictures/${enrollmentId}/${fileName}`;
      if (enrollment.profilePictureUrl !== expectedUrl) {
        return {
          success: false,
          error: 'Profile picture not found',
          statusCode: 404,
        };
      }

      // Read file from filesystem
      const filePath = path.join(process.cwd(), 'public', expectedUrl);
      const fileBuffer = await fs.readFile(filePath);

      // Determine MIME type from file extension
      const mimeType = this.getMimeTypeFromFileName(fileName);

      return {
        success: true,
        fileBuffer,
        fileName,
        mimeType,
      };
    } catch (error) {
      console.error('Error retrieving profile picture:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during file retrieval',
        statusCode: 500,
      };
    }
  }

  /**
   * Retrieves a file by URL path with authorization checks
   * 
   * This is a generic method that can handle both profile pictures and documents
   * based on the URL path structure.
   * 
   * @param fileUrl - The file URL (e.g., /uploads/profile-pictures/...)
   * @returns FileRetrievalResult with file data or error
   */
  async getFileByUrl(fileUrl: string): Promise<FileRetrievalResult> {
    try {
      // Parse URL to determine file type and enrollment ID
      const urlParts = fileUrl.split('/');
      
      if (urlParts[1] !== 'uploads') {
        return {
          success: false,
          error: 'Invalid file URL',
          statusCode: 400,
        };
      }

      const fileType = urlParts[2]; // 'profile-pictures' or 'documents'
      const enrollmentId = urlParts[3];

      if (!enrollmentId) {
        return {
          success: false,
          error: 'Invalid file URL',
          statusCode: 400,
        };
      }

      // Fetch enrollment to check ownership
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        select: {
          userId: true,
        },
      });

      if (!enrollment) {
        return {
          success: false,
          error: 'Enrollment not found',
          statusCode: 404,
        };
      }

      // Check authorization
      const authorized = await isAuthorizedOrOwner(
        [Role.ADMIN, Role.PRINCIPAL],
        enrollment.userId
      );

      if (!authorized) {
        return {
          success: false,
          error: 'Unauthorized access to file',
          statusCode: 403,
        };
      }

      // Read file from filesystem
      const filePath = path.join(process.cwd(), 'public', fileUrl);
      const fileBuffer = await fs.readFile(filePath);

      // Extract filename from URL
      const fileName = urlParts[urlParts.length - 1];
      const mimeType = this.getMimeTypeFromFileName(fileName);

      return {
        success: true,
        fileBuffer,
        fileName,
        mimeType,
      };
    } catch (error) {
      console.error('Error retrieving file by URL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during file retrieval',
        statusCode: 500,
      };
    }
  }

  /**
   * Determines MIME type from file extension
   * 
   * @param fileName - The filename with extension
   * @returns The MIME type string
   */
  private getMimeTypeFromFileName(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.pdf': 'application/pdf',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}

// Export a singleton instance for convenience
export const fileRetrievalHandler = new FileRetrievalHandler();
