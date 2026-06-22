import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import AuthService from '@/lib/auth/auth-service';

export async function POST(request: NextRequest) {
  const prisma = getPrisma();

  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
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
      include: {
        talentProfile: {
          select: {
            userId: true,
            performerTitle: true,
          },
        },
      },
    });

    if (!user) {
      // Don't reveal whether email exists - but provide specific error
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await AuthService.verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Check email verification (only for accounts that need it)
    if (!user.emailVerified && !user.parentalConsentRequired) {
      return NextResponse.json(
        { 
          error: 'Please verify your email address before logging in.',
          requiresEmailVerification: true,
          email: user.email
        },
        { status: 403 }
      );
    }

    // Check parental consent for accounts that require it
    if (user.parentalConsentRequired && user.parentalConsentPending) {
      return NextResponse.json(
        { 
          error: 'Your account is pending parental consent approval.',
          requiresParentalConsent: true,
          parentEmail: user.parentEmail
        },
        { status: 403 }
      );
    }

    // Generate tokens
    const accessToken = await AuthService.generateJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const refreshToken = await AuthService.generateRefreshToken({
      userId: user.id,
    });

    // Set HTTP-only cookies on the actual response so the browser persists them.
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: !!user.emailVerified,
        talentProfile: user.talentProfile
          ? {
              userId: user.talentProfile.userId,
              performerTitle: user.talentProfile.performerTitle,
            }
          : null,
      },
      accessToken, // Also returned for non-cookie clients
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    response.cookies.set('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60, // 7 days or 24 hours
    });

    response.cookies.set('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60, // 30 days or 7 days
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login. Please try again.' },
      { status: 500 }
    );
  }
}
