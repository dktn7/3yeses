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
    a: 'Your profile includes a bio, headshot, primary talent category, physical characteristics (height, body type, eye colour, hair colour), work history, languages spoken, skills (up to 4 featured), social media links (Instagram, TikTok, YouTube, Twitter, Spotify, website), location, and optional fields like disabilities for inclusive casting. You can edit everything inline directly from your profile page.'
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
    a: 'An active subscription is required to use the platform. You subscribe during sign-up — choose between £10 for 6 months or £20 for 12 months. Both plans include identical features: unlimited portfolio uploads, full profile customisation, priority search ranking, analytics dashboard, and community features. No hidden fees.'
  },
  {
    category: 'Billing & Subscriptions',
    q: 'Can I cancel my subscription?',
    a: 'Yes — cancel any time from Dashboard → Subscription. You keep full access until the end of your current billing period. Your profile and portfolio data are preserved if you resubscribe later. There are no cancellation fees.'
  },

  /* ── Portfolio & Media ── */
  {
    category: 'Portfolio & Media',
    q: 'How do I upload portfolio items?',
    a: 'Go to Dashboard → Portfolio and click "Add Item". The upload wizard walks you through 4 steps: choose a type (image, video, audio, or link), upload the file or paste a URL, add a title and description, then confirm. Files can be up to 50 MB. For videos, you can pick a custom thumbnail from any frame.'
  },
  {
    category: 'Portfolio & Media',
    q: 'How do people view my portfolio?',
    a: 'Visitors see your portfolio in a gallery grid on your profile. Clicking an item opens the media overlay — a full-screen viewer with keyboard navigation (arrow keys, Escape to close). Viewers can leave comments, like items, share them, or flag inappropriate content directly from the overlay.'
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
    a: 'The Hub is a browsable feed of all portfolio content across the platform. You can filter by talent category (with item counts), media type (images, videos, audio, links), and sort by trending, newest, or most viewed. Featured items are spotlighted at the top. It\'s a great way to discover talent through their work.'
  },

  /* ── Analytics ── */
  {
    category: 'Analytics',
    q: 'What analytics are available?',
    a: 'Your Dashboard shows profile views, unique viewers, portfolio views, likes received, search impressions, search clicks, click-through rate (CTR), and engagement rate. You can view stats over 7, 14, 30, or 90 days with interactive charts. You\'ll also see your top-performing portfolio items and recent profile viewers.'
  },

  /* ── Community ── */
  {
    category: 'Community',
    q: 'Can I interact with other users?',
    a: 'Yes — you can comment on portfolio items, reply to comments, @mention other users (with type-ahead suggestions), like portfolio items, and share profiles. Comment authors can edit, delete, or pin their comments. You can also report content using the flag icon on any profile or portfolio item.'
  },

  /* ── Support & Tickets ── */
  {
    category: 'Support & Tickets',
    q: 'How do I submit a support ticket?',
    a: 'Go to the Submit a Ticket page from the Help Centre. Choose a category (Account, Billing, Portfolio, Categories, Notifications, Security, or Other), provide a clear subject and description. You must be logged in so we can track your ticket and contact you with updates.'
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
  'Portfolio & Media': 'catPortfolio',
  'Categories & Discovery': 'catCategories',
  'Analytics': 'catAnalytics',
  'Community': 'catCommunity',
  'Support & Tickets': 'catSupport',
};

export default function SupportFAQ() {
  const t = useTranslations('support');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="rounded-xl border border-gray-200/60 dark:border-white/10 overflow-hidden backdrop-blur-sm bg-white/40 dark:bg-white/[0.03] transition-shadow hover:shadow-sm"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue/30 dark:focus-visible:ring-accent-red/30"
            >
              <div className="flex-1 min-w-0">
                <span className="block text-[0.65rem] font-bold uppercase tracking-widest text-primary-blue/60 dark:text-accent-red/60 mb-0.5">
                  {CATEGORY_KEYS[item.category] ? t(CATEGORY_KEYS[item.category]) : item.category}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {item.q}
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
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
