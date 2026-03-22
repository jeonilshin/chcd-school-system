import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: params.id },
      include: {
        Class: true,
        Teacher: {
          select: { name: true, email: true },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignment' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: params.id },
    });

    if (!assignment || assignment.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, dueDate, attachmentUrl } = body;

    const updated = await prisma.assignment.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(attachmentUrl !== undefined && { attachmentUrl }),
      },
      include: {
        Class: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to update assignment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: params.id },
    });

    if (!assignment || assignment.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.assignment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { error: 'Failed to delete assignment' },
      { status: 500 }
    );
  }
}
