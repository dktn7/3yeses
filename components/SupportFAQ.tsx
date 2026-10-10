"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';

export const FAQ_ITEMS: { q: string; a: string; category: string }[] = [
  /* ── Account & Profile ── */
  {
    category: 'Account & Profile',
    q: 'How do I create an account on 3YESES?',
    a: 'Click "Sign Up" and follow the 3-step process: enter your email and password, confirm your age (users under 13 need a parent-managed account; 13–17 need parental consent), then choose your subscription plan (6 or 12 months) and complete Stripe checkout. Your account activates instantly.'
  },
  {
    category: 'Account & Profile',
    q: 'What can I add to my profile?',
    a: 'Your profile includes a bio, headshot, primary talent category, personal details, work history, languages spoken, skills, social media links (Instagram, TikTok, YouTube, Twitter, Spotify, website), location, and optional accessibility details. You can edit everything inline directly from your profile page.'
  },
  {
    category: 'Account & Profile',
    q: 'I forgot my password — how do I reset it?',
    a: 'Go to the login page and click "Forgot password". Enter your registered email and we\'ll send a one-time reset link valid for 1 hour.'
  },

  /* ── Billing & Subscriptions ── */
  {
    category: 'Billing & Subscriptions',
    q: 'How much does 3YESES cost?',
    a: 'An active subscription is required to use the platform. You subscribe during sign-up — choose between £10 for 6 months or £20 for 12 months. Both plans include identical features: unlimited media uploads, full profile customisation, visibility insights, and community features. No hidden fees.'
  },
  {
    category: 'Billing & Subscriptions',
    q: 'Can I cancel my subscription?',
    a: 'Yes — cancel any time from Dashboard → Subscription. You keep full access until the end of your current billing period. Your profile and media are preserved if you resubscribe later. There are no cancellation fees.'
  },

  /* ── Media & Profile ── */
  {
    category: 'Media & Profile',
    q: 'How do I add media?',
    a: 'Go to Dashboard → Gallery and click "Add media". The upload wizard walks you through 4 steps: choose a type (image, video, audio, or link), upload the file or paste a URL, add a title and description, then confirm. Files can be up to 50 MB. For videos, you can pick a custom thumbnail from any frame.'
  },
  {
    category: 'Media & Profile',
    q: 'How do people view my media?',
    a: 'Visitors see your media in the gallery on your profile. Clicking an item opens the media overlay — a full-screen viewer with keyboard navigation (arrow keys, Escape to close). Viewers can leave comments, like items, share them, or flag inappropriate content directly from the overlay.'
  },

  /* ── Categories & Discovery ── */
  {
    category: 'Categories & Discovery',
    q: 'How does talent discovery work?',
    a: 'Visitors browse the talent directory or Media Hub to find performers. The directory has advanced filters: gender, body type, ethnicity, age range, height range, skills, languages, disabilities, and location (with autocomplete). Results can be viewed in grid or list layout, with 24 profiles per page. Filter chips show active filters that can be individually cleared.'
  },
  {
    category: 'Categories & Discovery',
    q: 'What is the Media Hub?',
    a: 'The Hub is a browsable feed of media from across the platform. You can filter by talent category (with item counts), media type (images, videos, audio, links), and sort by trending, newest, or most viewed. Featured items are spotlighted at the top. It\'s a great way to discover talent through their work.'
  },

  /* ── Analytics ── */
  {
    category: 'Analytics',
    q: 'What analytics are available?',
    a: 'Your Dashboard shows profile views, unique viewers, media views, likes received, search impressions, search clicks, click-through rate (CTR), and engagement rate. You can view stats over 7, 14, 30, or 90 days with interactive charts. You\'ll also see your most-engaged media and recent profile viewers.'
  },

  /* ── Community ── */
  {
    category: 'Community',
    q: 'Can I interact with other users?',
    a: 'Yes — you can comment on media, reply to comments, @mention other users (with type-ahead suggestions), like media, and share profiles. Comment authors can edit, delete, or pin their comments. You can also report content using the flag icon on any profile or media item.'
  },

  /* ── Support & Tickets ── */
  {
    category: 'Support & Tickets',
    q: 'How do I submit a support ticket?',
    a: 'Go to the Submit a Ticket page from the Help Centre. Choose a category (Account, Billing, Media, Categories, Notifications, Security, or Other), provide a clear subject and description. You must be logged in so we can track your ticket and contact you with updates.'
  },
  {
    category: 'Support & Tickets',
    q: 'How long does it take to get a response?',
    a: 'Support tickets are answered within 48 hours. For urgent issues, include a clear summary so our team can prioritise your request.'
  },
];

const CATEGORY_KEYS: Record<string, string> = {
  'Account & Profile': 'catAccount',
  'Billing & Subscriptions': 'catBilling',
  'Media & Profile': 'catPortfolio',
  'Portfolio & Media': 'catPortfolio',
  'Categories & Discovery': 'catCategories',
  'Analytics': 'catAnalytics',
  'Community': 'catCommunity',
  'Support & Tickets': 'catSupport',
};

function modernizeFaqCopy(value: string) {
  return value
    .replace(/portfolio items/gi, 'media')
    .replace(/portfolio content/gi, 'media')
    .replace(/portfolio views/gi, 'media views')
    .replace(/portfolio likes/gi, 'media likes')
    .replace(/portfolio data/gi, 'media')
    .replace(/your portfolio/gi, 'your media')
    .replace(/portfolio link/gi, 'profile link')
    .replace(/Dashboard → Portfolio/gi, 'Dashboard → Gallery')
    .replace(/Add Item/gi, 'Add media')
    .replace(/inclusive casting/gi, 'accessibility and visibility');
}

export default function SupportFAQ({ faqItems }: { faqItems?: { category: string; q: string; a: string }[] }) {
  const t = useTranslations('support');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const items = faqItems && faqItems.length ? faqItems : FAQ_ITEMS;

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        const question = modernizeFaqCopy(item.q);
        const answer = modernizeFaqCopy(item.a);
        return (
          <div
            key={idx}
            className="rounded-xl border border-gray-200/60 overflow-hidden backdrop-blur-sm bg-light-surface/80 dark:border-[var(--marketing-border)] dark:bg-[var(--marketing-surface)] transition-shadow hover:shadow-sm"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marketing-ring)]"
            >
              <div className="flex-1 min-w-0">
                <span className="block text-[0.65rem] font-bold uppercase tracking-widest marketing-accent-text opacity-70 mb-0.5">
                  {CATEGORY_KEYS[item.category] ? t(CATEGORY_KEYS[item.category]) : item.category}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {question}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              className={`transition-all duration-200 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="px-5 pb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
