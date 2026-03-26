import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'PRINCIPAL', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, timeIn, timeOut, remarks } = body;

    const attendance = await prisma.attendance.update({
      where: { id: params.id },
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

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Error updating attendance:', error);
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'PRINCIPAL'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.attendance.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    return NextResponse.json({ error: 'Failed to delete attendance' }, { status: 500 });
  }
}
