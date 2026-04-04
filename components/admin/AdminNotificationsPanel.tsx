'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, Bell, AlertTriangle, Info, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'ALERT' | 'SYSTEM' | 'SUCCESS';
  title: string;
  message: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  link: string;
}

interface AdminNotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCountChange?: (count: number) => void;
}

const POLL_INTERVAL = 30_000; // 30 seconds

export default function AdminNotificationsPanel({ isOpen, onClose, onCountChange }: AdminNotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const res = await fetch('/api/admin/notifications');
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        onCountChange?.(data.unreadCount ?? data.notifications.length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [onCountChange]);

  // Fetch on open + start polling
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(true);
      pollRef.current = setInterval(() => fetchNotifications(false), POLL_INTERVAL);
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isOpen, fetchNotifications]);

  const handleClearAll = async () => {
    setClearing(true);
    try {
      const res = await fetch('/api/admin/notifications', { method: 'POST' });
      if (res.ok) {
        setNotifications([]);
        onCountChange?.(0);
      }
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    } finally {
      setClearing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-md admin-glass border-l border-[var(--admin-border)] shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right duration-300 backdrop-blur-xl">
        {/* Header */}
        <div className="p-5 border-b border-[var(--admin-border)] flex items-center justify-between bg-[var(--admin-surface)]/40 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm">
              <Bell className="h-4 w-4 text-[var(--admin-primary)]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[var(--admin-text)] uppercase tracking-wider">Notifications</h2>
              <p className="text-[10px] text-[var(--admin-muted)] font-medium">
                {notifications.length > 0 ? `${notifications.length} update${notifications.length !== 1 ? 's' : ''}` : 'No updates'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--admin-surface)] rounded-lg transition-colors border border-transparent hover:border-[var(--admin-border)] text-[var(--admin-muted)] hover:text-[var(--admin-text)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                 <div className="absolute inset-0 bg-[var(--admin-primary)] blur-xl opacity-20 animate-pulse"></div>
                 <Loader2 className="h-8 w-8 text-[var(--admin-primary)] animate-spin relative z-10" />
              </div>
              <p className="text-xs text-[var(--admin-muted)] uppercase tracking-wider animate-pulse">Syncing Stream...</p>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`group relative p-4 rounded-xl border transition-all duration-300 overflow-hidden ${
                  n.priority === 'high'
                    ? 'bg-red-500/5 border-red-500/30 hover:border-red-500/50 hover:bg-red-500/10'
                    : 'bg-[var(--admin-surface)]/30 border-[var(--admin-border)] hover:border-[var(--admin-primary)]/40 hover:bg-[var(--admin-surface)]/60 hover:shadow-[0_4px_20px_-10px_rgba(0,0,0,0.2)]'
                }`}
              >
                {/* Active strip for high priority */}
                {n.priority === 'high' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                )}
                
                <div className="flex items-start gap-4 relative z-10">
                  <div className={`mt-0.5 p-2 rounded-lg border backdrop-blur-sm ${
                    n.priority === 'high'
                        ? 'bg-red-500/10 border-red-500/20 text-red-500'
                        : 'bg-[var(--admin-bg)] border-[var(--admin-border)] text-[var(--admin-muted)] group-hover:text-[var(--admin-primary)] group-hover:border-[var(--admin-primary)]/30'
                  } transition-colors`}>
                    {n.type === 'ALERT' ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Info className="h-4 w-4" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded border ${
                        n.priority === 'high'
                            ? 'bg-red-500/10 border-red-500/20 text-red-500'
                            : 'bg-[var(--admin-surface)] border-[var(--admin-border)] text-[var(--admin-muted)]'
                      }`}>
                        {n.type}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--admin-muted)] opacity-70">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <h3 className="text-sm font-bold text-[var(--admin-text)] mb-1.5 leading-tight">{n.title}</h3>
                    
                    <p className="text-xs text-[var(--admin-muted)] leading-relaxed mb-3 opacity-90">
                      {n.message}
                    </p>
                    
                    <Link
                      href={n.link}
                      onClick={onClose}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                          n.priority === 'high' ? 'text-red-500 hover:text-red-400' : 'text-[var(--admin-primary)] hover:text-[var(--admin-accent)]'
                      }`}
                    >
                      <span className="border-b border-current pb-0.5">Take Action</span>
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
              <div className="p-4 bg-[var(--admin-bg)] rounded-full">
                <Shield className="h-8 w-8 text-[var(--admin-muted)]" />
              </div>
              <p className="text-sm font-medium text-[var(--admin-muted)]">No new notifications</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-6 border-t border-[var(--admin-border)] bg-[var(--admin-surface)]/30 backdrop-blur-md">
            <button
              className="w-full py-3 bg-[var(--admin-bg)]/50 border border-[var(--admin-border)] rounded-lg text-xs font-medium text-[var(--admin-muted)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-text)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleClearAll}
              disabled={clearing}
            >
              {clearing ? 'Clearing...' : 'Clear All'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function Shield({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}
