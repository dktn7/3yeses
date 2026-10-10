'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { AlertCircle, Bell, CheckCircle2, Clock, LifeBuoy, MessageSquare, Plus, Send, Ticket } from 'lucide-react';
import {
  DashboardButton,
  DashboardHeader,
  DashboardLoadError,
  DashboardLoading,
  DashboardPanel,
  DashboardWorkspace,
  PanelHeading,
  StatusPill,
  inputClass,
} from '@/components/dashboard/DashboardPrimitives';

type Announcement = {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL' | string;
  createdAt: string;
  expiresAt?: string | null;
};

type SupportMessage = {
  id: string;
  content: string;
  isStaff: boolean;
  author: { id?: string; name?: string; email?: string } | null;
  createdAt: string;
};

type SupportConversation = {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: SupportMessage | null;
  messages: SupportMessage[];
};

type InboxResponse = {
  success: boolean;
  announcements: Announcement[];
  conversations: SupportConversation[];
  counts: {
    announcements: number;
    conversations: number;
    open: number;
  };
};

const categoryOptions = [
  { value: 'ACCOUNT', label: 'Account' },
  { value: 'BILLING', label: 'Billing' },
  { value: 'PORTFOLIO', label: 'Media' },
  { value: 'CATEGORIES', label: 'Categories' },
  { value: 'NOTIFICATIONS', label: 'Notifications' },
  { value: 'SECURITY', label: 'Security' },
  { value: 'OTHER', label: 'Other' },
];

const statusTone: Record<string, 'neutral' | 'success' | 'warning' | 'danger' | 'brand'> = {
  OPEN: 'brand',
  IN_PROGRESS: 'warning',
  WAITING_FOR_USER: 'warning',
  RESOLVED: 'success',
  CLOSED: 'neutral',
};

