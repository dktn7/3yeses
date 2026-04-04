'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { User } from 'lucide-react';
import HelpSectionPage from '@/components/HelpSectionPage';

export default function AccountHelpPage() {
  const t = useTranslations('support');
  const accountAccent = t('accountAccent');
  return (
    <HelpSectionPage
      icon={<User className="w-6 h-6 text-primary-blue dark:text-accent-red" />}
      label={t('accountLabel')}
      title={t('accountTitle')}
      titleAccent={typeof accountAccent === 'string' ? accountAccent : undefined}
      description={t('accountDesc')}
      ticketCategory="Account & Profile"
      faqs={[
        {
          q: 'How do I create an account on 3YESES?',
          a: 'Click "Sign Up" and follow the 3-step process: enter your details (email, name, password), confirm your age (under-13 users need a parent-managed account; 13–17 need parental consent), then choose a subscription plan (6 or 12 months) and complete Stripe checkout. Your account activates instantly.',
        },
        {
          q: 'What information can I add to my profile?',
          a: 'Your profile includes: bio, headshot, primary talent category, physical characteristics (height, body type, eye colour, hair colour), gender (including "other" option), work history, languages with proficiency levels, up to 4 featured skills, social media links (Instagram, TikTok, YouTube, Twitter, Spotify, personal website), location, and optional fields like disabilities for inclusive representation.',
        },
        {
          q: 'How do I edit my profile?',
          a: 'You can edit your profile directly from your public profile page using inline editing — click on any field to update it. Alternatively, go to Dashboard → Profile for the full editor with sections for personal info, physical characteristics, skills, work history, languages, and social links.',
        },
        {
          q: 'What is the profile completion ring?',
          a: 'Your Dashboard shows a circular progress ring indicating how complete your profile is. Complete all sections — photo, bio, category, skills, at least one portfolio item — to reach 100%. Higher completeness improves your search ranking and helps visitors trust your profile.',
        },
        {
          q: 'I forgot my password — how do I reset it?',
          a: 'Go to the login page and click "Forgot password". Enter your registered email and we\'ll send a one-time reset link valid for 1 hour.',
        },
        {
          q: 'Can I delete my account?',
          a: 'Yes. Go to Dashboard → Settings → Account and click "Delete Account". This permanently removes your profile, portfolio items, comments, analytics, and all associated data. Your Stripe subscription is also cancelled immediately.',
        },
      ]}
      guides={[
        {
          title: 'Building a strong profile',
          content: 'Start with a professional headshot and compelling bio. Add your physical characteristics (height, body type, eye and hair colour) — these are used in search filters. Link your social media accounts so visitors can see more of your work. Select up to 4 featured skills that best represent you.',
        },
        {
          title: 'Profile visibility settings',
          content: 'From Dashboard → Settings → Privacy, you can set your profile visibility to Public (anyone can view), Members Only (only logged-in subscribers), or Private (hidden from search). You can also toggle whether your email address, phone number, and location are displayed.',
        },
        {
          title: 'Managing work history',
          content: 'The Work History section lets you add past roles, projects, and credits. Each entry includes a title, role, year, and description. This builds credibility and helps visitors understand your experience and range.',
        },
      ]}
    />
  );
}
