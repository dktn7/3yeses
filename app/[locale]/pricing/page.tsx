'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
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
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none dark:opacity-90" aria-hidden="true">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="v2bg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-from, #FFFFFF)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="pricingWaveOne" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-from)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--brand-to)" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="pricingWaveTwo" x1="1" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-to)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--brand-from)" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#v2bg)" />
        <path d="M0 620 C240 540 480 680 720 620 C960 550 1200 650 1440 590 L1440 900 L0 900 Z" fill="url(#pricingWaveOne)" />
        <path d="M0 710 C320 650 560 740 800 700 C1040 640 1280 720 1440 690 L1440 900 L0 900 Z" fill="url(#pricingWaveTwo)" />
        <path d="M0 790 C200 760 440 820 720 780 C1000 740 1200 800 1440 770 L1440 900 L0 900 Z" fill="var(--brand-from)" opacity="0.06" />
        <path d="M0 60 C360 118 720 30 1080 84 C1260 108 1380 72 1440 86 L1440 0 L0 0 Z" fill="var(--hero-top-wave, var(--brand-from))" opacity="0.08" />
      </svg>
    </div>
  );
}

const PLANS = [
  {
    id: '6_months' as const,
    label: '6 months',
    price: '£10',
    period: '6 months',
    subtext: 'Less than a coffee a month',
    description: 'Dip your toe in. No long-term commitment.',
    badge: null,
  },
  {
    id: '12_months' as const,
    label: '12 months',
    price: '£20',
    period: 'year',
    subtext: 'Same price. Twice the runway.',
    description: 'Go all in. A full year to get your break.',
    badge: 'Best Value',
  },
];

const FEATURES = [
  { icon: <UserCheck className="w-5 h-5" />, text: 'A profile built to turn heads' },
  { icon: <ImageIcon className="w-5 h-5" />, text: 'Upload everything — no limits, ever' },
  { icon: <TrendingUp className="w-5 h-5" />, text: 'Jump the queue in every search' },
];

const TRUST = [
  { icon: <Shield className="w-5 h-5" />, label: 'No lock-in — quit whenever' },
  { icon: <UserCheck className="w-5 h-5" />, label: 'Stripe-secure checkout' },
  { icon: <Check className="w-5 h-5" />, label: 'Live the second you pay' },
];

