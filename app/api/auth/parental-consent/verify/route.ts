export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        parentConsentToken: token,
        parentConsentTokenExpiry: {
          gte: new Date(),
        },
      },
      select: {
        name: true,
        email: true,
        parentName: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired consent link' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      details: {
        childName: user.name || 'User',
        childEmail: user.email,
        requestDate: new Date(user.createdAt).toLocaleDateString(),
      },
    });
  } catch (error) {
    console.error('Verify consent token error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}
