import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendParentalConsentEmail } from '@/lib/email/emailService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { childEmail } = body;

    if (!childEmail) {
      return NextResponse.json(
        { success: false, error: 'Email required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: childEmail },
    });

    if (!user || !user.parentEmail || !user.parentConsentToken) {
      return NextResponse.json(
        { success: false, error: 'No consent request found' },
        { status: 404 }
      );
    }

    // Send email again
    const consentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/parental-consent/${user.parentConsentToken}`;
    await sendParentalConsentEmail(user.parentEmail, user.name || childEmail, consentUrl);

    return NextResponse.json({
      success: true,
      message: 'Consent request resent',
    });
  } catch (error) {
    console.error('Resend consent error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resend request' },
      { status: 500 }
    );
  }
}
