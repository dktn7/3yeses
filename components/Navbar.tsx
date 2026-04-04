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
    <header className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center fixed top-0 left-0 right-0 h-16 z-50">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-2xl text-blue-600 dark:text-red-500 hover:opacity-80 transition-opacity cursor-pointer">
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
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <SwoopingTick size={16} />
            <span className="text-sm font-medium">Saved</span>
          </Link>
          <Link
            href={`/${locale}/dashboard/history`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive('/history')
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
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
