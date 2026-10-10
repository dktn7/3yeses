'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarDays, Check, CreditCard, Loader2, Receipt, ShieldCheck, Sparkles } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  DashboardButton,
  DashboardHeader,
  DashboardLoading,
  DashboardLoadError,
  DashboardPanel,
  DashboardWorkspace,
  EmptyState,
  PanelHeading,
  StatusPill,
} from '@/components/dashboard/DashboardPrimitives';
import { buildLocalizedPath } from '@/lib/locale-path';
import { BillingPortalButton } from '@/components/dashboard/BillingPortalButton';

interface PricingPlan {
  id: string;
  name: string;
  duration: string;
  durationLabel: string;
  price: number;
  priceDisplay: string;
  features: string[];
}

interface CurrentSubscription {
  plan: string | null;
  status: string;
  currentPeriodEnd?: string | null;
  endDate?: string | null;
  cancelAt?: string | null;
}

interface Notice {
  message: string;
  tone: 'success' | 'error';
}

function durationInMonths(duration: string) {
  const match = duration.match(/^(\d+)_months$/);
  return match ? Number(match[1]) : null;
}

export default function SubscriptionPage() {
  const t = useTranslations('DashboardSubscriptionPage');
  const billingT = useTranslations('dashboard.billing');
  const locale = useLocale();
  const requestRef = useRef<AbortController | null>(null);
  const cancelConfirmationRef = useRef<HTMLDivElement | null>(null);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [selectedDuration, setSelectedDuration] = useState('');
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [showExtensionOptions, setShowExtensionOptions] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const fetchData = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setLoadError(false);
    setLoading(true);

    try {
      const [plansRes, subRes] = await Promise.all([
        fetch('/api/subscription/plans', { signal: controller.signal }),
        fetch('/api/subscription/current', {
          credentials: 'include',
          signal: controller.signal,
        }),
      ]);

      if (!plansRes.ok) throw new Error('Plans unavailable');
      if (!subRes.ok) throw new Error('Subscription unavailable');

      const plansData: { plans?: PricingPlan[] } = await plansRes.json();
      const subData: CurrentSubscription = await subRes.json();
      const availablePlans = plansData.plans ?? [];

      setPlans(availablePlans);
      setSelectedDuration((current) => (
        availablePlans.some((plan) => plan.duration === current)
          ? current
          : availablePlans[0]?.duration ?? ''
      ));
      setCurrentSubscription(subData);
    } catch (fetchError) {
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') return;
      setLoadError(true);
      console.error('Error fetching subscription data:', fetchError);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
    return () => requestRef.current?.abort();
  }, [fetchData]);

  useEffect(() => {
    if (confirmCancel) cancelConfirmationRef.current?.focus();
  }, [confirmCancel]);

  const handleSubscribe = async (duration: string) => {
    setSubscribing(duration);
    setNotice(null);

    try {
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ duration, locale }),
      });

      const data: { url?: string } = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error(t('errors.missingCheckoutUrl'));
    } catch (checkoutError) {
      console.error('Error creating subscription:', checkoutError);
      setNotice({ message: t('errors.createSubscription'), tone: 'error' });
      setSubscribing(null);
    }
  };

  const handleCancel = async () => {
    setCanceling(true);
    setNotice(null);

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        credentials: 'include',
      });
      const data: { message?: string } = await response.json();

      if (!response.ok) throw new Error(t('errors.cancelSubscription'));

      setNotice({ message: data.message ?? t('cancelSuccess'), tone: 'success' });
      setConfirmCancel(false);
      await fetchData();
    } catch (cancelError) {
      console.error('Error canceling subscription:', cancelError);
      setNotice({ message: t('errors.cancelSubscription'), tone: 'error' });
    } finally {
      setCanceling(false);
    }
  };

  if (loading) return <DashboardLoading />;

  if (loadError) {
    return (
      <DashboardWorkspace>
        <DashboardHeader icon={CreditCard} title={t('title')} description="Choose an access duration or manage your current subscription." />
        <DashboardLoadError onRetry={() => void fetchData()} />
      </DashboardWorkspace>
    );
  }

  const hasActiveAccess = currentSubscription?.plan === 'STANDARD'
    && ['ACTIVE', 'TRIALING'].includes(currentSubscription.status);
  const cancellationScheduled = Boolean(currentSubscription?.cancelAt);
  const accessEnd = currentSubscription?.currentPeriodEnd ?? currentSubscription?.endDate ?? null;
  const selectedPlan = plans.find((plan) => plan.duration === selectedDuration) ?? plans[0];
  const selectedMonths = selectedPlan ? durationInMonths(selectedPlan.duration) : null;
  const monthlyEquivalent = selectedPlan && selectedMonths
    ? new Intl.NumberFormat(locale, { style: 'currency', currency: 'GBP' }).format((selectedPlan.price / 100) / selectedMonths)
    : null;

  return (
    <DashboardWorkspace>
      <DashboardHeader
        icon={Sparkles}
        title={t('title')}
        description="Choose how long you want your profile and media presence to stay active, or manage the access already on this account."
      />

      {notice && (
        <div
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={notice.tone === 'error'
            ? 'rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200'
            : 'rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200'}
        >
          {notice.message}
        </div>
      )}

      {hasActiveAccess ? (
        <>
        <DashboardPanel className="overflow-hidden">
          <PanelHeading
            title={t('activeBanner')}
            description="Your account currently has Standard Access."
            actions={(
              <div className="flex flex-wrap items-center justify-end gap-3">
                <StatusPill tone={cancellationScheduled ? 'warning' : 'success'}>{cancellationScheduled ? 'ending this period' : currentSubscription.status.toLowerCase()}</StatusPill>
                <DashboardButton variant="secondary" onClick={() => setShowExtensionOptions((current) => !current)}>
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {showExtensionOptions ? t('closeExtension') : t('extendAccess')}
                </DashboardButton>
              </div>
            )}
          />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <div className="rounded-2xl bg-[color:var(--brand-primary)] px-5 py-6 text-white sm:px-7 sm:py-7">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Account access</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Standard Access</h2>
                </div>
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-inset ring-white/15">
                  <ShieldCheck className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>

              <div className="mt-10 border-t border-white/15 pt-5">
                <p className="text-sm text-white/70">{cancellationScheduled ? 'Access remains available until' : t('validUntil')}</p>
                <p className="mt-1 font-semibold">
                  {accessEnd ? new Date(accessEnd).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6 rounded-2xl bg-slate-50/70 p-5 dark:bg-slate-950/35 sm:p-6">
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                  {cancellationScheduled ? 'Cancellation scheduled' : 'Manage this subscription'}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {cancellationScheduled
                    ? 'Stripe will end this subscription after the paid-through date shown here.'
                    : 'Cancellation keeps access available until the end of the current billing period.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <BillingPortalButton label={billingT('updatePaymentDetails')} />
                <DashboardButton href={buildLocalizedPath(locale, '/dashboard/billing')} variant="secondary">
                  <Receipt className="h-4 w-4" aria-hidden="true" />
                  {billingT('paymentHistory')}
                </DashboardButton>
                {!cancellationScheduled && (
                  <DashboardButton
                    variant="ghost"
                    onClick={() => setConfirmCancel(true)}
                    disabled={canceling}
                    aria-label={t('cancelSubscription')}
                    className="text-red-700 hover:bg-red-50 hover:text-red-800 dark:text-red-300 dark:hover:bg-red-950/30 dark:hover:text-red-200"
                  >
                    {t('cancelSubscription')}
                  </DashboardButton>
                )}
              </div>

              {confirmCancel && !cancellationScheduled && (
                <div
                  ref={cancelConfirmationRef}
                  id="cancel-subscription-confirmation"
                  role="alertdialog"
                  aria-labelledby="cancel-subscription-title"
                  tabIndex={-1}
                  className="rounded-xl border border-red-200 bg-red-50 p-4 outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:border-red-900 dark:bg-red-950/30"
                >
                  <p id="cancel-subscription-title" className="text-sm font-semibold text-red-900 dark:text-red-100">{t('confirmCancel')}</p>
                  <p className="mt-1 text-sm leading-6 text-red-800/80 dark:text-red-200/80">
                    Access continues until the current paid period ends.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <DashboardButton variant="danger" onClick={() => void handleCancel()} disabled={canceling}>
                      {canceling && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                      {canceling ? t('processing') : t('cancelSubscription')}
                    </DashboardButton>
                    <DashboardButton variant="secondary" onClick={() => setConfirmCancel(false)} disabled={canceling}>
                      Keep subscription
                    </DashboardButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DashboardPanel>
        {showExtensionOptions && (
          <DashboardPanel>
            <PanelHeading
              title={t('extensionTitle')}
              description={t('extensionDescription')}
            />
            <div className="grid gap-4 md:grid-cols-2">
              {plans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/35">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{plan.durationLabel}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{plan.priceDisplay}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('extensionNote')}</p>
                  </div>
                  <DashboardButton onClick={() => void handleSubscribe(plan.duration)} disabled={subscribing !== null}>
                    {subscribing === plan.duration && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                    {subscribing === plan.duration ? t('processing') : t('extendWithStripe')}
                  </DashboardButton>
                </div>
              ))}
            </div>
          </DashboardPanel>
        )}
        </>
      ) : plans.length > 0 && selectedPlan ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)] lg:items-start">
          <DashboardPanel>
            <PanelHeading
              title={t('forTalents')}
              description="Standard Access has the same included features at either duration. Choose how long you want access for."
            />

            <fieldset className="space-y-3">
              <legend className="sr-only">Choose an access duration</legend>
              {plans.map((plan) => {
                const selected = plan.duration === selectedPlan.duration;
                const months = durationInMonths(plan.duration);
                const equivalent = months
                  ? new Intl.NumberFormat(locale, { style: 'currency', currency: 'GBP' }).format((plan.price / 100) / months)
                  : null;

                return (
                  <label
                    key={plan.id}
                    className={`group block cursor-pointer rounded-2xl border p-4 transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] focus-within:ring-2 focus-within:ring-[color:var(--brand-ring)] sm:p-5 ${selected
                      ? 'border-[color:var(--brand-primary)] bg-[color:var(--brand-primary)]/5 shadow-[0_18px_35px_-28px_rgba(var(--brand-primary-rgb),0.8)]'
                      : 'border-slate-200 bg-slate-50/55 hover:-translate-y-0.5 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/35 dark:hover:border-slate-700'}`}
                  >
                    <input
                      type="radio"
                      name="subscription-duration"
                      value={plan.duration}
                      checked={selected}
                      onChange={() => setSelectedDuration(plan.duration)}
                      className="sr-only"
                    />
                    <span className="flex items-start justify-between gap-5">
                      <span>
                        <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{plan.durationLabel}</span>
                        <span className="mt-2 block text-lg font-semibold text-slate-950 dark:text-white">{plan.name}</span>
                        {equivalent && <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">{equivalent} per month equivalent</span>}
                      </span>
                      <span className="text-right">
                        <span className="block text-2xl font-semibold tabular-nums text-[color:var(--brand-primary)]">{plan.priceDisplay}</span>
                        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">total</span>
                      </span>
                    </span>
                    <span className="mt-4 flex items-center gap-2 text-xs font-semibold text-[color:var(--brand-primary)]">
                      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${selected ? 'border-[color:var(--brand-primary)] bg-[color:var(--brand-primary)] text-white' : 'border-slate-300 dark:border-slate-700'}`}>
                        {selected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                      </span>
                      {selected ? 'Selected duration' : 'Select duration'}
                    </span>
                  </label>
                );
              })}
            </fieldset>
          </DashboardPanel>

          <DashboardPanel className="lg:sticky lg:top-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Your selection</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">{selectedPlan.name}</h2>
              </div>
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--brand-primary)]/10 text-[color:var(--brand-primary)]">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>

            <div className="mt-6 flex items-end justify-between gap-4 border-y border-slate-200/70 py-5 dark:border-slate-800/70">
              <div>
                <p className="text-3xl font-semibold tabular-nums tracking-tight text-slate-950 dark:text-white">{selectedPlan.priceDisplay}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">for {selectedPlan.durationLabel}</p>
              </div>
              {monthlyEquivalent && <p className="text-right text-sm font-medium text-slate-600 dark:text-slate-300">{monthlyEquivalent}<br /><span className="text-xs text-slate-400">per month equivalent</span></p>}
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Included</p>
              <ul className="mt-4 space-y-3">
                {selectedPlan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <DashboardButton
              onClick={() => void handleSubscribe(selectedPlan.duration)}
              disabled={subscribing !== null}
              className="mt-7 w-full"
              aria-label={`${t('subscribe')}: ${selectedPlan.priceDisplay} for ${selectedPlan.durationLabel}`}
            >
              {subscribing === selectedPlan.duration && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {subscribing === selectedPlan.duration ? t('processing') : t('subscribe')}
            </DashboardButton>

            <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
              <CreditCard className="h-4 w-4 shrink-0" aria-hidden="true" />
              {t('securePayment')}
            </p>
          </DashboardPanel>
        </div>
      ) : (
        <DashboardPanel>
          <EmptyState
            icon={CalendarDays}
            title="No subscription plans are available"
            description="There is no access duration available to purchase right now."
          />
        </DashboardPanel>
      )}

      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        {t('questions')} <a href="mailto:support@3yeses.online" className="font-semibold text-[color:var(--brand-primary)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-ring)]">support@3yeses.online</a>
      </p>
    </DashboardWorkspace>
  );
}
