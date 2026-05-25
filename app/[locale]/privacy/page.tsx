'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import SwoopingTick from '@/components/SwoopingTick';

/* ── Background decoration ─────────────────────────────────────────── */
function PrivacyBgDecoration() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 dark:opacity-90" aria-hidden="true">
      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pBg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-from)" stopOpacity="0.16" />
            <stop offset="60%" stopColor="var(--brand-to)" stopOpacity="0.06" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="pWave1" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-from)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--brand-to)" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="pWave2" x1="1" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-to)" stopOpacity="0.14" />
            <stop offset="100%" stopColor="var(--brand-from)" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#pBg)" />
        <path d="M0 430 Q360 330 720 400 T1440 370 V900 H0Z" fill="url(#pWave1)" />
        <path d="M0 620 Q400 550 800 600 T1440 560 V900 H0Z" fill="url(#pWave2)" />
        <path d="M0 52 C360 104 720 26 1080 72 C1260 96 1380 68 1440 80 L1440 0 L0 0 Z" fill="var(--hero-top-wave, var(--brand-from))" opacity="0.08" />
        <circle cx="250" cy="120" r="220" fill="var(--brand-to)" opacity="0.08" />
        <circle cx="1200" cy="780" r="240" fill="var(--brand-from)" opacity="0.07" />
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

const TOC = [
  ['controller', 'Data Controller'],
  ['data-we-collect', 'Data We Collect'],
  ['how-we-use', 'How We Use Your Data'],
  ['legal-basis', 'Legal Basis for Processing'],
  ['sharing', 'Who We Share Data With'],
  ['cookies', 'Cookies & Tracking'],
  ['retention', 'Data Retention'],
  ['your-rights', 'Your Rights'],
  ['children', 'Children & Parental Consent'],
  ['security', 'Security Measures'],
  ['international', 'International Transfers'],
  ['changes', 'Changes to This Policy'],
  ['contact', 'Contact Us'],
];

