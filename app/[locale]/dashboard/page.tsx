'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import LoadingSpinner from '@/components/LoadingSpinner';
import { buildLocalizedPath } from '@/lib/locale-path';

export default function DashboardPage() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    // Redirect to overview page
    router.replace(buildLocalizedPath(locale, '/dashboard/overview'));
  }, [locale, router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner />
    </div>
  );
}
