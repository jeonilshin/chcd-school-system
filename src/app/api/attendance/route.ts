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
    const date = searchParams.get('date');
    const studentId = searchParams.get('studentId');
    const classId = searchParams.get('classId');

    const where: any = {};
    if (date) where.date = new Date(date);
    if (studentId) where.studentId = studentId;
    if (classId) {
      where.Student = { classId };
    }

    const attendance = await prisma.attendance.findMany({
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
        { date: 'desc' },
        { Student: { lastName: 'asc' } },
      ],
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'PRINCIPAL', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, date, status, timeIn, timeOut, remarks } = body;

    // Check if attendance already exists for this student and date
    const existing = await prisma.attendance.findUnique({
      where: {
        studentId_date: {
          studentId,
          date: new Date(date),
        },
      },
    });

    if (existing) {
      // Update existing attendance
      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          status,
          timeIn,
          timeOut,
          remarks,
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

    // Create new attendance record
    const attendance = await prisma.attendance.create({
      data: {
        id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        studentId,
        date: new Date(date),
        status,
        timeIn,
        timeOut,
        remarks,
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

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Error creating attendance:', error);
    return NextResponse.json({ error: 'Failed to create attendance' }, { status: 500 });
  }
}
