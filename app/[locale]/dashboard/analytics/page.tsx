'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Eye,
  Heart,
  Image as ImageIcon,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  DashboardHeader,
  DashboardButton,
  DashboardLoadError,
  DashboardLoading,
  DashboardPage,
  DashboardPanel,
  EmptyState,
  SegmentedControl,
} from '@/components/dashboard/DashboardPrimitives';
import { buildLocalizedPath } from '@/lib/locale-path';

interface DailyStats {
  date: string;
  views: number;
  uniqueViews: number;
  portfolioViews: number;
  searchImpressions: number;
  searchClicks: number;
  comments: number;
}

interface PortfolioItem {
  id: string;
  title: string;
  type: string;
  mediaUrl?: string | null;
  thumbnail?: string | null;
  _count: {
    views: number;
  };
}

interface RecentView {
  id: string;
  createdAt: string;
  viewer: {
    id: string;
    name: string | null;
    talentProfile?: {
      avatarUrl: string | null;
    } | null;
  } | null;
}

interface AnalyticsData {
  overview: {
    totalViews: number;
    uniqueViewers: number;
    totalPortfolioViews: number;
    totalLikes: number;
    searchImpressions: number;
    searchClicks: number;
    searchCTR: number;
    engagementRate: string;
    lifetime?: { totalViews: number; totalPortfolioViews: number };
  };
  period?: {
    comparison: {
      profileViewsDelta: number;
      portfolioViewsDelta: number;
    };
  };
  dailyStats: DailyStats[];
  topPortfolioItems: PortfolioItem[];
  recentViews: RecentView[];
}

