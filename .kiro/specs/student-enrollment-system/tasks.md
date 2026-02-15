# Implementation Plan: Student Enrollment System

## Overview

This implementation plan breaks down the student enrollment system into discrete coding tasks. The system will be built using Next.js with TypeScript, Prisma ORM with Neon PostgreSQL, NextAuth.js for authentication, and shadcn/ui for the UI components. Tasks are organized to build incrementally, with testing integrated throughout to catch errors early.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Initialize Next.js project with TypeScript
  - Install and configure Tailwind CSS and shadcn/ui
  - Install Prisma, NextAuth.js, and other core dependencies
  - Set up environment variables for Neon database connection
  - Configure TypeScript with strict mode
  - _Requirements: All requirements depend on proper setup_

- [ ] 2. Configure database and Prisma
  - [x] 2.1 Create Prisma schema with all models
    - Define User, Enrollment, and Document models
    - Set up enums for Role, StudentStatus, EnrollmentStatus, Sex, Citizenship, DocumentType, EducationalAttainment, MaritalStatus, SpecialSkill, EnrollmentAgreementAcceptance, WithdrawalPolicyAcceptance
    - Add parent information fields to Enrollment model
    - Add student history fields to Enrollment model
    - Add student skills and special needs fields to Enrollment model
    - Add enrollment agreement fields to Enrollment model
    - Configure relationships and cascade deletes
    - _Requirements: 10.4, 11.1, 11.2, 11.3, 11.4, 12.1, 12.2, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 14.1, 14.2, 14.3, 15.1, 15.2_
  
  - [x] 2.2 Set up Neon database connection
    - Configure Prisma to connect to Neon PostgreSQL
    - Set up connection pooling for serverless environment
    - _Requirements: All requirements depend on database connectivity_
  
  - [x] 2.3 Run initial migration
    - Generate and apply Prisma migrations
    - Verify database schema is created correctly
    - _Requirements: All requirements depend on database schema_
  
  - [x] 2.4 Create database seed script
    - Create test users (parent, admin, principal)
    - Create sample enrollment data for development
    - _Requirements: Testing support_

- [ ] 3. Set up authentication with NextAuth.js
  - [x] 3.1 Configure NextAuth.js with credentials provider
    - Create auth configuration with role-based sessions
    - Implement login/logout functionality
    - Set up session management
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [x] 3.2 Create authentication middleware
    - Implement role checking middleware for API routes
    - Create helper functions for authorization (requireRole, isAuthorized)
    - _Requirements: 6.4, 7.5, 8.2, 8.4_
  
  - [x] 3.3 Write property test for authentication
    - **Property 23: Authentication Requirement**
    - **Validates: Requirements 7.4**

- [ ] 4. Implement validation layer
  - [x] 4.1 Create input validation utilities
    - Implement EnrollmentValidator class with validation methods
    - Create validation rules for personal information fields
    - Create validation rules for parent information fields (phone numbers, emails, required fields)
    - Create validation rules for student history fields (positive integer for household learners)
    - Create validation rules for student skills fields
    - Create validation rules for enrollment agreement fields (agreement acceptance validation)
    - Implement file validation for size and format
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 4.5, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9_
  
  - [x] 4.2 Create document requirement validation
    - Implement logic to determine required documents based on student status
    - Validate that all required documents are present
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [x] 4.3 Write property tests for validation
    - **Property 2: Required Field Validation**
    - **Property 3: Optional Field Handling**
    - **Property 4: Date Validation**
    - **Property 5: Conditional Citizenship Validation**
    - **Property 6: Validation Error Messages**
    - **Validates: Requirements 1.6, 2.1, 2.2, 2.3, 2.4, 2.5**
  
  - [x] 4.4 Write property tests for file validation
    - **Property 7: Profile Picture Size Validation**
    - **Property 8: Profile Picture Format Validation**
    - **Property 13: Document Format Validation**
    - **Validates: Requirements 3.1, 3.2, 4.5**
  
  - [x] 4.5 Write property tests for document requirements
    - **Property 10: Old Student Document Requirements**
    - **Property 11: New Student Document Requirements**
    - **Property 12: Optional Special Needs Documents**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
  
  - [x] 4.6 Write property tests for parent information validation
    - **Property 30: Parent Information Required Fields**
    - **Property 31: Parent Information Optional Fields**
    - **Property 32: Phone Number Validation**
    - **Property 33: Email Address Validation**
    - **Property 34: Marital Status Selection**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 15.3, 15.4**
  
  - [x] 4.7 Write property tests for student history validation
    - **Property 36: Student History Required Fields**
    - **Property 37: Student History Optional Fields**
    - **Property 38: Positive Integer Validation for Household Learners**
    - **Validates: Requirements 13.2, 13.3, 13.4, 13.5, 13.6, 13.7**
  
  - [x] 4.8 Write property tests for enrollment agreement validation
    - **Property 41: Enrollment Agreement Required Fields**
    - **Property 42: Enrollment Agreement Optional Field**
    - **Property 43: Agreement Acceptance Validation**
    - **Validates: Requirements 15.1, 15.2, 15.5, 15.6, 15.7, 15.8, 15.9**

