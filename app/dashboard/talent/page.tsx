'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  User, 
  Calendar, 
  DollarSign, 
  Bell, 
  TrendingUp,
  Clock,
  Settings
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalViews: number;
  activeOpportunities: number;
  subscriptionPlan: string;
  totalEarnings: number;
  averageRating: number;
  responseRate: number;
}

export default function TalentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalViews: 0,
    activeOpportunities: 0,
    subscriptionPlan: 'FREE',
    totalEarnings: 0,
    averageRating: 0,
    responseRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setStats({
        totalViews: 1247,
        activeOpportunities: 3,
        subscriptionPlan: 'FREE',
        totalEarnings: 3450,
        averageRating: 4.8,
        responseRate: 95
      });

      setLoading(false);
    };

    loadDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.name || 'Talent'}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your profile and opportunities
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Profile Views
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.totalViews.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Active Opportunities
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.activeOpportunities}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Earnings
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      ${stats.totalEarnings.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/talent"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <User className="h-8 w-8 text-primary-blue" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Browse Talent</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">See all talent profiles</p>
              </div>
            </div>
          </Link>

          <Link
            href="/categories"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Categories</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Browse by category</p>
              </div>
            </div>
          </Link>

          <Link
            href="/contact"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Contact</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get in touch</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/talent/settings"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Profile Settings</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Privacy & visibility</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}