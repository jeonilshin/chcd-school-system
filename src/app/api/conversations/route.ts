import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get all conversations for the current user
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    let conversations;

    if (userRole === 'PARENT') {
      // Get conversations where user is the parent
      conversations = await prisma.conversation.findMany({
        where: { parentId: userId },
        include: {
          Messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { lastMessageAt: 'desc' },
      });

      // Get recipient details
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conv) => {
          let recipientName = 'Unknown';
          
          if (conv.recipientRole === 'TEACHER') {
            const teacher = await prisma.teacher.findUnique({
              where: { id: conv.recipientId },
              select: { name: true },
            });
            recipientName = teacher?.name || 'Teacher';
          } else if (conv.recipientRole === 'ADMIN' || conv.recipientRole === 'PRINCIPAL') {
            const user = await prisma.user.findUnique({
              where: { id: conv.recipientId },
              select: { name: true },
            });
            recipientName = user?.name || 'Admin';
          }

          return {
            ...conv,
            recipientName,
            unreadCount: await prisma.message.count({
              where: {
                conversationId: conv.id,
                senderId: { not: userId },
                isRead: false,
              },
            }),
          };
        })
      );

      return NextResponse.json(conversationsWithDetails);
    } else {
      // For teachers and admins, get conversations where they are recipients
      conversations = await prisma.conversation.findMany({
        where: { recipientId: userId },
        include: {
          Messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { lastMessageAt: 'desc' },
      });

      // Get parent details
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conv) => {
          const parent = await prisma.user.findUnique({
            where: { id: conv.parentId },
            select: { name: true, email: true },
          });

          return {
            ...conv,
            parentName: parent?.name || 'Parent',
            parentEmail: parent?.email,
            unreadCount: await prisma.message.count({
              where: {
                conversationId: conv.id,
                senderId: { not: userId },
                isRead: false,
              },
            }),
          };
        })
      );

      return NextResponse.json(conversationsWithDetails);
    }
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recipientId, recipientRole, subject } = body;

    if (!recipientId || !recipientRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Only parents can create conversations
    if (session.user.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Only parents can initiate conversations' },
        { status: 403 }
      );
    }

    // Check if conversation already exists
    const existing = await prisma.conversation.findUnique({
      where: {
        parentId_recipientId: {
          parentId: session.user.id,
          recipientId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        parentId: session.user.id,
        recipientId,
        recipientRole,
        subject,
      },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
