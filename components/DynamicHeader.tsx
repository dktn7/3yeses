'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SwoopingTick from './SwoopingTick';
import { buildLocalizedPath, getLocaleFromPathname } from '@/lib/locale-path';

export default function DynamicHeader() {
  const pathname = usePathname();
  
  const locale = getLocaleFromPathname(pathname);
  const homeUrl = buildLocalizedPath(locale, '/');

  return (
      <Link href={homeUrl} className="flex items-center gap-2 font-bold text-2xl text-[var(--brand-primary)] dark:text-[var(--brand-primary)] hover:opacity-80 transition-opacity cursor-pointer">
      3YESES
      <SwoopingTick size={32} />
    </Link>
  );
}
