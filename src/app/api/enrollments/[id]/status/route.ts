import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-middleware';
import { Role, EnrollmentStatus } from '@prisma/client';

/**
 * PATCH /api/enrollments/[id]/status
 * Update enrollment status (approve or reject)
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify user has admin or principal role (Requirement 6.4)
    await requireRole([Role.ADMIN, Role.PRINCIPAL]);

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    // Validate status value
    if (!status || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json(
        {
          error: 'Invalid status. Must be APPROVED, REJECTED, or PENDING.',
        },
        { status: 400 }
      );
    }

    // Check if enrollment exists
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { id },
    });

    if (!existingEnrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Update enrollment status (Requirements 6.1, 6.2, 6.3)
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id },
      data: {
        status: status as EnrollmentStatus,
        updatedAt: new Date(),
      },
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

    // Format response with updated enrollment details
    const enrollmentDetail = {
      id: updatedEnrollment.id,
      schoolYear: updatedEnrollment.schoolYear,
      program: updatedEnrollment.program,
      studentStatus: updatedEnrollment.studentStatus,
      status: updatedEnrollment.status,
      profilePictureUrl: updatedEnrollment.profilePictureUrl,
      
      // Personal Information
      personalInfo: {
        lastName: updatedEnrollment.lastName,
        firstName: updatedEnrollment.firstName,
        middleName: updatedEnrollment.middleName,
        nameExtension: updatedEnrollment.nameExtension,
        nickname: updatedEnrollment.nickname,
        sex: updatedEnrollment.sex,
        age: updatedEnrollment.age,
        birthday: updatedEnrollment.birthday,
        placeOfBirth: updatedEnrollment.placeOfBirth,
        religion: updatedEnrollment.religion,
        presentAddress: updatedEnrollment.presentAddress,
        contactNumber: updatedEnrollment.contactNumber,
        citizenship: updatedEnrollment.citizenship,
        citizenshipSpecification: updatedEnrollment.citizenshipSpecification,
      },
      
      // Parent Information
      parentInfo: {
        fatherFullName: updatedEnrollment.fatherFullName,
        fatherOccupation: updatedEnrollment.fatherOccupation,
        fatherContactNumber: updatedEnrollment.fatherContactNumber,
        fatherEmail: updatedEnrollment.fatherEmail,
        fatherEducationalAttainment: updatedEnrollment.fatherEducationalAttainment,
        motherFullName: updatedEnrollment.motherFullName,
        motherOccupation: updatedEnrollment.motherOccupation,
        motherContactNumber: updatedEnrollment.motherContactNumber,
        motherEmail: updatedEnrollment.motherEmail,
        motherEducationalAttainment: updatedEnrollment.motherEducationalAttainment,
        maritalStatus: updatedEnrollment.maritalStatus,
      },
      
      // Student History
      studentHistory: {
        siblingsInformation: updatedEnrollment.siblingsInformation,
        totalLearnersInHousehold: updatedEnrollment.totalLearnersInHousehold,
        lastSchoolPreschoolName: updatedEnrollment.lastSchoolPreschoolName,
        lastSchoolPreschoolAddress: updatedEnrollment.lastSchoolPreschoolAddress,
        lastSchoolElementaryName: updatedEnrollment.lastSchoolElementaryName,
        lastSchoolElementaryAddress: updatedEnrollment.lastSchoolElementaryAddress,
      },
      
      // Student Skills and Special Needs
      studentSkills: {
        specialSkills: updatedEnrollment.specialSkills,
        specialNeedsDiagnosis: updatedEnrollment.specialNeedsDiagnosis,
      },
      
      // Enrollment Agreement
      enrollmentAgreement: {
        responsiblePersonName: updatedEnrollment.responsiblePersonName,
        responsiblePersonContactNumber: updatedEnrollment.responsiblePersonContactNumber,
        responsiblePersonEmail: updatedEnrollment.responsiblePersonEmail,
        relationshipToStudent: updatedEnrollment.relationshipToStudent,
        enrollmentAgreementAcceptance: updatedEnrollment.enrollmentAgreementAcceptance,
        withdrawalPolicyAcceptance: updatedEnrollment.withdrawalPolicyAcceptance,
      },
      
      // Documents
      documents: updatedEnrollment.Document?.map((doc) => ({
        id: doc.id,
        type: doc.type,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        url: doc.fileUrl,
        mimeType: doc.mimeType,
        uploadedAt: doc.uploadedAt,
      })) || [],
      
      // Timestamps
      submittedAt: updatedEnrollment.createdAt,
      updatedAt: updatedEnrollment.updatedAt,
    };

    return NextResponse.json({
      success: true,
      enrollment: enrollmentDetail,
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
    console.error('Unexpected error in PATCH /api/enrollments/[id]/status:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}
