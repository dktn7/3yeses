import { createNavigation } from 'next-intl/navigation';
 
export const locales = ['en-GB', 'fr'] as const;
 
// The `pathnames` object holds pairs of internal
// and external paths, separated by locale.
export const pathnames = {
  // If all locales use the same path, use
  // the special `/` path.
  '/': '/',
  '/about': {
    'en-GB': '/about',
    fr: '/a-propos'
  }
} as const;
 
export const localePrefix = 'always'; // Default
 
export const {Link, redirect, usePathname, useRouter} =
  createNavigation({locales, pathnames, localePrefix});
