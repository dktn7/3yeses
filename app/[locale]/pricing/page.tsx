'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Check, Loader2, Shield, TrendingUp, Image as ImageIcon, UserCheck, Calendar, Crown } from 'lucide-react';
import SwoopingTick from '@/components/SwoopingTick';
import Breadcrumbs from '@/components/Breadcrumbs';

// ── Plan icon config ──────────────────────────────────────────────────────────
const PLAN_ICONS = {
  '6_months': Calendar,
  '12_months': Crown,
} as const;

function BgDecorations() {
  return (
    <div className="marketing-wave-tone-commercial absolute inset-0 z-0 overflow-hidden pointer-events-none select-none dark:opacity-90" aria-hidden="true">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="pricingGlowOne" cx="18%" cy="12%" r="58%">
            <stop offset="0%" stopColor="var(--wave-veil, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-bg-strong)" />
            <stop offset="70%" stopColor="var(--wave-primary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-bg-soft)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="pricingGlowTwo" cx="82%" cy="78%" r="54%">
            <stop offset="0%" stopColor="var(--wave-secondary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-bg-strong)" />
            <stop offset="72%" stopColor="var(--wave-veil, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-bg-soft)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id="pricingWaveBase" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--wave-primary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-main-soft)" />
            <stop offset="48%" stopColor="var(--wave-secondary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-main-strong)" />
            <stop offset="100%" stopColor="var(--wave-primary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-main-soft)" />
          </linearGradient>
          <linearGradient id="pricingWaveMid" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--wave-secondary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-secondary-strong)" />
            <stop offset="100%" stopColor="var(--wave-primary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-secondary-soft)" />
          </linearGradient>
          <linearGradient id="pricingWaveLine" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--wave-primary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-main-strong)" />
            <stop offset="100%" stopColor="var(--wave-secondary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-main-soft)" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#pricingGlowOne)" />
        <rect width="100%" height="100%" fill="url(#pricingGlowTwo)" />
        <path d="M-80 670 C120 590 300 700 510 644 C700 595 850 650 1040 616 C1200 590 1320 612 1520 560 L1520 920 L-80 920 Z" fill="url(#pricingWaveBase)" />
        <path d="M-120 748 C110 680 320 790 540 732 C760 676 930 770 1140 712 C1285 672 1400 692 1560 650 L1560 920 L-120 920 Z" fill="url(#pricingWaveMid)" />
        <path d="M-40 788 C220 744 430 822 660 792 C890 760 1080 820 1320 782 C1410 768 1480 760 1560 748 L1560 920 L-40 920 Z" fill="var(--wave-secondary, var(--marketing-wave-accent))" opacity="var(--marketing-wave-secondary-soft)" />
        <path d="M0 92 C200 48 420 106 640 72 C880 34 1090 88 1280 66 C1350 58 1406 50 1440 48 L1440 0 L0 0 Z" fill="url(#pricingWaveLine)" opacity="var(--marketing-wave-main-strong)" />
        <path d="M0 120 C280 160 560 84 840 128 C1060 162 1240 124 1440 138 L1440 0 L0 0 Z" fill="var(--wave-primary, var(--marketing-wave-accent))" opacity="var(--marketing-wave-top-opacity)" />
        <g opacity="var(--marketing-wave-orb-opacity)">
          <circle cx="120" cy="200" r="2.5" fill="var(--wave-orb, var(--marketing-wave-accent))" />
          <circle cx="200" cy="150" r="1.8" fill="var(--wave-secondary, var(--marketing-wave-accent))" />
          <circle cx="310" cy="230" r="2.2" fill="var(--wave-orb, var(--marketing-wave-accent))" />
          <circle cx="1180" cy="190" r="2.6" fill="var(--wave-secondary, var(--marketing-wave-accent))" />
          <circle cx="1290" cy="250" r="1.7" fill="var(--wave-orb, var(--marketing-wave-accent))" />
          <circle cx="1360" cy="175" r="2.1" fill="var(--wave-secondary, var(--marketing-wave-accent))" />
        </g>
      </svg>
    </div>
  );
}

