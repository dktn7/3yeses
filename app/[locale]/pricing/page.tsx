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

// ── Background decorations (5 award-winning static variants) ─────────────────

function BgDecorations({ variant }: { variant: number }) {
  const wrap = (children: React.ReactNode) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
        {children}
      </svg>
    </div>
  );

  // ─── 1. Spotlight Stage ───────────────────────────────────────────────
  // Dramatic radial spotlight from top-centre — like a stage light hitting
  // the performer. Deep navy base with a warm golden glow cone.
  if (variant === 1) return wrap(
    <>
      <defs>
        <radialGradient id="v1spot" cx="50%" cy="0%" r="70%" fx="50%" fy="0%">
          <stop offset="0%" stopColor="var(--brand-glow)" stopOpacity="0.28" />
          <stop offset="35%" stopColor="var(--brand-to)" stopOpacity="0.10" />
          <stop offset="100%" stopColor="var(--brand-from)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="v1base" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--brand-from, #F0F7FF)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#v1base)" />
      <rect width="100%" height="100%" fill="url(#v1spot)" />
      {/* Subtle horizon line */}
      <line x1="0" y1="680" x2="1440" y2="680" stroke="var(--brand-to)" strokeWidth="1" opacity="0.18" />
      {/* Decorative arc — like a curtain swag */}
      <path d="M0 0 Q720 180 1440 0" fill="none" stroke="var(--brand-to)" strokeWidth="2" opacity="0.18" />
      <path d="M0 0 Q720 120 1440 0" fill="none" stroke="var(--brand-from)" strokeWidth="1" opacity="0.12" />
      {/* Corner accent triangles */}
      <path d="M0 900 L0 750 L180 900 Z" fill="var(--brand-from)" opacity="0.24" />
      <path d="M1440 900 L1440 780 L1280 900 Z" fill="var(--brand-glow)" opacity="0.14" />
    </>
  );

  // ─── 2. Layered Waves ─────────────────────────────────────────────────
  // Stacked flowing waves — organic, premium feel like Apple or Stripe.
  // Multiple translucent layers create depth.
  if (variant === 2) return wrap(
    <>
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
      {/* Wave 1 — deep back */}
      <path d="M0 520 C240 420 480 580 720 500 C960 420 1200 540 1440 480 L1440 900 L0 900 Z" fill="url(#pricingWaveOne)" />
      {/* Wave 2 — mid */}
      <path d="M0 600 C320 530 560 650 800 580 C1040 510 1280 620 1440 560 L1440 900 L0 900 Z" fill="url(#pricingWaveTwo)" />
      {/* Wave 3 — front */}
      <path d="M0 700 C200 660 440 740 720 690 C1000 640 1200 720 1440 680 L1440 900 L0 900 Z" fill="var(--brand-from)" opacity="0.06" />
      {/* Top accent wave */}
      <path d="M0 80 C360 140 720 40 1080 100 C1260 130 1380 90 1440 110 L1440 0 L0 0 Z" fill="var(--brand-from)" opacity="0.08" />
      {/* No floating rule — clean surface */}
    </>
  );

  // ─── 3. Geometric Mosaic ──────────────────────────────────────────────
  // Bold angular shapes — inspired by Bauhaus / editorial design.
  // Clean overlapping triangles and rectangles.
  if (variant === 3) return wrap(
    <>
      <rect width="100%" height="100%" fill="var(--brand-from, #FAFBFF)" />
      {/* Large triangle — top left */}
      <path d="M0 0 L600 0 L0 500 Z" fill="var(--brand-to)" opacity="0.42" />
      {/* Angled rectangle — right */}
      <path d="M900 0 L1440 0 L1440 400 L700 400 Z" fill="var(--brand-from)" opacity="0.28" />
      {/* Bottom slab */}
      <rect x="0" y="700" width="1440" height="200" fill="var(--brand-from)" opacity="0.32" />
      {/* Accent diamond — centre */}
      <path d="M720 280 L840 450 L720 620 L600 450 Z" fill="var(--brand-glow)" opacity="0.12" />
      {/* Small square accent */}
      <rect x="1200" y="500" width="120" height="120" rx="4" fill="var(--brand-to)" opacity="0.22" transform="rotate(15 1260 560)" />
      {/* Thin lines */}
      <line x1="0" y1="500" x2="1440" y2="400" stroke="var(--brand-to)" strokeWidth="1" opacity="0.12" />
      <line x1="0" y1="520" x2="1440" y2="420" stroke="var(--brand-to)" strokeWidth="1" opacity="0.08" />
      {/* Circle accent — bottom right */}
      <circle cx="1300" cy="750" r="80" fill="none" stroke="var(--brand-to)" strokeWidth="2" opacity="0.12" />
      <circle cx="1300" cy="750" r="50" fill="none" stroke="var(--brand-to)" strokeWidth="1" opacity="0.06" />
    </>
  );

  // ─── 4. Aurora Gradient ───────────────────────────────────────────────
  // Smooth colour aurora — like the northern lights. Multiple soft
  // gradient bands layered horizontally.
  if (variant === 4) return wrap(
    <>
      <defs>
        <linearGradient id="v4a" x1="0" x2="1">
          <stop offset="0%" stopColor="var(--brand-from)" />
          <stop offset="50%" stopColor="var(--brand-to)" />
          <stop offset="100%" stopColor="var(--brand-glow)" />
        </linearGradient>
        <linearGradient id="v4b" x1="0" x2="1">
          <stop offset="0%" stopColor="var(--brand-to)" />
          <stop offset="50%" stopColor="var(--brand-from)" />
          <stop offset="100%" stopColor="var(--brand-to)" />
        </linearGradient>
        <linearGradient id="v4c" x1="0" x2="1">
          <stop offset="0%" stopColor="var(--brand-glow)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--brand-from)" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="var(--brand-from, #FEFEFE)" />
      {/* Aurora band 1 */}
      <path d="M0 150 C360 80 720 220 1080 120 C1260 80 1380 140 1440 100 L1440 300 C1200 380 960 240 720 320 C480 400 240 280 0 360 Z" fill="url(#v4a)" opacity="0.34" />
      {/* Aurora band 2 */}
      <path d="M0 400 C300 340 600 460 900 380 C1100 320 1300 420 1440 370 L1440 520 C1200 580 900 480 640 540 C380 600 180 500 0 560 Z" fill="url(#v4b)" opacity="0.26" />
      {/* Warm accent glow — bottom */}
      <ellipse cx="50%" cy="85%" rx="600" ry="120" fill="url(#v4c)" />
      {/* Crisp horizon */}
      <line x1="120" y1="650" x2="1320" y2="650" stroke="var(--brand-to)" strokeWidth="0.5" opacity="0.18" />
    </>
  );

  // ─── 5. Concentric Rings ──────────────────────────────────────────────
  // Off-centre concentric circles radiating outward — like a ripple or
  // sound wave. Clean, confident, editorial.
  if (variant === 5) return wrap(
    <>
      <rect width="100%" height="100%" fill="var(--brand-from, #FBFCFE)" />
      {/* Large ring set — offset left */}
      {[280, 360, 440, 520, 620, 740, 880].map((r, i) => (
        <circle key={i} cx="360" cy="450" r={r} fill="none" stroke="var(--brand-to)" strokeWidth={i < 3 ? 1.5 : 1} opacity={0.18 - i * 0.02} />
      ))}
      {/* Small ring set — top right accent */}
      {[60, 100, 140, 190].map((r, i) => (
        <circle key={`s${i}`} cx="1200" cy="180" r={r} fill="none" stroke="var(--brand-from)" strokeWidth="1" opacity={0.16 - i * 0.03} />
      ))}
      {/* Accent dot cluster */}
      <circle cx="360" cy="450" r="6" fill="var(--brand-from)" opacity="0.28" />
      <circle cx="1200" cy="180" r="4" fill="var(--brand-to)" opacity="0.22" />
      {/* Subtle cross-hair at main centre */}
      <line x1="320" y1="450" x2="400" y2="450" stroke="var(--brand-to)" strokeWidth="0.5" opacity="0.14" />
      <line x1="360" y1="410" x2="360" y2="490" stroke="var(--brand-to)" strokeWidth="0.5" opacity="0.14" />
      {/* Corner fill — bottom right warmth */}
      <path d="M1440 900 L1440 700 C1300 750 1200 800 1100 900 Z" fill="var(--brand-glow)" opacity="0.14" />
    </>
  );

  // ─── 6. Neon Ribbon ───────────────────────────────────────────────
  // Vibrant diagonal ribbons with punchy highlights and subtle glow.
  if (variant === 6) return wrap(
    <>
      <defs>
        <linearGradient id="v6r1" x1="0" x2="1">
          <stop offset="0%" stopColor="var(--brand-to)" />
          <stop offset="100%" stopColor="var(--brand-glow)" />
        </linearGradient>
        <linearGradient id="v6r2" x1="0" x2="1">
          <stop offset="0%" stopColor="var(--brand-from)" />
          <stop offset="100%" stopColor="var(--brand-to)" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="var(--brand-from)" />
      <g transform="rotate(-12 720 450)" opacity="0.95">
        <rect x="-200" y="50" width="1800" height="220" fill="url(#v6r1)" opacity="0.9" />
        <rect x="-200" y="200" width="1800" height="160" fill="url(#v6r2)" opacity="0.78" />
        <rect x="-200" y="330" width="1800" height="120" fill="url(#v6r1)" opacity="0.64" />
      </g>
      {/* ribbon highlights */}
      <path d="M0 220 C360 160 720 260 1080 200 C1260 170 1380 200 1440 180 L1440 240 L0 240 Z" fill="white" opacity="0.03" />
      <circle cx="1200" cy="120" r="90" fill="var(--brand-glow)" opacity="0.12" />
    </>
  );

  // ─── 7. Liquid Glow ───────────────────────────────────────────────
  // Saturated flowing blobs with soft neon edges and large blur for glow.
  if (variant === 7) return wrap(
    <>
      <defs>
        <filter id="v7blur"><feGaussianBlur stdDeviation="80" result="b" /></filter>
        <linearGradient id="v7g" x1="0" x2="1">
          <stop offset="0%" stopColor="var(--brand-from)" />
          <stop offset="100%" stopColor="var(--brand-glow)" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="var(--brand-from)" />
      <g filter="url(#v7blur)" opacity="0.9">
        <ellipse cx="360" cy="420" rx="520" ry="220" fill="url(#v7g)" opacity="0.85" />
        <ellipse cx="980" cy="260" rx="420" ry="180" fill="var(--brand-to)" opacity="0.7" />
        <ellipse cx="1140" cy="640" rx="380" ry="220" fill="var(--brand-glow)" opacity="0.6" />
      </g>
      <rect width="100%" height="100%" fill="none" stroke="var(--brand-to)" strokeWidth="0.5" opacity="0.06" />
    </>
  );

  // ─── 8. Prismatic Shards ──────────────────────────────────────────
  // Faceted polygons with high-contrast colourful shards.
  if (variant === 8) return wrap(
    <>
      <rect width="100%" height="100%" fill="var(--brand-from)" />
      <polygon points="0,320 240,0 540,120 360,420" fill="var(--brand-to)" opacity="0.36" />
      <polygon points="900,0 1440,220 1100,420 760,220" fill="var(--brand-glow)" opacity="0.32" />
      <polygon points="200,700 520,520 840,700 480,860" fill="var(--brand-from)" opacity="0.22" />
      <polygon points="1080,540 1320,680 1440,540 1220,420" fill="var(--brand-to)" opacity="0.28" />
      <path d="M0 880 L1440 880 L1440 900 L0 900 Z" fill="var(--brand-glow)" opacity="0.08" />
    </>
  );

  // ─── 9. Halftone Pop ──────────────────────────────────────────────
  // Dotted halftone texture with bold colour bursts.
  if (variant === 9) return wrap(
    <>
      <defs>
        <pattern id="v9dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="3" fill="var(--brand-to)" opacity="0.12" />
          <circle cx="16" cy="16" r="3" fill="var(--brand-glow)" opacity="0.08" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="var(--brand-from)" />
      <rect width="100%" height="100%" fill="url(#v9dots)" />
      <circle cx="280" cy="300" r="220" fill="var(--brand-to)" opacity="0.12" />
      <circle cx="1080" cy="420" r="300" fill="var(--brand-glow)" opacity="0.14" />
      <path d="M0 760 C360 720 720 840 1080 780 C1320 740 1380 760 1440 760 L1440 900 L0 900 Z" fill="var(--brand-to)" opacity="0.06" />
    </>
  );

  // ─── 10. Strobe Gradient ───────────────────────────────────────────
  // High-energy stacked bands with glossy highlights and sheen.
  if (variant === 10) return wrap(
    <>
      <defs>
        <linearGradient id="v10s" x1="0" x2="1">
          <stop offset="0%" stopColor="var(--brand-from)" />
          <stop offset="50%" stopColor="var(--brand-to)" />
          <stop offset="100%" stopColor="var(--brand-glow)" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="var(--brand-from)" />
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x={0} y={i * 120} width="1440" height={120} fill="url(#v10s)" opacity={0.06 + i * 0.02} />
      ))}
      <rect x="0" y="0" width="1440" height="900" fill="none" stroke="white" strokeWidth="0.5" opacity="0.02" />
    </>
  );

  // default fallback
  return wrap(<rect width="100%" height="100%" fill="var(--brand-from)" />);
}

