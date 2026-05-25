'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Eye } from 'lucide-react';
import { ModeToggle } from './ThemeToggle';
import AuthTopRight from './AuthTopRight';
import Tooltip from './Tooltip';
import SwoopingTick from './SwoopingTick';

export default function Navbar() {
  const pathname = usePathname();
  
  // Extract locale from pathname, validate it's a real locale
  const validLocales = ['en', 'en-gb', 'de-DE', 'es-ES', 'fr-FR', 'it-IT', 'ja-JP', 'pt-PT', 'ru-RU', 'zh-CN', 'ar'];
  const pathSegments = pathname?.split('/').filter(Boolean) || [];
  const potentialLocale = pathSegments[0];
  const locale = validLocales.includes(potentialLocale) ? potentialLocale : 'en-gb';

  // Check if we're on a dashboard page
  const isDashboard = pathname?.includes('/dashboard');

  const isActive = (path: string) => pathname?.includes(path);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-[var(--chrome-border)] bg-[var(--chrome-bg)] px-4 py-3 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.35)] dark:shadow-[0_1px_0_rgba(255,255,255,0.02)]">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}`} className="flex cursor-pointer items-center gap-2 text-2xl font-bold marketing-accent-text transition-opacity hover:opacity-80">
          3YESES
          <SwoopingTick size={32} />
        </Link>
        <Tooltip text="Toggle theme">
          <ModeToggle />
        </Tooltip>
      </div>

      {/* Dashboard Navigation */}
      {isDashboard && (
        <div className="hidden md:flex items-center gap-2">
          <Link
            href={`/${locale}/dashboard/saved`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive('/saved')
                ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/15'
                : 'text-gray-600 dark:text-red-200/85 hover:bg-[var(--chrome-hover)] hover:text-gray-900 dark:hover:text-red-50'
            }`}
          >
            <SwoopingTick size={16} />
            <span className="text-sm font-medium">Saved</span>
          </Link>
          <Link
            href={`/${locale}/dashboard/history`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive('/history')
                ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/15'
                : 'text-gray-600 dark:text-red-200/85 hover:bg-[var(--chrome-hover)] hover:text-gray-900 dark:hover:text-red-50'
            }`}
          >
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">History</span>
          </Link>
        </div>
      )}

      <div className="flex items-center gap-4">
        <AuthTopRight />
      </div>
    </header>
  );
}
