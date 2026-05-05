'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Line, Bar, Pie } from 'recharts';
import {
  LineChart,
  BarChart,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Eye,
  Users,
  MousePointer,
  Heart,
  Star,
  TrendingUp,
  Search,
  Image as ImageIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import LoadingSpinner from '@/components/LoadingSpinner';

interface DailyStats {
  date: Date;
  views: number;
  uniqueViews: number;
  portfolioViews: number;
  searchImpressions: number;
  searchClicks: number;
  comments: number;
}

interface PortfolioItem {
  id: string;
  title: string;
  type: string;
  _count: {
    views: number;
  };
}

interface RecentView {
  id: string;
  createdAt: string;
  ipAddress: string | null;
  viewer: {
    id: string;
    name: string | null;
    profilePicture: string | null;
  } | null;
}

interface AnalyticsData {
  overview: {
    totalViews: number;
    uniqueViewers: number;
    totalPortfolioViews: number;
    totalLikes: number;
    searchImpressions: number;
    searchClicks: number;
    searchCTR: number;
    engagementRate: string;
  };
  dailyStats: DailyStats[];
  topPortfolioItems: PortfolioItem[];
  recentViews: RecentView[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<number>(30);
  const t = useTranslations('dashboard.analytics');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/dashboard?days=${timeRange}`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-light-surface dark:bg-dark-surface">
        <LoadingSpinner />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('noData')}
          </p>
        </div>
      </div>
    );
  }

  const { overview, dailyStats, topPortfolioItems, recentViews } = analytics;

  // Format daily stats for charts
  const viewsChartData = dailyStats.map((stat) => ({
    date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    [t('chartTotalViews')]: stat.views,
    [t('chartUniqueViews')]: stat.uniqueViews,
  }));

  const portfolioViewsData = dailyStats.map((stat) => ({
    date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    [t('chartPortfolioViews')]: stat.portfolioViews,
  }));

  const searchData = dailyStats.map((stat) => ({
    date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    [t('chartImpressions')]: stat.searchImpressions,
    [t('chartClicks')]: stat.searchClicks,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange(7)}
            className={`px-4 py-2 rounded-lg ${
              timeRange === 7
                ? 'bg-primary-blue dark:bg-accent-red text-white'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            {t('days7')}
          </button>
          <button
            onClick={() => setTimeRange(30)}
            className={`px-4 py-2 rounded-lg ${
              timeRange === 30
                ? 'bg-primary-blue dark:bg-accent-red text-white'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            {t('days30')}
          </button>
          <button
            onClick={() => setTimeRange(90)}
            className={`px-4 py-2 rounded-lg ${
              timeRange === 90
                ? 'bg-primary-blue dark:bg-accent-red text-white'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            {t('days90')}
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('totalViews')}
            </h3>
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">{overview.totalViews.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">
            {t('uniqueViewers', { count: overview.uniqueViewers })}
          </p>
        </div>

        <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('portfolioViews')}
            </h3>
            <ImageIcon className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold">
            {overview.totalPortfolioViews.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {t('engagementRate', { rate: overview.engagementRate })}
          </p>
        </div>

        <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('searchPerformance')}
            </h3>
            <Search className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold">
            {overview.searchImpressions.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {t('ctr', { rate: overview.searchCTR.toFixed(1), clicks: overview.searchClicks })}
          </p>
        </div>

        {/* Rating removed — platform no longer tracks average rating */}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Profile Views Trend */}
        <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t('profileViewsTrend')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={viewsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={t('chartTotalViews')}
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey={t('chartUniqueViews')}
                stroke="#10b981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Portfolio Engagement */}
        <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            {t('portfolioEngagement')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={portfolioViewsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={t('chartPortfolioViews')} fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Search Performance */}
        <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            {t('searchPerformance')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={searchData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={t('chartImpressions')}
                stroke="#a855f7"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey={t('chartClicks')}
                stroke="#f59e0b"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Portfolio Items */}
        <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">{t('topPortfolioItems')}</h3>
          <div className="space-y-3">
            {topPortfolioItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-gray-400">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold">
                    {item._count.views.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
            {topPortfolioItems.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                {t('noPortfolioItems')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Views */}
      <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          {t('recentProfileViews')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-3 px-4">{t('viewer')}</th>
                <th className="text-left py-3 px-4">{t('time')}</th>
              </tr>
            </thead>
            <tbody>
              {recentViews.map((view) => (
                <tr
                  key={view.id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-3 px-4">
                    {view.viewer ? (
                      <div className="flex items-center gap-2">
                        {view.viewer.profilePicture ? (
                          <Image
                            src={view.viewer.profilePicture}
                            alt={view.viewer.name || 'User'}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600" />
                        )}
                        <span>{view.viewer.name || t('anonymous')}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">{t('anonymous')}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {new Date(view.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {recentViews.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center py-4 text-gray-500">
                    {t('noViews')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
