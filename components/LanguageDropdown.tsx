'use client'

import { useState, useEffect } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { Globe, ChevronDown } from 'lucide-react'

import Image from 'next/image';

const locales = [
  { code: 'en-gb', nameKey: 'english', flag: '/flags/gb.svg', name: 'English' },
  { code: 'fr-FR', nameKey: 'french', flag: '/flags/fr.svg', name: 'Français' },
  { code: 'de-DE', nameKey: 'german', flag: '/flags/de.svg', name: 'Deutsch' },
  { code: 'es-ES', nameKey: 'spanish', flag: '/flags/es.svg', name: 'Español' },
  { code: 'it-IT', nameKey: 'italian', flag: '/flags/it.svg', name: 'Italiano' },
  { code: 'pt-PT', nameKey: 'portuguese', flag: '/flags/pt.svg', name: 'Português' },
  { code: 'ru-RU', nameKey: 'russian', flag: '/flags/ru.svg', name: 'Русский' },
  { code: 'ja-JP', nameKey: 'japanese', flag: '/flags/jp.svg', name: '日本語' },
  { code: 'zh-CN', nameKey: 'chinese', flag: '/flags/cn.svg', name: '中文' },
  { code: 'ar', nameKey: 'arabic', flag: '/flags/sa.svg', name: 'العربية' }
]

// Check if we're in a locale-specific route
const isLocaleRoute = (pathname: string) => {
  return locales.some(locale => pathname.startsWith(`/${locale.code}`))
}

// Get current locale from pathname
const getCurrentLocale = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  let lastValidLocale = null;

  const localeCodes = locales.map(l => l.code);

  for (const segment of segments) {
    if (localeCodes.includes(segment)) {
      lastValidLocale = segment;
    } else {
      // Stop at the first non-locale segment
      break;
    }
  }

  return lastValidLocale || 'en-gb'; // Default
}

export default function LanguageDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLocale, setCurrentLocale] = useState('en-gb')
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
    const locale = pathname ? getCurrentLocale(pathname) : 'en-gb'
    setCurrentLocale(locale)
  }, [pathname])

  const handleLanguageChange = (locale: string) => {
    setIsOpen(false);
    const currentPath = pathname || '/';
    const currentSearch = searchParams?.toString();

    const localeCodes = locales.map(l => l.code);
    const segments = currentPath.split('/').filter(Boolean);

    let firstNonLocaleIndex = 0;
    while (firstNonLocaleIndex < segments.length && localeCodes.includes(segments[firstNonLocaleIndex])) {
      firstNonLocaleIndex++;
    }

    const pathWithoutLocales = '/' + segments.slice(firstNonLocaleIndex).join('/');

    const newPath = `/${locale}${pathWithoutLocales === '/' ? '' : pathWithoutLocales}`;
    const url = currentSearch ? `${newPath}?${currentSearch}` : newPath;

    router.push(url);
  };

  const currentLanguage = locales.find(locale => locale.code === currentLocale)

  if (!isClient) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent hover:bg-blue-100 dark:hover:bg-red-500 h-10 w-10"
      >
        {currentLanguage && <Image src={currentLanguage.flag} alt={currentLanguage.name} width={24} height={24} unoptimized />}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-2">
          <div className="grid grid-cols-1 gap-2">
            {locales.map((locale) => (
              <button
                key={locale.code}
                onClick={() => {
                  if (currentLocale !== locale.code) handleLanguageChange(locale.code);
                  else setIsOpen(false);
                }}
                className={`flex items-center justify-start p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                  currentLocale === locale.code
                    ? 'bg-blue-100 dark:bg-blue-900 cursor-default'
                    : ''
                }`}
                disabled={currentLocale === locale.code}
                aria-current={currentLocale === locale.code ? 'true' : undefined}
              >
                <Image src={locale.flag} alt={locale.name} width={24} height={24} unoptimized />
                <span className="ml-2 text-sm text-gray-800 dark:text-white">{locale.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}