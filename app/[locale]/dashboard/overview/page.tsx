'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LoadingSpinner from '@/components/LoadingSpinner';
import TalentCard from '@/components/TalentCard';
import FeaturedTalentCard from '@/components/FeaturedTalentCard';
import MiniSparkline from '@/components/dashboard/MiniSparkline';
import { ToastContainer, useToast } from '@/components/dashboard/ToastNotification';
import DashboardHero from '@/components/DashboardHero';
import SwoopingTick from '@/components/SwoopingTick';
import GalleryViewer from '@/components/GalleryViewer';
import MediaOverlay from '@/components/MediaOverlay';
import { Eye, TrendingUp, TrendingDown, Users, User as UserIcon, Image, BarChart3, CreditCard, Calendar, Settings, Star, Briefcase, Bell, MessageSquare, Clock, Trophy, Target } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
}

interface DashboardStats {
  totalViews: number;
  totalLikes: number;
  savedTalents: number;
  viewTrend: number;
  likeTrend: number;
  savedTrend: number;
}

interface RecentActivity {
  id: string;
  type: 'view' | 'like' | 'comment';
  content: string;
  thumbnail?: string;
  timestamp: string;
  talent?: {
    name: string;
    avatar?: string;
  };
}

interface Notification {
  id: string;
  message: string;
  time: string;
  read: boolean;
}

