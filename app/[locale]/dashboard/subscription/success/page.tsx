'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
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
            <h1 className="text-xl font-semibold text-slate-950 dark:text-white">Processing your subscription</h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">We are confirming the checkout session and updating your account access.</p>
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
          title="Subscription needs review"
          description="We could not verify this checkout session. If you were charged, contact support and include your account email."
          actions={<DashboardButton href={buildLocalizedPath(locale, '/dashboard/subscription')}>Back to subscription</DashboardButton>}
        />
        <EmptyState
          icon={ReceiptText}
          title="Your subscription isn’t confirmed yet"
          description="Payment updates can take a moment. Check your subscription status before trying another payment."
          action={<DashboardButton href={buildLocalizedPath(locale, '/support/submit-ticket')} variant="secondary">Contact support</DashboardButton>}
        />
      </DashboardWorkspace>
    );
  }

  return (
    <DashboardWorkspace>
      <DashboardHeader
        icon={CheckCircle}
        title="Standard Access is active"
        description="Your subscription has been activated. Use the dashboard to finish your profile, publish media, and track discovery."
        actions={
          <>
            <DashboardButton href={buildLocalizedPath(locale, '/dashboard/overview')}>Go to dashboard</DashboardButton>
            <DashboardButton href={buildLocalizedPath(locale, '/dashboard/profile')} variant="secondary">Update profile</DashboardButton>
          </>
        }
      />

      <DashboardPanel>
        <DashboardStatRow
          items={[
            { label: 'Profile', value: 'Full', detail: 'Customization enabled' },
            { label: 'Portfolio', value: 'Open', detail: 'Media uploads available' },
            { label: 'Discovery', value: 'Priority', detail: 'Search ranking benefits' },
            { label: 'Billing', value: 'Active', detail: 'Ledger updated by Stripe' },
          ]}
        />
      </DashboardPanel>

      <DashboardActionCard
        icon={ReceiptText}
        title="Review your billing ledger"
        description="Payment history and subscription status live in the billing workspace, with receipts listed from newest to oldest."
        tone="accent"
        action={<DashboardButton href={buildLocalizedPath(locale, '/dashboard/billing')} variant="secondary">Open billing</DashboardButton>}
      />
    </DashboardWorkspace>
  );
}
