// Validation utilities for student enrollment system

import {
  PersonalInfo,
  ParentInfo,
  StudentHistory,
  StudentSkills,
  EnrollmentAgreement,
  ValidationError,
  DocumentType,
  StudentStatus,
} from '@/types/enrollment';

/**
 * EnrollmentValidator class provides comprehensive validation methods
 * for all enrollment data including personal information, parent information,
 * student history, skills, and enrollment agreements.
 */
export class EnrollmentValidator {
  /**
   * Validates personal information fields
   * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
   */
  validatePersonalInfo(data: Partial<PersonalInfo>): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required fields validation (Requirement 2.1)
    if (!data.lastName || data.lastName.trim() === '') {
      errors.push({ field: 'lastName', message: 'Last Name is required' });
    }

    if (!data.firstName || data.firstName.trim() === '') {
      errors.push({ field: 'firstName', message: 'First Name is required' });
    }

    if (!data.middleName || data.middleName.trim() === '') {
      errors.push({ field: 'middleName', message: 'Middle Name is required' });
    }

    if (!data.nickname || data.nickname.trim() === '') {
      errors.push({ field: 'nickname', message: 'Nickname is required' });
    }

    if (!data.sex) {
      errors.push({ field: 'sex', message: 'Sex is required' });
    }

    if (data.age === undefined || data.age === null) {
      errors.push({ field: 'age', message: 'Age is required' });
    } else if (data.age < 0) {
      errors.push({ field: 'age', message: 'Age must be a positive number' });
    }

    // Birthday validation (Requirement 2.3)
    if (!data.birthday) {
      errors.push({ field: 'birthday', message: 'Birthday is required' });
    } else {
      const birthday = new Date(data.birthday);
      if (isNaN(birthday.getTime())) {
        errors.push({ field: 'birthday', message: 'Birthday must be a valid date' });
      }
    }

    if (!data.placeOfBirth || data.placeOfBirth.trim() === '') {
      errors.push({ field: 'placeOfBirth', message: 'Place of Birth is required' });
    }

    if (!data.religion || data.religion.trim() === '') {
      errors.push({ field: 'religion', message: 'Religion is required' });
    }

    if (!data.presentAddress || data.presentAddress.trim() === '') {
      errors.push({ field: 'presentAddress', message: 'Present Address is required' });
    }

    if (!data.contactNumber || data.contactNumber.trim() === '') {
      errors.push({ field: 'contactNumber', message: 'Telephone/Contact Number is required' });
    }

    if (!data.citizenship) {
      errors.push({ field: 'citizenship', message: 'Citizenship is required' });
    }

    // Conditional citizenship validation (Requirement 2.4)
    if (data.citizenship === 'FOREIGNER') {
      if (!data.citizenshipSpecification || data.citizenshipSpecification.trim() === '') {
        errors.push({
          field: 'citizenshipSpecification',
          message: 'Country specification is required for foreign citizenship',
        });
      }
    }

    // Note: nameExtension is optional (Requirement 2.2)

