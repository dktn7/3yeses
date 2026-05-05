'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LoadingSpinner from '@/components/LoadingSpinner';
import { CreditCard, Calendar, CheckCircle, XCircle, Clock, Receipt } from 'lucide-react';

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
  const t = useTranslations('dashboard.billing');
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingData = useCallback(async () => {
    try {
      const response = await fetch('/api/payments/history', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setBillingData(data);
      } else if (response.status === 401) {
        window.location.href = '/auth/signin';
      } else {
        setError(t('failedToLoad'));
      }
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
      setError(t('errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [t]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('subtitle')}
        </p>
      </div>

      {/* Current Subscription */}
      {billingData?.subscription && (
        <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {t('currentSubscription')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('plan')}</p>
              <p className="font-semibold text-gray-900 dark:text-white capitalize">
                {billingData.subscription.plan.toLowerCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('status')}</p>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(billingData.subscription.status)}`}>
                {billingData.subscription.status.toLowerCase()}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('currentPeriod')}</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {billingData.subscription.currentPeriodStart && billingData.subscription.currentPeriodEnd
                  ? `${formatDate(billingData.subscription.currentPeriodStart.toString())} - ${formatDate(billingData.subscription.currentPeriodEnd.toString())}`
                  : t('na')
                }
              </p>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={() => router.push('/dashboard/subscription')}
              className="px-4 py-2 bg-primary-blue dark:bg-accent-red text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              {t('manageSubscription')}
            </button>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          {t('paymentHistory')}
        </h2>

        {billingData?.payments && billingData.payments.length > 0 ? (
          <div className="space-y-4">
            {billingData.payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                  {getStatusIcon(payment.status)}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(payment.amount, payment.currency)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(payment.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
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
          <div className="text-center py-8">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{t('noPaymentHistory')}</p>
          </div>
        )}
      </div>
    </div>
  );
}