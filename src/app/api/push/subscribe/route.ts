import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // Save or update subscription
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId: session.user.id,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      create: {
        userId: session.user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint } = body;

    await prisma.pushSubscription.delete({
      where: { endpoint },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}
