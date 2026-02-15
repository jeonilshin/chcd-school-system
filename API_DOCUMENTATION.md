# API Documentation
## Student Enrollment System

**Version:** 1.0.0  
**Base URL:** `https://yourdomain.com/api`  
**Authentication:** NextAuth.js with JWT

---

## Table of Contents

1. [Authentication](#authentication)
2. [Enrollment Endpoints](#enrollment-endpoints)
3. [Document Endpoints](#document-endpoints)
4. [Error Responses](#error-responses)
5. [Data Models](#data-models)

---

## Authentication

All API endpoints require authentication via NextAuth.js session.

### Login

**Endpoint:** `POST /api/auth/signin`  
**Public:** Yes

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "PARENT"
  },
  "expires": "2026-02-10T00:00:00.000Z"
}
```

### Logout

**Endpoint:** `POST /api/auth/signout`  
**Authentication:** Required

---

## Enrollment Endpoints

### Create Enrollment

**Endpoint:** `POST /api/enrollments`  
**Authentication:** Required (PARENT role)  
**Requirements:** 1.5, 1.6, 2.1-2.5, 10.1, 10.3, 11.1-11.8, 12.3-12.4, 13.2-13.7, 14.2-14.4, 15.1-15.9

**Request Body:**
```json
{
  "schoolYear": "2024-2025",
  "program": "Playschool AM",
  "studentStatus": "NEW_STUDENT",
  "profilePictureUrl": "/uploads/profile-pictures/enr_123/profile.jpg",
  "personalInfo": {
    "lastName": "Doe",
    "firstName": "John",
    "middleName": "Smith",
    "nameExtension": "Jr.",
    "nickname": "Johnny",
    "sex": "MALE",
    "age": 5,
    "birthday": "2019-03-15T00:00:00.000Z",
    "placeOfBirth": "Manila",
    "religion": "Catholic",
    "presentAddress": "123 Main St, Manila",
    "contactNumber": "+639171234567",
    "citizenship": "FILIPINO",
    "citizenshipSpecification": null
  },
  "parentInfo": {
    "fatherFullName": "John Doe Sr.",
    "fatherOccupation": "Engineer",
    "fatherContactNumber": "+639171234567",
    "fatherEmail": "father@example.com",
    "fatherEducationalAttainment": "COLLEGE_GRADUATE",
    "motherFullName": "Jane Doe",
    "motherOccupation": "Teacher",
    "motherContactNumber": "+639181234567",
    "motherEmail": "mother@example.com",
    "motherEducationalAttainment": "COLLEGE_GRADUATE",
    "maritalStatus": ["MARRIED"]
  },
  "studentHistory": {
    "siblingsInformation": "1 older brother",
    "totalLearnersInHousehold": 3,
    "lastSchoolPreschoolName": "ABC Preschool",
    "lastSchoolPreschoolAddress": "456 School St",
    "lastSchoolElementaryName": "XYZ Elementary",
    "lastSchoolElementaryAddress": "789 Education Ave"
  },
  "studentSkills": {
    "specialSkills": ["SINGING", "DANCING"],
    "specialNeedsDiagnosis": null
  },
  "enrollmentAgreement": {
    "responsiblePersonName": "John Doe Sr.",
    "responsiblePersonContactNumber": "+639171234567",
    "responsiblePersonEmail": "father@example.com",
    "relationshipToStudent": "Father",
    "enrollmentAgreementAcceptance": "YES_COMMIT",
    "withdrawalPolicyAcceptance": "YES_AGREED"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "enrollmentId": "enr_1707456789_abc123",
  "enrollment": {
    "id": "enr_1707456789_abc123",
    "schoolYear": "2024-2025",
    "program": "Playschool AM",
    "studentStatus": "NEW_STUDENT",
    "status": "PENDING",
    "createdAt": "2026-02-09T10:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "errors": [
    {
      "field": "personalInfo.lastName",
      "message": "Last Name is required"
    },
    {
      "field": "parentInfo.fatherContactNumber",
      "message": "Invalid phone number format"
    }
  ]
}
```

---

### Get Enrollments

**Endpoint:** `GET /api/enrollments`  
**Authentication:** Required  
**Requirements:** 5.1, 5.3, 5.4, 5.5, 9.1

**Query Parameters:**
- `schoolYear` (optional): Filter by school year
- `program` (optional): Filter by program
- `studentStatus` (optional): Filter by student status (OLD_STUDENT, NEW_STUDENT)
- `status` (optional): Filter by enrollment status (PENDING, APPROVED, REJECTED)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Authorization:**
- ADMIN/PRINCIPAL: Returns all enrollments
- PARENT: Returns only user's own enrollments

**Example Request:**
```
GET /api/enrollments?schoolYear=2024-2025&status=PENDING&page=1&limit=10
```

**Success Response (200):**
```json
{
  "enrollments": [
    {
      "id": "enr_123",
      "studentName": "John Smith Doe",
      "schoolYear": "2024-2025",
      "program": "Playschool AM",
      "studentStatus": "NEW_STUDENT",
      "status": "PENDING",
      "submittedAt": "2026-02-09T10:00:00.000Z"
    }
  ],
  "total": 25,
  "page": 1,
  "totalPages": 3
}
```

---

### Get Enrollment Details

**Endpoint:** `GET /api/enrollments/[id]`  
**Authentication:** Required  
**Requirements:** 5.2, 16.1, 16.2, 16.3, 16.4, 16.5

**Authorization:**
- ADMIN/PRINCIPAL: Can view any enrollment
- PARENT: Can only view own enrollments

**Example Request:**
```
GET /api/enrollments/enr_123
```

**Success Response (200):**
```json
{
  "id": "enr_123",
  "schoolYear": "2024-2025",
  "program": "Playschool AM",
  "studentStatus": "NEW_STUDENT",
  "status": "PENDING",
  "profilePictureUrl": "/uploads/profile-pictures/enr_123/profile.jpg",
  "personalInfo": {
    "lastName": "Doe",
    "firstName": "John",
    "middleName": "Smith",
    "nameExtension": "Jr.",
    "nickname": "Johnny",
    "sex": "MALE",
    "age": 5,
    "birthday": "2019-03-15T00:00:00.000Z",
    "placeOfBirth": "Manila",
    "religion": "Catholic",
    "presentAddress": "123 Main St, Manila",
    "contactNumber": "+639171234567",
    "citizenship": "FILIPINO",
    "citizenshipSpecification": null
  },
  "parentInfo": {
    "fatherFullName": "John Doe Sr.",
    "fatherOccupation": "Engineer",
    "fatherContactNumber": "+639171234567",
    "fatherEmail": "father@example.com",
    "fatherEducationalAttainment": "COLLEGE_GRADUATE",
    "motherFullName": "Jane Doe",
    "motherOccupation": "Teacher",
    "motherContactNumber": "+639181234567",
    "motherEmail": "mother@example.com",
    "motherEducationalAttainment": "COLLEGE_GRADUATE",
    "maritalStatus": ["MARRIED"]
  },
  "studentHistory": {
    "siblingsInformation": "1 older brother",
    "totalLearnersInHousehold": 3,
    "lastSchoolPreschoolName": "ABC Preschool",
    "lastSchoolPreschoolAddress": "456 School St",
    "lastSchoolElementaryName": "XYZ Elementary",
    "lastSchoolElementaryAddress": "789 Education Ave"
  },
  "studentSkills": {
    "specialSkills": ["SINGING", "DANCING"],
    "specialNeedsDiagnosis": null
  },
  "enrollmentAgreement": {
    "responsiblePersonName": "John Doe Sr.",
    "responsiblePersonContactNumber": "+639171234567",
    "responsiblePersonEmail": "father@example.com",
    "relationshipToStudent": "Father",
    "enrollmentAgreementAcceptance": "YES_COMMIT",
    "withdrawalPolicyAcceptance": "YES_AGREED"
  },
  "documents": [
    {
      "id": "doc_123",
      "type": "REPORT_CARD",
      "fileName": "report-card.pdf",
      "fileSize": 1024000,
      "url": "/api/documents/doc_123",
      "mimeType": "application/pdf",
      "uploadedAt": "2026-02-09T10:05:00.000Z"
    }
  ],
  "submittedAt": "2026-02-09T10:00:00.000Z",
  "updatedAt": "2026-02-09T10:00:00.000Z"
}
```

**Error Response (404):**
```json
{
  "error": "Enrollment not found"
}
```

**Error Response (403):**
```json
{
  "error": "Unauthorized to access this enrollment"
}
```

---

### Update Enrollment Status

**Endpoint:** `PATCH /api/enrollments/[id]/status`  
**Authentication:** Required (ADMIN or PRINCIPAL role)  
**Requirements:** 6.1, 6.2, 6.3, 6.4

**Request Body:**
```json
{
  "status": "APPROVED"
}
```

**Valid Status Values:**
- `APPROVED`
- `REJECTED`

**Success Response (200):**
```json
{
  "success": true,
  "enrollment": {
    "id": "enr_123",
    "status": "APPROVED",
    "updatedAt": "2026-02-09T11:00:00.000Z"
    // ... full enrollment details
  }
}
```

**Error Response (400):**
```json
{
  "error": "Invalid status. Must be APPROVED or REJECTED."
}
```

**Error Response (403):**
```json
{
  "error": "Unauthorized. Only admins and principals can update enrollment status."
}
```

---

### Upload Document

**Endpoint:** `POST /api/enrollments/[id]/upload`  
**Authentication:** Required  
**Requirements:** 3.1, 3.2, 3.3, 4.5, 4.6, 10.2

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: File to upload (required)
- `documentType`: Type of document (required)

**Valid Document Types:**
- `REPORT_CARD`
- `BIRTH_CERTIFICATE`
- `GOOD_MORAL`
- `MARRIAGE_CONTRACT`
- `MEDICAL_RECORDS`
- `SPECIAL_NEEDS_DIAGNOSIS`
- `PROOF_OF_PAYMENT`

**Authorization:**
- User must own the enrollment

**Success Response (200):**
```json
{
  "success": true,
  "documentId": "doc_123",
  "url": "/api/documents/doc_123",
  "fileName": "report-card.pdf",
  "fileSize": 1024000,
  "mimeType": "application/pdf"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "File size exceeds maximum limit of 10MB"
}
```

**Error Response (403):**
```json
{
  "error": "Unauthorized to upload to this enrollment"
}
```

---

### Delete Enrollment

**Endpoint:** `DELETE /api/enrollments/[id]`  
**Authentication:** Required  
**Requirements:** 10.4

**Authorization:**
- ADMIN/PRINCIPAL: Can delete any enrollment
- PARENT: Can only delete own enrollments

**Success Response (200):**
```json
{
  "success": true,
  "message": "Enrollment and associated files deleted successfully"
}
```

**Error Response (404):**
```json
{
  "error": "Enrollment not found"
}
```

---

## Document Endpoints

### Get Document

**Endpoint:** `GET /api/documents/[id]`  
**Authentication:** Required  
**Requirements:** 8.2, 8.3, 8.4

**Authorization:**
- ADMIN/PRINCIPAL: Can access any document
- PARENT: Can only access documents from own enrollments

**Success Response (200):**
- Returns file stream with appropriate headers
- Content-Type: Based on file type (application/pdf, image/jpeg, etc.)
- Content-Disposition: inline; filename="document.pdf"

**Error Response (403):**
```json
{
  "error": "Unauthorized to access this document"
}
```

**Error Response (404):**
```json
{
  "error": "Document not found"
}
```

---

## Error Responses

### Standard Error Format

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Or for validation errors:

```json
{
  "success": false,
  "errors": [
    {
      "field": "fieldName",
      "message": "Error message"
    }
  ]
}
```

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data or validation errors
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `413 Payload Too Large`: File size exceeds limit
- `500 Internal Server Error`: Server error

---

## Data Models

### User

```typescript
{
  id: string;
  email: string;
  name: string;
  role: "PARENT" | "ADMIN" | "PRINCIPAL";
  createdAt: Date;
  updatedAt: Date;
}
```

### Enrollment

```typescript
{
  id: string;
  userId: string;
  schoolYear: string;
  program: string;
  studentStatus: "OLD_STUDENT" | "NEW_STUDENT";
  status: "PENDING" | "APPROVED" | "REJECTED";
  profilePictureUrl: string;
  personalInfo: PersonalInfo;
  parentInfo: ParentInfo;
  studentHistory: StudentHistory;
  studentSkills: StudentSkills;
  enrollmentAgreement: EnrollmentAgreement;
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
}
```

### PersonalInfo

```typescript
{
  lastName: string;
  firstName: string;
  middleName: string;
  nameExtension?: string;
  nickname: string;
  sex: "FEMALE" | "MALE";
  age: number;
  birthday: Date;
  placeOfBirth: string;
  religion: string;
  presentAddress: string;
  contactNumber: string;
  citizenship: "FILIPINO" | "FOREIGNER";
  citizenshipSpecification?: string;
}
```

### ParentInfo

```typescript
{
  fatherFullName: string;
  fatherOccupation?: string;
  fatherContactNumber: string;
  fatherEmail?: string;
  fatherEducationalAttainment: EducationalAttainment;
  motherFullName: string;
  motherOccupation?: string;
  motherContactNumber: string;
  motherEmail: string;
  motherEducationalAttainment: EducationalAttainment;
  maritalStatus: MaritalStatus[];
}
```

### EducationalAttainment

```typescript
type EducationalAttainment = 
  | "ELEMENTARY_GRADUATE"
  | "HIGH_SCHOOL_GRADUATE"
  | "COLLEGE_GRADUATE"
  | "ELEMENTARY_UNDERGRAD"
  | "HIGH_SCHOOL_UNDERGRAD"
  | "COLLEGE_UNDERGRAD"
  | "OTHERS";
```

### MaritalStatus

```typescript
type MaritalStatus = 
  | "MARRIED"
  | "SEPARATED"
  | "SINGLE_PARENT"
  | "STEPMOTHER"
  | "STEPFATHER"
  | "OTHER";
```

### StudentHistory

```typescript
{
  siblingsInformation?: string;
  totalLearnersInHousehold: number;
  lastSchoolPreschoolName: string;
  lastSchoolPreschoolAddress?: string;
  lastSchoolElementaryName: string;
  lastSchoolElementaryAddress?: string;
}
```

### StudentSkills

```typescript
{
  specialSkills: SpecialSkill[];
  specialNeedsDiagnosis?: string;
}
```

### SpecialSkill

```typescript
type SpecialSkill = 
  | "COMPUTER"
  | "COMPOSITION_WRITING"
  | "SINGING"
  | "DANCING"
  | "POEM_WRITING"
  | "COOKING"
  | "ACTING"
  | "PUBLIC_SPEAKING"
  | "OTHER";
```

### EnrollmentAgreement

```typescript
{
  responsiblePersonName: string;
  responsiblePersonContactNumber: string;
  responsiblePersonEmail: string;
  relationshipToStudent?: string;
  enrollmentAgreementAcceptance: "YES_COMMIT" | "OTHER";
  withdrawalPolicyAcceptance: "YES_AGREED" | "NO_DISAGREE";
}
```

### Document

```typescript
{
  id: string;
  enrollmentId: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  url: string;
  mimeType: string;
  uploadedAt: Date;
}
```

### DocumentType

```typescript
type DocumentType = 
  | "REPORT_CARD"
  | "BIRTH_CERTIFICATE"
  | "GOOD_MORAL"
  | "MARRIAGE_CONTRACT"
  | "MEDICAL_RECORDS"
  | "SPECIAL_NEEDS_DIAGNOSIS"
  | "PROOF_OF_PAYMENT";
```

---

## Rate Limiting

Currently, no rate limiting is implemented. For production, consider adding:

- 100 requests per 15 minutes per IP
- 1000 requests per hour per authenticated user
- Special limits for file uploads (10 per hour)

---

## Versioning

**Current Version:** 1.0.0

API versioning will be implemented in future releases using URL path versioning:
- `/api/v1/enrollments`
- `/api/v2/enrollments`

---

## Support

For API support, contact:
- **Email:** api-support@yourdomain.com
- **Documentation:** https://docs.yourdomain.com
- **Status Page:** https://status.yourdomain.com

---

**Last Updated:** February 9, 2026  
**Version:** 1.0.0


---

## Teacher Management Endpoints

### Get All Teachers

**Endpoint:** `GET /api/teachers`  
**Authorization:** PRINCIPAL only

**Query Parameters:**
- `search` (optional): Search by name or employee ID
- `subject` (optional): Filter by subject
- `class` (optional): Filter by class

**Response:**
```json
{
  "teachers": [
    {
      "id": "tchr_001",
      "name": "Floyd Miles",
      "email": "floyd.miles@school.com",
      "phone": "+123 9988",
      "address": "TA-107 Newyork",
      "subject": "Mathematics",
      "class": "01",
      "employeeId": "0021",
      "profileUrl": null,
      "createdAt": "2026-02-13T00:00:00.000Z",
      "updatedAt": "2026-02-13T00:00:00.000Z"
    }
  ]
}
```

### Create Teacher

**Endpoint:** `POST /api/teachers`  
**Authorization:** PRINCIPAL only

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@school.com",
  "phone": "+123456789",
  "address": "123 Main St",
  "subject": "Mathematics",
  "class": "01",
  "employeeId": "0001",
  "profileUrl": "https://example.com/photo.jpg"
}
```

**Response:**
```json
{
  "teacher": {
    "id": "tchr_123",
    "name": "John Doe",
    "email": "john@school.com",
    "phone": "+123456789",
    "address": "123 Main St",
    "subject": "Mathematics",
    "class": "01",
    "employeeId": "0001",
    "profileUrl": "https://example.com/photo.jpg",
    "createdAt": "2026-02-13T00:00:00.000Z",
    "updatedAt": "2026-02-13T00:00:00.000Z"
  }
}
```

### Get Teacher by ID

**Endpoint:** `GET /api/teachers/[id]`  
**Authorization:** PRINCIPAL only

**Response:**
```json
{
  "teacher": {
    "id": "tchr_001",
    "name": "Floyd Miles",
    "email": "floyd.miles@school.com",
    "phone": "+123 9988",
    "address": "TA-107 Newyork",
    "subject": "Mathematics",
    "class": "01",
    "employeeId": "0021",
    "profileUrl": null,
    "createdAt": "2026-02-13T00:00:00.000Z",
    "updatedAt": "2026-02-13T00:00:00.000Z"
  }
}
```

### Update Teacher

**Endpoint:** `PATCH /api/teachers/[id]`  
**Authorization:** PRINCIPAL only

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "phone": "+987654321",
  "subject": "Physics"
}
```

**Response:**
```json
{
  "teacher": {
    "id": "tchr_001",
    "name": "John Doe Updated",
    "email": "john@school.com",
    "phone": "+987654321",
    "address": "123 Main St",
    "subject": "Physics",
    "class": "01",
    "employeeId": "0001",
    "profileUrl": "https://example.com/photo.jpg",
    "createdAt": "2026-02-13T00:00:00.000Z",
    "updatedAt": "2026-02-13T10:30:00.000Z"
  }
}
```

### Delete Teacher

**Endpoint:** `DELETE /api/teachers/[id]`  
**Authorization:** PRINCIPAL only

**Response:**
```json
{
  "success": true
}
```

---

## Role-Based Access Control

### Role Permissions

| Feature | PARENT | ADMIN | PRINCIPAL |
|---------|--------|-------|-----------|
| Submit Enrollment | ✓ | ✗ | ✗ |
| View Own Enrollments | ✓ | ✗ | ✗ |
| View All Enrollments | ✗ | ✓ | ✓ |
| Approve/Reject Enrollments | ✗ | ✓ | ✓ |
| Create Parent Accounts | ✗ | ✓ | ✓ |
| Manage Teachers | ✗ | ✗ | ✓ |

