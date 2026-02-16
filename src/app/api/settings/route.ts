import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    let settings = await prisma.schoolSettings.findUnique({
      where: { id: 'default' }
    });

    if (!settings) {
      settings = await prisma.schoolSettings.create({
        data: {
          id: 'default',
          schoolName: 'School',
          primaryColor: '#3B82F6'
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PRINCIPAL')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { schoolName, schoolLogoUrl, primaryColor } = body;

    const settings = await prisma.schoolSettings.upsert({
      where: { id: 'default' },
      update: {
        schoolName,
        schoolLogoUrl,
        primaryColor,
        updatedAt: new Date()
      },
      create: {
        id: 'default',
        schoolName,
        schoolLogoUrl,
        primaryColor
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
