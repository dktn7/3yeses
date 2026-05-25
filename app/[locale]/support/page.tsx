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

/* FAQ and help topic content comes from translations (support.faqItems and support topics keys) */

/* ── Background decoration (reuses pricing page "Layered Waves" style) ─ */
function SupportBgDecoration() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 dark:opacity-90" aria-hidden="true">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="supBg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-from)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="supWave1" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-from)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--brand-to)" stopOpacity="0.10" />
          </linearGradient>
          <linearGradient id="supWave2" x1="1" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-to)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--brand-from)" stopOpacity="0.08" />
          </linearGradient>
          <radialGradient id="supGlow" cx="50%" cy="0%" r="70%">
            <stop offset="0%" stopColor="var(--brand-glow)" stopOpacity="0.20" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#supBg)" />
        <rect width="1440" height="900" fill="url(#supGlow)" />
        <path d="M0 420 Q360 320 720 380 T1440 350 V900 H0Z" fill="url(#supWave1)" />
        <path d="M0 600 Q400 520 800 580 T1440 550 V900 H0Z" fill="url(#supWave2)" />
        <path d="M0 56 C360 108 720 28 1080 74 C1260 98 1380 70 1440 82 L1440 0 L0 0 Z" fill="var(--hero-top-wave, var(--brand-from))" opacity="0.12" />
        <circle cx="200" cy="150" r="200" fill="var(--brand-to)" opacity="0.10" />
        <circle cx="1250" cy="700" r="260" fill="var(--brand-from)" opacity="0.08" />
        <circle cx="720" cy="450" r="300" fill="var(--brand-glow)" opacity="0.04" />
      </svg>
    </div>
  );
}

