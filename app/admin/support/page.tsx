'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Ticket, 
  Book, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Send,
  MoreVertical,
  X,
  User as UserIconLucide,
} from 'lucide-react';
import Dropdown from '@/components/Dropdown';
import { toast } from 'sonner';
import { formatAdminDate } from '@/lib/admin/formatters';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  user?: {
    id: string;
    name: string;
    email: string;
  };
  guestEmail?: string;
  assignedTo?: {
    id: string;
    name: string;
  };
  internalNotes?: string;
  messages?: Array<{
    id: string;
    content: string;
    isStaff: boolean;
    createdAt: string;
    author?: { id?: string; name?: string; email?: string } | null;
  }>;
  createdAt: string;
}

interface KBArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  isPublished: boolean;
  viewCount: number;
  author: {
    name: string;
  };
  updatedAt: string;
}

export default function SupportPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'tickets' | 'kb'>('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  
  // KB Editor State
  const [isEditingArticle, setIsEditingArticle] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Partial<KBArticle> & { content?: string }>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'tickets') {
        const res = await fetch('/api/admin/support/tickets');
        const data = await res.json();
        setTickets(data.tickets || []);
      } else {
        const res = await fetch('/api/admin/support/kb');
        const data = await res.json();
        setArticles(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTicketAction = async (id: string, action: string, value?: string) => {
    try {
      const payload: any = {};
      if (action === 'status') payload.status = value;
      if (action === 'reply') payload.reply = value;

      const res = await fetch(`/api/admin/support/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        if (action === 'reply') setReplyMessage('');
        fetchData(); // Refresh list
        if (selectedTicket && selectedTicket.id === id) {
           // Update selected ticket locally
           const updated = await res.json();
           setSelectedTicket(updated);
        }
      }
    } catch (error) {
      console.error('Action failed', error);
    }
  };

  const handleSaveArticle = async () => {
    try {
      const url = currentArticle.id 
        ? `/api/admin/support/kb/${currentArticle.id}`
        : '/api/admin/support/kb';
      
      const method = currentArticle.id ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentArticle),
      });

      if (res.ok) {
        setIsEditingArticle(false);
        setCurrentArticle({});
        fetchData();
      }
    } catch (error) {
      console.error('Save failed', error);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      await fetch(`/api/admin/support/kb/${id}`, { method: 'DELETE' });
      toast.success('Article deleted');
      fetchData();
    } catch (error) {
      console.error('Delete failed', error);
      toast.error('Failed to delete article');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--admin-text)]">Support & Operations</h1>
          <p className="text-[var(--admin-muted)]">Manage support tickets and knowledge base</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'tickets'
                ? 'bg-blue-600 text-white'
                : 'bg-[var(--admin-surface)] text-[var(--admin-muted)] hover:bg-[var(--admin-bg)] dark:hover:bg-gray-700'
            }`}
          >
            <Ticket className="inline-block w-4 h-4 mr-2" />
            Tickets
          </button>
          <button
            onClick={() => setActiveTab('kb')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'kb'
                ? 'bg-blue-600 text-white'
                : 'bg-[var(--admin-surface)] text-[var(--admin-muted)] hover:bg-[var(--admin-bg)] dark:hover:bg-gray-700'
            }`}
          >
            <Book className="inline-block w-4 h-4 mr-2" />
            Knowledge Base
          </button>
        </div>
      </div>

      {activeTab === 'tickets' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="lg:col-span-1 bg-[var(--admin-surface)] rounded-xl shadow-sm border border-[var(--admin-border)] overflow-hidden flex flex-col h-[calc(100vh-200px)]">
            <div className="p-4 border-b border-[var(--admin-border)]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-muted)]" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  className="w-full pl-9 pr-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-[var(--admin-muted)]">Loading tickets...</div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`w-full text-left p-4 hover:bg-[var(--admin-bg)] dark:hover:bg-gray-700/50 transition-colors ${
                        selectedTicket?.id === ticket.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          ticket.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                          ticket.priority === 'HIGH' ? 'bg-red-50 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {ticket.priority}
                        </span>
                        <span className="text-xs text-[var(--admin-muted)]">
                          {formatAdminDate(ticket.createdAt, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="font-medium text-[var(--admin-text)] truncate mb-1">
                        {ticket.subject}
                      </h3>
                      <p className="text-sm text-[var(--admin-muted)] truncate">
                        {ticket.user?.name || ticket.guestEmail || 'Unknown User'}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ticket Detail */}
          <div className="lg:col-span-2 bg-[var(--admin-surface)] rounded-xl shadow-sm border border-[var(--admin-border)] h-[calc(100vh-200px)] flex flex-col">
            {selectedTicket ? (
              <>
                <div className="p-6 border-b border-[var(--admin-border)] flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--admin-text)] mb-2">
                      {selectedTicket.subject}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-[var(--admin-muted)]">
                      <span className="flex items-center gap-1">
                        <UserIconLucide className="w-4 h-4" />
                        {selectedTicket.user?.name || selectedTicket.guestEmail}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatAdminDate(selectedTicket.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 w-40">
                    <Dropdown
                      options={[
                        { value: 'OPEN', label: 'Open' },
                        { value: 'IN_PROGRESS', label: 'In Progress' },
                        { value: 'WAITING_FOR_USER', label: 'Waiting for User' },
                        { value: 'RESOLVED', label: 'Resolved' },
                        { value: 'CLOSED', label: 'Closed' },
                      ] as any}
                      value={selectedTicket.status as any}
                      onChange={(v: any) => handleTicketAction(selectedTicket.id, 'status', v)}
                      ariaLabel="Ticket status"
                    />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div className="bg-[var(--admin-surface)] p-4 rounded-lg">
                    <p className="text-[var(--admin-muted)] whitespace-pre-wrap">
                      {selectedTicket.message}
                    </p>
                  </div>
                    {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-[var(--admin-muted)]">Conversation</h4>
                        <div className="space-y-3">
                          {selectedTicket.messages.map((m) => (
                            <div key={m.id} className={`p-4 rounded-lg ${m.isStaff ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-[var(--admin-bg)]'}`}>
                              <div className="text-xs text-[var(--admin-muted)] mb-1">
                                <strong>{m.author?.name || (m.isStaff ? 'Support' : selectedTicket.user?.name || selectedTicket.guestEmail || 'User')}</strong>
                                <span className="ml-2">{new Date(m.createdAt).toLocaleString()}</span>
                              </div>
                              <div className="text-sm text-[var(--admin-muted)] whitespace-pre-wrap">{m.content}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : selectedTicket.internalNotes ? (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-[var(--admin-muted)]">Conversation / Internal notes</h4>
                        <div className="bg-[var(--admin-bg)] p-4 rounded-lg text-sm text-[var(--admin-muted)] whitespace-pre-wrap">
                          {selectedTicket.internalNotes}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-[var(--admin-muted)]">No conversation history yet.</div>
                    )}
                </div>

                <div className="p-4 border-t border-[var(--admin-border)]">
                  <div className="flex gap-2">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 p-3 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleTicketAction(selectedTicket.id, 'reply', replyMessage)}
                      disabled={!replyMessage.trim()}
                      className="self-end px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[var(--admin-muted)]">
                <Ticket className="w-16 h-16 mb-4 opacity-20" />
                <p>Select a ticket to view details</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* KB Tab */
        <div className="bg-[var(--admin-surface)] rounded-xl shadow-sm border border-[var(--admin-border)]">
          <div className="p-4 border-b border-[var(--admin-border)] flex justify-between items-center">
            <h2 className="font-semibold text-lg">Articles</h2>
            <button
              onClick={() => {
                setCurrentArticle({});
                setIsEditingArticle(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Article
            </button>
          </div>

          {isEditingArticle ? (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={currentArticle.title || ''}
                    onChange={(e) => setCurrentArticle({ ...currentArticle, title: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-[var(--admin-surface)] dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug</label>
                  <input
                    type="text"
                    value={currentArticle.slug || ''}
                    onChange={(e) => setCurrentArticle({ ...currentArticle, slug: e.target.value })}
                    className="w-full p-2 border rounded-lg bg-[var(--admin-surface)] dark:border-gray-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={currentArticle.category || ''}
                  onChange={(e) => setCurrentArticle({ ...currentArticle, category: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-[var(--admin-surface)] dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  value={currentArticle.content || ''}
                  onChange={(e) => setCurrentArticle({ ...currentArticle, content: e.target.value })}
                  className="w-full h-64 p-2 border rounded-lg bg-[var(--admin-surface)] dark:border-gray-700 font-mono"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={currentArticle.isPublished || false}
                  onChange={(e) => setCurrentArticle({ ...currentArticle, isPublished: e.target.checked })}
                  className="rounded border-[var(--admin-border)]"
                />
                <label htmlFor="published" className="text-sm font-medium">Publish immediately</label>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsEditingArticle(false)}
                  className="px-4 py-2 text-[var(--admin-muted)] hover:bg-[var(--admin-bg)] rounded-lg dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveArticle}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Article
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--admin-surface)] text-[var(--admin-muted)]">
                  <tr>
                    <th className="px-6 py-3 font-medium">Title</th>
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Views</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-[var(--admin-bg)] dark:hover:bg-gray-900/50">
                      <td className="px-6 py-4 font-medium text-[var(--admin-text)]">
                        {article.title}
                      </td>
                      <td className="px-6 py-4 text-[var(--admin-muted)]">{article.category}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          article.isPublished 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-[var(--admin-bg)] text-[var(--admin-muted)]'
                        }`}>
                          {article.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[var(--admin-muted)]">{article.viewCount}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                             // Fetch full content if needed, for now just use what we have plus assuming content is loaded
                             // In a real app we might fetch the single article details here
                             setCurrentArticle(article);
                             setIsEditingArticle(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {articles.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[var(--admin-muted)]">
                        No articles found. Create one to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
