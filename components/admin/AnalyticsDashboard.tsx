
"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns/format";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

export function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/growth/analytics?period=${period}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) return <div className="p-8 text-center">Loading analytics...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load data</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border rounded p-2 bg-light-surface dark:bg-dark-surface"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={data.stats.totalUsers} />
        <StatCard title="Total Talents" value={data.stats.totalTalents} />
        <StatCard title="Active Subs" value={data.stats.activeSubscriptions} />
        <StatCard title="Profile Views" value={data.stats.periodProfileViews} subtitle={`Last ${period}`} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow border dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4">User Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.charts.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => format(new Date(val), 'MMM d')}
                  stroke="#9ca3af"
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem', color: '#fff' }}
                />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow border dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4">Subscriptions by Plan</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.subscriptions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="plan" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Legend />
                <Bar dataKey="_count.id" name="Count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow border dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4">Top Talents (by Views)</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b dark:border-gray-700">
                <th className="pb-2">Name</th>
                <th className="pb-2 text-right">Views</th>
              </tr>
            </thead>
            <tbody>
              {data.topTalents.map((talent: any) => (
                <tr key={talent.userId} className="border-b dark:border-gray-700 last:border-0">
                  <td className="py-2">{talent.user.name}</td>
                  <td className="py-2 text-right font-mono">{talent.viewCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow border dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {data.recentActivity.map((log: any) => (
              <div key={log.id} className="flex justify-between text-sm">
                <div>
                  <span className="font-medium">{log.user.name}</span>
                  <span className="text-gray-500 mx-2">•</span>
                  <span className="text-gray-600 dark:text-gray-400">{log.action}</span>
                </div>
                <div className="text-gray-400 text-xs">
                  {format(new Date(log.createdAt), 'MMM d, HH:mm')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle }: { title: string, value: string | number, subtitle?: string }) {
  return (
    <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow border dark:border-gray-700">
      <h4 className="text-gray-500 text-sm font-medium uppercase">{title}</h4>
      <div className="mt-2 text-3xl font-bold">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-gray-400">{subtitle}</div>}
    </div>
  );
}
