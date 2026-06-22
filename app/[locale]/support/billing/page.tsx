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
      ticketCategory={t('billingHelp.ticketCategory')}
      faqs={[
        {
          q: t('billingHelp.faqCostQ'),
          a: t('billingHelp.faqCostA'),
        },
        {
          q: t('billingHelp.faqSubscribeQ'),
          a: t('billingHelp.faqSubscribeA'),
        },
        {
          q: t('billingHelp.faqCancelQ'),
          a: t('billingHelp.faqCancelA'),
        },
        {
          q: t('billingHelp.faqExpireQ'),
          a: t('billingHelp.faqExpireA'),
        },
        {
          q: t('billingHelp.faqInvoiceQ'),
          a: t('billingHelp.faqInvoiceA'),
        },
        {
          q: t('billingHelp.faqSwitchPlanQ'),
          a: t('billingHelp.faqSwitchPlanA'),
        },
      ]}
      guides={[
        {
          title: t('billingHelp.guideSubscriptionTitle'),
          content: t('billingHelp.guideSubscriptionContent'),
        },
        {
          title: t('billingHelp.guideSecurityTitle'),
          content: t('billingHelp.guideSecurityContent'),
        },
        {
          title: t('billingHelp.guideRefundTitle'),
          content: t('billingHelp.guideRefundContent'),
        },
      ]}
    />
  );
}
