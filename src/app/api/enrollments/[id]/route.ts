import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRoleOrOwner } from '@/lib/auth-middleware';
import { Role } from '@prisma/client';
import { FileUploadHandler } from '@/lib/file-upload-handler';

/**
 * GET /api/enrollments/[id]
 * Return detailed enrollment information including all fields
 * 
 * Requirements: 5.2, 16.1, 16.2, 16.3, 16.4, 16.5
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // First, fetch the enrollment to check ownership
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        Document: {
          select: {
            id: true,
            type: true,
            fileName: true,
            fileSize: true,
            fileUrl: true,
            mimeType: true,
            uploadedAt: true,
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Verify user authorization (Requirement 5.2)
    // Admin/Principal can see all, parents can see only their own
    await requireRoleOrOwner([Role.ADMIN, Role.PRINCIPAL], enrollment.userId);

    // Format response with all enrollment details (Requirements 16.1, 16.2, 16.3, 16.4, 16.5)
    const enrollmentDetail = {
      id: enrollment.id,
      schoolYear: enrollment.schoolYear,
      program: enrollment.program,
      studentStatus: enrollment.studentStatus,
      status: enrollment.status,
      profilePictureUrl: enrollment.profilePictureUrl,
      
      // Personal Information
      personalInfo: {
        lastName: enrollment.lastName,
        firstName: enrollment.firstName,
        middleName: enrollment.middleName,
        nameExtension: enrollment.nameExtension,
        nickname: enrollment.nickname,
        sex: enrollment.sex,
        age: enrollment.age,
        birthday: enrollment.birthday,
        placeOfBirth: enrollment.placeOfBirth,
        religion: enrollment.religion,
        presentAddress: enrollment.presentAddress,
        contactNumber: enrollment.contactNumber,
        citizenship: enrollment.citizenship,
        citizenshipSpecification: enrollment.citizenshipSpecification,
      },
      
      // Parent Information (Requirements 16.1, 16.2)
      parentInfo: {
        fatherFullName: enrollment.fatherFullName,
        fatherOccupation: enrollment.fatherOccupation,
        fatherContactNumber: enrollment.fatherContactNumber,
        fatherEmail: enrollment.fatherEmail,
        fatherEducationalAttainment: enrollment.fatherEducationalAttainment,
        motherFullName: enrollment.motherFullName,
        motherOccupation: enrollment.motherOccupation,
        motherContactNumber: enrollment.motherContactNumber,
        motherEmail: enrollment.motherEmail,
        motherEducationalAttainment: enrollment.motherEducationalAttainment,
        maritalStatus: enrollment.maritalStatus,
      },
      
      // Student History (Requirement 16.3)
      studentHistory: {
        siblingsInformation: enrollment.siblingsInformation,
        totalLearnersInHousehold: enrollment.totalLearnersInHousehold,
        lastSchoolPreschoolName: enrollment.lastSchoolPreschoolName,
        lastSchoolPreschoolAddress: enrollment.lastSchoolPreschoolAddress,
        lastSchoolElementaryName: enrollment.lastSchoolElementaryName,
        lastSchoolElementaryAddress: enrollment.lastSchoolElementaryAddress,
      },
      
      // Student Skills and Special Needs (Requirement 16.4)
      studentSkills: {
        specialSkills: enrollment.specialSkills,
        specialNeedsDiagnosis: enrollment.specialNeedsDiagnosis,
      },
      
      // Enrollment Agreement (Requirement 16.5)
      enrollmentAgreement: {
        responsiblePersonName: enrollment.responsiblePersonName,
        responsiblePersonContactNumber: enrollment.responsiblePersonContactNumber,
        responsiblePersonEmail: enrollment.responsiblePersonEmail,
        relationshipToStudent: enrollment.relationshipToStudent,
        enrollmentAgreementAcceptance: enrollment.enrollmentAgreementAcceptance,
        withdrawalPolicyAcceptance: enrollment.withdrawalPolicyAcceptance,
      },
      
      // Documents
      documents: enrollment.Document.map((doc) => ({
        id: doc.id,
        type: doc.type,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        url: doc.fileUrl,
        mimeType: doc.mimeType,
        uploadedAt: doc.uploadedAt,
      })),
      
      // Timestamps
      submittedAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
    };

    return NextResponse.json(enrollmentDetail);
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
    console.error('Unexpected error in GET /api/enrollments/[id]:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/enrollments/[id]
 * Delete an enrollment and all associated files
 * 
 * Requirements: 10.4 - Referential integrity with cascade delete
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // First, fetch the enrollment to check ownership
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Verify user authorization - only admin/principal or owner can delete
    await requireRoleOrOwner([Role.ADMIN, Role.PRINCIPAL], enrollment.userId);

    // Step 1: Delete all files from filesystem (Requirement 10.4)
    const fileHandler = new FileUploadHandler();
    const filesDeleted = await fileHandler.deleteEnrollmentFiles(id);
    
    if (!filesDeleted) {
      console.warn(`Failed to delete files for enrollment ${id}`);
      // Continue anyway - database cleanup is more important
    }
    
    // Step 2: Delete enrollment from database
    // This will cascade delete all associated documents (Requirement 10.4)
    await prisma.enrollment.delete({ 
      where: { id } 
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Enrollment and associated files deleted successfully'
    });
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
    console.error('Unexpected error in DELETE /api/enrollments/[id]:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}
