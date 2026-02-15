import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EnrollmentValidator } from '@/lib/enrollment-validator';
import {
  PersonalInfo,
  ParentInfo,
  StudentHistory,
  StudentSkills,
  EnrollmentAgreement,
  StudentStatus,
} from '@/types/enrollment';

/**
 * POST /api/public/enrollments
 * Public enrollment submission (no authentication required)
 * Creates enrollment without user account - admin will create parent account later
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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

    // Validate all sections
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
    }

    if (!profilePictureUrl || profilePictureUrl.trim() === '') {
      errors.push({ field: 'profilePictureUrl', message: 'Profile Picture is required' });
    }

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

    // Create enrollment without userId (will be linked when admin creates parent account)
    const enrollment = await prisma.enrollment.create({
      data: {
        id: enrollmentId,
        userId: null, // Will be updated when admin creates parent account
        schoolYear,
        program,
        studentStatus: studentStatus as StudentStatus,
        status: 'PENDING',
        
        // Personal Information
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
        
        // Parent Information
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
        
        // Student History
        siblingsInformation: studentHistory.siblingsInformation || null,
        totalLearnersInHousehold: studentHistory.totalLearnersInHousehold,
        lastSchoolPreschoolName: studentHistory.lastSchoolPreschoolName,
        lastSchoolPreschoolAddress: studentHistory.lastSchoolPreschoolAddress || null,
        lastSchoolElementaryName: studentHistory.lastSchoolElementaryName,
        lastSchoolElementaryAddress: studentHistory.lastSchoolElementaryAddress || null,
        
        // Student Skills
        specialSkills: studentSkills.specialSkills,
        specialNeedsDiagnosis: studentSkills.specialNeedsDiagnosis || null,
        
        // Enrollment Agreement
        responsiblePersonName: enrollmentAgreement.responsiblePersonName,
        responsiblePersonContactNumber: enrollmentAgreement.responsiblePersonContactNumber,
        responsiblePersonEmail: enrollmentAgreement.responsiblePersonEmail,
        relationshipToStudent: enrollmentAgreement.relationshipToStudent || null,
        enrollmentAgreementAcceptance: enrollmentAgreement.enrollmentAgreementAcceptance,
        withdrawalPolicyAcceptance: enrollmentAgreement.withdrawalPolicyAcceptance,
        
        // Profile Picture
        profilePictureUrl,
        
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        enrollmentId: enrollment.id,
        message: 'Enrollment submitted successfully. Admin will create your parent portal account.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Unexpected error in POST /api/public/enrollments:', error);
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
