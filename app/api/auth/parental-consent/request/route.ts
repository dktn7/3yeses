import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { sendParentalConsentEmail } from '@/lib/email/emailService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { childEmail, parentEmail } = body;

    if (!childEmail || !parentEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate emails are different
    if (childEmail.toLowerCase() === parentEmail.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Parent email must be different from child email' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: childEmail },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate consent token
    const consentToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 48); // 48 hour expiry

    // Update user with parent info and consent token
    await prisma.user.update({
      where: { email: childEmail },
      data: {
        parentEmail,
        parentConsentToken: consentToken,
        parentConsentTokenExpiry: tokenExpiry,
        parentalConsentPending: true,
      },
    });

    // Send email to parent
    const consentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/parental-consent/${consentToken}`;
    await sendParentalConsentEmail(parentEmail, user.name || childEmail, consentUrl);

    return NextResponse.json({
      success: true,
      message: 'Consent request sent to parent/guardian',
    });
  } catch (error) {
    console.error('Consent request error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send consent request' },
      { status: 500 }
    );
  }
}
