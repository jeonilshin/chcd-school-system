// Unit tests for EnrollmentValidator class

import { describe, test, expect } from 'vitest';
import { EnrollmentValidator } from '@/lib/enrollment-validator';
import {
  PersonalInfo,
  ParentInfo,
  StudentHistory,
  StudentSkills,
  EnrollmentAgreement,
  DocumentType,
} from '@/types/enrollment';

describe('EnrollmentValidator', () => {
  const validator = new EnrollmentValidator();

  describe('validatePersonalInfo', () => {
    test('should pass validation with all required fields', () => {
      const validData: PersonalInfo = {
        lastName: 'Dela Cruz',
        firstName: 'Juan',
        middleName: 'Santos',
        nickname: 'Juanito',
        sex: 'MALE',
        age: 5,
        birthday: new Date('2019-05-15'),
        placeOfBirth: 'Manila',
        religion: 'Catholic',
        presentAddress: '123 Main St, Manila',
        contactNumber: '09171234567',
        citizenship: 'FILIPINO',
      };

      const errors = validator.validatePersonalInfo(validData);
      expect(errors).toHaveLength(0);
    });

    test('should allow optional nameExtension field', () => {
      const validData: PersonalInfo = {
        lastName: 'Dela Cruz',
        firstName: 'Juan',
        middleName: 'Santos',
        nameExtension: 'Jr.',
        nickname: 'Juanito',
        sex: 'MALE',
        age: 5,
        birthday: new Date('2019-05-15'),
        placeOfBirth: 'Manila',
        religion: 'Catholic',
        presentAddress: '123 Main St, Manila',
        contactNumber: '09171234567',
        citizenship: 'FILIPINO',
      };

      const errors = validator.validatePersonalInfo(validData);
      expect(errors).toHaveLength(0);
    });

    test('should fail validation when required fields are missing', () => {
      const invalidData: Partial<PersonalInfo> = {
        lastName: '',
        firstName: '',
      };

      const errors = validator.validatePersonalInfo(invalidData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.field === 'lastName')).toBe(true);
      expect(errors.some(e => e.field === 'firstName')).toBe(true);
      expect(errors.some(e => e.field === 'middleName')).toBe(true);
      expect(errors.some(e => e.field === 'nickname')).toBe(true);
    });

    test('should fail validation with invalid birthday', () => {
      const invalidData: Partial<PersonalInfo> = {
        lastName: 'Dela Cruz',
        firstName: 'Juan',
        middleName: 'Santos',
        nickname: 'Juanito',
        sex: 'MALE',
        age: 5,
        birthday: new Date('invalid-date'),
        placeOfBirth: 'Manila',
        religion: 'Catholic',
        presentAddress: '123 Main St, Manila',
        contactNumber: '09171234567',
        citizenship: 'FILIPINO',
      };

      const errors = validator.validatePersonalInfo(invalidData);
      expect(errors.some(e => e.field === 'birthday' && e.message.includes('valid date'))).toBe(true);
    });

    test('should require citizenshipSpecification when citizenship is FOREIGNER', () => {
      const invalidData: Partial<PersonalInfo> = {
        lastName: 'Smith',
        firstName: 'John',
        middleName: 'Michael',
        nickname: 'Johnny',
        sex: 'MALE',
        age: 5,
        birthday: new Date('2019-05-15'),
        placeOfBirth: 'New York',
        religion: 'Christian',
        presentAddress: '123 Main St, Manila',
        contactNumber: '09171234567',
        citizenship: 'FOREIGNER',
        // Missing citizenshipSpecification
      };

      const errors = validator.validatePersonalInfo(invalidData);
      expect(errors.some(e => e.field === 'citizenshipSpecification')).toBe(true);
    });

    test('should pass validation when citizenship is FOREIGNER with specification', () => {
      const validData: PersonalInfo = {
        lastName: 'Smith',
        firstName: 'John',
        middleName: 'Michael',
        nickname: 'Johnny',
        sex: 'MALE',
        age: 5,
        birthday: new Date('2019-05-15'),
        placeOfBirth: 'New York',
        religion: 'Christian',
        presentAddress: '123 Main St, Manila',
        contactNumber: '09171234567',
        citizenship: 'FOREIGNER',
        citizenshipSpecification: 'American',
      };

      const errors = validator.validatePersonalInfo(validData);
      expect(errors).toHaveLength(0);
    });

    test('should fail validation with negative age', () => {
      const invalidData: Partial<PersonalInfo> = {
        lastName: 'Dela Cruz',
        firstName: 'Juan',
        middleName: 'Santos',
        nickname: 'Juanito',
        sex: 'MALE',
        age: -1,
        birthday: new Date('2019-05-15'),
        placeOfBirth: 'Manila',
        religion: 'Catholic',
        presentAddress: '123 Main St, Manila',
        contactNumber: '09171234567',
        citizenship: 'FILIPINO',
      };

      const errors = validator.validatePersonalInfo(invalidData);
      expect(errors.some(e => e.field === 'age' && e.message.includes('positive'))).toBe(true);
    });
  });

  describe('validateParentInfo', () => {
    test('should pass validation with all required fields', () => {
      const validData: ParentInfo = {
        fatherFullName: 'Pedro Dela Cruz',
        fatherContactNumber: '09171234567',
        fatherEducationalAttainment: 'COLLEGE_GRADUATE',
        motherFullName: 'Maria Dela Cruz',
        motherContactNumber: '09187654321',
        motherEmail: 'maria@example.com',
        motherEducationalAttainment: 'HIGH_SCHOOL_GRADUATE',
        maritalStatus: ['MARRIED'],
      };

      const errors = validator.validateParentInfo(validData);
      expect(errors).toHaveLength(0);
    });

    test('should allow optional father occupation and email', () => {
      const validData: ParentInfo = {
        fatherFullName: 'Pedro Dela Cruz',
        fatherOccupation: 'Engineer',
        fatherContactNumber: '09171234567',
        fatherEmail: 'pedro@example.com',
        fatherEducationalAttainment: 'COLLEGE_GRADUATE',
        motherFullName: 'Maria Dela Cruz',
        motherContactNumber: '09187654321',
        motherEmail: 'maria@example.com',
        motherEducationalAttainment: 'HIGH_SCHOOL_GRADUATE',
        maritalStatus: ['MARRIED'],
      };

      const errors = validator.validateParentInfo(validData);
      expect(errors).toHaveLength(0);
    });

    test('should allow optional mother occupation', () => {
      const validData: ParentInfo = {
        fatherFullName: 'Pedro Dela Cruz',
        fatherContactNumber: '09171234567',
        fatherEducationalAttainment: 'COLLEGE_GRADUATE',
        motherFullName: 'Maria Dela Cruz',
        motherOccupation: 'Teacher',
        motherContactNumber: '09187654321',
        motherEmail: 'maria@example.com',
        motherEducationalAttainment: 'HIGH_SCHOOL_GRADUATE',
        maritalStatus: ['MARRIED'],
      };

      const errors = validator.validateParentInfo(validData);
      expect(errors).toHaveLength(0);
    });

    test('should fail validation when required fields are missing', () => {
      const invalidData: Partial<ParentInfo> = {
        fatherFullName: '',
        motherFullName: '',
      };

      const errors = validator.validateParentInfo(invalidData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.field === 'fatherFullName')).toBe(true);
      expect(errors.some(e => e.field === 'fatherContactNumber')).toBe(true);
      expect(errors.some(e => e.field === 'motherFullName')).toBe(true);
      expect(errors.some(e => e.field === 'motherContactNumber')).toBe(true);
      expect(errors.some(e => e.field === 'motherEmail')).toBe(true);
    });

    test('should fail validation with invalid phone numbers', () => {
      const invalidData: Partial<ParentInfo> = {
        fatherFullName: 'Pedro Dela Cruz',
        fatherContactNumber: 'invalid-phone',
        fatherEducationalAttainment: 'COLLEGE_GRADUATE',
        motherFullName: 'Maria Dela Cruz',
        motherContactNumber: '123',
        motherEmail: 'maria@example.com',
        motherEducationalAttainment: 'HIGH_SCHOOL_GRADUATE',
        maritalStatus: ['MARRIED'],
      };

      const errors = validator.validateParentInfo(invalidData);
      expect(errors.some(e => e.field === 'fatherContactNumber' && e.message.includes('valid phone'))).toBe(true);
      expect(errors.some(e => e.field === 'motherContactNumber' && e.message.includes('valid phone'))).toBe(true);
    });

    test('should fail validation with invalid email addresses', () => {
      const invalidData: Partial<ParentInfo> = {
        fatherFullName: 'Pedro Dela Cruz',
        fatherContactNumber: '09171234567',
        fatherEmail: 'invalid-email',
        fatherEducationalAttainment: 'COLLEGE_GRADUATE',
        motherFullName: 'Maria Dela Cruz',
        motherContactNumber: '09187654321',
        motherEmail: 'not-an-email',
        motherEducationalAttainment: 'HIGH_SCHOOL_GRADUATE',
        maritalStatus: ['MARRIED'],
      };

      const errors = validator.validateParentInfo(invalidData);
      expect(errors.some(e => e.field === 'fatherEmail' && e.message.includes('valid email'))).toBe(true);
      expect(errors.some(e => e.field === 'motherEmail' && e.message.includes('valid email'))).toBe(true);
    });

    test('should fail validation when marital status is empty', () => {
      const invalidData: Partial<ParentInfo> = {
        fatherFullName: 'Pedro Dela Cruz',
        fatherContactNumber: '09171234567',
        fatherEducationalAttainment: 'COLLEGE_GRADUATE',
        motherFullName: 'Maria Dela Cruz',
        motherContactNumber: '09187654321',
        motherEmail: 'maria@example.com',
        motherEducationalAttainment: 'HIGH_SCHOOL_GRADUATE',
        maritalStatus: [],
      };

      const errors = validator.validateParentInfo(invalidData);
      expect(errors.some(e => e.field === 'maritalStatus')).toBe(true);
    });

    test('should allow multiple marital status selections', () => {
      const validData: ParentInfo = {
        fatherFullName: 'Pedro Dela Cruz',
        fatherContactNumber: '09171234567',
        fatherEducationalAttainment: 'COLLEGE_GRADUATE',
        motherFullName: 'Maria Dela Cruz',
        motherContactNumber: '09187654321',
        motherEmail: 'maria@example.com',
        motherEducationalAttainment: 'HIGH_SCHOOL_GRADUATE',
        maritalStatus: ['SEPARATED', 'SINGLE_PARENT'],
      };

      const errors = validator.validateParentInfo(validData);
      expect(errors).toHaveLength(0);
    });

    test('should accept valid phone number formats', () => {
      const testCases = [
        '09171234567',
        '+639171234567',
        '0917 123 4567',
        '0917-123-4567',
        '(0917) 123-4567',
      ];

      for (const phone of testCases) {
        const validData: ParentInfo = {
          fatherFullName: 'Pedro Dela Cruz',
          fatherContactNumber: phone,
          fatherEducationalAttainment: 'COLLEGE_GRADUATE',
          motherFullName: 'Maria Dela Cruz',
          motherContactNumber: phone,
          motherEmail: 'maria@example.com',
          motherEducationalAttainment: 'HIGH_SCHOOL_GRADUATE',
          maritalStatus: ['MARRIED'],
        };

        const errors = validator.validateParentInfo(validData);
        expect(errors.filter(e => e.field.includes('ContactNumber'))).toHaveLength(0);
      }
    });
  });

  describe('validateStudentHistory', () => {
    test('should pass validation with all required fields', () => {
      const validData: StudentHistory = {
        totalLearnersInHousehold: 3,
        lastSchoolPreschoolName: 'ABC Preschool',
        lastSchoolElementaryName: 'XYZ Elementary',
      };

      const errors = validator.validateStudentHistory(validData);
      expect(errors).toHaveLength(0);
    });

    test('should allow optional fields', () => {
      const validData: StudentHistory = {
        siblingsInformation: 'Two siblings: John (10) and Jane (8)',
        totalLearnersInHousehold: 3,
        lastSchoolPreschoolName: 'ABC Preschool',
        lastSchoolPreschoolAddress: '123 School St, Manila',
        lastSchoolElementaryName: 'XYZ Elementary',
        lastSchoolElementaryAddress: '456 Education Ave, Manila',
      };

      const errors = validator.validateStudentHistory(validData);
      expect(errors).toHaveLength(0);
    });

    test('should fail validation when required fields are missing', () => {
      const invalidData: Partial<StudentHistory> = {
        siblingsInformation: 'Some info',
      };

      const errors = validator.validateStudentHistory(invalidData);
      expect(errors.some(e => e.field === 'totalLearnersInHousehold')).toBe(true);
      expect(errors.some(e => e.field === 'lastSchoolPreschoolName')).toBe(true);
      expect(errors.some(e => e.field === 'lastSchoolElementaryName')).toBe(true);
    });

    test('should fail validation with zero household learners', () => {
      const invalidData: Partial<StudentHistory> = {
        totalLearnersInHousehold: 0,
        lastSchoolPreschoolName: 'ABC Preschool',
        lastSchoolElementaryName: 'XYZ Elementary',
      };

      const errors = validator.validateStudentHistory(invalidData);
      expect(errors.some(e => e.field === 'totalLearnersInHousehold' && e.message.includes('positive integer'))).toBe(true);
    });

    test('should fail validation with negative household learners', () => {
      const invalidData: Partial<StudentHistory> = {
        totalLearnersInHousehold: -1,
        lastSchoolPreschoolName: 'ABC Preschool',
        lastSchoolElementaryName: 'XYZ Elementary',
      };

      const errors = validator.validateStudentHistory(invalidData);
      expect(errors.some(e => e.field === 'totalLearnersInHousehold' && e.message.includes('positive integer'))).toBe(true);
    });

    test('should fail validation with non-integer household learners', () => {
      const invalidData: Partial<StudentHistory> = {
        totalLearnersInHousehold: 2.5,
        lastSchoolPreschoolName: 'ABC Preschool',
        lastSchoolElementaryName: 'XYZ Elementary',
      };

      const errors = validator.validateStudentHistory(invalidData);
      expect(errors.some(e => e.field === 'totalLearnersInHousehold' && e.message.includes('positive integer'))).toBe(true);
    });
  });

  describe('validateStudentSkills', () => {
    test('should pass validation with empty special skills array', () => {
      const validData: StudentSkills = {
        specialSkills: [],
      };

      const errors = validator.validateStudentSkills(validData);
      expect(errors).toHaveLength(0);
    });

    test('should pass validation with multiple special skills', () => {
      const validData: StudentSkills = {
        specialSkills: ['SINGING', 'DANCING', 'ACTING'],
      };

      const errors = validator.validateStudentSkills(validData);
      expect(errors).toHaveLength(0);
    });

    test('should allow optional special needs diagnosis', () => {
      const validData: StudentSkills = {
        specialSkills: ['COMPUTER'],
        specialNeedsDiagnosis: 'ADHD - requires additional support',
      };

      const errors = validator.validateStudentSkills(validData);
      expect(errors).toHaveLength(0);
    });

    test('should fail validation when special skills field is missing', () => {
      const invalidData: Partial<StudentSkills> = {};

      const errors = validator.validateStudentSkills(invalidData);
      expect(errors.some(e => e.field === 'specialSkills')).toBe(true);
    });
  });

  describe('validateEnrollmentAgreement', () => {
    test('should pass validation with all required fields and agreements accepted', () => {
      const validData: EnrollmentAgreement = {
        responsiblePersonName: 'Pedro Dela Cruz',
        responsiblePersonContactNumber: '09171234567',
        responsiblePersonEmail: 'pedro@example.com',
        enrollmentAgreementAcceptance: 'YES_COMMIT',
        withdrawalPolicyAcceptance: 'YES_AGREED',
      };

      const errors = validator.validateEnrollmentAgreement(validData);
      expect(errors).toHaveLength(0);
    });

    test('should allow optional relationship to student', () => {
      const validData: EnrollmentAgreement = {
        responsiblePersonName: 'Pedro Dela Cruz',
        responsiblePersonContactNumber: '09171234567',
        responsiblePersonEmail: 'pedro@example.com',
        relationshipToStudent: 'Father',
        enrollmentAgreementAcceptance: 'YES_COMMIT',
        withdrawalPolicyAcceptance: 'YES_AGREED',
      };

      const errors = validator.validateEnrollmentAgreement(validData);
      expect(errors).toHaveLength(0);
    });

    test('should fail validation when required fields are missing', () => {
      const invalidData: Partial<EnrollmentAgreement> = {};

      const errors = validator.validateEnrollmentAgreement(invalidData);
      expect(errors.some(e => e.field === 'responsiblePersonName')).toBe(true);
      expect(errors.some(e => e.field === 'responsiblePersonContactNumber')).toBe(true);
      expect(errors.some(e => e.field === 'responsiblePersonEmail')).toBe(true);
      expect(errors.some(e => e.field === 'enrollmentAgreementAcceptance')).toBe(true);
      expect(errors.some(e => e.field === 'withdrawalPolicyAcceptance')).toBe(true);
    });

    test('should fail validation with invalid phone number', () => {
      const invalidData: Partial<EnrollmentAgreement> = {
        responsiblePersonName: 'Pedro Dela Cruz',
        responsiblePersonContactNumber: 'invalid',
        responsiblePersonEmail: 'pedro@example.com',
        enrollmentAgreementAcceptance: 'YES_COMMIT',
        withdrawalPolicyAcceptance: 'YES_AGREED',
      };

      const errors = validator.validateEnrollmentAgreement(invalidData);
      expect(errors.some(e => e.field === 'responsiblePersonContactNumber' && e.message.includes('valid phone'))).toBe(true);
    });

    test('should fail validation with invalid email', () => {
      const invalidData: Partial<EnrollmentAgreement> = {
        responsiblePersonName: 'Pedro Dela Cruz',
        responsiblePersonContactNumber: '09171234567',
        responsiblePersonEmail: 'not-an-email',
        enrollmentAgreementAcceptance: 'YES_COMMIT',
        withdrawalPolicyAcceptance: 'YES_AGREED',
      };

      const errors = validator.validateEnrollmentAgreement(invalidData);
      expect(errors.some(e => e.field === 'responsiblePersonEmail' && e.message.includes('valid email'))).toBe(true);
    });

    test('should fail validation when enrollment agreement is not accepted', () => {
      const invalidData: Partial<EnrollmentAgreement> = {
        responsiblePersonName: 'Pedro Dela Cruz',
        responsiblePersonContactNumber: '09171234567',
        responsiblePersonEmail: 'pedro@example.com',
        enrollmentAgreementAcceptance: 'OTHER',
        withdrawalPolicyAcceptance: 'YES_AGREED',
      };

      const errors = validator.validateEnrollmentAgreement(invalidData);
      expect(errors.some(e => e.field === 'enrollmentAgreementAcceptance' && e.message.includes('commit'))).toBe(true);
    });

    test('should fail validation when withdrawal policy is not accepted', () => {
      const invalidData: Partial<EnrollmentAgreement> = {
        responsiblePersonName: 'Pedro Dela Cruz',
        responsiblePersonContactNumber: '09171234567',
        responsiblePersonEmail: 'pedro@example.com',
        enrollmentAgreementAcceptance: 'YES_COMMIT',
        withdrawalPolicyAcceptance: 'NO_DISAGREE',
      };

      const errors = validator.validateEnrollmentAgreement(invalidData);
      expect(errors.some(e => e.field === 'withdrawalPolicyAcceptance' && e.message.includes('agree'))).toBe(true);
    });
  });

  describe('validateProfilePicture', () => {
    test('should pass validation with valid JPEG file under 100MB', () => {
      const validFile = new File(['x'.repeat(1024 * 1024)], 'profile.jpg', { type: 'image/jpeg' });
      const errors = validator.validateProfilePicture(validFile);
      expect(errors).toHaveLength(0);
    });

    test('should pass validation with valid PNG file under 100MB', () => {
      const validFile = new File(['x'.repeat(1024 * 1024)], 'profile.png', { type: 'image/png' });
      const errors = validator.validateProfilePicture(validFile);
      expect(errors).toHaveLength(0);
    });

    test('should fail validation when file exceeds 100MB', () => {
      const largeFile = new File(['x'.repeat(101 * 1024 * 1024)], 'profile.jpg', { type: 'image/jpeg' });
      const errors = validator.validateProfilePicture(largeFile);
      expect(errors.some(e => e.field === 'profilePicture' && e.message.includes('100MB'))).toBe(true);
    });

    test('should fail validation with invalid file format', () => {
      const invalidFile = new File(['content'], 'profile.gif', { type: 'image/gif' });
      const errors = validator.validateProfilePicture(invalidFile);
      expect(errors.some(e => e.field === 'profilePicture' && e.message.includes('JPEG or PNG'))).toBe(true);
    });

    test('should fail validation with PDF file', () => {
      const pdfFile = new File(['content'], 'profile.pdf', { type: 'application/pdf' });
      const errors = validator.validateProfilePicture(pdfFile);
      expect(errors.some(e => e.field === 'profilePicture' && e.message.includes('JPEG or PNG'))).toBe(true);
    });
  });

  describe('validateDocument', () => {
    test('should pass validation with valid PDF file under 10MB', () => {
      const validFile = new File(['x'.repeat(1024 * 1024)], 'document.pdf', { type: 'application/pdf' });
      const errors = validator.validateDocument(validFile, 'BIRTH_CERTIFICATE');
      expect(errors).toHaveLength(0);
    });

    test('should pass validation with valid JPEG file under 10MB', () => {
      const validFile = new File(['x'.repeat(1024 * 1024)], 'document.jpg', { type: 'image/jpeg' });
      const errors = validator.validateDocument(validFile, 'REPORT_CARD');
      expect(errors).toHaveLength(0);
    });

    test('should pass validation with valid PNG file under 10MB', () => {
      const validFile = new File(['x'.repeat(1024 * 1024)], 'document.png', { type: 'image/png' });
      const errors = validator.validateDocument(validFile, 'GOOD_MORAL');
      expect(errors).toHaveLength(0);
    });

    test('should fail validation when file exceeds 10MB', () => {
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'document.pdf', { type: 'application/pdf' });
      const errors = validator.validateDocument(largeFile, 'BIRTH_CERTIFICATE');
      expect(errors.some(e => e.message.includes('10MB'))).toBe(true);
    });

    test('should fail validation with invalid file format', () => {
      const invalidFile = new File(['content'], 'document.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const errors = validator.validateDocument(invalidFile, 'REPORT_CARD');
      expect(errors.some(e => e.message.includes('PDF, JPEG, or PNG'))).toBe(true);
    });
  });

  describe('validateRequiredDocuments', () => {
    test('should pass validation for old student with required documents', () => {
      const documents = [
        { type: 'REPORT_CARD' as DocumentType },
        { type: 'PROOF_OF_PAYMENT' as DocumentType },
      ];

      const errors = validator.validateRequiredDocuments(documents, 'OLD_STUDENT');
      expect(errors).toHaveLength(0);
    });

    test('should fail validation for old student missing report card', () => {
      const documents = [
        { type: 'PROOF_OF_PAYMENT' as DocumentType },
      ];

      const errors = validator.validateRequiredDocuments(documents, 'OLD_STUDENT');
      expect(errors.some(e => e.message.includes('Report Card'))).toBe(true);
    });

    test('should fail validation for old student missing proof of payment', () => {
      const documents = [
        { type: 'REPORT_CARD' as DocumentType },
      ];

      const errors = validator.validateRequiredDocuments(documents, 'OLD_STUDENT');
      expect(errors.some(e => e.message.includes('Proof of Payment'))).toBe(true);
    });

    test('should pass validation for new student with all required documents', () => {
      const documents = [
        { type: 'REPORT_CARD' as DocumentType },
        { type: 'BIRTH_CERTIFICATE' as DocumentType },
        { type: 'GOOD_MORAL' as DocumentType },
        { type: 'MARRIAGE_CONTRACT' as DocumentType },
        { type: 'MEDICAL_RECORDS' as DocumentType },
        { type: 'PROOF_OF_PAYMENT' as DocumentType },
      ];

      const errors = validator.validateRequiredDocuments(documents, 'NEW_STUDENT');
      expect(errors).toHaveLength(0);
    });

    test('should allow optional special needs diagnosis for new student', () => {
      const documents = [
        { type: 'REPORT_CARD' as DocumentType },
        { type: 'BIRTH_CERTIFICATE' as DocumentType },
        { type: 'GOOD_MORAL' as DocumentType },
        { type: 'MARRIAGE_CONTRACT' as DocumentType },
        { type: 'MEDICAL_RECORDS' as DocumentType },
        { type: 'SPECIAL_NEEDS_DIAGNOSIS' as DocumentType },
        { type: 'PROOF_OF_PAYMENT' as DocumentType },
      ];

      const errors = validator.validateRequiredDocuments(documents, 'NEW_STUDENT');
      expect(errors).toHaveLength(0);
    });

    test('should fail validation for new student missing required documents', () => {
      const documents = [
        { type: 'REPORT_CARD' as DocumentType },
        { type: 'PROOF_OF_PAYMENT' as DocumentType },
      ];

      const errors = validator.validateRequiredDocuments(documents, 'NEW_STUDENT');
      expect(errors.some(e => e.message.includes('Birth certificate'))).toBe(true);
      expect(errors.some(e => e.message.includes('Good moral'))).toBe(true);
      expect(errors.some(e => e.message.includes('Marriage contract'))).toBe(true);
      expect(errors.some(e => e.message.includes('Medical records'))).toBe(true);
    });

    test('should fail validation when proof of payment is missing for any student', () => {
      const documentsOldStudent = [
        { type: 'REPORT_CARD' as DocumentType },
      ];

      const errorsOld = validator.validateRequiredDocuments(documentsOldStudent, 'OLD_STUDENT');
      expect(errorsOld.some(e => e.message.includes('Proof of Payment'))).toBe(true);

      const documentsNewStudent = [
        { type: 'REPORT_CARD' as DocumentType },
        { type: 'BIRTH_CERTIFICATE' as DocumentType },
        { type: 'GOOD_MORAL' as DocumentType },
        { type: 'MARRIAGE_CONTRACT' as DocumentType },
        { type: 'MEDICAL_RECORDS' as DocumentType },
      ];

      const errorsNew = validator.validateRequiredDocuments(documentsNewStudent, 'NEW_STUDENT');
      expect(errorsNew.some(e => e.message.includes('Proof of Payment'))).toBe(true);
    });
  });
});
