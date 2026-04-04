'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Layers } from 'lucide-react';
import HelpSectionPage from '@/components/HelpSectionPage';

export default function CategoriesHelpPage() {
  const t = useTranslations('support');
  return (
    <HelpSectionPage
      icon={<Layers className="w-6 h-6 text-primary-blue dark:text-accent-red" />}
      label={t('categoriesLabel')}
      title={t('categoriesTitle')}
      titleAccent={t('categoriesAccent')}
      description={t('categoriesDesc')}
      ticketCategory="Categories & Discovery"
      faqs={[
        {
          q: 'What talent categories are available?',
          a: 'We support actors, musicians, models, voice artists, dancers, DJs, photographers, videographers, presenters, comedians, and more. Each category has its own page with tailored search filters and portfolio browsing.',
        },
        {
          q: 'What search filters are available?',
          a: 'The talent directory has advanced filters for: gender, body type, ethnicity, age range, height range, skills, languages, disabilities, and location (with autocomplete). You can combine any number of filters and see active filter chips that can be individually cleared.',
        },
        {
          q: 'What is the Media Hub?',
          a: 'The Hub is a browsable feed of all portfolio content across the platform. Filter by talent category (with item counts shown), media type (images, videos, audio, links), and sort by trending, newest, or most viewed. Featured items are spotlighted at the top of the page.',
        },
        {
          q: 'How does search ranking work?',
          a: 'Results are ranked by profile completeness, portfolio quality, recent activity, and subscriber status. Profiles with a high completion percentage, verified badges, and recent uploads rank higher. All subscribers get priority search placement as a core feature.',
        },
        {
          q: 'Can I appear in multiple categories?',
          a: 'You select one primary category during profile setup, then add relevant subcategories and skills. For example, a singer-songwriter who also acts can set "Musician" as primary and add "Actor" as a skill. This ensures visibility in related searches.',
        },
        {
          q: 'Can I switch between grid and list views?',
          a: 'Yes — the talent directory offers both grid and list view toggles. Grid view shows profile cards with headshots, while list view provides more detail per result. Results show 24 profiles per page with pagination.',
        },
      ]}
      guides={[
        {
          title: 'Getting discovered',
          content: 'Complete your profile to 100% (check the completion ring on your Dashboard). Upload high-quality portfolio items — your first few pieces are what visitors see first. Add specific skills (e.g. "Classical Piano" rather than "Piano") and keep your location accurate for local search matches.',
        },
        {
          title: 'Using the Media Hub',
          content: 'The Hub lets visitors discover talent through their work rather than profiles. Category tabs show how many items are in each category. Sort by "Trending" to see what\'s popular, or "Newest" for recent uploads. If your content appears in the Hub, it drives traffic to your full profile.',
        },
        {
          title: 'Location-based discovery',
          content: 'Set your location accurately in your profile — many searches are filtered by city or country. The location filter uses autocomplete, so visitors type a city and see matching results instantly. Having an up-to-date location significantly improves your chances of appearing in relevant searches.',
        },
      ]}
    />
  );
}