- [ ] 5. Implement file storage system
  - [x] 5.1 Create file upload handler
    - Implement file storage to local filesystem or cloud storage
    - Create directory structure for profile pictures and documents
    - Generate unique filenames with timestamps
    - _Requirements: 3.3, 4.6, 8.1_
  
  - [x] 5.2 Create file retrieval handler
    - Implement secure file serving with authorization checks
    - Verify user permissions before serving files
    - _Requirements: 8.2, 8.3, 8.4_
  
  - [x] 5.3 Write property tests for file storage
    - **Property 9: Profile Picture Storage Round-Trip**
    - **Property 14: Document Storage Round-Trip**
    - **Validates: Requirements 3.3, 4.6**

- [ ] 6. Create enrollment submission API
  - [x] 6.1 Implement POST /api/enrollments endpoint
    - Accept enrollment form data from client including parent info, student history, skills, and enrollment agreement
    - Validate all required fields using validation layer (including new parent, history, skills, and agreement fields)
    - Create enrollment record in database with all new fields
    - Handle transaction rollback on errors
    - _Requirements: 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 10.1, 10.3, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 12.3, 12.4, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 14.2, 14.3, 14.4, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9_
  
  - [x] 6.2 Implement POST /api/enrollments/[id]/upload endpoint
    - Accept file uploads for profile pictures and documents
    - Validate file size and format
    - Store files using file storage system
    - Create document records in database
    - Ensure file is stored before database record is created
    - _Requirements: 3.1, 3.2, 3.3, 4.5, 4.6, 10.2_
  
  - [x] 6.3 Write property tests for enrollment submission
    - **Property 1: Enrollment Data Persistence**
    - **Property 27: File Upload Transaction Ordering**
    - **Property 28: Transaction Rollback on Failure**
    - **Property 35: Educational Attainment Persistence**
    - **Property 39: Special Skills Persistence**
    - **Property 40: Special Needs Diagnosis Optional Field**
    - **Property 44: Complete Enrollment Data Round-Trip**
    - **Validates: Requirements 1.2, 1.3, 1.5, 10.2, 10.3, 12.3, 12.4, 14.2, 14.3, 14.4, 16.1, 16.2, 16.3, 16.4, 16.5_
  
  - [x] 6.4 Write unit tests for enrollment API
    - Test successful enrollment creation with valid data
    - Test rejection of enrollment with missing required fields
    - Test file upload success and failure scenarios
    - _Requirements: 1.5, 1.6, 3.1, 3.2_

