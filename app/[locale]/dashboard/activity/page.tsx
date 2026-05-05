'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, MessageSquare, Heart, Activity as ActivityIcon, Calendar, User } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import SwoopingTick from '@/components/SwoopingTick';

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
      const response = await fetch('/api/dashboard/activity');
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
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
      case 'like': return 'text-pink-600 dark:text-pink-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case 'view': return 'bg-blue-500/10 dark:bg-red-500/20';
      case 'comment': return 'bg-green-500/10 dark:bg-green-500/20';
      case 'like': return 'bg-pink-500/10 dark:bg-pink-500/20';
      default: return 'bg-gray-500/10 dark:bg-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-primary-blue dark:bg-accent-red rounded-2xl shadow-2xl p-8 mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -ml-24 -mb-24"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <ActivityIcon className="w-8 h-8" />
                  {t('title')}
                </h1>
                <p className="text-blue-100 dark:text-pink-100 text-lg">
                  {t('subtitle')}
                </p>
              </div>
              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <Calendar className="w-5 h-5 text-white" />
                <span className="text-white font-medium">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loadingData ? (
            <div className="p-12 text-center">
            <LoadingSpinner />
              <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loading')}</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-12 text-center">
              <ActivityIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('noActivity')}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('noActivityDesc')}
              </p>
            </div>
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
        </div>
      </div>
    </div>
  );
}
