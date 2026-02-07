export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        parentalConsentRequired: true,
        parentalConsentPending: true,
        parentalConsentGiven: true,
        parentEmail: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    let status: 'pending' | 'waiting' | 'approved' | 'denied' = 'pending';

    if (user.parentalConsentGiven) {
      status = 'approved';
    } else if (user.parentalConsentPending) {
      status = 'waiting';
    } else if (user.parentalConsentRequired) {
      status = 'pending';
    }

    return NextResponse.json({
      success: true,
      status,
      parentEmail: user.parentEmail,
    });
  } catch (error) {
    console.error('Consent status check error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check status' },
      { status: 500 }
    );
  }
}
