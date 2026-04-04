import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthService } from '@/lib/auth/auth-service';
import { prisma } from '@/lib/prisma';

/**
 * Middleware to verify admin authentication
 * Checks for valid JWT token and ADMIN role
 */
export async function verifyAdminAuth(request: NextRequest) {
  try {
    // Get access token from cookies (use next/headers to be consistent with API routes)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    // Debug logging: show whether cookie was found (temporary)
    // eslint-disable-next-line no-console
    console.log('verifyAdminAuth - accessToken present:', !!accessToken);

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    // Verify token and get user data
    const decoded = await AuthService.verifyJWT(accessToken);
    // Debug logging: show decoded token (temporary)
    // eslint-disable-next-line no-console
    console.log('verifyAdminAuth - decoded token:', decoded);

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
 * Automatically logs mutating actions (POST/PATCH/PUT/DELETE) to audit trail
 */
export function withAdminAuth(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    const authResult = await verifyAdminAuth(request);

    if (authResult instanceof NextResponse) {
      // Auth failed, return error response
      return authResult;
    }

    // Auth success, attach user to request and call handler
    const result = await handler(request, { ...context, admin: authResult.user });

    // Auto-log mutating admin actions to audit trail
    const method = request.method;
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      try {
        const url = new URL(request.url);
        const routePath = url.pathname;
        // Derive action from method + route
        const action = `ADMIN_${method}_${routePath.replace('/api/admin/', '').replace(/\//g, '_').toUpperCase()}`;
        
        await prisma.activityLog.create({
          data: {
            action: action.slice(0, 100), // cap length
            userId: authResult.user.userId,
            details: { method, path: routePath, status: result?.status || 200 },
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          },
        });
      } catch (e) {
        // Audit logging is non-critical, never block the response
        console.error('Auto audit log failed:', e);
      }
    }

    return result;
  };
}
