'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import SwoopingTick from '@/components/SwoopingTick';

/* ── Background decoration ─────────────────────────────────────────── */
function TermsBgDecoration() {
  return (
    <div className="marketing-wave-tone-support absolute inset-0 overflow-hidden pointer-events-none select-none z-0 dark:opacity-90" aria-hidden="true">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tBg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--wave-veil, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-bg-strong)" />
            <stop offset="60%" stopColor="var(--wave-primary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-bg-soft)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="tWave1" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--wave-primary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-main-strong)" />
            <stop offset="100%" stopColor="var(--wave-secondary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-main-soft)" />
          </linearGradient>
          <linearGradient id="tWave2" x1="1" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--wave-secondary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-secondary-strong)" />
            <stop offset="100%" stopColor="var(--wave-primary, var(--marketing-wave-accent))" stopOpacity="var(--marketing-wave-secondary-soft)" />
          </linearGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#tBg)" />
        <path d="M0 430 Q360 330 720 400 T1440 370 V900 H0Z" fill="url(#tWave1)" />
        <path d="M0 620 Q400 550 800 600 T1440 560 V900 H0Z" fill="url(#tWave2)" />
        <path d="M0 52 C360 104 720 26 1080 72 C1260 96 1380 68 1440 80 L1440 0 L0 0 Z" fill="var(--wave-secondary, var(--marketing-wave-accent))" opacity="var(--marketing-wave-top-opacity)" />
        <circle cx="200" cy="100" r="200" fill="var(--wave-orb, var(--marketing-wave-accent))" opacity="var(--marketing-wave-orb-opacity)" />
        <circle cx="1250" cy="800" r="260" fill="var(--wave-secondary, var(--marketing-wave-accent))" opacity="var(--marketing-wave-orb-soft-opacity)" />
      </svg>
    </div>
  );
}

