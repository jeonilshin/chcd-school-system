# File Upload Handler

## Overview

The `FileUploadHandler` class provides secure file storage functionality for the Student Enrollment System. It handles uploading profile pictures and documents to the local filesystem with proper directory structure and unique filename generation.

## Requirements

This implementation satisfies the following requirements:
- **Requirement 3.3**: Profile Picture Storage - Stores profile pictures securely
- **Requirement 4.6**: Document Storage - Stores documents securely  
- **Requirement 8.1**: Document Security - Files stored with access controls via directory structure

## Features

### 1. Directory Structure

Files are organized in a hierarchical structure:

```
/public/uploads/
  ├── profile-pictures/
  │   └── {enrollmentId}/
  │       └── {timestamp}-{filename}
  └── documents/
      └── {enrollmentId}/
          └── {documentType}/
              └── {timestamp}-{filename}
```

**Benefits:**
- Easy to locate files by enrollment ID
- Documents organized by type
- Supports cascade delete (delete all files for an enrollment)
- Access control can be implemented at the enrollment level

### 2. Unique Filename Generation

Filenames are generated using the format: `{timestamp}-{originalFilename}`

**Example:**
- Original: `profile.jpg`
- Generated: `1704067200000-profile.jpg`

**Benefits:**
- Prevents filename collisions
- Maintains chronological order
- Preserves original filename for reference
- Sanitizes special characters to prevent filesystem issues

### 3. Filename Sanitization

Special characters in filenames are replaced with underscores to prevent filesystem issues:

**Examples:**
- `my file (1).jpg` → `my_file__1_.jpg`
- `report-card.pdf` → `report-card.pdf`
- `birth cert #1.pdf` → `birth_cert__1.pdf`

### 4. File Operations

#### Upload Profile Picture

```typescript
const result = await fileUploadHandler.uploadProfilePicture(
  enrollmentId,
  file
);

if (result.success) {
  console.log('File URL:', result.fileUrl);
  // URL format: /uploads/profile-pictures/{enrollmentId}/{timestamp}-{filename}
}
```

#### Upload Document

```typescript
const result = await fileUploadHandler.uploadDocument(
  enrollmentId,
  'REPORT_CARD',
  file
);

if (result.success) {
  console.log('File URL:', result.fileUrl);
  // URL format: /uploads/documents/{enrollmentId}/report_card/{timestamp}-{filename}
}
```

#### Generic Upload

```typescript
// Upload profile picture
const result1 = await fileUploadHandler.upload({
  enrollmentId,
  file,
  isProfilePicture: true
});

// Upload document
const result2 = await fileUploadHandler.upload({
  enrollmentId,
  file,
  documentType: 'BIRTH_CERTIFICATE'
});
```

#### Delete File

```typescript
const success = await fileUploadHandler.deleteFile(fileUrl);
```

#### Delete All Enrollment Files

```typescript
// Deletes all profile pictures and documents for an enrollment
const success = await fileUploadHandler.deleteEnrollmentFiles(enrollmentId);
```

## Error Handling

All methods return a `FileUploadResult` object:

```typescript
interface FileUploadResult {
  success: boolean;
  fileUrl?: string;      // Present on success
  filePath?: string;     // Present on success
  error?: string;        // Present on failure
}
```

**Example error handling:**

```typescript
const result = await fileUploadHandler.uploadProfilePicture(enrollmentId, file);

if (!result.success) {
  console.error('Upload failed:', result.error);
  // Handle error (show message to user, retry, etc.)
}
```

## Integration with API Routes

### Example: Upload Endpoint

```typescript
// app/api/enrollments/[id]/upload/route.ts
import { fileUploadHandler } from '@/lib/file-upload-handler';
import { enrollmentValidator } from '@/lib/enrollment-validator';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const documentType = formData.get('documentType') as DocumentType;
  const enrollmentId = formData.get('enrollmentId') as string;
  
  // Validate file
  const validationErrors = enrollmentValidator.validateDocument(file, documentType);
  if (validationErrors.length > 0) {
    return Response.json({ success: false, errors: validationErrors }, { status: 400 });
  }
  
  // Upload file
  const result = await fileUploadHandler.uploadDocument(
    enrollmentId,
    documentType,
    file
  );
  
  if (!result.success) {
    return Response.json({ success: false, error: result.error }, { status: 500 });
  }
  
  // Save document record to database
  const document = await prisma.document.create({
    data: {
      enrollmentId,
      type: documentType,
      fileName: file.name,
      fileSize: file.size,
      fileUrl: result.fileUrl,
      mimeType: file.type,
    },
  });
  
  return Response.json({ success: true, documentId: document.id, url: result.fileUrl });
}
```

## Cascade Delete Support

When an enrollment is deleted, all associated files should be removed:

```typescript
// In your enrollment deletion logic
await fileUploadHandler.deleteEnrollmentFiles(enrollmentId);
await prisma.enrollment.delete({ where: { id: enrollmentId } });
```

## Security Considerations

1. **File Validation**: Always validate files before uploading using `EnrollmentValidator`
2. **Authorization**: Check user permissions before allowing uploads
3. **File Serving**: Serve files through an API route that checks authorization, not directly from /public
4. **Size Limits**: Enforce file size limits (100MB for profile pictures, 10MB for documents)
5. **Format Restrictions**: Only allow specific file types (JPEG, PNG for images; PDF, JPEG, PNG for documents)

## Testing

The file upload handler includes comprehensive unit tests covering:
- Profile picture uploads
- Document uploads with different types
- Directory structure creation
- Unique filename generation
- Filename sanitization
- File deletion
- Enrollment files cascade delete

Run tests with:
```bash
npm test file-upload-handler.test.ts
```

## Future Enhancements

Potential improvements for production:
1. **Cloud Storage**: Migrate to AWS S3, Google Cloud Storage, or Azure Blob Storage
2. **CDN Integration**: Serve files through a CDN for better performance
3. **Image Processing**: Resize/optimize profile pictures automatically
4. **Virus Scanning**: Integrate antivirus scanning for uploaded files
5. **Encryption**: Encrypt sensitive documents at rest
6. **Backup**: Implement automated backup of uploaded files
