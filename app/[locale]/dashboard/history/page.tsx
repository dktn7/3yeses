'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Calendar, Clock, Eye, Images, MapPin } from 'lucide-react';
import Link from 'next/link';
import FeaturedTalentCard from '@/components/FeaturedTalentCard';
import {
  DashboardButton,
  DashboardLoadError,
  DashboardLoading,
  DashboardPage,
  EmptyState,
  SegmentedControl,
} from '@/components/dashboard/DashboardPrimitives';
import { buildLocalizedPath, normalizeLocale } from '@/lib/locale-path';

interface MediaItem {
  id: string;
  title: string;
  mediaUrl?: string;
  url?: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO';
  thumbnail?: string;
}

interface ViewedTalent {
  viewId?: string;
  id: string;
  name: string;
  category: string;
  categoryId?: string | null;
  location: string;
  imageUrl?: string;
  viewedAt: string;
  viewedDay?: string;
  mediaItems: MediaItem[];
}

interface HistoryGroup {
  key: string;
  label: string;
  talents: ViewedTalent[];
}

type LoadStatus = 'loading' | 'ready' | 'error';

function getTalentAvatar(talent: ViewedTalent) {
  if (talent.imageUrl) return talent.imageUrl;
  return talent.mediaItems.find((item) => item.thumbnail)?.thumbnail
    || talent.mediaItems.find((item) => item.type === 'IMAGE')?.mediaUrl
    || talent.mediaItems.find((item) => item.type === 'IMAGE')?.url
    || '';
}

function formatTime(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(date);
}

