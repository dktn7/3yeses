import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

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

    // Verify refresh token
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET, {
        issuer: '3yeses-platform',
        audience: '3yeses-users'
      });
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Generate new access token
    const payload = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };

    const newAccessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '24h',
      issuer: '3yeses-platform',
      audience: '3yeses-users'
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
