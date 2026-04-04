import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import AuthService from './lib/auth/auth-service';

const intlMiddleware = createMiddleware({
  defaultLocale: 'en-gb',
  locales: ['en', 'en-gb', 'de-DE', 'es-ES', 'fr-FR', 'it-IT', 'ja-JP', 'pt-PT', 'ru-RU', 'zh-CN', 'ar'],
  localePrefix: 'as-needed',
  pathnames: {
    '/': '/',
  },
});

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Core Admin Protection (MUST be before intlMiddleware to avoid locale redirects for admin)
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin') || pathname.startsWith('/auth/admin-login')) {
    // Handle API specifically
    if (pathname.startsWith('/api/')) {
      if (pathname === '/api/admin/login' && request.method === 'POST') {
        return NextResponse.next();
      }
      const token = request.cookies.get('accessToken')?.value;
      if (!token) {
        return new NextResponse(JSON.stringify({ error: 'Authentication required' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }
      const decoded = await AuthService.verifyJWT(token);
      if (!decoded || decoded.role !== 'ADMIN') {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
      }
      return NextResponse.next();
    }

    // Handle Pages
    if (pathname.startsWith('/auth/admin-login')) return NextResponse.next();

    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/admin-login';
      return NextResponse.redirect(url);
    }
    const decoded = await AuthService.verifyJWT(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/admin-login';
      return NextResponse.redirect(url);
    }
    
    // Valid admin, allow access WITHOUT intl middleware (admin is not localized)
    return NextResponse.next();
  }

  // 2. Skip intl middleware for non-admin API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 3. Normal Site Localization
  return intlMiddleware(request as any);
}

export const config = {
  matcher: [
    // Enable a redirect on the root path
    '/',

    // Locale prefixes
    '/(en|de-DE|en-gb|es-ES|fr-FR|it-IT|ja-JP|pt-PT|ru-RU|zh-CN|ar)/:path*',

    // Protect admin pages and admin APIs
    '/admin/:path*',
    '/api/admin/:path*',

    // Enable redirects that add missing locales for other pages
    // Excludes: api, _next, static files
    '/((?!api|_next|favicon.ico|logo.png|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|.*\\.webp$|.*\\.mp3$|.*\\.mp4$|.*\\.webm$|.*\\.woff$|.*\\.woff2$|.*\\.ttf$|.*\\.eot$).*)'
  ]
};
