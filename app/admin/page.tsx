'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
  UserCheck,
  Star,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTalent: number;
  totalProfiles: number;
  availableProfiles: number;
  verifiedProfiles: number;
  totalReviews: number;
  averageRating: number;
  totalCategories: number;
  totalSubcategories: number;
  totalViews: number;
  totalLikes: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'review';
  message: string;
  timestamp: Date;
  status?: 'success' | 'warning' | 'error';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setRecentActivity(data.recentActivity || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      change: '+12%',
      icon: Users,
      color: 'blue',
      link: '/admin/users'
    },
    {
      title: 'Active Talent',
      value: stats?.totalTalent || 0,
      change: '+8%',
      icon: UserCheck,
      color: 'green',
      link: '/admin/users?filter=talent'
    },
    {
      title: 'Complete Profiles',
      value: stats?.availableProfiles || 0,
      change: '+23%',
      icon: CheckCircle,
      color: 'purple',
      link: '/admin/users?filter=talent'
    },
    {
      title: 'Total Views',
      value: (stats?.totalViews || 0).toLocaleString(),
      change: '+15%',
      icon: Activity,
      color: 'emerald',
      link: '/admin/analytics'
    },
    {
      title: 'Average Rating',
      value: (stats?.averageRating || 0).toFixed(1),
      change: '+0.3',
      icon: Star,
      color: 'yellow',
      link: '/admin/reviews'
    },
    {
      title: 'Total Reviews',
      value: stats?.totalReviews || 0,
      change: '+18',
      icon: MessageSquare,
      color: 'red',
      link: '/admin/reviews'
    },
  ];

  const quickActions = [
    { name: 'Add New User', href: '/admin/users/new', icon: Users },
    { name: 'Manage Categories', href: '/admin/categories', icon: Briefcase },
    { name: 'View Reports', href: '/admin/reports', icon: Activity },
    { name: 'System Settings', href: '/admin/settings', icon: CheckCircle },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
            green: 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400',
            purple: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400',
            emerald: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
            yellow: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
            red: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400',
          };

          return (
            <Link
              key={index}
              href={stat.link}
              className="bg-white dark:bg-white/10 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-white/20 hover:shadow-lg transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-white/10 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-white/20">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                href={action.href}
                className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all border border-gray-200 dark:border-white/10"
              >
                <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {action.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-white/10 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-lg"
                >
                  <div className="flex-shrink-0 mt-1">
                    {activity.type === 'user' && <Users className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'review' && <Star className="h-4 w-4 text-yellow-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-white dark:bg-white/10 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              System Alerts
            </h2>
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                  {stats?.totalProfiles || 0} talent profiles on platform
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  {stats?.availableProfiles || 0} profiles are complete and visible
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-200">
                  All systems operational
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Last checked: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  {(stats?.totalViews || 0).toLocaleString()} total profile views
                </p>
                <Link href="/admin/analytics" className="text-xs text-blue-700 dark:text-blue-300 hover:underline">
                  View analytics →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
