import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get assignments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (session.user.role === 'TEACHER') {
      // Teachers see their own assignments
      const assignments = await prisma.assignment.findMany({
        where: {
          teacherId: session.user.id,
          ...(classId && { classId }),
        },
        include: {
          Class: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(assignments);
    } else if (session.user.role === 'PARENT') {
      // Parents see assignments for their children's classes
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

      const assignments = await prisma.assignment.findMany({
        where: {
          classId: { in: classIds },
        },
        include: {
          Class: true,
          Teacher: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(assignments);
    } else {
      // Admins see all assignments
      const assignments = await prisma.assignment.findMany({
        where: classId ? { classId } : {},
        include: {
          Class: true,
          Teacher: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(assignments);
    }
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

// Create assignment (teachers only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { classId, title, description, dueDate, attachmentUrl } = body;

    if (!classId || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify teacher owns this class
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classRecord || classRecord.teacherId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only create assignments for your own classes' },
        { status: 403 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        classId,
        teacherId: session.user.id,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        attachmentUrl,
      },
      include: {
        Class: true,
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}
