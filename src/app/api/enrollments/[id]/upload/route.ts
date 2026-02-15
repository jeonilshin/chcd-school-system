import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-middleware';
import { EnrollmentValidator } from '@/lib/enrollment-validator';
import { FileUploadHandler } from '@/lib/file-upload-handler';
import { $Enums } from '@prisma/client';
import { DocumentType } from '@/types/enrollment';

/**
 * POST /api/enrollments/[id]/upload
 * Upload files (profile pictures and documents) for an enrollment
 * 
 * Requirements: 3.1, 3.2, 3.3, 4.5, 4.6, 10.2
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require PARENT role for file uploads (Requirement 7.1)
    const user = await requireRole([$Enums.Role.PARENT]);

    const { id: enrollmentId } = await params;

    // Verify enrollment exists and belongs to the user
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    if (enrollment.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to upload files for this enrollment' },
        { status: 403 }
      );
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const documentType = formData.get('documentType') as string | null;
    const isProfilePicture = formData.get('isProfilePicture') === 'true';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file based on type
    const validator = new EnrollmentValidator();
    let validationErrors;

    if (isProfilePicture) {
      // Validate profile picture (Requirements 3.1, 3.2)
      validationErrors = validator.validateProfilePicture(file);
    } else if (documentType) {
      // Validate document (Requirement 4.5)
      validationErrors = validator.validateDocument(file, documentType as DocumentType);
    } else {
      return NextResponse.json(
        { success: false, error: 'Must specify either isProfilePicture or documentType' },
        { status: 400 }
      );
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, errors: validationErrors },
        { status: 400 }
      );
    }

    // Upload file to storage first (Requirement 10.2)
    const fileHandler = new FileUploadHandler();
    let uploadResult;

    if (isProfilePicture) {
      uploadResult = await fileHandler.uploadProfilePicture(enrollmentId, file);
    } else {
      uploadResult = await fileHandler.uploadDocument(
        enrollmentId,
        documentType as DocumentType,
        file
      );
    }

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error },
        { status: 500 }
      );
    }

    // File stored successfully, now create database record
    try {
      if (isProfilePicture) {
        // Update enrollment with profile picture URL
        await prisma.enrollment.update({
          where: { id: enrollmentId },
          data: {
            profilePictureUrl: uploadResult.fileUrl!,
            updatedAt: new Date(),
          },
        });

        return NextResponse.json(
          {
            success: true,
            fileUrl: uploadResult.fileUrl,
            url: uploadResult.fileUrl,
            message: 'Profile picture uploaded successfully',
          },
          { status: 200 }
        );
      } else {
        // Create document record
        const documentId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        const document = await prisma.document.create({
          data: {
            id: documentId,
            enrollmentId,
            type: documentType as DocumentType,
            fileName: file.name,
            fileSize: file.size,
            fileUrl: uploadResult.fileUrl!,
            mimeType: file.type,
          },
        });

        return NextResponse.json(
          {
            success: true,
            documentId: document.id,
            fileUrl: document.fileUrl,
            url: document.fileUrl,
            message: 'Document uploaded successfully',
          },
          { status: 201 }
        );
      }
    } catch (dbError) {
      // Database operation failed, attempt to clean up uploaded file
      console.error('Database error after file upload:', dbError);
      
      // Try to delete the uploaded file
      await fileHandler.deleteFile(uploadResult.fileUrl!);

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save file information to database. File has been removed.',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    // Handle authentication/authorization errors
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    if (error.name === 'ForbiddenError') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in POST /api/enrollments/[id]/upload:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}
