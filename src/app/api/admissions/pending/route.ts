import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-middleware';
import { Role } from '@prisma/client';

/**
 * GET /api/admissions/pending
 * Get approved enrollments that haven't been admitted yet
 */
export async function GET(req: NextRequest) {
  try {
    await requireRole([Role.ADMIN, Role.PRINCIPAL]);

    // Get approved enrollments that don't have a student record yet
    const pendingAdmissions = await prisma.enrollment.findMany({
      where: {
        status: 'APPROVED',
        Student: { is: null }, // No student record exists
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ enrollments: pendingAdmissions });
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.name === 'ForbiddenError') {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('Error fetching pending admissions:', error);
    return NextResponse.json({ error: 'Failed to fetch pending admissions' }, { status: 500 });
  }
}
