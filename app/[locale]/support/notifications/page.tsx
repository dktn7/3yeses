'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MessageSquare } from 'lucide-react';
import HelpSectionPage from '@/components/HelpSectionPage';

export default function NotificationsHelpPage() {
  const t = useTranslations('support');
  return (
    <HelpSectionPage
      icon={<MessageSquare className="w-6 h-6 text-primary-blue dark:text-accent-red" />}
      label={t('notificationsLabel')}
      title={t('notificationsTitle')}
      titleAccent={t('notificationsAccent')}
      description={t('notificationsDesc')}
      ticketCategory="Notifications & Alerts"
      faqs={[
        {
          q: 'What notifications will I receive?',
          a: 'You can receive notifications for: new comments on your portfolio items, replies to your comments, likes on your portfolio, profile views, new followers, subscription updates, and support ticket replies. Each type can be individually toggled on or off from your settings.',
        },
        {
          q: 'How do I manage notification preferences?',
          a: 'Go to Dashboard → Settings → Notifications. You\'ll see individual toggles for each notification type: new comments, comment replies, portfolio likes, profile views, and new followers. Essential account notifications (password resets, billing alerts) cannot be disabled.',
        },
        {
          q: 'I\'m not receiving any emails — what should I do?',
          a: 'Check your spam/junk folder first. Add noreply@3yeses.online to your contacts. If you use Gmail, check the "Promotions" tab. Verify your email address is correct in Dashboard → Settings → Account. If emails are still missing, submit a support ticket.',
        },
        {
          q: 'Can I get notified when someone views my profile?',
          a: 'Yes — enable the "Profile Views" notification toggle in Settings → Notifications. You can also check your analytics dashboard any time to see daily and weekly view counts, unique viewers, and view trends over 7, 14, 30, or 90 days.',
        },
        {
          q: 'Do I get notified about comments and @mentions?',
          a: 'Yes. When someone comments on your portfolio items or @mentions you in a comment, you receive a notification (if enabled). Comment notifications include the commenter\'s name and the item they commented on, linking directly to the media overlay.',
        },
      ]}
      guides={[
        {
          title: 'Notification types explained',
          content: 'Comment notifications alert you when someone comments on your work or replies to your comments. Like notifications tell you when portfolio items receive likes. Profile view notifications summarise who has viewed your profile. Follower notifications inform you when someone new follows your profile.',
        },
        {
          title: 'Recommended settings',
          content: 'We recommend keeping Comments, Likes, and New Followers enabled — these help you engage with your audience. Profile view notifications can be high-volume for popular profiles, so adjust based on your preference. Always keep billing and security notifications enabled.',
        },
        {
          title: 'Email deliverability',
          content: 'Our emails are sent from noreply@3yeses.online. If you use a corporate email, ask your IT team to whitelist our sending domain. Moving our emails out of spam once usually trains most email providers to deliver future messages to your inbox.',
        },
      ]}
    />
  );
}
