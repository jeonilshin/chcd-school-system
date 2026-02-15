import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, requireAuth } from '@/lib/auth-middleware';
import { EnrollmentValidator } from '@/lib/enrollment-validator';
import { Role } from '@prisma/client';
import {
  PersonalInfo,
  ParentInfo,
  StudentHistory,
  StudentSkills,
  EnrollmentAgreement,
  StudentStatus,
} from '@/types/enrollment';

/**
 * GET /api/enrollments
 * Return list of enrollments with filtering and pagination support
 * 
 * Requirements: 5.1, 5.3, 5.4, 5.5, 9.1
 * 
 * Query parameters:
 * - schoolYear: Filter by school year
 * - program: Filter by program
 * - studentStatus: Filter by student status (OLD_STUDENT or NEW_STUDENT)
 * - status: Filter by enrollment status (PENDING, APPROVED, REJECTED)
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 */
export async function GET(req: NextRequest) {
  try {
    // Require authentication (Requirement 7.4)
    const user = await requireAuth();

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const schoolYear = searchParams.get('schoolYear');
    const program = searchParams.get('program');
    const studentStatus = searchParams.get('studentStatus');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Build filter object
    const where: any = {};

    // Authorization: Parents see only their own enrollments (Requirement 9.1)
    // Admins and Principals see all enrollments (Requirement 5.1)
    if (user.role === Role.PARENT) {
      where.userId = user.id;
    }

    // Apply filters (Requirements 5.3, 5.4, 5.5)
    if (schoolYear) {
      where.schoolYear = schoolYear;
    }

    if (program) {
      where.program = program;
    }

    if (studentStatus) {
      where.studentStatus = studentStatus;
    }

    if (status) {
      where.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Query database with filters and pagination
    const [enrollments, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          userId: true,
          schoolYear: true,
          program: true,
          studentStatus: true,
          status: true,
          firstName: true,
          lastName: true,
          middleName: true,
          motherEmail: true,
          fatherEmail: true,
          responsiblePersonEmail: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.enrollment.count({ where }),
    ]);

    // Format response
    const enrollmentList = enrollments.map((enrollment) => ({
      id: enrollment.id,
      userId: enrollment.userId,
      studentName: `${enrollment.firstName} ${enrollment.middleName} ${enrollment.lastName}`,
      motherEmail: enrollment.motherEmail,
      fatherEmail: enrollment.fatherEmail,
      schoolYear: enrollment.schoolYear,
      program: enrollment.program,
      studentStatus: enrollment.studentStatus,
      status: enrollment.status,
      submittedAt: enrollment.createdAt,
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      enrollments: enrollmentList,
      total,
      page,
      totalPages,
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
    console.error('Unexpected error in GET /api/enrollments:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/enrollments
 * Create a new enrollment application
 * 
 * Requirements: 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 10.1, 10.3,
 *               11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8,
 *               12.3, 12.4, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7,
 *               14.2, 14.3, 14.4, 15.1, 15.2, 15.3, 15.4, 15.5,
 *               15.6, 15.7, 15.8, 15.9
 */
export async function POST(req: NextRequest) {
  try {
    // Require PARENT role for enrollment submission (Requirement 7.1)
    const user = await requireRole([Role.PARENT]);

    // Parse request body
    const body = await req.json();

    // Extract enrollment data
    const {
      schoolYear,
      program,
      studentStatus,
      personalInfo,
      parentInfo,
      studentHistory,
      studentSkills,
      enrollmentAgreement,
      profilePictureUrl,
    } = body;

    // Validate all sections using EnrollmentValidator
    const validator = new EnrollmentValidator();
    const errors = [
      ...validator.validatePersonalInfo(personalInfo || {}),
      ...validator.validateParentInfo(parentInfo || {}),
      ...validator.validateStudentHistory(studentHistory || {}),
      ...validator.validateStudentSkills(studentSkills || {}),
      ...validator.validateEnrollmentAgreement(enrollmentAgreement || {}),
    ];

    // Validate required top-level fields
    if (!schoolYear || schoolYear.trim() === '') {
      errors.push({ field: 'schoolYear', message: 'School Year is required' });
    }

    if (!program || program.trim() === '') {
      errors.push({ field: 'program', message: 'Program is required' });
    }

    if (!studentStatus) {
      errors.push({ field: 'studentStatus', message: 'Student Status is required' });
    } else if (studentStatus !== 'OLD_STUDENT' && studentStatus !== 'NEW_STUDENT') {
      errors.push({ field: 'studentStatus', message: 'Student Status must be OLD_STUDENT or NEW_STUDENT' });
    }

    if (!profilePictureUrl || profilePictureUrl.trim() === '') {
      errors.push({ field: 'profilePictureUrl', message: 'Profile Picture is required' });
    }

    // If there are validation errors, return them (Requirement 1.6, 2.5)
    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors,
        },
        { status: 400 }
      );
    }

    // Generate unique ID for enrollment
    const enrollmentId = `enr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create enrollment record in database with transaction (Requirement 10.1, 10.3)
    try {
      const enrollment = await prisma.$transaction(async (tx) => {
        // Create enrollment with all fields
        const newEnrollment = await tx.enrollment.create({
          data: {
            id: enrollmentId,
            userId: user.id,
            schoolYear,
            program,
            studentStatus: studentStatus as StudentStatus,
            status: 'PENDING',
            
            // Personal Information (Requirement 2.1)
            lastName: personalInfo.lastName,
            firstName: personalInfo.firstName,
            middleName: personalInfo.middleName,
            nameExtension: personalInfo.nameExtension || null,
            nickname: personalInfo.nickname,
            sex: personalInfo.sex,
            age: personalInfo.age,
            birthday: new Date(personalInfo.birthday),
            placeOfBirth: personalInfo.placeOfBirth,
            religion: personalInfo.religion,
            presentAddress: personalInfo.presentAddress,
            contactNumber: personalInfo.contactNumber,
            citizenship: personalInfo.citizenship,
            citizenshipSpecification: personalInfo.citizenshipSpecification || null,
            
            // Parent Information (Requirements 11.1, 11.2, 11.3, 11.4)
            fatherFullName: parentInfo.fatherFullName,
            fatherOccupation: parentInfo.fatherOccupation || null,
            fatherContactNumber: parentInfo.fatherContactNumber,
            fatherEmail: parentInfo.fatherEmail || null,
            fatherEducationalAttainment: parentInfo.fatherEducationalAttainment,
            motherFullName: parentInfo.motherFullName,
            motherOccupation: parentInfo.motherOccupation || null,
            motherContactNumber: parentInfo.motherContactNumber,
            motherEmail: parentInfo.motherEmail,
            motherEducationalAttainment: parentInfo.motherEducationalAttainment,
            maritalStatus: parentInfo.maritalStatus,
            
            // Student History (Requirements 13.2, 13.3, 13.4, 13.5, 13.6)
            siblingsInformation: studentHistory.siblingsInformation || null,
            totalLearnersInHousehold: studentHistory.totalLearnersInHousehold,
            lastSchoolPreschoolName: studentHistory.lastSchoolPreschoolName,
            lastSchoolPreschoolAddress: studentHistory.lastSchoolPreschoolAddress || null,
            lastSchoolElementaryName: studentHistory.lastSchoolElementaryName,
            lastSchoolElementaryAddress: studentHistory.lastSchoolElementaryAddress || null,
            
            // Student Skills and Special Needs (Requirements 14.2, 14.3)
            specialSkills: studentSkills.specialSkills,
            specialNeedsDiagnosis: studentSkills.specialNeedsDiagnosis || null,
            
            // Enrollment Agreement (Requirements 15.1, 15.2)
            responsiblePersonName: enrollmentAgreement.responsiblePersonName,
            responsiblePersonContactNumber: enrollmentAgreement.responsiblePersonContactNumber,
            responsiblePersonEmail: enrollmentAgreement.responsiblePersonEmail,
            relationshipToStudent: enrollmentAgreement.relationshipToStudent || null,
            enrollmentAgreementAcceptance: enrollmentAgreement.enrollmentAgreementAcceptance,
            withdrawalPolicyAcceptance: enrollmentAgreement.withdrawalPolicyAcceptance,
            
            // Profile Picture
            profilePictureUrl,
            
            // Timestamps
            updatedAt: new Date(),
          },
        });

        return newEnrollment;
      });

      // Return success response (Requirement 1.5)
      return NextResponse.json(
        {
          success: true,
          enrollmentId: enrollment.id,
          enrollment: {
            id: enrollment.id,
            schoolYear: enrollment.schoolYear,
            program: enrollment.program,
            studentStatus: enrollment.studentStatus,
            status: enrollment.status,
            createdAt: enrollment.createdAt,
          },
        },
        { status: 201 }
      );
    } catch (dbError) {
      // Handle database errors with rollback (Requirement 10.3)
      console.error('Database error creating enrollment:', dbError);
      
      return NextResponse.json(
        {
          success: false,
          errors: [
            {
              field: 'database',
              message: 'Failed to create enrollment. Please try again.',
            },
          ],
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
    console.error('Unexpected error in POST /api/enrollments:', error);
    return NextResponse.json(
      {
        success: false,
        errors: [
          {
            field: 'server',
            message: 'An unexpected error occurred. Please try again.',
          },
        ],
      },
      { status: 500 }
    );
  }
}
