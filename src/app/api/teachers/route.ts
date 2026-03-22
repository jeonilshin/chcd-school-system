import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-middleware';
import { Role } from '@prisma/client';

/**
 * GET /api/teachers
 * Get all teachers (Admin and Principal)
 */
export async function GET(req: NextRequest) {
  try {
    // Allow ADMIN and PRINCIPAL to view teachers
    await requireRole([Role.ADMIN, Role.PRINCIPAL]);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const subject = searchParams.get('subject');
    const classFilter = searchParams.get('class');

    // Build filter
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (subject) {
      where.subject = subject;
    }

    if (classFilter) {
      where.class = classFilter;
    }

    const teachers = await prisma.teacher.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(teachers);
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
}

/**
 * POST /api/teachers
 * Create a new teacher (Principal only)
 */
export async function POST(req: NextRequest) {
  try {
    await requireRole([Role.PRINCIPAL]);

    const body = await req.json();
    const { name, email, phone, address, subject, class: teacherClass, employeeId, profileUrl } = body;

    // Validation
    if (!name || !email || !phone || !address || !subject || !teacherClass || !employeeId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email or employeeId already exists
    const existing = await prisma.teacher.findFirst({
      where: {
        OR: [
          { email },
          { employeeId },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Teacher with this email or employee ID already exists' },
        { status: 400 }
      );
    }

    const teacher = await prisma.teacher.create({
      data: {
        id: `tchr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name,
        email,
        phone,
        address,
        subject,
        class: teacherClass,
        employeeId,
        profileUrl: profileUrl || null,
      },
    });

    return NextResponse.json({ teacher }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Error creating teacher:', error);
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 });
  }
}
