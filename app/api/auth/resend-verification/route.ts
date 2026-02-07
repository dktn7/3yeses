import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // TODO: Generate and send verification email
    // For now, we'll simulate success
    // const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?email=${email}`;
    // await sendVerificationEmail(user.email, verificationUrl);

    console.log('Verification email resent to:', email);

    return NextResponse.json(
      { message: 'Verification email has been sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
