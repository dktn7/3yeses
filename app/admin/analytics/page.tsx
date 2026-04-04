"use client";

import { useEffect, useState, useCallback } from "react";
import {
  TrendingUp,
  Users,
  Activity,
  Eye,
  Heart,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

interface AnalyticsData {
  userGrowth: { month: string; users: number }[];
  profileGrowth: { month: string; profiles: number }[];
  topCategories: { name: string; count: number }[];
  topTalent: { name: string; views: number; likes: number }[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        toast.error("Failed to load analytics data");
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Compute totals from real data
  const totalUsers = analytics?.userGrowth.reduce((sum, d) => sum + d.users, 0) || 0;
  const totalProfiles = analytics?.profileGrowth.reduce((sum, d) => sum + d.profiles, 0) || 0;
  const totalViews = analytics?.topTalent.reduce((sum, t) => sum + t.views, 0) || 0;
  const totalLikes = analytics?.topTalent.reduce((sum, t) => sum + t.likes, 0) || 0;

  // Max category count for progress bars
  const maxCategoryCount = analytics?.topCategories.length
    ? Math.max(...analytics.topCategories.map(c => c.count))
    : 1;

  const selectClass =
    "px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm font-bold text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)] appearance-none cursor-pointer";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-[var(--admin-primary)]" size={32} />
          <span className="text-[var(--admin-muted)] font-medium animate-pulse">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--admin-text)] tracking-tight">Platform Analytics</h1>
          <p className="text-[var(--admin-muted)] mt-1 font-medium">Real-time insights from your platform data</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={selectClass}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-sm font-bold text-[var(--admin-text)] hover:border-[var(--admin-primary)]/50 transition-all"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { title: "New Users", value: totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "New Profiles", value: totalProfiles, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Total Views", value: totalViews, icon: Eye, color: "text-purple-500", bg: "bg-purple-500/10" },
          { title: "Total Likes", value: totalLikes, icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className="bg-[var(--admin-surface)] border border-[var(--admin-border)] p-6 rounded-xl relative overflow-hidden group hover:shadow-lg hover:border-[var(--admin-primary)]/30 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-lg ${metric.bg}`}>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
              </div>
              <h3 className="text-3xl font-black text-[var(--admin-text)] mb-1">
                {metric.value.toLocaleString()}
              </h3>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--admin-muted)]">{metric.title}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[var(--admin-text)]">User Growth</h2>
            <TrendingUp className="h-5 w-5 text-[var(--admin-muted)]" />
          </div>
          <div className="h-64">
            {analytics?.userGrowth && analytics.userGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.userGrowth} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--admin-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--admin-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--admin-muted)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--admin-muted)" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--admin-surface)",
                      border: "1px solid var(--admin-border)",
                      borderRadius: "8px",
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="users" stroke="var(--admin-primary)" fillOpacity={1} fill="url(#userGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[var(--admin-muted)]">
                <p className="font-medium">No user growth data for this period</p>
              </div>
            )}
          </div>
        </div>

        {/* Profile Growth Chart */}
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[var(--admin-text)]">Profile Growth</h2>
            <Activity className="h-5 w-5 text-[var(--admin-muted)]" />
          </div>
          <div className="h-64">
            {analytics?.profileGrowth && analytics.profileGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.profileGrowth} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--admin-muted)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--admin-muted)" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--admin-surface)",
                      border: "1px solid var(--admin-border)",
                      borderRadius: "8px",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="profiles" fill="var(--admin-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[var(--admin-muted)]">
                <p className="font-medium">No profile data for this period</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-6">
          <h2 className="text-lg font-bold text-[var(--admin-text)] mb-4">Top Categories</h2>
          <div className="space-y-3">
            {analytics?.topCategories && analytics.topCategories.length > 0 ? (
              analytics.topCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[var(--admin-bg)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-[var(--admin-muted)] w-5">{index + 1}</span>
                    <span className="text-sm font-bold text-[var(--admin-text)]">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-[var(--admin-surface)] rounded-full h-2">
                      <div
                        className="bg-[var(--admin-primary)] h-2 rounded-full transition-all"
                        style={{ width: `${(category.count / maxCategoryCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-[var(--admin-muted)] w-10 text-right">{category.count}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[var(--admin-muted)]">
                <p className="font-medium">No category data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Talent */}
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-6">
          <h2 className="text-lg font-bold text-[var(--admin-text)] mb-4">Top Performing Talent</h2>
          <div className="space-y-3">
            {analytics?.topTalent && analytics.topTalent.length > 0 ? (
              analytics.topTalent.map((talent, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[var(--admin-bg)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-[var(--admin-primary)]/10 rounded-full flex items-center justify-center border border-[var(--admin-border)]">
                      <span className="text-[var(--admin-primary)] text-xs font-black">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--admin-text)]">{talent.name}</p>
                      <p className="text-xs text-[var(--admin-muted)]">
                        <Eye className="inline h-3 w-3 mr-0.5" />
                        {talent.views.toLocaleString()} views
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {talent.likes.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[var(--admin-muted)]">
                <p className="font-medium">No talent data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
