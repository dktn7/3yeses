'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LoadingSpinner from '@/components/LoadingSpinner';
import { DashboardLoading } from '@/components/dashboard/DashboardPrimitives';
import FeaturedTalentCard from '@/components/FeaturedTalentCard';
import { Eye, ArrowLeft, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { normalizeLocale } from '@/lib/locale-path';
import { buildLocalizedPath } from '@/lib/locale-path';
import {
  DashboardButton,
  DashboardLoadError,
  DashboardHeader,
  DashboardPage,
  DashboardPanel,
  EmptyState,
  SegmentedControl,
} from '@/components/dashboard/DashboardPrimitives';

interface ViewedTalent {
  id: string;
  name: string;
  category: string;
  location: string;
  imageUrl?: string;
  viewedAt: Date;
}

export default function ViewHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [viewedTalents, setViewedTalents] = useState<ViewedTalent[]>([]);
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const router = useRouter();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = normalizeLocale(typeof pathname === 'string' ? pathname.split('/')[1] || 'en-gb' : 'en-gb');

  useEffect(() => {
    const loadViewHistory = async () => {
      setLoadError(false);
      try {
        const response = await fetch('/api/auth/verify', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Fetch actual view history from API
            const historyRes = await fetch('/api/dashboard/view-history', { 
              credentials: 'include' 
            });
            if (!historyRes.ok) throw new Error('History unavailable');
            if (historyRes.ok) {
              const historyData = await historyRes.json();
              setViewedTalents(historyData.talents || []);
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

    loadViewHistory();
  }, [router, loadAttempt, locale]);

  const filterByTime = (talent: ViewedTalent) => {
    if (timeFilter === 'all') return true;
    
    const now = new Date();
    const viewDate = new Date(talent.viewedAt);
    const diffDays = Math.floor((now.getTime() - viewDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (timeFilter === 'today') return viewDate.toDateString() === now.toDateString();
    if (timeFilter === 'week') return diffDays <= 7;
    if (timeFilter === 'month') return diffDays <= 30;
    
    return true;
  };

  const filteredTalents = viewedTalents.filter(filterByTime);

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
        icon={Eye}
        title={t('dashboard.viewHistory')}
        description={`${viewedTalents.length} ${t('dashboard.talentsViewed')}. Pick up where you left off.`}
        actions={
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
        }
      />

        {loadError && <DashboardLoadError onRetry={() => setLoadAttempt(value => value + 1)} />}
        {/* Talents List with Timeline */}
        {filteredTalents.length === 0 ? (
          <EmptyState
            icon={Eye}
            title={t('dashboard.noViewHistory')}
            description={t('dashboard.startBrowsingTalents')}
            action={<DashboardButton href={buildLocalizedPath(locale, '/hub')}>{t('dashboard.browseTalents')}</DashboardButton>}
          />
        ) : (
          <div className="space-y-8">
            {/* Group by date */}
            {Object.entries(
              filteredTalents.reduce((acc, talent) => {
                const date = new Date(talent.viewedAt).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                });
                if (!acc[date]) acc[date] = [];
                acc[date].push(talent);
                return acc;
              }, {} as Record<string, ViewedTalent[]>)
            ).map(([date, talents]) => (
              <DashboardPanel key={date}>
                <div className="mb-5 flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--brand-primary)]/10 text-[color:var(--brand-primary)]">
                    <Calendar className="h-5 w-5" />
                  </span>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                    {date}
                  </h2>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {talents.map((talent, index) => (
                    <FeaturedTalentCard
                      key={`${talent.id}-${talent.viewedAt}-${index}`}
                      talent={{ id: talent.id, user: { name: talent.name }, avatarUrl: talent.imageUrl || '', category: { name: talent.category || '' }, skills: [] } as any}
                      mediaItems={[]}
                      onMediaClick={() => router.push(buildLocalizedPath(locale, `/talent/${talent.id}`))}
                      onProfileClick={() => router.push(buildLocalizedPath(locale, `/talent/${talent.id}`))}
                    />
                  ))}
                </div>
              </DashboardPanel>
            ))}
          </div>
        )}
    </DashboardPage>
  );
}



