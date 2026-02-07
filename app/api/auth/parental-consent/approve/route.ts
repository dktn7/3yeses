import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, approved } = body;

    if (!token || typeof approved !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Find user with this token
    const user = await prisma.user.findFirst({
      where: {
        parentConsentToken: token,
        parentConsentTokenExpiry: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired consent link' },
        { status: 404 }
      );
    }

    // Update user based on decision
    await prisma.user.update({
      where: { id: user.id },
      data: {
        parentalConsentGiven: approved,
        parentalConsentPending: false,
        parentConsentedAt: approved ? new Date() : null,
        // Clear token after use
        parentConsentToken: null,
        parentConsentTokenExpiry: null,
      },
    });

    // TODO: Send notification email to child
    // If approved: welcome email
    // If denied: sorry email

    return NextResponse.json({
      success: true,
      approved,
      message: approved
        ? 'Consent approved successfully'
        : 'Consent declined',
    });
  } catch (error) {
    console.error('Approve consent error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process decision' },
      { status: 500 }
    );
  }
}
