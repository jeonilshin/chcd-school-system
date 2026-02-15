# File Retrieval Handler

## Overview

The File Retrieval Handler provides secure file serving with authorization checks for the Student Enrollment System. It ensures that users can only access files they are authorized to view based on their role and ownership.

**Requirements:** 8.2, 8.3, 8.4

## Authorization Rules

### ADMIN and PRINCIPAL
- Can access **any** file in the system
- Full read access to all profile pictures and documents

### PARENT
- Can **only** access files from their own enrollments
- Cannot access files from other parents' enrollments

## Components

### FileRetrievalHandler Class

Located in `src/lib/file-retrieval-handler.ts`

#### Methods

##### `getDocument(documentId: string): Promise<FileRetrievalResult>`

Retrieves a document by ID with authorization checks.

**Process:**
1. Fetches document from database with enrollment relationship
2. Checks if user is authorized (ADMIN/PRINCIPAL or enrollment owner)
3. Reads file from filesystem
4. Returns file buffer with metadata

**Returns:**
- `success`: boolean indicating operation success
- `fileBuffer`: Buffer containing file data (if successful)
- `fileName`: Original filename
- `mimeType`: MIME type of the file
- `error`: Error message (if failed)
- `statusCode`: HTTP status code (403, 404, 500)

**Example:**
```typescript
const result = await fileRetrievalHandler.getDocument('doc-123');
if (result.success) {
  // Serve file with result.fileBuffer, result.fileName, result.mimeType
} else {
  // Handle error with result.error and result.statusCode
}
```

##### `getProfilePicture(enrollmentId: string, fileName: string): Promise<FileRetrievalResult>`

Retrieves a profile picture with authorization checks.

**Process:**
1. Fetches enrollment to verify ownership
2. Checks if user is authorized (ADMIN/PRINCIPAL or enrollment owner)
3. Verifies requested file matches enrollment's profile picture URL
4. Reads file from filesystem
5. Returns file buffer with metadata

**Example:**
```typescript
const result = await fileRetrievalHandler.getProfilePicture('enroll-123', 'profile.jpg');
if (result.success) {
  // Serve file
}
```

##### `getFileByUrl(fileUrl: string): Promise<FileRetrievalResult>`

Generic method that retrieves any file by URL path with authorization checks.

**Process:**
1. Parses URL to extract enrollment ID
2. Fetches enrollment to verify ownership
3. Checks if user is authorized
4. Reads file from filesystem
5. Returns file buffer with metadata

**Example:**
```typescript
const result = await fileRetrievalHandler.getFileByUrl('/uploads/documents/enroll-123/report_card/file.pdf');
```

## API Routes

### GET /api/documents/[id]

Retrieves a document by ID.

**Authorization:** Required (ADMIN, PRINCIPAL, or enrollment owner)

**Response:**
- **200 OK**: File served with appropriate headers
- **403 Forbidden**: User not authorized to access document
- **404 Not Found**: Document does not exist
- **500 Internal Server Error**: Server error

**Headers:**
- `Content-Type`: MIME type of the file
- `Content-Disposition`: inline; filename="..."
- `Cache-Control`: private, max-age=3600

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/documents/doc-123
```

### GET /api/profile-pictures/[enrollmentId]/[fileName]

Retrieves a profile picture.

**Authorization:** Required (ADMIN, PRINCIPAL, or enrollment owner)

**Response:** Same as documents endpoint

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/profile-pictures/enroll-123/profile.jpg
```

### GET /api/files?url=...

Generic file retrieval by URL.

**Authorization:** Required (ADMIN, PRINCIPAL, or enrollment owner)

**Query Parameters:**
- `url`: The file URL (e.g., /uploads/profile-pictures/...)

**Response:** Same as documents endpoint

**Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/files?url=/uploads/documents/enroll-123/report_card/file.pdf"
```

## Security Features

### 1. Authorization Checks
- Every file retrieval verifies user permissions before serving files
- Uses `isAuthorizedOrOwner` helper from auth middleware
- Checks both role-based access (ADMIN/PRINCIPAL) and ownership (PARENT)

### 2. Path Validation
- Validates URL structure to prevent path traversal attacks
- Ensures enrollment ID is present in URL
- Verifies file belongs to the specified enrollment

### 3. Database Verification
- Always fetches enrollment/document from database before serving file
- Ensures file exists and user has access rights
- Prevents unauthorized access through URL manipulation

### 4. Error Handling
- Returns appropriate HTTP status codes
- Provides clear error messages
- Logs errors for debugging without exposing sensitive information

## File Storage Structure

```
/public/uploads
  /profile-pictures
    /{enrollmentId}
      /{timestamp}-{filename}
  /documents
    /{enrollmentId}
      /{documentType}
        /{timestamp}-{filename}
```

## MIME Type Detection

The handler automatically detects MIME types based on file extensions:

- `.jpg`, `.jpeg` → `image/jpeg`
- `.png` → `image/png`
- `.pdf` → `application/pdf`
- Unknown → `application/octet-stream`

## Usage in Frontend

### Displaying Profile Pictures

```typescript
// In a React component
<img 
  src={`/api/profile-pictures/${enrollmentId}/${fileName}`}
  alt="Profile Picture"
/>
```

### Downloading Documents

```typescript
// In a React component
const downloadDocument = async (documentId: string) => {
  const response = await fetch(`/api/documents/${documentId}`);
  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.pdf';
    a.click();
  }
};
```

### Using Generic File URL

```typescript
const fileUrl = '/uploads/documents/enroll-123/report_card/file.pdf';
const response = await fetch(`/api/files?url=${encodeURIComponent(fileUrl)}`);
```

## Testing

Unit tests are located in `src/test/file-retrieval-handler.test.ts`

**Test Coverage:**
- ✅ Authorized users can retrieve documents
- ✅ Unauthorized users receive 403 errors
- ✅ Non-existent documents return 404 errors
- ✅ File read errors return 500 errors
- ✅ Profile picture authorization checks
- ✅ URL validation and parsing
- ✅ MIME type detection

**Run tests:**
```bash
npm test file-retrieval-handler
```

## Error Scenarios

### 403 Forbidden
**Cause:** User is not authorized to access the file
**Solution:** Ensure user is ADMIN, PRINCIPAL, or the enrollment owner

### 404 Not Found
**Cause:** Document/enrollment does not exist, or file not found on disk
**Solution:** Verify document ID and ensure file exists in storage

### 500 Internal Server Error
**Cause:** File system error, database error, or unexpected exception
**Solution:** Check server logs for detailed error information

## Integration with Other Components

### Auth Middleware
- Uses `isAuthorizedOrOwner` helper for authorization checks
- Integrates with NextAuth session management
- Leverages role-based access control

### Prisma Database
- Queries Document and Enrollment models
- Verifies ownership through userId relationships
- Ensures data consistency

### File Upload Handler
- Complements the upload functionality
- Uses same directory structure
- Maintains consistent file naming conventions

## Best Practices

1. **Always use API routes** - Never serve files directly from public directory
2. **Check authorization** - Every file access must verify user permissions
3. **Validate inputs** - Sanitize and validate all file paths and IDs
4. **Handle errors gracefully** - Return appropriate status codes and messages
5. **Log security events** - Track unauthorized access attempts
6. **Cache appropriately** - Use Cache-Control headers for performance
7. **Test thoroughly** - Verify authorization logic with comprehensive tests

## Future Enhancements

- [ ] Add file streaming for large files
- [ ] Implement rate limiting for file downloads
- [ ] Add virus scanning integration
- [ ] Support for file thumbnails/previews
- [ ] Audit logging for file access
- [ ] CDN integration for better performance
- [ ] Support for temporary signed URLs
