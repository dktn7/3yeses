'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Globe, Heart, Users, Sparkles, Camera, Music, Star, ArrowRight,
  Shield, Mic, Video, Palette, TrendingUp, BarChart3, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import SwoopingTick from '@/components/SwoopingTick';
import Breadcrumbs from '@/components/Breadcrumbs';

/* ── Background decoration ─────────────────────────────────────────── */
function AboutBgDecoration() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="abBg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-from)" stopOpacity="0.22" />
            <stop offset="55%" stopColor="var(--brand-to)" stopOpacity="0.10" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="abW1" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-from)" stopOpacity="0.30" />
            <stop offset="100%" stopColor="var(--brand-to)" stopOpacity="0.14" />
          </linearGradient>
          <linearGradient id="abW2" x1="1" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-to)" stopOpacity="0.24" />
            <stop offset="100%" stopColor="var(--brand-from)" stopOpacity="0.08" />
          </linearGradient>
          <radialGradient id="abGlow" cx="50%" cy="0%" r="70%">
            <stop offset="0%" stopColor="var(--brand-glow)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#abBg)" />
        <rect width="1440" height="900" fill="url(#abGlow)" />
        <path d="M0 600 C240 520 480 660 720 590 C960 520 1200 620 1440 560 L1440 900 L0 900 Z" fill="url(#abW1)" opacity="0.34" />
        <path d="M0 700 C320 640 560 740 800 680 C1040 620 1280 710 1440 670 L1440 900 L0 900 Z" fill="url(#abW2)" opacity="0.26" />
        <path d="M0 56 C360 108 720 28 1080 74 C1260 98 1380 70 1440 82 L1440 0 L0 0 Z" fill="var(--hero-top-wave, var(--brand-from))" opacity="0.16" />
        <circle cx="200" cy="150" r="200" fill="var(--brand-to)" opacity="0.14" />
        <circle cx="1250" cy="700" r="260" fill="var(--brand-from)" opacity="0.12" />
        <circle cx="720" cy="400" r="280" fill="var(--brand-glow)" opacity="0.06" />
      </svg>
    </div>
  );
}

/* ── Value card data ───────────────────────────────────────────────── */
const VALUES = [
  { icon: Globe, titleKey: 'values.openTitle', descKey: 'values.openDesc' },
  { icon: Heart, titleKey: 'values.diversityTitle', descKey: 'values.diversityDesc' },
  { icon: Users, titleKey: 'values.communityTitle', descKey: 'values.communityDesc' },
  { icon: Shield, titleKey: 'values.fairTitle', descKey: 'values.fairDesc' },
];

/* ── Feature highlights ────────────────────────────────────────────── */
const FEATURES = [
  { icon: Camera, titleKey: 'features.photoTitle', descKey: 'features.photoDesc' },
  { icon: Video, titleKey: 'features.videoTitle', descKey: 'features.videoDesc' },
  { icon: Music, titleKey: 'features.audioTitle', descKey: 'features.audioDesc' },
  { icon: BarChart3, titleKey: 'features.analyticsTitle', descKey: 'features.analyticsDesc' },
  { icon: TrendingUp, titleKey: 'features.rankingTitle', descKey: 'features.rankingDesc' },
  { icon: Palette, titleKey: 'features.customTitle', descKey: 'features.customDesc' },
  { icon: Mic, titleKey: 'features.categoriesTitle', descKey: 'features.categoriesDesc' },
  { icon: Star, titleKey: 'features.verifyTitle', descKey: 'features.verifyDesc' },
  { icon: ImageIcon, titleKey: 'features.hubTitle', descKey: 'features.hubDesc' },
];

/* ── Category list ─────────────────────────────────────────────────── */
const TALENT_CATEGORIES = [
  'Actors', 'Musicians', 'Models', 'Dancers', 'Voice Artists',
  'DJs', 'Photographers', 'Videographers', 'Presenters', 'Comedians',
  'Singers', 'Instrumentalists', 'Stage Performers', 'Street Artists', 'Digital Creators',
];

