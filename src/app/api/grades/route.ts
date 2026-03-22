import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'PRINCIPAL', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const schoolYear = searchParams.get('schoolYear');
    const quarter = searchParams.get('quarter');

    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (schoolYear) where.schoolYear = schoolYear;
    if (quarter) where.quarter = quarter;

    const grades = await prisma.grade.findMany({
      where,
      include: {
        Student: {
          select: {
            id: true,
            studentId: true,
            firstName: true,
            lastName: true,
            classId: true,
            Class: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { schoolYear: 'desc' },
        { quarter: 'asc' },
        { Student: { lastName: 'asc' } },
      ],
    });

    return NextResponse.json(grades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json({ error: 'Failed to fetch grades' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'PRINCIPAL', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, subject, quarter, grade, remarks, teacher, schoolYear } = body;

    // Check if grade already exists
    const existing = await prisma.grade.findUnique({
      where: {
        studentId_subject_quarter_schoolYear: {
          studentId,
          subject,
          quarter,
          schoolYear,
        },
      },
    });

    if (existing) {
      // Update existing grade
      const updated = await prisma.grade.update({
        where: { id: existing.id },
        data: {
          grade: parseFloat(grade),
          remarks,
          teacher,
        },
        include: {
          Student: {
            select: {
              firstName: true,
              lastName: true,
              studentId: true,
            },
          },
        },
      });
      return NextResponse.json(updated);
    }

    // Create new grade
    const newGrade = await prisma.grade.create({
      data: {
        id: `grd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        studentId,
        subject,
        quarter,
        grade: parseFloat(grade),
        remarks,
        teacher,
        schoolYear,
      },
      include: {
        Student: {
          select: {
            firstName: true,
            lastName: true,
            studentId: true,
          },
        },
      },
    });

    return NextResponse.json(newGrade);
  } catch (error) {
    console.error('Error creating grade:', error);
    return NextResponse.json({ error: 'Failed to create grade' }, { status: 500 });
  }
}
