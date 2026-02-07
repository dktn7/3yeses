'use client';

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  Users,
  Calendar,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  userGrowth: { month: string; users: number }[];
  profileGrowth: { month: string; profiles: number }[];
  reviewStats: { rating: number; count: number }[];
  topCategories: { name: string; count: number }[];
  topTalent: { name: string; views: number; likes: number }[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics & Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor platform performance and growth metrics
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Users', value: '2,543', change: '+12.3%', trend: 'up', icon: Users },
          { title: 'Total Profiles', value: '1,234', change: '+18.2%', trend: 'up', icon: Users },
          { title: 'Total Views', value: '45,678', change: '+24.5%', trend: 'up', icon: Activity },
          { title: 'Avg Rating', value: '4.6', change: '+0.2', trend: 'up', icon: TrendingUp },
        ].map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-white/10 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div className={`flex items-center text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trend === 'up' ? (
                    <ArrowUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDown className="h-4 w-4 mr-1" />
                  )}
                  {metric.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {metric.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{metric.title}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Growth Chart Placeholder */}
        <div className="bg-white dark:bg-white/10 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Growth</h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-lg">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Chart visualization would go here</p>
              <p className="text-sm mt-1">(Integrate with Chart.js or Recharts)</p>
            </div>
          </div>
        </div>

        {/* Views Chart Placeholder */}
        <div className="bg-white dark:bg-white/10 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Views Trends</h2>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-lg">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Views chart would go here</p>
              <p className="text-sm mt-1">(Integrate with Chart.js or Recharts)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-white dark:bg-white/10 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-white/20">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Top Categories
          </h2>
          <div className="space-y-3">
            {['Acting', 'Music', 'Dance', 'Voice Over', 'Modeling'].map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {category}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 dark:bg-white/10 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${100 - index * 15}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                    {Math.floor(Math.random() * 100)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Talent */}
        <div className="bg-white dark:bg-white/10 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-white/20">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Top Performing Talent
          </h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {index}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Talent Name {index}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.floor(Math.random() * 5000)} views
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {Math.floor(Math.random() * 500)} likes
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
