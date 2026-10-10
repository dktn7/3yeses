'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { buildLocalizedPath } from '@/lib/locale-path';
import {
  Activity as ActivityIcon,
  Calendar,
  Eye,
  Heart,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import SwoopingTick from '@/components/SwoopingTick';
import {
  DashboardHeader,
  DashboardButton,
  DashboardLoadError,
  DashboardPage,
} from '@/components/dashboard/DashboardPrimitives';

interface Activity {
  type: 'view' | 'comment' | 'like';
  text: string;
  time: string;
}

const activityPresentation: Record<Activity['type'], {
  icon: LucideIcon;
  label: string;
  color: string;
  background: string;
}> = {
  view: {
    icon: Eye,
    label: 'Profile view',
    color: 'text-blue-600 dark:text-red-300',
    background: 'bg-blue-500/10 dark:bg-red-500/20',
  },
  comment: {
    icon: MessageSquare,
    label: 'Comment',
    color: 'text-emerald-700 dark:text-emerald-300',
    background: 'bg-emerald-500/10 dark:bg-emerald-500/15',
  },
  like: {
    icon: Heart,
    label: 'Profile like',
    color: 'text-[color:var(--brand-primary)]',
    background: 'bg-[color:var(--brand-primary)]/10',
  },
};

export default function ActivityPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('dashboard.activity');
  const { user, loading } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/signin');
  }, [loading, user, router]);

  const fetchActivities = useCallback(async () => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;

    try {
      setLoadingData(true);
      setLoadError(false);
      const response = await fetch('/api/dashboard/activity', { signal: controller.signal });
      if (!response.ok) throw new Error('Activity unavailable');

      const data = await response.json();
      if (!controller.signal.aborted) setActivities(data.activities || []);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setLoadError(true);
    } finally {
      if (activeRequest.current === controller) setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchActivities();
    return () => activeRequest.current?.abort();
  }, [user, fetchActivities]);

  if (loading || !mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-light-surface dark:bg-dark-surface">
        <div className="animate-spin" role="status" aria-label={t('loading')}>
          <SwoopingTick size={80} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const activityCounts = activities.reduce(
    (counts, activity) => ({ ...counts, [activity.type]: counts[activity.type] + 1 }),
    { view: 0, comment: 0, like: 0 },
  );
  const isEarlyTrail = activities.length > 0 && activities.length <= 3;
  const dateLabel = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <DashboardPage className="dashboard-activity-page">
      <DashboardHeader
        icon={ActivityIcon}
        title={t('title')}
        description={t('subtitle')}
        meta={
          <div className="inline-flex items-center gap-2 border-l-2 border-[color:var(--brand-primary)] pl-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Calendar className="h-4 w-4 text-[color:var(--brand-primary)]" aria-hidden="true" />
            {dateLabel}
          </div>
        }
      />

      {loadError ? (
        <DashboardLoadError onRetry={fetchActivities} />
      ) : loadingData ? (
        <div role="status" aria-label={t('loading')} className="border-y border-[color:var(--dashboard-line)] py-3 motion-safe:animate-pulse">
          <span className="sr-only">{t('loading')}</span>
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="grid grid-cols-[3rem_minmax(0,1fr)_5rem] items-center gap-4 border-b border-[color:var(--dashboard-line)] px-3 py-5 last:border-b-0 sm:px-6">
              <div className="h-11 w-11 rounded-full bg-slate-200/80 dark:bg-neutral-800" />
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-slate-200/80 dark:bg-neutral-800" />
                <div className="h-4 w-3/4 rounded bg-slate-200/80 dark:bg-neutral-800" />
              </div>
              <div className="h-3 rounded bg-slate-200/80 dark:bg-neutral-800" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {activities.length > 0 && (
            <section aria-label="Recent activity summary" className="mb-8 grid grid-cols-3 overflow-hidden border-y border-[color:var(--dashboard-line)] bg-[color:var(--dashboard-panel)] lg:grid-cols-[1.25fr_repeat(3,0.65fr)]">
              <div className="col-span-3 border-b border-[color:var(--dashboard-line)] p-6 lg:col-span-1 lg:border-b-0 lg:border-r">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">{isEarlyTrail ? 'First signals' : 'Latest signals'}</p>
                <p className="mt-4 tabular-nums text-5xl font-semibold leading-none text-slate-950 dark:text-white">{activities.length}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{isEarlyTrail ? 'Your profile trail has started' : 'Recent profile interactions'}</p>
              </div>
              {(['view', 'comment', 'like'] as const).map((type) => {
                const presentation = activityPresentation[type];
                const Icon = presentation.icon;
                return (
                  <div key={type} className="flex min-h-28 min-w-0 flex-col justify-between border-r border-[color:var(--dashboard-line)] p-4 last:border-r-0 sm:min-h-32 sm:p-5">
                    <Icon className={`h-5 w-5 ${presentation.color}`} aria-hidden="true" />
                    <div>
                      <p className="tabular-nums text-2xl font-semibold text-slate-950 dark:text-white">{activityCounts[type]}</p>
                      <p className="mt-1 break-words text-[10px] font-semibold uppercase leading-4 tracking-[0.08em] text-slate-500 dark:text-slate-400 sm:text-xs sm:tracking-[0.12em]">{presentation.label}</p>
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {activities.length === 0 ? (
            <section className="grid min-h-72 items-center gap-6 border-y border-[color:var(--dashboard-line)] py-8 md:grid-cols-[0.65fr_1.35fr]" aria-labelledby="activity-empty-heading">
              <div className="flex min-h-36 items-center justify-center md:border-r md:border-[color:var(--dashboard-line)]">
                <div className="border-l-2 border-[color:var(--brand-primary)] pl-5 text-left">
                  <ActivityIcon className="h-10 w-10 text-[color:var(--brand-primary)]" aria-hidden="true" />
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">3YESES / ACTIVITY</p>
                </div>
              </div>
              <div className="px-5 text-center md:px-10 md:text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">Your trail is ready</p>
                <h2 id="activity-empty-heading" className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Give people a profile worth reacting to.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">This is where the response to your 3YESES presence becomes visible. A strong introduction earns the open; memorable media earns the like or comment.</p>

                <dl className="mt-6 grid border-y border-[color:var(--dashboard-line)] text-left sm:grid-cols-3">
                  {([
                    [Eye, 'Profile views', 'People opening your public profile.'],
                    [Heart, 'Appreciation', 'Likes on the profile you are building.'],
                    [MessageSquare, 'Conversation', 'Comments left on your media.'],
                  ] as const).map(([Icon, label, description]) => (
                    <div key={label} className="border-b border-[color:var(--dashboard-line)] py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:px-4 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0">
                      <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-950 dark:text-white">
                        <Icon className="h-4 w-4 text-[color:var(--brand-primary)]" aria-hidden="true" />
                        {label}
                      </dt>
                      <dd className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
                  <DashboardButton href={buildLocalizedPath(locale, '/dashboard/profile')}>Shape my profile</DashboardButton>
                  <DashboardButton href={buildLocalizedPath(locale, '/dashboard/gallery')} variant="secondary">Publish media</DashboardButton>
                </div>
              </div>
            </section>
          ) : (
            <section aria-labelledby="activity-timeline-heading" className="grid gap-8 lg:grid-cols-[0.42fr_1fr]">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">{isEarlyTrail ? 'Early profile trail' : 'Live profile trail'}</p>
                <h2 id="activity-timeline-heading" className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{isEarlyTrail ? 'Your first signals are landing.' : 'Attention, in order'}</h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {isEarlyTrail
                    ? 'A few interactions are enough to show what is beginning to connect. Keep the profile current and give visitors another strong piece of media to open.'
                    : 'The newest view, comment, or like appears first.'}
                </p>
                {isEarlyTrail && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <DashboardButton href={buildLocalizedPath(locale, '/dashboard/gallery')} variant="secondary">Add fresh media</DashboardButton>
                    <DashboardButton href={buildLocalizedPath(locale, '/dashboard/profile')} variant="ghost">Refine profile</DashboardButton>
                  </div>
                )}
              </div>

              <ol className="relative border-l border-[color:var(--dashboard-line)]" aria-label="Recent profile activity">
                {activities.map((activity, index) => {
                  const presentation = activityPresentation[activity.type];
                  const Icon = presentation.icon;
                  return (
                    <li key={`${activity.type}-${activity.time}-${activity.text}-${index}`} className="group relative border-b border-[color:var(--dashboard-line)] py-5 pl-8 pr-2 first:pt-0 last:border-b-0 sm:pl-10 sm:pr-4">
                      <span className={`absolute -left-[1.4rem] top-4 flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--dashboard-line)] ${presentation.background} ${presentation.color} transition-transform duration-200 group-hover:scale-105 sm:-left-[1.45rem]`}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <article className={`grid gap-3 rounded-lg px-4 py-3 transition-colors duration-200 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center ${index === 0 ? 'bg-[color:var(--brand-primary)]/[0.05]' : 'hover:bg-slate-950/[0.03] dark:hover:bg-white/[0.04]'}`}>
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold uppercase tracking-[0.12em] ${presentation.color}`}>{presentation.label}</p>
                          <p className="mt-1 text-sm font-semibold leading-6 text-slate-950 dark:text-white">{activity.text}</p>
                        </div>
                        <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                          {activity.time}
                        </p>
                      </article>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
        </>
      )}
    </DashboardPage>
  );
}
