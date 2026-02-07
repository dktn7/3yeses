'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SwoopingTick from './SwoopingTick';

export default function DynamicHeader() {
  const pathname = usePathname();
  
  // Extract locale from pathname, validate it's a real locale
  const validLocales = ['en', 'en-gb', 'de-DE', 'es-ES', 'fr-FR', 'it-IT', 'ja-JP', 'pt-PT', 'ru-RU', 'zh-CN', 'ar'];
  const pathSegments = pathname.split('/').filter(Boolean);
  const potentialLocale = pathSegments[0];
  const locale = validLocales.includes(potentialLocale) ? potentialLocale : 'en-gb';
  
  // Construct home URL with proper locale
  const homeUrl = `/${locale}`;

  return (
    <Link href={homeUrl} className="flex items-center gap-2 font-bold text-2xl text-blue-600 dark:text-red-500 hover:opacity-80 transition-opacity cursor-pointer">
      3YESES
      <SwoopingTick size={32} />
    </Link>
  );
}