'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  Filter, 
  MoreHorizontal, 
  ShieldAlert, 
  User, 
  MessageSquare, 
  Image as ImageIcon,
  Flag,
  ChevronRight,
  Search,
  Check,
  X,
  RefreshCw,
  Ban
} from 'lucide-react';
import Image from 'next/image';
import { ReportStatus, ReportType } from '@prisma/client';
import { formatAdminDate } from '@/lib/admin/formatters';
import { toast } from 'sonner';

interface Report {
  id: string;
  reportedBy: { id: string; name: string; email: string; talentProfile?: { avatarUrl: string | null } };
  reportedUser: { id: string; name: string; email: string; talentProfile?: { avatarUrl: string | null } };
  reportedProfile?: { userId: string; performerTitle: string | null; avatarUrl: string | null };
  portfolioItem?: { id: string; title: string; type: string; mediaUrl: string; thumbnail: string | null };
  comment?: { id: string; content: string };
  type: ReportType;
  reason: string;
  status: ReportStatus;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
  handler?: { id: string; name: string };
}

interface Stats {
  pending: number;
  resolvedToday: number;
  critical: number;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats>({ pending: 0, resolvedToday: 0, critical: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'all'>('PENDING'); // Default to PENDING
  const [typeFilter, setTypeFilter] = useState<ReportType | 'all'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        type: typeFilter,
        page: page.toString(),
        limit: '15'
      });
      const response = await fetch(`/api/admin/reports?${params}`);
      const data = await response.json();
      if (data.success) {
        setReports(data.reports);
        setStats(data.stats);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, typeFilter, page]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUpdateStatus = async (reportId: string, newStatus: ReportStatus, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    
    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId,
          status: newStatus,
          resolution: `Handled via quick action: ${newStatus}`,
          // In a real app, we'd get the handlerId from the session
        })
      });
      const data = await response.json();
      if (data.success) {
        // Optimistic update for list
        setReports(prev => prev.filter(r => r.id !== reportId));
        
        // Update selected report if it's the one being modified
        if (selectedReport?.id === reportId) {
           // If we are filtering by status (e.g. PENDING), and we resolve it, 
           // usually it disappears from the list.
           // We might want to clear selection or update status.
           if (statusFilter !== 'all' && statusFilter !== newStatus) {
             setSelectedReport(null);
           } else {
             setSelectedReport({ ...selectedReport, status: newStatus });
           }
        }

        fetchReports(); // Refresh to get accurate stats
        
        toast.success(`Report marked as ${newStatus}`);
      }
    } catch (error) {
      console.error('Failed to update report:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBlockUser = async (userId: string) => {
    if (!confirm('Are you sure you want to ban this user? This will restrict their access to the platform.')) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ban', reason: 'Banned via reports panel' }),
      });
      if (response.ok) {
        toast.success('User has been banned');
        fetchReports();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to ban user');
      }
    } catch (error) {
      console.error('Failed to ban user:', error);
      toast.error('Failed to ban user');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'PENDING': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'REVIEWING': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'RESOLVED': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'DISMISSED': return 'text-[var(--admin-muted)] bg-[var(--admin-bg)] border-[var(--admin-border)]';
      default: return 'text-[var(--admin-muted)] bg-[var(--admin-bg)] border-[var(--admin-border)]';
    }
  };

  const getReportTypeIcon = (type: ReportType) => {
    switch (type) {
      case 'SPAM': return <Flag className="w-4 h-4" />;
      case 'HARASSMENT': return <ShieldAlert className="w-4 h-4" />;
      case 'INAPPROPRIATE_CONTENT': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  // Helper to determine if report is critical
  const isCritical = (report: Report) => {
    return (report.type === 'HARASSMENT' || report.type === 'INAPPROPRIATE_CONTENT') && report.status === 'PENDING';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-6 relative">
      
      {/* Header & Quick Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--admin-text)]">Content Reports</h1>
          <p className="text-[var(--admin-muted)] mt-1">Review and manage reported content</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
          <div className="admin-glass rounded-xl p-4 min-w-[120px]">
            <p className="text-xs font-medium text-[var(--admin-muted)] uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-bold text-red-500">{stats.pending}</p>
          </div>
          <div className="admin-glass rounded-xl p-4 min-w-[120px]">
            <p className="text-xs font-medium text-[var(--admin-muted)] uppercase tracking-wider">Critical</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-orange-500">{stats.critical}</p>
              {stats.critical > 0 && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
            </div>
          </div>
          <div className="admin-glass rounded-xl p-4 min-w-[120px]">
            <p className="text-xs font-medium text-[var(--admin-muted)] uppercase tracking-wider">Resolved</p>
            <p className="text-2xl font-bold text-green-500">{stats.resolvedToday}</p>
          </div>
        </div>
      </div>

      {/* Main Layout: Three Columns */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Column 1: Filters & List */}
        <div className="w-full lg:w-1/3 flex flex-col admin-glass rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[var(--admin-border)] space-y-4 bg-[var(--admin-surface)]/30 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold flex items-center gap-2 text-[var(--admin-text)]">
                <Filter className="w-4 h-4" /> Reports Feed
              </h2>
              <button
                onClick={() => fetchReports()}
                className="p-1.5 hover:bg-[var(--admin-surface)] rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 text-[var(--admin-muted)] ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            {/* Tabs for Status Filtering */}
            <div className="flex p-1 bg-[var(--admin-border)] rounded-lg">
              {(['PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                    statusFilter === tab
                      ? 'bg-[var(--admin-surface)] text-[var(--admin-text)] shadow-sm'
                      : 'text-[var(--admin-muted)] hover:text-[var(--admin-text)]'
                  }`}
                >
                  {tab === 'DISMISSED' ? 'IGNORED' : tab}
                </button>
              ))}
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs text-[var(--admin-text)] focus:ring-1 focus:ring-[var(--admin-primary)] outline-none"
            >
              <option value="all">All Violation Types</option>
              <option value="SPAM">Spam</option>
              <option value="HARASSMENT">Harassment</option>
              <option value="INAPPROPRIATE_CONTENT">Inappropriate Content</option>
              <option value="FAKE_PROFILE">Fake Profile</option>
              <option value="COPYRIGHT">Copyright Infringement</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoading && reports.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-block w-6 h-6 border-2 border-[var(--admin-primary)] border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-sm text-[var(--admin-muted)]">Loading reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-[var(--admin-bg)] rounded-full flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-[var(--admin-muted)]" />
                </div>
                <p className="text-sm font-medium text-[var(--admin-text)]">All caught up!</p>
                <p className="text-xs text-[var(--admin-muted)] mt-1">No reports found with current filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--admin-border)]">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`group relative p-4 cursor-pointer transition-all hover:bg-[var(--admin-bg)]
                      ${selectedReport?.id === report.id ? 'bg-[var(--admin-bg)] border-l-4 border-[var(--admin-primary)] pl-3' : 'pl-4 border-l-4 border-transparent'}
                      ${isCritical(report) ? 'bg-red-50/30 dark:bg-red-500/5 border-l-red-500' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        {isCritical(report) && (
                          <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> URGENT
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-medium text-[var(--admin-muted)] uppercase">
                        {formatAdminDate(report.createdAt, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`${isCritical(report) ? 'text-red-600 dark:text-red-400' : 'text-[var(--admin-muted)]'}`}>
                        {getReportTypeIcon(report.type)}
                      </span>
                      <h3 className="text-sm font-bold text-[var(--admin-text)] truncate">{report.type.replace(/_/g, ' ')}</h3>
                    </div>
                    
                    <p className="text-xs text-[var(--admin-muted)] line-clamp-2 mb-3">{report.reason}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[var(--admin-bg)] flex items-center justify-center overflow-hidden">
                          {report.reportedBy.talentProfile?.avatarUrl ? (
                            <Image src={report.reportedBy.talentProfile.avatarUrl} alt="" width={20} height={20} />
                          ) : (
                            <User className="w-3 h-3 text-[var(--admin-muted)]" />
                          )}
                        </div>
                        <span className="text-[10px] text-[var(--admin-muted)] font-medium truncate max-w-[100px]">{report.reportedBy.name}</span>
                      </div>
                      
                      {/* Quick Actions on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        {report.status === 'PENDING' && (
                          <>
                            <button
                              onClick={(e) => handleUpdateStatus(report.id, 'RESOLVED', e)}
                              className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 shadow-sm"
                              title="Resolve"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => handleUpdateStatus(report.id, 'DISMISSED', e)}
                              className="p-1.5 bg-[var(--admin-bg)] text-[var(--admin-muted)] rounded hover:bg-[var(--admin-surface)] shadow-sm"
                              title="Dismiss"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        )}
                        <ChevronRight className="w-4 h-4 text-[var(--admin-muted)] self-center ml-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="p-3 border-t border-[var(--admin-border)] flex items-center justify-between bg-[var(--admin-bg)]">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="text-xs font-medium text-[var(--admin-muted)] hover:text-[var(--admin-text)] disabled:opacity-30"
              >
                PREV
              </button>
              <span className="text-xs font-medium text-[var(--admin-muted)]">PAGE {page}/{totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="text-xs font-medium text-[var(--admin-muted)] hover:text-[var(--admin-text)] disabled:opacity-30"
              >
                NEXT
              </button>
            </div>
          )}
        </div>

        {/* Column 2 & 3: Detail View */}
        <div className="hidden lg:flex flex-1 admin-glass rounded-xl overflow-hidden shadow-sm">
          {selectedReport ? (
            <div className="flex flex-1 divide-x divide-[var(--admin-border)]">
              {/* Report Details */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="p-6 border-b border-[var(--admin-border)] bg-[var(--admin-surface)]/30 backdrop-blur-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-[var(--admin-text)] mb-1">Report Details</h2>
                      <div className="flex gap-2 text-xs font-medium text-[var(--admin-muted)]">
                        <span className="uppercase">ID: {selectedReport.id.slice(-8)}</span>
                        <span>•</span>
                        <span>{formatAdminDate(selectedReport.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(selectedReport.id, 'RESOLVED')}
                        disabled={isUpdating || selectedReport.status === 'RESOLVED'}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                          selectedReport.status === 'RESOLVED'
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-green-500 text-white hover:bg-green-600 shadow-sm'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        {selectedReport.status === 'RESOLVED' ? 'Resolved' : 'Resolve'}
                      </button>
                      <button
                         onClick={() => handleUpdateStatus(selectedReport.id, 'DISMISSED')}
                         disabled={isUpdating || selectedReport.status === 'DISMISSED'}
                        className="p-2 bg-[var(--admin-bg)] hover:bg-[var(--admin-surface)] text-[var(--admin-muted)] rounded-lg transition-colors border border-transparent"
                        title="Dismiss Report"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="text-[10px] font-medium text-[var(--admin-muted)] uppercase block mb-2">Current Status</label>
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedReport.status)}`}>
                        {selectedReport.status}
                      </span>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-[var(--admin-muted)] uppercase block mb-2">Handler</label>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[var(--admin-bg)] flex items-center justify-center">
                           <User className="w-3 h-3 text-[var(--admin-muted)]" />
                        </div>
                        <span className="text-sm text-[var(--admin-text)]">{selectedReport.handler?.name || 'Unassigned'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-8 flex-1 overflow-y-auto">
                  <section>
                    <h3 className="text-sm font-bold uppercase text-[var(--admin-muted)] mb-3 border-b border-[var(--admin-border)] pb-1">Report Reasoning</h3>
                    <div className="bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 rounded-lg p-4">
                      <p className="text-sm text-[var(--admin-text)] leading-relaxed font-medium">"{selectedReport.reason}"</p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-bold uppercase text-[var(--admin-muted)] mb-3 border-b border-[var(--admin-border)] pb-1">Interactive Preview</h3>
                    
                    {/* Content Preview Logic */}
                    <div className="space-y-4">
                      {selectedReport.reportedProfile && (
                        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden shadow-sm">
                          <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-500 opacity-80" />
                          <div className="px-6 pb-6 relative">
                            <div className="absolute -top-10 left-6 w-20 h-20 rounded-full border-4 border-[var(--admin-surface)] overflow-hidden bg-[var(--admin-bg)]">
                                {selectedReport.reportedProfile.avatarUrl ? (
                                    <Image src={selectedReport.reportedProfile.avatarUrl} alt="" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[var(--admin-bg)]">
                                        <User className="w-8 h-8 text-[var(--admin-muted)]" />
                                    </div>
                                )}
                            </div>
                            <div className="mt-12">
                              <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-lg font-bold text-[var(--admin-text)]">Talent Profile</h4>
                                    <p className="text-sm text-[var(--admin-muted)]">{selectedReport.reportedProfile.performerTitle || 'No Role Title'}</p>
                                </div>
                                <a
                                    href={`/talent/${selectedReport.reportedProfile.userId}`}
                                    target="_blank"
                                    className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100 hover:bg-blue-100"
                                >
                                    Open Public Page <ExternalLink className="w-3 h-3 inline ml-1" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedReport.portfolioItem && (
                        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden shadow-sm">
                            <div className="relative aspect-video bg-black flex items-center justify-center">
                                {selectedReport.portfolioItem.thumbnail || selectedReport.portfolioItem.type === 'IMAGE' ? (
                                    <Image
                                        src={selectedReport.portfolioItem.thumbnail || selectedReport.portfolioItem.mediaUrl || '/placeholder.jpg'}
                                        alt={selectedReport.portfolioItem.title}
                                        fill
                                        className="object-contain opacity-90"
                                    />
                                ) : (
                                    <div className="text-white/50 flex flex-col items-center gap-2">
                                        <ImageIcon className="w-12 h-12" />
                                        <span className="text-xs uppercase font-medium">No Preview Available</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-[var(--admin-text)] flex items-center gap-2">
                                            {selectedReport.portfolioItem.title}
                                            <span className="text-[10px] px-2 py-0.5 bg-[var(--admin-bg)] rounded text-[var(--admin-muted)] uppercase">
                                                {selectedReport.portfolioItem.type}
                                            </span>
                                        </h4>
                                    </div>
                                    <a
                                        href={`/portfolio-item/${selectedReport.portfolioItem.id}`}
                                        target="_blank"
                                        className="text-[var(--admin-primary)] hover:underline text-xs flex items-center gap-1"
                                    >
                                        View Source <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                      )}

                      {selectedReport.comment && (
                        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-6 shadow-sm">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                              <MessageSquare className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-[var(--admin-text)]">Reported Comment</h4>
                                <p className="text-xs text-[var(--admin-muted)]">Posted by {selectedReport.reportedUser.name}</p>
                            </div>
                          </div>
                          <div className="p-4 bg-[var(--admin-bg)] rounded-lg border-l-4 border-orange-500 italic text-[var(--admin-text)]">
                            "{selectedReport.comment.content}"
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>

              {/* Side Metadata (Reporter/Subject) */}
              <div className="w-80 flex flex-col bg-[var(--admin-surface)]/10 border-l border-[var(--admin-border)] backdrop-blur-sm">
                <div className="p-6 space-y-8 overflow-y-auto">
                  <section>
                    <h3 className="text-[10px] font-bold uppercase text-[var(--admin-muted)] mb-4">Reporter</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full border border-[var(--admin-border)] overflow-hidden bg-[var(--admin-surface)]">
                        {selectedReport.reportedBy.talentProfile?.avatarUrl ? (
                          <Image src={selectedReport.reportedBy.talentProfile.avatarUrl} alt="" width={40} height={40} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[var(--admin-muted)]">
                            {selectedReport.reportedBy.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--admin-text)] truncate">{selectedReport.reportedBy.name}</p>
                        <p className="text-xs text-[var(--admin-muted)] truncate">{selectedReport.reportedBy.email}</p>
                      </div>
                    </div>
                    <button className="w-full py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-xs font-medium hover:bg-[var(--admin-bg)] transition-colors text-[var(--admin-text)]">
                      VIEW HISTORY
                    </button>
                  </section>

                  <section className="pt-8 border-t border-[var(--admin-border)]">
                    <h3 className="text-[10px] font-bold uppercase text-[var(--admin-muted)] mb-4">Subject (Accused)</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full border-2 border-red-500/20 overflow-hidden bg-[var(--admin-surface)]">
                        {selectedReport.reportedUser.talentProfile?.avatarUrl ? (
                          <Image src={selectedReport.reportedUser.talentProfile.avatarUrl} alt="" width={48} height={48} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-bold text-[var(--admin-muted)]">
                            {selectedReport.reportedUser.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--admin-text)] truncate">{selectedReport.reportedUser.name}</p>
                        <p className="text-xs text-[var(--admin-muted)] truncate">{selectedReport.reportedUser.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                       <button className="w-full py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg text-xs font-medium hover:bg-[var(--admin-bg)] transition-colors text-[var(--admin-text)]">
                        VIEW FULL PROFILE
                      </button>
                      
                      <button
                        onClick={() => handleBlockUser(selectedReport.reportedUser.id)}
                        disabled={isUpdating}
                        className="w-full py-3 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Ban className="w-4 h-4" />
                        BLOCK USER
                      </button>
                      <p className="text-[10px] text-center text-[var(--admin-muted)]">
                        Blocks access to platform immediately.
                      </p>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--admin-muted)] p-12 text-center bg-[var(--admin-bg)]">
              <div className="w-20 h-20 rounded-full bg-[var(--admin-surface)] flex items-center justify-center mb-6">
                <Flag className="w-10 h-10 text-[var(--admin-muted)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--admin-text)] mb-2">Select a Report</h3>
              <p className="max-w-xs text-sm text-[var(--admin-muted)]">
                Choose a report from the feed on the left to view details, evidence, and take moderation actions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
