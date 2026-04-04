import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import AuthService from '@/lib/auth/auth-service';
import { cookies } from 'next/headers';
import { createAuditLog } from '@/lib/admin/audit';

export async function POST(request: NextRequest) {
  const prisma = getPrisma();

  try {
    // Rate limiting check using AuthService (in-memory)
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const isRateLimited = !(await AuthService.checkRateLimit(`login_${ip}`, 5, 60000));
    
    if (isRateLimited) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Only allow ADMIN role here
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const isPasswordValid = await AuthService.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      await createAuditLog({
        action: 'ADMIN_LOGIN_FAILURE',
        userId: user.id,
        details: { email, reason: 'invalid_password', ip },
      });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await createAuditLog({
      action: 'ADMIN_LOGIN_SUCCESS',
      userId: user.id,
      details: { email, ip },
    });

    // Generate tokens
    const accessToken = await AuthService.generateJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const refreshToken = await AuthService.generateRefreshToken({ userId: user.id });

    // Set HTTP-only cookies
    const cookieStore = await cookies();
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    cookieStore.set('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60,
    });

    cookieStore.set('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Admin login failed' }, { status: 500 });
  }
}
