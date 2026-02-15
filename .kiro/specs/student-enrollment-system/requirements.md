# Requirements Document

## Introduction

This document specifies the requirements for a digital student enrollment system for Circular Home Child Development. The system replaces the current Google Forms process, enabling parents to submit enrollment applications online while providing administrators and principals with tools to review and manage submissions.

## Glossary

- **System**: The student enrollment web application
- **Parent**: A user with parent role who submits enrollment applications
- **Admin**: A user with administrative privileges who can review and manage enrollments
- **Principal**: A user with principal privileges who can review and manage enrollments
- **Enrollment_Application**: A complete submission containing student information and required documents
- **Student_Status**: Classification of student as either "Old Student" or "New Student"
- **Profile_Picture**: A 2x2 student photograph meeting specific validation criteria
- **Required_Document**: A file that must be uploaded based on student status
- **Authorized_User**: Either an Admin or Principal user
- **Parent_Information**: Father and mother details including names, occupations, contact information, and educational attainment
- **Educational_Attainment**: Highest level of education completed by a parent
- **Responsible_Person**: The individual responsible for the enrollment and agreement acceptance
- **Enrollment_Agreement**: A commitment statement that must be accepted to proceed with enrollment
- **Withdrawal_Policy**: A policy document that must be acknowledged and accepted

## Requirements

### Requirement 1: Parent Enrollment Submission

**User Story:** As a parent, I want to submit a complete enrollment application online, so that I can enroll my child without using paper forms.

#### Acceptance Criteria

1. WHEN a parent accesses the enrollment form, THE System SHALL display all required input fields for student information
2. WHEN a parent selects a school year, THE System SHALL persist the selection with the enrollment application
3. WHEN a parent selects a program/session, THE System SHALL persist the selection with the enrollment application
4. WHEN a parent selects a student status, THE System SHALL display the appropriate document upload requirements
5. WHEN a parent submits the form with all required fields completed, THE System SHALL create an Enrollment_Application record
6. WHEN a parent submits the form with missing required fields, THE System SHALL prevent submission and display validation errors

### Requirement 2: Student Information Validation

**User Story:** As a parent, I want the system to validate my input, so that I submit complete and correct information.

#### Acceptance Criteria

1. THE System SHALL require Last Name, First Name, Middle Name, Nickname, Sex, Age, Birthday, Place of Birth, Religion, Present Address, and Telephone/Contact Number fields
2. THE System SHALL allow Name Extension field to be optional
3. WHEN a parent enters a Birthday, THE System SHALL validate it is a valid date
4. WHEN a parent selects Citizenship as "Foreigner", THE System SHALL require specification of the country
5. WHEN a parent attempts to submit with invalid data, THE System SHALL display specific error messages for each invalid field

### Requirement 3: Profile Picture Upload and Validation

**User Story:** As a parent, I want to upload my child's profile picture with clear validation rules, so that I know the requirements are met.

#### Acceptance Criteria

1. WHEN a parent uploads a Profile_Picture, THE System SHALL validate the file size does not exceed 100MB
2. WHEN a parent uploads a Profile_Picture, THE System SHALL validate the file format is an image type (JPEG, PNG)
3. WHEN a parent uploads a Profile_Picture, THE System SHALL store the image securely
4. THE System SHALL display validation requirements: white background, taken within 3 months, decent attire, no eyeglasses, 2x2 size
5. WHEN a parent uploads a file exceeding size limits or invalid format, THE System SHALL reject the upload and display an error message

### Requirement 4: Document Upload Requirements

**User Story:** As a parent, I want to upload only the documents required for my child's student status, so that I provide the correct documentation.

#### Acceptance Criteria

1. WHEN Student_Status is "Old Student", THE System SHALL require upload of Report Card copy
2. WHEN Student_Status is "New Student", THE System SHALL require upload of Report Card, Birth Certificate, Good Moral Certificate, Marriage Contract, and Medical Records
3. WHERE a new student has special needs, THE System SHALL allow upload of Doctor's Diagnosis or Therapist Recommendation
4. THE System SHALL require proof of payment upload for all enrollments
5. WHEN a parent uploads a Required_Document, THE System SHALL validate the file format is PDF, JPEG, or PNG
6. WHEN a parent uploads a Required_Document, THE System SHALL store the document securely

### Requirement 5: Enrollment Application Management

