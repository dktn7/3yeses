import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  UserPlus,
  Camera,
  Search,
  BarChart3,
  Upload,
  Globe,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Star,
  Eye,
  Heart,
  MessageSquare,
  Layers,
  Settings,
} from "lucide-react";

/* ── Background decoration ── */
function WhyHowBg() {
  return (
    <div
      className="marketing-wave-tone-structured absolute inset-0 z-0 overflow-hidden pointer-events-none select-none dark:opacity-90"
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="whBg" x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--wave-veil, var(--marketing-wave-accent))"
              stopOpacity="var(--marketing-wave-bg-strong)"
            />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="whWave1" x1="0" x2="1" y1="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--wave-primary, var(--marketing-wave-accent))"
              stopOpacity="var(--marketing-wave-main-strong)"
            />
            <stop
              offset="100%"
              stopColor="var(--wave-secondary, var(--marketing-wave-accent))"
              stopOpacity="var(--marketing-wave-main-soft)"
            />
          </linearGradient>
          <linearGradient id="whWave2" x1="1" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--wave-secondary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-secondary-strong)" />
            <stop
              offset="100%"
              stopColor="var(--wave-primary, var(--marketing-wave-accent))"
              stopOpacity="var(--marketing-wave-secondary-soft)"
            />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#whBg)" />
        <path
          d="M0 600 C240 530 480 660 720 600 C960 535 1200 640 1440 580 L1440 900 L0 900 Z"
          fill="url(#whWave1)"
        />
        <path
          d="M0 710 C300 650 580 740 840 690 C1080 635 1280 710 1440 670 L1440 900 L0 900 Z"
          fill="url(#whWave2)"
        />
        <path
          d="M0 80 C360 130 720 40 1080 90 C1260 120 1380 84 1440 98 L1440 0 L0 0 Z"
          fill="var(--wave-primary, var(--marketing-wave-accent))"
          opacity="var(--marketing-wave-top-opacity)"
        />
        <circle
          cx="180"
          cy="160"
          r="220"
          fill="var(--wave-orb, var(--marketing-wave-accent))"
          opacity="var(--marketing-wave-orb-opacity)"
        />
        <circle
          cx="1280"
          cy="680"
          r="280"
          fill="var(--wave-secondary, var(--marketing-wave-accent))"
          opacity="var(--marketing-wave-orb-soft-opacity)"
        />
      </svg>
    </div>
  );
}

function WhyHowMidWaves() {
  return (
    <div
      className="marketing-wave-tone-structured absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none dark:opacity-95"
      aria-hidden="true"
    >
      <svg
        className="h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 1440 1500"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="whMidWash" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="18%" stopColor="var(--wave-veil, var(--marketing-wave-accent))" stopOpacity="0.22" />
            <stop offset="54%" stopColor="var(--wave-secondary, var(--marketing-wave-accent))" stopOpacity="0.18" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="whMidRibbonOne" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--wave-primary, var(--marketing-wave-accent))" stopOpacity="0.32" />
            <stop offset="48%" stopColor="var(--wave-secondary, var(--marketing-wave-accent))" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--wave-primary, var(--marketing-wave-accent))" stopOpacity="0.28" />
          </linearGradient>
          <linearGradient id="whMidRibbonTwo" x1="1" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--wave-secondary, var(--marketing-wave-accent))" stopOpacity="0.24" />
            <stop offset="100%" stopColor="var(--wave-primary, var(--marketing-wave-accent))" stopOpacity="0.12" />
          </linearGradient>
          <radialGradient id="whMidOrb" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--wave-orb, var(--marketing-wave-accent))" stopOpacity="0.18" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="1440" height="1500" fill="url(#whMidWash)" />
        <path
          d="M-120 180 C160 88 350 230 620 150 C890 70 1030 190 1240 126 C1360 90 1440 72 1560 92 L1560 310 C1320 260 1130 344 890 276 C650 206 390 322 120 252 C0 222 -80 210 -120 216 Z"
          fill="url(#whMidRibbonOne)"
        />
        <path
          d="M-120 620 C160 535 380 660 620 604 C850 548 1070 640 1320 570 C1430 540 1510 532 1560 548 L1560 850 C1320 784 1110 880 850 802 C610 730 390 830 130 760 C0 724 -72 712 -120 724 Z"
          fill="url(#whMidRibbonTwo)"
        />
        <path
          d="M-160 1080 C100 980 320 1120 570 1055 C820 990 1040 1118 1280 1040 C1420 995 1510 1005 1600 1040 L1600 1500 L-160 1500 Z"
          fill="url(#whMidRibbonOne)"
          opacity="0.82"
        />
        <circle cx="220" cy="355" r="260" fill="url(#whMidOrb)" />
        <circle cx="1190" cy="805" r="310" fill="url(#whMidOrb)" />
        <circle cx="520" cy="1180" r="340" fill="url(#whMidOrb)" opacity="0.72" />
      </svg>
    </div>
  );
}

