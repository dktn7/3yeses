"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { formatAdminDate } from "@/lib/admin/formatters";
import {
  Activity,
  Search,
  Download,
  RefreshCw,
  User,
  Shield,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  action: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export default function AuditLogsPage() {
  const [page, setPage] = React.useState(0);
  const [actionFilter, setActionFilter] = React.useState("");
  const [userFilter, setUserFilter] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const pageSize = 50;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["auditLogs", page, actionFilter, userFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: (page * pageSize).toString(),
      });
      if (actionFilter) params.append("action", actionFilter);
      if (userFilter) params.append("userRole", userFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/admin/audit?${params}`);
      if (!response.ok) throw new Error("Failed to fetch audit logs");
      return response.json() as Promise<{ logs: AuditLog[]; total: number }>;
    },
  });

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const formatDetails = (details: any) => {
    if (!details) return "-";
    try {
      return JSON.stringify(details, null, 2);
    } catch {
      return String(details);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("DELETE")) return "text-red-600 bg-red-500/10 border-red-500/20";
    if (action.includes("UPDATE")) return "text-amber-600 bg-amber-500/10 border-amber-500/20";
    if (action.includes("CREATE")) return "text-green-600 bg-green-500/10 border-green-500/20";
    if (action.includes("LOGIN")) return "text-blue-600 bg-blue-500/10 border-blue-500/20";
    return "text-[var(--admin-muted)] bg-[var(--admin-bg)] border-[var(--admin-border)]";
  };

  const selectClass = "w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm font-bold text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)] appearance-none cursor-pointer";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--admin-text)] tracking-tight flex items-center gap-3">
            <Shield className="h-7 w-7 text-[var(--admin-primary)]" />
            Audit Logs
          </h1>
          <p className="text-[var(--admin-muted)] mt-1 font-medium">Track system activity and administrative actions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { refetch(); toast.success("Logs refreshed"); }}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-sm font-bold text-[var(--admin-text)] hover:border-[var(--admin-primary)]/50 transition-all"
            title="Refresh logs"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => toast.info("Export functionality coming soon")}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-sm font-bold text-[var(--admin-text)] hover:border-[var(--admin-primary)]/50 transition-all"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[var(--admin-surface)] p-5 rounded-xl border border-[var(--admin-border)]">
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--admin-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, user, or details..."
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)]"
          />
        </div>
        <div>
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
            className={selectClass}
          >
            <option value="">All Actions</option>
            <option value="LOGIN">Login</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
          </select>
        </div>
        <div>
          <select
            value={userFilter}
            onChange={(e) => { setUserFilter(e.target.value); setPage(0); }}
            className={selectClass}
          >
            <option value="">All Users</option>
            <option value="ADMIN">Admins Only</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--admin-bg)] border-b border-[var(--admin-border)]">
              <tr>
                <th className="px-6 py-4 font-black text-[var(--admin-muted)] uppercase tracking-wider text-xs">Timestamp</th>
                <th className="px-6 py-4 font-black text-[var(--admin-muted)] uppercase tracking-wider text-xs">Action</th>
                <th className="px-6 py-4 font-black text-[var(--admin-muted)] uppercase tracking-wider text-xs">User</th>
                <th className="px-6 py-4 font-black text-[var(--admin-muted)] uppercase tracking-wider text-xs">Details</th>
                <th className="px-6 py-4 font-black text-[var(--admin-muted)] uppercase tracking-wider text-xs">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-[var(--admin-bg)] rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-[var(--admin-bg)] rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-[var(--admin-bg)] rounded w-40" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-[var(--admin-bg)] rounded w-64" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-[var(--admin-bg)] rounded w-24" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-[var(--admin-muted)]">
                    <Activity className="mx-auto mb-2 opacity-30" size={40} />
                    <p className="font-medium">No audit logs found</p>
                    <p className="text-xs mt-1">Activity will appear here as actions are performed</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--admin-bg)]/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--admin-muted)]">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-xs">{formatAdminDate(log.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-[var(--admin-primary)]/10 p-1.5 rounded-full">
                          <User className="h-4 w-4 text-[var(--admin-primary)]" />
                        </div>
                        <div>
                          <p className="font-bold text-[var(--admin-text)] text-xs">{log.user?.name || "Unknown User"}</p>
                          <p className="text-[10px] text-[var(--admin-muted)]">{log.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <div className="relative group/details">
                        <code className="text-[10px] bg-[var(--admin-bg)] px-2 py-1 rounded border border-[var(--admin-border)] block truncate cursor-help text-[var(--admin-muted)] font-mono">
                          {formatDetails(log.details)}
                        </code>
                        <div className="absolute left-0 bottom-full mb-2 w-64 bg-[var(--admin-text)] text-[var(--admin-bg)] text-xs p-3 rounded-lg shadow-xl opacity-0 invisible group-hover/details:opacity-100 group-hover/details:visible transition-all z-10 overflow-auto max-h-48 whitespace-pre-wrap font-mono">
                          {formatDetails(log.details)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-[var(--admin-muted)]">
                      <span className="font-mono bg-[var(--admin-bg)] px-1.5 py-0.5 rounded text-[10px]">{log.ipAddress || "Unknown IP"}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[var(--admin-border)] flex items-center justify-between">
          <p className="text-xs font-medium text-[var(--admin-muted)]">
            Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, total)} of {total} results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg border border-[var(--admin-border)] text-xs font-bold text-[var(--admin-text)] hover:bg-[var(--admin-bg)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg border border-[var(--admin-border)] text-xs font-bold text-[var(--admin-text)] hover:bg-[var(--admin-bg)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
