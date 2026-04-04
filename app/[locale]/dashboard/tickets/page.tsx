'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Ticket, Plus, Clock, CheckCircle2, AlertCircle, XCircle, Loader2, LifeBuoy, ArrowRight } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_STYLES: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
  OPEN: {
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  },
  IN_PROGRESS: {
    icon: Loader2,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  },
  RESOLVED: {
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  },
  CLOSED: {
    icon: XCircle,
    color: 'text-gray-500 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700',
  },
};

const STATUS_KEYS: Record<string, string> = {
  OPEN: 'open',
  IN_PROGRESS: 'inProgress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

const CATEGORY_KEYS: Record<string, string> = {
  ACCOUNT: 'categoryAccount',
  BILLING: 'categoryBilling',
  PORTFOLIO: 'categoryPortfolio',
  CATEGORIES: 'categoryCategories',
  NOTIFICATIONS: 'categoryNotifications',
  SECURITY: 'categorySecurity',
  OTHER: 'categoryOther',
};

function StatusBadge({ status, label }: { status: string; label: string }) {
  const config = STATUS_STYLES[status] || STATUS_STYLES.OPEN;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function TicketsPage() {
  const t = useTranslations('dashboard.tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/support/tickets', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      } else if (res.status === 401) {
        setError('Please log in to view your tickets.');
      } else {
        setError('Failed to load tickets.');
      }
    } catch {
      setError('An error occurred while loading tickets.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = filter === 'ALL'
    ? tickets
    : tickets.filter(t => t.status === filter);

  const statusCounts = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Ticket className="w-8 h-8 text-primary-blue dark:text-accent-red" />
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('description')}
          </p>
        </div>
        <Link
          href="/support/submit-ticket"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-blue to-accent-blue dark:from-accent-red dark:to-primary-red text-white font-semibold text-sm shadow-lg shadow-primary-blue/20 dark:shadow-accent-red/20 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          {t('newTicket')}
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300 text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        </div>
      )}

      {/* Status filter pills */}
      {tickets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              filter === 'ALL'
                ? 'bg-primary-blue dark:bg-accent-red text-white border-primary-blue dark:border-accent-red'
                : 'bg-white/60 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'
            }`}
          >
            {t('all')} ({tickets.length})
          </button>
          {Object.entries(STATUS_STYLES).map(([key, config]) => {
            const count = statusCounts[key] || 0;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  filter === key
                    ? 'bg-primary-blue dark:bg-accent-red text-white border-primary-blue dark:border-accent-red'
                    : 'bg-white/60 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'
                }`}
              >
                {t(STATUS_KEYS[key] || 'open')} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Tickets list */}
      {tickets.length === 0 ? (
        <div className="rounded-[2rem] backdrop-blur-xl bg-white/60 dark:bg-white/[0.05] border border-gray-200/50 dark:border-white/10 shadow-lg p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-blue/10 to-accent-blue/10 dark:from-accent-red/10 dark:to-primary-red/10 flex items-center justify-center mx-auto mb-5">
            <LifeBuoy className="w-8 h-8 text-primary-blue dark:text-accent-red" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('noTickets')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-md mx-auto">
            {t('noTicketsDesc')}
          </p>
          <Link
            href="/support/submit-ticket"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary-blue to-accent-blue dark:from-accent-red dark:to-primary-red text-white font-semibold shadow-lg shadow-primary-blue/20 dark:shadow-accent-red/20 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            {t('submitFirst')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="group rounded-2xl backdrop-blur-xl bg-white/60 dark:bg-white/[0.05] border border-gray-200/50 dark:border-white/10 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 p-5 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className={`text-[0.65rem] font-bold uppercase tracking-widest text-primary-blue/60 dark:text-accent-red/60`}>
                      {t(CATEGORY_KEYS[ticket.category] || 'categoryOther')}
                    </span>
                    <StatusBadge status={ticket.status} label={t(STATUS_KEYS[ticket.status] || 'open')} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1.5">
                    {ticket.subject}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
                    {ticket.message}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div className="font-medium">{formatDate(ticket.createdAt)}</div>
                  <div>{formatTime(ticket.createdAt)}</div>
                  {ticket.updatedAt !== ticket.createdAt && (
                    <div className="text-primary-blue/60 dark:text-accent-red/60 mt-1">
                      {t('updated', { date: formatDate(ticket.updatedAt) })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredTickets.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
              {t('noMatch')}
            </div>
          )}
        </div>
      )}

      {/* Help Centre link */}
      <div className="pt-4">
        <Link
          href="/support"
          className="group inline-flex items-center gap-2 text-sm font-medium text-primary-blue dark:text-accent-red hover:underline"
        >
          <LifeBuoy className="w-4 h-4" />
          {t('visitHelp')}
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
