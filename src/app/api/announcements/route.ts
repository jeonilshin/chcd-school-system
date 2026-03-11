import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/announcements
 * Get all announcements (Admin/Principal only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'PRINCIPAL'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const announcements = await prisma.announcement.findMany({
      orderBy: {
        publishDate: 'desc',
      },
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/announcements
 * Create a new announcement (Admin/Principal only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'PRINCIPAL'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content, category, priority, targetAudience, expiryDate } = body;

    // Validation
    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }

    // Generate ID
    const id = `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const announcement = await prisma.announcement.create({
      data: {
        id,
        title,
        content,
        category,
        priority: priority || 'NORMAL',
        targetAudience: targetAudience || ['ALL'],
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        createdBy: session.user.email,
      },
    });

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}
