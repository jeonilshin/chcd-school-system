import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/parent/students
 * Get all students for the logged-in parent
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get parent's email
    const parentEmail = session.user.email;

    // Find students where parent email matches (mother or father)
    const students = await prisma.student.findMany({
      where: {
        OR: [
          { motherEmail: parentEmail },
          { fatherEmail: parentEmail },
        ],
      },
      include: {
        Class: {
          include: {
            Teacher: true,
          },
        },
        Enrollment: {
          select: {
            id: true,
            profilePictureUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching parent students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
