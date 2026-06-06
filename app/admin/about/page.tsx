'use client';

import { useState } from 'react';
import {
  Info,
  History,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Globe,
  Users,
  CreditCard,
  Shield,
  Camera,
  Search,
  MessageSquare,
  BarChart2,
  Layers,
  Server,
  Database,
  Code,
  FileText,
  Palette,
  Languages,
  Lock,
  Zap,
} from 'lucide-react';

/* ─── Version history entries ─── */
const VERSION_HISTORY = [
  {
    version: '2.5.0',
    date: 'March 2026',
    title: 'Admin Accessibility & Help Centre',
    changes: [
      'Added admin About page with platform documentation',
      'Version history section in admin panel',
      'System documentation and guide',
      'Font size slider for accessibility in admin settings',
      'Invert colours toggle for visual accessibility',
    ],
  },
  {
    version: '2.4.0',
    date: 'February 2026',
    title: 'Communications & CMS Improvements',
    changes: [
      'Enhanced CMS content management with page builder',
      'Improved communications dashboard',
      'Email template management system',
      'Bulk notifications and broadcast communications',
    ],
  },
  {
    version: '2.3.0',
    date: 'January 2026',
    title: 'Analytics & Reporting',
    changes: [
      'Platform analytics dashboard with real-time stats',
      'Audit log for admin actions',
      'Financial reporting with Stripe integration',
      'Growth and marketing insights',
    ],
  },
  {
    version: '2.2.0',
    date: 'December 2025',
    title: 'Moderation & Security',
    changes: [
      'Content moderation and reports system',
      'Comments management panel',
      'Enhanced security settings (2FA, session timeout)',
      'Privacy and GDPR compliance tools',
    ],
  },
  {
    version: '2.1.0',
    date: 'November 2025',
    title: 'User Management Overhaul',
    changes: [
      'User verification workflow',
      'Talent profile management from admin',
      'Bulk user actions (ban, delete, export)',
      'Role-based access control improvements',
    ],
  },
  {
    version: '2.0.0',
    date: 'October 2025',
    title: 'Admin Portal Launch',
    changes: [
      'Complete admin dashboard redesign',
      'System health monitoring',
      'Category management',
      'API key management',
      'Support ticket system',
    ],
  },
  {
    version: '1.0.0',
    date: 'August 2025',
    title: 'Initial Release',
    changes: [
      '3YESES talent marketplace launch',
      'User registration and profile creation',
      'Portfolio uploads (images, video, audio)',
      'Stripe subscription billing (Standard plan)',
      'Multi-language support (10 locales)',
      'Search and discovery features',
    ],
  },
];

