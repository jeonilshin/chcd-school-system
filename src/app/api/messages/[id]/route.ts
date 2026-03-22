import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Edit message
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const message = await prisma.message.findUnique({
      where: { id: params.id },
    });

    if (!message || message.senderId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const updated = await prisma.message.update({
      where: { id: params.id },
      data: {
        content,
        isEdited: true,
        editedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error editing message:', error);
    return NextResponse.json(
      { error: 'Failed to edit message' },
      { status: 500 }
    );
  }
}

// Delete message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const message = await prisma.message.findUnique({
      where: { id: params.id },
    });

    if (!message || message.senderId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete
    await prisma.message.update({
      where: { id: params.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        content: 'This message has been deleted',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
