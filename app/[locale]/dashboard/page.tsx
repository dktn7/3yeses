'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from '@/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { 
  User, 
  Settings, 
  FileText, 
  BarChart3, 
  Upload,
  Eye,
  TrendingUp,
  Calendar,
  Award,
  Heart,
  ArrowUpRight,
  Activity,
  Clock,
  Sparkles,
  CheckCircle,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import SwoopingTick from '@/components/SwoopingTick';
import { useTranslations } from 'next-intl';
import CategoryIconBackground from '@/components/CategoryIconBackground';

interface DashboardStats {
  profileViews: number;
  profileViewsChange: number;
  comments: number;
  commentsChange: number;
  likes: number;
  likesChange: number;
  mediaItems: number;
  mediaItemsChange: number;
}

interface Activity {
  type: 'view' | 'comment' | 'like';
  text: string;
  time: string;
}

export default function TalentOverviewPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'en-gb';
  const { user, loading } = useAuth();
  const t = useTranslations('Dashboard');
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState<number | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true);
      
      // Fetch stats, activities, and profile completion in parallel
      const [statsRes, activityRes, completionRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/activity'),
        fetch('/api/user/profile-completion')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setActivities(activityData.activities || []);
      }

      if (completionRes.ok) {
        const completionData = await completionRes.json();
        setProfileCompletion(completionData.percentage);
        setMissingFields(completionData.missingFields || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = `/${locale}/auth/login`;
    }
  }, [loading, user, locale]);

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin">
          <SwoopingTick size={80} />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const quickActions = [
    {
      icon: Eye,
      title: 'View My Profile',
      description: 'See how others see you',
      href: `/${locale}`,
      gradient: 'from-primary-blue via-blue-600 to-blue-700',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-primary-blue dark:text-blue-400',
      hoverShadow: 'hover:shadow-blue-500/20',
    },
    {
      icon: User,
      title: 'Edit Your Profile',
      description: 'Update your story, skills & credits',
      href: `/${locale}/dashboard/profile`,
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      hoverShadow: 'hover:shadow-blue-500/20',
    },
    {
      icon: Sparkles,
      title: 'Manage Gallery',
      description: 'Add, arrange & feature your work',
      href: `/${locale}/dashboard/gallery`,
      gradient: 'from-purple-500 via-purple-600 to-purple-700',
      iconBg: 'bg-purple-500/10 dark:bg-purple-500/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      hoverShadow: 'hover:shadow-purple-500/20',
    },
    {
      icon: BarChart3,
      title: 'View Insights',
      description: 'See who\'s discovering you',
      href: `/${locale}/dashboard/analytics`,
      gradient: 'from-green-500 via-green-600 to-green-700',
      iconBg: 'bg-green-500/10 dark:bg-green-500/20',
      iconColor: 'text-green-600 dark:text-green-400',
      hoverShadow: 'hover:shadow-green-500/20',
    },
    {
      icon: Settings,
      title: 'Preferences',
      description: 'Visibility, notifications & account',
      href: `/${locale}/dashboard/settings`,
      gradient: 'from-gray-500 via-gray-600 to-gray-700',
      iconBg: 'bg-gray-500/10 dark:bg-gray-500/20',
      iconColor: 'text-gray-600 dark:text-gray-400',
      hoverShadow: 'hover:shadow-gray-500/20',
    },
  ];

  const statsConfig = [
    { 
      icon: Eye, 
      label: 'Impressions', 
      value: loadingData ? '...' : stats?.profileViews.toLocaleString() || '0',
      change: stats?.profileViewsChange ? `${stats.profileViewsChange > 0 ? '+' : ''}${stats.profileViewsChange}%` : '0%',
      trend: (stats?.profileViewsChange || 0) >= 0 ? 'up' : 'down',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10 dark:bg-blue-500/20',
      lightBg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    { 
      icon: Heart, 
      label: 'Saves', 
      value: loadingData ? '...' : stats?.likes.toLocaleString() || '0',
      change: stats?.likesChange ? `${stats.likesChange > 0 ? '+' : ''}${stats.likesChange}%` : '0%',
      trend: (stats?.likesChange || 0) >= 0 ? 'up' : 'down',
      color: 'text-pink-600 dark:text-pink-400',
      bg: 'bg-pink-500/10 dark:bg-pink-500/20',
      lightBg: 'bg-pink-50 dark:bg-pink-900/20'
    },
    { 
      icon: Eye, 
      label: 'Media Plays', 
      value: loadingData ? '...' : stats?.comments.toLocaleString() || '0',
      change: stats?.commentsChange ? `${stats.commentsChange > 0 ? '+' : ''}${stats.commentsChange}` : '0',
      trend: (stats?.commentsChange || 0) >= 0 ? 'up' : 'down',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-500/10 dark:bg-green-500/20',
      lightBg: 'bg-green-50 dark:bg-green-900/20'
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view': return Eye;
      case 'comment': return MessageSquare;
      case 'like': return Heart;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'view': return 'text-blue-600 dark:text-blue-400';
      case 'comment': return 'text-green-600 dark:text-green-400';
      case 'like': return 'text-pink-600 dark:text-pink-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const recentActivitiesDisplay = loadingData
    ? [{ icon: Activity, text: 'Loading activities...', time: '', color: 'text-gray-400' }]
    : activities.length > 0
    ? activities.map(activity => ({
        icon: getActivityIcon(activity.type),
        text: activity.text,
        time: activity.time,
        color: getActivityColor(activity.type)
      }))
    : [{ icon: Activity, text: 'No recent activity', time: '', color: 'text-gray-400' }];

  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <CategoryIconBackground />
      <div className="relative z-20 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-primary-blue dark:bg-accent-red rounded-3xl shadow-2xl p-8 mb-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-white text-sm font-medium">Live</span>
                  </div>
                  <span className="text-white/90 text-sm">Visible to industry professionals</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {user?.name || 'Welcome'}
                </h1>
                <p className="text-white/90 text-lg">
                  Welcome back to your command center
                </p>
              </div>
              <div>
                <Link
                  href={`/talent/${user?.id}`}
                  className="inline-flex items-center gap-2 bg-white/95 hover:bg-white text-primary-blue dark:text-accent-red px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <Eye className="w-5 h-5" />
                  <span>Preview Profile</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion Banner */}
        {profileCompletion !== null && profileCompletion < 100 && (
          <div className="mb-10 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-amber-900/20 rounded-2xl shadow-lg p-6 border border-amber-200 dark:border-amber-800/50">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Circular Progress */}
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-amber-200 dark:text-amber-800"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - profileCompletion / 100)}`}
                    className="text-amber-600 dark:text-amber-400 transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                    {profileCompletion}%
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100">
                    Complete Your Profile
                  </h3>
                </div>
                <p className="text-amber-800 dark:text-amber-200 mb-3">
                  {t('profileCompletion.message')}
                </p>
                {missingFields.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {missingFields.slice(0, 4).map((field, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-amber-950/50 rounded-full text-sm font-medium text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                      >
                        <CheckCircle className="w-3 h-3" />
                        {field}
                      </span>
                    ))}
                    {missingFields.length > 4 && (
                      <span className="inline-flex items-center px-3 py-1 bg-white dark:bg-amber-950/50 rounded-full text-sm font-medium text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        +{missingFields.length - 4} more
                      </span>
                    )}
                  </div>
                )}
                <Link
                  href={`/${locale}/dashboard/profile`}
                  className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Complete Now</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Your Reach Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Eye className="w-5 h-5 text-primary-blue dark:text-accent-red" />
                </div>
                Your Reach
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1 ml-14">Performance this month</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsConfig.map((stat, index) => (
            <div
              key={stat.label}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 ${stat.lightBg} rounded-t-2xl`}></div>
              
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bg} rounded-xl p-3 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  <TrendingUp className={`w-4 h-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                  {stat.change}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 to-white/5 dark:from-white/0 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Control Room */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  Control Room
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1 ml-14">Quick actions</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {quickActions.map((action, index) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className={`group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10">
                    <div className={`${action.iconBg} rounded-xl p-3 mb-4 inline-flex group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-between">
                      {action.title}
                      <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-primary-blue dark:group-hover:text-accent-red group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {action.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Industry Eyes */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  Industry Eyes
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1 ml-14">Recent activity</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/50 overflow-hidden">
              <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {recentActivitiesDisplay.map((activity, index) => {
                  const bgClass = activity.color.includes('blue') ? 'bg-blue-500/10 dark:bg-blue-500/20' 
                    : activity.color.includes('green') ? 'bg-green-500/10 dark:bg-green-500/20'
                    : activity.color.includes('pink') ? 'bg-pink-500/10 dark:bg-pink-500/20'
                    : 'bg-gray-500/10 dark:bg-gray-500/20';
                  
                  return (
                    <div 
                      key={index}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`${bgClass} rounded-lg p-2 group-hover:scale-110 transition-transform`}>
                          <activity.icon className={`w-4 h-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {activity.text}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link 
                href="/dashboard/activity"
                className="block p-4 text-center text-sm font-medium text-primary-blue dark:text-accent-red hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                View all activity →
              </Link>
            </div>
          </div>
        </div>

        {/* Career Pulse */}
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 p-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 dark:from-accent-red dark:to-pink-600 rounded-xl p-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Career Pulse</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your momentum this month</p>
              </div>
            </div>
            <Link
              href={`/${locale}/dashboard/insights`}
              className="px-6 py-3 bg-gradient-to-r from-primary-blue to-purple-600 dark:from-accent-red dark:to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 font-medium"
            >
              View Details
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-500/10 dark:bg-blue-500/20 rounded-lg p-2">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Discovery Rate</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {loadingData ? (
                  <LoadingSpinner size="small" className="p-0 inline-flex" />
                ) : stats?.profileViewsChange ? (
                  <>
                    Your profile appeared in <span className="font-bold text-blue-600 dark:text-blue-400">+{Math.abs(stats.profileViewsChange)}%</span> more searches
                  </>
                ) : (
                  'Start building your discovery by completing your profile'
                )}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-pink-500/10 dark:bg-pink-500/20 rounded-lg p-2">
                  <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Save Rate</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {loadingData ? (
                  <LoadingSpinner size="small" className="p-0 inline-flex" />
                ) : stats?.likes ? (
                  <>
                    <span className="font-bold text-pink-600 dark:text-pink-400">{stats.likes}</span> viewers have saved your profile
                  </>
                ) : (
                  'Add media and complete your profile to increase saves'
                )}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-500/10 dark:bg-purple-500/20 rounded-lg p-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Gallery Status</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {loadingData ? (
                  <LoadingSpinner size="small" className="p-0 inline-flex" />
                ) : stats?.mediaItems ? (
                  <>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{stats.mediaItems} items</span> in your gallery — ✓ Active
                  </>
                ) : (
                  'Add media to your gallery to showcase your talent'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-15deg); }
        }
        .animate-wave {
          animation: wave 2s ease-in-out infinite;
          transform-origin: 70% 70%;
        }
      `}</style>
    </div>
  );
}