- [x] 7. Checkpoint - Ensure enrollment submission works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Create enrollment management API
  - [x] 8.1 Implement GET /api/enrollments endpoint
    - Return list of enrollments with filtering support
    - Implement authorization checks (admin/principal see all, parents see only their own)
    - Support filtering by schoolYear, program, studentStatus, status
    - Implement pagination
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 9.1_
  
  - [x] 8.2 Implement GET /api/enrollments/[id] endpoint
    - Return detailed enrollment information including all new fields (parent info, student history, skills, enrollment agreement)
    - Include all personal information and document references
    - Verify user authorization before returning data
    - _Requirements: 5.2, 16.1, 16.2, 16.3, 16.4, 16.5_
  
  - [x] 8.3 Implement PATCH /api/enrollments/[id]/status endpoint
    - Accept status updates (APPROVED or REJECTED)
    - Verify user has admin or principal role
    - Update enrollment status in database
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 8.4 Write property tests for enrollment management
    - **Property 15: Admin Dashboard Enrollment Visibility**
    - **Property 16: Enrollment Detail Retrieval**
    - **Property 17: Enrollment Filtering**
    - **Property 18: Enrollment Approval State Transition**
    - **Property 19: Enrollment Rejection State Transition**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3**
  
  - [x] 8.5 Write unit tests for enrollment management API
    - Test filtering returns correct results
    - Test pagination works correctly
    - Test status updates persist correctly
    - _Requirements: 5.3, 5.4, 5.5, 6.1, 6.2_

- [x] 9. Implement document access API
  - [x] 9.1 Create GET /api/documents/[id] endpoint
    - Verify user authorization (admin/principal/owner)
    - Serve file from storage with appropriate headers
    - Return 403 for unauthorized access attempts
    - _Requirements: 8.2, 8.3, 8.4_
  
  - [x] 9.2 Write property tests for document access
    - **Property 24: Authorized Document Access**
    - **Property 25: Unauthorized Document Access Prevention**
    - **Validates: Requirements 8.2, 8.3, 8.4**
  
  - [x] 9.3 Write unit tests for document access
    - Test admin can access any document
    - Test parent can access their own documents
    - Test parent cannot access other parents' documents
    - _Requirements: 8.2, 8.3, 8.4_

- [x] 10. Implement role-based access control tests
  - [x] 10.1 Write property tests for role permissions
    - **Property 20: Unauthorized Status Change Prevention**
    - **Property 21: Parent Role Permissions**
    - **Property 22: Admin and Principal Role Permissions**
    - **Property 26: Parent Submission Visibility**
    - **Validates: Requirements 6.4, 7.1, 7.2, 7.3, 7.5, 9.1, 9.5**

- [-] 11. Build enrollment form UI
  - [x] 11.1 Create EnrollmentForm component
    - Build form with all required fields using shadcn/ui components (including parent info, student history, skills, enrollment agreement sections)
    - Implement client-side validation for all new fields
    - Handle form submission and error display
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 14.1, 14.2, 14.3, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9_
  
  - [x] 11.2 Create profile picture upload component
    - Implement file input with preview
    - Display validation requirements to user
    - Show upload progress and errors
    - _Requirements: 3.1, 3.2, 3.4, 3.5_
  
  - [x] 11.3 Create document upload component
    - Display required documents based on student status
    - Allow multiple document uploads
    - Show upload status for each document
    - _Requirements: 1.4, 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 11.4 Implement conditional document requirements UI
    - Show/hide document requirements based on student status selection
    - Update required documents list when student status changes
    - _Requirements: 1.4, 4.1, 4.2_
  
  - [x] 11.5 Write unit tests for enrollment form
    - Test form displays all required fields
    - Test validation errors are displayed correctly
    - Test document requirements update when student status changes
    - _Requirements: 1.1, 1.4, 1.6_
  
  - [x] 11.6 Create parent information form section
    - Build parent information fields (father and mother details)
    - Implement educational attainment radio selects
    - Implement marital status checkboxes
    - Add client-side validation for phone numbers and emails
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 12.1, 12.2, 12.3, 12.4_
  
  - [x] 11.7 Create student history form section
    - Build student history fields (siblings, household learners, previous schools)
    - Add validation for positive integer household learners
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_
  
  - [x] 11.8 Create student skills and special needs form section
    - Build special skills checkboxes
    - Add optional special needs diagnosis text field
    - _Requirements: 14.1, 14.2, 14.3, 14.4_
  
  - [x] 11.9 Create enrollment agreement form section
    - Build responsible person information fields
    - Implement enrollment agreement acceptance radio buttons
    - Implement withdrawal policy acceptance radio buttons
    - Add validation to prevent submission if agreements not accepted
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9_
  
  - [x] 11.10 Write unit tests for new form sections
    - Test parent information section displays and validates correctly
    - Test student history section validates positive integers
    - Test enrollment agreement section prevents submission without acceptance
    - _Requirements: 11.5, 11.6, 13.7, 15.7, 15.8_

