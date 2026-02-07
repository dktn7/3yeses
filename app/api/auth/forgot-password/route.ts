import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email/emailService';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const prisma = getPrisma();

  try {
    const { email, locale } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { 
          success: true,
          message: 'If an account exists with this email, a reset link has been sent.' 
        },
        { status: 200 }
      );
    }

    // Generate reset token (32 random bytes as hex)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token expires in 1 hour

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken, locale || 'en');
      console.log(`✅ Password reset email sent to: ${user.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError);
      // Don't fail the request if email fails - token is still valid
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'If an account exists with this email, a reset link has been sent.' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}
