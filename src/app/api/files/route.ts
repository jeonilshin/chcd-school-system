/**
 * API Route for Generic File Retrieval
 * 
 * GET /api/files?url=... - Retrieve a file by URL with authorization checks
 * 
 * Requirements: 8.2, 8.3, 8.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { fileRetrievalHandler } from '@/lib/file-retrieval-handler';
import { withAuth } from '@/lib/auth-middleware';

/**
 * GET /api/files?url=/uploads/...
 * 
 * Retrieves a file by URL with authorization checks.
 * 
 * Authorization:
 * - ADMIN and PRINCIPAL can access any file
 * - PARENT can only access their own enrollment files
 * 
 * Query Parameters:
 * - url: The file URL (e.g., /uploads/profile-pictures/...)
 * 
 * Returns:
 * - 200: File served with appropriate headers
 * - 400: Invalid URL
 * - 403: Unauthorized access
 * - 404: File not found
 * - 500: Server error
 */
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
      return NextResponse.json(
        { error: 'Missing url parameter' },
        { status: 400 }
      );
    }

    // Retrieve file with authorization check
    const result = await fileRetrievalHandler.getFileByUrl(fileUrl);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 500 }
      );
    }

    // Serve file with appropriate headers
    return new NextResponse(result.fileBuffer ? Buffer.from(result.fileBuffer) : null, {
      status: 200,
      headers: {
        'Content-Type': result.mimeType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${result.fileName}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error in file retrieval route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