**User Story:** As an authorized user, I want to view all enrollment applications, so that I can review and manage submissions.

#### Acceptance Criteria

1. WHEN an Authorized_User accesses the dashboard, THE System SHALL display a list of all Enrollment_Applications
2. WHEN an Authorized_User selects an Enrollment_Application, THE System SHALL display all submitted student information and documents
3. WHEN an Authorized_User filters by school year, THE System SHALL display only applications matching that school year
4. WHEN an Authorized_User filters by program, THE System SHALL display only applications matching that program
5. WHEN an Authorized_User filters by Student_Status, THE System SHALL display only applications matching that status

### Requirement 6: Enrollment Approval and Rejection

**User Story:** As an authorized user, I want to approve or reject enrollment applications, so that I can manage the enrollment process.

#### Acceptance Criteria

1. WHEN an Authorized_User approves an Enrollment_Application, THE System SHALL update the application status to "Approved"
2. WHEN an Authorized_User rejects an Enrollment_Application, THE System SHALL update the application status to "Rejected"
3. WHEN an application status changes, THE System SHALL persist the status change immediately
4. THE System SHALL prevent unauthorized users from approving or rejecting applications

### Requirement 7: Role-Based Access Control

**User Story:** As a system administrator, I want role-based access control, so that users can only access features appropriate to their role.

#### Acceptance Criteria

1. WHEN a user with Parent role accesses the system, THE System SHALL allow enrollment form submission and viewing their own submissions
2. WHEN a user with Admin role accesses the system, THE System SHALL allow access to all enrollments and approval/rejection capabilities
3. WHEN a user with Principal role accesses the system, THE System SHALL allow access to all enrollments and approval/rejection capabilities
4. WHEN an unauthenticated user attempts to access protected features, THE System SHALL redirect to authentication
5. WHEN a Parent attempts to access admin features, THE System SHALL deny access and display an authorization error

### Requirement 8: Document Security and Access

**User Story:** As an authorized user, I want secure document storage, so that sensitive student information is protected.

#### Acceptance Criteria

1. WHEN a document is uploaded, THE System SHALL store it in a secure location with access controls
2. WHEN an Authorized_User requests a document, THE System SHALL verify authorization before serving the file
3. WHEN a Parent requests their own submitted documents, THE System SHALL allow access
4. WHEN an unauthorized user attempts to access a document, THE System SHALL deny access and return an authorization error
5. THE System SHALL encrypt sensitive data at rest

### Requirement 9: Parent Submission Status Viewing

**User Story:** As a parent, I want to view the status of my enrollment submission, so that I know if it has been approved or rejected.

#### Acceptance Criteria

1. WHEN a Parent accesses their submissions, THE System SHALL display all their Enrollment_Applications with current status
2. WHEN an Enrollment_Application status is "Approved", THE System SHALL display approval confirmation
3. WHEN an Enrollment_Application status is "Rejected", THE System SHALL display rejection notification
4. WHEN an Enrollment_Application status is "Pending", THE System SHALL display pending status
5. THE System SHALL prevent Parents from viewing other parents' submissions

### Requirement 10: Data Persistence and Integrity

**User Story:** As a system administrator, I want reliable data persistence, so that enrollment data is never lost.

#### Acceptance Criteria

1. WHEN an Enrollment_Application is submitted, THE System SHALL persist all data to the database immediately
2. WHEN a file is uploaded, THE System SHALL persist the file to storage before confirming success
3. WHEN a database operation fails, THE System SHALL rollback partial changes and display an error message
4. THE System SHALL maintain referential integrity between Enrollment_Applications and uploaded documents
5. WHEN concurrent updates occur, THE System SHALL handle conflicts and maintain data consistency

### Requirement 11: Parent Information Collection

**User Story:** As a parent, I want to provide complete parent information, so that the school has accurate contact and background details.

#### Acceptance Criteria

1. THE System SHALL require Father's Full Name, Father's Contact Number, and Father's Highest Educational Attainment fields
2. THE System SHALL allow Father's Occupation and Father's Email Address fields to be optional
3. THE System SHALL require Mother's Full Name, Mother's Contact Number, Mother's Email Address, and Mother's Highest Educational Attainment fields
4. THE System SHALL allow Mother's Occupation field to be optional
5. WHEN a parent enters a contact number, THE System SHALL validate it is a valid phone number format
6. WHEN a parent enters an email address, THE System SHALL validate it is a valid email format
7. THE System SHALL require selection of at least one marital status option from: Married, Separated, Single Parent, Stepmother, Stepfather, Other
8. THE System SHALL allow multiple marital status selections to be checked