/* ── Feature card ── */
function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <div
      className="marketing-panel group relative rounded-[1.5rem] border border-gray-200/50 p-7 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-blue/30 hover:shadow-lg dark:border-red-900/25 dark:hover:border-red-800/35"
      style={{
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-primary-blue/10 to-accent-blue/10 dark:from-accent-red/10 dark:to-primary-red/10">
          <Icon className="w-6 h-6 text-[var(--brand-primary)]" />
      </div>
        <h3
        className="text-base font-bold mb-2 tracking-tight text-gray-900 transition-colors group-hover:text-[var(--marketing-accent)] dark:text-white"
          style={{ color: "var(--foreground)" }}
        >
          {title}
        </h3>
        <p
        className="text-sm leading-relaxed text-gray-600 dark:text-gray-300"
          style={{
            color: "color-mix(in srgb, var(--foreground) 72%, transparent)",
          }}
        >
          {description}
        </p>
    </div>
  );
}

/* ── Step card ── */
function StepCard({
  number,
  title,
  description,
  details,
  isLast = false,
}: {
  number: number;
  title: string;
  description: string;
  details: string[];
  isLast?: boolean;
}) {
  return (
    <div className="relative flex gap-6">
      {/* Vertical connector with improved badge */}
      <div className="flex flex-col items-center">
        <div
          className="h-16 w-16 rounded-3xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-accent)] flex items-center justify-center shrink-0 shadow-[0_16px_36px_rgba(37,99,235,0.28)] dark:shadow-[0_16px_36px_rgba(220,38,38,0.30)] ring-4 ring-white/80 dark:ring-white/8"
        >
          <span className="text-2xl font-extrabold text-white">{number}</span>
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-gradient-to-b from-[var(--brand-primary)]/30 to-transparent mt-3" />
        )}
      </div>

      {/* Content with accent strip */}
      <div className="relative pb-10 last:pb-0 flex-1">
        <div className="marketing-panel rounded-[1.5rem] border border-gray-200/50 p-6 shadow-sm dark:border-red-900/25">
          <h3
            className="text-xl sm:text-2xl font-extrabold tracking-tight mb-2"
            style={{ color: "var(--foreground)" }}
          >
            {title}
          </h3>
          <p
            className="text-[15.5px] leading-relaxed mb-5 max-w-xl"
            style={{
              color: "color-mix(in srgb, var(--foreground) 72%, transparent)",
            }}
          >
            {description}
          </p>

          <ul className="space-y-3">
            {details.map((detail, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm"
                style={{
                  color:
                    "color-mix(in srgb, var(--foreground) 72%, transparent)",
                }}
              >
                <span className="mt-0.5 flex items-center justify-center h-6 w-6 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <span className="leading-snug">{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ── Stat block ── */
function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--brand-primary)]">
        {value}
      </div>
      <div
        className="text-sm mt-1"
        style={{
          color: "color-mix(in srgb, var(--foreground) 55%, transparent)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default async function WhyHowPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale ?? "en-gb";
  const t = await getTranslations("WhyHow");
  const tNav = await getTranslations("Navigation");

  const features = [
    {
      icon: Camera,
      title: t("features.portfolio.title"),
      description: t("features.portfolio.desc"),
    },
    {
      icon: Search,
      title: t("features.discovery.title"),
      description: t("features.discovery.desc"),
    },
    {
      icon: BarChart3,
      title: t("features.analytics.title"),
      description: t("features.analytics.desc"),
    },
    {
      icon: Globe,
      title: t("features.categories.title"),
      description: t("features.categories.desc"),
    },
    {
      icon: Shield,
      title: t("features.simple.title"),
      description: t("features.simple.desc"),
    },
    {
      icon: Settings,
      title: t("features.control.title"),
      description: t("features.control.desc"),
    },
  ];

  const steps = [
    {
      title: t("steps.0.title"),
      description: t("steps.0.desc"),
      details: [
        t("steps.0.details.0"),
        t("steps.0.details.1"),
        t("steps.0.details.2"),
      ],
    },
    {
      title: t("steps.1.title"),
      description: t("steps.1.desc"),
      details: [
        t("steps.1.details.0"),
        t("steps.1.details.1"),
        t("steps.1.details.2"),
      ],
    },
    {
      title: t("steps.2.title"),
      description: t("steps.2.desc"),
      details: [
        t("steps.2.details.0"),
        t("steps.2.details.1"),
        t("steps.2.details.2"),
      ],
    },
    {
      title: t("steps.3.title"),
      description: t("steps.3.desc"),
      details: [
        t("steps.3.details.0"),
        t("steps.3.details.1"),
        t("steps.3.details.2"),
      ],
    },
  ];

  return (
    <main className="min-h-screen landing-bg brand-true-red relative isolate overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden pt-20 pb-28 md:pb-36">
        <WhyHowBg />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <Breadcrumbs
            items={[
              { label: tNav('home'), href: `/${locale}` },
              { label: t("breadcrumb") },
            ]}
          />

          <div className="max-w-5xl mt-4">
            <span className="marketing-pill inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-[10px] uppercase tracking-[0.22em] font-semibold mb-8 shadow-sm backdrop-blur-md transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
              <Sparkles className="marketing-accent-text w-4 h-4 shrink-0" />
              <span className="marketing-accent-text">{t("eyebrow")}</span>
            </span>

            <h1 className="marketing-hero-title text-[clamp(2.4rem,7vw,5.5rem)] font-extrabold leading-[1.1] tracking-tighter mb-6 pb-1">
              {t("hero.title")}{" "}
              <span
                className="marketing-yes-accent inline-block"
              >
                {t("hero.titleAccent")}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[color-mix(in_srgb,var(--foreground)_68%,transparent)] mb-10 max-w-2xl leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href={`/${locale}/signup`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-blue to-accent-blue px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-blue/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue/35 dark:from-accent-red dark:to-primary-red dark:shadow-accent-red/20 dark:focus-visible:ring-accent-red/35"
              >
                {t("cta.primary")} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={`/${locale}/pricing`}
                className="inline-flex items-center gap-2 rounded-xl marketing-panel border border-gray-200/60 px-8 py-3.5 text-sm font-semibold text-gray-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:text-[var(--marketing-accent)] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue/35 dark:border-red-900/25 dark:text-white dark:focus-visible:ring-accent-red/35"
              >
                {t("cta.secondary")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="relative -mt-14 z-10 mb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div
            className="rounded-[2rem] backdrop-blur-sm p-1.5 ring-1 ring-black/[0.06] dark:ring-white/[0.08] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)]"
            style={{
              background:
                "color-mix(in srgb, var(--background) 92%, transparent)",
            }}
          >
            <div
              className="rounded-[calc(2rem-0.375rem)] p-8 sm:p-10"
              style={{ background: "var(--background)" }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <StatBlock
                  value={t("stats.categories")}
                  label={t("stats.categoriesLabel")}
                />
                <StatBlock
                  value={t("stats.subcategories")}
                  label={t("stats.subcategoriesLabel")}
                />
                <StatBlock
                  value={t("stats.locales")}
                  label={t("stats.localesLabel")}
                />
                <StatBlock
                  value={t("stats.price")}
                  label={t("stats.priceLabel")}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden">
        <WhyHowMidWaves />

        {/* ── Why 3YESES ── */}
        <div className="relative py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <span className="marketing-pill inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.22em] font-semibold mb-6 shadow-sm backdrop-blur-md">
              <span className="marketing-accent-text">{t("whySection.eyebrow")}</span>
            </span>
            <h2 className="marketing-hero-title text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">
              {t("whySection.title")}
            </h2>
            <p className="text-lg text-[color-mix(in_srgb,var(--foreground)_68%,transparent)] leading-relaxed">
              {t("whySection.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <FeatureCard
                key={i}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={i}
              />
            ))}
          </div>
        </div>
        </div>

      {/* ── How it works ── */}
        <div className="relative py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left: heading */}
            <div className="lg:sticky lg:top-32 lg:self-start">
              <span className="marketing-pill inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.22em] font-semibold mb-6 shadow-sm backdrop-blur-md">
                <span className="marketing-accent-text">{t("howSection.eyebrow")}</span>
              </span>
              <h2 className="marketing-hero-title text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">
                {t("howSection.title")}
              </h2>
              <p className="text-lg text-[color-mix(in_srgb,var(--foreground)_68%,transparent)] max-w-xl leading-relaxed mb-6">
                {t("howSection.subtitle")}
              </p>

              <div className="hidden lg:flex items-center gap-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 text-sm text-[color-mix(in_srgb,var(--foreground)_56%,transparent)]">
                  <Upload className="w-4 h-4" />
                  <span>{t("howSection.tags.uploads")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[color-mix(in_srgb,var(--foreground)_56%,transparent)]">
                  <Eye className="w-4 h-4" />
                  <span>{t("howSection.tags.views")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[color-mix(in_srgb,var(--foreground)_56%,transparent)]">
                  <Heart className="w-4 h-4" />
                  <span>{t("howSection.tags.likes")}</span>
                </div>
              </div>
            </div>

            {/* Right: steps */}
            <div>
              {steps.map((step, i) => (
                <StepCard
                  key={i}
                  number={i + 1}
                  title={step.title}
                  description={step.description}
                  details={step.details}
                  isLast={i === steps.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ── What you get section ── */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div
            className="rounded-[2.5rem] backdrop-blur-sm p-1.5 ring-1 ring-black/[0.06] dark:ring-white/[0.08]"
            style={{
              background:
                "color-mix(in srgb, var(--background) 92%, transparent)",
            }}
          >
            <div
              className="rounded-[calc(2.5rem-0.375rem)] p-8 sm:p-12 md:p-16"
              style={{ background: "var(--background)" }}
            >
              <div className="text-center max-w-2xl mx-auto mb-14">
                <h2
                  className="text-3xl sm:text-4xl font-extrabold tracking-tighter mb-4"
                  style={{ color: "var(--foreground)" }}
                >
                  {t("included.title")}
                </h2>
                <p
                  className="text-lg"
                  style={{
                    color:
                      "color-mix(in srgb, var(--foreground) 60%, transparent)",
                  }}
                >
                  {t("included.subtitle")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                {[
                  { icon: Upload, text: t("included.items.uploads") },
                  { icon: Layers, text: t("included.items.profile") },
                  { icon: BarChart3, text: t("included.items.analytics") },
                  { icon: Star, text: t("included.items.ranking") },
                  { icon: MessageSquare, text: t("included.items.messaging") },
                  { icon: Eye, text: t("included.items.views") },
                  { icon: Heart, text: t("included.items.likes") },
                  { icon: Globe, text: t("included.items.languages") },
                  { icon: Shield, text: t("included.items.secure") },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-3 last:border-0"
                    style={{
                      borderBottom:
                        "1px solid color-mix(in srgb, var(--foreground) 8%, transparent)",
                    }}
                  >
                    <item.icon
                      className="w-5 h-5 shrink-0"
                      style={{ color: "var(--brand-primary)" }}
                    />
                    <span
                      className="text-[15px] font-medium"
                      style={{ color: "var(--foreground)" }}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative isolate overflow-hidden py-24 md:py-32">
        <WhyHowBg />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="marketing-hero-title text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter mb-5 dark:[text-shadow:0_4px_18px_rgba(0,0,0,0.55)]">
            {t("finalCta.title")}
          </h2>
          <p className="text-lg text-[color-mix(in_srgb,var(--foreground)_68%,transparent)] mb-10 max-w-xl mx-auto leading-relaxed">
            {t("finalCta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${locale}/signup`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-blue to-accent-blue px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-blue/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue/35 dark:from-accent-red dark:to-primary-red dark:shadow-accent-red/20 dark:focus-visible:ring-accent-red/35"
            >
              {t("finalCta.talentButton")} <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={`/${locale}/pricing`}
              className="inline-flex items-center gap-2 rounded-xl marketing-panel border border-gray-200/60 px-8 py-3.5 text-sm font-semibold text-gray-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:text-[var(--marketing-accent)] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue/35 dark:border-red-900/25 dark:text-white dark:focus-visible:ring-accent-red/35"
            >
              {t("finalCta.viewPricing")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
