import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Check if email exists with enrollments or parent account
 * GET /api/enrollments/check-email?email=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check for existing enrollments with this email
    const enrollments = await prisma.enrollment.findMany({
      where: {
        OR: [
          { motherEmail: email },
          { responsiblePersonEmail: email },
        ],
        status: {
          in: ['APPROVED', 'PENDING'], // Only show approved or pending
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        status: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Check if parent account exists
    const parentAccount = await prisma.user.findUnique({
      where: {
        email: email,
        role: 'PARENT',
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({
      hasAccount: !!parentAccount,
      enrollments: enrollments.map((e) => ({
        id: e.id,
        studentName: `${e.firstName} ${e.lastName}`,
        status: e.status,
      })),
    });
  } catch (error) {
    console.error('Error checking email:', error);
    return NextResponse.json(
      { error: 'Failed to check email' },
      { status: 500 }
    );
  }
}