/* ─── System documentation sections ─── */
const DOCUMENTATION_SECTIONS = [
  {
    id: 'overview',
    title: 'Platform Overview',
    icon: Layers,
    content: [
      {
        heading: 'What is 3YESES?',
        text: '3YESES is a subscription-based talent marketplace where performers — actors, musicians, models, voice artists, dancers, and other creative professionals — showcase their portfolios and get discovered.',
      },
      {
        heading: 'Core Mission',
        text: 'Our mission is to democratise talent discovery by providing an affordable, accessible platform that connects talented individuals with opportunities. With a simple £10/6-month or £20/12-month subscription, talents gain full access to all platform features.',
      },
    ],
  },
  {
    id: 'architecture',
    title: 'Technical Architecture',
    icon: Server,
    content: [
      {
        heading: 'Technology Stack',
        text: 'Built with Next.js 14 (App Router), React 18, TypeScript (strict mode), PostgreSQL with Prisma ORM, Stripe for subscription billing, Tailwind CSS for styling, and next-intl for internationalisation across 10 locales.',
      },
      {
        heading: 'Database',
        text: 'PostgreSQL database managed through Prisma ORM with approximately 20 models covering Users, Talent Profiles, Portfolio Items, Subscriptions, Payments, analytics, and more.',
      },
      {
        heading: 'Authentication',
        text: 'JWT-based authentication with bcrypt password hashing. Sessions are stored in HTTP-only cookies. Email verification required for sensitive actions.',
      },
    ],
  },
  {
    id: 'user-management',
    title: 'User Management Guide',
    icon: Users,
    content: [
      {
        heading: 'User Roles',
        text: 'The platform supports multiple user roles: ADMIN (full platform control), TALENT (performers with portfolios), and CLIENT (those browsing/discovering talent). Admins can manage all users from the Users & Talent section.',
      },
      {
        heading: 'Verification Process',
        text: 'Talent profiles can be verified through the Verification panel. Verified profiles receive a badge and priority in search results. Admins review submitted identity documents and portfolio evidence.',
      },
      {
        heading: 'User Actions',
        text: 'From the admin panel you can: view/edit user profiles, reset passwords, ban/unban accounts, approve new registrations, manage verification status, and export user data.',
      },
    ],
  },
  {
    id: 'subscriptions',
    title: 'Subscription & Billing',
    icon: CreditCard,
    content: [
      {
        heading: 'Subscription Model',
        text: 'The platform operates on a single-tier subscription model. The Standard plan costs £10 per 6 months, billed via Stripe recurring subscription. There are no per-booking fees.',
      },
      {
        heading: 'Feature Access',
        text: 'Subscription is mandatory — users subscribe during sign-up. Without an active subscription the platform cannot be used. With Standard subscription: unlimited portfolio uploads, full profile customisation, priority search ranking, and full analytics.',
      },
      {
        heading: 'Stripe Integration',
        text: 'Payments are handled entirely through Stripe. Webhooks process subscription events (creation, updates, cancellation). Environment variables store all Stripe keys securely.',
      },
    ],
  },
  {
    id: 'content',
    title: 'Content Management',
    icon: FileText,
    content: [
      {
        heading: 'CMS System',
        text: 'The built-in CMS allows editing of static pages, FAQs, and marketing content. All content supports multiple languages via the internationalisation system.',
      },
      {
        heading: 'Portfolio Management',
        text: 'Talents upload images, videos, and audio to their portfolio. Files are stored via ImageKit. Admins can moderate portfolio content through the reports system.',
      },
    ],
  },
  {
    id: 'search',
    title: 'Search & Discovery',
    icon: Search,
    content: [
      {
        heading: 'Search Features',
        text: 'The platform provides advanced search with filters for talent category, location, skills, languages, physical characteristics, and more. Subscribed talents receive priority placement in search results.',
      },
      {
        heading: 'Categories',
        text: 'Talent categories are managed from the Categories section. Each category can have subcategories and associated skills. Categories affect search filtering and homepage showcase.',
      },
    ],
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    icon: Lock,
    content: [
      {
        heading: 'Security Measures',
        text: 'All API routes validate input using Zod schemas. JWT tokens in HTTP-only cookies. CSRF protection via SameSite cookie policy. Rate limiting on authentication endpoints. All passwords hashed with bcrypt.',
      },
      {
        heading: 'Privacy Compliance',
        text: 'GDPR-compliant data handling. Users can request data export or account deletion. Cookie consent banner for tracking. Privacy policy and terms of service managed through CMS.',
      },
      {
        heading: 'Audit Trail',
        text: 'All admin actions are logged in the Audit Log. Each entry records the admin user, action performed, target entity, timestamp, and IP address.',
      },
    ],
  },
  {
    id: 'i18n',
    title: 'Internationalisation',
    icon: Languages,
    content: [
      {
        heading: 'Language Support',
        text: '3YESES supports 10 locales using next-intl. Translations are stored in JSON message files under the messages/ directory. Server components use getTranslations, client components use useTranslations.',
      },
      {
        heading: 'Adding Languages',
        text: 'To add a new locale: create a message file in messages/, add the locale to the i18n config, and add translations for all keys. The language switcher automatically picks up new locales.',
      },
    ],
  },
];

