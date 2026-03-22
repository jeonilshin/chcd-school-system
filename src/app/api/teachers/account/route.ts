import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Create teacher account with login credentials
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PRINCIPAL')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { teacherId, email, password, name } = body;

    // Validate required fields
    if (!teacherId || !email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId }
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user account for teacher
    const user = await prisma.user.create({
      data: {
        id: `teacher-${teacherId}`,
        email,
        name,
        password: hashedPassword,
        role: 'TEACHER'
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error creating teacher account:', error);
    return NextResponse.json(
      { error: 'Failed to create teacher account' },
      { status: 500 }
    );
  }
}