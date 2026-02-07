// Authentication middleware for protecting routes
// Use this middleware to protect pages that require authentication

import { NextResponse } from 'next/server';
import { AuthService } from './auth-service';
import type { AuthenticatedUser } from '@/types/api';

// Keep role type consistent with AuthenticatedUser to avoid importing Prisma enums here
type Role = AuthenticatedUser['role'];

// Compatibility alias: some files still reference NextRequest as a type
// Type for requests with cookies property
type CookieRequest = Request & { cookies?: { get?: (name: string) => { value: string } | undefined } };

/**
 * Middleware to check if user is authenticated
 */
export async function authenticateUser(request: Request): Promise<{
  authenticated: boolean;
  user?: AuthenticatedUser;
  response?: Response;
}> {
  try {
    // Get token from cookie
  let token: string | undefined = undefined;
  if ('cookies' in request) {
    const req = request as CookieRequest;
    if (req.cookies && typeof req.cookies.get === 'function') {
      token = req.cookies.get('accessToken')?.value;
    }
  }

    if (!token) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { success: false, message: 'Authentication required' },
          { status: 401 }
        )
      };
    }

    // Verify JWT token
    const decoded = AuthService.verifyJWT(token);

    if (!decoded) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { success: false, message: 'Invalid or expired token' },
          { status: 401 }
        )
      };
    }

    // In production, you might want to verify the user still exists and is active in the database
    // const userFromDb = await getUserById(decoded.userId);
    // if (!userFromDb || !userFromDb.isActive) {
    //   return { authenticated: false, response: unauthorized response };
    // }

    return {
      authenticated: true,
      user: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role as Role,
        name: decoded.name,
      }
    };

  } catch (error) {
    console.error('Authentication middleware error:', error);
    return {
      authenticated: false,
      response: NextResponse.json(
        { success: false, message: 'Authentication error' },
        { status: 500 }
      )
    };
  }
}

/**
 * Middleware to check if user has required role
 */
export async function authorizeRole(
  request: Request, 
  requiredRoles: Role[]
): Promise<{
  authorized: boolean;
  user?: AuthenticatedUser;
  response?: Response;
}> {
  const authResult = await authenticateUser(request);
  
  if (!authResult.authenticated || !authResult.user) {
    return {
      authorized: false,
      response: authResult.response
    };
  }

  if (!requiredRoles.includes(authResult.user.role)) {
    return {
      authorized: false,
      user: authResult.user,
      response: NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      )
    };
  }

  return {
    authorized: true,
    user: authResult.user
  };
}

/**
 * Higher-order function to protect API routes
 */
export function withAuth<P = Record<string, unknown>>(
  handler:
    | ((request: Request, user: AuthenticatedUser) => Promise<Response>)
    | ((request: Request, context: { params: P }, user: AuthenticatedUser) => Promise<Response>)
) {
  return (async (request: Request, context: { params?: P } = { params: {} as P }) => {
    const authResult = await authenticateUser(request as Request);

    if (!authResult.authenticated || !authResult.user) {
      return authResult.response!;
    }

    // Dispatch to the correct handler signature
    try {
        // Avoid using the broad `Function` type; use a small arity guard instead
  const isTwoArgHandler = (h: unknown): h is (request: Request, user: AuthenticatedUser) => Promise<Response> => {
          if (typeof h !== 'function') return false;
          const maybe = h as unknown as { length?: number };
          return typeof maybe.length === 'number' && maybe.length === 2;
        };

        if (isTwoArgHandler(handler)) {
          return handler(request, authResult.user);
        }

        const fnWithContext = handler as (request: Request, context: { params: P }, user: AuthenticatedUser) => Promise<Response>;
  return fnWithContext(request, context as { params: P }, authResult.user);
    } catch (err) {
      console.error('withAuth handler error:', err);
      throw err;
    }
  });
}

/**
 * Higher-order function to protect API routes with role-based access
 */
export function withRole(
  requiredRoles: Role[], 
  handler: (request: Request, user: AuthenticatedUser) => Promise<Response>
) {
  return async (request: Request) => {
    const authResult = await authorizeRole(request, requiredRoles);
    
    if (!authResult.authorized || !authResult.user) {
      return authResult.response!;
    }

    return handler(request, authResult.user);
  };
}

/**
 * Extract user information from request without requiring authentication
 * Useful for optional authentication scenarios
 */
export async function getOptionalUser(request: Request): Promise<AuthenticatedUser | null> {
  try {
    let token: string | undefined = undefined;
    if ('cookies' in request) {
      const req = request as CookieRequest;
      if (req.cookies && typeof req.cookies.get === 'function') {
        token = req.cookies.get('auth-token')?.value;
      }
    }
    
    if (!token) {
      return null;
    }

    const decoded = AuthService.verifyJWT(token);
    
    if (!decoded) {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role as Role,
      name: decoded.name,
    };
  } catch (error) {
    console.error('Optional user extraction error:', error);
    return null;
  }
}
