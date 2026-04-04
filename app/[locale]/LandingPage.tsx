'use client';

import LandingClient from '@/components/LandingClient';
import { useTranslations } from 'next-intl';

export default function LandingPage({ locale }: { locale: string }) {
  const t = useTranslations('Home');

  return (
    <div className="landing-bg brand-true-red">
      <LandingClient t={t} locale={locale} />
    </div>
  );
}