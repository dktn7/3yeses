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
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="whBg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-from)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="whWave1" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-from)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--brand-to)" stopOpacity="0.10" />
          </linearGradient>
          <linearGradient id="whWave2" x1="1" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-to)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--brand-from)" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#whBg)" />
        <path d="M0 520 C240 440 480 580 720 510 C960 440 1200 560 1440 490 L1440 900 L0 900 Z" fill="url(#whWave1)" />
        <path d="M0 660 C300 590 580 700 840 630 C1080 560 1280 660 1440 610 L1440 900 L0 900 Z" fill="url(#whWave2)" />
        <path d="M0 80 C360 130 720 40 1080 90 C1260 120 1380 84 1440 98 L1440 0 L0 0 Z" fill="var(--brand-from)" opacity="0.10" />
        <circle cx="180" cy="160" r="220" fill="var(--brand-to)" opacity="0.06" />
        <circle cx="1280" cy="680" r="280" fill="var(--brand-from)" opacity="0.05" />
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
      className="group relative rounded-[1.5rem] bg-white/82 dark:bg-slate-950/76 backdrop-blur-sm p-1.5 ring-1 ring-black/[0.05] dark:ring-white/[0.08] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:ring-[var(--brand-primary)]/20 hover:shadow-[0_16px_48px_-8px_rgba(0,0,0,0.08)]"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="rounded-[calc(1.5rem-0.375rem)] bg-white dark:bg-slate-950/92 p-6 sm:p-8 h-full">
        <div className="h-12 w-12 rounded-2xl bg-[var(--brand-primary)]/10 flex items-center justify-center mb-5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110">
          <Icon className="w-6 h-6 text-[var(--brand-primary)]" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-[15px] leading-relaxed text-gray-600 dark:text-gray-200">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ── Step card ── */
