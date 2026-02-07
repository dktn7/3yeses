import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth-service';

/**
 * Middleware to verify admin authentication
 * Checks for valid JWT token and ADMIN role
 */
export async function verifyAdminAuth(request: NextRequest) {
  try {
    // Get access token from cookies
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    // Verify token and get user data
    const decoded = AuthService.verifyJWT(accessToken);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token.' },
        { status: 401 }
      );
    }

    // Check for ADMIN role
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Return user info if admin
    return { isAdmin: true, user: decoded };
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed.' },
      { status: 401 }
    );
  }
}

/**
 * HOC to protect admin API routes
 */
export function withAdminAuth(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    const authResult = await verifyAdminAuth(request);

    if (authResult instanceof NextResponse) {
      // Auth failed, return error response
      return authResult;
    }

    // Auth success, attach user to request and call handler
    return handler(request, { ...context, admin: authResult.user });
  };
}
