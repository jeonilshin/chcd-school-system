/**
 * API Route for Profile Picture Retrieval
 * 
 * GET /api/profile-pictures/[enrollmentId]/[fileName] - Retrieve a profile picture with authorization checks
 * 
 * Requirements: 8.2, 8.3, 8.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { fileRetrievalHandler } from '@/lib/file-retrieval-handler';
import { withAuth } from '@/lib/auth-middleware';

/**
 * GET /api/profile-pictures/[enrollmentId]/[fileName]
 * 
 * Retrieves a profile picture with authorization checks.
 * 
 * Authorization:
 * - ADMIN and PRINCIPAL can access any profile picture
 * - PARENT can only access their own enrollment profile pictures
 * 
 * Returns:
 * - 200: File served with appropriate headers
 * - 403: Unauthorized access
 * - 404: Profile picture not found
 * - 500: Server error
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string; fileName: string }> }
) {
  try {
    const { enrollmentId, fileName } = await params;

    // Retrieve profile picture with authorization check
    const result = await fileRetrievalHandler.getProfilePicture(enrollmentId, fileName);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 500 }
      );
    }

    // Serve file with appropriate headers
    return new NextResponse(result.fileBuffer ? new Uint8Array(result.fileBuffer) : null, {
      status: 200,
      headers: {
        'Content-Type': result.mimeType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${result.fileName}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error in profile picture retrieval route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
