import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check access
    const userId = session.user.id;
    if (
      conversation.parentId !== userId &&
      conversation.recipientId !== userId
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // For now, we'll just delete the conversation
    // In a full implementation, you'd add an 'archived' field
    await prisma.conversation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error archiving conversation:', error);
    return NextResponse.json(
      { error: 'Failed to archive conversation' },
      { status: 500 }
    );
  }
}
