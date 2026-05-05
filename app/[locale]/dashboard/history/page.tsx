'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LoadingSpinner from '@/components/LoadingSpinner';
import TalentCard from '@/components/TalentCard';
import { Eye, ArrowLeft, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

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
  const router = useRouter();
  const t = useTranslations();
  const pathname = usePathname();
  const locale = typeof pathname === 'string' ? pathname.split('/')[1] || 'en' : 'en';

  useEffect(() => {
    const loadViewHistory = async () => {
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
            if (historyRes.ok) {
              const historyData = await historyRes.json();
              setViewedTalents(historyData.talents || []);
            }
          } else {
            router.push('/auth/signin');
          }
        } else {
          router.push('/auth/signin');
        }
      } catch (error) {
        console.error('Failed to load view history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadViewHistory();
  }, [router]);

  const filterByTime = (talent: ViewedTalent) => {
    if (timeFilter === 'all') return true;
    
    const now = new Date();
    const viewDate = new Date(talent.viewedAt);
    const diffDays = Math.floor((now.getTime() - viewDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (timeFilter === 'today') return diffDays === 0;
    if (timeFilter === 'week') return diffDays <= 7;
    if (timeFilter === 'month') return diffDays <= 30;
    
    return true;
  };

  const filteredTalents = viewedTalents.filter(filterByTime);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-light-surface dark:bg-dark-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${locale}/dashboard/overview`}
            className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{t('dashboard.backToDashboard')}</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-[var(--marketing-pill-bg)] border border-[var(--marketing-pill-border)]">
                <Eye className="h-8 w-8 text-[var(--marketing-pill-icon)]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('dashboard.viewHistory')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {viewedTalents.length} {t('dashboard.talentsViewed')}
                </p>
              </div>
            </div>

            {/* Time filter dropdown */}
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-light-surface dark:bg-dark-surface border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
              >
                <option value="all">{t('dashboard.allTime')}</option>
                <option value="today">{t('dashboard.today')}</option>
                <option value="week">{t('dashboard.thisWeek')}</option>
                <option value="month">{t('dashboard.thisMonth')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Talents List with Timeline */}
        {filteredTalents.length === 0 ? (
          <div className="bg-light-surface dark:bg-dark-surface rounded-xl shadow-sm p-12 text-center">
            <Eye className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('dashboard.noViewHistory')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('dashboard.startBrowsingTalents')}
            </p>
            <Link
              href={`/${locale}/talents`}
              className="inline-block bg-gradient-to-r from-primary-blue to-accent-blue dark:from-accent-red dark:to-primary-red hover:opacity-95 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {t('dashboard.browseTalents')}
            </Link>
          </div>
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
              <div key={date}>
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {date}
                  </h2>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {talents.map((talent) => (
                    <TalentCard key={talent.id} talent={talent as any} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