export default function PricingPage() {
  const t = useTranslations('PricingPage');
  const tNav = useTranslations('Navigation');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan');
  const locale = pathname.split('/').filter(Boolean)[0] || 'en-gb';

  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasActiveSub, setHasActiveSub] = useState(false);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const PLANS = [
    {
      id: '6_months' as const,
      label: t('plans.sixMonths.label'),
      price: t('plans.sixMonths.price'),
      period: t('plans.sixMonths.period'),
      subtext: t('plans.sixMonths.subtext'),
      description: t('plans.sixMonths.description'),
      badge: null,
    },
    {
      id: '12_months' as const,
      label: t('plans.twelveMonths.label'),
      price: t('plans.twelveMonths.price'),
      period: t('plans.twelveMonths.period'),
      subtext: t('plans.twelveMonths.subtext'),
      description: t('plans.twelveMonths.description'),
      badge: t('plans.twelveMonths.badge'),
    },
  ];

  const FEATURES = [
    { icon: <UserCheck className="w-5 h-5" />, text: t('features.profile') },
    { icon: <ImageIcon className="w-5 h-5" />, text: t('features.uploads') },
    { icon: <TrendingUp className="w-5 h-5" />, text: t('features.search') },
  ];

  const TRUST = [
    { icon: <Shield className="w-5 h-5" />, label: t('trust.noLockIn') },
    { icon: <UserCheck className="w-5 h-5" />, label: t('trust.secureCheckout') },
    { icon: <Check className="w-5 h-5" />, label: t('trust.liveImmediately') },
  ];

  useEffect(() => {
    fetch('/api/subscription/current', { credentials: 'include' })
      .then(r => {
        if (r.status === 401) { setIsLoggedIn(false); setAuthChecked(true); return null; }
        setIsLoggedIn(true);
        return r.json();
      })
      .then(data => {
        if (data && (data.status === 'ACTIVE' || data.status === 'TRIALING')) setHasActiveSub(true);
        setAuthChecked(true);
      })
      .catch(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (authChecked && isLoggedIn && planParam && !hasActiveSub && !subscribing) {
      handleSubscribe(planParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, isLoggedIn, planParam, hasActiveSub]);

  const handleSubscribe = async (duration: string) => {
    if (!isLoggedIn) {
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(`/${locale}/pricing?plan=${duration}`)}`);
      return;
    }
    setSubscribing(duration);
    setError(null);
    try {
      const res = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ duration, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('errors.checkoutFailed'));
      if (data.url) { window.location.href = data.url; }
      else throw new Error(t('errors.missingCheckoutUrl'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('errors.generic'));
      setSubscribing(null);
    }
  };

  return (
    <div className="min-h-screen landing-bg brand-true-red relative isolate overflow-hidden">
      <BgDecorations />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28">

        <Breadcrumbs items={[{ label: tNav('home'), href: '/' }, { label: tNav('pricing') }]} />

        {/* ── Hero heading ── */}
        <div className="text-center mb-20">
          <div className="marketing-pill inline-flex items-center gap-2 marketing-pill text-[var(--foreground)] text-sm font-semibold px-5 py-2.5 rounded-full mb-8 border border-gray-300/70 dark:border-[var(--marketing-pill-border)] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary-blue dark:bg-accent-red animate-pulse" />
            {t('hero.eyebrow')}
          </div>

          <h1 className="marketing-hero-title text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 leading-[1.08] tracking-tight">
            {t('hero.titlePrefix')}{' '}
            <span className="marketing-yes-accent">
              {t('hero.titleAccent')}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[color-mix(in_srgb,var(--foreground)_68%,transparent)] max-w-2xl mx-auto mb-8 leading-relaxed">
            {t('hero.description')}
          </p>

          {/* Swooping tick brand marks */}
          <div className="flex items-center justify-center gap-5 mt-10">
            {[0, 1, 2].map(i => (
              <SwoopingTick key={i} size={40} className="opacity-70 drop-shadow-sm" />
            ))}
          </div>
        </div>

        {/* ── Active subscription banner ── */}
        {hasActiveSub && (
          <div className="mb-12 p-5 backdrop-blur-md bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-700/40 rounded-2xl text-center shadow-sm">
            <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
              {t('activeSubscription.banner')}
            </p>
            <a href={`/${locale}/dashboard/subscription`} className="text-sm text-emerald-600 dark:text-emerald-500 hover:underline mt-2 inline-block font-medium transition-colors">
              {t('activeSubscription.manage')}
            </a>
          </div>
        )}

        {/* ── Error banner ── */}
        {error && (
          <div className="mb-10 p-5 backdrop-blur-md bg-red-50/80 dark:bg-red-900/20 border border-red-200/60 dark:border-red-700/40 rounded-2xl text-center text-red-700 dark:text-red-400 shadow-sm">
            {error}
          </div>
        )}

        {/* ── Plan cards ── */}
        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch mb-20">
          {PLANS.map((plan) => {
            const isFeatured = !!plan.badge;
            const isLoading = subscribing === plan.id;

            // Derive discount metadata safely to avoid undefined variables.
            const parseAmount = (s?: string) => {
              if (!s) return NaN;
              const n = Number(String(s).replace(/[^0-9.\-]+/g, ''));
              return Number.isFinite(n) ? n : NaN;
            };

            const originalPrice = (plan as any).originalPrice as string | undefined;
            const originalAmount = parseAmount(originalPrice);
            const currentAmount = parseAmount(plan.price as string);
            const percent = !Number.isNaN(originalAmount) && originalAmount > 0 && !Number.isNaN(currentAmount)
              ? Math.round((1 - currentAmount / originalAmount) * 100)
              : null;
            const currencySymbol = (plan.price || '').toString().trim().match(/^[^0-9.-]+/)?.[0] || '£';
            const computedSavings = !Number.isNaN(originalAmount) && !Number.isNaN(currentAmount) && originalAmount > currentAmount
              ? `${currencySymbol}${Math.round(originalAmount - currentAmount)}`
              : (plan as any).savings || '';

            return (
              <div
                key={plan.id}
                className={`group relative ${isFeatured ? 'md:flex-[1.12] z-20' : 'flex-1'} flex flex-col rounded-[2rem] overflow-hidden transition-all duration-500 ease-out hover:-translate-y-3 hover:shadow-2xl ${
                    isFeatured
                      ? 'bg-white dark:bg-[#171219] shadow-[0_28px_80px_rgba(37,99,235,0.18)] dark:shadow-[0_30px_90px_rgba(185,28,28,0.42)] ring-2 ring-primary-blue/25 dark:ring-accent-red/24 featured-elevated'
                      : 'bg-white dark:bg-[#121418] shadow-[0_22px_70px_rgba(15,23,42,0.14)] dark:shadow-[0_24px_80px_rgba(185,28,28,0.28)] ring-1 ring-slate-200/95 dark:ring-white/12'
                } border border-slate-100 dark:border-white/8 card-surface`}
              >
                {/* Gradient top edge */}
                <div className="h-1 w-full bg-gradient-to-r from-primary-blue via-accent-blue to-indigo-500 dark:from-accent-red dark:via-primary-red dark:to-red-900" />

                {/* Decorative sale ribbon (visual only) */}
                {originalPrice && (
                  <div className="absolute -top-3 left-6 z-30 pointer-events-none" aria-hidden="true">
                    <span className="ribbon">{percent ? `${percent}% OFF` : `Save ${computedSavings}`}</span>
                  </div>
                )}

                {/* Inner glow on hover */}
                <div className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-b from-primary-blue/[0.04] via-transparent to-transparent dark:from-accent-red/[0.06]" />

                {/* Best value badge */}
                {isFeatured && (
                  <div className="absolute top-5 right-5 z-10">
                    <span className="inline-flex items-center gap-1.5 backdrop-blur-md bg-gradient-to-r from-primary-blue to-accent-blue dark:from-accent-red dark:to-primary-red text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-primary-blue/25 dark:shadow-accent-red/25">
                      <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M8 0l2.1 5.3L16 6.2l-4.3 3.8L13 16 8 12.7 3 16l1.3-6L0 6.2l5.9-.9L8 0z" /></svg>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-8 sm:p-10 flex flex-col flex-1">
                  {/* Plan icon */}
                  <div className="w-full mb-6 flex items-center justify-center">
                    {(() => {
                      const Icon = PLAN_ICONS[plan.id];
                      return (
                        <div className="w-20 h-20 rounded-2xl bg-primary-blue/10 dark:bg-accent-red/10 flex items-center justify-center ring-1 ring-primary-blue/15 dark:ring-accent-red/15">
                          <Icon className="w-10 h-10 marketing-accent-text" strokeWidth={1.5} />
                        </div>
                      );
                    })()}
                  </div>

                  <div className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] marketing-accent-text">
                    {t('planName')}
                  </div>
                  <h2 className="marketing-hero-title text-2xl font-extrabold mb-1.5 tracking-tight">
                    {plan.label}
                  </h2>
                  <p className="text-sm text-[color-mix(in_srgb,var(--foreground)_66%,transparent)] mb-8 leading-relaxed">{plan.description}</p>

                  {/* Price (visual discount only) */}
                  <div className="mb-2">
                    <span className="sr-only">{t('aria.price', {price: plan.price, period: plan.period})}</span>

                    {/* Visual original price (fake discount) */}
                    {originalPrice && (
                      <div className="flex items-center justify-center gap-3 mb-2" aria-hidden="true">
                        <span className="text-sm text-[color-mix(in_srgb,var(--foreground)_46%,transparent)] line-through">{originalPrice}</span>
                        {percent ? (
                          <span className="percent-badge">{t('aria.percentOff', { percent })}</span>
                        ) : (
                          <span className="inline-block text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                            {t('saveAmount', { amount: computedSavings })}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-baseline justify-center gap-3">
                      <span className="text-6xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-blue via-accent-blue to-indigo-500 dark:from-accent-red dark:via-primary-red dark:to-red-900 tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-[color-mix(in_srgb,var(--foreground)_56%,transparent)] ml-2 text-sm font-medium">
                        / {plan.period}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[color-mix(in_srgb,var(--foreground)_56%,transparent)] mb-10 font-medium">{plan.subtext}</p>

                  {/* Features */}
                  <ul className="space-y-4 mb-10 flex-1">
                    {FEATURES.map(({ icon, text }) => (
                      <li key={text} className="flex items-center gap-3 text-[var(--foreground)] text-sm">
                        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-primary-blue/10 dark:bg-accent-red/10 marketing-accent-text">{icon}</span>
                        <span className="font-medium">{text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={!!subscribing || hasActiveSub || !authChecked}
                    aria-label={t('aria.subscribePlan', { plan: plan.label })}
                    className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-black dark:text-white text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-ring)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      hasActiveSub
                        ? 'bg-gray-400 cursor-default'
                        : 'bg-gradient-to-r from-primary-blue via-accent-blue to-indigo-500 dark:from-accent-red dark:via-primary-red dark:to-red-900 shadow-[0_18px_36px_rgba(37,99,235,0.24)] dark:shadow-[0_18px_36px_rgba(185,28,28,0.40)] hover:shadow-[0_24px_48px_rgba(37,99,235,0.30)] dark:hover:shadow-[0_24px_48px_rgba(185,28,28,0.52)] hover:scale-[1.02] active:scale-[0.98] cta-animate'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('buttons.redirecting')}
                      </>
                    ) : hasActiveSub ? (
                      t('buttons.alreadySubscribed')
                    ) : !authChecked ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {t('buttons.subscribe')}
                        <span className="ml-2 transform transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Trust indicators ── */}
        <div className="flex flex-wrap justify-center gap-4 mb-20">
          {TRUST.map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 text-sm text-[var(--foreground)] bg-white dark:bg-[#14151b] px-5 py-2.5 rounded-full border border-slate-200 dark:border-red-400/25 shadow-sm">
              <span className="marketing-accent-text">{icon}</span>
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* ── What you unlock section ── */}
        <div className="rounded-[2rem] marketing-panel border border-white/50 dark:border-white/10 shadow-xl shadow-gray-900/5 dark:shadow-black/20 p-8 md:p-14 text-center">
          <h2 className="marketing-hero-title text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
            <span className="sr-only">{t('aria.waitingForYou')}</span>
            <div className="flex items-center justify-center gap-8">
              <div className="flex flex-col items-center text-[var(--foreground)]">
                <UserCheck className="w-10 h-10 marketing-accent-text" />
                <span className="mt-2 text-sm font-semibold">{t('unlock.stage')}</span>
              </div>
              <div className="flex flex-col items-center text-[var(--foreground)]">
                <ImageIcon className="w-10 h-10 marketing-accent-text" />
                <span className="mt-2 text-sm font-semibold">{t('unlock.showEverything')}</span>
              </div>
              <div className="flex flex-col items-center text-[var(--foreground)]">
                <TrendingUp className="w-10 h-10 marketing-accent-text" />
                <span className="mt-2 text-sm font-semibold">{t('unlock.cutQueue')}</span>
              </div>
            </div>
          </h2>
          <p className="text-[color-mix(in_srgb,var(--foreground)_68%,transparent)] mb-12 max-w-lg mx-auto leading-relaxed">
            {t('unlock.description')}
          </p>

          {/* Icon-only feature summary (cards removed to avoid duplication) */}
        </div>

        {/* ── Footer note ── */}
        <div className="mt-14 pt-8 border-t border-gray-200/40 dark:border-white/5">
          <p className="text-center text-sm text-[color-mix(in_srgb,var(--foreground)_64%,transparent)] font-medium">
            {t('footer.secureNote')}
            {!isLoggedIn && authChecked && (
              <span>
                {' '}{t('footer.accountPrompt')}{' '}
                <a href={`/${locale}/auth/login`} className="marketing-accent-text hover:underline font-medium transition-colors">
                  {t('footer.login')}
                </a>
              </span>
            )}
          </p>
        </div>

      </div>
    </div>
  );
}