function prettyStatus(status: string) {
  return status.toLowerCase().replaceAll('_', ' ');
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function announcementClasses(type: string) {
  if (type === 'CRITICAL') return 'border-red-300 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100';
  if (type === 'WARNING') return 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100';
  return 'border-blue-200 bg-blue-50 text-slate-950 dark:border-red-900/60 dark:bg-red-950/20 dark:text-white';
}

export default function MessagesPage() {
  const locale = useLocale();
  const [data, setData] = useState<InboxResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [message, setMessage] = useState('');
  const [inboxTab, setInboxTab] = useState<'conversations' | 'updates'>('conversations');
  const [actionError, setActionError] = useState<string | null>(null);

  const conversations = useMemo(() => data?.conversations ?? [], [data?.conversations]);
  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) || conversations[0] || null,
    [activeId, conversations],
  );

  const loadInbox = async () => {
    setError(false);
    try {
      const response = await fetch('/api/messages', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to load messages');
      const nextData = await response.json();
      setData(nextData);
      const requestedId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('conversation') : null;
      setActiveId((current) => current || requestedId || nextData.conversations?.[0]?.id || null);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInbox();
  }, []);

  const sendReply = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeConversation || !reply.trim()) return;

    setSending(true);
    setActionError(null);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ticketId: activeConversation.id, message: reply }),
      });
      if (!response.ok) throw new Error('Failed to send reply');
      setReply('');
      await loadInbox();
      setActiveId(activeConversation.id);
    } catch {
      setActionError('Your reply could not be sent. Keep it here and try again.');
    } finally {
      setSending(false);
    }
  };

  const createConversation = async (event: FormEvent) => {
    event.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSending(true);
    setActionError(null);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subject, message, category }),
      });
      if (!response.ok) throw new Error('Failed to create support conversation');
      const result = await response.json();
      setSubject('');
      setMessage('');
      setCategory('OTHER');
      setNewOpen(false);
      await loadInbox();
      setActiveId(result.conversation?.id || null);
    } catch {
      setActionError('This support conversation could not be created. Your draft is still here.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <DashboardLoading />;

  return (
    <DashboardWorkspace className="dashboard-inbox-page">
      <DashboardHeader
        icon={MessageSquare}
        title="Inbox"
        description="Official 3YESES updates and your support conversations."
        actions={
          <DashboardButton onClick={() => setNewOpen((value) => !value)}>
            <Plus className="h-4 w-4" />
            New support conversation
          </DashboardButton>
        }
        meta={data ? <StatusPill tone={data.counts.open > 0 ? 'brand' : 'neutral'}>{data.counts.open} open support {data.counts.open === 1 ? 'case' : 'cases'}</StatusPill> : null}
      />

      {error && <DashboardLoadError onRetry={loadInbox} />}

      {actionError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-100" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="inline-flex rounded-full border border-slate-200 bg-white/70 p-1 shadow-sm dark:border-slate-800 dark:bg-slate-950/40" role="tablist" aria-label="Inbox sections">
        <button id="conversations-tab" type="button" role="tab" aria-selected={inboxTab === 'conversations'} aria-controls="conversations-panel" onClick={() => setInboxTab('conversations')} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${inboxTab === 'conversations' ? 'bg-[color:var(--brand-primary)] text-white' : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'}`}>Conversations {data?.counts.open ? `(${data.counts.open})` : ''}</button>
        <button id="updates-tab" type="button" role="tab" aria-selected={inboxTab === 'updates'} aria-controls="updates-panel" onClick={() => setInboxTab('updates')} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${inboxTab === 'updates' ? 'bg-[color:var(--brand-primary)] text-white' : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'}`}>Updates {data?.counts.announcements ? `(${data.counts.announcements})` : ''}</button>
      </div>

      {inboxTab === 'updates' && data?.announcements.length ? (
        <section id="updates-panel" role="tabpanel" aria-labelledby="updates-tab" className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Bell className="h-4 w-4 text-[color:var(--brand-primary)]" />
            Announcements
          </div>
          <div className="grid gap-3">
            {data.announcements.map((announcement) => (
              <article key={announcement.id} className={`rounded-2xl border p-4 ${announcementClasses(announcement.type)}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">{announcement.title}</p>
                    <p className="mt-1 text-sm leading-6 opacity-85">{announcement.message}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold opacity-65">{formatDate(announcement.createdAt, locale)}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {inboxTab === 'conversations' && newOpen && (
        <DashboardPanel className="dashboard-inbox-compose">
          <div id="conversations-panel" role="tabpanel" aria-labelledby="conversations-tab">
          <PanelHeading title="New support conversation" description="Send this to the 3YESES team. Replies will stay in this inbox." />
          <form onSubmit={createConversation} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-[1fr_220px]">
              <label className="grid gap-2 text-sm font-semibold">Subject
                <input className={inputClass()} value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={160} required />
              </label>
              <label className="grid gap-2 text-sm font-semibold">Topic
                <select className={inputClass()} value={category} onChange={(event) => setCategory(event.target.value)}>
                  {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>
            <label className="grid gap-2 text-sm font-semibold">Message
              <textarea className={inputClass()} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell us what you need help with." rows={5} maxLength={4000} required />
            </label>
            <div className="flex justify-end">
              <DashboardButton type="submit" disabled={sending || !subject.trim() || message.trim().length < 10}>
                <Send className="h-4 w-4" />
                Send to support
              </DashboardButton>
            </div>
          </form>
          </div>
        </DashboardPanel>
      )}

      {inboxTab === 'conversations' && conversations.length === 0 ? (
        !error && !newOpen && <section id="conversations-panel" role="tabpanel" aria-labelledby="conversations-tab" className="dashboard-inbox-welcome">
          <div className="dashboard-inbox-welcome-mark"><LifeBuoy className="h-7 w-7" /><span>3YESES / SUPPORT</span></div>
          <div className="dashboard-inbox-welcome-copy">
            <h2 id="support-welcome-title">A direct line to our team.</h2>
            <p>Account, media, or membership questions belong here. Your replies stay together in one conversation.</p>
            <DashboardButton onClick={() => setNewOpen(true)}><Ticket className="h-4 w-4" />Start a conversation</DashboardButton>
          </div>
        </section>
      ) : inboxTab === 'conversations' && !error ? (
        <div id="conversations-panel" role="tabpanel" aria-labelledby="conversations-tab" className="grid gap-5 lg:grid-cols-[minmax(250px,320px)_minmax(0,1fr)]">
          <DashboardPanel compact className="dashboard-inbox-list">
            <PanelHeading title="Support inbox" description={`${conversations.length} conversation${conversations.length === 1 ? '' : 's'}`} />
            <div className="space-y-2">
              {conversations.map((conversation) => {
                const active = activeConversation?.id === conversation.id;
                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveId(conversation.id)}
                    className={`w-full rounded-xl p-4 text-left transition-colors ${active ? 'bg-[color:var(--brand-primary)]/10 text-slate-950 dark:text-white' : 'bg-slate-50/80 text-slate-700 hover:bg-slate-100 dark:bg-slate-950/35 dark:text-slate-200 dark:hover:bg-slate-900/70'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{conversation.subject}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 opacity-70">{conversation.lastMessage?.content || 'No messages yet'}</p>
                      </div>
                      <StatusPill tone={statusTone[conversation.status] || 'neutral'}>{prettyStatus(conversation.status)}</StatusPill>
                    </div>
                    <p className="mt-3 flex items-center gap-1 text-xs opacity-60">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(conversation.updatedAt, locale)}
                    </p>
                  </button>
                );
              })}
            </div>
          </DashboardPanel>

          <DashboardPanel className="dashboard-inbox-thread">
            {activeConversation ? (
              <div className="flex min-h-[560px] flex-col">
                <PanelHeading
                  title={activeConversation.subject}
                  description={`${activeConversation.category.toLowerCase()} support case`}
                  actions={<StatusPill tone={statusTone[activeConversation.status] || 'neutral'}>{prettyStatus(activeConversation.status)}</StatusPill>}
                />
                <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                  {activeConversation.messages.map((item) => (
                    <div key={item.id} className={`flex ${item.isStaff ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[82%] rounded-2xl px-4 py-3 ${item.isStaff ? 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100' : 'bg-[color:var(--brand-primary)] text-white'}`}>
                        <div className="mb-1 flex items-center gap-2 text-xs font-semibold opacity-75">
                          {item.isStaff ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                          {item.isStaff ? '3YESES support' : 'You'}
                          <span>{formatDate(item.createdAt, locale)}</span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-6">{item.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {activeConversation.status === 'CLOSED' ? (
                  <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950/35 dark:text-slate-300">
                    This support conversation is closed. Start a new message if you need more help.
                  </div>
                ) : (
                  <form onSubmit={sendReply} className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
                    <label className="grid gap-2 text-sm font-semibold">Your reply
                      <textarea className={inputClass()} value={reply} onChange={(event) => setReply(event.target.value)} rows={4} maxLength={4000} />
                    </label>
                    <div className="flex justify-end">
                      <DashboardButton type="submit" disabled={sending || !reply.trim()}>
                        <Send className="h-4 w-4" />
                        Reply
                      </DashboardButton>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">Select a support conversation.</p>
            )}
          </DashboardPanel>
        </div>
      ) : (
        inboxTab === 'updates' && !error && !data?.announcements.length && <section id="updates-panel" role="tabpanel" aria-labelledby="updates-tab" className="dashboard-inbox-welcome is-updates">
          <div className="dashboard-inbox-welcome-mark"><Bell className="h-7 w-7" /><span>3YESES / UPDATES</span></div>
          <div className="dashboard-inbox-welcome-copy">
            <h2 id="updates-welcome-title">All caught up.</h2>
            <p>Official account and platform updates will appear here.</p>
          </div>
        </section>
      )}
    </DashboardWorkspace>
  );
}