export default function AboutPage() {
  const t = useTranslations('About');
  const emphasisToken = '__EVERYONE__';
  const heroDescription = t('hero.description', { everyone: emphasisToken });
  const [heroBefore, heroAfter = ''] = heroDescription.split(emphasisToken);

  return (
    <div className="relative min-h-screen overflow-hidden landing-bg brand-true-red isolate">
      <AboutBgDecoration />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">

        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: t('badge') || 'About' }]} />
        <div className="text-center mb-20">
            <div className="flex justify-center mb-6">
            <span className="marketing-pill inline-flex items-center gap-3 rounded-full px-5 py-2.5 marketing-pill border border-gray-200/60 dark:border-[var(--marketing-pill-border)] shadow-sm">
              <SwoopingTick className="w-9 h-9 shrink-0 marketing-accent-text" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] marketing-accent-text">
                {t('badge')}
              </span>
            </span>
          </div>

          <h1 className="marketing-hero-title text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            <span>{t('hero.title')}</span>
            <span className="marketing-yes-accent">
              {t('hero.accent')}
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
            {heroBefore}
            <strong className="text-gray-900 dark:text-white">{t('hero.everyone')}</strong>
            {heroAfter}
          </p>
        </div>

        {/* ── Origin Story ── */}
        <section className="mb-20">
          <div className="rounded-[2rem] marketing-panel border border-gray-200/50 dark:border-red-900/25 shadow-lg p-8 md:p-12">
            <h2 className="marketing-hero-title text-2xl sm:text-3xl font-extrabold tracking-tight mb-6">
              {t('origin.title')}
            </h2>
            <div className="space-y-5 text-gray-600 dark:text-gray-300 leading-relaxed">
              <p>{t('origin.p1')}</p>
              <p>
                {t('origin.p2start')}<strong className="text-gray-900 dark:text-white">{t('origin.p2bold')}</strong>{t('origin.p2end')}
              </p>
              <p>{t('origin.p3')}</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {t('origin.p4')}
              </p>
            </div>
          </div>
        </section>

        {/* ── Values Grid ── */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="marketing-hero-title text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              {t('values.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
              {t('values.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.titleKey}
                  className="rounded-[1.5rem] marketing-panel border border-gray-200/50 dark:border-red-900/25 p-7 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-primary-blue/30 dark:hover:border-red-800/35 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 12%, transparent), color-mix(in srgb, var(--brand-accent) 12%, transparent))' }}>
                    <Icon className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{t(v.titleKey)}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{t(v.descKey)}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Categories Strip ── */}
        <section className="mb-20">
          <div className="rounded-[2rem] backdrop-blur-xl bg-gradient-to-r from-primary-blue/5 to-accent-blue/5 dark:from-accent-red/5 dark:to-primary-red/5 border border-primary-blue/20 dark:border-accent-red/20 p-8 md:p-10 text-center">
            <h2 className="marketing-hero-title text-2xl font-extrabold tracking-tight mb-3">
              {t('categories.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-xl mx-auto text-sm">
              {t('categories.subtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {TALENT_CATEGORIES.map((cat) => (
                <span
                  key={cat}
                  className="marketing-pill px-4 py-2 rounded-full text-sm font-medium marketing-pill border border-gray-200/50 dark:border-[var(--marketing-pill-border)] text-gray-700 dark:text-slate-50 shadow-sm"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Platform Features ── */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="marketing-hero-title text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
              {t('features.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.titleKey}
                  className="rounded-[1.5rem] marketing-panel border border-gray-200/50 dark:border-red-900/25 p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-primary-blue/30 dark:hover:border-red-800/35 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-blue/10 to-accent-blue/10 dark:from-accent-red/10 dark:to-primary-red/10 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 marketing-accent-text" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{t(f.titleKey)}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{t(f.descKey)}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="mb-20">
          <div className="rounded-[2rem] marketing-panel border border-gray-200/50 dark:border-red-900/25 shadow-lg p-8 md:p-12">
            <h2 className="marketing-hero-title text-2xl sm:text-3xl font-extrabold tracking-tight mb-8 text-center">
              {t('howItWorks.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', titleKey: 'howItWorks.step1Title', descKey: 'howItWorks.step1Desc' },
                { step: '02', titleKey: 'howItWorks.step2Title', descKey: 'howItWorks.step2Desc' },
                { step: '03', titleKey: 'howItWorks.step3Title', descKey: 'howItWorks.step3Desc' },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-blue to-accent-blue dark:from-accent-red dark:to-primary-red mb-3">
                    {s.step}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{t(s.titleKey)}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{t(s.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="text-center">
          <div className="rounded-[2rem] backdrop-blur-xl bg-gradient-to-r from-primary-blue/5 to-accent-blue/5 dark:from-accent-red/5 dark:to-primary-red/5 border border-primary-blue/20 dark:border-accent-red/20 p-10 md:p-14">
            <Sparkles className="w-8 h-8 marketing-accent-text mx-auto mb-4" />
            <h2 className="marketing-hero-title text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto mb-8">
              {t('cta.description')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-blue to-accent-blue dark:from-accent-red dark:to-primary-red text-white font-semibold px-8 py-3.5 text-sm shadow-lg shadow-primary-blue/20 dark:shadow-accent-red/20 hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue/35 dark:focus-visible:ring-accent-red/35 transition-all duration-200"
              >
                {t('cta.getStarted')} <ArrowRight className="w-4 h-4" />
              </Link>
            <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-xl marketing-panel border border-gray-200/60 dark:border-red-900/25 text-gray-900 dark:text-white font-semibold px-8 py-3.5 text-sm shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:text-[var(--marketing-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue/35 dark:focus-visible:ring-accent-red/35 transition-all duration-200"
              >
                {t('cta.viewPricing')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
