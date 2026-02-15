import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-middleware';
import { Role } from '@prisma/client';

/**
 * GET /api/students
 * Get all students with filters
 */
export async function GET(req: NextRequest) {
  try {
    await requireRole([Role.ADMIN, Role.PRINCIPAL]);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const program = searchParams.get('program');
    const classId = searchParams.get('classId');
    const schoolYear = searchParams.get('schoolYear');

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (program) {
      where.program = program;
    }

    if (classId) {
      where.classId = classId;
    }

    if (schoolYear) {
      where.schoolYear = schoolYear;
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        Class: {
          select: {
            id: true,
            name: true,
            section: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ students });
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

/**
 * POST /api/students
 * Create student from approved enrollment (admission)
 */
export async function POST(req: NextRequest) {
  try {
    await requireRole([Role.ADMIN, Role.PRINCIPAL]);

    const body = await req.json();
    const { enrollmentId, classId } = body;

    if (!enrollmentId) {
      return NextResponse.json({ error: 'Enrollment ID is required' }, { status: 400 });
    }

    // Get enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    if (enrollment.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Only approved enrollments can be admitted' }, { status: 400 });
    }

    // Check if student already exists for this enrollment
    const existingStudent = await prisma.student.findUnique({
      where: { enrollmentId },
    });

    if (existingStudent) {
      return NextResponse.json({ error: 'Student already exists for this enrollment' }, { status: 400 });
    }

    // Generate student ID
    const year = new Date().getFullYear();
    const lastStudent = await prisma.student.findFirst({
      where: {
        studentId: {
          startsWith: `STU-${year}-`,
        },
      },
      orderBy: { studentId: 'desc' },
    });

    let sequential = 1;
    if (lastStudent) {
      const lastSequential = parseInt(lastStudent.studentId.split('-')[2]);
      sequential = lastSequential + 1;
    }

    const studentId = `STU-${year}-${sequential.toString().padStart(4, '0')}`;

    // Create student
    const student = await prisma.student.create({
      data: {
        id: `stu_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        studentId,
        enrollmentId,
        classId: classId || null,
        status: 'ACTIVE',
        firstName: enrollment.firstName,
        lastName: enrollment.lastName,
        middleName: enrollment.middleName,
        nameExtension: enrollment.nameExtension,
        nickname: enrollment.nickname,
        sex: enrollment.sex,
        age: enrollment.age,
        birthday: enrollment.birthday,
        placeOfBirth: enrollment.placeOfBirth,
        religion: enrollment.religion,
        presentAddress: enrollment.presentAddress,
        contactNumber: enrollment.contactNumber,
        citizenship: enrollment.citizenship,
        profilePictureUrl: enrollment.profilePictureUrl,
        fatherFullName: enrollment.fatherFullName,
        fatherContactNumber: enrollment.fatherContactNumber,
        fatherEmail: enrollment.fatherEmail,
        motherFullName: enrollment.motherFullName,
        motherContactNumber: enrollment.motherContactNumber,
        motherEmail: enrollment.motherEmail,
        program: enrollment.program,
        schoolYear: enrollment.schoolYear,
      },
      include: {
        Class: true,
      },
    });

    return NextResponse.json({ student }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}
