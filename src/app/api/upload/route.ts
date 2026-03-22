import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'message' or 'assignment'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', type || 'files', session.user.id);
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${sanitizedName}`;
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${type || 'files'}/${session.user.id}/${fileName}`;

    return NextResponse.json({
      url: fileUrl,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
