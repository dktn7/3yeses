'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  MessageSquare,
  Filter,
  ThumbsUp,
  Flag,
  Trash2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Reply,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { formatAdminDate } from '@/lib/admin/formatters';

interface Comment {
  id: string;
  content: string;
  likesCount: number;
  status: 'APPROVED' | 'PENDING' | 'FLAGGED' | 'REJECTED';
  createdAt: string;
  user: {
    name: string;
    profilePicture: string | null;
  };
  portfolioItem?: {
    title: string;
    type: string;
  };
  talentProfile?: {
    user: {
      name: string;
    };
  };
  parentCommentId: string | null;
  _count?: {
    replies: number;
  };
}

export default function CommentsModeration() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, pending: 0, flagged: 0, approvedToday: 0 });

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/comments?status=${filterStatus}&page=${page}`);
      const data = await response.json();
      
      if (data.success) {
        setComments(data.comments);
        setTotalPages(data.pagination?.totalPages || 1);
        if (data.stats) setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, page]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const updateCommentStatus = async (commentId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchComments(); // Refresh list
      }
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Comment deleted successfully');
        fetchComments();
      } else {
        toast.error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'FLAGGED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300">
            <Flag className="h-3 w-3 mr-1" />
            Flagged
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--admin-bg)] text-[var(--admin-muted)] ">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[var(--admin-text)] tracking-tight">
            Comment Moderation
          </h1>
          <p className="text-[var(--admin-muted)] mt-1 font-medium">
            Moderate user comments on videos and profiles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-[var(--admin-muted)]" />
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-sm font-bold text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/30 focus:border-[var(--admin-primary)] appearance-none cursor-pointer"
          >
            <option value="all">All Comments</option>
            <option value="pending">Pending</option>
            <option value="flagged">Flagged</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Comments', value: stats.total.toLocaleString(), icon: MessageSquare, colorClass: 'text-blue-600 dark:text-blue-400' },
          { title: 'Pending Review', value: stats.pending.toString(), icon: AlertTriangle, colorClass: 'text-yellow-600 dark:text-yellow-400' },
          { title: 'Flagged', value: stats.flagged.toString(), icon: Flag, colorClass: 'text-red-600 dark:text-red-400' },
          { title: 'Approved Today', value: stats.approvedToday.toString(), icon: CheckCircle, colorClass: 'text-green-600 dark:text-green-400' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-[var(--admin-surface)] backdrop-blur-md rounded-xl p-6 border border-[var(--admin-border)]"
            >
              <div className="flex items-center gap-3 mb-3">
                <Icon className={`h-8 w-8 ${stat.colorClass}`} />
                <h3 className="text-2xl font-bold text-[var(--admin-text)]">
                  {stat.value}
                </h3>
              </div>
              <p className="text-sm text-[var(--admin-muted)]">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Comments List */}
      <div className="bg-[var(--admin-surface)] backdrop-blur-md rounded-xl border border-[var(--admin-border)] overflow-hidden">
        <div className="divide-y divide-[var(--admin-border)]">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="p-12 text-center text-[var(--admin-muted)]">
              No comments found
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="p-6 hover:bg-[var(--admin-bg)] dark:hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {comment.user.profilePicture ? (
                      <Image
                        src={comment.user.profilePicture}
                        alt={comment.user.name}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {comment.user.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-[var(--admin-text)]">
                        {comment.user.name}
                      </p>
                      <p className="text-sm text-[var(--admin-muted)]">
                        {comment.portfolioItem
                          ? `Comment on "${comment.portfolioItem.title}" (${comment.portfolioItem.type})`
                          : comment.talentProfile
                          ? `Comment on ${comment.talentProfile.user.name}'s profile`
                          : 'Comment'}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(comment.status)}
                </div>

                <div className="bg-[var(--admin-bg)] rounded-lg p-4 mb-4">
                  <p className="text-[var(--admin-muted)]">
                    {comment.content}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-[var(--admin-muted)]">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {comment.likesCount} likes
                    </span>
                    {comment._count && comment._count.replies > 0 && (
                      <span className="flex items-center gap-1">
                        <Reply className="h-4 w-4" />
                        {comment._count.replies} replies
                      </span>
                    )}
                    <span>{formatAdminDate(comment.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {comment.status !== 'APPROVED' && (
                      <button
                        onClick={() => updateCommentStatus(comment.id, 'APPROVED')}
                        className="px-3 py-1.5 bg-green-100 hover:bg-green-200 dark:bg-green-500/20 dark:hover:bg-green-500/30 text-green-700 dark:text-green-300 rounded-lg text-sm transition-colors"
                      >
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        Approve
                      </button>
                    )}
                    {comment.status !== 'FLAGGED' && (
                      <button
                        onClick={() => updateCommentStatus(comment.id, 'FLAGGED')}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 text-red-700 dark:text-red-300 rounded-lg text-sm transition-colors"
                      >
                        <Flag className="h-4 w-4 inline mr-1" />
                        Flag
                      </button>
                    )}
                    {comment.status !== 'REJECTED' && (
                      <button
                        onClick={() => updateCommentStatus(comment.id, 'REJECTED')}
                        className="px-3 py-1.5 bg-[var(--admin-bg)] hover:bg-[var(--admin-surface)] text-[var(--admin-muted)] rounded-lg text-sm transition-colors"
                      >
                        <XCircle className="h-4 w-4 inline mr-1" />
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="px-3 py-1.5 bg-[var(--admin-bg)] hover:bg-[var(--admin-surface)] text-[var(--admin-muted)] rounded-lg text-sm transition-colors"
                    >
                      <Trash2 className="h-4 w-4 inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-[var(--admin-bg)] px-6 py-4 border-t border-[var(--admin-border)]">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-[var(--admin-border)] rounded-lg text-sm font-medium text-[var(--admin-muted)] hover:bg-[var(--admin-surface)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-[var(--admin-muted)]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-[var(--admin-border)] rounded-lg text-sm font-medium text-[var(--admin-muted)] hover:bg-[var(--admin-surface)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
