export const DEFAULT_LOCALE = 'en-gb';

export const SUPPORTED_LOCALES = [
  'en-gb',
  'fr-FR',
  'de-DE',
  'es-ES',
  'it-IT',
  'pt-PT',
  'ru-RU',
  'ja-JP',
  'zh-CN',
  'ar',
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function normalizeLocale(locale?: string | null): string {
  if (!locale || locale === 'undefined') return DEFAULT_LOCALE;
  if (locale === 'en') return DEFAULT_LOCALE;
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale) ? locale : DEFAULT_LOCALE;
}

export function getLocaleFromPathname(pathname?: string | null): string {
  if (!pathname) return DEFAULT_LOCALE;
  const firstSegment = pathname.split('/').filter(Boolean)[0] || '';
  return normalizeLocale(firstSegment);
}

export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (!firstSegment) return '/';

  if ((SUPPORTED_LOCALES as readonly string[]).includes(firstSegment) || firstSegment === 'en') {
    const stripped = `/${segments.slice(1).join('/')}`;
    return stripped === '/' ? '/' : stripped;
  }

  return pathname;
}

export function buildLocalizedPath(locale: string, path: string): string {
  const normalizedLocale = normalizeLocale(locale);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${`/${normalizedLocale}`}${normalizedPath === '/' ? '' : normalizedPath}`;
}

export function localizeCurrentPath(locale: string, pathname: string): string {
  return buildLocalizedPath(locale, stripLocalePrefix(pathname));
}
