'use client';

import { useState, useEffect, useCallback } from 'react';
import CommentInput from './CommentInput';
import CommentList from './CommentList';
import LoadingSpinner from '@/components/LoadingSpinner';

interface CommentSectionProps {
  portfolioItemId?: string;
  talentProfileId?: string;
  className?: string;
}

export default function CommentSection({
  portfolioItemId,
  talentProfileId,
  className = '',
}: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (portfolioItemId) {
        params.append('portfolioItemId', portfolioItemId);
      } else if (talentProfileId) {
        params.append('talentProfileId', talentProfileId);
      }

      const response = await fetch(`/api/comments?${params}`);
      const data = await response.json();

      if (data.success) {
        setComments(data.comments);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  }, [portfolioItemId, talentProfileId, page]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments, refreshTrigger]);

  const handleCommentPosted = () => {
    setPage(1);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments(comments.filter((c) => c.id !== commentId));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Comment Input */}
      <CommentInput
        portfolioItemId={portfolioItemId}
        talentProfileId={talentProfileId}
        onCommentPosted={handleCommentPosted}
      />

      {/* Comments Count */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Comments
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {comments.length > 0 ? `${comments.length} comments` : 'No comments yet'}
        </span>
      </div>

      {/* Comment List */}
      {loading && page === 1 ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <CommentList
          comments={comments}
          onCommentDeleted={handleCommentDeleted}
          portfolioItemId={portfolioItemId}
          talentProfileId={talentProfileId}
        />
      )}

      {/* Load More */}
      {totalPages > 1 && page < totalPages && (
        <div className="text-center pt-4">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <LoadingSpinner size="small" className="p-0" /> : 'Load more comments'}
          </button>
        </div>
      )}
    </div>
  );
}
