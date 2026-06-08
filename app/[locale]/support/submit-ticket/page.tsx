'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { LifeBuoy, ArrowLeft, Shield, MessageSquare, Clock } from 'lucide-react';
import Link from 'next/link';
import SupportForm from '@/components/SupportForm';
import SwoopingTick from '@/components/SwoopingTick';

/* ── Background decoration (matches support hub styling) ─ */
function SupportBgDecoration() {
  return (
    <div className="marketing-wave-tone-support absolute inset-0 overflow-hidden pointer-events-none select-none z-0 dark:opacity-90" aria-hidden="true">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="stBg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--wave-veil, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-bg-strong)" />
            <stop offset="70%" stopColor="var(--wave-primary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-bg-soft)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="stWave1" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--wave-primary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-main-strong)" />
            <stop offset="100%" stopColor="var(--wave-secondary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-main-soft)" />
          </linearGradient>
          <linearGradient id="stWave2" x1="1" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--wave-secondary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-secondary-strong)" />
            <stop offset="100%" stopColor="var(--wave-primary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-secondary-soft)" />
          </linearGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#stBg)" />
        <path d="M0 420 Q360 320 720 380 T1440 350 V900 H0Z" fill="url(#stWave1)" />
        <path d="M0 600 Q400 520 800 580 T1440 550 V900 H0Z" fill="url(#stWave2)" />
        <circle cx="200" cy="150" r="200" fill="var(--wave-orb, var(--marketing-wave-accent))" opacity="var(--marketing-wave-orb-opacity)" />
        <circle cx="1250" cy="700" r="260" fill="var(--wave-secondary, var(--marketing-wave-accent))" opacity="var(--marketing-wave-orb-soft-opacity)" />
      </svg>
    </div>
  );
}

export default function SubmitTicketPage() {
  const t = useTranslations('support');
  return (
    <div className="relative min-h-screen overflow-hidden landing-bg brand-true-red isolate">
      <SupportBgDecoration />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">

        {/* Back link */}
        <Link
          href="/support"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-300 hover:text-[var(--marketing-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-ring)] rounded-sm transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToHelp')}
        </Link>

        {/* ── Hero ── */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <span className="marketing-pill inline-flex items-center gap-3 rounded-full px-5 py-2.5 marketing-pill border border-gray-200/60 dark:border-[var(--marketing-pill-border)] shadow-sm">
              <SwoopingTick className="w-9 h-9 shrink-0 marketing-accent-text" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] marketing-accent-text">
                {t('ticketLabel')}
              </span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            <span className="text-gray-900 dark:text-white">{t('submitATicket')} </span>
            {t('ticketAccent') && (t('ticketAccent') as string).trim() !== '' && (
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, var(--brand-primary), var(--brand-accent))' }}
              >
                {t('ticketAccent')}
              </span>
            )}
          </h1>

          <p className="max-w-xl mx-auto text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
            {t('ticketFormDesc')}
          </p>
        </div>

        {/* ── Ticket Form Card ── */}
        <div className="rounded-[2rem] marketing-panel border border-gray-200/50 dark:border-red-400/20 shadow-lg p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <LifeBuoy className="w-6 h-6 marketing-accent-text" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('newSupportTicket')}</h2>
          </div>

          <SupportForm />
        </div>

        {/* ── Trust strip ── */}
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {[
            { icon: <Shield className="w-4 h-4" />, label: t('secureEncrypted') },
            { icon: <Clock className="w-4 h-4" />, label: t('replyTime') },
            { icon: <MessageSquare className="w-4 h-4" />, label: t('trackedDashboard') },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="marketing-pill flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-200 marketing-pill px-4 py-2.5 rounded-full border border-gray-200/50 dark:border-[var(--marketing-pill-border)] shadow-sm"
            >
              <span className="marketing-accent-text">{icon}</span>
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
