'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, LifeBuoy, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import SwoopingTick from '@/components/SwoopingTick';

/* ── Background decoration ─ */
function HelpBgDecoration() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 dark:opacity-90" aria-hidden="true">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="helpBg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-from)" stopOpacity="0.16" />
            <stop offset="60%" stopColor="var(--brand-to)" stopOpacity="0.06" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="helpW1" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-from)" stopOpacity="0.20" />
            <stop offset="100%" stopColor="var(--brand-to)" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="helpW2" x1="1" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-to)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--brand-from)" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#helpBg)" />
        <path d="M0 350 Q360 250 720 330 T1440 290 V900 H0Z" fill="url(#helpW1)" />
        <path d="M0 550 Q400 470 800 530 T1440 490 V900 H0Z" fill="url(#helpW2)" />
        <path d="M0 60 C360 120 720 30 1080 80 C1260 110 1380 70 1440 90 L1440 0 L0 0 Z" fill="var(--brand-from)" opacity="0.10" />
        <circle cx="200" cy="150" r="200" fill="var(--brand-to)" opacity="0.08" />
        <circle cx="1250" cy="700" r="260" fill="var(--brand-from)" opacity="0.07" />
      </svg>
    </div>
  );
}

/* ── FAQ Accordion ─ */
function HelpFAQ({ items }: { items: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="rounded-xl border border-gray-200/60 dark:border-red-400/20 overflow-hidden backdrop-blur-sm bg-light-surface dark:bg-dark-surface transition-shadow hover:shadow-sm"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue/30 dark:focus-visible:ring-accent-red/35"
            >
              <span className="font-semibold text-gray-900 dark:text-white text-sm">{item.q}</span>
              <ChevronDown
                className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div className={`transition-all duration-200 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-5 pb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Help Content Block ─ */
function HelpContent({ items }: { items: { title: string; content: string }[] }) {
  return (
    <div className="space-y-6">
      {items.map((item, idx) => (
        <div key={idx}>
          <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">{item.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.content}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Main Help Section Page Layout ─ */
export interface HelpSectionPageProps {
  icon: React.ReactNode;
  label: string;
  title: string;
  titleAccent?: string;
  description: string;
  faqs: { q: string; a: string }[];
  guides: { title: string; content: string }[];
  ticketCategory: string;
}

export default function HelpSectionPage({
  icon,
  label,
  title,
  titleAccent,
  description,
  faqs,
  guides,
  ticketCategory,
}: HelpSectionPageProps) {
  const t = useTranslations('support');
  return (
    <div className="relative min-h-screen overflow-hidden landing-bg brand-true-red isolate">
      <HelpBgDecoration />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">

        {/* Back link */}
        <Link
          href="/support"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-primary-blue dark:hover:text-accent-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue/30 dark:focus-visible:ring-accent-red/35 rounded-sm transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToHelp')}
        </Link>

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="marketing-pill mb-5 inline-flex items-center justify-center gap-3 rounded-full border border-primary-blue/20 bg-light-surface px-5 py-2.5 shadow-sm backdrop-blur-md dark:border-[var(--marketing-pill-border)] dark:bg-dark-surface">
            <SwoopingTick className="h-8 w-8 shrink-0 text-primary-blue dark:text-accent-red" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary-blue dark:text-accent-red">
              {label}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            <span className="text-gray-900 dark:text-white">{title} </span>
            {titleAccent && titleAccent.trim() !== '' && (
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, var(--brand-primary), var(--brand-accent))' }}
              >
                {titleAccent}
              </span>
            )}
          </h1>

          <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
            {description}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Main content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Guides */}
            {guides.length > 0 && (
              <div className="rounded-[2rem] backdrop-blur-xl bg-light-surface dark:bg-dark-surface border border-gray-200/50 dark:border-red-400/20 shadow-lg p-8">
                <div className="flex items-center gap-3 mb-6">
                  {icon}
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('quickGuide')}</h2>
                </div>
                <HelpContent items={guides} />
              </div>
            )}

            {/* FAQ */}
            {faqs.length > 0 && (
              <div className="rounded-[2rem] backdrop-blur-xl bg-light-surface dark:bg-dark-surface border border-gray-200/50 dark:border-red-400/20 shadow-lg p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  {t('faqTitle')}
                </h2>
                <HelpFAQ items={faqs} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-2 space-y-5">
            <Link
              href={`/support/submit-ticket`}
              className="group flex items-center gap-3 rounded-[1.5rem] backdrop-blur-xl bg-light-surface dark:bg-dark-surface border border-gray-200/50 dark:border-red-400/20 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-primary-blue/30 dark:hover:border-red-300/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue/30 dark:focus-visible:ring-accent-red/35 transition-all duration-300 p-6"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-blue/10 to-accent-blue/10 dark:from-accent-red/10 dark:to-primary-red/10 flex items-center justify-center flex-shrink-0">
                <LifeBuoy className="w-5 h-5 text-primary-blue dark:text-accent-red" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-primary-blue dark:group-hover:text-accent-red transition-colors">
                  {t('stillNeedHelp')}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('submitTicketLink')}
                </p>
              </div>
            </Link>

            <div className="rounded-[1.5rem] backdrop-blur-xl bg-light-surface dark:bg-dark-surface border border-gray-200/50 dark:border-red-400/20 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">{t('relatedTopics')}</h3>
              <div className="space-y-2">
                {[
                  { href: '/support/account', label: t('topicAccount') },
                  { href: '/support/billing', label: t('topicBilling') },
                  { href: '/support/portfolio', label: t('topicPortfolio') },
                  { href: '/support/categories', label: t('topicCategories') },
                  { href: '/support/notifications', label: t('topicNotifications') },
                  { href: '/support/security', label: t('topicSecurity') },
                ]
                  .filter((t) => t.label.toLowerCase() !== ticketCategory.toLowerCase())
                  .slice(0, 4)
                  .map((topic) => (
                    <Link
                      key={topic.href}
                      href={topic.href}
                      className="block text-sm text-gray-600 dark:text-gray-300 hover:text-primary-blue dark:hover:text-accent-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue/30 dark:focus-visible:ring-accent-red/35 rounded-sm transition-colors py-1"
                    >
                      {topic.label}
                    </Link>
                  ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
