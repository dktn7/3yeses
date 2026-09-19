'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image';
import DropdownPanel from './DropdownPanel';
import { getLocaleFromPathname, localizeCurrentPath, normalizeLocale } from '@/lib/locale-path';

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

// Get current locale from pathname
export default function LanguageDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLocale, setCurrentLocale] = useState('en-gb')
  const [isClient, setIsClient] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setIsClient(true)
    setCurrentLocale(getLocaleFromPathname(pathname))
  }, [pathname])

  const handleLanguageChange = (locale: string) => {
    setIsOpen(false);
    const currentPath = pathname || '/';
    const currentSearch = searchParams?.toString();
    const newPath = localizeCurrentPath(normalizeLocale(locale), currentPath);
    const url = currentSearch ? `${newPath}?${currentSearch}` : newPath;

    router.push(url);
  };

  const currentLanguage = locales.find(locale => normalizeLocale(currentLocale) === locale.code)
  const isCurrentLanguage = (localeCode: string) => normalizeLocale(currentLocale) === normalizeLocale(localeCode)

  if (!isClient) {
    return null
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/80 bg-[var(--marketing-surface)] text-gray-700 shadow-sm transition-all hover:bg-slate-100/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:border-[var(--chrome-border)] dark:bg-[var(--chrome-panel)] dark:text-red-100 dark:hover:bg-[var(--chrome-hover)]"
      >
        {currentLanguage && (
          <Image
            src={currentLanguage.flag}
            alt={currentLanguage.name}
            width={24}
            height={24}
            unoptimized
            className="h-4 w-4 shrink-0 object-contain"
          />
        )}
      </button>

      {isOpen && (
        <DropdownPanel
          portal
          anchorRef={buttonRef}
          className="!z-[160] w-52 overflow-hidden p-2"
        >
          <div className="grid grid-cols-1 gap-1">
            {locales.map((locale) => (
              <button
                key={locale.code}
                onClick={() => {
                  if (!isCurrentLanguage(locale.code)) handleLanguageChange(locale.code);
                  else setIsOpen(false);
                }}
                className={`ui-popover-item flex items-center justify-start gap-2 rounded-md p-2 text-left ${
                  isCurrentLanguage(locale.code)
                    ? 'cursor-default bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/15 dark:bg-[rgba(185,28,28,0.22)] dark:text-red-100 dark:ring-red-500/40'
                    : 'text-gray-700 dark:text-red-100'
                }`}
                aria-current={isCurrentLanguage(locale.code) ? 'true' : undefined}
              >
                <Image
                  src={locale.flag}
                  alt={locale.name}
                  width={24}
                  height={24}
                  unoptimized
                  className="h-4 w-4 shrink-0 object-contain"
                />
                <span className="text-sm text-inherit">{locale.name}</span>
              </button>
            ))}
          </div>
        </DropdownPanel>
      )}
    </div>
  )
}