/* ─── Tab type ─── */
type TabId = 'about' | 'versions' | 'docs';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<TabId>('about');
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set([VERSION_HISTORY[0].version]));
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set(['overview']));

  const toggleVersion = (version: string) => {
    setExpandedVersions(prev => {
      const next = new Set(prev);
      if (next.has(version)) next.delete(version);
      else next.add(version);
      return next;
    });
  };

  const toggleDoc = (id: string) => {
    setExpandedDocs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const tabs = [
    { id: 'about' as TabId, name: 'About 3YESES', icon: Info },
    { id: 'versions' as TabId, name: 'Version History', icon: History },
    { id: 'docs' as TabId, name: 'Documentation', icon: BookOpen },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[var(--admin-text)] tracking-tight flex items-center gap-3">
          <Info className="h-7 w-7 text-[var(--admin-primary)]" />
          About &amp; Help
        </h1>
        <p className="text-[var(--admin-muted)] mt-1 font-medium">
          Platform information, version history, and system documentation
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--admin-border)] pb-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-t-lg transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-[var(--admin-primary)] text-[var(--admin-primary)] bg-[var(--admin-surface)]'
                  : 'border-transparent text-[var(--admin-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface)]/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* ─── About Tab ─── */}
      {activeTab === 'about' && (
        <div className="space-y-6">
          {/* Hero Card */}
          <div className="bg-gradient-to-br from-[var(--admin-primary)]/10 via-[var(--admin-surface)] to-[var(--admin-accent)]/10 rounded-2xl border border-[var(--admin-border)] p-8">
            <div className="flex items-start gap-6">
              <div className="bg-[var(--admin-primary)]/10 p-4 rounded-2xl border border-[var(--admin-primary)]/20 shrink-0">
                <Globe className="h-10 w-10 text-[var(--admin-primary)]" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-[var(--admin-text)] mb-2">3YESES Talent Marketplace</h2>
                <p className="text-[var(--admin-muted)] leading-relaxed max-w-3xl">
                  3YESES is a subscription-based talent marketplace designed to empower creative professionals. 
                  Our platform enables actors, musicians, models, voice artists, 
                  dancers, and other performers to showcase their portfolios and get discovered.
                </p>
              </div>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, label: 'Talent Categories', value: '10+', desc: 'Acting, Music, Dance, Modelling & more' },
              { icon: Globe, label: 'Languages', value: '11', desc: 'Multi-locale support via next-intl' },
              { icon: CreditCard, label: 'Subscription', value: '£10/6mo', desc: 'Single affordable Standard plan' },
              { icon: Shield, label: 'Current Version', value: 'v2.5.0', desc: 'Latest stable release' },
            ].map((stat, i) => (
              <div key={i} className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-5">
                <div className="flex items-center gap-3 mb-3">
                  <stat.icon className="h-5 w-5 text-[var(--admin-primary)]" />
                  <span className="text-xs font-bold text-[var(--admin-muted)] uppercase tracking-wider">{stat.label}</span>
                </div>
                <p className="text-2xl font-black text-[var(--admin-text)]">{stat.value}</p>
                <p className="text-xs text-[var(--admin-muted)] mt-1">{stat.desc}</p>
              </div>
            ))}
          </div>

          {/* Platform Features */}
          <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-6">
            <h3 className="text-lg font-bold text-[var(--admin-text)] mb-4">Platform Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Camera, title: 'Portfolio Showcase', desc: 'Upload images, videos, and audio. Showcase your talent with a rich multimedia portfolio.' },
                { icon: Search, title: 'Advanced Search', desc: 'Filter by category, location, skills, languages, and physical characteristics.' },
                { icon: BarChart2, title: 'Analytics Dashboard', desc: 'Track profile views, search appearances, and engagement metrics.' },
                { icon: Palette, title: 'Full Customisation', desc: 'Customise your profile with bio, showreel, skills, experience, and availability.' },
                { icon: Zap, title: 'Priority Ranking', desc: 'Subscribed talents appear higher in search results for maximum visibility.' },
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-[var(--admin-bg)] border border-[var(--admin-border)]/50">
                  <feature.icon className="h-5 w-5 text-[var(--admin-primary)] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-sm text-[var(--admin-text)]">{feature.title}</p>
                    <p className="text-xs text-[var(--admin-muted)] mt-0.5">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-6">
            <h3 className="text-lg font-bold text-[var(--admin-text)] mb-4 flex items-center gap-2">
              <Code className="h-5 w-5 text-[var(--admin-primary)]" />
              Technology Stack
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { name: 'Next.js 14', desc: 'App Router' },
                { name: 'React 18', desc: 'Server & Client Components' },
                { name: 'TypeScript', desc: 'Strict Mode' },
                { name: 'PostgreSQL', desc: 'Primary Database' },
                { name: 'Prisma ORM', desc: 'Database Management' },
                { name: 'Stripe', desc: 'Subscription Billing' },
                { name: 'Tailwind CSS', desc: 'Styling Framework' },
                { name: 'next-intl', desc: '11 Locales' },
                { name: 'ImageKit', desc: 'Media Storage' },
                { name: 'JWT + bcrypt', desc: 'Authentication' },
                { name: 'Zod', desc: 'Input Validation' },
                { name: 'Playwright', desc: 'E2E Testing' },
              ].map((tech, i) => (
                <div key={i} className="bg-[var(--admin-bg)] rounded-lg p-3 border border-[var(--admin-border)]/50">
                  <p className="font-bold text-sm text-[var(--admin-text)]">{tech.name}</p>
                  <p className="text-[10px] text-[var(--admin-muted)] mt-0.5">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Version History Tab ─── */}
      {activeTab === 'versions' && (
        <div className="space-y-4">
          <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-6">
            <h3 className="text-lg font-bold text-[var(--admin-text)] mb-1">Release History</h3>
            <p className="text-sm text-[var(--admin-muted)] mb-6">
              Track all platform updates, new features, and improvements.
            </p>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[18px] top-0 bottom-0 w-px bg-[var(--admin-border)]" />

              <div className="space-y-4">
                {VERSION_HISTORY.map((release, idx) => {
                  const isExpanded = expandedVersions.has(release.version);
                  const isLatest = idx === 0;
                  return (
                    <div key={release.version} className="relative pl-12">
                      {/* Timeline dot */}
                      <div className={`absolute left-[11px] top-4 w-[15px] h-[15px] rounded-full border-2 ${
                        isLatest
                          ? 'bg-[var(--admin-primary)] border-[var(--admin-primary)] shadow-[0_0_8px_var(--admin-primary)]'
                          : 'bg-[var(--admin-surface)] border-[var(--admin-border)]'
                      }`} />

                      <button
                        onClick={() => toggleVersion(release.version)}
                        className="w-full text-left bg-[var(--admin-bg)] hover:bg-[var(--admin-bg)]/80 rounded-lg border border-[var(--admin-border)] p-4 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                              isLatest
                                ? 'bg-[var(--admin-primary)]/10 text-[var(--admin-primary)] border border-[var(--admin-primary)]/30'
                                : 'bg-[var(--admin-surface)] text-[var(--admin-muted)] border border-[var(--admin-border)]'
                            }`}>
                              v{release.version}
                            </span>
                            <span className="font-bold text-[var(--admin-text)]">{release.title}</span>
                            {isLatest && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-[var(--admin-muted)]">{release.date}</span>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-[var(--admin-muted)]" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-[var(--admin-muted)]" />
                            )}
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="mt-2 ml-4 bg-[var(--admin-bg)]/50 rounded-lg border border-[var(--admin-border)]/50 p-4">
                          <ul className="space-y-2">
                            {release.changes.map((change, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-[var(--admin-muted)]">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--admin-primary)] shrink-0" />
                                {change}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Documentation Tab ─── */}
      {activeTab === 'docs' && (
        <div className="space-y-4">
          <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-6">
            <h3 className="text-lg font-bold text-[var(--admin-text)] mb-1">System Documentation</h3>
            <p className="text-sm text-[var(--admin-muted)] mb-6">
              Comprehensive guide for managing and understanding the 3YESES platform.
            </p>

            <div className="space-y-3">
              {DOCUMENTATION_SECTIONS.map((section) => {
                const Icon = section.icon;
                const isExpanded = expandedDocs.has(section.id);
                return (
                  <div key={section.id} className="border border-[var(--admin-border)] rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleDoc(section.id)}
                      className="w-full flex items-center justify-between p-4 bg-[var(--admin-bg)] hover:bg-[var(--admin-bg)]/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-[var(--admin-primary)]" />
                        <span className="font-bold text-[var(--admin-text)]">{section.title}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-[var(--admin-muted)]" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-[var(--admin-muted)]" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-5 space-y-5 bg-[var(--admin-surface)]/50">
                        {section.content.map((item, i) => (
                          <div key={i}>
                            <h4 className="font-bold text-sm text-[var(--admin-text)] mb-1.5">{item.heading}</h4>
                            <p className="text-sm text-[var(--admin-muted)] leading-relaxed">{item.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Reference Card */}
          <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-6">
            <h3 className="text-lg font-bold text-[var(--admin-text)] mb-4 flex items-center gap-2">
              <Database className="h-5 w-5 text-[var(--admin-primary)]" />
              Quick Reference
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[var(--admin-muted)] uppercase tracking-wider">Key URLs</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Admin Dashboard', path: '/admin' },
                    { label: 'User Management', path: '/admin/users' },
                    { label: 'System Settings', path: '/admin/settings' },
                    { label: 'Analytics', path: '/admin/analytics' },
                    { label: 'Audit Log', path: '/admin/audit' },
                    { label: 'Support Tickets', path: '/admin/support' },
                  ].map((link, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-[var(--admin-text)]">{link.label}</span>
                      <code className="text-xs text-[var(--admin-muted)] bg-[var(--admin-bg)] px-2 py-0.5 rounded border border-[var(--admin-border)]">
                        {link.path}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[var(--admin-muted)] uppercase tracking-wider">Environment</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Framework', value: 'Next.js 14 (App Router)' },
                    { label: 'Language', value: 'TypeScript (Strict)' },
                    { label: 'Database', value: 'PostgreSQL + Prisma' },
                    { label: 'Payments', value: 'Stripe (Subscription)' },
                    { label: 'Media Storage', value: 'ImageKit' },
                    { label: 'Deployment', value: 'Production' },
                  ].map((env, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-[var(--admin-muted)]">{env.label}</span>
                      <span className="text-[var(--admin-text)] font-medium">{env.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
