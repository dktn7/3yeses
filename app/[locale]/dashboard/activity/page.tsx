'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, MessageSquare, Heart, Activity as ActivityIcon, Calendar, User } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import SwoopingTick from '@/components/SwoopingTick';
import {
  DashboardHeader,
  DashboardLoadError,
  DashboardPage,
  DashboardPanel,
  EmptyState,
} from '@/components/dashboard/DashboardPrimitives';

interface Activity {
  type: 'view' | 'comment' | 'like';
  text: string;
  time: string;
}

export default function ActivityPage() {
  const router = useRouter();
  const t = useTranslations('dashboard.activity');
  const { user, loading } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    try {
      setLoadingData(true);
      setLoadError(false);
      const response = await fetch('/api/dashboard/activity');
      if (!response.ok) throw new Error('Activity unavailable');
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      setLoadError(true);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-surface dark:bg-dark-surface">
        <div className="animate-spin">
          <SwoopingTick size={80} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view': return Eye;
      case 'comment': return MessageSquare;
      case 'like': return Heart;
      default: return ActivityIcon;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'view': return 'text-blue-600 dark:text-red-300';
      case 'comment': return 'text-green-600 dark:text-green-400';
      case 'like': return 'text-primary-blue dark:text-accent-red';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case 'view': return 'bg-blue-500/10 dark:bg-red-500/20';
      case 'comment': return 'bg-green-500/10 dark:bg-green-500/20';
      case 'like': return 'bg-primary-blue/10 dark:bg-accent-red/20';
      default: return 'bg-gray-500/10 dark:bg-gray-500/20';
    }
  };

  return (
    <DashboardPage>
        {loadError && <DashboardLoadError onRetry={fetchActivities} />}
        <DashboardHeader
          icon={ActivityIcon}
          title={t('title')}
          description={t('subtitle')}
          meta={
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-light-surface/70 px-4 py-2 text-sm font-semibold text-slate-600 dark:border-slate-800/70 dark:bg-dark-surface/70 dark:text-slate-300">
              <Calendar className="h-4 w-4 text-[color:var(--brand-primary)]" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          }
        />

        {/* Activity List */}
        <DashboardPanel className="overflow-hidden">
          {loadingData ? (
            <div className="p-12 text-center">
            <LoadingSpinner />
              <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loading')}</p>
            </div>
          ) : activities.length === 0 ? (
            <EmptyState icon={ActivityIcon} title={t('noActivity')} description={t('noActivityDesc')} />
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {activities.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                const color = getActivityColor(activity.type);
                const bgClass = getActivityBg(activity.type);
                
                return (
                  <div 
                    key={index}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${bgClass} rounded-xl p-3 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-gray-900 dark:text-white">
                          {activity.text}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DashboardPanel>
    </DashboardPage>
  );
}

