'use client';

import { useEffect, useState } from 'react';
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
    averageRating: number;
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

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
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
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            No analytics data available yet.
          </p>
        </div>
      </div>
    );
  }

  const { overview, dailyStats, topPortfolioItems, recentViews } = analytics;

  // Format daily stats for charts
  const viewsChartData = dailyStats.map((stat) => ({
    date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Total Views': stat.views,
    'Unique Views': stat.uniqueViews,
  }));

  const portfolioViewsData = dailyStats.map((stat) => ({
    date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Portfolio Views': stat.portfolioViews,
  }));

  const searchData = dailyStats.map((stat) => ({
    date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Impressions: stat.searchImpressions,
    Clicks: stat.searchClicks,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange(7)}
            className={`px-4 py-2 rounded-lg ${
              timeRange === 7
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange(30)}
            className={`px-4 py-2 rounded-lg ${
              timeRange === 30
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeRange(90)}
            className={`px-4 py-2 rounded-lg ${
              timeRange === 90
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Views
            </h3>
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">{overview.totalViews.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">
            {overview.uniqueViewers} unique viewers
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Portfolio Views
            </h3>
            <ImageIcon className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold">
            {overview.totalPortfolioViews.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {overview.engagementRate}% engagement rate
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Search Performance
            </h3>
            <Search className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold">
            {overview.searchImpressions.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {overview.searchCTR.toFixed(1)}% CTR ({overview.searchClicks} clicks)
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Rating
            </h3>
            <Star className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold">{overview.averageRating.toFixed(1)}</p>
          <p className="text-sm text-gray-500 mt-1">
            {overview.totalLikes} likes
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Profile Views Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Profile Views Trend
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
                dataKey="Total Views"
                stroke="#3b82f6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="Unique Views"
                stroke="#10b981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Portfolio Engagement */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Portfolio Engagement
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={portfolioViewsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Portfolio Views" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Search Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Performance
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
                dataKey="Impressions"
                stroke="#a855f7"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="Clicks"
                stroke="#f59e0b"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Portfolio Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Top Portfolio Items</h3>
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
                No portfolio items yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Views */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Recent Profile Views
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-3 px-4">Viewer</th>
                <th className="text-left py-3 px-4">Time</th>
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
                          <img
                            src={view.viewer.profilePicture}
                            alt={view.viewer.name || 'User'}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600" />
                        )}
                        <span>{view.viewer.name || 'Anonymous'}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Anonymous</span>
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
                    No views yet
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