const PLANS = [
  {
    id: '6_months' as const,
    label: '6 months',
    price: '£10',
    period: '/ 6 months',
    subtext: 'Less than a coffee a month',
    description: 'Dip your toe in. No long-term commitment.',
    badge: null,
  },
  {
    id: '12_months' as const,
    label: '12 months',
    price: '£20',
    period: '/ year',
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

  // Locked to variant 2 (Layered Waves).
  const bgVariant = 2;

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
    <div className="min-h-screen landing-bg relative overflow-hidden brand-true-red">

      {/* ── Background preview (use keys 1–5) ── */}
      <BgDecorations variant={bgVariant} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28">

        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Pricing' }]} />

        {/* ── Hero heading ── */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 backdrop-blur-md bg-white/60 dark:bg-white/10 text-white text-sm font-semibold px-5 py-2 rounded-full mb-8 border border-white/40 dark:border-white/15 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary-blue dark:bg-accent-red animate-pulse" />
            Your spotlight starts here
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-[1.08] tracking-tight">
            Ready for your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-blue via-accent-blue to-indigo-500 dark:from-accent-red dark:via-primary-red dark:to-orange-500">
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

            return (
              <div
                key={plan.id}
                className={`group relative flex-1 flex flex-col rounded-[2rem] overflow-hidden transition-all duration-500 ease-out hover:-translate-y-3 hover:shadow-2xl ${
                    isFeatured
                      ? 'shadow-xl shadow-primary-blue/12 dark:shadow-accent-red/12 ring-1 ring-primary-blue/30 dark:ring-accent-red/30'
                      : 'shadow-lg shadow-gray-900/10 dark:shadow-black/30 ring-1 ring-gray-200/60 dark:ring-white/12'
                } backdrop-blur-xl card-surface`}
              >
                {/* Gradient top edge */}
                <div className="h-1 w-full brand-mix-gradient" />

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
                          <Icon className="w-10 h-10 text-primary-blue dark:text-accent-red" strokeWidth={1.5} />
                        </div>
                      );
                    })()}
                  </div>

                  <div className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-blue-700 dark:text-red-400">
                    Standard Access
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1.5 tracking-tight">
                    {plan.label}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-200 mb-8 leading-relaxed">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-2">
                    <span className="text-6xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-blue via-accent-blue to-indigo-500 dark:from-accent-red dark:via-primary-red dark:to-orange-500 tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-300 ml-2 text-sm font-medium">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-300 mb-10 font-medium">{plan.subtext}</p>

                  {/* Features */}
                  <ul className="space-y-4 mb-10 flex-1">
                    {FEATURES.map(({ icon, text }) => (
                      <li key={text} className="flex items-center gap-3 text-gray-800 dark:text-gray-50 text-sm">
                        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-primary-blue/10 dark:bg-accent-red/10 text-primary-blue dark:text-accent-red">{icon}</span>
                        <span className="font-medium">{text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={!!subscribing || hasActiveSub || !authChecked}
                    aria-label={`Subscribe to Standard Access — ${plan.label}`}
                    className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-white text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      hasActiveSub
                        ? 'bg-gray-400 cursor-default'
                        : 'brand-mix-gradient shadow-lg shadow-primary-blue/25 dark:shadow-accent-red/25 hover:shadow-xl hover:shadow-primary-blue/30 dark:hover:shadow-accent-red/30 hover:scale-[1.02] active:scale-[0.98]'
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
                      'Subscribe with Stripe'
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
            <div key={label} className="flex items-center gap-2.5 text-sm text-gray-800 dark:text-gray-100 backdrop-blur-md bg-white/70 dark:bg-white/[0.08] px-5 py-2.5 rounded-full border border-gray-300/50 dark:border-white/10 shadow-sm">
              <span className="text-primary-blue dark:text-accent-red">{icon}</span>
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* ── What you unlock section ── */}
        <div className="rounded-[2rem] backdrop-blur-xl bg-white/40 dark:bg-white/[0.04] border border-white/50 dark:border-white/10 shadow-xl shadow-gray-900/5 dark:shadow-black/20 p-8 md:p-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            <span className="sr-only">What&apos;s waiting for you</span>
            <div className="flex items-center justify-center gap-8">
              <div className="flex flex-col items-center text-gray-800 dark:text-gray-100">
                <UserCheck className="w-10 h-10 text-primary-blue dark:text-accent-red" />
                <span className="mt-2 text-sm font-semibold">Your Stage</span>
              </div>
              <div className="flex flex-col items-center text-gray-800 dark:text-gray-100">
                <ImageIcon className="w-10 h-10 text-primary-blue dark:text-accent-red" />
                <span className="mt-2 text-sm font-semibold">Show Everything</span>
              </div>
              <div className="flex flex-col items-center text-gray-800 dark:text-gray-100">
                <TrendingUp className="w-10 h-10 text-primary-blue dark:text-accent-red" />
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
                <a href={`/${locale}/auth/login`} className="text-primary-blue dark:text-accent-red hover:underline font-medium transition-colors">
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