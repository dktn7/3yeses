'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Shield } from 'lucide-react';
import HelpSectionPage from '@/components/HelpSectionPage';

export default function SecurityHelpPage() {
  const t = useTranslations('support');
  return (
    <HelpSectionPage
      icon={<Shield className="w-6 h-6 text-primary-blue dark:text-accent-red" />}
      label={t('securityLabel')}
      title={t('securityTitle')}
      titleAccent={t('securityAccent')}
      description={t('securityDesc')}
      ticketCategory="Security & Privacy"
      faqs={[
        {
          q: 'How is my data protected?',
          a: 'All data is transmitted over HTTPS with TLS encryption. Passwords are hashed with bcrypt. Payment data is handled entirely by Stripe (PCI DSS Level 1 certified) and never stored on our servers. Media uploads are served through ImageKit\'s CDN for secure, fast delivery.',
        },
        {
          q: 'What privacy settings are available?',
          a: 'From Dashboard → Settings → Privacy, you can control: profile visibility (Public, Members Only, or Private), whether your email address is shown on your profile, whether your phone number is displayed, and whether your location is visible. These settings update instantly.',
        },
        {
          q: 'What cookies does 3YESES use?',
          a: 'We use essential cookies for authentication and session management. Optional analytics cookies help us improve the platform. You can manage your preferences through the cookie consent banner that appears on your first visit, and update them any time from the settings.',
        },
        {
          q: 'How do I report inappropriate content?',
          a: 'Click the flag icon on any profile or portfolio item to submit a report. You can flag content from the media overlay (when viewing portfolio items) or from profile pages. Include a brief description of the issue. Our moderation team reviews all reports within 24 hours and may remove content or suspend accounts that violate our terms.',
        },
        {
          q: 'Can I make my profile private?',
          a: 'Yes — go to Dashboard → Settings → Privacy and set your visibility to "Private" (hidden from search and browsing) or "Members Only" (visible only to logged-in subscribers). Note that setting your profile to Private means you won\'t appear in search results or the Media Hub.',
        },
        {
          q: 'How do I download or delete my data?',
          a: 'You can request a copy of your personal data or delete your entire account from Dashboard → Settings → Account. We comply with GDPR and applicable data protection regulations. Account deletion removes all your data, including profile, portfolio, comments, likes, and analytics.',
        },
      ]}
      guides={[
        {
          title: 'Keeping your account secure',
          content: 'Use a strong, unique password (at least 8 characters with a mix of letters, numbers, and symbols). Don\'t share your login credentials. If you suspect unauthorised access, reset your password immediately from the login page and contact support.',
        },
        {
          title: 'Understanding visibility settings',
          content: 'Public profiles are visible to everyone, including non-logged-in visitors and search engines. Members Only profiles are visible only to subscribers who are logged in. Private profiles are hidden from all search results and browsing — only people with your direct profile URL can view your page.',
        },
        {
          title: 'Reporting and moderation',
          content: 'We take content moderation seriously. The flag/report system is available on all portfolio items and profiles via the media overlay and profile pages. Reports are reviewed by our team. Accounts with repeated violations may be warned, suspended, or permanently removed depending on severity.',
        },
      ]}
    />
  );
}
