'use client';

import React from 'react';
import useSWR from 'swr';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  Star, 
  Clock, 
  Database, 
  Cpu, 
  HardDrive,
  Activity,
  TrendingUp,
  Shield,
  Server,
  LucideIcon
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface StatsData {
  performance: {
    uptime: {
      seconds: number;
      formatted: string;
    };
    memory: {
      used: number;
      total: number;
      external: number;
      rss: number;
    };
    database: {
      queryTime: number;
      status: string;
    };
    nodeVersion: string;
    platform: string;
    arch: string;
  };
  business: {
    users: {
      total: number;
      talent: number;
      clients: number;
      newThisWeek: number;
    };
    content: {
      categories: number;
      subcategories: number;
    };
    activity: {
      totalBookings: number;
      pendingBookings: number;
      totalReviews: number;
      averageRating: number;
    };
  };
  timestamp: string;
}

function StatCard({ title, value, icon: Icon, description, color = 'blue' }: Readonly<{
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}>) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
  };

  return (
    <div className="bg-white/90 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 rounded-xl shadow-sm hover:shadow-md dark:hover:bg-white/15 transition-all p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, error, isLoading } = useSWR<StatsData>('/api/admin/stats', fetcher, {
    refreshInterval: 10000, // Refresh every 10 seconds for real-time stats
    revalidateOnFocus: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="Failed to load dashboard statistics. Please try again later." />;
  }

  if (!stats) {
    return <div className="text-center text-gray-500 dark:text-gray-400">No data available.</div>;
  }

  const memoryUsagePercentage = Math.round((stats.performance.memory.used / stats.performance.memory.total) * 100);
  
  const getMemoryColor = (percentage: number) => {
    if (percentage > 80) return 'red';
    if (percentage > 60) return 'orange';
    return 'blue';
  };

  const getDatabaseColor = (status: string) => {
    if (status === 'excellent') return 'green';
    if (status === 'good') return 'blue';
    return 'red';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'green';
    if (rating >= 4.0) return 'blue';
    return 'orange';
  };
  
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Real-time overview of your platform&apos;s performance and activity
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Last updated: {new Date(stats.timestamp).toLocaleTimeString()}
        </p>
      </div>

      {/* Performance Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Server className="w-5 h-5 mr-2 text-blue-600 dark:text-red-400" />
          System Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Server Uptime"
            value={stats.performance.uptime.formatted}
            icon={Clock}
            description="Current session"
            color="green"
          />
          <StatCard
            title="Memory Usage"
            value={`${stats.performance.memory.used}MB`}
            icon={HardDrive}
            description={`${memoryUsagePercentage}% of ${stats.performance.memory.total}MB`}
            color={getMemoryColor(memoryUsagePercentage)}
          />
          <StatCard
            title="Database Query"
            value={`${stats.performance.database.queryTime}ms`}
            icon={Database}
            description={`Status: ${stats.performance.database.status}`}
            color={getDatabaseColor(stats.performance.database.status)}
          />
          <StatCard
            title="Node.js Version"
            value={stats.performance.nodeVersion}
            icon={Cpu}
            description={`${stats.performance.platform} ${stats.performance.arch}`}
            color="purple"
          />
        </div>
      </div>

      {/* Business Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          Platform Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats.business.users.total}
            icon={Users}
            description={`${stats.business.users.newThisWeek} new this week`}
            color="blue"
          />
          <StatCard
            title="Talent Profiles"
            value={stats.business.users.talent}
            icon={Star}
            description={`${stats.business.users.clients} clients`}
            color="purple"
          />
          <StatCard
            title="Categories"
            value={stats.business.content.categories}
            icon={Briefcase}
            description={`${stats.business.content.subcategories} subcategories`}
            color="orange"
          />
          <StatCard
            title="Total Bookings"
            value={stats.business.activity.totalBookings}
            icon={Calendar}
            description={`${stats.business.activity.pendingBookings} pending`}
            color="green"
          />
        </div>
      </div>

      {/* Activity Overview */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
          Activity Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Reviews"
            value={stats.business.activity.totalReviews}
            icon={Star}
            description="Platform feedback"
            color="blue"
          />
          <StatCard
            title="Average Rating"
            value={stats.business.activity.averageRating.toFixed(1)}
            icon={Star}
            description="Out of 5.0"
            color={getRatingColor(stats.business.activity.averageRating)}
          />
          <StatCard
            title="Pending Bookings"
            value={stats.business.activity.pendingBookings}
            icon={Clock}
            description="Require attention"
            color={stats.business.activity.pendingBookings > 0 ? 'orange' : 'green'}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/users"
            className="flex items-center justify-center p-4 bg-blue-100 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-all group"
          >
            <Users className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-blue-700 dark:text-blue-300 font-medium">Manage Users</span>
          </a>
          <a
            href="/admin/categories"
            className="flex items-center justify-center p-4 bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-500/30 transition-all group"
          >
            <Briefcase className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-purple-700 dark:text-purple-300 font-medium">Manage Categories</span>
          </a>
          <a
            href="/admin/bookings"
            className="flex items-center justify-center p-4 bg-green-100 dark:bg-green-500/20 border border-green-200 dark:border-green-500/30 rounded-lg hover:bg-green-200 dark:hover:bg-green-500/30 transition-all group"
          >
            <Calendar className="w-5 h-5 mr-2 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
            <span className="text-green-700 dark:text-green-300 font-medium">View Bookings</span>
          </a>
        </div>
      </div>
    </div>
  );
}
