'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line
} from 'recharts';
import {
  Activity, Clock, Database, Cpu, HardDrive, Server, Users,
  Zap, AlertTriangle, Globe, MemoryStick, Gauge
} from 'lucide-react';

// Types from API
interface ChartDataPoint {
  time: string;
  value: number;
}

interface SystemInfo {
  nodeVersion: string;
  platform: string;
  arch: string;
  hostname: string;
  cpuModel: string;
  cpuCount: number;
  cpuLoadPercent: number;
  loadAverage: number[];
  memoryUsedPercent: number;
  totalMemoryGB: number;
  freeMemoryGB: number;
  heapUsedMB: number;
  heapTotalMB: number;
  rssMB: number;
  processUptime: number;
  osUptime: number;
}

interface DatabaseInfo {
  totalUsers: number;
  totalProfiles: number;
  status: string;
  latency: number;
}

interface SystemMetrics {
  summary: {
    uptime: number;
    avgLatency: number;
    activeUsers: number;
    dbStatus: string;
    dbLatency: number;
    totalRequests: number;
    totalErrors: number;
    errorRate: number;
  };
  system: SystemInfo;
  database: DatabaseInfo;
  charts: {
    traffic: ChartDataPoint[];
    latency: ChartDataPoint[];
    errors: ChartDataPoint[];
  };
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function getStatusColor(value: number, thresholds: [number, number] = [60, 85]): string {
  if (value < thresholds[0]) return 'text-emerald-500';
  if (value < thresholds[1]) return 'text-amber-500';
  return 'text-red-500';
}

function getBarColor(value: number, thresholds: [number, number] = [60, 85]): string {
  if (value < thresholds[0]) return 'bg-emerald-500';
  if (value < thresholds[1]) return 'bg-amber-500';
  return 'bg-red-500';
}

export default function SystemDashboardPage() {
  const [range, setRange] = useState<'1h' | '24h' | '7d'>('24h');
  const [isLive, setIsLive] = useState(false);

  const { data, error, isLoading } = useSWR<SystemMetrics>(
    `/api/admin/system/metrics?range=${range}`,
    fetcher,
    {
      refreshInterval: isLive ? 5000 : 0,
      revalidateOnFocus: false
    }
  );

  if (error) return (
    <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/30">
      <AlertTriangle className="mx-auto mb-2" size={32} />
      <h3 className="text-lg font-bold">Error loading metrics</h3>
      <p className="text-sm mt-1">Please check your connection or try again later.</p>
    </div>
  );

  const metrics = data?.summary;
  const sysInfo = data?.system;
  const dbInfo = data?.database;
  const charts = data?.charts;

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--admin-text)] tracking-tight">System Monitor</h1>
          <p className="text-[var(--admin-muted)] mt-1 font-medium">Real-time infrastructure health and analytics</p>
        </div>

        <div className="flex items-center gap-3 bg-[var(--admin-surface)] p-2 rounded-lg border border-[var(--admin-border)]">
          <div className="flex bg-[var(--admin-bg)] rounded-md p-1 border border-[var(--admin-border)]">
            {(['1h', '24h', '7d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-sm rounded-md font-bold transition-colors ${
                  range === r
                    ? 'bg-[var(--admin-primary)] text-white shadow-sm'
                    : 'text-[var(--admin-muted)] hover:text-[var(--admin-text)]'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-[var(--admin-border)]" />
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${
              isLive
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'bg-[var(--admin-bg)] text-[var(--admin-muted)] border border-[var(--admin-border)] hover:text-[var(--admin-text)]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
            Live
          </button>
        </div>
      </div>

      {isLoading && !data ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)]" />
          ))}
        </div>
      ) : (
        <>
          {/* ═══ Top Metric Cards ═══ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              icon={<Activity size={18} />}
              title="Success Rate"
              value={`${metrics?.uptime ?? 100}%`}
              subtitle="API uptime"
              color="emerald"
              index={0}
            />
            <MetricCard
              icon={<Zap size={18} />}
              title="Avg Latency"
              value={`${metrics?.avgLatency ?? 0}ms`}
              subtitle="P95 response"
              color={metrics?.avgLatency && metrics.avgLatency > 200 ? "amber" : "blue"}
              index={1}
              pulse={!!metrics?.avgLatency && metrics.avgLatency > 500}
            />
            <MetricCard
              icon={<Users size={18} />}
              title="Active Sessions"
              value={metrics?.activeUsers?.toString() ?? "0"}
              subtitle="Last 15 min"
              color="purple"
              index={2}
            />
            <MetricCard
              icon={<Database size={18} />}
              title="DB Health"
              value={metrics?.dbStatus ?? "Unknown"}
              subtitle={`${metrics?.dbLatency ?? 0}ms latency`}
              color={metrics?.dbStatus === 'Healthy' ? "emerald" : metrics?.dbStatus === 'Degraded' ? "amber" : "red"}
              index={3}
              pulse={metrics?.dbStatus !== 'Healthy'}
            />
          </div>

          {/* ═══ System Resources ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CPU & Memory Gauges */}
            <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5">
              <h3 className="text-sm font-black uppercase tracking-wider text-[var(--admin-muted)] mb-4 flex items-center gap-2">
                <Cpu size={14} />
                CPU & Memory
              </h3>
              <div className="space-y-5">
                {/* CPU Load */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-bold text-[var(--admin-text)]">CPU Load</span>
                    <span className={`text-sm font-black ${getStatusColor(sysInfo?.cpuLoadPercent ?? 0)}`}>
                      {sysInfo?.cpuLoadPercent ?? 0}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[var(--admin-bg)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getBarColor(sysInfo?.cpuLoadPercent ?? 0)}`}
                      style={{ width: `${sysInfo?.cpuLoadPercent ?? 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[var(--admin-muted)] mt-1">
                    Load avg: {sysInfo?.loadAverage?.join(' / ') ?? '0 / 0 / 0'} · {sysInfo?.cpuCount ?? 0} cores
                  </p>
                </div>

                {/* System Memory */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-bold text-[var(--admin-text)]">System Memory</span>
                    <span className={`text-sm font-black ${getStatusColor(sysInfo?.memoryUsedPercent ?? 0)}`}>
                      {sysInfo?.memoryUsedPercent ?? 0}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[var(--admin-bg)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getBarColor(sysInfo?.memoryUsedPercent ?? 0)}`}
                      style={{ width: `${sysInfo?.memoryUsedPercent ?? 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[var(--admin-muted)] mt-1">
                    {((sysInfo?.totalMemoryGB ?? 0) - (sysInfo?.freeMemoryGB ?? 0)).toFixed(1)} GB used of {sysInfo?.totalMemoryGB ?? 0} GB
                  </p>
                </div>

                {/* Node.js Heap */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-bold text-[var(--admin-text)]">Node.js Heap</span>
                    <span className="text-sm font-black text-[var(--admin-text)]">
                      {sysInfo?.heapUsedMB ?? 0} / {sysInfo?.heapTotalMB ?? 0} MB
                    </span>
                  </div>
                  <div className="w-full h-3 bg-[var(--admin-bg)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                        sysInfo?.heapTotalMB ? Math.round((sysInfo.heapUsedMB / sysInfo.heapTotalMB) * 100) : 0
                      )}`}
                      style={{ width: `${sysInfo?.heapTotalMB ? Math.round((sysInfo.heapUsedMB / sysInfo.heapTotalMB) * 100) : 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[var(--admin-muted)] mt-1">
                    RSS: {sysInfo?.rssMB ?? 0} MB
                  </p>
                </div>
              </div>
            </div>

            {/* Server Info */}
            <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5">
              <h3 className="text-sm font-black uppercase tracking-wider text-[var(--admin-muted)] mb-4 flex items-center gap-2">
                <Server size={14} />
                Server Information
              </h3>
              <div className="space-y-3">
                <InfoRow icon={<Globe size={14} />} label="Hostname" value={sysInfo?.hostname ?? 'Unknown'} />
                <InfoRow icon={<Server size={14} />} label="Platform" value={sysInfo?.platform ?? 'Unknown'} />
                <InfoRow icon={<Cpu size={14} />} label="Architecture" value={sysInfo?.arch ?? 'Unknown'} />
                <InfoRow icon={<Cpu size={14} />} label="CPU" value={sysInfo?.cpuModel ? `${sysInfo.cpuModel.substring(0, 40)}${sysInfo.cpuModel.length > 40 ? '...' : ''}` : 'Unknown'} />
                <InfoRow icon={<MemoryStick size={14} />} label="Node.js" value={sysInfo?.nodeVersion ?? 'Unknown'} />
                <InfoRow icon={<Clock size={14} />} label="Process Uptime" value={formatUptime(sysInfo?.processUptime ?? 0)} />
                <InfoRow icon={<Clock size={14} />} label="OS Uptime" value={formatUptime(sysInfo?.osUptime ?? 0)} />
                <InfoRow icon={<Database size={14} />} label="DB Users" value={dbInfo?.totalUsers?.toString() ?? '0'} />
                <InfoRow icon={<Users size={14} />} label="DB Profiles" value={dbInfo?.totalProfiles?.toString() ?? '0'} />
              </div>
            </div>
          </div>

          {/* ═══ Request Stats ═══ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              icon={<Gauge size={18} />}
              title="Total Requests"
              value={metrics?.totalRequests?.toLocaleString() ?? "0"}
              subtitle={`In ${range} window`}
              color="blue"
              index={4}
            />
            <MetricCard
              icon={<AlertTriangle size={18} />}
              title="Total Errors"
              value={metrics?.totalErrors?.toString() ?? "0"}
              subtitle={`${metrics?.errorRate ?? 0}% error rate`}
              color={metrics?.totalErrors && metrics.totalErrors > 0 ? "red" : "emerald"}
              index={5}
              pulse={!!metrics?.totalErrors && metrics.totalErrors > 0}
            />
            <MetricCard
              icon={<Database size={18} />}
              title="DB Latency"
              value={`${metrics?.dbLatency ?? 0}ms`}
              subtitle="Query time"
              color={metrics?.dbLatency && metrics.dbLatency > 100 ? "amber" : "emerald"}
              index={6}
            />
            <MetricCard
              icon={<HardDrive size={18} />}
              title="Memory RSS"
              value={`${sysInfo?.rssMB ?? 0} MB`}
              subtitle="Process memory"
              color="purple"
              index={7}
            />
          </div>

          {/* ═══ Charts ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="API Traffic Volume">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={charts?.traffic}>
                  <defs>
                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--admin-primary)" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="var(--admin-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--admin-border)" />
                  <XAxis dataKey="time" stroke="var(--admin-muted)" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
                  <YAxis stroke="var(--admin-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--admin-surface)', borderColor: 'var(--admin-border)', borderRadius: '8px', color: 'var(--admin-text)' }} />
                  <Area type="monotone" dataKey="value" name="Requests" stroke="var(--admin-primary)" fillOpacity={1} fill="url(#colorTraffic)" strokeWidth={2} animationDuration={800} animationEasing="ease-out" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Response Latency (ms)">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={charts?.latency}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--admin-border)" />
                  <XAxis dataKey="time" stroke="var(--admin-muted)" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
                  <YAxis stroke="var(--admin-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--admin-surface)', borderColor: 'var(--admin-border)', borderRadius: '8px', color: 'var(--admin-text)' }} />
                  <Line type="monotone" dataKey="value" name="Avg Latency" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} animationDuration={800} animationEasing="ease-out" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Error Occurrences (5xx/4xx)" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={charts?.errors}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--admin-border)" />
                  <XAxis dataKey="time" stroke="var(--admin-muted)" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
                  <YAxis allowDecimals={false} stroke="var(--admin-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'var(--admin-bg)' }} contentStyle={{ backgroundColor: 'var(--admin-surface)', borderColor: 'var(--admin-border)', borderRadius: '8px', color: 'var(--admin-text)' }} />
                  <Bar dataKey="value" name="Errors" fill="#B91C1C" radius={[4, 4, 0, 0]} barSize={20} animationDuration={800} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══ Sub-components ═══ */

const colorMap: Record<string, { bg: string; text: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
  red: { bg: 'bg-red-500/10', text: 'text-red-500' },
};

function MetricCard({ icon, title, value, subtitle, color, index = 0, pulse = false }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
  index?: number;
  pulse?: boolean;
}) {
  const colors = colorMap[color] || colorMap.blue;
  return (
    <div
      className={`bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-4 hover:border-[var(--admin-primary)]/30 transition-all duration-500 animate-in fade-in slide-in-from-bottom-2 ${pulse ? 'animate-pulse' : ''}`}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-[var(--admin-muted)]">{title}</p>
          <h3 className="text-2xl font-black mt-1 text-[var(--admin-text)]">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${colors.bg} ${colors.text} transition-transform duration-300 hover:scale-110`}>
          {icon}
        </div>
      </div>
      <p className={`text-[10px] mt-2 font-bold ${colors.text}`}>{subtitle}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--admin-border)] last:border-0">
      <div className="flex items-center gap-2 text-[var(--admin-muted)]">
        {icon}
        <span className="text-xs font-bold">{label}</span>
      </div>
      <span className="text-xs font-bold text-[var(--admin-text)] max-w-[60%] text-right truncate" title={value}>
        {value}
      </span>
    </div>
  );
}

function ChartCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 animate-in fade-in slide-in-from-bottom-3 duration-700 ${className}`}>
      <h3 className="text-sm font-black uppercase tracking-wider text-[var(--admin-muted)] mb-4">{title}</h3>
      <div className="w-full admin-invert-optout">{children}</div>
    </div>
  );
}