export default function PricingPage() {
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
      if (!res.ok) throw new Error(data.error || 'Failed to create checkout session');
      if (data.url) { window.location.href = data.url; }
      else throw new Error('No checkout URL received');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubscribing(null);
    }
  };

  return (
    <div className="min-h-screen landing-bg brand-true-red relative isolate overflow-hidden">
      <BgDecorations />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28">

        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Pricing' }]} />

        {/* ── Hero heading ── */}
        <div className="text-center mb-20">
          <div className="marketing-pill inline-flex items-center gap-2 marketing-pill text-gray-900 dark:text-white text-sm font-semibold px-5 py-2.5 rounded-full mb-8 border border-gray-300/70 dark:border-[var(--marketing-pill-border)] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary-blue dark:bg-accent-red animate-pulse" />
            Your spotlight starts here
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-[1.08] tracking-tight">
            Ready for your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-blue via-accent-blue to-indigo-500 dark:from-accent-red dark:via-primary-red dark:to-red-900">
              three yeses?
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto mb-8 leading-relaxed">
            Put your work out there. Your photos, videos, and reels — all in one place,
            seen by the people who matter.
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
              ✓ You already have an active Standard Access subscription.
            </p>
            <a href={`/${locale}/dashboard/subscription`} className="text-sm text-emerald-600 dark:text-emerald-500 hover:underline mt-2 inline-block font-medium transition-colors">
              Manage your subscription →
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

            const originalAmount = parseAmount((plan as any).originalPrice as string | undefined);
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
                      ? 'shadow-2xl shadow-primary-blue/16 dark:shadow-accent-red/16 ring-2 ring-primary-blue/20 dark:ring-accent-red/20 featured-elevated'
                      : 'shadow-lg shadow-gray-900/10 dark:shadow-black/30 ring-1 ring-gray-200/60 dark:ring-white/12'
                } backdrop-blur-xl card-surface`}
              >
                {/* Gradient top edge */}
                <div className="h-1 w-full brand-mix-gradient" />

                {/* Decorative sale ribbon (visual only) */}
                {plan.originalPrice && (
                  <div className="absolute -top-3 left-6 z-30 pointer-events-none" aria-hidden="true">
                    <span className="ribbon">{percent ? `${percent}% OFF` : `Save ${computedSavings}`}</span>
                  </div>
                )}

                {/* Inner glow on hover */}
                <div className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-b from-primary-blue/[0.03] to-transparent dark:from-accent-red/[0.05]" />

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
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-blue/10 to-accent-blue/10 dark:from-accent-red/10 dark:to-primary-red/10 flex items-center justify-center">
                          <Icon className="w-10 h-10 marketing-accent-text" strokeWidth={1.5} />
                        </div>
                      );
                    })()}
                  </div>

                  <div className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] marketing-accent-text">
                    Standard Access
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1.5 tracking-tight">
                    {plan.label}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-200 mb-8 leading-relaxed">{plan.description}</p>

                  {/* Price (visual discount only) */}
                  <div className="mb-2">
                    <span className="sr-only">Price: {plan.price} {plan.period}</span>

                    {/* Visual original price (fake discount) */}
                    {plan.originalPrice && (
                      <div className="flex items-center justify-center gap-3 mb-2" aria-hidden="true">
                        <span className="text-sm text-gray-400 dark:text-gray-500 line-through">{plan.originalPrice}</span>
                        {percent ? (
                          <span className="percent-badge">{percent}% Off</span>
                        ) : (
                          <span className="inline-block text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                            Save {computedSavings}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-baseline justify-center gap-3">
                      <span className="text-6xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-blue via-accent-blue to-indigo-500 dark:from-accent-red dark:via-primary-red dark:to-red-900 tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-gray-500 dark:text-gray-300 ml-2 text-sm font-medium">
                        / {plan.period}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-300 mb-10 font-medium">{plan.subtext}</p>

                  {/* Features */}
                  <ul className="space-y-4 mb-10 flex-1">
                    {FEATURES.map(({ icon, text }) => (
                      <li key={text} className="flex items-center gap-3 text-gray-800 dark:text-gray-50 text-sm">
                        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-primary-blue/10 dark:bg-accent-red/10 marketing-accent-text">{icon}</span>
                        <span className="font-medium">{text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={!!subscribing || hasActiveSub || !authChecked}
                    aria-label={`Subscribe to Standard Access — ${plan.label}`}
                    className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-white text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-ring)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      hasActiveSub
                        ? 'bg-gray-400 cursor-default'
                        : 'brand-mix-gradient shadow-lg shadow-primary-blue/25 dark:shadow-accent-red/25 hover:shadow-xl hover:shadow-primary-blue/30 dark:hover:shadow-accent-red/30 hover:scale-[1.02] active:scale-[0.98] cta-animate'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Redirecting to Stripe…
                      </>
                    ) : hasActiveSub ? (
                      'Already subscribed'
                    ) : !authChecked ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Subscribe with Stripe
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
            <div key={label} className="flex items-center gap-2.5 text-sm text-gray-800 dark:text-slate-50 backdrop-blur-md marketing-panel px-5 py-2.5 rounded-full border border-gray-300/50 dark:border-red-400/25 shadow-sm">
              <span className="marketing-accent-text">{icon}</span>
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* ── What you unlock section ── */}
        <div className="rounded-[2rem] marketing-panel border border-white/50 dark:border-white/10 shadow-xl shadow-gray-900/5 dark:shadow-black/20 p-8 md:p-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            <span className="sr-only">What&apos;s waiting for you</span>
            <div className="flex items-center justify-center gap-8">
              <div className="flex flex-col items-center text-gray-800 dark:text-gray-100">
                <UserCheck className="w-10 h-10 marketing-accent-text" />
                <span className="mt-2 text-sm font-semibold">Your Stage</span>
              </div>
              <div className="flex flex-col items-center text-gray-800 dark:text-gray-100">
                <ImageIcon className="w-10 h-10 marketing-accent-text" />
                <span className="mt-2 text-sm font-semibold">Show Everything</span>
              </div>
              <div className="flex flex-col items-center text-gray-800 dark:text-gray-100">
                <TrendingUp className="w-10 h-10 marketing-accent-text" />
                <span className="mt-2 text-sm font-semibold">Cut the Queue</span>
              </div>
            </div>
          </h2>
          <p className="text-gray-600 dark:text-gray-200 mb-12 max-w-lg mx-auto leading-relaxed">
            No fluff. No fake features. Just the tools to get you seen.
          </p>

          {/* Icon-only feature summary (cards removed to avoid duplication) */}
        </div>

        {/* ── Footer note ── */}
        <div className="mt-14 pt-8 border-t border-gray-200/40 dark:border-white/5">
          <p className="text-center text-sm text-gray-600 dark:text-gray-300 font-medium">
            Secured via Stripe. Ditch it any time from your dashboard.
            {!isLoggedIn && authChecked && (
              <span>
                {' '}Already have an account?{' '}
                <a href={`/${locale}/auth/login`} className="marketing-accent-text hover:underline font-medium transition-colors">
                  Log in
                </a>
              </span>
            )}
          </p>
        </div>

      </div>
    </div>
  );
}