### Requirement 12: Educational Attainment Selection

**User Story:** As a parent, I want to select educational attainment from predefined options, so that I provide standardized information.

#### Acceptance Criteria

1. THE System SHALL provide radio select options for Father's Highest Educational Attainment: Elementary Graduate, High School Graduate, College Graduate, Elementary Undergrad, High School Undergraduate, College Undergraduate, Others
2. THE System SHALL provide radio select options for Mother's Highest Educational Attainment: Elementary Graduate, High School Graduate, College Graduate, Elementary Undergrad, High School Undergraduate, College Undergraduate, Others
3. WHEN a parent selects an educational attainment option, THE System SHALL persist the selection with the enrollment application
4. THE System SHALL require exactly one educational attainment option to be selected for each parent

### Requirement 13: Student History Information

**User Story:** As a parent, I want to provide student history information, so that the school understands my child's educational background.

#### Acceptance Criteria

1. THE System SHALL allow Learner's Siblings Information to be entered as a text field
2. THE System SHALL require Total Number of Learners in Household as a numeric field
3. THE System SHALL require Name of Last School Attended (Preschool) field
4. THE System SHALL allow Address of Last School Attended (Preschool) field to be optional
5. THE System SHALL require Name of Last School Attended (Elementary) field
6. THE System SHALL allow Address of Last School Attended (Elementary) field to be optional
7. WHEN a parent enters Total Number of Learners in Household, THE System SHALL validate it is a positive integer

### Requirement 14: Student Skills and Special Needs

**User Story:** As a parent, I want to indicate my child's special skills and needs, so that the school can provide appropriate support and opportunities.

#### Acceptance Criteria

1. THE System SHALL provide checkbox options for Special Skills: Computer, Composition Writing, Singing, Dancing, Poem Writing, Cooking, Acting, Public Speaking, Other
2. THE System SHALL allow multiple special skills to be selected
3. THE System SHALL allow Special Needs Diagnosis field to be optional
4. WHEN special skills are selected, THE System SHALL persist all selected skills with the enrollment application

### Requirement 15: Enrollment Agreement and Withdrawal Policy

**User Story:** As a parent, I want to review and accept enrollment agreements, so that I understand my commitments and responsibilities.

#### Acceptance Criteria

1. THE System SHALL require Responsible Person Name, Responsible Person Contact Number, and Responsible Person Email Address fields
2. THE System SHALL allow Relationship to Student field to be optional
3. WHEN a parent enters Responsible Person Contact Number, THE System SHALL validate it is a valid phone number format
4. WHEN a parent enters Responsible Person Email Address, THE System SHALL validate it is a valid email format
5. THE System SHALL require selection of Enrollment Agreement Acceptance with options: "YES, I COMMIT TO THE ENROLLMENT AGREEMENT" or "Other"
6. THE System SHALL require selection of Withdrawal Policy Acceptance with options: "Yes, I have read and agreed with the WITHDRAWAL POLICY OF CHCD" or "No, I do not agree with the Policy"
7. WHEN a parent selects "Other" for Enrollment Agreement Acceptance, THE System SHALL prevent form submission and display a validation error
8. WHEN a parent selects "No, I do not agree with the Policy" for Withdrawal Policy Acceptance, THE System SHALL prevent form submission and display a validation error
9. WHEN both agreements are accepted with "Yes" options, THE System SHALL allow form submission to proceed

### Requirement 16: Parent Information Display in Admin Dashboard

**User Story:** As an authorized user, I want to view parent information in the admin dashboard, so that I can review complete family details for each enrollment.

#### Acceptance Criteria

1. WHEN an Authorized_User views an Enrollment_Application, THE System SHALL display all Parent_Information including father and mother details
2. WHEN an Authorized_User views an Enrollment_Application, THE System SHALL display student history information including siblings, household learners, and previous schools
3. WHEN an Authorized_User views an Enrollment_Application, THE System SHALL display selected special skills
4. WHEN an Authorized_User views an Enrollment_Application, THE System SHALL display special needs diagnosis if provided
5. WHEN an Authorized_User views an Enrollment_Application, THE System SHALL display responsible person information and agreement acceptances
