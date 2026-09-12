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
import {
  DashboardHeader,
  DashboardLoadError,
  DashboardLoading,
  DashboardPage,
  DashboardPanel,
  EmptyState,
  MetricTile,
  SegmentedControl,
} from '@/components/dashboard/DashboardPrimitives';

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
  const [loadError, setLoadError] = useState(false);
  const t = useTranslations('dashboard.analytics');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const response = await fetch(`/api/analytics/dashboard?days=${timeRange}`);
      const data = await response.json();

      if (!response.ok || !data.success) throw new Error('Analytics unavailable');
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, fetchAnalytics]);

  if (loading) return <DashboardLoading />;
  if (loadError) return <DashboardPage><DashboardHeader title={t('dashboard')} /><DashboardLoadError onRetry={fetchAnalytics} /></DashboardPage>;

  if (!analytics) {
    return (
      <DashboardPage>
        <DashboardHeader title={t('dashboard')} />
        <EmptyState icon={TrendingUp} title={t('title')} description={t('noData')} />
      </DashboardPage>
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
    <DashboardPage>
      <DashboardHeader
        icon={TrendingUp}
        title={t('dashboard')}
        description="Understand how people discover, open, and engage with your profile and portfolio."
        actions={
          <SegmentedControl
            value={String(timeRange)}
            onChange={(value) => setTimeRange(Number(value))}
            options={[
              { value: '7', label: t('days7') },
              { value: '30', label: t('days30') },
              { value: '90', label: t('days90') },
            ]}
          />
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricTile label={t('totalViews')} value={overview.totalViews.toLocaleString()} detail={t('uniqueViewers', { count: overview.uniqueViewers })} icon={Eye} />

        <MetricTile label={t('portfolioViews')} value={overview.totalPortfolioViews.toLocaleString()} detail={t('engagementRate', { rate: overview.engagementRate })} icon={ImageIcon} />

        <MetricTile label={t('searchPerformance')} value={overview.searchImpressions.toLocaleString()} detail={t('ctr', { rate: overview.searchCTR.toFixed(1), clicks: overview.searchClicks })} icon={Search} />

        {/* Rating removed — platform no longer tracks average rating */}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Profile Views Trend */}
        <DashboardPanel>
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
        </DashboardPanel>

        {/* Portfolio Engagement */}
        <DashboardPanel>
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
        </DashboardPanel>

        {/* Search Performance */}
        <DashboardPanel>
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
        </DashboardPanel>

        {/* Top Portfolio Items */}
        <DashboardPanel>
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
        </DashboardPanel>
      </div>

      {/* Recent Views */}
      <DashboardPanel>
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
      </DashboardPanel>
    </DashboardPage>
  );
}