const chartGrid = 'rgba(148, 163, 184, 0.22)';
const tooltipStyle = {
  background: 'var(--dashboard-panel)',
  border: '1px solid var(--dashboard-line)',
  borderRadius: '10px',
  color: 'var(--foreground)',
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<number>(30);
  const [loadError, setLoadError] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);
  const locale = useLocale();
  const t = useTranslations('dashboard.analytics');

  const fetchAnalytics = useCallback(async () => {
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;

    try {
      setLoading(true);
      setLoadError(false);
      const response = await fetch(`/api/analytics/dashboard?days=${timeRange}`, {
        signal: controller.signal,
      });
      const data = await response.json();

      if (!response.ok || !data.success) throw new Error('Analytics unavailable');
      if (!controller.signal.aborted) setAnalytics(data.analytics);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setLoadError(true);
    } finally {
      if (activeRequest.current === controller) setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
    return () => activeRequest.current?.abort();
  }, [fetchAnalytics]);

  if (loading) return <DashboardLoading />;

  if (loadError) {
    return (
      <DashboardPage className="dashboard-analytics-page">
        <DashboardHeader title={t('dashboard')} />
        <DashboardLoadError onRetry={fetchAnalytics} />
      </DashboardPage>
    );
  }

  if (!analytics) {
    return (
      <DashboardPage className="dashboard-analytics-page">
        <DashboardHeader title={t('dashboard')} />
        <EmptyState icon={TrendingUp} title={t('title')} description={t('noData')} />
      </DashboardPage>
    );
  }

  const { overview, dailyStats, topPortfolioItems, recentViews } = analytics;
  const comparison = analytics.period?.comparison;
  const hasTrendData =
    recentViews.length > 0 ||
    dailyStats.some((stat) =>
      stat.views + stat.uniqueViews + stat.portfolioViews + stat.searchImpressions + stat.searchClicks > 0,
    );
  const hasPublishedMedia = topPortfolioItems.length > 0;
  const hasAnySignals = hasTrendData || topPortfolioItems.length > 0 || overview.totalViews > 0 || overview.totalPortfolioViews > 0 || overview.searchImpressions > 0 || overview.totalLikes > 0;
  const numberFormatter = new Intl.NumberFormat(locale);
  const shortDateFormatter = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' });
  const dateTimeFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const formatDelta = (value: number) => `${value > 0 ? '+' : ''}${numberFormatter.format(value)}`;

  if (!hasAnySignals) {
    return (
      <DashboardPage className="dashboard-analytics-page">
        <DashboardHeader
          icon={TrendingUp}
          title={t('dashboard')}
          description="How profile discovery turns into attention for your media."
          actions={
            <SegmentedControl
              value={String(timeRange)}
              onChange={(value) => setTimeRange(Number(value))}
              options={[
                { value: '7', label: t('days7') },
                { value: '30', label: t('days30') },
                { value: '90', label: t('days90') },
              ]}
            />
          }
        />
        <section className="analytics-first-signal" aria-labelledby="first-signal-title">
          <div className="analytics-first-signal-index">
            <TrendingUp className="h-7 w-7" aria-hidden="true" />
            <span>3YESES / SIGNALS</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">Start your discovery trail</p>
            <h2 id="first-signal-title" className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">Build the profile people remember.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">Insights begin when your public 3YESES profile has something worth opening. Shape the introduction, lead with your strongest media, then return here to see what earns attention.</p>

            <ol className="mt-7 grid border-y border-[color:var(--dashboard-line)] sm:grid-cols-3" aria-label="Steps to start collecting profile insights">
              {[
                ['01', 'Shape the profile', 'Make your role, location, and introduction easy to understand.'],
                ['02', 'Lead with media', 'Publish the work that best represents what you do now.'],
                ['03', 'Read the signals', 'Views, discovery, and media opens will build your trail here.'],
              ].map(([step, title, description]) => (
                <li key={step} className="border-b border-[color:var(--dashboard-line)] py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0 sm:last:pr-0">
                  <p className="tabular-nums text-xs font-semibold text-[color:var(--brand-primary)]">{step}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-wrap gap-3">
              <DashboardButton href={buildLocalizedPath(locale, '/dashboard/profile')}>Shape my profile</DashboardButton>
              <DashboardButton href={buildLocalizedPath(locale, '/dashboard/gallery')} variant="secondary">Publish media</DashboardButton>
            </div>
          </div>
        </section>
      </DashboardPage>
    );
  }

  const viewsChartData = dailyStats.map((stat) => ({
    date: shortDateFormatter.format(new Date(stat.date)),
    [t('chartTotalViews')]: stat.views,
    [t('chartUniqueViews')]: stat.uniqueViews,
  }));

  const portfolioViewsData = dailyStats.map((stat) => ({
    date: shortDateFormatter.format(new Date(stat.date)),
    [t('chartPortfolioViews')]: stat.portfolioViews,
  }));

  const searchData = dailyStats.map((stat) => ({
    date: shortDateFormatter.format(new Date(stat.date)),
    [t('chartImpressions')]: stat.searchImpressions,
    [t('chartClicks')]: stat.searchClicks,
  }));

  return (
    <DashboardPage className="dashboard-analytics-page">
      <DashboardHeader
        icon={TrendingUp}
        title={t('dashboard')}
        description="How profile discovery turns into attention for your media."
        actions={
          <SegmentedControl
            value={String(timeRange)}
            onChange={(value) => setTimeRange(Number(value))}
            options={[
              { value: '7', label: t('days7') },
              { value: '30', label: t('days30') },
              { value: '90', label: t('days90') },
            ]}
          />
        }
      />

      <section
        aria-labelledby="exposure-summary-heading"
        className="mb-8 grid overflow-hidden border-y border-[color:var(--dashboard-line)] bg-[color:var(--dashboard-panel)] lg:grid-cols-[1.35fr_1fr]"
      >
        <div className="border-b border-[color:var(--dashboard-line)] p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <p id="exposure-summary-heading" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Profile reach / {timeRange} days
          </p>
          <div className="mt-8 flex flex-wrap items-end gap-x-5 gap-y-3">
            <p className="tabular-nums text-6xl font-semibold leading-none text-slate-950 dark:text-white sm:text-7xl">
              {numberFormatter.format(overview.totalViews)}
            </p>
            <div className="pb-1">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">{t('totalViews')}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t('uniqueViewers', { count: overview.uniqueViewers })}
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-[color:var(--dashboard-line)] pt-4 text-sm">
            <p className="font-semibold text-[color:var(--brand-primary)]">
              {comparison ? `${formatDelta(comparison.profileViewsDelta)} vs previous window` : 'Comparison pending'}
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              {numberFormatter.format(overview.lifetime?.totalViews ?? overview.totalViews)} lifetime views
            </p>
          </div>
        </div>

        <dl className="grid sm:grid-cols-3 lg:grid-cols-1">
          {[
            {
              label: t('portfolioViews'),
              value: numberFormatter.format(overview.totalPortfolioViews),
              detail: t('engagementRate', { rate: overview.engagementRate }),
              icon: ImageIcon,
            },
            {
              label: t('searchPerformance'),
              value: numberFormatter.format(overview.searchImpressions),
              detail: t('ctr', { rate: overview.searchCTR.toFixed(1), clicks: overview.searchClicks }),
              icon: Search,
            },
            {
              label: 'Profile likes',
              value: numberFormatter.format(overview.totalLikes),
              detail: 'Lifetime appreciation',
              icon: Heart,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex min-h-28 items-center gap-4 border-b border-[color:var(--dashboard-line)] p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b lg:border-r-0 lg:last:border-b-0"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--brand-primary)]/10 text-[color:var(--brand-primary)]">
                <item.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{item.label}</dt>
                <dd className="mt-1 tabular-nums text-2xl font-semibold text-slate-950 dark:text-white">{item.value}</dd>
                <dd className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{item.detail}</dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      {!hasTrendData ? (
        <section className="mb-8 grid min-h-64 items-center gap-6 border-y border-[color:var(--dashboard-line)] py-8 md:grid-cols-[0.7fr_1.3fr]" aria-labelledby="quiet-window-heading">
          <div className="flex min-h-36 items-center justify-center md:border-r md:border-[color:var(--dashboard-line)]">
            <div className="border-l-2 border-[color:var(--brand-primary)] pl-5">
              <p className="tabular-nums text-6xl font-semibold leading-none text-slate-950 dark:text-white">00</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">Window signals</p>
            </div>
          </div>
          <div className="px-5 text-center md:px-10 md:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">{hasPublishedMedia ? 'Gallery live / window quiet' : 'Early signal / next move'}</p>
            <h2 id="quiet-window-heading" className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
              {hasPublishedMedia ? 'Your media is ready. Discovery is the next move.' : 'Attention has started. Give it somewhere to go.'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {hasPublishedMedia
                ? `No profile activity reached this ${timeRange}-day window yet. Keep the profile introduction current and the gallery led by work you want people to remember.`
                : 'Your profile has an early sign of interest, but no current activity trail. Add a focused piece of media so the next visitor has something to open and remember.'}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
              <DashboardButton href={buildLocalizedPath(locale, '/dashboard/gallery')} variant="secondary">{hasPublishedMedia ? 'Refresh gallery' : 'Publish media'}</DashboardButton>
              <DashboardButton href={buildLocalizedPath(locale, '/dashboard/profile')} variant="ghost">Refine profile</DashboardButton>
            </div>
          </div>
        </section>
      ) : (
        <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.75fr)]">
          <DashboardPanel className="min-w-0">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-primary)]">Reach over time</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">{t('profileViewsTrend')}</h2>
              </div>
              <TrendingUp className="h-5 w-5 text-[color:var(--brand-primary)]" aria-hidden="true" />
            </div>
            <div role="group" aria-label={`${t('profileViewsTrend')} for the last ${timeRange} days`} className="h-80 w-full text-slate-500 dark:text-slate-400">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={viewsChartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} accessibilityLayer>
                  <CartesianGrid stroke={chartGrid} vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} minTickGap={32} />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} width={40} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--foreground)' }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                  <Line type="monotone" dataKey={t('chartTotalViews')} stroke="var(--dashboard-chart-primary)" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey={t('chartUniqueViews')} stroke="var(--dashboard-chart-secondary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </DashboardPanel>

          <div className="grid gap-6">
            <DashboardPanel className="min-w-0">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-950 dark:text-white">{t('portfolioEngagement')}</h2>
                <ImageIcon className="h-4 w-4 text-[color:var(--dashboard-chart-secondary)]" aria-hidden="true" />
              </div>
              <div role="group" aria-label={`${t('portfolioEngagement')} for the last ${timeRange} days`} className="h-36 w-full text-slate-500 dark:text-slate-400">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={portfolioViewsData} margin={{ top: 4, right: 0, left: -8, bottom: 0 }} accessibilityLayer>
                    <CartesianGrid stroke={chartGrid} vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} minTickGap={36} />
                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} width={36} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--foreground)' }} />
                    <Bar dataKey={t('chartPortfolioViews')} fill="var(--dashboard-chart-secondary)" radius={[6, 6, 2, 2]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </DashboardPanel>

            <DashboardPanel className="min-w-0">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-950 dark:text-white">{t('searchPerformance')}</h2>
                <Search className="h-4 w-4 text-[color:var(--dashboard-chart-highlight)]" aria-hidden="true" />
              </div>
              <div role="group" aria-label={`${t('searchPerformance')} for the last ${timeRange} days`} className="h-36 w-full text-slate-500 dark:text-slate-400">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={searchData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }} accessibilityLayer>
                    <CartesianGrid stroke={chartGrid} vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} minTickGap={36} />
                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} width={40} />
                    <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--foreground)' }} />
                    <Line type="monotone" dataKey={t('chartImpressions')} stroke="var(--dashboard-chart-tertiary)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey={t('chartClicks')} stroke="var(--dashboard-chart-highlight)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </DashboardPanel>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <DashboardPanel className="overflow-hidden">
          <div className="mb-5 flex items-center justify-between gap-4 border-b border-[color:var(--dashboard-line)] pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-primary)]">Media ranking</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{t('topPortfolioItems')}</h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Lifetime views</span>
          </div>
          {topPortfolioItems.length > 0 ? (
            <ol className="divide-y divide-[color:var(--dashboard-line)]">
              {topPortfolioItems.map((item, index) => {
                const mediaPreview = item.thumbnail || (item.type.toUpperCase() === 'IMAGE' ? item.mediaUrl : null);
                return (
                  <li key={item.id} className="grid grid-cols-[2rem_3.5rem_minmax(0,1fr)_auto] items-center gap-3 py-3">
                    <span className="tabular-nums text-sm font-semibold text-slate-400 dark:text-slate-500">{String(index + 1).padStart(2, '0')}</span>
                    {mediaPreview ? (
                      <div
                        role="img"
                        aria-label={`${item.title} preview`}
                        className="h-14 w-14 rounded-lg bg-slate-100 bg-cover bg-center dark:bg-neutral-800"
                        style={{ backgroundImage: `url(${mediaPreview})` }}
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-neutral-800 dark:text-slate-500">
                        <ImageIcon className="h-5 w-5" aria-hidden="true" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{item.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">{item.type}</p>
                    </div>
                    <div className="flex items-center gap-1.5 tabular-nums text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <Eye className="h-4 w-4 text-[color:var(--brand-primary)]" aria-hidden="true" />
                      {numberFormatter.format(item._count.views)}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <EmptyState
              icon={ImageIcon}
              title="No media to rank yet"
              description="Publish a focused gallery on 3YESES. Once people open your work, this space will show which media holds their attention."
              action={<DashboardButton href={buildLocalizedPath(locale, '/dashboard/gallery')} variant="secondary">Publish media</DashboardButton>}
            />
          )}
        </DashboardPanel>

        <DashboardPanel>
          <div className="mb-5 flex items-center justify-between gap-4 border-b border-[color:var(--dashboard-line)] pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-primary)]">Audience trail</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{t('recentProfileViews')}</h2>
            </div>
            <Users className="h-5 w-5 text-[color:var(--brand-primary)]" aria-hidden="true" />
          </div>
          {recentViews.length > 0 ? (
            <ul className="divide-y divide-[color:var(--dashboard-line)]">
              {recentViews.map((view) => {
                const avatarUrl = view.viewer?.talentProfile?.avatarUrl;
                const viewerName = view.viewer?.name || t('anonymous');
                return (
                  <li key={view.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {avatarUrl ? (
                        <Image src={avatarUrl} alt="" width={40} height={40} unoptimized className="h-10 w-10 shrink-0 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-primary)]/10 text-sm font-semibold text-[color:var(--brand-primary)]" aria-hidden="true">
                          {viewerName.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{viewerName}</p>
                    </div>
                    <time dateTime={view.createdAt} className="shrink-0 text-right text-xs text-slate-500 dark:text-slate-400">
                      {dateTimeFormatter.format(new Date(view.createdAt))}
                    </time>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              icon={Users}
              title="No profile visitor trail yet"
              description="Search appearances can arrive before a profile open. Visitor activity will appear here when someone steps into your public profile."
              action={<DashboardButton href={buildLocalizedPath(locale, '/dashboard/profile')} variant="ghost">Polish profile</DashboardButton>}
            />
          )}
        </DashboardPanel>
      </div>
    </DashboardPage>
  );
}
