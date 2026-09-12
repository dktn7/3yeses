'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LoadingSpinner from '@/components/LoadingSpinner';
import { DashboardLoading } from '@/components/dashboard/DashboardPrimitives';
import FeaturedTalentCard from '@/components/FeaturedTalentCard';
import { Heart, ArrowLeft, Filter } from 'lucide-react';
import Link from 'next/link';
import { normalizeLocale } from '@/lib/locale-path';
import { buildLocalizedPath } from '@/lib/locale-path';
import {
  DashboardButton,
  DashboardLoadError,
  DashboardHeader,
  DashboardPage,
  EmptyState,
  SegmentedControl,
} from '@/components/dashboard/DashboardPrimitives';

interface SavedTalent {
  id: string;
  name: string;
  category?: string;
  categoryId?: string | null;
  location: string;
  imageUrl?: string;
  savedAt: Date;
  mediaItems?: Array<{ id: string; title?: string; url: string; type: string; thumbnail?: string }>;
}

export default function SavedTalentsPage() {
  const [loading, setLoading] = useState(true);
  const [savedTalents, setSavedTalents] = useState<SavedTalent[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const router = useRouter();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = normalizeLocale(typeof pathname === 'string' ? pathname.split('/')[1] || 'en-gb' : 'en-gb');
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    // load categories for filter dropdown
    const loadCategories = async () => {
      setLoadError(false);
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const json = await res.json().catch(() => ({}));
          const list = Array.isArray(json) ? json : (json.categories || json.data || []);
          setCategories(list.map((c: any) => ({ id: c.id, name: c.name })) || []);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();

    const loadSavedTalents = async () => {
      setLoadError(false);
      try {
        const response = await fetch('/api/auth/verify', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Fetch actual saved talents from API
            const savedRes = await fetch('/api/dashboard/saved-talents', { 
              credentials: 'include' 
            });
            if (!savedRes.ok) throw new Error('Saved talent unavailable');
            if (savedRes.ok) {
              const savedData = await savedRes.json();
              setSavedTalents(savedData.talents || []);
            }
          } else {
            router.replace(buildLocalizedPath(locale, '/auth/signin'));
          }
        } else {
          router.replace(buildLocalizedPath(locale, '/auth/signin'));
        }
      } catch (error) {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    loadSavedTalents();
  }, [router, loadAttempt, locale]);

  const filteredTalents = filter === 'all'
    ? savedTalents
    : savedTalents.filter(t => (t.categoryId || '') === filter);

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <DashboardPage>
      <Link
        href={buildLocalizedPath(locale, '/dashboard/overview')}
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-[color:var(--brand-primary)] dark:text-slate-300"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{t('dashboard.backToDashboard')}</span>
      </Link>

      <DashboardHeader
        icon={Heart}
        title={t('dashboard.savedTalents')}
        description={`${savedTalents.length} ${t('dashboard.talentsSaved')}. Keep a curated shortlist of people you want to revisit, compare, or contact later.`}
        actions={
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-full border border-slate-200 bg-light-surface/85 px-4 py-2 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-[color:var(--brand-ring)] dark:border-slate-700 dark:bg-dark-surface/85 dark:text-white"
            >
              <option value="all">{t('dashboard.allCategories')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        }
        meta={
          <SegmentedControl
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: t('dashboard.allCategories'), count: savedTalents.length },
              ...categories.slice(0, 5).map((c) => ({
                value: c.id,
                label: c.name,
                count: savedTalents.filter((talent) => (talent.categoryId || '') === c.id).length,
              })),
            ]}
          />
        }
      />

        {loadError && <DashboardLoadError onRetry={() => setLoadAttempt(value => value + 1)} />}
        {/* Talents Grid */}
        {filteredTalents.length === 0 ? (
          <EmptyState
            icon={Heart}
            title={filter === 'all' ? t('dashboard.noSavedTalents') : 'No saved talent in this category'}
            description={filter === 'all' ? t('dashboard.startSavingTalents') : 'Try another category or view your full collection.'}
            action={filter === 'all' ? <DashboardButton href={buildLocalizedPath(locale, '/hub')}>{t('dashboard.browseTalents')}</DashboardButton> : <DashboardButton onClick={() => setFilter('all')}>View all saved talent</DashboardButton>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTalents.map((talent) => {
              const adapted = {
                id: talent.id,
                user: { name: talent.name },
                avatarUrl: (talent as any).imageUrl || '',
                category: { name: talent.category || '' },
                skills: (talent as any).skills || [],
                featuredSkills: (talent as any).featuredSkills || undefined,
              } as any;

              return (
                <FeaturedTalentCard
                  key={talent.id}
                  talent={adapted}
                  mediaItems={(talent as any).mediaItems || []}
                  onMediaClick={(item: any) => {
                    const idTo = item?.talentProfile?.id || talent.id;
                    router.push(buildLocalizedPath(locale, `/talent/${idTo}`));
                  }}
                  onProfileClick={(p: any) => router.push(buildLocalizedPath(locale, `/talent/${p.userId ?? p.id}`))}
                />
              );
            })}
          </div>
        )}
    </DashboardPage>
  );
}



