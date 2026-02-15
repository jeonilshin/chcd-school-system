import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-middleware';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

/**
 * POST /api/admin/create-parent-account
 * Create a parent account for an enrollment
 * Only ADMIN and PRINCIPAL can create parent accounts
 */
export async function POST(req: NextRequest) {
  try {
    // Verify user has admin or principal role
    await requireRole([Role.ADMIN, Role.PRINCIPAL]);

    const body = await req.json();
    const { enrollmentId, email } = body;

    if (!enrollmentId || !email) {
      return NextResponse.json(
        { error: 'Enrollment ID and email are required' },
        { status: 400 }
      );
    }

    // Get enrollment details
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Check if user already exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Link enrollment to existing user
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: { userId: existingUser.id },
      });

      return NextResponse.json({
        success: true,
        message: 'Enrollment linked to existing parent account',
        userId: existingUser.id,
      });
    }

    // Create new parent user
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const parentName = `${enrollment.fatherFullName} / ${enrollment.motherFullName}`;
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email,
        name: parentName,
        password: hashedPassword,
        role: Role.PARENT,
        updatedAt: new Date(),
      },
    });

    // Link enrollment to new user
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { userId: newUser.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Parent account created successfully',
      userId: newUser.id,
      email: newUser.email,
      defaultPassword: defaultPassword,
    });
  } catch (error: any) {
    if (error.name === 'UnauthorizedError' || error.name === 'ForbiddenError') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error('Error creating parent account:', error);
    return NextResponse.json(
      { error: 'Failed to create parent account' },
      { status: 500 }
    );
  }
}
