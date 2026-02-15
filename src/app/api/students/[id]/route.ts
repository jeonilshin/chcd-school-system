import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-middleware';
import { Role } from '@prisma/client';

/**
 * GET /api/students/[id]
 * Get student details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole([Role.ADMIN, Role.PRINCIPAL]);

    const { id } = await params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        Class: {
          include: {
            Teacher: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        Enrollment: {
          include: {
            Document: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Error fetching student:', error);
    return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 });
  }
}

/**
 * PATCH /api/students/[id]
 * Update student information
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole([Role.ADMIN, Role.PRINCIPAL]);

    const { id } = await params;
    const body = await req.json();

    const student = await prisma.student.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
      include: {
        Class: true,
      },
    });

    return NextResponse.json({ student });
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Error updating student:', error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

/**
 * DELETE /api/students/[id]
 * Delete student (soft delete by changing status)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole([Role.ADMIN, Role.PRINCIPAL]);

    const { id } = await params;

    // Soft delete by setting status to INACTIVE
    await prisma.student.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
