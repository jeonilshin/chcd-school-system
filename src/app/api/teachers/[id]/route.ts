import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-middleware';
import { Role } from '@prisma/client';

/**
 * GET /api/teachers/[id]
 * Get a specific teacher (Principal only)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole([Role.PRINCIPAL]);

    const { id } = await params;

    const teacher = await prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    return NextResponse.json({ teacher });
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Error fetching teacher:', error);
    return NextResponse.json({ error: 'Failed to fetch teacher' }, { status: 500 });
  }
}

/**
 * PATCH /api/teachers/[id]
 * Update a teacher (Principal only)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole([Role.PRINCIPAL]);

    const { id } = await params;
    const body = await req.json();

    const teacher = await prisma.teacher.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ teacher });
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Error updating teacher:', error);
    return NextResponse.json({ error: 'Failed to update teacher' }, { status: 500 });
  }
}

/**
 * DELETE /api/teachers/[id]
 * Delete a teacher (Principal only)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole([Role.PRINCIPAL]);

    const { id } = await params;

    await prisma.teacher.delete({
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
    console.error('Error deleting teacher:', error);
    return NextResponse.json({ error: 'Failed to delete teacher' }, { status: 500 });
  }
}