    return errors;
  }

  /**
   * Validates parent information fields including phone numbers and emails
   * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8
   */
  validateParentInfo(data: Partial<ParentInfo>): ValidationError[] {
    const errors: ValidationError[] = [];

    // Father's required fields (Requirement 11.1)
    if (!data.fatherFullName || data.fatherFullName.trim() === '') {
      errors.push({ field: 'fatherFullName', message: "Father's Full Name is required" });
    }

    if (!data.fatherContactNumber || data.fatherContactNumber.trim() === '') {
      errors.push({ field: 'fatherContactNumber', message: "Father's Contact Number is required" });
    } else if (!this.isValidPhoneNumber(data.fatherContactNumber)) {
      // Phone number validation (Requirement 11.5)
      errors.push({ field: 'fatherContactNumber', message: "Father's Contact Number must be a valid phone number" });
    }

    if (!data.fatherEducationalAttainment) {
      errors.push({ field: 'fatherEducationalAttainment', message: "Father's Highest Educational Attainment is required" });
    }

    // Father's optional fields (Requirement 11.2)
    // fatherOccupation and fatherEmail are optional
    if (data.fatherEmail && data.fatherEmail.trim() !== '' && !this.isValidEmail(data.fatherEmail)) {
      // Email validation (Requirement 11.6)
      errors.push({ field: 'fatherEmail', message: "Father's Email Address must be a valid email format" });
    }

    // Mother's required fields (Requirement 11.3)
    if (!data.motherFullName || data.motherFullName.trim() === '') {
      errors.push({ field: 'motherFullName', message: "Mother's Full Name is required" });
    }

    if (!data.motherContactNumber || data.motherContactNumber.trim() === '') {
      errors.push({ field: 'motherContactNumber', message: "Mother's Contact Number is required" });
    } else if (!this.isValidPhoneNumber(data.motherContactNumber)) {
      // Phone number validation (Requirement 11.5)
      errors.push({ field: 'motherContactNumber', message: "Mother's Contact Number must be a valid phone number" });
    }

    if (!data.motherEmail || data.motherEmail.trim() === '') {
      errors.push({ field: 'motherEmail', message: "Mother's Email Address is required" });
    } else if (!this.isValidEmail(data.motherEmail)) {
      // Email validation (Requirement 11.6)
      errors.push({ field: 'motherEmail', message: "Mother's Email Address must be a valid email format" });
    }

    if (!data.motherEducationalAttainment) {
      errors.push({ field: 'motherEducationalAttainment', message: "Mother's Highest Educational Attainment is required" });
    }

    // Mother's optional fields (Requirement 11.4)
    // motherOccupation is optional

    // Marital status validation (Requirements 11.7, 11.8)
    if (!data.maritalStatus || data.maritalStatus.length === 0) {
      errors.push({ field: 'maritalStatus', message: 'At least one marital status must be selected' });
    }

    return errors;
  }

  /**
   * Validates student history fields including positive integer validation
   * Requirements: 13.2, 13.3, 13.4, 13.5, 13.6, 13.7
   */
  validateStudentHistory(data: Partial<StudentHistory>): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required fields (Requirements 13.2, 13.3, 13.5)
    if (data.totalLearnersInHousehold === undefined || data.totalLearnersInHousehold === null) {
      errors.push({ field: 'totalLearnersInHousehold', message: 'Total Number of Learners in Household is required' });
    } else if (!Number.isInteger(data.totalLearnersInHousehold) || data.totalLearnersInHousehold < 1) {
      // Positive integer validation (Requirement 13.7) - minimum 1 (the child being enrolled)
      errors.push({ field: 'totalLearnersInHousehold', message: 'Total Number of Learners in Household must be at least 1 (including the child being enrolled)' });
    }

    if (!data.lastSchoolPreschoolName || data.lastSchoolPreschoolName.trim() === '') {
      errors.push({ field: 'lastSchoolPreschoolName', message: 'Name of Last School Attended (Preschool) is required' });
    }

    if (!data.lastSchoolElementaryName || data.lastSchoolElementaryName.trim() === '') {
      errors.push({ field: 'lastSchoolElementaryName', message: 'Name of Last School Attended (Elementary) is required' });
    }

    // Optional fields (Requirements 13.1, 13.4, 13.6)
    // siblingsInformation, lastSchoolPreschoolAddress, lastSchoolElementaryAddress are optional

    return errors;
  }

  /**
   * Validates student skills fields
   * Requirements: 14.1, 14.2, 14.3
   */
  validateStudentSkills(data: Partial<StudentSkills>): ValidationError[] {
    const errors: ValidationError[] = [];

    // Special skills array is required but can be empty (Requirements 14.1, 14.2)
    if (!data.specialSkills) {
      errors.push({ field: 'specialSkills', message: 'Special Skills field is required (can be empty array)' });
    }

    // specialNeedsDiagnosis is optional (Requirement 14.3)

    return errors;
  }

  /**
   * Validates enrollment agreement fields including agreement acceptance
   * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9
   */
  validateEnrollmentAgreement(data: Partial<EnrollmentAgreement>): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required fields (Requirement 15.1)
    if (!data.responsiblePersonName || data.responsiblePersonName.trim() === '') {
      errors.push({ field: 'responsiblePersonName', message: 'Responsible Person Name is required' });
    }

    if (!data.responsiblePersonContactNumber || data.responsiblePersonContactNumber.trim() === '') {
      errors.push({ field: 'responsiblePersonContactNumber', message: 'Responsible Person Contact Number is required' });
    } else if (!this.isValidPhoneNumber(data.responsiblePersonContactNumber)) {
      // Phone number validation (Requirement 15.3)
      errors.push({ field: 'responsiblePersonContactNumber', message: 'Responsible Person Contact Number must be a valid phone number' });
    }

    if (!data.responsiblePersonEmail || data.responsiblePersonEmail.trim() === '') {
      errors.push({ field: 'responsiblePersonEmail', message: 'Responsible Person Email Address is required' });
    } else if (!this.isValidEmail(data.responsiblePersonEmail)) {
      // Email validation (Requirement 15.4)
      errors.push({ field: 'responsiblePersonEmail', message: 'Responsible Person Email Address must be a valid email format' });
    }

    // Optional field (Requirement 15.2)
    // relationshipToStudent is optional

    // Agreement acceptance validation (Requirements 15.5, 15.6)
    if (!data.enrollmentAgreementAcceptance) {
      errors.push({ field: 'enrollmentAgreementAcceptance', message: 'Enrollment Agreement Acceptance is required' });
    } else if (data.enrollmentAgreementAcceptance === 'OTHER') {
      // Requirement 15.7
      errors.push({ field: 'enrollmentAgreementAcceptance', message: 'You must commit to the enrollment agreement to proceed' });
    }

    if (!data.withdrawalPolicyAcceptance) {
      errors.push({ field: 'withdrawalPolicyAcceptance', message: 'Withdrawal Policy Acceptance is required' });
    } else if (data.withdrawalPolicyAcceptance === 'NO_DISAGREE') {
      // Requirement 15.8
      errors.push({ field: 'withdrawalPolicyAcceptance', message: 'You must agree with the withdrawal policy to proceed' });
    }

    return errors;
  }

  /**
   * Validates profile picture file for size and format
   * Requirements: 3.1, 3.2
   */
  validateProfilePicture(file: File): ValidationError[] {
    const errors: ValidationError[] = [];

    // Size validation (Requirement 3.1)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      errors.push({
        field: 'profilePicture',
        message: `Profile picture size must not exceed 100MB (current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
      });
    }

    // Format validation (Requirement 3.2)
    const allowedFormats = ['image/jpeg', 'image/png'];
    if (!allowedFormats.includes(file.type)) {
      errors.push({
        field: 'profilePicture',
        message: `Profile picture must be JPEG or PNG format (current format: ${file.type})`,
      });
    }

    return errors;
  }

  /**
   * Validates document file for size and format
   * Requirements: 4.5
   */
  validateDocument(file: File, type: DocumentType): ValidationError[] {
    const errors: ValidationError[] = [];

    // Size validation (reasonable limit for documents)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      errors.push({
        field: type,
        message: `Document size must not exceed 10MB (current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
      });
    }

    // Format validation (Requirement 4.5)
    const allowedFormats = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedFormats.includes(file.type)) {
      errors.push({
        field: type,
        message: `Document must be PDF, JPEG, or PNG format (current format: ${file.type})`,
      });
    }

    return errors;
  }

  /**
   * Validates that all required documents are present based on student status
   * Requirements: 4.1, 4.2, 4.3, 4.4
   */
  validateRequiredDocuments(
    documents: { type: DocumentType }[],
    studentStatus: StudentStatus
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    const documentTypes = documents.map(doc => doc.type);

    // All students require proof of payment (Requirement 4.4)
    if (!documentTypes.includes('PROOF_OF_PAYMENT')) {
      errors.push({
        field: 'documents',
        message: 'Proof of Payment is required for all enrollments',
      });
    }

    if (studentStatus === 'OLD_STUDENT') {
      // Old student requirements (Requirement 4.1)
      if (!documentTypes.includes('REPORT_CARD')) {
        errors.push({
          field: 'documents',
          message: 'Report Card is required for old students',
        });
      }
    } else if (studentStatus === 'NEW_STUDENT') {
      // New student requirements (Requirement 4.2)
      const requiredDocs: DocumentType[] = [
        'REPORT_CARD',
        'BIRTH_CERTIFICATE',
        'GOOD_MORAL',
        'MARRIAGE_CONTRACT',
        'MEDICAL_RECORDS',
      ];

      for (const docType of requiredDocs) {
        if (!documentTypes.includes(docType)) {
          errors.push({
            field: 'documents',
            message: `${this.formatDocumentType(docType)} is required for new students`,
          });
        }
      }

      // Special needs diagnosis is optional (Requirement 4.3)
    }

    return errors;
  }

  /**
   * Helper method to validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Helper method to validate phone number format
   * Accepts various formats: +63XXXXXXXXXX, 09XXXXXXXXX, etc.
   */
  private isValidPhoneNumber(phone: string): boolean {
    // Remove spaces, dashes, and parentheses
    const cleaned = phone.replace(/[\s\-()]/g, '');
    
    // Check if it's a valid phone number format
    // Accepts: +63XXXXXXXXXX (Philippine format), 09XXXXXXXXX, or 10+ digits
    const phoneRegex = /^(\+63|0)?[0-9]{10,11}$/;
    return phoneRegex.test(cleaned);
  }

  /**
   * Helper method to format document type for error messages
   */
  private formatDocumentType(type: DocumentType): string {
    const formatted = type.replace(/_/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
  }
}

// Export a singleton instance for convenience
export const enrollmentValidator = new EnrollmentValidator();
