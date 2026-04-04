'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { CreditCard } from 'lucide-react';
import HelpSectionPage from '@/components/HelpSectionPage';

export default function BillingHelpPage() {
  const t = useTranslations('support');
  return (
    <HelpSectionPage
      icon={<CreditCard className="w-6 h-6 text-primary-blue dark:text-accent-red" />}
      label={t('billingLabel')}
      title={t('billingTitle')}
      titleAccent={t('billingAccent')}
      description={t('billingDesc')}
      ticketCategory="Billing & Subscriptions"
      faqs={[
        {
          q: 'How much does 3YESES cost?',
          a: 'An active subscription is required to use the platform. You subscribe during sign-up — choose between £10 for 6 months or £20 for 12 months (best value). Both plans include identical features: unlimited portfolio uploads, full profile customisation, priority search ranking, analytics dashboard, comments, likes, and community features. No hidden fees.',
        },
        {
          q: 'How do I subscribe?',
          a: 'Subscription happens as part of the sign-up process. After creating your account and confirming your age, choose your plan duration (6 or 12 months), then complete the secure Stripe checkout. Your account activates instantly — no waiting period.',
        },
        {
          q: 'Can I cancel my subscription?',
          a: 'Yes — cancel any time from Dashboard → Subscription. You keep full access until the end of your current billing period. Your profile, portfolio, comments, and analytics data are all preserved — resubscribe any time to pick up where you left off. There are no cancellation fees.',
        },
        {
          q: 'What happens when my subscription expires?',
          a: 'When your subscription ends, your platform access is paused. You cannot log in, upload content, or interact with the community. However, your profile, portfolio items, and all data are preserved and will be fully restored when you resubscribe.',
        },
        {
          q: 'How do I get an invoice?',
          a: 'Go to Dashboard → Subscription to view your billing history. All invoices are generated and managed by Stripe. You can download PDF invoices for any past payment directly from this page.',
        },
        {
          q: 'Can I switch between 6-month and 12-month plans?',
          a: 'When your current subscription period ends, you can choose a different duration at renewal. The change takes effect at the start of your next billing cycle. Both plans include identical features.',
        },
      ]}
      guides={[
        {
          title: 'Understanding your subscription',
          content: 'Subscription is mandatory to use 3YESES. You choose your plan during sign-up: £10 for 6 months or £20 for 12 months (best value). Both plans include identical features — the only difference is billing duration.',
        },
        {
          title: 'Payment security',
          content: 'All payments are processed securely through Stripe. We never store your card details on our servers. Stripe is PCI DSS Level 1 certified — the highest level of security in the payments industry.',
        },
        {
          title: 'Refund policy',
          content: 'If you experience a technical issue that prevents you from using the platform, contact support within 14 days of payment for a review. Refunds are assessed on a case-by-case basis.',
        },
      ]}
    />
  );
}
