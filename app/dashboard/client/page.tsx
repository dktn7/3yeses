'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Users, 
  Calendar, 
  DollarSign, 
  Star, 
  Search, 
  Clock,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

interface ClientStats {
  totalPosted: number;
  activeBookings: number;
  totalSpent: number;
  savedTalents: number;
  averageRating: number;
  responseRate: number;
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<ClientStats>({
    totalPosted: 0,
    activeBookings: 0,
    totalSpent: 0,
    savedTalents: 0,
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
        totalPosted: 18,
        activeBookings: 5,
        totalSpent: 12450,
        savedTalents: 23,
        averageRating: 4.7,
        responseRate: 89
      });

      setLoading(false);
    };

    loadDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.name || 'Client'}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your talent bookings and projects
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/talent"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <Search className="h-4 w-4 mr-2" />
                Browse Talent
              </Link>
              <Link
                href="/client/post-opportunity"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-blue hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Post Opportunity
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Briefcase className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Projects Posted
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.totalPosted}
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
                      Active Bookings
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.activeBookings}
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
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Invested
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      ${stats.totalSpent.toLocaleString()}
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
              <Search className="h-8 w-8 text-primary-blue" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Browse Talent</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Find the perfect match</p>
              </div>
            </div>
          </Link>

          <Link
            href="/categories"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <Users className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Categories</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Browse by type</p>
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
            href="/auth/signup"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <Star className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Post Project</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Hire talent</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}