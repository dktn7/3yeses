'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { DashboardWorkspace, DashboardHeader, DashboardButton, DashboardLoadError } from '@/components/dashboard/DashboardPrimitives';

interface PricingPlan {
  id: string;
  name: string;
  duration: string;
  durationLabel: string;
  price: number;
  priceDisplay: string;
  features: string[];
}

export default function SubscriptionPage() {
  const t = useTranslations('DashboardSubscriptionPage');
  const locale = useLocale();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadError(false);
    try {
      // Fetch plans
      const plansRes = await fetch('/api/subscription/plans');
      if (!plansRes.ok) throw new Error('Plans unavailable');
      const plansData = await plansRes.json();
      setPlans(plansData.plans || []);

      // Fetch current subscription
      const subRes = await fetch('/api/subscription/current', {
        credentials: 'include',
      });
      const subData = await subRes.json();
      if (!subRes.ok) throw new Error('Subscription unavailable');
      setCurrentSubscription(subData);
    } catch (error) {
      setLoadError(true);
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (duration: string) => {
    setSubscribing(duration);
    try {
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ duration }),
      });

      const data = await response.json();
      
      if (response.ok && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error(t('errors.missingCheckoutUrl'));
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      setNotice(t('errors.createSubscription'));
      setSubscribing(null);
    }
  };

  const handleCancel = async () => {
    setCanceling(true);
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setNotice(t('cancelSuccess'));
        setConfirmCancel(false);
        fetchData();
      } else {
        throw new Error(t('errors.cancelSubscription'));
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      setNotice(t('errors.cancelSubscription'));
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const isSubscribed = currentSubscription?.plan === 'STANDARD' && 
                       currentSubscription?.status === 'ACTIVE';

  return (
    <DashboardWorkspace>
      <DashboardHeader title={t('title')} description="Choose your plan and manage your membership." />
      {loadError && <DashboardLoadError onRetry={fetchData} />}
      {notice && <p role="status" className="rounded-xl border border-slate-300 p-4 text-sm dark:border-slate-700">{notice}</p>}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          {isSubscribed && (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-green-400 font-medium">
                {t('activeBanner')}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                {t('validUntil')}: {currentSubscription.currentPeriodEnd || currentSubscription.endDate ? new Date(currentSubscription.currentPeriodEnd || currentSubscription.endDate).toLocaleDateString(locale) : '—'}
              </p>
              <button
                onClick={() => setConfirmCancel(true)}
                className="mt-3 text-red-400 hover:text-red-300 text-sm underline"
              >
                {t('cancelSubscription')}
              </button>
              {confirmCancel && <div className="mt-4 space-y-3 text-sm"><p>{t('confirmCancel')}</p><div className="flex flex-wrap justify-center gap-2"><DashboardButton variant="danger" onClick={handleCancel} disabled={canceling}>{canceling ? t('processing') : t('cancelSubscription')}</DashboardButton><DashboardButton variant="secondary" onClick={() => setConfirmCancel(false)} disabled={canceling}>Keep subscription</DashboardButton></div></div>}
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
            {t('forTalents')}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="dashboard-surface flex flex-col p-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-blue-600 dark:text-red-300">
                    {plan.priceDisplay}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    / {plan.durationLabel}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(plan.duration)}
                disabled={subscribing !== null || isSubscribed}
                className="mt-auto w-full bg-primary-blue dark:bg-accent-red hover:bg-primary-blueHover dark:hover:bg-accent-red/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {subscribing === plan.duration ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('processing')}
                  </>
                ) : isSubscribed ? (
                  t('currentPlan')
                ) : (
                  t('subscribe')
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>{t('securePayment')}</p>
          <p className="mt-2">
            {t('questions')} support@3yeses.online
          </p>
        </div>
      </div>
    </DashboardWorkspace>
  );
}
