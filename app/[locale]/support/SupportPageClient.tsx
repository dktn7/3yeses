'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  HelpCircle, User, CreditCard, Search as SearchIcon, Image as ImageIcon,
  Shield, Layers, MessageSquare, BookOpen, ArrowRight, LifeBuoy, Mail, ChevronDown, X
} from 'lucide-react';
import Link from 'next/link';
import SupportFAQ, { FAQ_ITEMS as DEFAULT_FAQ_ITEMS } from '@/components/SupportFAQ';
import SwoopingTick from '@/components/SwoopingTick';
import Breadcrumbs from '@/components/Breadcrumbs';

export type FaqItem = { category: string; q: string; a: string };

interface SupportPageClientProps {
  faqItems: FaqItem[];
}

export default function SupportPageClient({ faqItems }: SupportPageClientProps) {
  const t = useTranslations('support');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const FAQ_ITEMS = faqItems.length ? faqItems : DEFAULT_FAQ_ITEMS;

  const HELP_TOPICS = [
    { icon: User, title: t('topicAccount'), desc: t('accountDesc'), slug: 'account' },
    { icon: CreditCard, title: t('topicBilling'), desc: t('billingDesc'), slug: 'billing' },
    { icon: Layers, title: t('topicCategories'), desc: t('categoriesDesc'), slug: 'categories' },
    { icon: ImageIcon, title: t('topicPortfolio'), desc: t('portfolioDesc'), slug: 'portfolio' },
    { icon: MessageSquare, title: t('topicNotifications'), desc: t('notificationsDesc'), slug: 'notifications' },
    { icon: Shield, title: t('topicSecurity'), desc: t('securityDesc'), slug: 'security' },
  ];

  const faqCategories = useMemo(() => [...new Set(FAQ_ITEMS.map(f => f.category))], [FAQ_ITEMS]);

  const matchingFAQs = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return FAQ_ITEMS.filter(
      f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
    );
  }, [searchQuery, FAQ_ITEMS]);

  const filteredTopics = HELP_TOPICS.filter(t =>
    !searchQuery ||
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const highlight = (text: string) => {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-700/50 rounded px-0.5">{part}</mark>
        : part
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden landing-bg brand-true-red isolate">
      <SupportBgDecoration />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">

        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Support' }]} />

        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <span className="marketing-pill inline-flex items-center gap-3 rounded-full px-5 py-2.5 border border-[var(--marketing-pill-border)] shadow-sm">
              <SwoopingTick className="w-9 h-9 shrink-0 marketing-accent-text" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] marketing-accent-text">
                {t('helpCentre')}
              </span>
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-5 text-gray-900 dark:text-white">
            <span>{t('heroTitle')} </span>
            {t('heroAccent') && (t('heroAccent') as string).trim() !== '' && (
              <span className="marketing-yes-accent">
                {t('heroAccent')}
              </span>
            )}
          </h1>

          <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed mb-8">
            {t('heroDesc')}
          </p>

          <div className="max-w-xl mx-auto">
            <div className="relative group">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[var(--marketing-accent)] transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-3xl border border-gray-200 bg-white/90 py-4 pl-12 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[var(--marketing-accent)] focus:ring-2 focus:ring-[var(--marketing-ring)] dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                placeholder={t('searchPlaceholder')}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_minmax(300px,420px)]">
          <div className="space-y-8">
            <div className="rounded-[2rem] border border-gray-200/70 bg-white/90 p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-950/90">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{t('faqHeading')}</p>
                  <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-blue-950 dark:text-white">
                    {t('faqTitle')}
                  </h2>
                </div>
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-900 dark:bg-red-900/20 dark:text-red-100">
                  {FAQ_ITEMS.length} {t('faqCountLabel')}
                </span>
              </div>

              <div className="mb-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('')}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${categoryFilter === '' ? 'border-blue-700 bg-blue-50 text-blue-900' : 'border-gray-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/60'}`}
                >
                  {t('allCategories')}
                </button>
                {faqCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setCategoryFilter(category)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${categoryFilter === category ? 'border-blue-700 bg-blue-50 text-blue-900' : 'border-gray-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/60'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <SupportFAQ faqItems={FAQ_ITEMS} />
            </div>
          </div>

          <aside className="space-y-8">
            <div className="rounded-[2rem] border border-gray-200/70 bg-white/90 p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-950/90">
              <div className="mb-6 flex items-center gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-red-900/20 dark:text-red-100">
                  <LifeBuoy className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-950 dark:text-white">{t('needHelp')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('needHelpDesc')}</p>
                </div>
              </div>
              <Link href="/support/submit-ticket" className="inline-flex items-center justify-center rounded-full bg-blue-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 dark:bg-red-500 dark:hover:bg-red-400">
                {t('submitTicket')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SupportBgDecoration() {
  return (
    <div className="marketing-wave-tone-support absolute inset-0 overflow-hidden pointer-events-none select-none z-0 dark:opacity-90" aria-hidden="true">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="supBg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--wave-veil, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-bg-strong)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="supWave1" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--wave-primary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-main-strong)" />
            <stop offset="100%" stopColor="var(--wave-secondary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-main-soft)" />
          </linearGradient>
          <linearGradient id="supWave2" x1="1" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--wave-secondary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-secondary-strong)" />
            <stop offset="100%" stopColor="var(--wave-primary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-secondary-soft)" />
          </linearGradient>
          <radialGradient id="supGlow" cx="50%" cy="0%" r="70%">
            <stop offset="0%" stopColor="var(--brand-glow)" stopOpacity="var(--marketing-wave-bg-strong)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#supBg)" />
        <rect width="1440" height="900" fill="url(#supGlow)" />
        <path d="M0 420 Q360 320 720 380 T1440 350 V900 H0Z" fill="url(#supWave1)" />
        <path d="M0 600 Q400 520 800 580 T1440 550 V900 H0Z" fill="url(#supWave2)" />
        <path d="M0 56 C360 108 720 28 1080 74 C1260 98 1380 70 1440 82 L1440 0 L0 0 Z" fill="var(--wave-secondary, var(--marketing-wave-accent))" opacity="var(--marketing-wave-top-opacity)" />
        <circle cx="200" cy="150" r="200" fill="var(--wave-orb, var(--marketing-wave-accent))" opacity="var(--marketing-wave-orb-opacity)" />
        <circle cx="1250" cy="700" r="260" fill="var(--wave-secondary, var(--marketing-wave-accent))" opacity="var(--marketing-wave-orb-soft-opacity)" />
        <circle cx="720" cy="450" r="300" fill="var(--brand-glow)" opacity="var(--marketing-wave-orb-soft-opacity)" />
      </svg>
    </div>
  );
}
