'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Key,
  Shield,
  CreditCard,
  Cloud,
  Mail,
  Database,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  Copy,
  Search,
  Save,
  Edit3,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatAdminDate } from '@/lib/admin/formatters';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ApiKey {
  id: string;
  name: string;
  service: string;
  category: string;
  envVar: string;
  description: string;
  docsUrl: string;
  isConfigured: boolean;
  maskedPreview: string;
  lastVerified: string | null;
}

interface ApiKeysResponse {
  keys: ApiKey[];
  summary: {
    totalKeys: number;
    configuredKeys: number;
    missingKeys: number;
    healthPercentage: number;
  };
  categories: Record<string, ApiKey[]>;
  usageData: Array<{
    date: string;
    stripe: number;
    resend: number;
  }>;
}

const CATEGORY_CONFIG: Record<string, { icon: typeof Key; label: string; color: string }> = {
  payments: { icon: CreditCard, label: 'Payments', color: '#6366f1' },
  media: { icon: Cloud, label: 'Media Storage', color: '#f59e0b' },
  email: { icon: Mail, label: 'Email', color: '#10b981' },
  security: { icon: Shield, label: 'Security', color: '#ef4444' },
  database: { icon: Database, label: 'Database', color: '#8b5cf6' },
};

export default function ApiKeysPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'usage'>('overview');
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isFetching } = useQuery<ApiKeysResponse>({
    queryKey: ['admin-api-keys'],
    queryFn: async () => {
      const res = await fetch('/api/admin/api-keys');
      if (!res.ok) throw new Error('Failed to fetch API keys');
      return res.json();
    },
  });

  const updateKeyMutation = useMutation({
    mutationFn: async ({ envVar, value }: { envVar: string; value: string }) => {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ envVar, value }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update key');
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || 'API key updated');
      setEditingKey(null);
      setEditValue('');
      queryClient.invalidateQueries({ queryKey: ['admin-api-keys'] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const toggleReveal = (keyId: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(keyId)) {
        next.delete(keyId);
      } else {
        next.add(keyId);
      }
      return next;
    });
  };

  const startEditing = (envVar: string) => {
    setEditingKey(envVar);
    setEditValue('');
  };

  const cancelEditing = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const saveKey = () => {
    if (!editingKey || !editValue.trim()) {
      toast.error('Please enter a value');
      return;
    }
    updateKeyMutation.mutate({ envVar: editingKey, value: editValue.trim() });
  };

  const copyEnvVar = (envVar: string) => {
    navigator.clipboard.writeText(envVar);
    toast.success(`Copied ${envVar} to clipboard`);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('API key status refreshed');
  };

  const filteredKeys = data?.keys.filter((key) => {
    const matchesCategory = filterCategory === 'all' || key.category === filterCategory;
    const matchesSearch =
      searchQuery === '' ||
      key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.envVar.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--admin-text)]">API Keys</h1>
          <p className="text-[var(--admin-muted)] mt-1">
            Manage external service configurations and monitor usage
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--admin-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-[var(--admin-surface)] border border-[var(--admin-border)] animate-pulse"
            />
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <Key className="h-5 w-5 text-[var(--admin-primary)]" />
              <span className="text-xs font-bold text-[var(--admin-muted)] uppercase tracking-wider">
                Total
              </span>
            </div>
            <p className="text-2xl font-black text-[var(--admin-text)]">
              {data.summary.totalKeys}
            </p>
            <p className="text-xs text-[var(--admin-muted)] mt-1">External keys tracked</p>
          </div>

          <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span className="text-xs font-bold text-[var(--admin-muted)] uppercase tracking-wider">
                Configured
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-500">
              {data.summary.configuredKeys}
            </p>
            <p className="text-xs text-[var(--admin-muted)] mt-1">Keys active & ready</p>
          </div>

          <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-xs font-bold text-[var(--admin-muted)] uppercase tracking-wider">
                Missing
              </span>
            </div>
            <p className="text-2xl font-black text-red-500">{data.summary.missingKeys}</p>
            <p className="text-xs text-[var(--admin-muted)] mt-1">Keys not configured</p>
          </div>

          <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <Shield className="h-5 w-5 text-[var(--admin-primary)]" />
              <span className="text-xs font-bold text-[var(--admin-muted)] uppercase tracking-wider">
                Health
              </span>
            </div>
            <p className="text-2xl font-black text-[var(--admin-text)]">
              {data.summary.healthPercentage}%
            </p>
            <div className="w-full h-1.5 bg-[var(--admin-bg)] rounded-full mt-2">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${data.summary.healthPercentage}%`,
                  backgroundColor:
                    data.summary.healthPercentage >= 80
                      ? '#10b981'
                      : data.summary.healthPercentage >= 50
                        ? '#f59e0b'
                        : '#ef4444',
                }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg w-fit">
        {[
          { id: 'overview' as const, label: 'Key Overview', icon: Key },
          { id: 'usage' as const, label: 'Usage Tracking', icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--admin-primary)] text-white shadow-sm'
                : 'text-[var(--admin-muted)] hover:text-[var(--admin-text)]'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--admin-muted)]" />
              <input
                type="text"
                placeholder="Search keys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)]"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm font-bold text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)] appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="payments">Payments</option>
              <option value="media">Media</option>
              <option value="email">Email</option>
              <option value="security">Security</option>
              <option value="database">Database</option>
            </select>
          </div>

          {/* Missing Keys Warning */}
          {data && data.summary.missingKeys > 0 && (
            <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  {data.summary.missingKeys} API key{data.summary.missingKeys > 1 ? 's' : ''} not
                  configured
                </p>
                <p className="text-xs text-[var(--admin-muted)] mt-1">
                  Some features may not work correctly. Set missing environment variables in your{' '}
                  <code className="px-1.5 py-0.5 bg-[var(--admin-bg)] rounded text-[var(--admin-text)] font-mono">
                    .env.local
                  </code>{' '}
                  file.
                </p>
              </div>
            </div>
          )}

          {/* Keys List */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl bg-[var(--admin-surface)] border border-[var(--admin-border)] animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredKeys?.map((key) => {
                const catConfig = CATEGORY_CONFIG[key.category];
                const CatIcon = catConfig?.icon || Key;
                const isRevealed = revealedKeys.has(key.id);

                return (
                  <div
                    key={key.id}
                    className={`bg-[var(--admin-surface)] border rounded-xl p-4 transition-all hover:shadow-md ${
                      key.isConfigured
                        ? 'border-[var(--admin-border)]'
                        : 'border-red-500/30 bg-red-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div
                          className="p-2 rounded-lg shrink-0"
                          style={{ backgroundColor: `${catConfig?.color || '#6b7280'}15` }}
                        >
                          <CatIcon
                            className="h-4 w-4"
                            style={{ color: catConfig?.color || '#6b7280' }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-semibold text-[var(--admin-text)] text-sm">
                              {key.name}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                key.isConfigured
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
                              }`}
                            >
                              {key.isConfigured ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                              {key.isConfigured ? 'Active' : 'Missing'}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--admin-muted)] mb-2">
                            {key.description}
                          </p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <code className="text-[11px] font-mono px-2 py-1 bg-[var(--admin-bg)] rounded text-[var(--admin-text)] border border-[var(--admin-border)]">
                                {key.envVar}
                              </code>
                              <button
                                onClick={() => copyEnvVar(key.envVar)}
                                className="p-1 hover:bg-[var(--admin-bg)] rounded transition-colors"
                                title="Copy env var name"
                              >
                                <Copy className="h-3 w-3 text-[var(--admin-muted)]" />
                              </button>
                            </div>
                            {key.isConfigured && key.maskedPreview && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-mono text-[var(--admin-muted)]">
                                  {isRevealed ? key.maskedPreview : '••••••••••••'}
                                </span>
                                <button
                                  onClick={() => toggleReveal(key.id)}
                                  className="p-1 hover:bg-[var(--admin-bg)] rounded transition-colors"
                                  title={isRevealed ? 'Hide preview' : 'Show preview'}
                                >
                                  {isRevealed ? (
                                    <EyeOff className="h-3 w-3 text-[var(--admin-muted)]" />
                                  ) : (
                                    <Eye className="h-3 w-3 text-[var(--admin-muted)]" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Inline key entry form */}
                          {editingKey === key.envVar && (
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                type="password"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                placeholder={`Enter ${key.name}...`}
                                className="flex-1 px-3 py-1.5 bg-[var(--admin-bg)] border border-[var(--admin-primary)]/40 rounded-lg text-sm font-mono text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)]"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveKey();
                                  if (e.key === 'Escape') cancelEditing();
                                }}
                                autoFocus
                              />
                              <button
                                onClick={saveKey}
                                disabled={updateKeyMutation.isPending}
                                className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                                title="Save key"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-1.5 bg-[var(--admin-bg)] text-[var(--admin-muted)] rounded-lg hover:bg-[var(--admin-surface)] transition-colors"
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {editingKey !== key.envVar && (
                          <button
                            onClick={() => startEditing(key.envVar)}
                            className="p-1.5 hover:bg-[var(--admin-primary)]/10 rounded-lg transition-colors"
                            title={key.isConfigured ? 'Update key value' : 'Enter key value'}
                          >
                            <Edit3 className="h-3.5 w-3.5 text-[var(--admin-primary)]" />
                          </button>
                        )}
                        {key.lastVerified && (
                          <span className="text-[10px] text-[var(--admin-muted)] whitespace-nowrap">
                            Verified{' '}
                            {formatAdminDate(key.lastVerified, {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        )}
                        {key.docsUrl && (
                          <a
                            href={key.docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-[var(--admin-bg)] rounded-lg transition-colors"
                            title="View documentation"
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-[var(--admin-muted)]" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredKeys?.length === 0 && (
                <div className="text-center py-12 text-[var(--admin-muted)]">
                  <Key className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">No keys match your filters</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Usage Tab */}
      {activeTab === 'usage' && (
        <div className="space-y-6">
          {/* Usage Chart */}
          <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-6 admin-invert-optout">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[var(--admin-text)]">
                  API Call Volume (30 Days)
                </h2>
                <p className="text-xs text-[var(--admin-muted)] mt-1">
                  Daily request counts by service
                </p>
              </div>
            </div>
            {isLoading ? (
              <div className="h-72 bg-[var(--admin-bg)] rounded-lg animate-pulse" />
            ) : data?.usageData ? (
              <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.usageData}>
                    <defs>
                      <linearGradient id="colorStripe" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorResend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--admin-border)"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: 'var(--admin-muted)' }}
                      tickFormatter={(v: string) => formatAdminDate(v, { day: 'numeric', month: 'short' })}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 10, fill: 'var(--admin-muted)' }} width={40} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--admin-surface)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'var(--admin-text)',
                      }}
                      labelFormatter={(v: string) =>
                        formatAdminDate(v, {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      }
                    />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="stripe"
                      name="Stripe"
                      stroke="#6366f1"
                      fillOpacity={1}
                      fill="url(#colorStripe)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="resend"
                      name="Resend"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorResend)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
            ) : null}
          </div>

          {/* Usage Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data?.usageData && (
              <>
                {[
                  {
                    name: 'Stripe',
                    key: 'stripe' as const,
                    color: '#6366f1',
                    icon: CreditCard,
                  },
                  { name: 'Resend', key: 'resend' as const, color: '#10b981', icon: Mail },
                ].map((svc) => {
                  const total = data.usageData.reduce(
                    (sum: number, d: Record<string, number | string>) =>
                      sum + (d[svc.key] as number),
                    0
                  );
                  const avg = Math.round(total / data.usageData.length);
                  const today = data.usageData[data.usageData.length - 1]?.[svc.key] as number;

                  return (
                    <div
                      key={svc.key}
                      className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="p-1.5 rounded-md"
                          style={{ backgroundColor: `${svc.color}15` }}
                        >
                          <svc.icon className="h-3.5 w-3.5" style={{ color: svc.color }} />
                        </div>
                        <span className="text-sm font-semibold text-[var(--admin-text)]">
                          {svc.name}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-lg font-bold text-[var(--admin-text)]">{today}</p>
                          <p className="text-[10px] text-[var(--admin-muted)] uppercase">Today</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-[var(--admin-text)]">{avg}</p>
                          <p className="text-[10px] text-[var(--admin-muted)] uppercase">
                            Avg/Day
                          </p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-[var(--admin-text)]">
                            {total.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-[var(--admin-muted)] uppercase">
                            30d Total
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Rate Limits Info */}
          <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5">
            <h3 className="text-sm font-bold text-[var(--admin-text)] mb-3">
              Service Rate Limits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  service: 'Stripe',
                  limit: '100 req/sec (live), 25 req/sec (test)',
                  color: '#6366f1',
                },
                {
                  service: 'ImageKit',
                  limit: '20GB bandwidth/month (free), unlimited (paid)',
                  color: '#f59e0b',
                },
                {
                  service: 'Resend',
                  limit: '100 emails/day (free), 50,000/month (pro)',
                  color: '#10b981',
                },
              ].map((rl) => (
                <div
                  key={rl.service}
                  className="flex items-center gap-3 p-3 bg-[var(--admin-bg)] rounded-lg"
                >
                  <div
                    className="w-1.5 h-8 rounded-full shrink-0"
                    style={{ backgroundColor: rl.color }}
                  />
                  <div>
                    <p className="text-xs font-semibold text-[var(--admin-text)]">{rl.service}</p>
                    <p className="text-[11px] text-[var(--admin-muted)]">{rl.limit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
