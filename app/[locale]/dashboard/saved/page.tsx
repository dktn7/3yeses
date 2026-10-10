'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Filter, Heart, Layers3 } from 'lucide-react';
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

interface SavedTalent {
  id: string;
  name: string;
  category?: string | null;
  categoryId?: string | null;
  location: string;
  imageUrl?: string;
  savedAt: string;
  mediaItems?: MediaItem[];
}

interface Category {
  id: string;
  name: string;
}

type LoadStatus = 'loading' | 'ready' | 'error';

const collectionLayout = [
  'lg:col-span-7',
  'lg:col-span-5',
  'lg:col-span-4',
  'lg:col-span-4',
  'lg:col-span-4',
];

function getTalentAvatar(talent: SavedTalent) {
  if (talent.imageUrl) return talent.imageUrl;
  const media = talent.mediaItems || [];
  return media.find((item) => item.thumbnail)?.thumbnail
    || media.find((item) => item.type === 'IMAGE')?.mediaUrl
    || media.find((item) => item.type === 'IMAGE')?.url
    || '';
}

function formatSavedDate(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export default function SavedTalentsPage() {
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [savedTalents, setSavedTalents] = useState<SavedTalent[]>([]);
  const [filter, setFilter] = useState('all');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = normalizeLocale(typeof pathname === 'string' ? pathname.split('/')[1] || 'en-gb' : 'en-gb');

  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories', { signal: controller.signal });
        if (!response.ok) return;
        const json = await response.json() as Category[] | { categories?: Category[]; data?: Category[] };
        const list = Array.isArray(json) ? json : json.categories || json.data || [];
        setCategories(list.map(({ id, name }) => ({ id, name })));
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Failed to load categories:', error);
        }
      }
    };

    loadCategories();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadSavedTalents = async () => {
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

        const savedResponse = await fetch('/api/dashboard/saved-talents', {
          credentials: 'include',
          signal: controller.signal,
        });
        if (!savedResponse.ok) throw new Error('Saved talent unavailable');

        const savedData = await savedResponse.json();
        setSavedTalents(savedData.talents || []);
        setStatus('ready');
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setStatus('error');
        }
      }
    };

    loadSavedTalents();
    return () => controller.abort();
  }, [router, loadAttempt, locale]);

  const filteredTalents = useMemo(
    () => filter === 'all' ? savedTalents : savedTalents.filter((talent) => (talent.categoryId || '') === filter),
    [filter, savedTalents],
  );

  const filterOptions = useMemo(() => [
    { value: 'all', label: t('dashboard.allCategories'), count: savedTalents.length },
    ...categories.slice(0, 5).map((category) => ({
      value: category.id,
      label: category.name,
      count: savedTalents.filter((talent) => (talent.categoryId || '') === category.id).length,
    })),
  ], [categories, savedTalents, t]);

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

      <header className="grid gap-8 border-y border-slate-200/80 py-8 dark:border-white/10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
            <Heart className="h-4 w-4" aria-hidden="true" />
            Personal collection
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-slate-950 sm:text-5xl dark:text-white">
            {t('dashboard.savedTalents')}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Keep the people whose work you want to return to close, arranged as your own evolving collection.
          </p>
        </div>
        <div className="border-l-2 border-[color:var(--brand-primary)] pl-5">
          <p className="tabular-nums text-5xl font-semibold text-slate-950 dark:text-white">
            {String(savedTalents.length).padStart(2, '0')}
          </p>
          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            {t('dashboard.talentsSaved')}
          </p>
        </div>
      </header>

      <section aria-label="Collection filters" className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 dark:border-white/10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            <Layers3 className="h-4 w-4 text-[color:var(--brand-primary)]" aria-hidden="true" />
            Collection index
          </div>
          <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
            {filteredTalents.length} shown
          </span>
        </div>
        <div className="hidden sm:block">
          <SegmentedControl value={filter} onChange={setFilter} options={filterOptions} />
        </div>
        <label className="flex items-center gap-3 sm:hidden">
          <Filter className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden="true" />
          <span className="sr-only">Filter saved talent by category</span>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="min-h-11 w-full rounded-lg border border-slate-200 bg-light-surface px-3 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[color:var(--brand-ring)] dark:border-slate-700 dark:bg-dark-surface dark:text-white"
          >
            <option value="all">{t('dashboard.allCategories')}</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
      </section>

      {status === 'error' ? (
        <DashboardLoadError onRetry={() => setLoadAttempt((value) => value + 1)} />
      ) : filteredTalents.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={filter === 'all' ? t('dashboard.noSavedTalents') : 'No saved talent in this category'}
          description={filter === 'all' ? t('dashboard.startSavingTalents') : 'Try another category or return to your full collection.'}
          action={filter === 'all'
            ? <DashboardButton href={buildLocalizedPath(locale, '/hub')}>{t('dashboard.browseTalents')}</DashboardButton>
            : <DashboardButton onClick={() => setFilter('all')}>View all saved talent</DashboardButton>}
        />
      ) : (
        <section aria-label="Saved talent collection" className="grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-12">
          {filteredTalents.map((talent, index) => {
            const mediaItems = talent.mediaItems || [];
            const adaptedTalent = {
              id: talent.id,
              user: { name: talent.name },
              avatarUrl: getTalentAvatar(talent),
              category: { name: talent.category || '' },
              skills: [] as string[],
            };

            return (
              <article
                key={talent.id}
                className={`${collectionLayout[index % collectionLayout.length]} min-w-0 [&_.hub-card]:max-w-none`}
              >
                <div className="mb-3 flex items-end justify-between gap-4 border-b border-slate-200/80 pb-3 dark:border-white/10">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
                      Collection {String(index + 1).padStart(2, '0')}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {talent.location || 'Location not set'}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-slate-500 dark:text-slate-400" dateTime={talent.savedAt}>
                    {formatSavedDate(talent.savedAt, locale)}
                  </time>
                </div>
                <FeaturedTalentCard
                  talent={adaptedTalent}
                  mediaItems={mediaItems}
                  priority={index === 0}
                  onMediaClick={() => router.push(buildLocalizedPath(locale, `/talent/${talent.id}`))}
                  onProfileClick={(profile) => router.push(buildLocalizedPath(locale, `/talent/${profile.id}`))}
                />
              </article>
            );
          })}
        </section>
      )}
    </DashboardPage>
  );
}
