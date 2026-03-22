import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get announcements
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role === 'PARENT') {
      // Parents see public announcements and class-specific ones
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: session.user.id, status: 'APPROVED' },
        include: {
          Student: {
            select: { classId: true },
          },
        },
      });

      const classIds = enrollments
        .map((e) => e.Student?.classId)
        .filter(Boolean) as string[];

      const announcements = await prisma.announcement.findMany({
        where: {
          OR: [
            { isPublic: true },
            { id: { in: classIds } },
          ],
          publishDate: { lte: new Date() },
          OR: [
            { expiryDate: null },
            { expiryDate: { gte: new Date() } },
          ],
        },
        orderBy: [
          { priority: 'desc' },
          { publishDate: 'desc' },
        ],
      });

      return NextResponse.json(announcements);
    } else {
      // Teachers and admins see all announcements
      const announcements = await prisma.announcement.findMany({
        orderBy: [
          { priority: 'desc' },
          { publishDate: 'desc' },
        ],
      });

      return NextResponse.json(announcements);
    }
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

// Create announcement (teachers and admins only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN' && session.user.role !== 'PRINCIPAL')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, category, priority, isPublic, classId, expiryDate } = body;

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        id: `ann-${Date.now()}`,
        title,
        content,
        category,
        priority: priority || 'NORMAL',
        isPublic: isPublic || false,
        targetAudience: ['PARENT', 'STUDENT'],
        authorId: session.user.id,
        authorRole: session.user.role,
        ...(classId && { classId }),
        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
        createdBy: session.user.id,
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}
