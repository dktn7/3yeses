'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import LoadingSpinner from '@/components/LoadingSpinner';
import { DashboardLoading } from '@/components/dashboard/DashboardPrimitives';
import { CreditCard, Calendar, CheckCircle, XCircle, Clock, Receipt } from 'lucide-react';
import {
  DashboardButton,
  DashboardHeader,
  DashboardPage,
  DashboardPanel,
  EmptyState,
  PanelHeading,
  StatusPill,
} from '@/components/dashboard/DashboardPrimitives';
import { buildLocalizedPath } from '@/lib/locale-path';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  stripeInvoiceId?: string;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  stripeSubscriptionId?: string;
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

export default function BillingPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('dashboard.billing');
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingData = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/payments/history', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setBillingData(data);
      } else if (response.status === 401) {
        window.location.href = buildLocalizedPath(locale, '/auth/signin');
      } else {
        setError(t('failedToLoad'));
      }
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
      setError(t('errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [locale, t]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Assuming amount is in minor units (cents/pence)
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCEEDED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'REFUNDED':
        return <Receipt className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCEEDED':
        return 'text-green-700 bg-green-100 dark:bg-green-900/20 dark:text-green-300';
      case 'FAILED':
        return 'text-red-700 bg-red-100 dark:bg-red-900/20 dark:text-red-300';
      case 'PENDING':
        return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'REFUNDED':
        return 'text-blue-700 bg-blue-100 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'text-gray-700 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (loading) return <DashboardLoading />;

  if (error) {
    return (
      <DashboardPage>
        <DashboardHeader icon={CreditCard} title={t('title')} />
        <DashboardPanel>
          <p role="alert" className="text-sm font-semibold text-red-700 dark:text-red-300">{error}</p>
          <DashboardButton onClick={fetchBillingData} variant="secondary" className="mt-4">Try again</DashboardButton>
        </DashboardPanel>
      </DashboardPage>
    );
  }

  return (
    <DashboardPage>
      <DashboardHeader
        icon={CreditCard}
        title={t('title')}
        description={t('subtitle')}
        actions={
          <DashboardButton onClick={() => router.push(buildLocalizedPath(locale, '/dashboard/subscription'))}>
            {t('manageSubscription')}
          </DashboardButton>
        }
      />

      {/* Current Subscription */}
      {billingData?.subscription && (
        <DashboardPanel className="mb-6">
          <PanelHeading title={t('currentSubscription')} description="Your plan status, renewal window, and account access at a glance." />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50/80 p-4 dark:bg-slate-900/35">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{t('plan')}</p>
              <p className="mt-2 text-lg font-semibold capitalize text-slate-950 dark:text-white">
                {billingData.subscription.plan.toLowerCase()}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50/80 p-4 dark:bg-slate-900/35">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{t('status')}</p>
              <div className="mt-2">
                <StatusPill tone={billingData.subscription.status === 'ACTIVE' ? 'success' : 'brand'}>
                {billingData.subscription.status.toLowerCase()}
                </StatusPill>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50/80 p-4 dark:bg-slate-900/35">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{t('currentPeriod')}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-950 dark:text-white">
                {billingData.subscription.currentPeriodStart && billingData.subscription.currentPeriodEnd
                  ? `${formatDate(billingData.subscription.currentPeriodStart.toString())} - ${formatDate(billingData.subscription.currentPeriodEnd.toString())}`
                  : t('na')
                }
              </p>
            </div>
          </div>

        </DashboardPanel>
      )}

      {/* Payment History */}
      <DashboardPanel>
        <PanelHeading title={t('paymentHistory')} description="Receipts and payment attempts listed from newest to oldest." />

        {billingData?.payments && billingData.payments.length > 0 ? (
          <div className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
            {billingData.payments.map((payment) => (
              <div key={payment.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900">
                    {getStatusIcon(payment.status)}
                  </span>
                  <div>
                    <p className="font-mono text-lg font-semibold text-slate-950 dark:text-white">
                      {formatCurrency(payment.amount, payment.currency)}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      {formatDate(payment.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                    {payment.status.toLowerCase()}
                  </span>
                  {payment.stripeInvoiceId && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('invoice')} {payment.stripeInvoiceId}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {billingData.pagination.pages > 1 && (
              <div className="flex justify-center mt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('showingPage', { page: billingData.pagination.page, pages: billingData.pagination.pages, total: billingData.pagination.total })}
                </p>
              </div>
            )}
          </div>
        ) : (
          <EmptyState icon={Receipt} title={t('noPaymentHistory')} />
        )}
      </DashboardPanel>
    </DashboardPage>
  );
}