export default function ViewHistoryPage() {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [viewedTalents, setViewedTalents] = useState<ViewedTalent[]>([]);
  const [timeFilter, setTimeFilter] = useState('all');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const router = useRouter();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = normalizeLocale(typeof pathname === 'string' ? pathname.split('/')[1] || 'en-gb' : 'en-gb');

  useEffect(() => {
    const controller = new AbortController();

    const loadViewHistory = async () => {
      setStatus('loading');
      try {
        const response = await fetch('/api/auth/verify', {
          credentials: 'include',
          signal: controller.signal,
        });

        if (!response.ok) {
          router.replace(buildLocalizedPath(locale, '/auth/signin'));
          return;
        }

        const data = await response.json();
        if (!data.success) {
          router.replace(buildLocalizedPath(locale, '/auth/signin'));
          return;
        }

        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const historyResponse = await fetch(`/api/dashboard/view-history?timeZone=${encodeURIComponent(timeZone)}`, {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!historyResponse.ok) throw new Error('History unavailable');

        const historyData = await historyResponse.json();
        setViewedTalents(historyData.talents || []);
        setStatus('ready');
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setStatus('error');
        }
      }
    };

    loadViewHistory();
    return () => controller.abort();
  }, [router, loadAttempt, locale]);

  const filteredTalents = useMemo(() => viewedTalents.filter((talent) => {
    if (timeFilter === 'all') return true;

    const now = new Date();
    const viewDate = new Date(talent.viewedAt);
    const diffDays = Math.floor((now.getTime() - viewDate.getTime()) / (1000 * 60 * 60 * 24));

    if (timeFilter === 'today') return viewDate.toDateString() === now.toDateString();
    if (timeFilter === 'week') return diffDays <= 7;
    if (timeFilter === 'month') return diffDays <= 30;
    return true;
  }), [timeFilter, viewedTalents]);

  const groupedTalents = useMemo(() => filteredTalents.reduce<HistoryGroup[]>((groups, talent) => {
    const viewDate = new Date(talent.viewedAt);
    const key = talent.viewedDay || viewDate.toLocaleDateString('en-CA');
    const existing = groups.find((group) => group.key === key);
    if (existing) {
      existing.talents.push(talent);
      return groups;
    }

    groups.push({
      key,
      label: viewDate.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }),
      talents: [talent],
    });
    return groups;
  }, []), [filteredTalents, locale]);

  if (status === 'loading') return <DashboardLoading />;

  return (
    <DashboardPage className="space-y-8">
      <Link
        href={buildLocalizedPath(locale, '/dashboard/overview')}
        className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition-colors hover:text-[color:var(--brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-ring)] dark:text-slate-300"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        <span>{t('dashboard.backToDashboard')}</span>
      </Link>

      <header className="grid gap-7 border-y border-slate-200/80 py-8 dark:border-white/10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
            <Eye className="h-4 w-4" aria-hidden="true" />
            Discovery trail
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-slate-950 sm:text-5xl dark:text-white">
            {t('dashboard.viewHistory')}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Retrace the profiles and media that caught your attention, in the order you found them.
          </p>
        </div>
        <div className="flex flex-col items-start gap-4 lg:items-end">
          <div className="flex items-baseline gap-2">
            <span className="tabular-nums text-4xl font-semibold text-slate-950 dark:text-white">{viewedTalents.length}</span>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('dashboard.talentsViewed')}</span>
          </div>
          <SegmentedControl
            value={timeFilter}
            onChange={setTimeFilter}
            options={[
              { value: 'all', label: t('dashboard.allTime') },
              { value: 'today', label: t('dashboard.today') },
              { value: 'week', label: t('dashboard.thisWeek') },
              { value: 'month', label: t('dashboard.thisMonth') },
            ]}
          />
        </div>
      </header>

      {status === 'error' ? (
        <DashboardLoadError onRetry={() => setLoadAttempt((value) => value + 1)} />
      ) : filteredTalents.length === 0 ? (
        <EmptyState
          icon={Eye}
          title={t('dashboard.noViewHistory')}
          description={t('dashboard.startBrowsingTalents')}
          action={<DashboardButton href={buildLocalizedPath(locale, '/hub')}>{t('dashboard.browseTalents')}</DashboardButton>}
        />
      ) : (
        <div className="space-y-14">
          {groupedTalents.map((group) => (
            <section key={group.key} aria-labelledby={`history-${group.key}`}>
              <div className="flex items-center gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--brand-primary)]/10 text-[color:var(--brand-primary)]">
                  <Calendar className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 id={`history-${group.key}`} className="text-lg font-semibold text-slate-950 dark:text-white">
                  {group.label}
                </h2>
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  {group.talents.length} {group.talents.length === 1 ? 'discovery' : 'discoveries'}
                </span>
              </div>

              <ol className="relative mt-8 space-y-12 before:absolute before:bottom-8 before:left-5 before:top-8 before:w-px before:bg-slate-300 dark:before:bg-white/15 md:before:left-1/2 md:before:-translate-x-1/2">
                {group.talents.map((talent, index) => {
                  const isEven = index % 2 === 0;
                  const cardPlacement = isEven
                    ? 'md:col-start-1 md:justify-self-end'
                    : 'md:col-start-3 md:justify-self-start';
                  const metaPlacement = isEven
                    ? 'md:col-start-3 md:text-left'
                    : 'md:col-start-1 md:text-right';
                  const profilePath = buildLocalizedPath(locale, `/talent/${talent.id}`);

                  return (
                    <li
                      key={talent.viewId || `${talent.id}-${talent.viewedAt}-${index}`}
                      className="relative grid grid-cols-[2.75rem_minmax(0,1fr)] items-start md:grid-cols-[minmax(0,1fr)_5rem_minmax(0,1fr)]"
                    >
                      <span
                        className="absolute left-5 top-6 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-[color:var(--brand-primary)] bg-white shadow-[0_0_0_6px_rgba(var(--brand-primary-rgb),0.10)] dark:bg-neutral-950 md:left-1/2"
                        aria-hidden="true"
                      />

                      <article className={`col-start-2 w-full min-w-0 max-w-md ${cardPlacement}`}>
                        <div className="mb-3 flex items-center justify-between gap-3 md:hidden">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-primary)]">
                            Discovery {String(index + 1).padStart(2, '0')}
                          </span>
                          <time className="text-xs text-slate-500 dark:text-slate-400" dateTime={talent.viewedAt}>
                            {formatTime(talent.viewedAt, locale)}
                          </time>
                        </div>
                        <div className="[&_.hub-card]:max-w-none">
                          <FeaturedTalentCard
                            talent={{
                              id: talent.id,
                              user: { name: talent.name },
                              avatarUrl: getTalentAvatar(talent),
                              category: { id: talent.categoryId || undefined, name: talent.category || '' },
                              skills: [],
                            }}
                            mediaItems={talent.mediaItems || []}
                            priority={group === groupedTalents[0] && index === 0}
                            onMediaClick={(item) => router.push(buildLocalizedPath(locale, `/hub/media/${item.id}`))}
                            onProfileClick={() => router.push(profilePath)}
                          />
                        </div>
                      </article>

                      <aside className={`hidden self-center md:row-start-1 md:block ${metaPlacement}`}>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
                          Discovery {String(index + 1).padStart(2, '0')}
                        </p>
                        <time className="mt-2 block text-2xl font-semibold tabular-nums text-slate-950 dark:text-white" dateTime={talent.viewedAt}>
                          {formatTime(talent.viewedAt, locale)}
                        </time>
                        <div className={`mt-4 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400 ${isEven ? 'justify-start' : 'justify-end'}`}>
                          <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{talent.location || 'Location not set'}</span>
                          <span className="inline-flex items-center gap-1.5"><Images className="h-3.5 w-3.5" aria-hidden="true" />{talent.mediaItems?.length || 0} media</span>
                        </div>
                        <Link
                          href={profilePath}
                          className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-slate-700 underline decoration-[color:var(--brand-primary)]/40 underline-offset-4 transition-colors hover:text-[color:var(--brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-ring)] dark:text-slate-200"
                        >
                          <Clock className="h-4 w-4" aria-hidden="true" />
                          Revisit profile
                        </Link>
                      </aside>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </DashboardPage>
  );
}
