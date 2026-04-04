'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Briefcase, 
  TrendingUp,
  Activity,
  Eye,
  CheckCircle,
  FileText,
  AlertTriangle,
  ArrowRight,
  Cpu,
  HardDrive,
  Database,
  Server,
  MapPin,
  Heart,
  Shield,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { formatAdminDate } from '@/lib/admin/formatters';

interface DashboardStats {
  totalUsers: number;
  totalTalent: number;
  adminCount: number;
  totalProfiles: number;
  completeProfiles: number;
  totalCategories: number;
  totalSubcategories: number;
  totalViews: number;
  totalLikes: number;
  pendingReports: number;
}

interface SystemHealth {
  cpuLoad: number;
  memoryUsage: number;
  dbLatency: number;
  status: string;
  version: string;
  nodeVersion: string;
  platform: string;
  uptime: number;
}

interface TopLocation {
  location: string;
  count: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'other';
  message: string;
  timestamp: Date;
  status?: 'success' | 'warning' | 'error';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [topLocations, setTopLocations] = useState<TopLocation[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (isRetry = false) => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        credentials: 'include',
        cache: 'no-store'
      });
      
      const data = await response.json();
      
      if (response.status === 401 && !isRetry) {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        });
        
        if (refreshResponse.ok) {
          return fetchDashboardData(true);
        }
      }

      if (data.success) {
        setStats(data.stats);
        setSystemHealth(data.systemHealth);
        setTopLocations(data.topLocations || []);
        setRecentActivity(data.recentActivity || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      if (!isRetry) setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[var(--admin-primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-[var(--admin-muted)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      subtitle: `${stats?.adminCount || 0} admins`,
      icon: Users,
      link: '/admin/users',
      color: 'text-blue-500',
    },
    {
      title: 'Total Views',
      value: (stats?.totalViews || 0).toLocaleString(),
      subtitle: `${(stats?.totalLikes || 0).toLocaleString()} likes`,
      icon: Eye,
      link: '/admin/analytics',
      color: 'text-purple-500',
    },
    {
      title: 'Categories',
      value: stats?.totalCategories || 0,
      subtitle: `${stats?.totalSubcategories || 0} subcategories`,
      icon: Briefcase,
      link: '/admin/categories',
      color: 'text-amber-500',
    },
    {
      title: 'Pending Reports',
      value: stats?.pendingReports || 0,
      subtitle: 'Requires review',
      icon: AlertTriangle,
      link: '/admin/reports',
      color: stats?.pendingReports && stats.pendingReports > 0 ? 'text-red-500' : 'text-emerald-500',
    },
  ];

  const quickActions = [
    { name: 'Add New User', href: '/admin/users/new', icon: Users, description: 'Create a new user or talent account' },
    { name: 'Manage Categories', href: '/admin/categories', icon: Briefcase, description: 'Edit platform categories' },
    { name: 'View Reports', href: '/admin/reports', icon: AlertTriangle, description: 'Review flagged content' },
    { name: 'System Settings', href: '/admin/settings', icon: FileText, description: 'Configure platform settings' },
  ];

  const getStatusColor = (value: number, thresholds: [number, number] = [50, 80]) => {
    if (value < thresholds[0]) return { color: 'text-emerald-500', bg: 'bg-emerald-500', label: 'Healthy' };
    if (value < thresholds[1]) return { color: 'text-amber-500', bg: 'bg-amber-500', label: 'Warning' };
    return { color: 'text-red-500', bg: 'bg-red-500', label: 'Critical' };
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--admin-text)]">
          Dashboard Overview
        </h1>
        <p className="text-[var(--admin-muted)] mt-1">
          Welcome back. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              href={stat.link}
              className="group relative p-6 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]/40 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-[var(--admin-primary)]/30 hover:shadow-[0_0_30px_-10px_var(--admin-primary)] hover:translate-y-[-2px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--admin-primary)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--admin-primary)]/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-[var(--admin-primary)]/10" />

              <div className="relative z-10 flex items-start justify-between mb-6">
                <div className={`p-3 bg-[var(--admin-bg)]/80 backdrop-blur-md rounded-xl border border-[var(--admin-border)] shadow-sm group-hover:border-[var(--admin-primary)]/30 group-hover:scale-110 transition-all duration-300 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium text-[var(--admin-muted)] bg-[var(--admin-bg)] px-2 py-1 rounded-full border border-[var(--admin-border)]">
                  {stat.subtitle}
                </span>
              </div>

              <div className="relative z-10">
                <h3 className="text-4xl font-black text-[var(--admin-text)] mb-1 tracking-tighter tabular-nums group-hover:text-[var(--admin-primary)] transition-colors duration-300">
                  {stat.value}
                </h3>
                <p className="text-xs font-semibold text-[var(--admin-muted)] uppercase tracking-[0.15em] opacity-70 group-hover:opacity-100 transition-opacity">{stat.title}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]/30 backdrop-blur-md overflow-hidden flex flex-col shadow-sm">
            <div className="p-6 border-b border-[var(--admin-border)] flex items-center justify-between bg-[var(--admin-surface)]/40">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--admin-primary)]/10 rounded-lg border border-[var(--admin-primary)]/20">
                        <Activity className="h-4 w-4 text-[var(--admin-primary)]" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-[var(--admin-text)] uppercase tracking-wider">Live Activity</h2>
                        <p className="text-[10px] text-[var(--admin-muted)] font-medium">Real-time system updates</p>
                    </div>
                </div>
                <Link href="/admin/system" className="px-3 py-1.5 text-[10px] font-bold text-[var(--admin-primary)] bg-[var(--admin-primary)]/5 border border-[var(--admin-primary)]/20 rounded-full uppercase tracking-widest hover:bg-[var(--admin-primary)]/10 transition-colors">View All</Link>
            </div>
            <div className="divide-y divide-[var(--admin-border)]/50">
                {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="p-5 flex items-start gap-4 hover:bg-[var(--admin-surface)]/60 transition-colors group relative">
                         <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--admin-primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="mt-0.5">
                            <div className="w-9 h-9 rounded-lg bg-[var(--admin-bg)] flex items-center justify-center border border-[var(--admin-border)] group-hover:border-[var(--admin-primary)]/40 group-hover:shadow-[0_0_10px_-3px_var(--admin-primary)] transition-all">
                                {activity.type === 'user' ? (
                                    <Users className="h-4 w-4 text-[var(--admin-muted)] group-hover:text-[var(--admin-primary)] transition-colors" />
                                ) : (
                                    <Activity className="h-4 w-4 text-[var(--admin-muted)] group-hover:text-[var(--admin-primary)] transition-colors" />
                                )}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <p className="text-sm font-medium text-[var(--admin-text)] truncate">{activity.message}</p>
                                <span className="text-[10px] font-mono text-[var(--admin-muted)] opacity-70 whitespace-nowrap px-2 py-0.5 rounded bg-[var(--admin-bg)] border border-[var(--admin-border)]">
                                    {formatAdminDate(activity.timestamp)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${activity.status === 'error' ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' : activity.status === 'warning' ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]'}`} />
                                <span className="text-xs text-[var(--admin-muted)] uppercase tracking-wide opacity-80">{activity.type}</span>
                            </div>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="p-16 flex flex-col items-center justify-center text-center opacity-60">
                         <div className="w-16 h-16 rounded-2xl bg-[var(--admin-surface)] border border-[var(--admin-border)] flex items-center justify-center mb-4 rotate-3">
                            <Activity className="h-8 w-8 text-[var(--admin-muted)]" />
                        </div>
                        <h3 className="text-sm font-bold text-[var(--admin-text)] uppercase tracking-wide">No Activity</h3>
                        <p className="text-xs text-[var(--admin-muted)] mt-1">System is quiet for now</p>
                    </div>
                )}
            </div>
        </div>

        {/* Quick Actions & System Health */}
        <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]/30 backdrop-blur-md overflow-hidden">
                <div className="p-5 border-b border-[var(--admin-border)] bg-[var(--admin-surface)]/40 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[var(--admin-text)] uppercase tracking-wider">Quick Actions</h2>
                    <span className="text-[10px] bg-[var(--admin-bg)] border border-[var(--admin-border)] px-2 py-0.5 rounded text-[var(--admin-muted)]">COMMANDS</span>
                </div>
                <div className="p-3 grid grid-cols-1 gap-2">
                    {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={index}
                                href={action.href}
                                className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--admin-surface)]/80 border border-transparent hover:border-[var(--admin-border)] transition-all group relative overflow-hidden"
                            >
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-[var(--admin-primary)] translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                                <div className="p-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-[var(--admin-muted)] group-hover:text-[var(--admin-primary)] group-hover:border-[var(--admin-primary)]/40 group-hover:shadow-[0_0_10px_-3px_var(--admin-primary)] transition-all">
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-bold text-[var(--admin-text)] group-hover:text-[var(--admin-primary)] transition-colors">{action.name}</div>
                                        <ArrowRight className="h-3 w-3 text-[var(--admin-muted)] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                    </div>
                                    <div className="text-[11px] text-[var(--admin-muted)] opacity-80">{action.description}</div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* System Health - Real Data */}
            <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]/30 backdrop-blur-md p-6 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-[var(--admin-primary)]/5 rounded-full blur-3xl" />
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <h2 className="text-sm font-bold text-[var(--admin-text)] uppercase tracking-wider flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)] ${
                          systemHealth?.status === 'Optimal' ? 'bg-green-500' : 
                          systemHealth?.status === 'Warning' ? 'bg-amber-500' : 'bg-red-500'
                        }`}></span>
                        System Health
                    </h2>
                    <Link href="/admin/system" className="text-[10px] font-bold text-[var(--admin-primary)] hover:underline uppercase tracking-wider">
                      Details
                    </Link>
                </div>

                {systemHealth && (
                  <div className="space-y-5 relative z-10">
                    {/* CPU Load */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide">
                            <span className="text-[var(--admin-muted)] flex items-center gap-1.5">
                              <Cpu className="h-3 w-3" /> CPU Load
                            </span>
                            <span className={`${getStatusColor(systemHealth.cpuLoad).color} flex items-center gap-1.5`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(systemHealth.cpuLoad).bg}`}></span>
                                {systemHealth.cpuLoad}%
                            </span>
                        </div>
                        <div className="w-full h-1 bg-[var(--admin-bg)] rounded-full overflow-hidden">
                            <div className={`h-full ${getStatusColor(systemHealth.cpuLoad).bg} rounded-full transition-all duration-500`} style={{ width: `${systemHealth.cpuLoad}%` }}></div>
                        </div>
                    </div>

                    {/* Memory */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide">
                            <span className="text-[var(--admin-muted)] flex items-center gap-1.5">
                              <HardDrive className="h-3 w-3" /> Memory
                            </span>
                            <span className={`${getStatusColor(systemHealth.memoryUsage, [60, 85]).color} flex items-center gap-1.5`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(systemHealth.memoryUsage, [60, 85]).bg}`}></span>
                                {systemHealth.memoryUsage}%
                            </span>
                        </div>
                        <div className="w-full h-1 bg-[var(--admin-bg)] rounded-full overflow-hidden">
                            <div className={`h-full ${getStatusColor(systemHealth.memoryUsage, [60, 85]).bg} rounded-full transition-all duration-500`} style={{ width: `${systemHealth.memoryUsage}%` }}></div>
                        </div>
                    </div>

                    {/* Database */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide">
                            <span className="text-[var(--admin-muted)] flex items-center gap-1.5">
                              <Database className="h-3 w-3" /> Database
                            </span>
                            <span className={`${getStatusColor(systemHealth.dbLatency, [100, 500]).color} font-mono`}>
                                {systemHealth.dbLatency}ms
                            </span>
                        </div>
                        <div className="w-full h-1 bg-[var(--admin-bg)] rounded-full overflow-hidden">
                            <div className={`h-full ${getStatusColor(systemHealth.dbLatency, [100, 500]).bg} rounded-full`} style={{ width: `${Math.min(100, (systemHealth.dbLatency / 500) * 100)}%` }}></div>
                        </div>
                    </div>

                    {/* Footer info */}
                    <div className="pt-3 border-t border-[var(--admin-border)]/50 flex items-center justify-between text-[10px] text-[var(--admin-muted)]">
                      <span className="font-mono">{systemHealth.version}</span>
                      <span>{systemHealth.nodeVersion} &middot; {systemHealth.uptime}h uptime</span>
                    </div>
                  </div>
                )}
            </div>

        </div>
      </div>

      {/* Geo Distribution */}
      {topLocations.length > 0 && (
        <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]/30 backdrop-blur-md overflow-hidden">
          <div className="p-5 border-b border-[var(--admin-border)] bg-[var(--admin-surface)]/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--admin-primary)]/10 rounded-lg border border-[var(--admin-primary)]/20">
                <MapPin className="h-4 w-4 text-[var(--admin-primary)]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[var(--admin-text)] uppercase tracking-wider">Talent Locations</h2>
                <p className="text-[10px] text-[var(--admin-muted)] font-medium">Top locations of talent profiles</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {topLocations.map((loc, i) => (
                <div key={i} className="bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg p-3 text-center hover:border-[var(--admin-primary)]/30 transition-colors">
                  <p className="text-lg font-black text-[var(--admin-text)] tabular-nums">{loc.count}</p>
                  <p className="text-[10px] text-[var(--admin-muted)] font-medium uppercase tracking-wider truncate" title={loc.location}>{loc.location}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
