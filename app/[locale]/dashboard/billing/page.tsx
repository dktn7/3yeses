'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Receipt,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import {
  DashboardButton,
  DashboardHeader,
  DashboardLoading,
  DashboardPanel,
  DashboardWorkspace,
  EmptyState,
  PanelHeading,
  StatusPill,
} from '@/components/dashboard/DashboardPrimitives';
import { InvoiceDownloadButton } from '@/components/dashboard/InvoiceDownloadButton';
import { BillingPortalButton } from '@/components/dashboard/BillingPortalButton';
import { buildLocalizedPath } from '@/lib/locale-path';

type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  stripeInvoiceId?: string | null;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAt?: string | null;
}

interface BillingData {
  payments: Payment[];
  subscription: Subscription | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const statusTone: Record<PaymentStatus, 'success' | 'danger' | 'warning' | 'brand'> = {
  SUCCEEDED: 'success',
  FAILED: 'danger',
  PENDING: 'warning',
  REFUNDED: 'brand',
};

function formatStatus(status: string) {
  return status.replaceAll('_', ' ').toLowerCase();
}

function PaymentStatusIcon({ status }: { status: PaymentStatus }) {
  const className = 'h-5 w-5';

  if (status === 'SUCCEEDED') return <CheckCircle2 className={`${className} text-emerald-600 dark:text-emerald-300`} aria-hidden="true" />;
  if (status === 'FAILED') return <XCircle className={`${className} text-red-600 dark:text-red-300`} aria-hidden="true" />;
  if (status === 'REFUNDED') return <RotateCcw className={`${className} text-[color:var(--brand-primary)]`} aria-hidden="true" />;
  return <Clock3 className={`${className} text-amber-600 dark:text-amber-300`} aria-hidden="true" />;
}

export default function BillingPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('dashboard.billing');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingData = useCallback(async (requestedPage: number, signal?: AbortSignal) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/payments/history?page=${requestedPage}&limit=10`, {
        credentials: 'include',
        signal,
      });

      if (response.ok) {
        const data: BillingData = await response.json();
        setBillingData(data);
      } else if (response.status === 401) {
        window.location.href = buildLocalizedPath(locale, '/auth/signin');
      } else {
        setError(t('failedToLoad'));
      }
    } catch (fetchError) {
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') return;
      console.error('Failed to fetch billing data:', fetchError);
      setError(t('errorLoading'));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [locale, t]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchBillingData(page, controller.signal);
    return () => controller.abort();
  }, [fetchBillingData, page]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) return <DashboardLoading />;

  if (error) {
    return (
      <DashboardWorkspace>
        <DashboardHeader icon={Receipt} title={t('title')} description={t('description')} />
        <DashboardPanel>
          <div className="flex items-start gap-4" role="alert">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300">
              <XCircle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">{error}</p>
              <DashboardButton onClick={() => void fetchBillingData(page)} variant="secondary" className="mt-4">
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Try again
              </DashboardButton>
            </div>
          </div>
        </DashboardPanel>
      </DashboardWorkspace>
    );
  }

  const subscription = billingData?.subscription;
  const paymentCount = billingData?.pagination.total ?? 0;
  const isEnding = Boolean(subscription?.cancelAt);

  return (
    <DashboardWorkspace>
      <DashboardHeader
        icon={Receipt}
        title={t('title')}
        description={t('description')}
          actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <BillingPortalButton label={t('updatePaymentDetails')} />
            <DashboardButton onClick={() => router.push(buildLocalizedPath(locale, '/dashboard/subscription'))}>
              {t('manageSubscription')}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </DashboardButton>
          </div>
          }
      />

      <DashboardPanel className="overflow-hidden">
        <PanelHeading
          title={t('currentSubscription')}
          description={t('currentDescription')}
        />

        {subscription ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] lg:items-stretch">
            <div className="relative overflow-hidden rounded-2xl bg-[color:var(--brand-primary)] px-5 py-6 text-white sm:px-7 sm:py-7">
              <div className="relative flex h-full flex-col justify-between gap-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{t('accountAccess')}</p>
                    <p className="mt-3 text-2xl font-semibold capitalize tracking-tight sm:text-3xl">
                      {formatStatus(subscription.plan)}
                    </p>
                  </div>
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-inset ring-white/15">
                    <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium text-white/70">{isEnding ? t('accessUntil') : t('currentAccessPeriod')}</p>
                  <p className="mt-1 text-base font-semibold">
                    {subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : t('na')}
                  </p>
                </div>
              </div>
            </div>

            <dl className="divide-y divide-slate-200/70 rounded-2xl bg-slate-50/70 px-5 dark:divide-slate-800/70 dark:bg-slate-950/35">
              <div className="flex items-center justify-between gap-4 py-5">
                <dt className="text-sm text-slate-500 dark:text-slate-400">{t('status')}</dt>
                <dd>
                  <StatusPill tone={isEnding ? 'warning' : subscription.status === 'ACTIVE' ? 'success' : 'brand'}>
                    {isEnding ? t('endingThisPeriod') : formatStatus(subscription.status)}
                  </StatusPill>
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-5">
                <dt className="text-sm text-slate-500 dark:text-slate-400">{t('currentPeriod')}</dt>
                <dd className="text-right text-sm font-semibold leading-6 text-slate-950 dark:text-white">
                  {subscription.currentPeriodStart && subscription.currentPeriodEnd ? (
                    <>
                      <span className="block">{formatDate(subscription.currentPeriodStart)}</span>
                      <span className="block text-slate-400 dark:text-slate-500">{t('to')}</span>
                      <span className="block">{formatDate(subscription.currentPeriodEnd)}</span>
                    </>
                  ) : t('na')}
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <EmptyState
            icon={ShieldCheck}
            title={t('noPaidAccess')}
            description={t('noPaidAccessDescription')}
            action={(
              <DashboardButton onClick={() => router.push(buildLocalizedPath(locale, '/dashboard/subscription'))} variant="secondary">
                {t('viewAccessOptions')}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </DashboardButton>
            )}
          />
        )}
      </DashboardPanel>

      <DashboardPanel>
        <PanelHeading
          title={t('paymentHistory')}
          description={t('historyDescription')}
          actions={
            <span className="text-sm font-semibold tabular-nums text-slate-500 dark:text-slate-400">
              {paymentCount} {paymentCount === 1 ? t('payment') : t('payments')}
            </span>
          }
        />

        {billingData?.payments.length ? (
          <>
            <ol className="divide-y divide-slate-200/70 dark:divide-slate-800/70" aria-label={t('paymentHistory')}>
              {billingData.payments.map((payment) => (
                <li key={payment.id} className="grid gap-4 py-5 first:pt-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900">
                      <PaymentStatusIcon status={payment.status} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-lg font-semibold tabular-nums text-slate-950 dark:text-white">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <time dateTime={payment.createdAt}>{formatDate(payment.createdAt)}</time>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pl-[3.75rem] sm:block sm:pl-0 sm:text-right">
                    <StatusPill tone={statusTone[payment.status]}>{formatStatus(payment.status)}</StatusPill>
                    {payment.stripeInvoiceId && (
                      <div className="mt-2 flex items-center justify-end gap-3">
                        <p className="hidden truncate font-mono text-[11px] text-slate-500 dark:text-slate-400 sm:block sm:max-w-56" title={payment.stripeInvoiceId}>
                          {t('invoice')} {payment.stripeInvoiceId}
                        </p>
                        <InvoiceDownloadButton paymentId={payment.id} invoiceId={payment.stripeInvoiceId} label={t('downloadInvoice')} />
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            {billingData.pagination.pages > 1 && (
              <nav className="mt-2 flex flex-col gap-3 border-t border-slate-200/70 pt-5 dark:border-slate-800/70 sm:flex-row sm:items-center sm:justify-between" aria-label="Payment history pages">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('showingPage', {
                    page: billingData.pagination.page,
                    pages: billingData.pagination.pages,
                    total: billingData.pagination.total,
                  })}
                </p>
                <div className="flex gap-2">
                  <DashboardButton
                    variant="secondary"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={billingData.pagination.page <= 1}
                    aria-label="Previous payment page"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    Previous
                  </DashboardButton>
                  <DashboardButton
                    variant="secondary"
                    onClick={() => setPage((current) => Math.min(billingData.pagination.pages, current + 1))}
                    disabled={billingData.pagination.page >= billingData.pagination.pages}
                    aria-label="Next payment page"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </DashboardButton>
                </div>
              </nav>
            )}
          </>
        ) : (
          <EmptyState
            icon={Receipt}
            title="No payment activity yet"
            description="Nothing has been charged to this account. Completed, pending, failed, or refunded payments will appear here when recorded."
            action={!subscription ? (
              <DashboardButton onClick={() => router.push(buildLocalizedPath(locale, '/dashboard/subscription'))} variant="secondary">
                Review access options
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </DashboardButton>
            ) : undefined}
          />
        )}
      </DashboardPanel>
    </DashboardWorkspace>
  );
}
