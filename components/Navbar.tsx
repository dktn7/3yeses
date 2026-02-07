'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
      <div className="flex items-center gap-4">
        <AuthTopRight />
      </div>
    </header>
  );
}
