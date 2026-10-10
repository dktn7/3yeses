'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, ReceiptText, ShieldAlert } from 'lucide-react';
import {
  DashboardActionCard,
  DashboardButton,
  DashboardHeader,
  DashboardPanel,
  DashboardStatRow,
  DashboardWorkspace,
  EmptyState,
} from '@/components/dashboard/DashboardPrimitives';
import { buildLocalizedPath } from '@/lib/locale-path';

export default function SubscriptionSuccessPage() {
  const locale = useLocale();
  const t = useTranslations('dashboard.subscriptionSuccess');
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError(true);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetch('/api/subscription/current', { credentials: 'include', signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('Could not check subscription');
        const subscription = await response.json();
        setError(subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING');
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [sessionId]);

  if (loading) {
    return (
      <DashboardWorkspace>
        <DashboardPanel>
          <div className="flex min-h-[20rem] flex-col items-center justify-center text-center">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-[color:var(--brand-primary)]" />
            <h1 className="text-xl font-semibold text-slate-950 dark:text-white">{t('processing')}</h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">{t('processingDescription')}</p>
          </div>
        </DashboardPanel>
      </DashboardWorkspace>
    );
  }

  if (error) {
    return (
      <DashboardWorkspace>
        <DashboardHeader
          icon={ShieldAlert}
          title={t('needsReview')}
          description={t('needsReviewDescription')}
          actions={<DashboardButton href={buildLocalizedPath(locale, '/dashboard/subscription')}>{t('backToSubscription')}</DashboardButton>}
        />
        <EmptyState
          icon={ReceiptText}
          title={t('notConfirmed')}
          description={t('notConfirmedDescription')}
          action={<DashboardButton href={buildLocalizedPath(locale, '/support/submit-ticket')} variant="secondary">{t('contactSupport')}</DashboardButton>}
        />
      </DashboardWorkspace>
    );
  }

  return (
    <DashboardWorkspace>
      <DashboardHeader
        icon={CheckCircle}
        title={t('activeTitle')}
        description={t('activeDescription')}
        actions={
          <>
            <DashboardButton href={buildLocalizedPath(locale, '/dashboard/overview')}>{t('goToDashboard')}</DashboardButton>
            <DashboardButton href={buildLocalizedPath(locale, '/dashboard/profile')} variant="secondary">{t('updateProfile')}</DashboardButton>
          </>
        }
      />

      <DashboardPanel>
        <DashboardStatRow
          items={[
            { label: t('profile'), value: t('full'), detail: t('customizationEnabled') },
            { label: t('portfolio'), value: t('open'), detail: t('mediaUploadsAvailable') },
            { label: t('discovery'), value: t('priority'), detail: t('searchRankingBenefits') },
            { label: t('billing'), value: t('active'), detail: t('ledgerUpdated') },
          ]}
        />
      </DashboardPanel>

      <DashboardActionCard
        icon={ReceiptText}
        title={t('reviewLedger')}
        description={t('ledgerDescription')}
        tone="accent"
        action={<DashboardButton href={buildLocalizedPath(locale, '/dashboard/billing')} variant="secondary">{t('openBilling')}</DashboardButton>}
      />
    </DashboardWorkspace>
  );
}
