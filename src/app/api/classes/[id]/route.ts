import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-middleware';
import { Role } from '@prisma/client';

/**
 * GET /api/classes/[id]
 * Get class details with roster
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole([Role.ADMIN, Role.PRINCIPAL]);

    const { id } = await params;

    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        Teacher: true,
        Students: {
          orderBy: { lastName: 'asc' },
        },
      },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json({ class: classData });
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Error fetching class:', error);
    return NextResponse.json({ error: 'Failed to fetch class' }, { status: 500 });
  }
}

/**
 * PATCH /api/classes/[id]
 * Update class information
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole([Role.ADMIN, Role.PRINCIPAL]);

    const { id } = await params;
    const body = await req.json();

    const classData = await prisma.class.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
      include: {
        Teacher: true,
      },
    });

    return NextResponse.json({ class: classData });
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Error updating class:', error);
    return NextResponse.json({ error: 'Failed to update class' }, { status: 500 });
  }
}

/**
 * DELETE /api/classes/[id]
 * Delete class
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole([Role.ADMIN, Role.PRINCIPAL]);

    const { id } = await params;

    // Check if class has students
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        _count: {
          select: { Students: true },
        },
      },
    });

    if (classData && classData._count.Students > 0) {
      return NextResponse.json(
        { error: 'Cannot delete class with enrolled students' },
        { status: 400 }
      );
    }

    await prisma.class.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Error deleting class:', error);
    return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 });
  }
}
