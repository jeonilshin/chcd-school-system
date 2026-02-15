/**
 * File Upload Handler for Student Enrollment System
 * 
 * Handles file storage to local filesystem with proper directory structure
 * and unique filename generation.
 * 
 * Requirements: 3.3, 4.6, 8.1
 */

import fs from 'fs/promises';
import path from 'path';
import { DocumentType } from '@/types/enrollment';

/**
 * Configuration for file storage
 */
const UPLOAD_BASE_DIR = path.join(process.cwd(), 'public', 'uploads');

/**
 * Result of a file upload operation
 */
export interface FileUploadResult {
  success: boolean;
  fileUrl?: string;
  filePath?: string;
  error?: string;
}

/**
 * Options for file upload
 */
export interface FileUploadOptions {
  enrollmentId: string;
  file: File;
  documentType?: DocumentType;
  isProfilePicture?: boolean;
}

/**
 * FileUploadHandler class provides methods for storing files to the local filesystem
 * with proper directory structure and unique filename generation.
 */
export class FileUploadHandler {
  /**
   * Uploads a profile picture for an enrollment
   * 
   * Storage path: /uploads/profile-pictures/{enrollmentId}/
   * Filename format: {timestamp}-{originalFilename}
   * 
   * @param enrollmentId - The enrollment ID
   * @param file - The file to upload
   * @returns FileUploadResult with success status and file URL
   */
  async uploadProfilePicture(
    enrollmentId: string,
    file: File
  ): Promise<FileUploadResult> {
    try {
      // Create directory structure
      const dirPath = path.join(UPLOAD_BASE_DIR, 'profile-pictures', enrollmentId);
      await this.ensureDirectoryExists(dirPath);

      // Generate unique filename with timestamp
      const filename = this.generateUniqueFilename(file.name);
      const filePath = path.join(dirPath, filename);

      // Write file to filesystem
      await this.writeFile(filePath, file);

      // Generate URL for accessing the file
      const fileUrl = `/uploads/profile-pictures/${enrollmentId}/${filename}`;

      return {
        success: true,
        fileUrl,
        filePath,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during file upload',
      };
    }
  }

  /**
   * Uploads a document for an enrollment
   * 
   * Storage path: /uploads/documents/{enrollmentId}/{documentType}/
   * Filename format: {timestamp}-{originalFilename}
   * 
   * @param enrollmentId - The enrollment ID
   * @param documentType - The type of document being uploaded
   * @param file - The file to upload
   * @returns FileUploadResult with success status and file URL
   */
  async uploadDocument(
    enrollmentId: string,
    documentType: DocumentType,
    file: File
  ): Promise<FileUploadResult> {
    try {
      // Create directory structure
      const dirPath = path.join(
        UPLOAD_BASE_DIR,
        'documents',
        enrollmentId,
        documentType.toLowerCase()
      );
      await this.ensureDirectoryExists(dirPath);

      // Generate unique filename with timestamp
      const filename = this.generateUniqueFilename(file.name);
      const filePath = path.join(dirPath, filename);

      // Write file to filesystem
      await this.writeFile(filePath, file);

      // Generate URL for accessing the file
      const fileUrl = `/uploads/documents/${enrollmentId}/${documentType.toLowerCase()}/${filename}`;

      return {
        success: true,
        fileUrl,
        filePath,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during file upload',
      };
    }
  }

  /**
   * Generic upload method that determines the upload type based on options
   * 
   * @param options - Upload options including enrollmentId, file, and type information
   * @returns FileUploadResult with success status and file URL
   */
  async upload(options: FileUploadOptions): Promise<FileUploadResult> {
    if (options.isProfilePicture) {
      return this.uploadProfilePicture(options.enrollmentId, options.file);
    } else if (options.documentType) {
      return this.uploadDocument(options.enrollmentId, options.documentType, options.file);
    } else {
      return {
        success: false,
        error: 'Must specify either isProfilePicture or documentType',
      };
    }
  }

  /**
   * Deletes a file from the filesystem
   * 
   * @param fileUrl - The URL of the file to delete (e.g., /uploads/profile-pictures/...)
   * @returns Promise<boolean> indicating success
   */
  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      // Convert URL to filesystem path
      const filePath = path.join(process.cwd(), 'public', fileUrl);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Deletes all files for an enrollment (used for cascade delete)
   * 
   * @param enrollmentId - The enrollment ID
   * @returns Promise<boolean> indicating success
   */
  async deleteEnrollmentFiles(enrollmentId: string): Promise<boolean> {
    try {
      // Delete profile pictures
      const profilePicDir = path.join(UPLOAD_BASE_DIR, 'profile-pictures', enrollmentId);
      await this.deleteDirectory(profilePicDir);

      // Delete documents
      const documentsDir = path.join(UPLOAD_BASE_DIR, 'documents', enrollmentId);
      await this.deleteDirectory(documentsDir);

      return true;
    } catch (error) {
      console.error('Error deleting enrollment files:', error);
      return false;
    }
  }

  /**
   * Ensures a directory exists, creating it if necessary
   * 
   * @param dirPath - The directory path to ensure exists
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      // Directory doesn't exist, create it recursively
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Generates a unique filename using timestamp and original filename
   * 
   * Format: {timestamp}-{originalFilename}
   * 
   * @param originalFilename - The original filename
   * @returns A unique filename with timestamp prefix
   */
  private generateUniqueFilename(originalFilename: string): string {
    const timestamp = Date.now();
    // Sanitize filename to remove potentially problematic characters
    const sanitized = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${timestamp}-${sanitized}`;
  }

  /**
   * Writes a File object to the filesystem
   * 
   * @param filePath - The destination file path
   * @param file - The File object to write
   */
  private async writeFile(filePath: string, file: File): Promise<void> {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Write to filesystem
    await fs.writeFile(filePath, buffer);
  }

  /**
   * Recursively deletes a directory and all its contents
   * 
   * @param dirPath - The directory path to delete
   */
  private async deleteDirectory(dirPath: string): Promise<void> {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
    } catch (error) {
      // Ignore errors if directory doesn't exist
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

// Export a singleton instance for convenience
export const fileUploadHandler = new FileUploadHandler();