export default function SupportPage() {
  const t = useTranslations('support');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Load FAQ items from translations (support.faqItems). Fall back to default list.
  const rawFaq = t('faqItems') as unknown;
  const localeFaqs = Array.isArray(rawFaq) ? (rawFaq as Array<{ category: string; q: string; a: string }>) : [];
  const FAQ_ITEMS = localeFaqs.length ? localeFaqs : DEFAULT_FAQ_ITEMS;

  // Help topics built from translation keys
  const HELP_TOPICS = [
    { icon: User, title: t('topicAccount'), desc: t('accountDesc'), slug: 'account' },
    { icon: CreditCard, title: t('topicBilling'), desc: t('billingDesc'), slug: 'billing' },
    { icon: Layers, title: t('topicCategories'), desc: t('categoriesDesc'), slug: 'categories' },
    { icon: ImageIcon, title: t('topicPortfolio'), desc: t('portfolioDesc'), slug: 'portfolio' },
    { icon: MessageSquare, title: t('topicNotifications'), desc: t('notificationsDesc'), slug: 'notifications' },
    { icon: Shield, title: t('topicSecurity'), desc: t('securityDesc'), slug: 'security' },
  ];

  // Unique FAQ categories for filter
  const faqCategories = useMemo(() => [...new Set(FAQ_ITEMS.map(f => f.category))], [FAQ_ITEMS]);

  // Search FAQ items
  const matchingFAQs = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return FAQ_ITEMS.filter(
      f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
    );
  }, [searchQuery, FAQ_ITEMS]);

  // Filter help topics
  const filteredTopics = HELP_TOPICS.filter(t =>
    !searchQuery ||
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Highlight search matches
  const highlight = (text: string) => {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
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

        {/* ── Hero ── */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <span className="marketing-pill inline-flex items-center gap-3 rounded-full px-5 py-2.5 border border-[var(--marketing-pill-border)] shadow-sm">
              <SwoopingTick className="w-9 h-9 shrink-0 marketing-accent-text" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] marketing-accent-text">
                {t('helpCentre')}
              </span>
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-5 support-hero-strong">
            <span className="text-gray-900 dark:text-white">{t('heroTitle')} </span>
            {t('heroAccent') && (t('heroAccent') as string).trim() !== '' && (
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, var(--brand-primary), var(--brand-accent))' }}
              >
                {t('heroAccent')}
              </span>
            )}
          </h1>

          <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed mb-8">
            {t('heroDesc')}
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto">
            <div className="relative group">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[var(--marketing-accent)] transition-colors" />
              <input
                type="text"
                aria-label={t('searchPlaceholder')}
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="marketing-panel w-full border border-[var(--marketing-border)] rounded-full pl-12 pr-10 py-3.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-ring)] focus:border-[var(--marketing-accent)] transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={t('clearSearch')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {t('topicsFound', { topics: filteredTopics.length, faqs: matchingFAQs.length })}
              </p>
            )}
          </div>
        </div>

        {/* ── FAQ search results (only shown when searching) ── */}
        {searchQuery.trim() && matchingFAQs.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 marketing-accent-text" />
              {t('matchingFAQs')}
            </h2>
            <div className="space-y-3">
              {matchingFAQs.slice(0, 5).map((faq, idx) => (
                <div
                  key={idx}
                  className="marketing-panel rounded-xl border border-[var(--marketing-border)] overflow-hidden p-5"
                >
                  <span className="block text-[0.65rem] font-bold uppercase tracking-widest marketing-accent-text mb-1">
                    {faq.category}
                  </span>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                    {highlight(faq.q)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {highlight(faq.a)}
                  </p>
                </div>
              ))}
              {matchingFAQs.length > 5 && (
                <a
                  href="#faq-section"
                  className="inline-flex items-center gap-1 text-sm font-semibold marketing-accent-text no-underline hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-ring)] rounded-sm"
                >
                  {t('viewAllMatching', { count: matchingFAQs.length })} <ArrowRight className="w-3 h-3" />
                </a>
              )}
            </div>
          </section>
        )}

        {/* ── Help topics grid ── */}
        <section className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTopics.map((topic) => {
                const Icon = topic.icon;
                return (
                  <Link
                    key={topic.title}
                    href={`/support/${topic.slug}`}
                    className="marketing-panel group text-left rounded-[1.5rem] border border-[var(--marketing-border)] p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--marketing-ring)] !no-underline hover:!no-underline"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[color-mix(in_srgb,var(--marketing-accent)_18%,transparent)] to-[color-mix(in_srgb,var(--marketing-accent-strong)_16%,transparent)] flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 marketing-accent-text" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-[var(--marketing-accent)] transition-colors">
                      {topic.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                      {topic.desc}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold marketing-accent-text opacity-0 group-hover:opacity-100 transition-opacity">
                      {t('learnMore')} <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                );
              })}
          </div>
        </section>

        {/* ── Submit Ticket CTA ── */}
        <section className="mb-16">
          <Link
            href="/support/submit-ticket"
            className="marketing-panel group flex items-center justify-between rounded-[2rem] border border-[var(--marketing-border)] p-8 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 !no-underline hover:!no-underline"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--marketing-accent)] to-[var(--marketing-accent-strong)] flex items-center justify-center shadow-lg">
                <LifeBuoy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 dark:text-white text-lg group-hover:text-[var(--marketing-accent)] transition-colors">
                  {t('submitTicket')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                  {t('submitTicketDesc')}
                </p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 marketing-accent-text opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Link>
        </section>

        {/* ── FAQ Section ── */}
        <section id="faq-section">
          <div className="rounded-[2rem] marketing-panel border border-gray-200/50 dark:border-red-400/20 shadow-lg p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-6 h-6 marketing-accent-text" />
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {t('faqTitle')}
              </h2>
            </div>
            <SupportFAQ />
          </div>
        </section>

        {/* ── Trust strip ── */}
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          {[
            { icon: <Shield className="w-4 h-4" />, label: t('secureEncrypted') },
            { icon: <MessageSquare className="w-4 h-4" />, label: t('replyTime') },
            { icon: <Mail className="w-4 h-4" />, label: t('trackedDashboard') },
          ].map(({ icon, label }) => (
            <div key={label} className="marketing-pill flex items-center gap-2.5 text-sm text-gray-700 dark:text-slate-50 px-4 py-2.5 rounded-full border border-[var(--marketing-pill-border)] shadow-sm">
              <span className="marketing-accent-text">{icon}</span>
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
