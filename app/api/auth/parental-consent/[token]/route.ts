import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendConsentApprovedEmail } from '@/lib/email';

const prisma = new PrismaClient();

/**
 * GET /api/auth/parental-consent/[token]
 * 
 * Get information about a parental consent request
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Find user with this consent token
    const user = await prisma.user.findFirst({
      where: {
        parentConsentToken: token,
      },
      select: {
        id: true,
        name: true,
        parentName: true,
        parentEmail: true,
        parentConsentTokenExpiry: true,
        parentalConsentGiven: true,
        parentalConsentPending: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid consent token' },
        { status: 404 }
      );
    }

    // Check if already processed
    if (user.parentalConsentGiven) {
      return NextResponse.json(
        { error: 'Consent already given for this account' },
        { status: 400 }
      );
    }

    if (!user.parentalConsentPending) {
      return NextResponse.json(
        { error: 'Consent request is no longer active' },
        { status: 400 }
      );
    }

    // Check if token expired
    if (user.parentConsentTokenExpiry && new Date() > user.parentConsentTokenExpiry) {
      return NextResponse.json(
        { error: 'This consent link has expired. Please contact support for a new link.' },
        { status: 410 } // 410 Gone
      );
    }

    return NextResponse.json({
      teenName: user.name,
      parentName: user.parentName,
      expiresAt: user.parentConsentTokenExpiry,
    });

  } catch (error) {
    console.error('Get consent info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/parental-consent/[token]
 * 
 * Process parental consent decision (approve or decline)
 * 
 * Body:
 * - action: 'approve' | 'decline'
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const body = await request.json();
    const { action } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'decline') {
      return NextResponse.json(
        { error: 'Action must be either "approve" or "decline"' },
        { status: 400 }
      );
    }

    // Find user with this consent token
    const user = await prisma.user.findFirst({
      where: {
        parentConsentToken: token,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid consent token' },
        { status: 404 }
      );
    }

    // Check if already processed
    if (user.parentalConsentGiven) {
      return NextResponse.json(
        { error: 'Consent already given for this account' },
        { status: 400 }
      );
    }

    if (!user.parentalConsentPending) {
      return NextResponse.json(
        { error: 'Consent request is no longer active' },
        { status: 400 }
      );
    }

    // Check if token expired
    if (user.parentConsentTokenExpiry && new Date() > user.parentConsentTokenExpiry) {
      return NextResponse.json(
        { error: 'This consent link has expired. Please contact support for a new link.' },
        { status: 410 }
      );
    }

    if (action === 'approve') {
      // Approve the account
      await prisma.user.update({
        where: { id: user.id },
        data: {
          parentalConsentGiven: true,
          parentalConsentPending: false,
          parentConsentedAt: new Date(),
          // Clear the token after use
          parentConsentToken: null,
          parentConsentTokenExpiry: null,
        },
      });

      // Send approval notification to teen
      if (user.email) {
        await sendConsentApprovedEmail(user.email, user.name);
      }

      return NextResponse.json({
        success: true,
        message: 'Account approved successfully',
        teenName: user.name,
      });

    } else {
      // Decline - delete the user account
      await prisma.user.delete({
        where: { id: user.id },
      });

      return NextResponse.json({
        success: true,
        message: 'Account registration declined and removed',
        teenName: user.name,
      });
    }

  } catch (error) {
    console.error('Process consent error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
