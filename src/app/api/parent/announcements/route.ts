import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/parent/announcements
 * Get announcements for parents
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'PARENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();

    // Get announcements that:
    // 1. Target parents or all
    // 2. Are published (publishDate <= now)
    // 3. Haven't expired (expiryDate is null or > now)
    const announcements = await prisma.announcement.findMany({
      where: {
        AND: [
          {
            OR: [
              { targetAudience: { has: 'PARENT' } },
              { targetAudience: { has: 'ALL' } },
            ],
          },
          {
            publishDate: {
              lte: now,
            },
          },
          {
            OR: [
              { expiryDate: null },
              { expiryDate: { gt: now } },
            ],
          },
        ],
      },
      orderBy: [
        { priority: 'desc' }, // HIGH priority first
        { publishDate: 'desc' },
      ],
      take: 50, // Limit to 50 most recent
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Error fetching parent announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}
