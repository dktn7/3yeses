'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bookmark,
  CheckCircle2,
  Clock3,
  Eye,
  Images,
  LayoutDashboard,
  LineChart,
  Save,
  Sparkles,
  UserRound,
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { DashboardLoading } from '@/components/dashboard/DashboardPrimitives';
import MiniSparkline from '@/components/dashboard/MiniSparkline';
import {
  DashboardActionCard,
  DashboardButton,
  DashboardHeader,
  DashboardPanel,
  DashboardStatRow,
  DashboardSurface,
  DashboardWorkspace,
  EmptyState,
  MetricTile,
  PanelHeading,
  StatusPill,
} from '@/components/dashboard/DashboardPrimitives';
import { buildLocalizedPath } from '@/lib/locale-path';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

interface DashboardStats {
  totalViews: number;
  totalLikes: number;
  savedTalents: number;
  viewTrend: number;
  likeTrend: number;
}

const defaultStats: DashboardStats = {
  totalViews: 0,
  totalLikes: 0,
  savedTalents: 0,
  viewTrend: 0,
  likeTrend: 0,
};

export default function DashboardOverview() {
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState(defaultStats);
  const [talentProfile, setTalentProfile] = useState<any>(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [savedTalents, setSavedTalents] = useState<any[]>([]);
  const [viewedTalents, setViewedTalents] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [portfolioPerformance, setPortfolioPerformance] = useState<any>(null);
  const [viewsHistory, setViewsHistory] = useState<number[]>([]);
  const [likesHistory, setLikesHistory] = useState<number[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [railErrors, setRailErrors] = useState({ saved: false, recent: false });
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoadError(false);
      setRailErrors({ saved: false, recent: false });
      setLoading(true);
      try {
        const verify = await fetch('/api/auth/verify', { credentials: 'include' });
        if (!verify.ok) {
          window.location.href = buildLocalizedPath(locale, '/auth/signin');
          return;
        }
        const verifyData = await verify.json();
        if (!verifyData.success) {
          window.location.href = buildLocalizedPath(locale, '/auth/signin');
          return;
        }

        setUser(verifyData.user);
        const currentUser = verifyData.user;

        const [
          completionRes,
          talentRes,
          statsRes,
          savedRes,
          viewedRes,
          activityRes,
          portfolioRes,
          performanceRes,
          analyticsRes,
        ] = await Promise.allSettled([
          fetch('/api/user/profile-completion', { credentials: 'include' }),
          fetch(`/api/talent/${currentUser.id}`, { credentials: 'include' }),
          fetch('/api/dashboard/stats', { credentials: 'include' }),
          fetch('/api/dashboard/saved-talents', { credentials: 'include' }),
          fetch(`/api/dashboard/view-history?timeZone=${encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone)}`, { credentials: 'include' }),
          fetch('/api/dashboard/activity', { credentials: 'include' }),
          fetch('/api/dashboard/portfolio-items', { credentials: 'include' }),
          fetch('/api/dashboard/portfolio-performance', { credentials: 'include' }),
          fetch('/api/analytics/dashboard?days=7', { credentials: 'include' }),
        ]);

        setLoadError([completionRes, statsRes, savedRes, viewedRes, activityRes, portfolioRes, performanceRes, analyticsRes].some(result => result.status === 'rejected' || !result.value.ok));
        setRailErrors({
          saved: savedRes.status === 'rejected' || !savedRes.value.ok,
          recent: viewedRes.status === 'rejected' || !viewedRes.value.ok,
        });

        if (completionRes.status === 'fulfilled' && completionRes.value.ok) {
          const data = await completionRes.value.json();
          setProfileCompletion(data.percentage ?? data.completionPercentage ?? 0);
          setMissingFields(data.missingFields || []);
        }
        if (talentRes.status === 'fulfilled' && talentRes.value.ok) {
          const data = await talentRes.value.json();
          setTalentProfile(data.talent || data);
        }
        if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
          const data = await statsRes.value.json();
          setStats((current) => ({
            ...current,
            totalViews: data.profileViews || 0,
            totalLikes: data.likes || 0,
            viewTrend: data.profileViewsChange || 0,
            likeTrend: data.likesChange || 0,
          }));
        }
        if (savedRes.status === 'fulfilled' && savedRes.value.ok) {
          const data = await savedRes.value.json();
          setSavedTalents(data.talents || []);
          setStats((current) => ({ ...current, savedTalents: (data.talents || []).length }));
        }
        if (viewedRes.status === 'fulfilled' && viewedRes.value.ok) {
          const data = await viewedRes.value.json();
          setViewedTalents((data.talents || []).filter((talent: any, index: number, talents: any[]) =>
            talents.findIndex((candidate: any) => candidate.id === talent.id) === index
          ));
        }
        if (activityRes.status === 'fulfilled' && activityRes.value.ok) {
          const data = await activityRes.value.json();
          setActivities(data.activities || []);
        }
        if (portfolioRes.status === 'fulfilled' && portfolioRes.value.ok) {
          const data = await portfolioRes.value.json();
          setPortfolioItems(data.items || []);
        }
        if (performanceRes.status === 'fulfilled' && performanceRes.value.ok) {
          setPortfolioPerformance(await performanceRes.value.json());
        }
        if (analyticsRes.status === 'fulfilled' && analyticsRes.value.ok) {
          const data = await analyticsRes.value.json();
          const daily = data.analytics?.dailyStats || [];
          setViewsHistory(daily.map((item: any) => item.views || 0));
          setLikesHistory(daily.map((item: any) => item.portfolioViews || 0));
        }
      } catch (error) {
        setLoadError(true);
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [locale, loadAttempt]);

  const displayName = talentProfile?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || user?.email || 'Talent';
  const firstName = displayName.split(' ')[0];
  const nextActions = useMemo(() => {
    const actions = [];
    if (profileCompletion < 100) {
      actions.push({
        icon: Sparkles,
        title: 'Complete your profile',
        description: missingFields.length ? `Missing: ${missingFields.slice(0, 3).join(', ')}` : 'Add profile details that improve discovery.',
        href: buildLocalizedPath(locale, '/dashboard/profile'),
      });
    }
    if (!talentProfile?.avatarUrl || !talentProfile?.bannerUrl) {
      actions.push({
        icon: UserRound,
        title: 'Add your profile photos',
        description: 'Help people recognise you with a profile photo and cover image.',
        href: buildLocalizedPath(locale, '/dashboard/profile'),
      });
    }
    if (portfolioItems.length < 3) {
      actions.push({
        icon: Images,
        title: 'Build your media shelf',
        description: 'Add at least three strong images, videos, or audio pieces so people can understand your talent quickly.',
        href: buildLocalizedPath(locale, '/dashboard/gallery'),
      });
    }
    actions.push({
      icon: BarChart3,
      title: 'Read your media signals',
      description: 'See which media people open, save, and return to.',
      href: buildLocalizedPath(locale, '/dashboard/analytics'),
    });
    return actions.slice(0, 4);
  }, [locale, missingFields, portfolioItems.length, profileCompletion, talentProfile]);

  if (loading) return <DashboardLoading />;

  if (!user) return null;

  const talentRails = [
    { kind: 'saved' as const, title: 'Saved talent', href: buildLocalizedPath(locale, '/dashboard/saved'), items: savedTalents },
    { kind: 'recent' as const, title: 'Recent profiles', href: buildLocalizedPath(locale, '/dashboard/history'), items: viewedTalents },
  ];
  const [priorityAction, ...supportingActions] = nextActions;
  const PriorityIcon = priorityAction.icon;

  return (
    <DashboardWorkspace className="dashboard-overview-page">
      <DashboardHeader
        icon={LayoutDashboard}
        title={`Welcome back, ${firstName}`}
        description="Your profile, your media, your progress, and the people worth coming back to."
        actions={
          <>
            <DashboardButton href={buildLocalizedPath(locale, '/dashboard/profile')}>
              <UserRound className="h-4 w-4" />
              Edit profile
            </DashboardButton>
            <DashboardButton href={buildLocalizedPath(locale, '/dashboard/gallery')} variant="secondary">
              <Images className="h-4 w-4" />
              Add media
            </DashboardButton>
          </>
        }
        meta={<StatusPill tone={profileCompletion >= 80 ? 'success' : 'warning'}>{profileCompletion}% profile complete</StatusPill>}
      />

      {loadError && (
        <div role="status" className="dashboard-surface-muted flex flex-col gap-3 rounded-2xl p-4 text-sm text-slate-700 dark:text-slate-200 sm:flex-row sm:items-center sm:justify-between">
          <p>Some dashboard details are taking longer to load.</p>
          <button type="button" onClick={() => setLoadAttempt(value => value + 1)} className="min-h-10 text-left font-semibold text-[color:var(--brand-primary)] underline-offset-4 hover:underline sm:text-right">
            Try again
          </button>
        </div>
      )}

      <div className="grid gap-7 xl:grid-cols-[minmax(240px,0.7fr)_minmax(0,1.5fr)]">
        <aside className="order-1 space-y-6 xl:self-start">
          <DashboardSurface className="dashboard-profile-spotlight" innerClassName="overflow-hidden p-0">
            <div className="dashboard-profile-banner h-36" style={talentProfile?.bannerUrl?.startsWith('#') ? { backgroundColor: talentProfile.bannerUrl } : undefined}>
              {talentProfile?.bannerUrl && !talentProfile.bannerUrl.startsWith('#') ? (
                <Image src={talentProfile.bannerUrl} alt="Profile banner" width={640} height={220} unoptimized className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="p-5">
              <div className="-mt-16 flex items-end gap-4">
                <Link
                  href={buildLocalizedPath(locale, '/dashboard/profile#profile-headshot')}
                  aria-label="Change profile picture"
                  className="dashboard-avatar-edit group relative block rounded-[2rem] bg-white/80 p-1 shadow-[0_22px_42px_-28px_rgba(15,23,42,0.75)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--brand-primary)] dark:bg-slate-950/70"
                >
                  {talentProfile?.avatarUrl ? (
                    <Image src={talentProfile.avatarUrl} alt={displayName} width={112} height={112} unoptimized className="h-28 w-28 rounded-[1.65rem] object-cover" />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-[1.65rem] bg-[color:var(--brand-primary)]/10 text-[color:var(--brand-primary)]">
                      <UserRound className="h-9 w-9" />
                    </div>
                  )}
                  <span className="dashboard-avatar-edit-label">Change photo</span>
                </Link>
                <StatusPill tone={profileCompletion >= 80 ? 'success' : 'warning'}>{profileCompletion}% ready</StatusPill>
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{displayName}</h2>
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">{talentProfile?.performerTitle || talentProfile?.category?.name || talentProfile?.location || 'Talent profile'}</p>
              <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-700 dark:text-slate-200">
                {talentProfile?.bio || 'Add a bio, headshot, banner, skills, and media so visitors understand your talent quickly.'}
              </p>
              <div className="dashboard-profile-progress mt-5" aria-label={`Profile ${profileCompletion}% complete`}>
                <span style={{ width: `${profileCompletion}%` }} />
              </div>
              <div className="dashboard-profile-priority mt-5">
                <div className="dashboard-profile-priority-icon"><PriorityIcon className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--brand-primary)]">Next priority</p>
                  <h3 className="mt-1 text-base font-semibold text-slate-950 dark:text-white">{priorityAction.title}</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">{priorityAction.description}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <DashboardButton href={priorityAction.href}>
                  {priorityAction.title === 'Add your profile photos' ? 'Upload photos' : 'Continue'}
                  <ArrowUpRight className="h-4 w-4" />
                </DashboardButton>
              </div>
            </div>
          </DashboardSurface>

          {supportingActions.length > 0 && <DashboardPanel className="dashboard-readiness-panel">
            <PanelHeading title="Coming next" description="Keep your public presence current and easy to discover." />
            <div className="space-y-3">
              {supportingActions.map((action) => (
                <DashboardActionCard
                  key={action.title}
                  icon={action.icon}
                  title={action.title}
                  description={action.description}
                  tone="accent"
                  action={
                    <DashboardButton href={action.href} variant="secondary">
                      Open
                      <ArrowUpRight className="h-4 w-4" />
                    </DashboardButton>
                  }
                />
              ))}
            </div>
          </DashboardPanel>}
        </aside>

        <div className="order-2 flex min-w-0 flex-col space-y-7">
          {portfolioItems.length > 0 && (
            <section className="dashboard-latest-work" aria-labelledby="latest-work-heading">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-[color:var(--brand-primary)]">Your showcase</p>
                  <h2 id="latest-work-heading" className="mt-1 text-xl font-semibold">Latest work</h2>
                </div>
                <DashboardButton href={buildLocalizedPath(locale, '/dashboard/gallery')} variant="ghost">View gallery <ArrowUpRight className="h-4 w-4" /></DashboardButton>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {portfolioItems.slice(0, 3).map((item: any) => (
                  <Link key={item.id} href={buildLocalizedPath(locale, '/dashboard/gallery')} className="dashboard-work-item group relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800">
                    {(item.thumbnail || (item.type?.toLowerCase() === 'image' ? item.mediaUrl : null)) ? (
                      <Image src={item.thumbnail || item.mediaUrl} alt={item.title || 'Media from your shelf'} fill sizes="(max-width: 640px) 100vw, 33vw" unoptimized className="object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
                    ) : <Images className="absolute left-4 top-4 h-6 w-6 text-[color:var(--brand-primary)]" />}
                    <span className="absolute inset-x-0 bottom-0 bg-black/65 px-3 py-2 text-sm font-semibold text-white">{item.title || 'Untitled work'}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="dashboard-signal-strip">
            <MetricTile
              label="Profile views"
              value={stats.totalViews.toLocaleString()}
              detail={`${stats.viewTrend >= 0 ? '+' : ''}${stats.viewTrend}% over previous period`}
              icon={Eye}
              trend={viewsHistory.length > 1 ? <MiniSparkline data={viewsHistory} color={stats.viewTrend >= 0 ? '#059669' : '#B91C1C'} height={34} width={120} /> : null}
            />
            <MetricTile
              label="Profile likes"
              value={stats.totalLikes.toLocaleString()}
              detail={`${stats.likeTrend >= 0 ? '+' : ''}${stats.likeTrend}% movement`}
              icon={CheckCircle2}
              trend={likesHistory.length > 1 ? <MiniSparkline data={likesHistory} color={stats.likeTrend >= 0 ? '#059669' : '#B91C1C'} height={34} width={120} /> : null}
            />
            <MetricTile
              label="Saved talent"
              value={stats.savedTalents.toLocaleString()}
              detail="People you can revisit quickly"
              icon={Save}
            />
          </div>

          <DashboardPanel className="dashboard-media-performance order-3">
            <PanelHeading
              title="Media performance"
              description="See which pieces of media people open and return to."
              actions={<DashboardButton href={buildLocalizedPath(locale, '/dashboard/gallery')} variant="secondary">Manage media</DashboardButton>}
            />
            {portfolioPerformance?.topPerformers?.length ? (
              <div className="space-y-3">
                <DashboardStatRow
                  items={[
                    { label: 'Media views', value: portfolioPerformance.analytics?.totalViews?.toLocaleString?.() || 0, detail: 'Total media opens' },
                    { label: 'Media likes', value: portfolioPerformance.analytics?.totalLikes?.toLocaleString?.() || 0, detail: 'Saved reactions' },
                    { label: 'Engagement', value: `${portfolioPerformance.analytics?.avgEngagementRate || 0}%`, detail: 'Average media rate' },
                    { label: 'This week', value: portfolioPerformance.analytics?.recentViews?.toLocaleString?.() || 0, detail: 'Recent views' },
                  ]}
                />
                <div className="mt-4 grid gap-3">
                  {portfolioPerformance.topPerformers.slice(0, 4).map((item: any, index: number) => (
                    <div key={item.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[1.5rem] bg-slate-50/80 p-3 dark:bg-slate-950/35">
                      <span className="font-mono text-sm font-semibold text-slate-500">#{index + 1}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{item.title || item.type}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.views || 0} views · {item.likeCount || 0} likes</p>
                      </div>
                      <StatusPill tone="brand">{item.engagementRate || 0}%</StatusPill>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Images}
                title="Your media shelf starts here"
                description="Upload a few strong pieces, then this area can show which work people open and return to."
                action={<DashboardButton href={buildLocalizedPath(locale, '/dashboard/gallery')}>Add media</DashboardButton>}
              />
            )}
          </DashboardPanel>

          <div className="order-4 grid gap-7 xl:grid-cols-2">
            <DashboardPanel>
              <PanelHeading title="Recent activity" actions={<DashboardButton href={buildLocalizedPath(locale, '/dashboard/activity')} variant="ghost">View all</DashboardButton>} />
              {activities.length ? (
                <div className="space-y-3">
                  {activities.slice(0, 5).map((item, index) => (
                    <div key={`${item.id || item.time}-${index}`} className="flex items-start gap-3 rounded-[1.5rem] bg-slate-50/80 p-3 dark:bg-slate-950/35">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--brand-primary)]/10 text-[color:var(--brand-primary)]">
                        <Activity className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">{item.actorName || item.talent?.user?.name || item.type || 'Activity'}</p>
                        <p className="truncate text-sm text-slate-600 dark:text-slate-300">{item.text || item.content || 'Dashboard activity'}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.time || item.createdAt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Activity} title="No recent activity" description="Views, likes, and comments will appear here once people interact with your profile." />
              )}
            </DashboardPanel>

            <DashboardPanel>
              <PanelHeading title="Keep growing" description="What the data suggests right now." />
              <DashboardActionCard
                icon={LineChart}
                title={portfolioItems.length < 3 ? 'Add to your media shelf' : 'Keep your strongest media visible'}
                description={portfolioItems.length < 3 ? 'Share images, video, or audio that show what you do best.' : 'You have enough media to start reading performance. Check analytics weekly and keep the strongest pieces near the top.'}
                tone="accent"
                action={<DashboardButton href={buildLocalizedPath(locale, portfolioItems.length < 3 ? '/dashboard/gallery' : '/dashboard/analytics')} variant="secondary">Review</DashboardButton>}
              />
            </DashboardPanel>
          </div>

          <div className="dashboard-discovery-section order-2">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-primary)]">People to revisit</p>
                <h2 id="people-to-revisit-heading" className="mt-1 text-xl font-semibold">Your talent trail</h2>
              </div>
              <p className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block">Saved first, recent second</p>
            </div>
            <div className="grid gap-7 xl:grid-cols-[1.1fr_.9fr]">
            {talentRails.map((rail) => {
              const isRecent = rail.kind === 'recent';
              const RailIcon = isRecent ? Clock3 : Bookmark;
              return (
              <DashboardPanel key={rail.title} className={`dashboard-discovery-panel ${isRecent ? 'is-recent' : 'is-saved'}`}>
                <div className="dashboard-discovery-heading">
                  <div className="dashboard-discovery-title">
                    <span className="dashboard-discovery-icon"><RailIcon className="h-4 w-4" /></span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-primary)]">{isRecent ? 'Your trail' : 'Your shortlist'}</p>
                      <h2 className="mt-1 text-lg font-semibold">{rail.title}</h2>
                    </div>
                  </div>
                  <DashboardButton href={rail.href} variant="ghost" aria-label={`View all ${rail.title.toLowerCase()}`}>View all <ArrowUpRight className="h-4 w-4" /></DashboardButton>
                </div>
                {railErrors[rail.kind] ? (
                  <div className="border-t border-[color:var(--dashboard-line)] py-7 text-sm">
                    <p className="font-semibold">{isRecent ? 'Recent profiles' : 'Saved talent'} could not load.</p>
                    <button type="button" onClick={() => setLoadAttempt((value) => value + 1)} className="mt-2 font-semibold text-[color:var(--brand-primary)] underline underline-offset-4">Try again</button>
                  </div>
                ) : rail.items.length ? (
                  <div className="grid gap-3">
                    {rail.items.slice(0, 4).map((talent: any) => (
                      <Link
                        key={isRecent ? talent.viewId || `${talent.id}-${talent.viewedAt}` : talent.id}
                        href={buildLocalizedPath(locale, `/talent/${talent.id}`)}
                        className="dashboard-discovery-item group grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 rounded-[1.1rem] p-3 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1"
                      >
                        <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-slate-200 dark:bg-neutral-800">
                          {(talent.imageUrl || talent.avatarUrl || talent.mediaItems?.find((item: any) => item.thumbnail)?.thumbnail || talent.mediaItems?.find((item: any) => item.type?.toUpperCase() === 'IMAGE' && item.mediaUrl)?.mediaUrl) ? (
                            <Image src={talent.imageUrl || talent.avatarUrl || talent.mediaItems?.find((item: any) => item.thumbnail)?.thumbnail || talent.mediaItems?.find((item: any) => item.type?.toUpperCase() === 'IMAGE' && item.mediaUrl)?.mediaUrl} alt={talent.name || 'Talent'} fill sizes="56px" unoptimized className="object-cover" />
                          ) : (
                            <UserRound className="m-4 h-6 w-6 text-slate-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{talent.name || talent.user?.name || 'Talent'}</p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{talent.role || (typeof talent.category === 'string' ? talent.category : talent.category?.name) || 'Talent profile'}</p>
                          {isRecent && talent.viewedAt && <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">Viewed {new Date(talent.viewedAt).toLocaleDateString(locale, { month: 'short', day: 'numeric' })}</p>}
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={isRecent ? Clock3 : Bookmark} title={isRecent ? 'No recent profiles yet' : 'Your shortlist is empty'} description={isRecent ? 'Profiles you open will appear here for a quick return.' : 'Save talent whose work you want to revisit.'} action={<DashboardButton href={buildLocalizedPath(locale, '/hub')} variant="secondary">Discover talent</DashboardButton>} />
                )}
              </DashboardPanel>
              );
            })}
            </div>
          </div>
        </div>
      </div>
    </DashboardWorkspace>
  );
}


