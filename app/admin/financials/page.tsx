"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Download,
  RefreshCw,
  MoreHorizontal,
  PoundSterling,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { formatAdminDate, formatAdminCurrency } from '@/lib/admin/formatters';
import SmartSearch from "@/components/admin/SmartSearch";

interface Transaction {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  type: string;
  amount: number;
  currency: string;
  status: string;
  stripeId: string | null;
  createdAt: string;
}

interface FinancialStats {
  totalRevenue: number;
  monthlyRevenue: number;
  lastMonthRevenue: number;
  monthlyChange: number;
  refundRate: number;
  totalRefunds: number;
  totalPayments: number;
  activeSubscriptions: number;
  currency: string;
}

export default function AdminFinancialsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1, limit: 20 });
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch("/api/admin/financials/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("Failed to load financial stats");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.append("type", filter.toUpperCase());
      if (searchQuery) params.append("search", searchQuery);
      params.append("page", pagination.page.toString());
      params.append("limit", "20");

      const res = await fetch(`/api/admin/financials/transactions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTransactions(data.transactions);
      if (data.pagination) setPagination(data.pagination);
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  }, [filter, searchQuery, pagination.page]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);



  const handleRefund = async (transactionId: string) => {
    if (!confirm("Are you sure you want to refund this transaction?")) return;

    try {
      const res = await fetch("/api/admin/financials/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId }),
      });

      if (res.ok) {
        toast.success("Refund processed successfully");
        fetchTransactions();
        fetchStats();
      } else {
        const err = await res.json();
        toast.error(`Refund failed: ${err.error}`);
      }
    } catch {
      toast.error("Failed to process refund");
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }
    const headers = ["ID", "User", "Email", "Type", "Amount", "Currency", "Status", "Date"];
    const rows = transactions.map(tx => [
      tx.id,
      tx.user?.name || "Unknown",
      tx.user?.email || "",
      tx.type,
      (tx.amount / 100).toFixed(2),
      tx.currency.toUpperCase(),
      tx.status,
      formatAdminDate(tx.createdAt),
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `financials_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Export downloaded");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--admin-text)] tracking-tight">Financials</h1>
          <p className="text-[var(--admin-muted)] mt-1 font-medium">Revenue, transactions, and subscription billing in GBP</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-sm font-bold text-[var(--admin-text)] hover:border-[var(--admin-primary)]/50 transition-all"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            onClick={() => { fetchStats(); fetchTransactions(); }}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-primary)] text-white rounded-lg text-sm font-bold shadow-lg shadow-[var(--admin-primary)]/20 hover:opacity-90 transition-all"
          >
            <RefreshCw size={16} className={statsLoading || isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <PoundSterling size={64} />
          </div>
          <h3 className="text-[var(--admin-muted)] text-xs font-bold uppercase tracking-wider mb-2">Total Revenue</h3>
          {statsLoading ? (
            <div className="h-9 w-32 bg-[var(--admin-bg)] rounded animate-pulse" />
          ) : (
            <div className="text-3xl font-black text-[var(--admin-text)]">
              {formatAdminCurrency(stats?.totalRevenue || 0)}
            </div>
          )}
          <div className="mt-2 text-xs font-medium text-[var(--admin-muted)] flex items-center gap-1">
            {stats?.totalPayments || 0} total payments
          </div>
        </div>

        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CreditCard size={64} />
          </div>
          <h3 className="text-[var(--admin-muted)] text-xs font-bold uppercase tracking-wider mb-2">Monthly Recurring</h3>
          {statsLoading ? (
            <div className="h-9 w-32 bg-[var(--admin-bg)] rounded animate-pulse" />
          ) : (
            <div className="text-3xl font-black text-[var(--admin-text)]">
              {formatAdminCurrency(stats?.monthlyRevenue || 0)}
            </div>
          )}
          <div className="mt-2 text-xs font-medium flex items-center gap-1">
            {stats && stats.monthlyChange !== 0 ? (
              <span className={stats.monthlyChange > 0 ? "text-emerald-500 flex items-center gap-1" : "text-rose-500 flex items-center gap-1"}>
                {stats.monthlyChange > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {stats.monthlyChange > 0 ? "+" : ""}{stats.monthlyChange}% from last month
              </span>
            ) : (
              <span className="text-[var(--admin-muted)]">{stats?.activeSubscriptions || 0} active subscriptions</span>
            )}
          </div>
        </div>

        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertCircle size={64} />
          </div>
          <h3 className="text-[var(--admin-muted)] text-xs font-bold uppercase tracking-wider mb-2">Refund Rate</h3>
          {statsLoading ? (
            <div className="h-9 w-20 bg-[var(--admin-bg)] rounded animate-pulse" />
          ) : (
            <div className="text-3xl font-black text-[var(--admin-text)]">
              {stats?.refundRate || 0}%
            </div>
          )}
          <div className="mt-2 text-xs font-medium text-[var(--admin-muted)] flex items-center gap-1">
            {stats?.totalRefunds || 0} refund{(stats?.totalRefunds || 0) !== 1 ? "s" : ""} total
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[var(--admin-surface)] p-4 rounded-xl border border-[var(--admin-border)]">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { key: "all", label: "All Transactions" },
            { key: "payment", label: "Payments" },
            { key: "refund", label: "Refunds" },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                filter === opt.key
                  ? "bg-[var(--admin-primary)] text-white shadow-md"
                  : "bg-[var(--admin-bg)] text-[var(--admin-muted)] hover:text-[var(--admin-text)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="w-full md:w-64">
          <SmartSearch
            placeholder="Search transactions..."
            onSearch={(q) => { setSearchQuery(q); setPagination(p => ({ ...p, page: 1 })); }}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--admin-bg)] border-b border-[var(--admin-border)]">
              <tr>
                <th className="px-6 py-4 font-black text-[var(--admin-muted)] uppercase tracking-wider text-xs">Transaction ID</th>
                <th className="px-6 py-4 font-black text-[var(--admin-muted)] uppercase tracking-wider text-xs">User</th>
                <th className="px-6 py-4 font-black text-[var(--admin-muted)] uppercase tracking-wider text-xs">Type</th>
                <th className="px-6 py-4 font-black text-[var(--admin-muted)] uppercase tracking-wider text-xs">Amount</th>
                <th className="px-6 py-4 font-black text-[var(--admin-muted)] uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-black text-[var(--admin-muted)] uppercase tracking-wider text-xs">Date</th>
                <th className="px-6 py-4 font-black text-[var(--admin-muted)] uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--admin-muted)]">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="animate-spin text-[var(--admin-primary)]" size={24} />
                      <span className="font-medium animate-pulse">Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--admin-muted)]">
                    <PoundSterling className="mx-auto mb-2 opacity-30" size={40} />
                    <p className="font-medium">No transactions found</p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[var(--admin-bg)]/50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs text-[var(--admin-muted)]">
                      {tx.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[var(--admin-text)]">{tx.user?.name || "Unknown"}</span>
                        <span className="text-xs text-[var(--admin-muted)]">{tx.user?.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {tx.type === "PAYMENT" ? (
                          <div className="p-1 rounded bg-emerald-500/10 text-emerald-500">
                            <ArrowDownLeft size={14} />
                          </div>
                        ) : (
                          <div className="p-1 rounded bg-rose-500/10 text-rose-500">
                            <ArrowUpRight size={14} />
                          </div>
                        )}
                        <span className="font-medium text-[var(--admin-text)]">{tx.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-[var(--admin-text)]">
                      {formatAdminCurrency(tx.amount / 100)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        tx.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-500" :
                        tx.status === "REFUNDED" ? "bg-red-500/10 text-red-500" :
                        tx.status === "FAILED" ? "bg-rose-500/10 text-rose-500" :
                        "bg-[var(--admin-border)] text-[var(--admin-muted)]"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--admin-muted)] whitespace-nowrap">
                      {formatAdminDate(tx.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {tx.status === "COMPLETED" && tx.type === "PAYMENT" && (
                          <button
                            onClick={() => handleRefund(tx.id)}
                            className="px-3 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-1"
                            title="Process refund"
                          >
                            <RefreshCw size={12} />
                            Refund
                          </button>
                        )}
                        <button
                          className="p-1.5 text-[var(--admin-muted)] hover:text-[var(--admin-primary)] hover:bg-[var(--admin-primary)]/10 rounded-lg transition-colors"
                          title="More options"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[var(--admin-border)] flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--admin-muted)]">
            Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 rounded-lg border border-[var(--admin-border)] text-xs font-bold text-[var(--admin-text)] hover:bg-[var(--admin-bg)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(p => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
              disabled={pagination.page >= pagination.pages}
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
