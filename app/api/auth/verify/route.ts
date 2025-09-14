// Authentication API endpoint for session verification
// GET /api/auth/verify

import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth/auth-service';

export async function GET(request: NextRequest) {
  try {
    // Get session cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No session found' },
        { status: 401 }
      );
    }

    // Verify the JWT
    const decodedUser = AuthService.verifyJWT(token);

    if (!decodedUser) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Return the session data
    return NextResponse.json({
      success: true,
      user: decodedUser
    });

  } catch (error) {
    console.error('Session verification error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
