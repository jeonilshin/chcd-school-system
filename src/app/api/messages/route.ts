import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Send a message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, content, attachmentUrl, attachmentName, attachmentSize, attachmentType } = body;

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify conversation access
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    if (
      conversation.parentId !== userId &&
      conversation.recipientId !== userId &&
      !conversation.participants.includes(userId)
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        senderRole: session.user.role,
        content,
        ...(attachmentUrl && { attachmentUrl }),
        ...(attachmentName && { attachmentName }),
        ...(attachmentSize && { attachmentSize }),
        ...(attachmentType && { attachmentType }),
      },
    });

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
