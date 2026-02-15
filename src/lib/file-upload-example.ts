/**
 * Example usage of FileUploadHandler in API routes
 * 
 * This file demonstrates how to integrate the file upload handler
 * with Next.js API routes for the enrollment system.
 */

import { fileUploadHandler } from './file-upload-handler';
import { enrollmentValidator } from './enrollment-validator';
import { DocumentType } from '@/types/enrollment';

/**
 * Example: Upload profile picture endpoint
 * POST /api/enrollments/[id]/profile-picture
 */
export async function uploadProfilePictureExample(
  enrollmentId: string,
  file: File
): Promise<{ success: boolean; fileUrl?: string; errors?: any[] }> {
  // Step 1: Validate the file
  const validationErrors = enrollmentValidator.validateProfilePicture(file);
  
  if (validationErrors.length > 0) {
    return {
      success: false,
      errors: validationErrors,
    };
  }
  
  // Step 2: Upload the file
  const uploadResult = await fileUploadHandler.uploadProfilePicture(
    enrollmentId,
    file
  );
  
  if (!uploadResult.success) {
    return {
      success: false,
      errors: [{ field: 'profilePicture', message: uploadResult.error }],
    };
  }
  
  // Step 3: Return the file URL
  // In a real implementation, you would also update the database
  // with the file URL before returning
  return {
    success: true,
    fileUrl: uploadResult.fileUrl,
  };
}

/**
 * Example: Upload document endpoint
 * POST /api/enrollments/[id]/documents
 */
export async function uploadDocumentExample(
  enrollmentId: string,
  documentType: DocumentType,
  file: File
): Promise<{ success: boolean; fileUrl?: string; documentId?: string; errors?: any[] }> {
  // Step 1: Validate the file
  const validationErrors = enrollmentValidator.validateDocument(file, documentType);
  
  if (validationErrors.length > 0) {
    return {
      success: false,
      errors: validationErrors,
    };
  }
  
  // Step 2: Upload the file
  const uploadResult = await fileUploadHandler.uploadDocument(
    enrollmentId,
    documentType,
    file
  );
  
  if (!uploadResult.success) {
    return {
      success: false,
      errors: [{ field: documentType, message: uploadResult.error }],
    };
  }
  
  // Step 3: Create database record
  // In a real implementation, you would create a Document record in the database:
  /*
  const document = await prisma.document.create({
    data: {
      enrollmentId,
      type: documentType,
      fileName: file.name,
      fileSize: file.size,
      fileUrl: uploadResult.fileUrl!,
      mimeType: file.type,
    },
  });
  
  return {
    success: true,
    fileUrl: uploadResult.fileUrl,
    documentId: document.id,
  };
  */
  
  // For this example, we just return the file URL
  return {
    success: true,
    fileUrl: uploadResult.fileUrl,
    documentId: 'example-doc-id',
  };
}

/**
 * Example: Complete enrollment submission with files
 * POST /api/enrollments
 */
export async function createEnrollmentWithFilesExample(
  enrollmentData: any,
  profilePicture: File,
  documents: Array<{ type: DocumentType; file: File }>
): Promise<{ success: boolean; enrollmentId?: string; errors?: any[] }> {
  // This would be a multi-step process:
  
  // Step 1: Validate all data (not shown here)
  
  // Step 2: Create enrollment record in database (not shown here)
  const enrollmentId = 'example-enrollment-id';
  
  // Step 3: Upload profile picture
  const profileResult = await fileUploadHandler.uploadProfilePicture(
    enrollmentId,
    profilePicture
  );
  
  if (!profileResult.success) {
    // Rollback: delete enrollment record
    return {
      success: false,
      errors: [{ field: 'profilePicture', message: profileResult.error }],
    };
  }
  
  // Step 4: Upload all documents
  const documentResults = [];
  for (const doc of documents) {
    const docResult = await fileUploadHandler.uploadDocument(
      enrollmentId,
      doc.type,
      doc.file
    );
    
    if (!docResult.success) {
      // Rollback: delete all uploaded files and enrollment record
      await fileUploadHandler.deleteEnrollmentFiles(enrollmentId);
      return {
        success: false,
        errors: [{ field: doc.type, message: docResult.error }],
      };
    }
    
    documentResults.push(docResult);
  }
  
  // Step 5: Update database with file URLs (not shown here)
  
  return {
    success: true,
    enrollmentId,
  };
}

/**
 * Example: Delete enrollment with cascade file deletion
 * DELETE /api/enrollments/[id]
 */
export async function deleteEnrollmentExample(
  enrollmentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Step 1: Delete all files from filesystem
    const filesDeleted = await fileUploadHandler.deleteEnrollmentFiles(enrollmentId);
    
    if (!filesDeleted) {
      console.warn(`Failed to delete files for enrollment ${enrollmentId}`);
      // Continue anyway - database cleanup is more important
    }
    
    // Step 2: Delete enrollment from database (cascade deletes documents)
    // await prisma.enrollment.delete({ where: { id: enrollmentId } });
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
