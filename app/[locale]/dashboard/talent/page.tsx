'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from 'next-intl';
import LoadingSpinner from '@/components/LoadingSpinner';
import { buildLocalizedPath, normalizeLocale } from '@/lib/locale-path';
import {
  Bell,
  Briefcase,
  Clock,
  DollarSign,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Users,
  Settings,
  ArrowRight,
} from 'lucide-react';

interface DashboardStats {
  totalViews: number;
  activeOpportunities: number;
  subscriptionPlan: string;
  totalEarnings: number;
  responseRate: number;
}

interface WarningNotification {
  id: string;
  title?: string;
  message: string;
  type?: string;
  read?: boolean;
}

const statShell =
  'rounded-[1.75rem] border border-slate-200/70 bg-light-surface/95 p-5 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.35)] transition-transform duration-200 hover:-translate-y-1 dark:border-slate-800/70 dark:bg-dark-surface/92';

export default function TalentDashboard() {
  const { user } = useAuth();
  const routeLocale = useLocale();
  const locale = normalizeLocale(routeLocale || 'en-gb');
  const [stats, setStats] = useState<DashboardStats>({
    totalViews: 0,
    activeOpportunities: 0,
    subscriptionPlan: 'FREE',
    totalEarnings: 0,
    responseRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [warningNotifications, setWarningNotifications] = useState<WarningNotification[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsRes, notifRes] = await Promise.all([
          fetch('/api/dashboard/stats', { credentials: 'include' }),
          fetch('/api/notifications', { credentials: 'include' }),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            totalViews: statsData.profileViews || 0,
            activeOpportunities: statsData.availableOpportunities || 0,
            subscriptionPlan: statsData.subscriptionPlan || 'STANDARD',
            totalEarnings: statsData.totalEarnings || 0,
            responseRate: statsData.responseRate || 0,
          });
        } else {
          setStats((prev) => ({ ...prev, subscriptionPlan: 'STANDARD' }));
        }

        if (notifRes.ok) {
          const notifData = await notifRes.json();
          const warnings = (notifData.notifications || []).filter(
            (n: WarningNotification) => n.type === 'system' && !n.read
          );
          setWarningNotifications(warnings);
        }
      } catch (error) {
        console.error('Failed to fetch talent dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const quickActions = useMemo(
    () => [
      {
        href: buildLocalizedPath(locale, '/dashboard/talent/settings'),
        title: 'Profile settings',
        description: 'Update privacy, visibility, and account preferences.',
        icon: Settings,
      },
      {
        href: buildLocalizedPath(locale, '/dashboard/gallery'),
        title: 'Portfolio gallery',
        description: 'Review the work that is currently live on your profile.',
        icon: User,
      },
      {
        href: buildLocalizedPath(locale, '/support/notifications'),
        title: 'Notifications',
        description: 'Check admin messages, system notices, and updates.',
        icon: Bell,
      },
    ],
    [locale]
  );

  if (loading || !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.08),transparent_32%),linear-gradient(180deg,var(--background),color-mix(in_srgb,var(--background)_88%,#f8fafc))] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const hasWarnings = warningNotifications.length > 0;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_34%),radial-gradient(circle_at_top_right,rgba(185,28,28,0.08),transparent_30%),linear-gradient(180deg,var(--background),color-mix(in_srgb,var(--background)_86%,#f8fafc))]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/75 bg-light-surface/95 p-6 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.42)] dark:border-slate-800/70 dark:bg-dark-surface/94 md:p-8">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.14),transparent_58%)] lg:block" />
          <div className="relative grid gap-8 lg:grid-cols-[1.5fr_0.95fr]">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/75 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 dark:border-slate-800/70 dark:bg-slate-900/40 dark:text-slate-300">
                <Sparkles size={14} className="text-[color:var(--brand-primary)]" />
                Talent dashboard
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 text-balance dark:text-white sm:text-4xl md:text-5xl">
                  Welcome back, {user.name || 'Talent'}.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                  Keep your profile sharp, monitor engagement, and act on anything that needs attention without digging through clutter.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full bg-[color:var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_-18px_rgba(37,99,235,0.9)]">
                  {stats.subscriptionPlan.toUpperCase()} plan
                </div>
                <div className="rounded-full border border-slate-200/70 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 dark:border-slate-800/70 dark:bg-slate-900/50 dark:text-slate-300">
                  {stats.responseRate.toLocaleString(locale, { maximumFractionDigits: 1 })}% response rate
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.75rem] border border-slate-200/70 bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(37,99,235,0.02))] p-5 dark:border-slate-800/70 dark:bg-[linear-gradient(135deg,rgba(185,28,28,0.16),rgba(24,24,27,0.72))]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                      Profile reach
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                      {stats.totalViews.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/85 p-3 text-[color:var(--brand-primary)] shadow-sm dark:bg-slate-950/60">
                    <TrendingUp size={22} />
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                  Views picked up {stats.activeOpportunities} active opportunities this cycle.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[1.5rem] border border-slate-200/70 bg-light-surface/95 p-4 dark:border-slate-800/70 dark:bg-dark-surface/95">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Earnings
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                    ${stats.totalEarnings.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200/70 bg-light-surface/95 p-4 dark:border-slate-800/70 dark:bg-dark-surface/95">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Opportunities
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                    {stats.activeOpportunities}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-slate-200/70 bg-light-surface/95 p-6 shadow-[0_18px_44px_-30px_rgba(15,23,42,0.4)] dark:border-slate-800/70 dark:bg-dark-surface/94">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Quick actions
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                  Keep the profile moving
                </h2>
              </div>
              <div className="rounded-full bg-[color:var(--brand-primary)]/10 px-3 py-1 text-xs font-semibold text-[color:var(--brand-primary)]">
                {hasWarnings ? `${warningNotifications.length} alerts` : 'No alerts'}
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="group flex items-start gap-4 rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-4 transition-all hover:-translate-y-0.5 hover:border-[color:var(--brand-primary)]/30 hover:shadow-[0_16px_36px_-24px_rgba(37,99,235,0.55)] dark:border-slate-800/70 dark:bg-slate-950/30"
                  >
                    <div className="rounded-2xl bg-[color:var(--brand-primary)]/10 p-3 text-[color:var(--brand-primary)] transition-colors group-hover:bg-[color:var(--brand-primary)] group-hover:text-white">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{action.title}</h3>
                        <ArrowRight size={16} className="text-slate-400 transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{action.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <aside className="rounded-[2rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(37,99,235,0.08),rgba(37,99,235,0.02))] p-6 shadow-[0_18px_44px_-30px_rgba(15,23,42,0.4)] dark:border-slate-800/70 dark:bg-[linear-gradient(180deg,rgba(185,28,28,0.16),rgba(24,24,27,0.94))]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  User helper
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                  Built to match the dashboard
                </h2>
              </div>
              <ShieldCheck size={20} className="text-[color:var(--brand-primary)]" />
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              This area now follows the same theme treatment as the rest of the dashboard, so support and setup links feel part of the system instead of a separate widget.
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-[1.5rem] border border-slate-200/70 bg-light-surface/92 p-4 dark:border-slate-800/70 dark:bg-slate-950/35">
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-[color:var(--brand-primary)]" />
                  <p className="text-sm font-medium text-slate-950 dark:text-white">
                    Review notifications and warnings first.
                  </p>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200/70 bg-light-surface/92 p-4 dark:border-slate-800/70 dark:bg-slate-950/35">
                <div className="flex items-center gap-3">
                  <Briefcase size={16} className="text-[color:var(--brand-primary)]" />
                  <p className="text-sm font-medium text-slate-950 dark:text-white">
                    Keep gallery items fresh so the profile feels current.
                  </p>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200/70 bg-light-surface/92 p-4 dark:border-slate-800/70 dark:bg-slate-950/35">
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-[color:var(--brand-primary)]" />
                  <p className="text-sm font-medium text-slate-950 dark:text-white">
                    Check your response rate before the next opportunity batch.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href={buildLocalizedPath(locale, '/support')}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_-18px_rgba(37,99,235,0.9)] transition-transform hover:-translate-y-0.5"
            >
              Open support
              <ArrowRight size={16} />
            </Link>
          </aside>
        </div>

        {hasWarnings && (
          <section className="mt-8 rounded-[2rem] border border-amber-200/80 bg-amber-50/80 p-6 shadow-[0_18px_44px_-32px_rgba(180,83,9,0.45)] dark:border-amber-500/30 dark:bg-amber-950/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-200">
                  Admin warnings
                </p>
                <h2 className="mt-1 text-lg font-semibold text-amber-950 dark:text-amber-50">
                  Please clear these items soon
                </h2>
              </div>
              <Link
                href={buildLocalizedPath(locale, '/support/notifications')}
                className="text-sm font-semibold text-amber-800 underline-offset-4 hover:underline dark:text-amber-200"
              >
                View notifications
              </Link>
            </div>
            <div className="mt-4 grid gap-3">
              {warningNotifications.map((warning) => (
                <article
                  key={warning.id}
                  className="rounded-[1.25rem] border border-amber-200/80 bg-light-surface/90 p-4 dark:border-amber-500/30 dark:bg-slate-950/50"
                >
                  <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    {warning.title || 'System notice'}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-amber-800/90 dark:text-amber-100/90">
                    {warning.message}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className={statShell}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Profile views
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  {stats.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl bg-[color:var(--brand-primary)]/10 p-3 text-[color:var(--brand-primary)]">
                <TrendingUp size={20} />
              </div>
            </div>
          </div>

          <div className={statShell}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Active opportunities
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  {stats.activeOpportunities}
                </p>
              </div>
              <div className="rounded-2xl bg-[color:var(--brand-primary)]/10 p-3 text-[color:var(--brand-primary)]">
                <Briefcase size={20} />
              </div>
            </div>
          </div>

          <div className={statShell}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Total earnings
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  ${stats.totalEarnings.toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl bg-[color:var(--brand-primary)]/10 p-3 text-[color:var(--brand-primary)]">
                <DollarSign size={20} />
              </div>
            </div>
          </div>

          <div className={statShell}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Response rate
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  {stats.responseRate.toLocaleString(locale, { maximumFractionDigits: 1 })}%
                </p>
              </div>
              <div className="rounded-2xl bg-[color:var(--brand-primary)]/10 p-3 text-[color:var(--brand-primary)]">
                <TrendingUp size={20} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
