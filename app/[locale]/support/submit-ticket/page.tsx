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
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="stBg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-from)" stopOpacity="0.12" />
            <stop offset="70%" stopColor="var(--brand-to)" stopOpacity="0.06" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="stWave1" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-from)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--brand-to)" stopOpacity="0.06" />
          </linearGradient>
          <linearGradient id="stWave2" x1="1" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-to)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--brand-from)" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#stBg)" />
        <path d="M0 320 Q360 220 720 300 T1440 260 V900 H0Z" fill="url(#stWave1)" />
        <path d="M0 500 Q400 420 800 480 T1440 440 V900 H0Z" fill="url(#stWave2)" />
        <circle cx="200" cy="150" r="200" fill="#0ea5e9" opacity="0.06" />
        <circle cx="1250" cy="700" r="260" fill="#ef4444" opacity="0.05" />
      </svg>
    </div>
  );
}

export default function SubmitTicketPage() {
  const t = useTranslations('support');
  return (
    <div className="relative min-h-screen overflow-hidden">
      <SupportBgDecoration />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">

        {/* Back link */}
        <Link
          href="/support"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary-blue dark:hover:text-accent-red transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToHelp')}
        </Link>

        {/* ── Hero ── */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-5">
            <SwoopingTick className="w-7 h-7 text-primary-blue dark:text-accent-red" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary-blue dark:text-accent-red">
              {t('ticketLabel')}
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
        <div className="rounded-[2rem] backdrop-blur-xl bg-white/60 dark:bg-white/[0.05] border border-gray-200/50 dark:border-white/10 shadow-lg p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <LifeBuoy className="w-6 h-6 text-primary-blue dark:text-accent-red" />
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
              className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-200 backdrop-blur-md bg-white/70 dark:bg-white/[0.06] px-4 py-2.5 rounded-full border border-gray-200/50 dark:border-white/10 shadow-sm"
            >
              <span className="text-primary-blue dark:text-accent-red">{icon}</span>
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