export default function PrivacyPolicyPage() {
  const t = useTranslations('Pages.privacy');
  return (
    <div className="relative min-h-screen landing-bg transition-colors duration-300 overflow-hidden brand-true-red">
      <PrivacyBgDecoration />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28">

        {/* Header */}
        <div className="text-center mb-14">
            <div className="flex justify-center mb-6">
            <span className="marketing-pill inline-flex items-center gap-3 rounded-full px-5 py-2.5 marketing-pill border border-gray-200/60 dark:border-[var(--marketing-pill-border)] shadow-sm">
              <SwoopingTick className="w-9 h-9 shrink-0 marketing-accent-text" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] marketing-accent-text">
                {t('badge')}
              </span>
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-[1.08] tracking-tight">
            {t('title')}
          </h1>

          <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto mb-8 leading-relaxed">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* Table of Contents */}
        <nav className="rounded-[1.5rem] marketing-panel border border-gray-200/50 dark:border-red-400/20 shadow-sm p-6 mb-10">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">{t('contents')}</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm">
            {TOC.map(([id, label], i) => (
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

        {/* Policy Content */}
        <div className="rounded-[2rem] marketing-panel border border-gray-200/50 dark:border-red-400/20 shadow-lg p-8 md:p-12 space-y-10">

          <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
            <p>{t('introP1')}</p>
            <p>{t('introP2')}</p>
          </div>

          {/* ── 1. Data Controller ── */}
          <Section id="controller" number="1" title="Data Controller">
            <p>
              3YESES is the data controller for the personal data processed through the Platform.
              If you have any questions about how we handle your data, you can reach us through our{' '}
              <Link href="/support/submit-ticket" className="rounded-sm marketing-accent-text hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-ring)]">
                Support Centre
              </Link>.
            </p>
          </Section>

          {/* ── 2. Data We Collect ── */}
          <Section id="data-we-collect" number="2" title="Data We Collect">
            <p>
              We collect data that you provide directly, data generated by your use of the Platform,
              and data from third-party services.
            </p>

            <p><strong className="text-gray-900 dark:text-white">2.1 Data you provide</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-gray-900 dark:text-white">Account information:</strong> name, email address, password (stored as a bcrypt hash), date of birth, and parental/guardian email (where applicable).</li>
              <li><strong className="text-gray-900 dark:text-white">Profile information:</strong> biography, headshot photo, talent category, gender, physical characteristics (height, body type, eye colour, hair colour), location, languages spoken, skills, work history, disabilities (optional, for inclusive representation), and social media links (Instagram, TikTok, YouTube, Twitter, Spotify, personal website).</li>
              <li><strong className="text-gray-900 dark:text-white">Portfolio content:</strong> images, videos, audio files, and external video links (e.g. YouTube, Vimeo) that you upload, along with titles and descriptions.</li>
              <li><strong className="text-gray-900 dark:text-white">Support tickets:</strong> subject, description, category, and any attachments you submit through the Help Centre.</li>
              <li><strong className="text-gray-900 dark:text-white">Comments and interactions:</strong> comments you post on portfolio items, replies, @mentions, likes, and content reports.</li>
            </ul>

            <p><strong className="text-gray-900 dark:text-white">2.2 Data collected automatically</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-gray-900 dark:text-white">Usage analytics:</strong> profile views, portfolio item views, search impressions, search clicks, click-through rates, engagement rates, and daily activity statistics.</li>
              <li><strong className="text-gray-900 dark:text-white">Device and browser data:</strong> IP address, browser type, operating system, device type, and screen resolution.</li>
              <li><strong className="text-gray-900 dark:text-white">Cookies and session data:</strong> authentication tokens, session identifiers, language preferences, theme preferences (light/dark mode), and cookie consent choices.</li>
            </ul>

            <p><strong className="text-gray-900 dark:text-white">2.3 Data from third parties</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-gray-900 dark:text-white">Stripe:</strong> subscription status, payment confirmation, invoice data, and customer ID. We do not receive or store your full card number — Stripe handles all card data under PCI DSS Level 1 certification.</li>
              <li><strong className="text-gray-900 dark:text-white">ImageKit:</strong> media processing metadata for uploaded files (file IDs, transformation URLs).</li>
            </ul>
          </Section>

          {/* ── 3. How We Use Your Data ── */}
          <Section id="how-we-use" number="3" title="How We Use Your Data">
            <p>We process your personal data for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-gray-900 dark:text-white">Providing the service:</strong> creating and maintaining your account, displaying your profile and portfolio to other users, enabling comments and likes, and powering the talent search directory and Media Hub.</li>
              <li><strong className="text-gray-900 dark:text-white">Subscription management:</strong> processing payments via Stripe, managing billing cycles (6-month and 12-month plans), sending billing notifications, and handling cancellations.</li>
              <li><strong className="text-gray-900 dark:text-white">Analytics:</strong> generating your personal dashboard analytics (profile views, portfolio performance, search impressions, engagement rates) so you can understand how your profile is performing.</li>
              <li><strong className="text-gray-900 dark:text-white">Search and discovery:</strong> indexing your profile information, skills, physical characteristics, location, and languages to enable advanced search filtering for visitors browsing the talent directory.</li>
              <li><strong className="text-gray-900 dark:text-white">Communication:</strong> sending email notifications (comments, likes, profile views, followers, subscription events, support ticket updates), platform announcements, and password reset links.</li>
              <li><strong className="text-gray-900 dark:text-white">Safety and moderation:</strong> reviewing flagged content and reports, enforcing our Terms and Conditions, and preventing abuse.</li>
              <li><strong className="text-gray-900 dark:text-white">Improving the Platform:</strong> analysing aggregated, anonymised usage patterns to improve features, fix bugs, and plan development.</li>
            </ul>
          </Section>

          {/* ── 4. Legal Basis ── */}
          <Section id="legal-basis" number="4" title="Legal Basis for Processing">
            <p>Under the UK GDPR and EU GDPR, we rely on the following lawful bases:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-gray-900 dark:text-white">Contract:</strong> processing necessary to provide the Platform service you have subscribed to — including account management, profile display, portfolio hosting, analytics, and subscription billing.</li>
              <li><strong className="text-gray-900 dark:text-white">Consent:</strong> optional analytics cookies, marketing communications (where applicable), and processing of special category data such as disabilities (voluntarily provided for inclusive representation).</li>
              <li><strong className="text-gray-900 dark:text-white">Legitimate interests:</strong> platform security, fraud prevention, content moderation, and aggregated analytics to improve the service. We balance our interests against your rights and freedoms.</li>
              <li><strong className="text-gray-900 dark:text-white">Legal obligation:</strong> where we are required to retain data by law (e.g. financial records for tax purposes).</li>
            </ul>
          </Section>

          {/* ── 5. Sharing ── */}
          <Section id="sharing" number="5" title="Who We Share Data With">
            <p>We do not sell your personal data. We share data only with the following parties:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-gray-900 dark:text-white">Other users:</strong> your public profile information, portfolio items, comments, and likes are visible to other Platform users (subject to your privacy visibility settings: Public, Members Only, or Private).</li>
              <li><strong className="text-gray-900 dark:text-white">Stripe:</strong> payment processing. Stripe receives your email and payment details to process subscriptions. See{' '}
                <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="rounded-sm marketing-accent-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-ring)]">Stripe&apos;s Privacy Policy</a>.
              </li>
              <li><strong className="text-gray-900 dark:text-white">ImageKit:</strong> media hosting and delivery. Uploaded images, videos, and audio are processed and served through ImageKit&apos;s CDN. See{' '}
                <a href="https://imagekit.io/privacy-policy" target="_blank" rel="noopener noreferrer" className="rounded-sm marketing-accent-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-ring)]">ImageKit&apos;s Privacy Policy</a>.
              </li>
              <li><strong className="text-gray-900 dark:text-white">Email service provider:</strong> transactional emails (notifications, password resets, billing alerts) are sent via our email service provider, which processes your email address and name.</li>
              <li><strong className="text-gray-900 dark:text-white">Law enforcement:</strong> we may disclose data if required by law, regulation, legal process, or governmental request.</li>
            </ul>
          </Section>

          {/* ── 6. Cookies ── */}
          <Section id="cookies" number="6" title="Cookies & Tracking">
            <p>We use the following categories of cookies:</p>

            <p><strong className="text-gray-900 dark:text-white">Essential cookies (always active)</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Authentication token (JWT stored in an HTTP-only cookie) — keeps you logged in.</li>
              <li>Session ID — maintains your session across page loads.</li>
              <li>Cookie consent preference — remembers your cookie choices.</li>
              <li>Language and locale preference — serves content in your selected language (11 locales supported).</li>
              <li>Theme preference — remembers your light/dark mode choice.</li>
            </ul>

            <p><strong className="text-gray-900 dark:text-white">Analytics cookies (optional)</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Help us understand how visitors use the Platform — pages visited, time on page, and feature usage.</li>
              <li>Data is aggregated and anonymised. No personally identifiable data is collected through analytics cookies.</li>
            </ul>

            <p>
              You can manage your cookie preferences through the cookie consent banner that appears on your first visit.
              You can update your preferences at any time. Essential cookies cannot be disabled as they are required for
              the Platform to function.
            </p>
          </Section>

          {/* ── 7. Retention ── */}
          <Section id="retention" number="7" title="Data Retention">
            <p>We retain your data for as long as necessary to provide the service and fulfil the purposes described in this policy:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-gray-900 dark:text-white">Active accounts:</strong> your data is retained for the duration of your subscription. If your subscription expires, your data is preserved so you can resubscribe without losing your profile or portfolio.</li>
              <li><strong className="text-gray-900 dark:text-white">Deleted accounts:</strong> when you request account deletion (via Dashboard → Settings → Account), we permanently remove your profile, portfolio, comments, likes, analytics, and associated data within 30 days. Backups may retain encrypted copies for up to 90 days.</li>
              <li><strong className="text-gray-900 dark:text-white">Financial records:</strong> payment and subscription records are retained for 7 years as required by UK tax and accounting regulations.</li>
              <li><strong className="text-gray-900 dark:text-white">Support tickets:</strong> retained for 2 years after resolution, then anonymised or deleted.</li>
              <li><strong className="text-gray-900 dark:text-white">Analytics data:</strong> aggregated analytics (used for Platform improvement) are retained indefinitely in anonymised form. Individual analytics data tied to your profile is deleted when your account is deleted.</li>
            </ul>
          </Section>

          {/* ── 8. Your Rights ── */}
          <Section id="your-rights" number="8" title="Your Rights">
            <p>Under UK GDPR and EU GDPR, you have the following rights:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-gray-900 dark:text-white">Access:</strong> request a copy of the personal data we hold about you.</li>
              <li><strong className="text-gray-900 dark:text-white">Rectification:</strong> correct inaccurate or incomplete data. You can update most information directly from your profile editor or Dashboard → Settings.</li>
              <li><strong className="text-gray-900 dark:text-white">Erasure:</strong> request deletion of your personal data. Use the &quot;Delete Account&quot; option in Dashboard → Settings → Account for immediate processing, or contact support for specific data removal.</li>
              <li><strong className="text-gray-900 dark:text-white">Restriction:</strong> request that we limit how we process your data in certain circumstances.</li>
              <li><strong className="text-gray-900 dark:text-white">Portability:</strong> receive your data in a structured, commonly used format. Contact support to request a data export.</li>
              <li><strong className="text-gray-900 dark:text-white">Objection:</strong> object to processing based on legitimate interests. We will stop processing unless we have compelling grounds.</li>
              <li><strong className="text-gray-900 dark:text-white">Withdraw consent:</strong> where processing is based on consent (e.g. analytics cookies, optional profile fields like disabilities), you can withdraw consent at any time without affecting the lawfulness of prior processing.</li>
            </ul>
            <p>
              To exercise any of these rights, submit a request through our{' '}
              <Link href="/support/submit-ticket" className="rounded-sm marketing-accent-text hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-ring)]">
                Support Centre
              </Link>{' '}
              or use the self-service options in Dashboard → Settings → Account. We will respond within 30 days.
            </p>
            <p>
              If you are unsatisfied with our response, you have the right to lodge a complaint with the Information
              Commissioner&apos;s Office (ICO) at{' '}
              <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="rounded-sm marketing-accent-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-ring)]">ico.org.uk</a>,
              or your local supervisory authority if you are based in the EU.
            </p>
          </Section>

          {/* ── 9. Children ── */}
          <Section id="children" number="9" title="Children & Parental Consent">
            <p>
              <strong className="text-gray-900 dark:text-white">Age requirements:</strong> users must be at least 13 years old to create an account.
              Users aged 13–17 require verifiable parental or guardian consent before their account is activated.
              Children under 13 must have a parent-managed account, where the parent or guardian registers and manages
              the account on their behalf.
            </p>
            <p>
              During sign-up, we collect the user&apos;s date of birth to verify age. If the user is under 18, we collect
              a parent or guardian email address and send a consent request. The account is not fully activated until
              parental consent is confirmed.
            </p>
            <p>
              Parents and guardians can request access to, correction of, or deletion of their child&apos;s data at any
              time by contacting us through the Support Centre.
            </p>
          </Section>

          {/* ── 10. Security ── */}
          <Section id="security" number="10" title="Security Measures">
            <p>We implement appropriate technical and organisational measures to protect your data:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-gray-900 dark:text-white">Encryption in transit:</strong> all data is transmitted over HTTPS with TLS encryption.</li>
              <li><strong className="text-gray-900 dark:text-white">Password security:</strong> passwords are hashed using bcrypt with salt rounds. We never store plain-text passwords.</li>
              <li><strong className="text-gray-900 dark:text-white">Payment security:</strong> all payment processing is handled by Stripe (PCI DSS Level 1). We do not store, process, or have access to your full card details.</li>
              <li><strong className="text-gray-900 dark:text-white">Authentication:</strong> sessions use JSON Web Tokens (JWTs) stored in HTTP-only, secure cookies to prevent cross-site scripting access.</li>
              <li><strong className="text-gray-900 dark:text-white">Media security:</strong> uploaded files are validated for type and size (max 50 MB) before processing. Executable files and malicious content are rejected.</li>
              <li><strong className="text-gray-900 dark:text-white">Access control:</strong> admin functions are restricted to authorised personnel. All admin actions are logged in an audit trail.</li>
            </ul>
            <p>
              While we take reasonable steps to protect your data, no system is completely secure. If you discover a
              security vulnerability, please report it through a support ticket immediately.
            </p>
          </Section>

          {/* ── 11. International Transfers ── */}
          <Section id="international" number="11" title="International Transfers">
            <p>
              3yeses serves users globally across 11 supported locales. Your data may be processed in countries outside
              the UK or European Economic Area (EEA) through our third-party service providers (Stripe, ImageKit).
            </p>
            <p>
              Where data is transferred internationally, we ensure adequate protection through:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Standard Contractual Clauses (SCCs) approved by the European Commission.</li>
              <li>UK International Data Transfer Agreements (IDTAs) or UK Addendum to EU SCCs.</li>
              <li>Adequacy decisions, where the destination country has been recognised as providing adequate data protection.</li>
            </ul>
          </Section>

          {/* ── 12. Changes ── */}
          <Section id="changes" number="12" title="Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we make material changes, we will notify you
              via email or through a notice on the Platform. The &quot;Last updated&quot; date at the top indicates when
              this policy was most recently revised.
            </p>
            <p>
              We encourage you to review this policy periodically. Continued use of the Platform after changes take
              effect constitutes acceptance of the updated policy.
            </p>
          </Section>

          {/* ── 13. Contact ── */}
          <Section id="contact" number="13" title="Contact Us">
            <p>
              If you have questions about this Privacy Policy or how we handle your data, please contact us through our{' '}
              <Link href="/support/submit-ticket" className="rounded-sm marketing-accent-text hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-ring)]">
                Support Centre
              </Link>.
            </p>
            <p>
              For data protection inquiries, please select the &quot;Security&quot; category when submitting your ticket
              so it is routed to the appropriate team.
            </p>
          </Section>

        </div>
      </div>
    </div>
  );
}
