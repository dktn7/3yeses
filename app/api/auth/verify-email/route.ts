import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/email/emailService';

export async function GET(request: NextRequest) {
  const prisma = getPrisma();
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  try {
    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { 
          error: 'Invalid or expired verification token',
          expired: true
        },
        { status: 400 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: 'Email is already verified',
      });
    }

    // Update user to mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name, 'en'); // TODO: Pass locale
      console.log(`✅ Welcome email sent to: ${user.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      // Don't fail verification if welcome email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      canLogin: true,
      requiresParentalConsent: user.parentalConsentRequired || false,
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred during email verification' },
      { status: 500 }
    );
  }
}
