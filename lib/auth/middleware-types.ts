// Types for Auth middleware
import type { AuthenticatedUser } from '@/lib/api-types';

export type Role = AuthenticatedUser['role'];
export type AuthResult = {
  authenticated: boolean;
  user?: AuthenticatedUser;
  response?: Response;
};
export type AuthorizeResult = {
  authorized: boolean;
  user?: AuthenticatedUser;
  response?: Response;
};

export declare function authenticateUser(request: Request): Promise<AuthResult>;
export declare function authorizeRole(request: Request, requiredRoles: Role[]): Promise<AuthorizeResult>;
export declare function withAuth<P = Record<string, unknown>>(
  handler:
    | ((request: Request, user: AuthenticatedUser) => Promise<Response>)
    | ((request: Request, context: { params: P }, user: AuthenticatedUser) => Promise<Response>)
): (request: Request, context?: { params?: P }) => Promise<Response>;
export declare function withRole(
  requiredRoles: Role[],
  handler: (request: Request, user: AuthenticatedUser) => Promise<Response>
): (request: Request) => Promise<Response>;
export declare function getOptionalUser(request: Request): Promise<AuthenticatedUser | null>;
export {};
