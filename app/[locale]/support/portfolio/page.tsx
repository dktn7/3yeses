'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Image as ImageIcon } from 'lucide-react';
import HelpSectionPage from '@/components/HelpSectionPage';

export default function PortfolioHelpPage() {
  const t = useTranslations('support');
  return (
    <HelpSectionPage
      icon={<ImageIcon className="w-6 h-6 text-primary-blue dark:text-accent-red" />}
      label={t('portfolioLabel')}
      title={t('portfolioTitle')}
      titleAccent={t('portfolioAccent')}
      description={t('portfolioDesc')}
      ticketCategory="Portfolio & Media"
      faqs={[
        {
          q: 'How do I upload portfolio items?',
          a: 'Go to Dashboard → Portfolio and click "Add Item". The upload wizard walks you through 4 steps: choose a type (image, video, audio, or link), upload the file or paste a URL, add a title and description, then review and confirm. Files can be up to 50 MB each.',
        },
        {
          q: 'What file types can I upload?',
          a: 'Images: JPEG, PNG, WebP. Videos: MP4, MOV. Audio: MP3, WAV. You can also embed external video links from YouTube or Vimeo — paste the URL and we generate a thumbnail and embedded player automatically.',
        },
        {
          q: 'Is there a limit on how many items I can upload?',
          a: 'No — with an active Standard subscription you get unlimited uploads across all media types. Upload as many photos, videos, and audio clips as you need to showcase your work.',
        },
        {
          q: 'How do visitors view my portfolio?',
          a: 'Your portfolio appears as a gallery grid on your profile. Clicking any item opens the media overlay — a full-screen viewer where visitors can browse items, watch videos (with an integrated player), listen to audio, leave comments, @mention other users, like items, share them, or flag inappropriate content. Keyboard navigation is supported (arrow keys to browse, Escape to close).',
        },
        {
          q: 'Can I set a custom video thumbnail?',
          a: 'Yes — when uploading a video, you can pick a thumbnail from any frame of the video. This thumbnail is shown on your portfolio grid and in search results. You can change it later from the portfolio editor.',
        },
        {
          q: 'My upload failed — what should I do?',
          a: 'Check that your file is under 50 MB and in a supported format (JPEG, PNG, WebP, MP4, MOV, MP3, WAV). If the issue persists, try a different browser or clear your cache. You can also submit a support ticket with the error details.',
        },
      ]}
      guides={[
        {
          title: 'Building a standout portfolio',
          content: 'Quality over quantity. Lead with your best work — a professional headshot, a polished showreel, or a demo track. Visitors typically view the first 3–5 items, so make them count. Add descriptive titles so visitors understand the context of each piece.',
        },
        {
          title: 'Using the media overlay',
          content: 'When someone clicks a portfolio item, the media overlay opens with a full-screen view. Videos play inline with controls. Audio tracks have a built-in player. Visitors can comment, like, and share directly from the overlay. This is where most engagement happens, so strong media makes a difference.',
        },
        {
          title: 'Embedding external videos',
          content: 'For longer videos or established content, use the "Link" type in the upload wizard and paste a YouTube or Vimeo URL. We generate a playable embed with thumbnail automatically — no file size limits for embedded content.',
        },
      ]}
    />
  );
}
