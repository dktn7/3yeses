import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthService } from '@/lib/auth/auth-service';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/auth/refresh
 * Refresh the access token using the refresh token
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;
    const rememberMe = cookieStore.get('rememberMe')?.value === 'true';

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token found' },
        { status: 401 }
      );
    }

    // Verify refresh token using AuthService (jose-based, Edge-compatible)
    const decoded = await AuthService.verifyRefreshToken(refreshToken);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Look up the user to get current email, role, name
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Generate new access token using AuthService
    const newAccessToken = await AuthService.generateJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name || '',
    });

    // Set new access token cookie
    const maxAge = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60; // 7 days or 24 hours
    
    const response = NextResponse.json(
      { 
        success: true,
        message: 'Token refreshed successfully',
        accessToken: newAccessToken
      }
    );

    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    console.log('[AUTH] Access token refreshed via /api/auth/refresh');

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    );
  }
}
