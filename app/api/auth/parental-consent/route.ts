import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendParentalConsentEmail } from '@/lib/email';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * POST /api/auth/parental-consent
 * 
 * Send parental consent verification email for teen users (13-15)
 * 
 * Body:
 * - userId: string (ID of the user requiring parental consent)
 * - parentName: string
 * - parentEmail: string
 * - teenName: string
 * - teenAge: number
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, parentName, parentEmail, teenName, teenAge } = body;

    // Validation
    if (!userId || !parentName || !parentEmail || !teenName || !teenAge) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate age range (13-15)
    if (teenAge < 13 || teenAge > 15) {
      return NextResponse.json(
        { error: 'Parental consent is only required for ages 13-15' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(parentEmail)) {
      return NextResponse.json(
        { error: 'Invalid parent email format' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has parental consent given
    if (user.parentalConsentGiven) {
      return NextResponse.json(
        { error: 'Parental consent already given for this account' },
        { status: 400 }
      );
    }

    // Generate secure consent token
    const consentToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 48); // Token expires in 48 hours

    // Update user with parental consent information
    await prisma.user.update({
      where: { id: userId },
      data: {
        parentName,
        parentEmail,
        parentConsentToken: consentToken,
        parentConsentTokenExpiry: tokenExpiry,
        parentalConsentRequired: true,
        parentalConsentPending: true,
        parentalConsentGiven: false,
      },
    });

    // Send consent email to parent
    const emailSent = await sendParentalConsentEmail(
      parentEmail,
      parentName,
      teenName,
      teenAge,
      consentToken
    );

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send consent email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Parental consent email sent successfully',
      expiresAt: tokenExpiry.toISOString(),
    });

  } catch (error) {
    console.error('Parental consent API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/parental-consent?userId=xxx
 * 
 * Check parental consent status for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        parentalConsentRequired: true,
        parentalConsentPending: true,
        parentalConsentGiven: true,
        parentName: true,
        parentEmail: true,
        parentConsentTokenExpiry: true,
        parentConsentedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      required: user.parentalConsentRequired || false,
      pending: user.parentalConsentPending || false,
      given: user.parentalConsentGiven || false,
      parentName: user.parentName,
      parentEmail: user.parentEmail,
      tokenExpiry: user.parentConsentTokenExpiry,
      consentedAt: user.parentConsentedAt,
    });

  } catch (error) {
    console.error('Parental consent status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
