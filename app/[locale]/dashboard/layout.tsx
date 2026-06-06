'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { 
  LayoutDashboard, 
  User, 
  Images, 
  BarChart3, 
  Activity, 
  Check, 
  Clock, 
  CreditCard, 
  Settings,
  Ticket,
  type LucideIcon
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import CategoryIconBackground from '@/components/CategoryIconBackground';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const t = useTranslations('dashboard.nav');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUser(data.user);
          } else {
            router.push('/auth/signin');
          }
        } else {
          router.push('/auth/signin');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/signin');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) return null;

  const navigation: Array<{ name: string; href: string; icon: LucideIcon }> = [
    { name: t('overview'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('profile'), href: '/dashboard/profile', icon: User },
    { name: t('gallery'), href: '/dashboard/gallery', icon: Images },
    { name: t('insights'), href: '/dashboard/analytics', icon: BarChart3 },
    { name: t('activity'), href: '/dashboard/activity', icon: Activity },
    { name: t('saved'), href: '/dashboard/saved', icon: Check },
    { name: t('history'), href: '/dashboard/history', icon: Clock },
    { name: t('tickets'), href: '/dashboard/tickets', icon: Ticket },
    { name: t('billing'), href: '/dashboard/billing', icon: CreditCard },
    { name: t('settings'), href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="relative min-h-screen transition-colors duration-300">
      <CategoryIconBackground />
      <div className="relative z-20">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-dark-surface/90 border-b border-gray-200 dark:border-red-400/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Desktop Tabs */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '/dashboard');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'text-primary-blue dark:text-red-100 bg-blue-50 dark:bg-[rgba(185,28,28,0.18)] ring-1 ring-blue-300/90 ring-offset-1 ring-offset-white dark:ring-red-500/20 dark:ring-offset-transparent'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={18} strokeWidth={2} />
                      <span>{item.name}</span>
                    </span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-blue dark:bg-accent-red rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Right Actions - Empty, logout moved to ProfileDropdown */}
            <div className="flex items-center gap-2">
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <aside className="fixed top-0 left-0 z-50 h-full w-72 bg-light-surface dark:bg-dark-surface shadow-2xl transform transition-transform duration-300 md:hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '/dashboard');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                        isActive
                          ? 'bg-primary-blue dark:bg-accent-red text-white shadow-lg ring-1 ring-blue-300/90 ring-offset-1 ring-offset-white dark:ring-red-500/20 dark:ring-offset-transparent'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon size={20} strokeWidth={2} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
      </div>
    </div>
  );
}