- [x] 12. Build admin dashboard UI
  - [x] 12.1 Create AdminDashboard component
    - Display list of all enrollments in a table
    - Implement filtering controls for schoolYear, program, studentStatus, status
    - Add pagination controls
    - _Requirements: 5.1, 5.3, 5.4, 5.5_
  
  - [x] 12.2 Create EnrollmentDetail component
    - Display all student information including new fields (parent info, student history, skills, enrollment agreement)
    - Show all uploaded documents with download links
    - Add approve/reject buttons for admin/principal
    - _Requirements: 5.2, 6.1, 6.2, 16.1, 16.2, 16.3, 16.4, 16.5_
  
  - [x] 12.3 Implement enrollment status badges
    - Create visual indicators for PENDING, APPROVED, REJECTED statuses
    - Use appropriate colors and icons
    - _Requirements: 9.2, 9.3, 9.4_
  
  - [x] 12.4 Write unit tests for admin dashboard
    - Test enrollment list renders correctly
    - Test filtering updates the displayed enrollments
    - Test status badges display correct colors
    - Test parent information displays in enrollment detail view
    - _Requirements: 5.1, 5.3, 9.2, 9.3, 9.4, 16.1, 16.2, 16.3, 16.4, 16.5_

- [x] 13. Build parent portal UI
  - [x] 13.1 Create ParentSubmissions component
    - Display list of parent's own enrollments
    - Show current status for each enrollment
    - Prevent access to other parents' enrollments
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 13.2 Write unit tests for parent portal
    - Test parent sees only their own enrollments
    - Test status displays correctly for each enrollment
    - _Requirements: 9.1, 9.5_

- [x] 14. Implement authentication UI
  - [x] 14.1 Create login page
    - Build login form with email and password
    - Handle authentication errors
    - Redirect to appropriate page based on role
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [x] 14.2 Create protected route wrapper
    - Implement client-side route protection
    - Redirect unauthenticated users to login
    - Show loading state during authentication check
    - _Requirements: 7.4_
  
  - [x] 14.3 Write unit tests for authentication UI
    - Test login form submission
    - Test redirect after successful login
    - Test protected routes redirect to login when unauthenticated
    - _Requirements: 7.4_

- [x] 15. Implement referential integrity
  - [x] 15.1 Add cascade delete for documents
    - Ensure Prisma schema has onDelete: Cascade configured
    - Implement file system cleanup when enrollment is deleted
    - _Requirements: 10.4_
  
  - [x] 15.2 Write property test for referential integrity
    - **Property 29: Referential Integrity for Documents**
    - **Validates: Requirements 10.4**

- [x] 16. Add error handling and logging
  - [x] 16.1 Implement global error handler
    - Create error response formatting
    - Add error logging with appropriate detail levels
    - Exclude sensitive data from logs
    - _Requirements: All requirements benefit from proper error handling_
  
  - [x] 16.2 Add validation error formatting
    - Ensure validation errors return consistent format
    - Include field names and specific error messages
    - _Requirements: 1.6, 2.5, 3.5_
  
  - [x] 16.3 Write unit tests for error handling
    - Test error responses have correct format
    - Test validation errors include all invalid fields
    - Test sensitive data is not logged
    - _Requirements: 1.6, 2.5_

- [x] 17. Final checkpoint - Integration testing
  - [x] 17.1 Write integration tests for complete enrollment flow
    - Test parent can submit complete enrollment from UI to database including all new fields
    - Test admin can view and approve enrollment with all parent information visible
    - Test document upload and retrieval works end-to-end
    - Test enrollment agreement validation prevents submission without acceptance
    - _Requirements: All requirements_
  
  - [x] 17.2 Ensure all tests pass
    - Run all unit tests, property tests, and integration tests
    - Fix any failing tests
    - Ask the user if questions arise

- [x] 18. Final review and deployment preparation
  - Verify all requirements are implemented
  - Check that all API endpoints have proper authorization
  - Ensure database migrations are ready for production
  - Confirm environment variables are documented
  - _Requirements: All requirements_

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- Integration tests verify end-to-end functionality
- Checkpoints ensure incremental validation throughout development
