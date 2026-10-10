import { createHmac, randomInt } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPrisma } from '@/lib/prisma';
import AuthService from '@/lib/auth/auth-service';
import { sendPasswordChangeCodeEmail } from '@/lib/email/emailService';

const CODE_WINDOW_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const CODE_PEPPER = process.env.PASSWORD_CHANGE_CODE_PEPPER;

function hashCode(code: string) {
  if (!CODE_PEPPER) throw new Error('Password change code pepper is not configured');
  return createHmac('sha256', CODE_PEPPER).update(code).digest('hex');
}

export async function POST(request: NextRequest) {
  const prisma = getPrisma();
  try {
    const accessToken = (await cookies()).get('accessToken')?.value;
    const decoded = accessToken ? await AuthService.verifyJWT(accessToken) : null;
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { id: true, email: true, emailVerified: true } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (!user.emailVerified) return NextResponse.json({ error: 'Verify your account email before changing your password.' }, { status: 403 });
    const now = new Date();
    const cooldownCutoff = new Date(now.getTime() - RESEND_COOLDOWN_MS);
    const reservation = await prisma.user.updateMany({
      where: {
        id: user.id,
        OR: [
          { passwordChangeCodeSentAt: null },
          { passwordChangeCodeSentAt: { lt: cooldownCutoff } },
        ],
      },
      data: { passwordChangeCodeSentAt: now },
    });
    if (reservation.count === 0) {
      return NextResponse.json({ error: 'A verification code was sent recently. Check your email or wait before requesting another.' }, { status: 429 });
    }

    const code = String(randomInt(100000, 1000000));
    try {
      await sendPasswordChangeCodeEmail(user.email, code, request.nextUrl.searchParams.get('locale') || 'en');
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordChangeCodeHash: hashCode(code),
          passwordChangeCodeExpiry: new Date(now.getTime() + CODE_WINDOW_MS),
          passwordChangeCodeAttempts: 0,
        },
      });
    } catch (error) {
      await prisma.user.updateMany({
        where: { id: user.id, passwordChangeCodeSentAt: now },
        data: { passwordChangeCodeSentAt: null },
      });
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Verification code sent to your account email.' });
  } catch (error) {
    console.error('Password change code error:', error);
    return NextResponse.json({ error: 'We could not send a verification code. Please try again.' }, { status: 500 });
  }
}
