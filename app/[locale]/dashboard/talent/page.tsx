'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import LoadingSpinner from '@/components/LoadingSpinner';
import { buildLocalizedPath, normalizeLocale } from '@/lib/locale-path';

/** Compatibility entry point for the retired opportunity-style dashboard. */
export default function TalentDashboard() {
  const router = useRouter();
  const routeLocale = useLocale();
  const locale = normalizeLocale(routeLocale || 'en-gb');

  useEffect(() => {
    router.replace(buildLocalizedPath(locale, '/dashboard/overview'));
  }, [locale, router]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <LoadingSpinner size="large" />
    </div>
  );
}
