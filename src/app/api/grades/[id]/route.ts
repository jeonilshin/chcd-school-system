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
    const { grade, remarks, teacher } = body;

    const updated = await prisma.grade.update({
      where: { id: params.id },
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
  } catch (error) {
    console.error('Error updating grade:', error);
    return NextResponse.json({ error: 'Failed to update grade' }, { status: 500 });
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

    await prisma.grade.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting grade:', error);
    return NextResponse.json({ error: 'Failed to delete grade' }, { status: 500 });
  }
}