function StepCard({
  number,
  title,
  description,
  details,
}: {
  number: number;
  title: string;
  description: string;
  details: string[];
}) {
  return (
    <div className="relative flex gap-6">
      {/* Vertical connector */}
      <div className="flex flex-col items-center">
        <div className="h-14 w-14 rounded-2xl bg-[var(--brand-primary)] flex items-center justify-center shrink-0 shadow-lg shadow-[var(--brand-primary)]/20">
          <span className="text-xl font-bold text-white">{number}</span>
        </div>
        <div className="w-px flex-1 bg-gradient-to-b from-[var(--brand-primary)]/30 to-transparent mt-3" />
      </div>

      {/* Content */}
      <div className="pb-12 last:pb-0">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
          {title}
        </h3>
        <p className="text-[15px] text-gray-600 dark:text-gray-200 leading-relaxed mb-4 max-w-xl">
          {description}
        </p>
        <ul className="space-y-2">
          {details.map((detail, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-100">
              <CheckCircle2 className="w-4 h-4 text-[var(--brand-primary)] mt-0.5 shrink-0" />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
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
      <div className="text-sm text-gray-500 dark:text-gray-200 mt-1">{label}</div>
    </div>
  );
}

export default async function WhyHowPage({ params }: { params: { locale: string } }) {
  const locale = params?.locale ?? "en-gb";
  const t = await getTranslations("WhyHow");

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
    <main className="min-h-screen" style={{ background: "var(--landing-bg)" }}>

      {/* ── Hero ── */}
      <section className="relative isolate overflow-hidden pt-20 pb-28 md:pb-36">
        <WhyHowBg />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <Breadcrumbs items={[{ label: "Home", href: `/${locale}` }, { label: t("breadcrumb") }]} />

          <div className="max-w-3xl mt-4">
            <span
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-[10px] uppercase tracking-[0.22em] font-semibold border mb-8 shadow-sm backdrop-blur-md"
              style={{
                color: "var(--brand-primary)",
                borderColor: "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
                background: "color-mix(in srgb, var(--brand-primary) 8%, transparent)",
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t("eyebrow")}
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tighter mb-6 text-gray-900 dark:text-white">
              {t("hero.title")}{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(90deg, var(--brand-primary), var(--brand-accent))" }}
              >
                {t("hero.titleAccent")}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-200 mb-10 max-w-2xl leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href={`/${locale}/signup`}
                className="group relative inline-flex items-center gap-2 text-white rounded-full pl-7 pr-2.5 py-3.5 font-semibold text-base shadow-lg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-xl active:scale-[0.98]"
                style={{ background: "linear-gradient(90deg, var(--brand-primary), var(--brand-accent))" }}
              >
                <span>{t("cta.primary")}</span>
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/15 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-105">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
              <Link
                href={`/${locale}/pricing`}
                className="inline-flex items-center px-7 py-3.5 rounded-full ring-1 font-semibold text-base transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[var(--brand-primary)]/5"
                style={{ color: "var(--brand-primary)", borderColor: "color-mix(in srgb, var(--brand-primary) 30%, transparent)" }}
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
          <div className="rounded-[2rem] bg-white/92 dark:bg-slate-950/78 backdrop-blur-sm p-1.5 ring-1 ring-black/[0.05] dark:ring-white/[0.08] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)]">
            <div className="rounded-[calc(2rem-0.375rem)] bg-white dark:bg-slate-950/92 p-8 sm:p-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <StatBlock value={t("stats.categories")} label={t("stats.categoriesLabel")} />
                <StatBlock value={t("stats.subcategories")} label={t("stats.subcategoriesLabel")} />
                <StatBlock value={t("stats.locales")} label={t("stats.localesLabel")} />
                <StatBlock value={t("stats.price")} label={t("stats.priceLabel")} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why 3YESES ── */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.22em] font-semibold border mb-6 shadow-sm backdrop-blur-md"
              style={{
                color: "var(--brand-primary)",
                borderColor: "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
                background: "color-mix(in srgb, var(--brand-primary) 8%, transparent)",
              }}
            >
              {t("whySection.eyebrow")}
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter text-gray-900 dark:text-white mb-4">
              {t("whySection.title")}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-200 leading-relaxed">
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
      </section>

      {/* ── How it works ── */}
      <section className="py-20 md:py-28 bg-gray-50/80 dark:bg-slate-950/55">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left: heading */}
            <div className="lg:sticky lg:top-32 lg:self-start">
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] uppercase tracking-[0.22em] font-semibold border mb-6 shadow-sm backdrop-blur-md"
                style={{
                  color: "var(--brand-primary)",
                  borderColor: "color-mix(in srgb, var(--brand-primary) 20%, transparent)",
                  background: "color-mix(in srgb, var(--brand-primary) 8%, transparent)",
                }}
              >
                {t("howSection.eyebrow")}
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter text-gray-900 dark:text-white mb-5">
                {t("howSection.title")}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-200 max-w-xl leading-relaxed mb-6">
                {t("howSection.subtitle")}
              </p>

              <div className="hidden lg:flex items-center gap-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Upload className="w-4 h-4" />
                  <span>{t("howSection.tags.uploads")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Eye className="w-4 h-4" />
                  <span>{t("howSection.tags.views")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
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
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── What you get section ── */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-[2.5rem] bg-white/92 dark:bg-slate-950/78 backdrop-blur-sm p-1.5 ring-1 ring-black/[0.05] dark:ring-white/[0.08]">
            <div className="rounded-[calc(2.5rem-0.375rem)] bg-white dark:bg-slate-950/92 p-8 sm:p-12 md:p-16">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-gray-900 dark:text-white mb-4">
                  {t("included.title")}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-200">
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
                  <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <item.icon className="w-5 h-5 text-[var(--brand-primary)] shrink-0" />
                    <span className="text-[15px] text-gray-700 dark:text-gray-100">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter mb-5 text-gray-900 dark:text-white">
            {t("finalCta.title")}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-200 mb-10 max-w-xl mx-auto leading-relaxed">
            {t("finalCta.subtitle")}
          </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/${locale}/signup`}
                className="group inline-flex items-center gap-3 text-white px-8 py-4 rounded-full font-semibold text-base shadow-lg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-xl active:scale-[0.98]"
                style={{ background: "linear-gradient(90deg, var(--brand-primary), var(--brand-accent))" }}
              >
                {t("finalCta.talentButton")}
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/15 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              <Link
                href={`/${locale}/pricing`}
                className="inline-flex items-center px-7 py-3.5 rounded-full ring-1 font-semibold text-base transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[var(--brand-primary)]/5"
                style={{ color: "var(--brand-primary)", borderColor: "color-mix(in srgb, var(--brand-primary) 30%, transparent)" }}
              >
                {t("finalCta.viewPricing")}
              </Link>
            </div>
        </div>
      </section>
    </main>
  );
}
