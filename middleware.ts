import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  defaultLocale: 'en-gb',
  locales: ['en', 'en-gb', 'de-DE', 'es-ES', 'fr-FR', 'it-IT', 'ja-JP', 'pt-PT', 'ru-RU', 'zh-CN', 'ar'],
  localePrefix: 'as-needed',
  pathnames: {
    '/': '/',
  },
});

export const config = {
  matcher: [
    // Enable a redirect on the root path
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(en|de-DE|en-gb|es-ES|fr-FR|it-IT|ja-JP|pt-PT|ru-RU|zh-CN|ar)/:path*',
 
    // Enable redirects that add missing locales
    // Exclude: api, _next, static files (images, fonts, etc)
    '/((?!api|_next|favicon.ico|logo.png|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|.*\\.webp$|.*\\.mp3$|.*\\.mp4$|.*\\.webm$|.*\\.woff$|.*\\.woff2$|.*\\.ttf$|.*\\.eot$).*)'
  ]
};