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

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        Messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
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

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: params.id,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}
