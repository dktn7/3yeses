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
  Menu,
  X,
  ChevronLeft,
  type LucideIcon
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { buildLocalizedPath, normalizeLocale } from '@/lib/locale-path';

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
  const locale = normalizeLocale(pathname?.split('/')[1] || 'en-gb');
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
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_34%),radial-gradient(circle_at_top_right,rgba(185,28,28,0.10),transparent_28%),linear-gradient(180deg,var(--background),color-mix(in_srgb,var(--background)_86%,#f8fafc))] transition-colors duration-300">
      <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[color-mix(in_srgb,var(--brand-primary)_14%,transparent)] to-transparent pointer-events-none" />
      <div className="relative z-20">
        <div className="sticky top-0 z-40 border-b border-slate-200/70 bg-light-surface/88 backdrop-blur-xl shadow-[0_10px_40px_-30px_rgba(15,23,42,0.45)] dark:bg-dark-surface/86 dark:border-slate-800/70">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Link
                href={buildLocalizedPath(locale, '/')}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:border-[color:var(--brand-primary)]/30 hover:text-[color:var(--brand-primary)] dark:border-slate-700/70 dark:bg-slate-900/40 dark:text-slate-200"
              >
                <ChevronLeft size={14} />
                Back to site
              </Link>
              <div className="hidden sm:block">
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Dashboard</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {user?.name || 'Account'}
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1 rounded-full border border-slate-200/70 bg-white/60 p-1.5 dark:border-slate-800/70 dark:bg-slate-900/30">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '/dashboard');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[color:var(--brand-primary)] text-white shadow-[0_12px_30px_-18px_rgba(37,99,235,0.85)] dark:bg-[color:var(--brand-primary)]'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
                    }`}
                  >
                    <Icon size={16} strokeWidth={2} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-3 rounded-full border border-slate-200/70 bg-white/70 px-4 py-2 text-sm text-slate-600 dark:border-slate-800/70 dark:bg-slate-900/30 dark:text-slate-300">
                <User size={16} className="text-[color:var(--brand-primary)]" />
                <span className="max-w-[12rem] truncate">{user?.email}</span>
              </div>

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden inline-flex items-center justify-center rounded-full border border-slate-200/70 bg-white/70 p-2 text-slate-700 transition-all hover:border-[color:var(--brand-primary)]/30 hover:text-[color:var(--brand-primary)] dark:border-slate-800/70 dark:bg-slate-900/30 dark:text-slate-200"
                aria-label={sidebarOpen ? 'Close dashboard menu' : 'Open dashboard menu'}
              >
                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <aside className="fixed left-0 top-0 z-50 h-full w-80 border-r border-slate-200/70 bg-light-surface/98 shadow-2xl shadow-slate-900/15 backdrop-blur-xl transition-transform duration-300 md:hidden dark:border-slate-800/70 dark:bg-dark-surface/96">
            <div className="flex h-full flex-col p-5">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Menu</p>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Dashboard</h2>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-full border border-slate-200/70 p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800/70 dark:hover:bg-slate-800/80 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '/dashboard');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-medium transition-all ${
                        isActive
                          ? 'bg-[color:var(--brand-primary)] text-white shadow-[0_16px_40px_-22px_rgba(37,99,235,0.9)]'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <Icon size={20} strokeWidth={2} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-auto rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 text-sm text-slate-600 dark:border-slate-800/70 dark:bg-slate-900/40 dark:text-slate-300">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Signed in as</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="relative min-h-[calc(100vh-4rem)]">
        {children}
      </main>
      </div>
    </div>
  );
}