/* ── Section component ─────────────────────────────────────────────── */
function Section({ id, number, title, children }: { id: string; number: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-baseline gap-2">
        <span className="marketing-accent-text font-mono text-sm">{number}.</span>
        {title}
      </h2>
      <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

const LAST_UPDATED = '9 March 2026';

export default function TermsPage() {
  const t = useTranslations('Pages.terms');
  const heroAccent = t('heroAccent');
  return (
    <div className="relative min-h-screen overflow-hidden landing-bg brand-true-red">
      <TermsBgDecoration />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex justify-center mb-5">
            <span className="marketing-pill inline-flex items-center gap-3 rounded-full px-5 py-2.5 marketing-pill border border-gray-200/60 dark:border-[var(--marketing-pill-border)] shadow-sm">
              <SwoopingTick className="w-9 h-9 shrink-0 marketing-accent-text" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] marketing-accent-text">
                {t('badge')}
              </span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            <span className="text-gray-900 dark:text-white">
              {t('heroTitle')}{heroAccent ? ` ${heroAccent}` : null}
            </span>
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* Table of Contents */}
        <nav className="rounded-[1.5rem] marketing-panel border border-gray-200/50 dark:border-red-400/20 shadow-sm p-6 mb-10">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">{t('contents')}</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm">
            {[
              ['overview', 'Overview'],
              ['eligibility', 'Eligibility & Accounts'],
              ['subscription', 'Subscription & Payment'],
              ['content', 'Your Content'],
              ['conduct', 'Acceptable Use'],
              ['ip', 'Intellectual Property'],
              ['analytics', 'Analytics & Data'],
              ['privacy', 'Privacy & Cookies'],
              ['termination', 'Termination'],
              ['liability', 'Limitation of Liability'],
              ['changes', 'Changes to Terms'],
              ['contact', 'Contact'],
            ].map(([id, label], i) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="rounded-sm text-gray-600 dark:text-slate-200 hover:text-[var(--marketing-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-ring)] transition-colors"
                >
                  <span className="marketing-accent-text font-mono mr-1.5">{i + 1}.</span>
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Terms Content */}
        <div className="rounded-[2rem] marketing-panel border border-gray-200/50 dark:border-red-400/20 shadow-lg p-8 md:p-12 space-y-10">

          <Section
            id="overview"
            number="1"
            title={t.has('sections.overview.title') ? t('sections.overview.title') : 'Overview'}
          >
            <p>{t('sections.overview.p1')}</p>
            <p>{t('sections.overview.p2')}</p>
          </Section>

          <Section id="eligibility" number="2" title="Eligibility & Accounts">
            <p>
              <strong className="text-gray-900 dark:text-white">Age requirements:</strong> You must be at least 13 years old to create an account.
              Users aged 13–17 require parental or guardian consent. Users under 13 must have a parent-managed account
              where the parent or guardian registers and manages the account on their behalf.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Account responsibility:</strong> You are responsible for maintaining the confidentiality
              of your login credentials and for all activity under your account. Use a strong, unique password. Notify us
              immediately if you suspect unauthorised access.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">One account per person:</strong> Each individual may maintain only one account.
              Duplicate accounts may be suspended without notice.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Accurate information:</strong> You must provide accurate, current information during
              registration and keep your profile information up to date. Fraudulent or misleading profiles may be removed.
            </p>
          </Section>

          <Section id="subscription" number="3" title="Subscription & Payment">
            <p>
              <strong className="text-gray-900 dark:text-white">Subscription is mandatory.</strong> An active subscription is required to use the Platform.
              You subscribe during the sign-up process. Without an active subscription, you cannot access the Platform.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Plans and pricing:</strong> We offer one plan — Standard Access — with two duration options:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-gray-900 dark:text-white">6 months</strong> — £10, billed as a recurring subscription via Stripe.</li>
              <li><strong className="text-gray-900 dark:text-white">12 months</strong> — £20, billed as a recurring subscription via Stripe.</li>
            </ul>
            <p>
              Both plans include identical features: unlimited portfolio uploads, full profile customisation,
              priority search ranking, and full dashboard analytics.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Payment processing:</strong> All payments are processed securely by Stripe.
              We do not store your card details. Stripe is PCI DSS Level 1 certified.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Cancellation:</strong> You may cancel your subscription at any time from your Dashboard.
              Upon cancellation, you retain access until the end of your current billing period. After that, your account
              access is paused. Your profile data and portfolio are preserved and will be available if you resubscribe.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Refunds:</strong> Refund requests for technical issues must be submitted within 14 days
              of payment and are assessed on a case-by-case basis via our support ticket system.
            </p>
          </Section>

          <Section id="content" number="4" title="Your Content">
            <p>
              <strong className="text-gray-900 dark:text-white">Ownership:</strong> You retain full ownership of all content you upload to the Platform,
              including photos, videos, audio files, and text. By uploading content, you grant 3YESES a non-exclusive,
              worldwide, royalty-free licence to display, distribute, and promote your content on the Platform and in
              marketing materials related to the Platform.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Permitted content:</strong> You may upload images (JPEG, PNG, WebP), videos (MP4, MOV),
              and audio files (MP3, WAV). Individual files must not exceed 50 MB. You may also embed external video links
              (e.g. YouTube, Vimeo).
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Prohibited content:</strong> You must not upload content that:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Is sexually explicit, pornographic, or depicts nudity intended to be sexual in nature.</li>
              <li>Contains violence, gore, or content depicting harm to individuals.</li>
              <li>Promotes hate speech, discrimination, or harassment based on race, ethnicity, religion, gender, sexual orientation, disability, or any other protected characteristic.</li>
              <li>Infringes on the intellectual property rights of others (copyright, trademark, etc.).</li>
              <li>Contains malware, executable files, or any form of malicious code.</li>
              <li>Is spam, misleading, or fraudulent.</li>
              <li>Depicts minors in inappropriate contexts.</li>
            </ul>
            <p>
              <strong className="text-gray-900 dark:text-white">Content removal:</strong> We reserve the right to remove any content that violates these Terms
              or that we determine, in our sole discretion, to be harmful or inappropriate. Repeated violations may result
              in account suspension or termination.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Parental consent for minors:</strong> Content uploaded by or depicting users aged 13–17 must have
              appropriate parental or guardian consent. Parent-managed accounts require the parent or guardian to approve
              all media uploads.
            </p>
          </Section>

          <Section id="conduct" number="5" title="Acceptable Use">
            <p>When using the Platform, you agree to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Treat all users with respect. Harassment, bullying, or abusive behaviour is not tolerated.</li>
              <li>Not impersonate another person or create misleading profiles.</li>
              <li>Not use automated tools, bots, or scrapers to access or extract data from the Platform.</li>
              <li>Not attempt to circumvent security measures, access other users&apos; accounts, or interfere with the Platform&apos;s infrastructure.</li>
              <li>Not use the Platform for any unlawful purpose.</li>
              <li>Use the reporting and flagging features responsibly and in good faith.</li>
            </ul>
            <p>
              The Platform includes community features such as comments, likes, and content flagging. All community
              interactions must comply with these Terms. We moderate reported content and may take action including
              content removal, warnings, or account suspension.
            </p>
          </Section>

          <Section id="ip" number="6" title="Intellectual Property">
            <p>
              <strong className="text-gray-900 dark:text-white">Platform IP:</strong> The 3YESES name, logo, branding, design, code, and all
              original platform content are owned by 3YESES and protected by intellectual property laws. You may not
              copy, reproduce, or distribute any part of the Platform without written permission.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">User IP:</strong> You retain ownership of your uploaded content. The licence you
              grant us (Section 4) is limited to operating and promoting the Platform. If you delete your content or
              account, we will remove your content from the Platform within a reasonable timeframe, except where
              retention is required by law or for legitimate business purposes (e.g. cached content, backups).
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Copyright claims:</strong> If you believe content on the Platform infringes your copyright,
              please submit a support ticket with details of the alleged infringement. We will investigate and take
              appropriate action, which may include removing the content.
            </p>
          </Section>

          <Section id="analytics" number="7" title="Analytics & Data">
            <p>
              The Platform provides analytics dashboards showing profile views, portfolio item performance,
              search impressions, engagement rates, and viewer demographics. This data is provided for your
              personal use and insight.
            </p>
            <p>
              Analytics data is generated from Platform activity and may not reflect views or interactions
              from external sources. We do not guarantee the accuracy of analytics data and it should not be
              relied upon as the sole basis for business decisions.
            </p>
          </Section>

          <Section id="privacy" number="8" title="Privacy & Cookies">
            <p>
              Your privacy matters to us. Our collection, use, and protection of personal data is governed by our{' '}
              <Link href="/privacy" className="rounded-sm marketing-accent-text hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-ring)]">
                Privacy Policy
              </Link>, which forms part of these Terms.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Cookies:</strong> The Platform uses essential cookies for authentication and session management.
              Optional analytics and marketing cookies can be managed through the cookie consent banner. You can update your
              cookie preferences at any time.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">Data rights:</strong> You may request a copy of your personal data or request deletion of your
              account and associated data at any time from Dashboard → Settings → Account. We comply with GDPR and applicable
              data protection regulations.
            </p>
          </Section>

          <Section id="termination" number="9" title="Termination">
            <p>
              <strong className="text-gray-900 dark:text-white">By you:</strong> You may cancel your subscription and delete your account at any time.
              Cancellation of your subscription stops future billing but retains access until the end of the current period.
              Account deletion permanently removes your profile, portfolio, and all associated data.
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">By us:</strong> We reserve the right to suspend or terminate accounts that violate these Terms,
              engage in fraudulent activity, or are used in ways that harm the Platform or other users. We will make
              reasonable efforts to notify you before termination, except where immediate action is required.
            </p>
          </Section>

          <Section id="liability" number="10" title="Limitation of Liability">
            <p>
              The Platform is provided &quot;as is&quot; and &quot;as available&quot;. We do not guarantee uninterrupted or error-free
              service. To the fullest extent permitted by law:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>We are not liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform.</li>
              <li>Our total liability for any claim related to the Platform is limited to the amount you paid for your subscription in the 12 months preceding the claim.</li>
              <li>We are not responsible for the actions, content, or conduct of other users on the Platform.</li>
              <li>We do not guarantee any level of exposure, discovery, or business opportunities through the Platform.</li>
            </ul>
            <p>
              Nothing in these Terms excludes or limits our liability for death or personal injury caused by our negligence,
              fraud, or any other liability that cannot be excluded by law.
            </p>
          </Section>

          <Section id="changes" number="11" title="Changes to Terms">
            <p>
              We may update these Terms from time to time. When we make material changes, we will notify you via email
              or through a notice on the Platform. Continued use of the Platform after changes take effect constitutes
              acceptance of the updated Terms.
            </p>
            <p>
              We encourage you to review these Terms periodically. The &quot;Last updated&quot; date at the top of this page
              indicates when these Terms were most recently revised.
            </p>
          </Section>

          <Section id="contact" number="12" title="Contact">
            <p>
              If you have questions about these Terms, please contact us through our{' '}
              <Link href="/support/submit-ticket" className="rounded-sm marketing-accent-text hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-ring)]">
                Support Centre
              </Link>.
            </p>
          </Section>

        </div>
      </div>
    </div>
  );
}
