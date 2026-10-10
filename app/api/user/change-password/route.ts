import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import AuthService from '@/lib/auth/auth-service';
import { cookies } from 'next/headers';
import { createHmac } from 'node:crypto';

const CODE_PEPPER = process.env.PASSWORD_CHANGE_CODE_PEPPER;

function hashCode(code: string) {
  if (!CODE_PEPPER) throw new Error('Password change code pepper is not configured');
  return createHmac('sha256', CODE_PEPPER).update(code).digest('hex');
}

export async function POST(request: NextRequest) {
  const prisma = getPrisma();

  try {
    // Verify authentication
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await AuthService.verifyJWT(accessToken);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword, verificationCode } = body;

    // Validation
    if (!currentPassword || !newPassword || !verificationCode) {
      return NextResponse.json(
        { error: 'Current password, new password, and email verification code are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isPasswordValid = await AuthService.verifyPassword(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    if (!/^\d{6}$/.test(String(verificationCode))) {
      return NextResponse.json({ error: 'Enter the six-digit verification code from your email.' }, { status: 400 });
    }
    const providedCodeHash = hashCode(String(verificationCode));
    const now = new Date();
    if (!user.passwordChangeCodeHash || !user.passwordChangeCodeExpiry || user.passwordChangeCodeExpiry.getTime() < now.getTime()) {
      return NextResponse.json({ error: 'That verification code has expired. Request a new one.' }, { status: 400 });
    }

    // Claim one attempt atomically so parallel guesses cannot bypass the limit.
    const attempt = await prisma.user.updateMany({
      where: {
        id: decoded.userId,
        passwordChangeCodeHash: { not: null },
        passwordChangeCodeExpiry: { gt: now },
        passwordChangeCodeAttempts: { lt: 5 },
      },
      data: { passwordChangeCodeAttempts: { increment: 1 } },
    });
    if (attempt.count === 0) {
      return NextResponse.json({ error: 'Too many incorrect codes. Request a new verification code.' }, { status: 429 });
    }
    if (providedCodeHash !== user.passwordChangeCodeHash) {
      return NextResponse.json({ error: 'That verification code is incorrect.' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await AuthService.hashPassword(newPassword);

    // Update password
    const consumed = await prisma.user.updateMany({
      where: {
        id: decoded.userId,
        passwordChangeCodeHash: providedCodeHash,
        passwordChangeCodeExpiry: { gt: new Date() },
        passwordChangeCodeAttempts: { lte: 5 },
      },
      data: {
        password: hashedPassword,
        passwordChangeCodeHash: null,
        passwordChangeCodeExpiry: null,
        passwordChangeCodeSentAt: null,
        passwordChangeCodeAttempts: 0,
      },
    });
    if (consumed.count === 0) {
      return NextResponse.json({ error: 'That verification code has already been used. Request a new one.' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}
