'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

interface DashboardStats {
  profileViews: number;
  likes: number;
  bookings: number;
  reviews: number;
  profileCompletion: number;
}

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
  emailVerified: boolean;
  talentProfile?: {
    profileComplete: boolean;
    viewCount: number;
    likeCount: number;
    rating: number;
  };
}

export default function DashboardOverview() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    profileViews: 0,
    likes: 0,
    bookings: 0,
    reviews: 0,
    profileCompletion: 0,
  });
  const [loading, setLoading] = useState(true);

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
            
            // Load stats if talent
            if (data.user.role === 'talent' && data.user.talentProfile) {
              setStats({
                profileViews: data.user.talentProfile.viewCount || 0,
                likes: data.user.talentProfile.likeCount || 0,
                bookings: 0, // TODO: Load from API
                reviews: 0, // TODO: Load from API
                profileCompletion: calculateProfileCompletion(data.user.talentProfile),
              });
            }
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

    loadDashboard();
  }, [router]);

  const calculateProfileCompletion = (profile: any): number => {
    const fields = [
      profile.bio,
      profile.location,
      profile.experience,
      profile.dateOfBirth,
      profile.avatarUrl,
      profile.skills?.length > 0,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) return null;

  const statCards = [
    {
      title: 'Profile Views',
      value: stats.profileViews,
      icon: '👁️',
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Total Likes',
      value: stats.likes,
      icon: '❤️',
      color: 'bg-red-500',
      change: '+8%',
    },
    {
      title: 'Bookings',
      value: stats.bookings,
      icon: '📅',
      color: 'bg-green-500',
      change: '+23%',
    },
    {
      title: 'Reviews',
      value: stats.reviews,
      icon: '⭐',
      color: 'bg-yellow-500',
      change: '+5',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-primary-blue dark:bg-accent-red rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
        <p className="text-blue-100 dark:text-pink-100">
          Here's what's happening with your account today.
        </p>
      </div>

      {/* Profile Completion Alert */}
      {user.role === 'talent' && stats.profileCompletion < 100 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Complete your profile ({stats.profileCompletion}%)
              </h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                A complete profile gets 3x more views!{' '}
                <Link href="/dashboard/profile/edit" className="font-medium underline hover:text-yellow-600">
                  Complete now →
                </Link>
              </p>
              <div className="mt-2 w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-2">
                <div
                  className="bg-yellow-600 dark:bg-yellow-400 h-2 rounded-full transition-all"
                  style={{ width: `${stats.profileCompletion}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Verification Alert */}
      {!user.emailVerified && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Email not verified
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                Please check your email and verify your account.{' '}
                <button className="font-medium underline hover:text-red-600">
                  Resend verification email
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {user.role === 'talent' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    {stat.change} from last week
                  </p>
                </div>
                <div className={`text-4xl ${stat.color} bg-opacity-10 p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/profile/edit"
            className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <span className="text-2xl mr-3">✏️</span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Edit Profile</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Update your information</p>
            </div>
          </Link>

          <Link
            href="/dashboard/portfolio"
            className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <span className="text-2xl mr-3">🎨</span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Manage Portfolio</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add photos and videos</p>
            </div>
          </Link>

          <Link
            href="/dashboard/settings"
            className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
          >
            <span className="text-2xl mr-3">⚙️</span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Settings</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage your account</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400">👁️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Your profile was viewed 15 times
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <span className="text-red-600 dark:text-red-400">❤️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                3 new likes on your profile
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">5 hours ago</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Profile completion increased to {stats.profileCompletion}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
