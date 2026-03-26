import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    
    // Get all users (without passwords)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      userCount,
      users,
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Database connection failed'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      });
    }

    // Test password
    const isValid = await compare(password, user.password);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      passwordValid: isValid,
      message: isValid ? 'Credentials valid' : 'Invalid password'
    });
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Authentication test failed'
    }, { status: 500 });
  }
}