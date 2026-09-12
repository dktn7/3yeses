'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, User, Images, BarChart3, Activity, Bookmark, Clock, CreditCard, Settings, Ticket, Menu, X, ArrowUpRight, Compass, MessageSquare } from 'lucide-react';
import { buildLocalizedPath, normalizeLocale } from '@/lib/locale-path';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ModeToggle } from '@/components/ThemeToggle';
import SwoopingTick from '@/components/SwoopingTick';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { logout } = useAuth();
  const pathname = usePathname();
  const locale = normalizeLocale(pathname?.split('/')[1] || 'en-gb');
  const [user, setUser] = useState<{name?: string; firstName?: string; email: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations('dashboard.nav');
  const href = (path: string) => buildLocalizedPath(locale, path);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetch('/api/auth/verify', { credentials: 'include', signal: controller.signal })
      .then(async response => {
        if (response.status === 401) { router.replace(buildLocalizedPath(locale, '/auth/signin')); return; }
        if (!response.ok) throw new Error('Authentication unavailable');
        const data = await response.json();
        if (data.success) setUser(data.user);
        else router.replace(buildLocalizedPath(locale, '/auth/signin'));
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [router, locale, attempt]);

  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [menuOpen]);

  const groups = [
    { label: 'Your space', items: [
      { name: t('overview'), path: 'overview', icon: LayoutDashboard },
      { name: t('profile'), path: 'profile', icon: User },
      { name: t('gallery'), path: 'gallery', icon: Images },
      { name: t('insights'), path: 'analytics', icon: BarChart3 },
    ] },
    { label: 'Connections', items: [
      { name: t('activity'), path: 'activity', icon: Activity },
      { name: t('saved'), path: 'saved', icon: Bookmark },
      { name: t('history'), path: 'history', icon: Clock },
      { name: 'Messages', path: 'messages', icon: MessageSquare },
    ] },
    { label: 'Account', items: [
      { name: t('billing'), path: 'billing', icon: CreditCard },
      { name: 'Subscription', path: 'subscription', icon: CreditCard },
      { name: t('settings'), path: 'settings', icon: Settings },
      { name: t('tickets'), path: 'tickets', icon: Ticket },
    ] },
  ];
  const current = groups.flatMap(group => group.items).find(item => pathname?.includes(`/dashboard/${item.path}`));
  const name = user?.name || user?.firstName || user?.email || 'Account';

  return (
    <div className="dashboard-shell">
      <a href="#dashboard-content" className="dashboard-skip">Skip to content</a>
      <header className="dashboard-topbar">
        <Link href={href('/')} className="dashboard-wordmark" aria-label="3YESES home">3YESES<SwoopingTick size={30} /></Link>
        <div className="dashboard-breadcrumb"><span>Your dashboard</span><span aria-hidden="true">/</span><strong>{current?.name || 'Overview'}</strong></div>
        <Link href={href('/hub')} className="dashboard-explore"><Compass size={18} /><span>Explore talent</span><ArrowUpRight size={15} /></Link>
        <ModeToggle />
        <button type="button" className="dashboard-menu-button" aria-label={menuOpen ? 'Close dashboard menu' : 'Open dashboard menu'} aria-expanded={menuOpen} aria-controls="dashboard-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
      </header>
      <div className="dashboard-frame">
        <aside id="dashboard-navigation" className={`dashboard-sidebar ${menuOpen ? 'is-open' : ''}`}>
          <nav aria-label="Dashboard">
            {groups.map(group => <div className="dashboard-nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.items.map(item => <Link key={item.path} href={href(`/dashboard/${item.path}`)} aria-current={current?.path === item.path ? 'page' : undefined} onClick={() => setMenuOpen(false)} className="dashboard-nav-link"><item.icon size={19} strokeWidth={1.8} /><span>{item.name}</span></Link>)}
            </div>)}
          </nav>
          {user && <Link href={href('/dashboard/settings')} className="dashboard-account"><span className="dashboard-avatar">{name[0].toUpperCase()}</span><span><strong>{name}</strong><small>Manage your account</small></span><Settings size={16} /></Link>}
          <div className="dashboard-legal"><Link href={href('/privacy')}>Privacy</Link><Link href={href('/terms')}>Terms</Link><Link href={href('/support')}>Help</Link>{user && <button type="button" onClick={logout}>Sign out</button>}</div>
        </aside>
        <main id="dashboard-content" tabIndex={-1} className="dashboard-content">
          {loading ? <div className="flex min-h-[60dvh] items-center justify-center"><LoadingSpinner /></div> : error ? <div className="p-8" role="alert"><h1 className="text-2xl font-semibold">We couldn’t load your account</h1><p className="mt-2">Check your connection and try again.</p><button className="mt-4 underline" onClick={() => setAttempt(value => value + 1)}>Try again</button></div> : user ? children : null}
        </main>
      </div>
    </div>
  );
}
