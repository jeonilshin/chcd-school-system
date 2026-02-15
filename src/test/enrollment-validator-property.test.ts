// Property-based tests for EnrollmentValidator class
// Using fast-check for property-based testing with 100+ iterations

import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import { EnrollmentValidator } from '@/lib/enrollment-validator';
import {
  PersonalInfo,
  Sex,
  Citizenship,
  DocumentType,
  StudentStatus,
  ParentInfo,
  StudentHistory,
  EnrollmentAgreement,
  EducationalAttainment,
  MaritalStatus,
} from '@/types/enrollment';

describe('EnrollmentValidator - Property-Based Tests', () => {
  const validator = new EnrollmentValidator();

  // ============================================================================
  // GENERATORS
  // ============================================================================

  /**
   * Generator for valid non-empty strings
   */
  const nonEmptyStringGen = fc.string({ minLength: 1, maxLength: 100 });

  /**
   * Generator for valid names
   */
  const nameGen = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

  /**
   * Generator for valid sex values
   */
  const sexGen = fc.constantFrom<Sex>('FEMALE', 'MALE');

  /**
   * Generator for valid citizenship values
   */
  const citizenshipGen = fc.constantFrom<Citizenship>('FILIPINO', 'FOREIGNER');

  /**
   * Generator for valid ages (preschool age range)
   */
  const ageGen = fc.integer({ min: 2, max: 6 });

  /**
   * Generator for valid dates (reasonable birthday range)
   */
  const birthdayGen = fc.date({
    min: new Date('2015-01-01'),
    max: new Date('2023-12-31'),
  });

  /**
   * Generator for valid personal info with all required fields
   */
  const validPersonalInfoGen = fc.record({
    lastName: nameGen,
    firstName: nameGen,
    middleName: nameGen,
    nameExtension: fc.option(fc.constantFrom('Jr.', 'Sr.', 'III', 'IV'), { nil: undefined }),
    nickname: nameGen,
    sex: sexGen,
    age: ageGen,
    birthday: birthdayGen,
    placeOfBirth: nonEmptyStringGen,
    religion: nonEmptyStringGen,
    presentAddress: nonEmptyStringGen,
    contactNumber: nonEmptyStringGen,
    citizenship: fc.constant<Citizenship>('FILIPINO'),
    citizenshipSpecification: fc.constant(undefined),
  });

  /**
   * Generator for personal info with FOREIGNER citizenship and specification
   */
  const foreignerPersonalInfoGen = fc.record({
    lastName: nameGen,
    firstName: nameGen,
    middleName: nameGen,
    nameExtension: fc.option(fc.constantFrom('Jr.', 'Sr.', 'III', 'IV'), { nil: undefined }),
    nickname: nameGen,
    sex: sexGen,
    age: ageGen,
    birthday: birthdayGen,
    placeOfBirth: nonEmptyStringGen,
    religion: nonEmptyStringGen,
    presentAddress: nonEmptyStringGen,
    contactNumber: nonEmptyStringGen,
    citizenship: fc.constant<Citizenship>('FOREIGNER'),
    citizenshipSpecification: nonEmptyStringGen,
  });

  /**
   * Generator for a subset of required field names
   */
  const requiredFieldGen = fc.constantFrom(
    'lastName',
    'firstName',
    'middleName',
    'nickname',
    'sex',
    'age',
    'birthday',
    'placeOfBirth',
    'religion',
    'presentAddress',
    'contactNumber',
    'citizenship'
  );

  /**
   * Generator for invalid date strings
   */
  const invalidDateGen = fc.oneof(
    fc.constant('invalid-date'),
    fc.constant('2024-02-30'), // Invalid day
    fc.constant('2024-13-01'), // Invalid month
    fc.constant('not a date'),
    fc.constant(''),
  );

  // ============================================================================
  // PROPERTY 2: Required Field Validation
  // **Validates: Requirements 1.6, 2.1**
  // ============================================================================

  test('Property 2: Required Field Validation - missing any required field should cause validation to fail', () => {
    fc.assert(
      fc.property(
        validPersonalInfoGen,
        requiredFieldGen,
        (validData, fieldToRemove) => {
          // Create a copy with one required field removed/emptied
          const invalidData: Partial<PersonalInfo> = { ...validData };
          
          // Remove or empty the field
          if (fieldToRemove === 'age') {
            delete (invalidData as any)[fieldToRemove];
          } else if (fieldToRemove === 'sex' || fieldToRemove === 'citizenship' || fieldToRemove === 'birthday') {
            delete (invalidData as any)[fieldToRemove];
          } else {
            (invalidData as any)[fieldToRemove] = '';
          }

          const errors = validator.validatePersonalInfo(invalidData);

          // Property: Should have at least one error
          expect(errors.length).toBeGreaterThan(0);

          // Property: Should have an error for the missing field
          const hasErrorForField = errors.some(e => e.field === fieldToRemove);
          expect(hasErrorForField).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 2: Required Field Validation - multiple missing required fields should return multiple errors', () => {
    fc.assert(
      fc.property(
        fc.array(requiredFieldGen, { minLength: 2, maxLength: 5 }).map(arr => [...new Set(arr)]),
        (fieldsToRemove) => {
          // Start with valid data
          const invalidData: Partial<PersonalInfo> = {
            lastName: 'Test',
            firstName: 'User',
            middleName: 'Middle',
            nickname: 'Nick',
            sex: 'MALE',
            age: 5,
            birthday: new Date('2019-01-01'),
            placeOfBirth: 'Manila',
            religion: 'Catholic',
            presentAddress: '123 Street',
            contactNumber: '09171234567',
            citizenship: 'FILIPINO',
          };

          // Remove multiple fields
          fieldsToRemove.forEach(field => {
            if (field === 'age') {
              delete (invalidData as any)[field];
            } else if (field === 'sex' || field === 'citizenship' || field === 'birthday') {
              delete (invalidData as any)[field];
            } else {
              (invalidData as any)[field] = '';
            }
          });

          const errors = validator.validatePersonalInfo(invalidData);

          // Property: Should have errors for all missing fields
          fieldsToRemove.forEach(field => {
            const hasErrorForField = errors.some(e => e.field === field);
            expect(hasErrorForField).toBe(true);
          });

          // Property: Should have at least as many errors as fields removed
          expect(errors.length).toBeGreaterThanOrEqual(fieldsToRemove.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // PROPERTY 3: Optional Field Handling
  // **Validates: Requirements 2.2**
  // ============================================================================

  test('Property 3: Optional Field Handling - nameExtension should be optional', () => {
    fc.assert(
      fc.property(
        validPersonalInfoGen,
        fc.option(fc.constantFrom('Jr.', 'Sr.', 'III', 'IV', ''), { nil: undefined }),
        (validData, nameExtension) => {
          const dataWithOptional: PersonalInfo = {
            ...validData,
            nameExtension,
          };

          const errors = validator.validatePersonalInfo(dataWithOptional);

          // Property: Should pass validation regardless of nameExtension presence
          expect(errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 3: Optional Field Handling - submission should succeed with all required fields even without optional fields', () => {
    fc.assert(
      fc.property(validPersonalInfoGen, (validData) => {
        // Explicitly remove optional field
        const dataWithoutOptional: PersonalInfo = {
          ...validData,
          nameExtension: undefined,
        };

        const errors = validator.validatePersonalInfo(dataWithoutOptional);

        // Property: Should have no validation errors
        expect(errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // PROPERTY 4: Date Validation
  // **Validates: Requirements 2.3**
  // ============================================================================

  test('Property 4: Date Validation - valid dates should pass validation', () => {
    fc.assert(
      fc.property(validPersonalInfoGen, birthdayGen, (validData, birthday) => {
        const dataWithDate: PersonalInfo = {
          ...validData,
          birthday,
        };

        const errors = validator.validatePersonalInfo(dataWithDate);

        // Property: Valid dates should not produce birthday errors
        const hasBirthdayError = errors.some(e => e.field === 'birthday');
        expect(hasBirthdayError).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 4: Date Validation - invalid dates should be rejected', () => {
    fc.assert(
      fc.property(validPersonalInfoGen, (validData) => {
        // Create invalid date
        const invalidDate = new Date('invalid-date');
        
        const dataWithInvalidDate: Partial<PersonalInfo> = {
          ...validData,
          birthday: invalidDate,
        };

        const errors = validator.validatePersonalInfo(dataWithInvalidDate);

        // Property: Invalid dates should produce a birthday error
        const hasBirthdayError = errors.some(
          e => e.field === 'birthday' && e.message.includes('valid date')
        );
        expect(hasBirthdayError).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 4: Date Validation - missing birthday should be rejected', () => {
    fc.assert(
      fc.property(validPersonalInfoGen, (validData) => {
        const dataWithoutBirthday: Partial<PersonalInfo> = {
          ...validData,
        };
        delete (dataWithoutBirthday as any).birthday;

        const errors = validator.validatePersonalInfo(dataWithoutBirthday);

        // Property: Missing birthday should produce an error
        const hasBirthdayError = errors.some(e => e.field === 'birthday');
        expect(hasBirthdayError).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // PROPERTY 5: Conditional Citizenship Validation
  // **Validates: Requirements 2.4**
  // ============================================================================

  test('Property 5: Conditional Citizenship Validation - FOREIGNER citizenship requires specification', () => {
    fc.assert(
      fc.property(validPersonalInfoGen, (validData) => {
        const foreignerData: Partial<PersonalInfo> = {
          ...validData,
          citizenship: 'FOREIGNER',
          citizenshipSpecification: undefined, // Missing specification
        };

        const errors = validator.validatePersonalInfo(foreignerData);

        // Property: Should have error for missing citizenshipSpecification
        const hasSpecificationError = errors.some(
          e => e.field === 'citizenshipSpecification'
        );
        expect(hasSpecificationError).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 5: Conditional Citizenship Validation - FOREIGNER with specification should pass', () => {
    fc.assert(
      fc.property(foreignerPersonalInfoGen, (foreignerData) => {
        const errors = validator.validatePersonalInfo(foreignerData);

        // Property: Should not have error for citizenshipSpecification
        const hasSpecificationError = errors.some(
          e => e.field === 'citizenshipSpecification'
        );
        expect(hasSpecificationError).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 5: Conditional Citizenship Validation - FILIPINO citizenship does not require specification', () => {
    fc.assert(
      fc.property(validPersonalInfoGen, (validData) => {
        const filipinoData: PersonalInfo = {
          ...validData,
          citizenship: 'FILIPINO',
          citizenshipSpecification: undefined,
        };

        const errors = validator.validatePersonalInfo(filipinoData);

        // Property: Should not have error for citizenshipSpecification
        const hasSpecificationError = errors.some(
          e => e.field === 'citizenshipSpecification'
        );
        expect(hasSpecificationError).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 5: Conditional Citizenship Validation - empty specification for FOREIGNER should fail', () => {
    fc.assert(
      fc.property(validPersonalInfoGen, (validData) => {
        const foreignerData: Partial<PersonalInfo> = {
          ...validData,
          citizenship: 'FOREIGNER',
          citizenshipSpecification: '', // Empty specification
        };

        const errors = validator.validatePersonalInfo(foreignerData);

        // Property: Should have error for empty citizenshipSpecification
        const hasSpecificationError = errors.some(
          e => e.field === 'citizenshipSpecification'
        );
        expect(hasSpecificationError).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // PROPERTY 6: Validation Error Messages
  // **Validates: Requirements 2.5**
  // ============================================================================

  test('Property 6: Validation Error Messages - multiple invalid fields return specific errors for each', () => {
    fc.assert(
      fc.property(
        fc.array(requiredFieldGen, { minLength: 2, maxLength: 6 }).map(arr => [...new Set(arr)]),
        (fieldsToInvalidate) => {
          // Create data with multiple invalid fields
          const invalidData: Partial<PersonalInfo> = {
            lastName: 'Valid',
            firstName: 'Valid',
            middleName: 'Valid',
            nickname: 'Valid',
            sex: 'MALE',
            age: 5,
            birthday: new Date('2019-01-01'),
            placeOfBirth: 'Valid',
            religion: 'Valid',
            presentAddress: 'Valid',
            contactNumber: 'Valid',
            citizenship: 'FILIPINO',
          };

          // Invalidate selected fields
          fieldsToInvalidate.forEach(field => {
            if (field === 'age') {
              delete (invalidData as any)[field];
            } else if (field === 'sex' || field === 'citizenship' || field === 'birthday') {
              delete (invalidData as any)[field];
            } else {
              (invalidData as any)[field] = '';
            }
          });

          const errors = validator.validatePersonalInfo(invalidData);

          // Property: Each invalid field should have a specific error message
          fieldsToInvalidate.forEach(field => {
            const fieldErrors = errors.filter(e => e.field === field);
            expect(fieldErrors.length).toBeGreaterThan(0);
            
            // Each error should have a non-empty message
            fieldErrors.forEach(error => {
              expect(error.message).toBeTruthy();
              expect(error.message.length).toBeGreaterThan(0);
            });
          });

          // Property: All errors should have both field and message
          errors.forEach(error => {
            expect(error.field).toBeTruthy();
            expect(error.message).toBeTruthy();
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 6: Validation Error Messages - errors identify specific fields', () => {
    fc.assert(
      fc.property(requiredFieldGen, (fieldToInvalidate) => {
        const invalidData: Partial<PersonalInfo> = {
          lastName: 'Valid',
          firstName: 'Valid',
          middleName: 'Valid',
          nickname: 'Valid',
          sex: 'MALE',
          age: 5,
          birthday: new Date('2019-01-01'),
          placeOfBirth: 'Valid',
          religion: 'Valid',
          presentAddress: 'Valid',
          contactNumber: 'Valid',
          citizenship: 'FILIPINO',
        };

        // Invalidate one field
        if (fieldToInvalidate === 'age') {
          delete (invalidData as any)[fieldToInvalidate];
        } else if (fieldToInvalidate === 'sex' || fieldToInvalidate === 'citizenship' || fieldToInvalidate === 'birthday') {
          delete (invalidData as any)[fieldToInvalidate];
        } else {
          (invalidData as any)[fieldToInvalidate] = '';
        }

        const errors = validator.validatePersonalInfo(invalidData);

        // Property: Should have at least one error with the correct field name
        const relevantErrors = errors.filter(e => e.field === fieldToInvalidate);
        expect(relevantErrors.length).toBeGreaterThan(0);

        // Property: Error message should be descriptive
        relevantErrors.forEach(error => {
          expect(error.message.length).toBeGreaterThan(10); // Reasonable message length
        });
      }),
      { numRuns: 100 }
    );
  });

  test('Property 6: Validation Error Messages - all errors at once allows user to fix all issues', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 8 }),
        (numFieldsToInvalidate) => {
          // Create completely invalid data
          const invalidData: Partial<PersonalInfo> = {};

          const errors = validator.validatePersonalInfo(invalidData);

          // Property: Should return multiple errors (one for each missing required field)
          expect(errors.length).toBeGreaterThan(1);

          // Property: Each error should identify a unique field
          const uniqueFields = new Set(errors.map(e => e.field));
          expect(uniqueFields.size).toBeGreaterThan(1);

          // Property: All errors should be returned at once (not just the first one)
          // We expect at least 12 required fields to have errors
          expect(errors.length).toBeGreaterThanOrEqual(12);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // PROPERTY 7: Profile Picture Size Validation
  // **Validates: Requirements 3.1**
  // ============================================================================

  test('Property 7: Profile Picture Size Validation - files exceeding 100MB should be rejected', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100 * 1024 * 1024 + 1, max: 200 * 1024 * 1024 }), // Size > 100MB
        fc.constantFrom('image/jpeg', 'image/png'),
        fc.string({ minLength: 1, maxLength: 50 }),
        (fileSize, mimeType, fileName) => {
          // Create a mock File object with size exceeding 100MB
          const file = new File([''], fileName, { type: mimeType });
          Object.defineProperty(file, 'size', { value: fileSize });

          const errors = validator.validateProfilePicture(file);

          // Property: Should have at least one error
          expect(errors.length).toBeGreaterThan(0);

          // Property: Should have an error about file size
          const hasSizeError = errors.some(
            e => e.field === 'profilePicture' && e.message.includes('100MB')
          );
          expect(hasSizeError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 7: Profile Picture Size Validation - files within 100MB limit should pass size validation', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 * 1024 * 1024 }), // Size <= 100MB
        fc.constantFrom('image/jpeg', 'image/png'),
        fc.string({ minLength: 1, maxLength: 50 }),
        (fileSize, mimeType, fileName) => {
          // Create a mock File object with valid size
          const file = new File([''], fileName, { type: mimeType });
          Object.defineProperty(file, 'size', { value: fileSize });

          const errors = validator.validateProfilePicture(file);

          // Property: Should not have size-related errors
          const hasSizeError = errors.some(
            e => e.field === 'profilePicture' && e.message.includes('100MB')
          );
          expect(hasSizeError).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // PROPERTY 8: Profile Picture Format Validation
  // **Validates: Requirements 3.2**
  // ============================================================================

  test('Property 8: Profile Picture Format Validation - non-JPEG/PNG files should be rejected', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'application/pdf',
          'image/gif',
          'image/bmp',
          'image/webp',
          'text/plain',
          'application/octet-stream',
          'video/mp4'
        ),
        fc.string({ minLength: 1, maxLength: 50 }),
        (mimeType, fileName) => {
          // Create a mock File object with invalid format
          const file = new File([''], fileName, { type: mimeType });
          Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

          const errors = validator.validateProfilePicture(file);

          // Property: Should have at least one error
          expect(errors.length).toBeGreaterThan(0);

          // Property: Should have an error about file format
          const hasFormatError = errors.some(
            e => e.field === 'profilePicture' && 
            (e.message.includes('JPEG') || e.message.includes('PNG') || e.message.includes('format'))
          );
          expect(hasFormatError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 8: Profile Picture Format Validation - JPEG and PNG files should pass format validation', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('image/jpeg', 'image/png'),
        fc.string({ minLength: 1, maxLength: 50 }),
        (mimeType, fileName) => {
          // Create a mock File object with valid format
          const file = new File([''], fileName, { type: mimeType });
          Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

          const errors = validator.validateProfilePicture(file);

          // Property: Should not have format-related errors
          const hasFormatError = errors.some(
            e => e.field === 'profilePicture' && 
            (e.message.includes('format') || e.message.includes('JPEG') || e.message.includes('PNG'))
          );
          expect(hasFormatError).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // PROPERTY 13: Document Format Validation
  // **Validates: Requirements 4.5**
  // ============================================================================

  test('Property 13: Document Format Validation - non-PDF/JPEG/PNG documents should be rejected', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'image/gif',
          'image/bmp',
          'image/webp',
          'text/plain',
          'application/octet-stream',
          'video/mp4',
          'application/msword'
        ),
        fc.constantFrom<DocumentType>(
          'REPORT_CARD',
          'BIRTH_CERTIFICATE',
          'GOOD_MORAL',
          'MARRIAGE_CONTRACT',
          'MEDICAL_RECORDS',
          'PROOF_OF_PAYMENT'
        ),
        fc.string({ minLength: 1, maxLength: 50 }),
        (mimeType, docType, fileName) => {
          // Create a mock File object with invalid format
          const file = new File([''], fileName, { type: mimeType });
          Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

          const errors = validator.validateDocument(file, docType);

          // Property: Should have at least one error
          expect(errors.length).toBeGreaterThan(0);

          // Property: Should have an error about file format
          const hasFormatError = errors.some(
            e => e.field === docType && 
            (e.message.includes('PDF') || e.message.includes('JPEG') || 
             e.message.includes('PNG') || e.message.includes('format'))
          );
          expect(hasFormatError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 13: Document Format Validation - PDF, JPEG, and PNG documents should pass format validation', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('application/pdf', 'image/jpeg', 'image/png'),
        fc.constantFrom<DocumentType>(
          'REPORT_CARD',
          'BIRTH_CERTIFICATE',
          'GOOD_MORAL',
          'MARRIAGE_CONTRACT',
          'MEDICAL_RECORDS',
          'PROOF_OF_PAYMENT'
        ),
        fc.string({ minLength: 1, maxLength: 50 }),
        (mimeType, docType, fileName) => {
          // Create a mock File object with valid format
          const file = new File([''], fileName, { type: mimeType });
          Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB

          const errors = validator.validateDocument(file, docType);

          // Property: Should not have format-related errors
          const hasFormatError = errors.some(
            e => e.field === docType && 
            (e.message.includes('format') || e.message.includes('PDF') || 
             e.message.includes('JPEG') || e.message.includes('PNG'))
          );
          expect(hasFormatError).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // PROPERTY 10: Old Student Document Requirements
  // **Validates: Requirements 4.1, 4.4**
  // ============================================================================

  test('Property 10: Old Student Document Requirements - missing REPORT_CARD should be rejected', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom<DocumentType>(
            'BIRTH_CERTIFICATE',
            'GOOD_MORAL',
            'MARRIAGE_CONTRACT',
            'MEDICAL_RECORDS',
            'SPECIAL_NEEDS_DIAGNOSIS'
          ),
          { minLength: 0, maxLength: 3 }
        ),
        (otherDocs) => {
          // Create document list without REPORT_CARD but with PROOF_OF_PAYMENT
          const documents = [
            ...otherDocs.map(type => ({ type })),
            { type: 'PROOF_OF_PAYMENT' as DocumentType }
          ];

          const errors = validator.validateRequiredDocuments(documents, 'OLD_STUDENT');

          // Property: Should have an error for missing REPORT_CARD
          const hasReportCardError = errors.some(
            e => e.message.includes('Report card') || e.message.includes('REPORT_CARD')
          );
          expect(hasReportCardError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: Old Student Document Requirements - missing PROOF_OF_PAYMENT should be rejected', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom<DocumentType>(
            'BIRTH_CERTIFICATE',
            'GOOD_MORAL',
            'MARRIAGE_CONTRACT',
            'MEDICAL_RECORDS',
            'SPECIAL_NEEDS_DIAGNOSIS'
          ),
          { minLength: 0, maxLength: 3 }
        ),
        (otherDocs) => {
          // Create document list without PROOF_OF_PAYMENT but with REPORT_CARD
          const documents = [
            ...otherDocs.map(type => ({ type })),
            { type: 'REPORT_CARD' as DocumentType }
          ];

          const errors = validator.validateRequiredDocuments(documents, 'OLD_STUDENT');

          // Property: Should have an error for missing PROOF_OF_PAYMENT
          const hasProofOfPaymentError = errors.some(
            e => e.message.includes('Proof of Payment') || e.message.includes('PROOF_OF_PAYMENT')
          );
          expect(hasProofOfPaymentError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 10: Old Student Document Requirements - with required documents should pass', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom<DocumentType>(
            'BIRTH_CERTIFICATE',
            'GOOD_MORAL',
            'MARRIAGE_CONTRACT',
            'MEDICAL_RECORDS',
            'SPECIAL_NEEDS_DIAGNOSIS'
          ),
          { minLength: 0, maxLength: 5 }
        ),
        (optionalDocs) => {
          // Create document list with required documents for old students
          const documents = [
            { type: 'REPORT_CARD' as DocumentType },
            { type: 'PROOF_OF_PAYMENT' as DocumentType },
            ...optionalDocs.map(type => ({ type }))
          ];

          const errors = validator.validateRequiredDocuments(documents, 'OLD_STUDENT');

          // Property: Should have no errors when required documents are present
          expect(errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // PROPERTY 11: New Student Document Requirements
  // **Validates: Requirements 4.2, 4.4**
  // ============================================================================

  test('Property 11: New Student Document Requirements - missing any required document should be rejected', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<DocumentType>(
          'REPORT_CARD',
          'BIRTH_CERTIFICATE',
          'GOOD_MORAL',
          'MARRIAGE_CONTRACT',
          'MEDICAL_RECORDS',
          'PROOF_OF_PAYMENT'
        ),
        (docToRemove) => {
          // Create document list with all required documents except one
          const allRequired: DocumentType[] = [
            'REPORT_CARD',
            'BIRTH_CERTIFICATE',
            'GOOD_MORAL',
            'MARRIAGE_CONTRACT',
            'MEDICAL_RECORDS',
            'PROOF_OF_PAYMENT'
          ];

          const documents = allRequired
            .filter(type => type !== docToRemove)
            .map(type => ({ type }));

          const errors = validator.validateRequiredDocuments(documents, 'NEW_STUDENT');

          // Property: Should have at least one error
          expect(errors.length).toBeGreaterThan(0);

          // Property: Error should mention the missing document
          const hasRelevantError = errors.some(e => 
            e.message.toLowerCase().includes(docToRemove.toLowerCase().replace(/_/g, ' '))
          );
          expect(hasRelevantError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 11: New Student Document Requirements - with all required documents should pass', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (includeOptional) => {
          // Create document list with all required documents
          const documents: { type: DocumentType }[] = [
            { type: 'REPORT_CARD' },
            { type: 'BIRTH_CERTIFICATE' },
            { type: 'GOOD_MORAL' },
            { type: 'MARRIAGE_CONTRACT' },
            { type: 'MEDICAL_RECORDS' },
            { type: 'PROOF_OF_PAYMENT' }
          ];

          // Optionally add special needs diagnosis
          if (includeOptional) {
            documents.push({ type: 'SPECIAL_NEEDS_DIAGNOSIS' });
          }

          const errors = validator.validateRequiredDocuments(documents, 'NEW_STUDENT');

          // Property: Should have no errors when all required documents are present
          expect(errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 11: New Student Document Requirements - multiple missing documents should return multiple errors', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom<DocumentType>(
            'REPORT_CARD',
            'BIRTH_CERTIFICATE',
            'GOOD_MORAL',
            'MARRIAGE_CONTRACT',
            'MEDICAL_RECORDS',
            'PROOF_OF_PAYMENT'
          ),
          { minLength: 2, maxLength: 4 }
        ).map(arr => [...new Set(arr)]), // Remove duplicates
        (docsToRemove) => {
          // Create document list with multiple required documents missing
          const allRequired: DocumentType[] = [
            'REPORT_CARD',
            'BIRTH_CERTIFICATE',
            'GOOD_MORAL',
            'MARRIAGE_CONTRACT',
            'MEDICAL_RECORDS',
            'PROOF_OF_PAYMENT'
          ];

          const documents = allRequired
            .filter(type => !docsToRemove.includes(type))
            .map(type => ({ type }));

          const errors = validator.validateRequiredDocuments(documents, 'NEW_STUDENT');

          // Property: Should have at least as many errors as missing documents
          expect(errors.length).toBeGreaterThanOrEqual(docsToRemove.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // PROPERTY 12: Optional Special Needs Documents
  // **Validates: Requirements 4.3**
  // ============================================================================

  test('Property 12: Optional Special Needs Documents - SPECIAL_NEEDS_DIAGNOSIS should be optional for new students', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (includeSpecialNeeds) => {
          // Create document list with all required documents
          const documents: { type: DocumentType }[] = [
            { type: 'REPORT_CARD' },
            { type: 'BIRTH_CERTIFICATE' },
            { type: 'GOOD_MORAL' },
            { type: 'MARRIAGE_CONTRACT' },
            { type: 'MEDICAL_RECORDS' },
            { type: 'PROOF_OF_PAYMENT' }
          ];

          // Conditionally add special needs diagnosis
          if (includeSpecialNeeds) {
            documents.push({ type: 'SPECIAL_NEEDS_DIAGNOSIS' });
          }

          const errors = validator.validateRequiredDocuments(documents, 'NEW_STUDENT');

          // Property: Should pass validation regardless of special needs diagnosis presence
          expect(errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 12: Optional Special Needs Documents - submission should succeed without SPECIAL_NEEDS_DIAGNOSIS', () => {
    fc.assert(
      fc.property(
        fc.constant('NEW_STUDENT' as StudentStatus),
        (studentStatus) => {
          // Create document list without special needs diagnosis
          const documents: { type: DocumentType }[] = [
            { type: 'REPORT_CARD' },
            { type: 'BIRTH_CERTIFICATE' },
            { type: 'GOOD_MORAL' },
            { type: 'MARRIAGE_CONTRACT' },
            { type: 'MEDICAL_RECORDS' },
            { type: 'PROOF_OF_PAYMENT' }
          ];

          const errors = validator.validateRequiredDocuments(documents, studentStatus);

          // Property: Should have no errors about missing special needs diagnosis
          const hasSpecialNeedsError = errors.some(
            e => e.message.includes('SPECIAL_NEEDS_DIAGNOSIS') || 
                 e.message.includes('Special needs')
          );
          expect(hasSpecialNeedsError).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // GENERATORS FOR PARENT INFO TESTS
  // ============================================================================

  /**
   * Generator for valid educational attainment values
   */
  const educationalAttainmentGen = fc.constantFrom<EducationalAttainment>(
    'ELEMENTARY_GRADUATE',
    'HIGH_SCHOOL_GRADUATE',
    'COLLEGE_GRADUATE',
    'ELEMENTARY_UNDERGRAD',
    'HIGH_SCHOOL_UNDERGRAD',
    'COLLEGE_UNDERGRAD',
    'OTHERS'
  );

  /**
   * Generator for valid marital status arrays (at least one selected)
   */
  const maritalStatusArrayGen = fc.array(
    fc.constantFrom<MaritalStatus>(
      'MARRIED',
      'SEPARATED',
      'SINGLE_PARENT',
      'STEPMOTHER',
      'STEPFATHER',
      'OTHER'
    ),
    { minLength: 1, maxLength: 3 }
  ).map(arr => [...new Set(arr)]); // Remove duplicates

  /**
   * Generator for valid phone numbers
   */
  const validPhoneGen = fc.oneof(
    fc.string({ minLength: 10, maxLength: 11 }).map(s => '09' + s.slice(0, 9)), // 09XXXXXXXXX
    fc.string({ minLength: 10, maxLength: 11 }).map(s => '+639' + s.slice(0, 9)), // +639XXXXXXXXX
    fc.constant('09171234567'),
    fc.constant('+639171234567'),
    fc.constant('0917-123-4567')
  );

  /**
   * Generator for invalid phone numbers
   */
  const invalidPhoneGen = fc.oneof(
    fc.constant('123'), // Too short
    fc.constant('abcdefghij'), // Non-numeric
    fc.constant(''), // Empty
    fc.constant('12345'), // Too short
    fc.constant('+1234567890123456789') // Too long
  );

  /**
   * Generator for valid email addresses
   */
  const validEmailGen = fc.oneof(
    fc.emailAddress(),
    fc.constant('test@example.com'),
    fc.constant('user.name@domain.co.uk'),
    fc.constant('parent123@school.edu')
  );

  /**
   * Generator for invalid email addresses
   */
  const invalidEmailGen = fc.oneof(
    fc.constant('notanemail'),
    fc.constant('@example.com'),
    fc.constant('user@'),
    fc.constant('user @example.com'),
    fc.constant(''),
    fc.constant('user@.com')
  );

  /**
   * Generator for valid parent info with all required fields
   */
  const validParentInfoGen = fc.record({
    fatherFullName: nameGen,
    fatherOccupation: fc.option(nonEmptyStringGen, { nil: undefined }),
    fatherContactNumber: validPhoneGen,
    fatherEmail: fc.option(validEmailGen, { nil: undefined }),
    fatherEducationalAttainment: educationalAttainmentGen,
    motherFullName: nameGen,
    motherOccupation: fc.option(nonEmptyStringGen, { nil: undefined }),
    motherContactNumber: validPhoneGen,
    motherEmail: validEmailGen,
    motherEducationalAttainment: educationalAttainmentGen,
    maritalStatus: maritalStatusArrayGen,
  });

  // ============================================================================
  // PROPERTY 30: Parent Information Required Fields
  // **Validates: Requirements 11.1, 11.3**
  // ============================================================================

  test('Property 30: Parent Information Required Fields - missing father required fields should be rejected', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('fatherFullName', 'fatherContactNumber', 'fatherEducationalAttainment'),
        (fieldToRemove) => {
          const invalidData: Partial<ParentInfo> = {
            fatherFullName: 'John Doe',
            fatherContactNumber: '09171234567',
            fatherEducationalAttainment: 'COLLEGE_GRADUATE',
            motherFullName: 'Jane Doe',
            motherContactNumber: '09181234567',
            motherEmail: 'jane@example.com',
            motherEducationalAttainment: 'HIGH_SCHOOL_GRADUATE',
            maritalStatus: ['MARRIED'],
          };

          // Remove the required field
          delete (invalidData as any)[fieldToRemove];

          const errors = validator.validateParentInfo(invalidData);

          // Property: Should have an error for the missing field
          const hasFieldError = errors.some(e => e.field === fieldToRemove);
          expect(hasFieldError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 30: Parent Information Required Fields - missing mother required fields should be rejected', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('motherFullName', 'motherContactNumber', 'motherEmail', 'motherEducationalAttainment'),
        (fieldToRemove) => {
          const invalidData: Partial<ParentInfo> = {
            fatherFullName: 'John Doe',
            fatherContactNumber: '09171234567',
            fatherEducationalAttainment: 'COLLEGE_GRADUATE',
            motherFullName: 'Jane Doe',
            motherContactNumber: '09181234567',
            motherEmail: 'jane@example.com',
            motherEducationalAttainment: 'HIGH_SCHOOL_GRADUATE',
            maritalStatus: ['MARRIED'],
          };

          // Remove the required field
          delete (invalidData as any)[fieldToRemove];

          const errors = validator.validateParentInfo(invalidData);

          // Property: Should have an error for the missing field
          const hasFieldError = errors.some(e => e.field === fieldToRemove);
          expect(hasFieldError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 30: Parent Information Required Fields - all required fields present should pass', () => {
    fc.assert(
      fc.property(validParentInfoGen, (validData) => {
        const errors = validator.validateParentInfo(validData);

        // Property: Should have no errors when all required fields are present
        expect(errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // PROPERTY 31: Parent Information Optional Fields
  // **Validates: Requirements 11.2, 11.4**
  // ============================================================================

  test('Property 31: Parent Information Optional Fields - fatherOccupation and fatherEmail should be optional', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        (includeFatherOccupation, includeFatherEmail) => {
          const data: Partial<ParentInfo> = {
            fatherFullName: 'John Doe',
            fatherContactNumber: '09171234567',
            fatherEducationalAttainment: 'COLLEGE_GRADUATE',
            motherFullName: 'Jane Doe',
            motherContactNumber: '09181234567',
            motherEmail: 'jane@example.com',
            motherEducationalAttainment: 'HIGH_SCHOOL_GRADUATE',
            maritalStatus: ['MARRIED'],
          };

          if (includeFatherOccupation) {
            data.fatherOccupation = 'Engineer';
          }

          if (includeFatherEmail) {
            data.fatherEmail = 'john@example.com';
          }

          const errors = validator.validateParentInfo(data);

          // Property: Should pass validation regardless of optional fields
          expect(errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 31: Parent Information Optional Fields - motherOccupation should be optional', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (includeMotherOccupation) => {
          const data: Partial<ParentInfo> = {
            fatherFullName: 'John Doe',
            fatherContactNumber: '09171234567',
            fatherEducationalAttainment: 'COLLEGE_GRADUATE',
            motherFullName: 'Jane Doe',
            motherContactNumber: '09181234567',
            motherEmail: 'jane@example.com',
            motherEducationalAttainment: 'HIGH_SCHOOL_GRADUATE',
            maritalStatus: ['MARRIED'],
          };

          if (includeMotherOccupation) {
            data.motherOccupation = 'Teacher';
          }

          const errors = validator.validateParentInfo(data);

          // Property: Should pass validation regardless of motherOccupation
          expect(errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // PROPERTY 32: Phone Number Validation
  // **Validates: Requirements 11.5, 15.3**
  // ============================================================================

  test('Property 32: Phone Number Validation - invalid phone numbers should be rejected', () => {
    fc.assert(
      fc.property(
        invalidPhoneGen,
        fc.constantFrom('fatherContactNumber', 'motherContactNumber'),
        (invalidPhone, fieldToInvalidate) => {
          const data: Partial<ParentInfo> = {
            fatherFullName: 'John Doe',
            fatherContactNumber: '09171234567',
            fatherEducationalAttainment: 'COLLEGE_GRADUATE',
            motherFullName: 'Jane Doe',
            motherContactNumber: '09181234567',
            motherEmail: 'jane@example.com',
            motherEducationalAttainment: 'HIGH_SCHOOL_GRADUATE',
            maritalStatus: ['MARRIED'],
          };

          // Set invalid phone number
          (data as any)[fieldToInvalidate] = invalidPhone;

          const errors = validator.validateParentInfo(data);

          // Property: Should have an error for invalid phone number
          const hasPhoneError = errors.some(
            e => e.field === fieldToInvalidate && 
            (e.message.includes('phone') || e.message.includes('Contact Number'))
          );
          expect(hasPhoneError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 32: Phone Number Validation - valid phone numbers should pass', () => {
    fc.assert(
      fc.property(
        validPhoneGen,
        validPhoneGen,
        (fatherPhone, motherPhone) => {
          const data: Partial<ParentInfo> = {
            fatherFullName: 'John Doe',
            fatherContactNumber: fatherPhone,
            fatherEducationalAttainment: 'COLLEGE_GRADUATE',
            motherFullName: 'Jane Doe',
            motherContactNumber: motherPhone,
            motherEmail: 'jane@example.com',
            motherEducationalAttainment: 'HIGH_SCHOOL_GRADUATE',
            maritalStatus: ['MARRIED'],
          };

          const errors = validator.validateParentInfo(data);

          // Property: Should not have phone number errors
          const hasPhoneError = errors.some(
            e => (e.field === 'fatherContactNumber' || e.field === 'motherContactNumber') &&
            (e.message.includes('valid phone') || e.message.includes('valid phone number'))
          );
          expect(hasPhoneError).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // PROPERTY 33: Email Address Validation
  // **Validates: Requirements 11.6, 15.4**
  // ============================================================================

  test('Property 33: Email Address Validation - invalid email addresses should be rejected', () => {
    fc.assert(
      fc.property(
        invalidEmailGen,
        fc.constantFrom('fatherEmail', 'motherEmail'),
        (invalidEmail, fieldToInvalidate) => {
          const data: Partial<ParentInfo> = {
            fatherFullName: 'John Doe',
            fatherContactNumber: '09171234567',
            fatherEmail: 'john@example.com',
            fatherEducationalAttainment: 'COLLEGE_GRADUATE',
            motherFullName: 'Jane Doe',
            motherContactNumber: '09181234567',
            motherEmail: 'jane@example.com',
            motherEducationalAttainment: 'HIGH_SCHOOL_GRADUATE',
            maritalStatus: ['MARRIED'],
          };

          // Set invalid email
          (data as any)[fieldToInvalidate] = invalidEmail;

          const errors = validator.validateParentInfo(data);

          // Property: Should have an error for invalid email
          const hasEmailError = errors.some(
            e => e.field === fieldToInvalidate && 
            (e.message.includes('email') || e.message.includes('Email'))
          );
          expect(hasEmailError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 33: Email Address Validation - valid email addresses should pass', () => {
    fc.assert(
      fc.property(
        validEmailGen,
        validEmailGen,
        (fatherEmail, motherEmail) => {
          const data: Partial<ParentInfo> = {
            fatherFullName: 'John Doe',
            fatherContactNumber: '09171234567',
            fatherEmail: fatherEmail,
            fatherEducationalAttainment: 'COLLEGE_GRADUATE',
            motherFullName: 'Jane Doe',
            motherContactNumber: '09181234567',
            motherEmail: motherEmail,
            motherEducationalAttainment: 'HIGH_SCHOOL_GRADUATE',
            maritalStatus: ['MARRIED'],
          };

          const errors = validator.validateParentInfo(data);

          // Property: Should not have email errors for valid emails
          const hasEmailError = errors.some(
            e => (e.field === 'fatherEmail' || e.field === 'motherEmail') &&
            e.message.includes('valid email')
          );
          expect(hasEmailError).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // PROPERTY 34: Marital Status Selection
  // **Validates: Requirements 11.7, 11.8**
  // ============================================================================

  test('Property 34: Marital Status Selection - empty marital status array should be rejected', () => {
    fc.assert(
      fc.property(
        fc.constant([]),
        (emptyArray) => {
          const data: Partial<ParentInfo> = {
            fatherFullName: 'John Doe',
            fatherContactNumber: '09171234567',
            fatherEducationalAttainment: 'COLLEGE_GRADUATE',
            motherFullName: 'Jane Doe',
            motherContactNumber: '09181234567',
            motherEmail: 'jane@example.com',
            motherEducationalAttainment: 'HIGH_SCHOOL_GRADUATE',
            maritalStatus: emptyArray,
          };

          const errors = validator.validateParentInfo(data);

          // Property: Should have an error for empty marital status
          const hasMaritalStatusError = errors.some(
            e => e.field === 'maritalStatus' && 
            e.message.includes('at least one')
          );
          expect(hasMaritalStatusError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 34: Marital Status Selection - one or more marital status selections should pass', () => {
    fc.assert(
      fc.property(
        maritalStatusArrayGen,
        (maritalStatusArray) => {
          const data: Partial<ParentInfo> = {
            fatherFullName: 'John Doe',
            fatherContactNumber: '09171234567',
            fatherEducationalAttainment: 'COLLEGE_GRADUATE',
            motherFullName: 'Jane Doe',
            motherContactNumber: '09181234567',
            motherEmail: 'jane@example.com',
            motherEducationalAttainment: 'HIGH_SCHOOL_GRADUATE',
            maritalStatus: maritalStatusArray,
          };

          const errors = validator.validateParentInfo(data);

          // Property: Should not have marital status errors when at least one is selected
          const hasMaritalStatusError = errors.some(e => e.field === 'maritalStatus');
          expect(hasMaritalStatusError).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 34: Marital Status Selection - multiple selections should be accepted', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom<MaritalStatus>(
            'MARRIED',
            'SEPARATED',
            'SINGLE_PARENT',
            'STEPMOTHER',
            'STEPFATHER',
            'OTHER'
          ),
          { minLength: 2, maxLength: 4 }
        ).map(arr => [...new Set(arr)]),
        (multipleStatuses) => {
          const data: Partial<ParentInfo> = {
            fatherFullName: 'John Doe',
            fatherContactNumber: '09171234567',
            fatherEducationalAttainment: 'COLLEGE_GRADUATE',
            motherFullName: 'Jane Doe',
            motherContactNumber: '09181234567',
            motherEmail: 'jane@example.com',
            motherEducationalAttainment: 'HIGH_SCHOOL_GRADUATE',
            maritalStatus: multipleStatuses,
          };

          const errors = validator.validateParentInfo(data);

          // Property: Should accept multiple marital status selections
          expect(errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // GENERATORS FOR STUDENT HISTORY TESTS
  // ============================================================================

  /**
   * Generator for valid student history with all required fields
   */
  const validStudentHistoryGen = fc.record({
    siblingsInformation: fc.option(nonEmptyStringGen, { nil: undefined }),
    totalLearnersInHousehold: fc.integer({ min: 1, max: 20 }),
    lastSchoolPreschoolName: nameGen,
    lastSchoolPreschoolAddress: fc.option(nonEmptyStringGen, { nil: undefined }),
    lastSchoolElementaryName: nameGen,
    lastSchoolElementaryAddress: fc.option(nonEmptyStringGen, { nil: undefined }),
  });

  // ============================================================================
  // PROPERTY 36: Student History Required Fields
  // **Validates: Requirements 13.2, 13.3, 13.5**
  // ============================================================================

  test('Property 36: Student History Required Fields - missing totalLearnersInHousehold should be rejected', () => {
    fc.assert(
      fc.property(
        fc.constant(undefined),
        (missingValue) => {
          const data: Partial<StudentHistory> = {
            totalLearnersInHousehold: missingValue as any,
            lastSchoolPreschoolName: 'ABC Preschool',
            lastSchoolElementaryName: 'XYZ Elementary',
          };

          const errors = validator.validateStudentHistory(data);

          // Property: Should have an error for missing totalLearnersInHousehold
          const hasError = errors.some(e => e.field === 'totalLearnersInHousehold');
          expect(hasError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 36: Student History Required Fields - missing lastSchoolPreschoolName should be rejected', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.constant(''), fc.constant(undefined)),
        (invalidValue) => {
          const data: Partial<StudentHistory> = {
            totalLearnersInHousehold: 3,
            lastSchoolPreschoolName: invalidValue as any,
            lastSchoolElementaryName: 'XYZ Elementary',
          };

          const errors = validator.validateStudentHistory(data);

          // Property: Should have an error for missing lastSchoolPreschoolName
          const hasError = errors.some(e => e.field === 'lastSchoolPreschoolName');
          expect(hasError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 36: Student History Required Fields - missing lastSchoolElementaryName should be rejected', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.constant(''), fc.constant(undefined)),
        (invalidValue) => {
          const data: Partial<StudentHistory> = {
            totalLearnersInHousehold: 3,
            lastSchoolPreschoolName: 'ABC Preschool',
            lastSchoolElementaryName: invalidValue as any,
          };

          const errors = validator.validateStudentHistory(data);

          // Property: Should have an error for missing lastSchoolElementaryName
          const hasError = errors.some(e => e.field === 'lastSchoolElementaryName');
          expect(hasError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 36: Student History Required Fields - all required fields present should pass', () => {
    fc.assert(
      fc.property(validStudentHistoryGen, (validData) => {
        const errors = validator.validateStudentHistory(validData);

        // Property: Should have no errors when all required fields are present
        expect(errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 36: Student History Required Fields - multiple missing fields should return multiple errors', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom('totalLearnersInHousehold', 'lastSchoolPreschoolName', 'lastSchoolElementaryName'),
          { minLength: 2, maxLength: 3 }
        ).map(arr => [...new Set(arr)]),
        (fieldsToRemove) => {
          const data: Partial<StudentHistory> = {
            totalLearnersInHousehold: 3,
            lastSchoolPreschoolName: 'ABC Preschool',
            lastSchoolElementaryName: 'XYZ Elementary',
          };

          // Remove selected fields
          fieldsToRemove.forEach(field => {
            delete (data as any)[field];
          });

          const errors = validator.validateStudentHistory(data);

          // Property: Should have errors for all missing fields
          fieldsToRemove.forEach(field => {
            const hasError = errors.some(e => e.field === field);
            expect(hasError).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // PROPERTY 37: Student History Optional Fields
  // **Validates: Requirements 13.1, 13.4, 13.6**
  // ============================================================================

  test('Property 37: Student History Optional Fields - siblingsInformation should be optional', () => {
    fc.assert(
      fc.property(
        fc.option(nonEmptyStringGen, { nil: undefined }),
        (siblingsInfo) => {
          const data: Partial<StudentHistory> = {
            siblingsInformation: siblingsInfo,
            totalLearnersInHousehold: 3,
            lastSchoolPreschoolName: 'ABC Preschool',
            lastSchoolElementaryName: 'XYZ Elementary',
          };

          const errors = validator.validateStudentHistory(data);

          // Property: Should pass validation regardless of siblingsInformation
          expect(errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 37: Student History Optional Fields - lastSchoolPreschoolAddress should be optional', () => {
    fc.assert(
      fc.property(
        fc.option(nonEmptyStringGen, { nil: undefined }),
        (address) => {
          const data: Partial<StudentHistory> = {
            totalLearnersInHousehold: 3,
            lastSchoolPreschoolName: 'ABC Preschool',
            lastSchoolPreschoolAddress: address,
            lastSchoolElementaryName: 'XYZ Elementary',
          };

          const errors = validator.validateStudentHistory(data);

          // Property: Should pass validation regardless of lastSchoolPreschoolAddress
          expect(errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 37: Student History Optional Fields - lastSchoolElementaryAddress should be optional', () => {
    fc.assert(
      fc.property(
        fc.option(nonEmptyStringGen, { nil: undefined }),
        (address) => {
          const data: Partial<StudentHistory> = {
            totalLearnersInHousehold: 3,
            lastSchoolPreschoolName: 'ABC Preschool',
            lastSchoolElementaryName: 'XYZ Elementary',
            lastSchoolElementaryAddress: address,
          };

          const errors = validator.validateStudentHistory(data);

          // Property: Should pass validation regardless of lastSchoolElementaryAddress
          expect(errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 37: Student History Optional Fields - all optional fields absent should pass', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        (totalLearners) => {
          const data: Partial<StudentHistory> = {
            siblingsInformation: undefined,
            totalLearnersInHousehold: totalLearners,
            lastSchoolPreschoolName: 'ABC Preschool',
            lastSchoolPreschoolAddress: undefined,
            lastSchoolElementaryName: 'XYZ Elementary',
            lastSchoolElementaryAddress: undefined,
          };

          const errors = validator.validateStudentHistory(data);

          // Property: Should pass validation with all optional fields absent
          expect(errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // PROPERTY 38: Positive Integer Validation for Household Learners
  // **Validates: Requirements 13.7**
  // ============================================================================

  test('Property 38: Positive Integer Validation - zero should be rejected', () => {
    fc.assert(
      fc.property(
        fc.constant(0),
        (zeroValue) => {
          const data: Partial<StudentHistory> = {
            totalLearnersInHousehold: zeroValue,
            lastSchoolPreschoolName: 'ABC Preschool',
            lastSchoolElementaryName: 'XYZ Elementary',
          };

          const errors = validator.validateStudentHistory(data);

          // Property: Should have an error for zero value
          const hasError = errors.some(
            e => e.field === 'totalLearnersInHousehold' && 
            e.message.includes('positive')
          );
          expect(hasError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 38: Positive Integer Validation - negative values should be rejected', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -100, max: -1 }),
        (negativeValue) => {
          const data: Partial<StudentHistory> = {
            totalLearnersInHousehold: negativeValue,
            lastSchoolPreschoolName: 'ABC Preschool',
            lastSchoolElementaryName: 'XYZ Elementary',
          };

          const errors = validator.validateStudentHistory(data);

          // Property: Should have an error for negative value
          const hasError = errors.some(
            e => e.field === 'totalLearnersInHousehold' && 
            e.message.includes('positive')
          );
          expect(hasError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 38: Positive Integer Validation - non-integer values should be rejected', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.1, max: 10.9, noNaN: true }).filter(n => !Number.isInteger(n)),
        (floatValue) => {
          const data: Partial<StudentHistory> = {
            totalLearnersInHousehold: floatValue,
            lastSchoolPreschoolName: 'ABC Preschool',
            lastSchoolElementaryName: 'XYZ Elementary',
          };

          const errors = validator.validateStudentHistory(data);

          // Property: Should have an error for non-integer value
          const hasError = errors.some(
            e => e.field === 'totalLearnersInHousehold' && 
            (e.message.includes('integer') || e.message.includes('positive'))
          );
          expect(hasError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 38: Positive Integer Validation - positive integers should pass', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (positiveInt) => {
          const data: Partial<StudentHistory> = {
            totalLearnersInHousehold: positiveInt,
            lastSchoolPreschoolName: 'ABC Preschool',
            lastSchoolElementaryName: 'XYZ Elementary',
          };

          const errors = validator.validateStudentHistory(data);

          // Property: Should not have errors for positive integers
          const hasError = errors.some(e => e.field === 'totalLearnersInHousehold');
          expect(hasError).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // GENERATORS FOR ENROLLMENT AGREEMENT TESTS
  // ============================================================================

  /**
   * Generator for valid enrollment agreement with all required fields
   */
  const validEnrollmentAgreementGen = fc.record({
    responsiblePersonName: nameGen,
    responsiblePersonContactNumber: validPhoneGen,
    responsiblePersonEmail: validEmailGen,
    relationshipToStudent: fc.option(nonEmptyStringGen, { nil: undefined }),
    enrollmentAgreementAcceptance: fc.constant('YES_COMMIT' as const),
    withdrawalPolicyAcceptance: fc.constant('YES_AGREED' as const),
  });

  // ============================================================================
  // PROPERTY 41: Enrollment Agreement Required Fields
  // **Validates: Requirements 15.1, 15.5, 15.6**
  // ============================================================================

  test('Property 41: Enrollment Agreement Required Fields - missing responsiblePersonName should be rejected', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.constant(''), fc.constant(undefined)),
        (invalidValue) => {
          const data: Partial<EnrollmentAgreement> = {
            responsiblePersonName: invalidValue as any,
            responsiblePersonContactNumber: '09171234567',
            responsiblePersonEmail: 'parent@example.com',
            enrollmentAgreementAcceptance: 'YES_COMMIT',
            withdrawalPolicyAcceptance: 'YES_AGREED',
          };

          const errors = validator.validateEnrollmentAgreement(data);

          // Property: Should have an error for missing responsiblePersonName
          const hasError = errors.some(e => e.field === 'responsiblePersonName');
          expect(hasError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 41: Enrollment Agreement Required Fields - missing responsiblePersonContactNumber should be rejected', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.constant(''), fc.constant(undefined)),
        (invalidValue) => {
          const data: Partial<EnrollmentAgreement> = {
            responsiblePersonName: 'John Doe',
            responsiblePersonContactNumber: invalidValue as any,
            responsiblePersonEmail: 'parent@example.com',
            enrollmentAgreementAcceptance: 'YES_COMMIT',
            withdrawalPolicyAcceptance: 'YES_AGREED',
          };

          const errors = validator.validateEnrollmentAgreement(data);

          // Property: Should have an error for missing responsiblePersonContactNumber
          const hasError = errors.some(e => e.field === 'responsiblePersonContactNumber');
          expect(hasError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 41: Enrollment Agreement Required Fields - missing responsiblePersonEmail should be rejected', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.constant(''), fc.constant(undefined)),
        (invalidValue) => {
          const data: Partial<EnrollmentAgreement> = {
            responsiblePersonName: 'John Doe',
            responsiblePersonContactNumber: '09171234567',
            responsiblePersonEmail: invalidValue as any,
            enrollmentAgreementAcceptance: 'YES_COMMIT',
            withdrawalPolicyAcceptance: 'YES_AGREED',
          };

          const errors = validator.validateEnrollmentAgreement(data);

          // Property: Should have an error for missing responsiblePersonEmail
          const hasError = errors.some(e => e.field === 'responsiblePersonEmail');
          expect(hasError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 41: Enrollment Agreement Required Fields - missing enrollmentAgreementAcceptance should be rejected', () => {
    fc.assert(
      fc.property(
        fc.constant(undefined),
        (missingValue) => {
          const data: Partial<EnrollmentAgreement> = {
            responsiblePersonName: 'John Doe',
            responsiblePersonContactNumber: '09171234567',
            responsiblePersonEmail: 'parent@example.com',
            enrollmentAgreementAcceptance: missingValue as any,
            withdrawalPolicyAcceptance: 'YES_AGREED',
          };

          const errors = validator.validateEnrollmentAgreement(data);

          // Property: Should have an error for missing enrollmentAgreementAcceptance
          const hasError = errors.some(e => e.field === 'enrollmentAgreementAcceptance');
          expect(hasError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 41: Enrollment Agreement Required Fields - missing withdrawalPolicyAcceptance should be rejected', () => {
    fc.assert(
      fc.property(
        fc.constant(undefined),
        (missingValue) => {
          const data: Partial<EnrollmentAgreement> = {
            responsiblePersonName: 'John Doe',
            responsiblePersonContactNumber: '09171234567',
            responsiblePersonEmail: 'parent@example.com',
            enrollmentAgreementAcceptance: 'YES_COMMIT',
            withdrawalPolicyAcceptance: missingValue as any,
          };

          const errors = validator.validateEnrollmentAgreement(data);

          // Property: Should have an error for missing withdrawalPolicyAcceptance
          const hasError = errors.some(e => e.field === 'withdrawalPolicyAcceptance');
          expect(hasError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 41: Enrollment Agreement Required Fields - all required fields present should pass', () => {
    fc.assert(
      fc.property(validEnrollmentAgreementGen, (validData) => {
        const errors = validator.validateEnrollmentAgreement(validData);

        // Property: Should have no errors when all required fields are present
        expect(errors).toHaveLength(0);
      }),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // PROPERTY 42: Enrollment Agreement Optional Field
  // **Validates: Requirements 15.2**
  // ============================================================================

  test('Property 42: Enrollment Agreement Optional Field - relationshipToStudent should be optional', () => {
    fc.assert(
      fc.property(
        fc.option(nonEmptyStringGen, { nil: undefined }),
        (relationship) => {
          const data: Partial<EnrollmentAgreement> = {
            responsiblePersonName: 'John Doe',
            responsiblePersonContactNumber: '09171234567',
            responsiblePersonEmail: 'parent@example.com',
            relationshipToStudent: relationship,
            enrollmentAgreementAcceptance: 'YES_COMMIT',
            withdrawalPolicyAcceptance: 'YES_AGREED',
          };

          const errors = validator.validateEnrollmentAgreement(data);

          // Property: Should pass validation regardless of relationshipToStudent
          expect(errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 42: Enrollment Agreement Optional Field - submission should succeed without relationshipToStudent', () => {
    fc.assert(
      fc.property(
        fc.constant(undefined),
        (missingRelationship) => {
          const data: Partial<EnrollmentAgreement> = {
            responsiblePersonName: 'John Doe',
            responsiblePersonContactNumber: '09171234567',
            responsiblePersonEmail: 'parent@example.com',
            relationshipToStudent: missingRelationship,
            enrollmentAgreementAcceptance: 'YES_COMMIT',
            withdrawalPolicyAcceptance: 'YES_AGREED',
          };

          const errors = validator.validateEnrollmentAgreement(data);

          // Property: Should have no errors when relationshipToStudent is absent
          expect(errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  // ============================================================================
  // PROPERTY 43: Agreement Acceptance Validation
  // **Validates: Requirements 15.7, 15.8, 15.9**
  // ============================================================================

  test('Property 43: Agreement Acceptance Validation - enrollmentAgreementAcceptance OTHER should be rejected', () => {
    fc.assert(
      fc.property(
        fc.constant('OTHER' as const),
        (otherValue) => {
          const data: Partial<EnrollmentAgreement> = {
            responsiblePersonName: 'John Doe',
            responsiblePersonContactNumber: '09171234567',
            responsiblePersonEmail: 'parent@example.com',
            enrollmentAgreementAcceptance: otherValue,
            withdrawalPolicyAcceptance: 'YES_AGREED',
          };

          const errors = validator.validateEnrollmentAgreement(data);

          // Property: Should have an error for OTHER enrollment agreement acceptance
          const hasError = errors.some(
            e => e.field === 'enrollmentAgreementAcceptance' && 
            (e.message.includes('commit') || e.message.includes('agreement'))
          );
          expect(hasError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 43: Agreement Acceptance Validation - withdrawalPolicyAcceptance NO_DISAGREE should be rejected', () => {
    fc.assert(
      fc.property(
        fc.constant('NO_DISAGREE' as const),
        (noValue) => {
          const data: Partial<EnrollmentAgreement> = {
            responsiblePersonName: 'John Doe',
            responsiblePersonContactNumber: '09171234567',
            responsiblePersonEmail: 'parent@example.com',
            enrollmentAgreementAcceptance: 'YES_COMMIT',
            withdrawalPolicyAcceptance: noValue,
          };

          const errors = validator.validateEnrollmentAgreement(data);

          // Property: Should have an error for NO_DISAGREE withdrawal policy acceptance
          const hasError = errors.some(
            e => e.field === 'withdrawalPolicyAcceptance' && 
            (e.message.includes('agree') || e.message.includes('policy'))
          );
          expect(hasError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 43: Agreement Acceptance Validation - both YES values should pass', () => {
    fc.assert(
      fc.property(
        fc.constant('YES_COMMIT' as const),
        fc.constant('YES_AGREED' as const),
        (enrollmentAcceptance, withdrawalAcceptance) => {
          const data: Partial<EnrollmentAgreement> = {
            responsiblePersonName: 'John Doe',
            responsiblePersonContactNumber: '09171234567',
            responsiblePersonEmail: 'parent@example.com',
            enrollmentAgreementAcceptance: enrollmentAcceptance,
            withdrawalPolicyAcceptance: withdrawalAcceptance,
          };

          const errors = validator.validateEnrollmentAgreement(data);

          // Property: Should have no errors when both agreements are accepted
          expect(errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 43: Agreement Acceptance Validation - both invalid values should return multiple errors', () => {
    fc.assert(
      fc.property(
        fc.constant('OTHER' as const),
        fc.constant('NO_DISAGREE' as const),
        (enrollmentAcceptance, withdrawalAcceptance) => {
          const data: Partial<EnrollmentAgreement> = {
            responsiblePersonName: 'John Doe',
            responsiblePersonContactNumber: '09171234567',
            responsiblePersonEmail: 'parent@example.com',
            enrollmentAgreementAcceptance: enrollmentAcceptance,
            withdrawalPolicyAcceptance: withdrawalAcceptance,
          };

          const errors = validator.validateEnrollmentAgreement(data);

          // Property: Should have errors for both invalid acceptances
          const hasEnrollmentError = errors.some(e => e.field === 'enrollmentAgreementAcceptance');
          const hasWithdrawalError = errors.some(e => e.field === 'withdrawalPolicyAcceptance');
          
          expect(hasEnrollmentError).toBe(true);
          expect(hasWithdrawalError).toBe(true);
          expect(errors.length).toBeGreaterThanOrEqual(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 43: Agreement Acceptance Validation - invalid phone number in responsible person should be rejected', () => {
    fc.assert(
      fc.property(
        invalidPhoneGen,
        (invalidPhone) => {
          const data: Partial<EnrollmentAgreement> = {
            responsiblePersonName: 'John Doe',
            responsiblePersonContactNumber: invalidPhone,
            responsiblePersonEmail: 'parent@example.com',
            enrollmentAgreementAcceptance: 'YES_COMMIT',
            withdrawalPolicyAcceptance: 'YES_AGREED',
          };

          const errors = validator.validateEnrollmentAgreement(data);

          // Property: Should have an error for invalid phone number
          const hasPhoneError = errors.some(
            e => e.field === 'responsiblePersonContactNumber' && 
            (e.message.includes('phone') || e.message.includes('Contact Number'))
          );
          expect(hasPhoneError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 43: Agreement Acceptance Validation - invalid email in responsible person should be rejected', () => {
    fc.assert(
      fc.property(
        invalidEmailGen,
        (invalidEmail) => {
          const data: Partial<EnrollmentAgreement> = {
            responsiblePersonName: 'John Doe',
            responsiblePersonContactNumber: '09171234567',
            responsiblePersonEmail: invalidEmail,
            enrollmentAgreementAcceptance: 'YES_COMMIT',
            withdrawalPolicyAcceptance: 'YES_AGREED',
          };

          const errors = validator.validateEnrollmentAgreement(data);

          // Property: Should have an error for invalid email
          const hasEmailError = errors.some(
            e => e.field === 'responsiblePersonEmail' && 
            (e.message.includes('email') || e.message.includes('Email'))
          );
          expect(hasEmailError).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
