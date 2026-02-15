import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-middleware';
import { Role } from '@prisma/client';

/**
 * GET /api/classes
 * Get all classes
 */
export async function GET(req: NextRequest) {
  try {
    await requireRole([Role.ADMIN, Role.PRINCIPAL]);

    const { searchParams } = new URL(req.url);
    const program = searchParams.get('program');
    const schoolYear = searchParams.get('schoolYear');

    const where: any = {};

    if (program) {
      where.program = program;
    }

    if (schoolYear) {
      where.schoolYear = schoolYear;
    }

    const classes = await prisma.class.findMany({
      where,
      include: {
        Teacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            Students: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ classes });
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}

/**
 * POST /api/classes
 * Create a new class
 */
export async function POST(req: NextRequest) {
  try {
    await requireRole([Role.ADMIN, Role.PRINCIPAL]);

    const body = await req.json();
    const { name, program, schoolYear, section, capacity, teacherId, roomNumber, schedule } = body;

    if (!name || !program || !schoolYear) {
      return NextResponse.json(
        { error: 'Name, program, and school year are required' },
        { status: 400 }
      );
    }

    // Check if class already exists
    const existing = await prisma.class.findFirst({
      where: {
        name,
        schoolYear,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Class with this name already exists for this school year' },
        { status: 400 }
      );
    }

    const classData = await prisma.class.create({
      data: {
        id: `cls_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name,
        program,
        schoolYear,
        section: section || null,
        capacity: capacity || 30,
        teacherId: teacherId || null,
        roomNumber: roomNumber || null,
        schedule: schedule || null,
      },
      include: {
        Teacher: true,
      },
    });

    return NextResponse.json({ class: classData }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Error creating class:', error);
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 });
  }
}