export default function DashboardOverview() {
  const router = useRouter();
  const pathname = usePathname();
  const routeLocale = useLocale();
  const locale = routeLocale || (typeof pathname === 'string' ? pathname.split('/')[1] || 'en' : 'en');
  const t = useTranslations('dashboard');
  const today = new Date();
  const formattedDay = today.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short' });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalViews: 0,
    totalLikes: 0,
    savedTalents: 0,
    viewTrend: 0,
    likeTrend: 0,
    savedTrend: 0
  });
  const [savedTalents, setSavedTalents] = useState<any[]>([]);
  const [viewedTalents, setViewedTalents] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [newCommentsCount, setNewCommentsCount] = useState(0);
  const [talentProfile, setTalentProfile] = useState<any>(null);
  const displayFirstName = talentProfile
    ? (talentProfile.firstName || (typeof talentProfile.name === 'string' ? talentProfile.name.split(' ')[0] : '') || user?.firstName || user?.email)
    : (user?.firstName || user?.email);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [portfolioPerformance, setPortfolioPerformance] = useState<any>(null);
  const [viewsHistory, setViewsHistory] = useState<number[]>([]);
  const [likesHistory, setLikesHistory] = useState<number[]>([]);
  const { toasts, removeToast } = useToast();
  const hideContent = false;
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [talentOverlay, setTalentOverlay] = useState<any>(null);
  const [showTalentOverlay, setShowTalentOverlay] = useState(false);

  // Helper to generate simple mock trend data for sparklines
  const generateTrendData = (baseValue: number, trend: number) => {
    const data: number[] = [];
    let current = baseValue * 0.85;
    for (let i = 0; i < 7; i++) {
      const variation = (Math.random() - 0.4) * (baseValue * 0.05);
      current += variation + (trend / 100) * (baseValue / 7);
      data.push(Math.max(0, Math.round(current)));
    }
    return data;
  };

  // Fetch real activity data
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch('/api/dashboard/activity', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const activities = (data.activities || []).map((a: any) => ({
            id: a.id,
            type: a.type || 'view',
            content: a.text || a.content || '',
            timestamp: a.time || a.createdAt,
            talent: { name: a.actorName || a.talent?.user?.name || 'User' }
          }));
          setRecentActivities(activities);
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      }
    };
    fetchActivities();
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUser(data.user);
            // Load dashboard data (stats, saved talents, viewed talents)
            await loadDashboardData(data.user);
          } else {
            router.push('/auth/signin');
          }
        } else {
          router.push('/auth/signin');
        }
      } catch (error) {
        console.error('Failed to load dashboard:', error);
        router.push('/auth/signin');
      } finally {
        setLoading(false);
      }
    };

    const loadDashboardData = async (user: any) => {
      try {
        // Fetch profile completion
        const profileRes = await fetch('/api/user/profile-completion', {
          credentials: 'include',
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfileCompletion(profileData.percentage ?? profileData.completionPercentage ?? 0);

          // Fetch the user's talent profile (endpoint supports userId fallback)
          try {
            const talentResp = await fetch(`/api/talent/${user.id}`, { credentials: 'include' });
            if (talentResp.ok) {
              const talentData = await talentResp.json();
              // API returns { talent, suggestions }
              setTalentProfile(talentData.talent || talentData);
            } else {
              setTalentProfile(null);
            }
          } catch (err) {
            console.error('Failed to fetch user talent profile:', err);
            setTalentProfile(null);
          }
        }

        // Fetch notifications
        const notifRes = await fetch('/api/notifications', {
          credentials: 'include',
        });
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotifications(notifData.notifications || []);
          setNewCommentsCount(notifData.unreadCount || 0);
        }

        // Fetch actual dashboard stats
        try {
          const statsRes = await fetch('/api/dashboard/stats', { credentials: 'include' });
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            setStats(prev => ({
              ...prev,
              totalViews: statsData.profileViews || 0,
              totalLikes: statsData.likes || 0,
              viewTrend: statsData.profileViewsChange || 0,
              likeTrend: statsData.likesChange || 0,
            }));

            // Use statsData to seed sparklines immediately
            setViewsHistory(generateTrendData(statsData.profileViews || 0, statsData.profileViewsChange || 0));
            setLikesHistory(generateTrendData(statsData.likes || 0, statsData.likesChange || 0));
          }
        } catch (err) {
          console.error('Failed to fetch dashboard stats:', err);
        }

        // Fetch saved and viewed talents from API
        const savedRes = await fetch('/api/dashboard/saved-talents', {
          credentials: 'include',
        });
        if (savedRes.ok) {
          const savedData = await savedRes.json();
          setSavedTalents(savedData.talents || []);
          // reflect saved talents count in stats
          setStats(prev => ({ ...prev, savedTalents: (savedData.talents || []).length }));
        }

        const viewedRes = await fetch('/api/dashboard/view-history', {
          credentials: 'include',
        });
        if (viewedRes.ok) {
          const viewedData = await viewedRes.json();
          setViewedTalents(viewedData.talents || []);
        }

        // Fetch portfolio items
        const portfolioRes = await fetch('/api/dashboard/portfolio-items', {
          credentials: 'include',
        });
        if (portfolioRes.ok) {
          const portfolioData = await portfolioRes.json();
          setPortfolioItems(portfolioData.items || []);
        }

        // Achievements removed per configuration; skipping fetch

        // Fetch portfolio (media) performance
        const performanceRes = await fetch('/api/dashboard/portfolio-performance', {
          credentials: 'include',
        });
        if (performanceRes.ok) {
          const performanceData = await performanceRes.json();
          setPortfolioPerformance(performanceData);
        }

        // Fetch analytics daily stats for real sparklines (last 7 days)
        try {
          const analyticsRes = await fetch('/api/analytics/dashboard?days=7', { credentials: 'include' });
          if (analyticsRes.ok) {
            const analyticsData = await analyticsRes.json();
            const daily = analyticsData.analytics?.dailyStats || [];
            // Map to arrays for sparklines
            const viewsSeries = daily.map((d: any) => d.views || 0);
            const mediaSeries = daily.map((d: any) => d.portfolioViews || 0);
            setViewsHistory(viewsSeries);
            setLikesHistory(mediaSeries);
          }
        } catch (err) {
          console.error('Failed to fetch analytics for sparklines:', err);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadDashboard();
  }, [router]);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Hero Bar */}
        <div
          className="relative rounded-2xl shadow-2xl p-10 md:p-12 mb-8 overflow-hidden"
          style={{ background: 'linear-gradient(90deg, var(--brand-from), var(--brand-to))' }}
        >
          <div className="absolute right-8 top-8 w-44 h-44 rounded-full bg-gradient-to-tr from-white/6 to-transparent blur-3xl pointer-events-none" />
          {user && (
            <DashboardHero
              displayName={displayFirstName}
              formattedDay={formattedDay}
              profileCompletion={profileCompletion}
              talentProfile={talentProfile}
              stats={stats}
              savedCount={savedTalents.length}
              locale={locale}
              userId={user.id}
            />
          )}
        </div>

        {!hideContent && (
        <>
        {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Profile Views */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-brand-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  {t('overview.profileViews')}
                </p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.totalViews.toLocaleString()}
                </h3>
                <div className="flex items-center mt-2">
                  {stats.viewTrend >= 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        +{stats.viewTrend}%
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        {stats.viewTrend}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            {viewsHistory.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('overview.lastSevenDays')}</span>
                  <MiniSparkline 
                    data={viewsHistory} 
                    color={stats.viewTrend >= 0 ? '#10b981' : '#ef4444'}
                    height={32}
                    width={100}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Profile Likes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-brand-600">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  {t('overview.profileLikes')}
                </p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.totalLikes.toLocaleString()}
                </h3>
                <div className="flex items-center mt-2">
                  {stats.likeTrend >= 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        +{stats.likeTrend}%
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        {stats.likeTrend}%
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <SwoopingTick size={24} />
              </div>
            </div>
            {likesHistory.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('overview.lastSevenDays')}</span>
                  <MiniSparkline 
                    data={likesHistory} 
                    color={stats.likeTrend >= 0 ? '#10b981' : '#ef4444'}
                    height={32}
                    width={100}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Saved Talents */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  {t('overview.savedTalents')}
                </p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {savedTalents.length.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {t('overview.talentsYouSaved')}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <SwoopingTick size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Achievements removed */}

        {/* Media Performance Analytics */}
        {talentProfile && portfolioPerformance && portfolioPerformance.topPerformers?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <Target className="h-6 w-6 mr-2 text-orange-500" />
                {t('overview.topPerformingMedia')}
              </h2>
              <Link href={`/${locale}/dashboard/insights`} className="text-sm text-blue-600 dark:text-red-400 hover:underline font-medium">
                {t('overview.viewFullAnalytics')}
              </Link>
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">{t('overview.totalViews')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {portfolioPerformance.analytics.totalViews.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">{t('overview.totalLikes')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {portfolioPerformance.analytics.totalLikes.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">{t('overview.avgEngagement')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {portfolioPerformance.analytics.avgEngagementRate}%
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">{t('overview.thisWeek')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {portfolioPerformance.analytics.recentViews.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Top Performers List */}
            <div className="space-y-3">
              {portfolioPerformance.topPerformers.map((item: any, index: number) => (
                <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600">
                    {item.type === 'IMAGE' ? (
                      <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : item.type === 'VIDEO' && item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.type}</p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 dark:text-white">{item.views}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('overview.views')}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 dark:text-white">{item.likeCount}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('overview.likes')}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-green-600 dark:text-green-400">{item.engagementRate}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t('overview.engagement')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media Section */}
        {talentProfile && portfolioItems.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <BarChart3 className="h-6 w-6 mr-2 text-blue-600 dark:text-red-400" />
                {t('overview.media')}
              </h2>
              <Link href={`/${locale}/dashboard/gallery`} className="text-sm text-blue-600 dark:text-red-400 hover:underline font-medium">
                {t('viewAll')} →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {portfolioItems.slice(0, 10).map((item, index) => (
                <div 
                  key={item.id} 
                  className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 hover:ring-2 hover:ring-blue-500 dark:hover:ring-red-500 transition-all cursor-pointer"
                  onClick={() => {
                    setGalleryIndex(index);
                    setGalleryOpen(true);
                  }}
                >
                  {item.type === 'IMAGE' && (
                    <img 
                      src={item.mediaUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  )}
                  {item.type === 'VIDEO' && (
                    <div className="relative w-full h-full">
                      {item.thumbnailUrl ? (
                        <img 
                          src={item.thumbnailUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700" />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <div className="w-0 h-0 border-t-6 border-t-transparent border-l-10 border-l-gray-800 border-b-6 border-b-transparent ml-1" />
                        </div>
                      </div>
                    </div>
                  )}
                  {item.type === 'AUDIO' && (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-700 dark:to-pink-700 flex items-center justify-center">
                      <MessageSquare className="h-12 w-12 text-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white text-xs font-medium truncate">{item.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {portfolioItems.length === 0 && (
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('noPortfolioItems')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {t('noPortfolioItemsDesc')}
                </p>
                <Link href={`/${locale}/dashboard/gallery`} className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-red-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-red-700 transition-colors">
                  {t('uploadNow')}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Recent Activity & Comments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative overflow-hidden">
            {/* Background Icon */}
            <div className="absolute top-0 right-0 opacity-5 dark:opacity-10">
              <Clock className="h-48 w-48 text-blue-600 dark:text-blue-400 transform rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  {t('recentActivity')}
                </h2>
                <Link href={`/${locale}/dashboard/activity`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  {t('viewAll')}
                </Link>
              </div>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, idx) => (
                    <div key={`${activity.id}-${idx}`} className="flex items-start space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'comment' ? 'bg-green-100 dark:bg-green-900/30' :
                        activity.type === 'like' ? 'bg-red-100 dark:bg-red-900/30' :
                        'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        {activity.type === 'comment' && <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />}
                        {activity.type === 'like' && <SwoopingTick size={16} />}
                        {activity.type === 'view' && <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">{activity.talent?.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{activity.content}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {t('noRecentActivity')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative overflow-hidden">
            {/* Background Icon */}
            <div className="absolute top-0 right-0 opacity-5 dark:opacity-10">
              <Bell className="h-48 w-48 text-purple-600 dark:text-purple-400 transform -rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                  {t('recentNotifications')}
                </h2>
                <Link href={`/${locale}/dashboard/notifications`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  {t('viewAll')}
                </Link>
              </div>
              <div className="space-y-3">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                      !notification.read 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                        : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {t('noNotifications')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Saved & Viewed Talents - Scrollable Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Saved Talents */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative overflow-hidden">
            {/* Background Icon */}
            <div className="absolute bottom-0 right-0 opacity-5 dark:opacity-10">
              <SwoopingTick size={256} />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <SwoopingTick size={20} />
                  <span className="ml-2">{t('savedTalents')}</span>
                </h2>
                <Link href={`/${locale}/dashboard/saved`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  {t('viewAll')}
                </Link>
              </div>
              {savedTalents.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="flex space-x-4 pb-4">
                    {savedTalents.slice(0, 6).map((talent) => {
                      const ftTalent = {
                        id: talent.id,
                        user: { name: talent.name },
                        avatarUrl: talent.imageUrl || talent.avatarUrl,
                        category: { name: talent.role || talent.category || 'Talent' },
                        skills: talent.skills || [],
                        featuredSkills: talent.featuredSkills || []
                      };
                      const mediaItems = (talent.mediaItems || talent.media || talent.portfolio || []).map((m: any) => ({
                        id: m.id || m.url || m.thumbnail || m.thumbnailUrl,
                        title: m.title || m.id || '',
                        url: m.url || m.videoUrl || m.thumbnail || m.thumbnailUrl || '',
                        type: (m.type || m.mediaType || m.kind || 'IMAGE').toString().toUpperCase(),
                        thumbnail: m.thumbnail || m.thumbnailUrl || undefined
                      }));

                      return (
                        <div 
                          key={talent.id}
                          className="flex-shrink-0 w-64"
                        >
                          <FeaturedTalentCard
                            talent={ftTalent}
                            mediaItems={mediaItems}
                            onMediaClick={(item) => {
                              setTalentOverlay(talent);
                              setShowTalentOverlay(true);
                            }}
                            onProfileClick={() => router.push(`/talent/${(talent as any).userId ?? talent.id}`)}
                            onSkillClick={(s) => router.push(`/${locale}/hub?q=${encodeURIComponent(s)}`)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <SwoopingTick size={48} />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 mt-4">
                    {t('noSavedTalents')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('noSavedTalentsDesc')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Viewed Talents */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative overflow-hidden">
            {/* Background Icon */}
            <div className="absolute bottom-0 right-0 opacity-5 dark:opacity-10">
              <Eye className="h-64 w-64 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  {t('viewedHistory')}
                </h2>
                <Link href={`/${locale}/dashboard/history`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  {t('viewAll')}
                </Link>
              </div>
              {viewedTalents.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="flex space-x-4 pb-4">
                    {viewedTalents.slice(0, 6).map((talent, idx) => {
                      const ftTalent = {
                        id: talent.id,
                        user: { name: talent.name },
                        avatarUrl: talent.imageUrl || talent.avatarUrl,
                        category: { name: talent.role || talent.category || 'Talent' },
                        skills: talent.skills || [],
                        featuredSkills: talent.featuredSkills || []
                      };
                      const mediaItems = (talent.mediaItems || talent.media || talent.portfolio || []).map((m: any) => ({
                        id: m.id || m.url || m.thumbnail || m.thumbnailUrl,
                        title: m.title || m.id || '',
                        url: m.url || m.videoUrl || m.thumbnail || m.thumbnailUrl || '',
                        type: (m.type || m.mediaType || m.kind || 'IMAGE').toString().toUpperCase(),
                        thumbnail: m.thumbnail || m.thumbnailUrl || undefined
                      }));

                      return (
                        <div
                          key={`${talent.id}-${idx}`}
                          className="flex-shrink-0 w-64"
                        >
                          <FeaturedTalentCard
                            talent={ftTalent}
                            mediaItems={mediaItems}
                            onMediaClick={(item) => {
                              setTalentOverlay(talent);
                              setShowTalentOverlay(true);
                            }}
                            onProfileClick={() => router.push(`/talent/${(talent as any).userId ?? talent.id}`)}
                            onSkillClick={(s) => router.push(`/${locale}/hub?q=${encodeURIComponent(s)}`)}
                            priority={idx < 2}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {t('noViewedTalents')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('noViewedTalentsDesc')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        </>
        )}
      </div>

      {/* Gallery Viewer */}
      {galleryOpen && portfolioItems.length > 0 && (
        <GalleryViewer
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          items={portfolioItems.map(item => ({
            id: item.id,
            mediaUrl: item.mediaUrl,
            title: item.title || 'Untitled',
            type: item.type?.toLowerCase() === 'video' ? 'video' : item.type?.toLowerCase() === 'audio' ? 'audio' : 'image',
            thumbnail: item.thumbnailUrl || item.mediaUrl,
            likeCount: item.likeCount || 0
          }))}
          initialIndex={galleryIndex}
        />
      )}

      {/* Talent Media Overlay */}
      {showTalentOverlay && talentOverlay && (() => {
        const hasMedia = talentOverlay.mediaItems && talentOverlay.mediaItems.length > 0;
        const firstMedia = hasMedia ? talentOverlay.mediaItems[0] : null;
        const overlayMedia = firstMedia ? {
          id: firstMedia.id || talentOverlay.id,
          title: firstMedia.title || talentOverlay.name || 'Untitled',
          mediaUrl: firstMedia.mediaUrl || '',
          type: (firstMedia.type || 'IMAGE')?.toUpperCase() as 'IMAGE' | 'VIDEO' | 'AUDIO',
          thumbnail: firstMedia.thumbnail || firstMedia.mediaUrl,
        } : {
          id: `profile-${talentOverlay.id}`,
          title: `${talentOverlay.name || 'Talent'}'s Profile`,
          mediaUrl: talentOverlay.imageUrl || talentOverlay.avatarUrl || '',
          type: 'IMAGE' as const,
          thumbnail: talentOverlay.imageUrl || talentOverlay.avatarUrl || '',
        };

        const allOverlayMedia = hasMedia
          ? talentOverlay.mediaItems.map((m: any) => ({
              id: m.id || m.mediaUrl,
              title: m.title || 'Untitled',
              mediaUrl: m.mediaUrl || '',
              type: (m.type || 'IMAGE')?.toUpperCase() as 'IMAGE' | 'VIDEO' | 'AUDIO',
              thumbnail: m.thumbnail || m.mediaUrl,
              description: '',
              talentProfile: {
                id: talentOverlay.id,
                user: { name: talentOverlay.name || 'Talent' },
                avatarUrl: talentOverlay.imageUrl || talentOverlay.avatarUrl,
                category: talentOverlay.category ? { name: talentOverlay.category } : undefined,
                location: talentOverlay.location
              },
              views: 0,
              likes: 0,
              createdAt: new Date().toISOString()
            }))
          : [{
              ...overlayMedia,
              description: '',
              talentProfile: {
                id: talentOverlay.id,
                user: { name: talentOverlay.name || 'Talent' },
                avatarUrl: talentOverlay.imageUrl || talentOverlay.avatarUrl,
                category: talentOverlay.category ? { name: talentOverlay.category } : undefined,
                location: talentOverlay.location
              },
              views: 0,
              likes: 0,
              createdAt: new Date().toISOString()
            }];

        return (
          <MediaOverlay
            media={{
              ...overlayMedia,
              description: '',
              talentProfile: {
                id: talentOverlay.id,
                user: { name: talentOverlay.name || 'Talent' },
                avatarUrl: talentOverlay.imageUrl || talentOverlay.avatarUrl,
                category: talentOverlay.category ? { name: talentOverlay.category } : undefined,
                location: talentOverlay.location
              },
              views: 0,
              likeCount: 0,
              createdAt: new Date().toISOString()
            }}
            allMedia={allOverlayMedia}
            talents={[]}
            onClose={() => {
              setShowTalentOverlay(false);
              setTalentOverlay(null);
            }}
            onMediaSelect={(item) => {
              setTalentOverlay((prev: any) => prev ? { ...prev, mediaItems: [...(prev.mediaItems || [])].sort((a: any, b: any) => a.id === item.id ? -1 : 1) } : null);
            }}
          />
        );
      })()}
    </div>
  );
}
