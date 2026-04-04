'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Trash2, MoreHorizontal } from 'lucide-react';
import CommentInput from './CommentInput';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '@/components/LoadingSpinner';

interface CommentItemProps {
  comment: any;
  onCommentDeleted: (commentId: string) => void;
  portfolioItemId?: string;
  talentProfileId?: string;
  isReply?: boolean;
}

export default function CommentItem({
  comment,
  onCommentDeleted,
  portfolioItemId,
  talentProfileId,
  isReply = false,
}: CommentItemProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replies, setReplies] = useState<any[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/comments/${comment.id}/like`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setLiked(data.liked);
        setLikesCount((prev: number) => (data.liked ? prev + 1 : prev - 1));
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onCommentDeleted(comment.id);
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const fetchReplies = async () => {
    if (replies.length > 0) {
      setShowReplies(!showReplies);
      return;
    }

    try {
      setLoadingReplies(true);
      const response = await fetch(
        `/api/comments?parentCommentId=${comment.id}`
      );
      const data = await response.json();

      if (data.success) {
        setReplies(data.comments);
        setShowReplies(true);
      }
    } catch (error) {
      console.error('Failed to fetch replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleReplyPosted = () => {
    setShowReplyInput(false);
    setShowReplies(false);
    setReplies([]);
    fetchReplies();
  };

  const handleReplyDeleted = (replyId: string) => {
    setReplies(replies.filter((r) => r.id !== replyId));
  };

  const replyCount = comment._count?.replies || 0;

  return (
    <div className={`${isReply ? 'ml-12' : ''}`}>
      <div className="flex gap-3">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-red-500 dark:from-red-500 dark:to-blue-500 flex items-center justify-center text-white font-semibold">
            {comment.user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                  {comment.user.name}
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              </div>

              {/* Menu Button */}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-10">
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-6 mt-2 px-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>

            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                liked
                  ? 'text-red-600 dark:text-red-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-500'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${liked ? 'fill-current' : ''}`}
              />
              {likesCount > 0 && <span>{likesCount}</span>}
            </button>

            {!isReply && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Reply
              </button>
            )}

            {!isReply && replyCount > 0 && (
              <button
                onClick={fetchReplies}
                disabled={loadingReplies}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 flex items-center gap-2"
              >
                {loadingReplies
                  ? <LoadingSpinner size="small" className="p-0" />
                  : showReplies
                  ? 'Hide replies'
                  : `View ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`}
              </button>
            )}
          </div>

          {/* Reply Input */}
          {showReplyInput && (
            <div className="mt-4">
              <CommentInput
                portfolioItemId={portfolioItemId}
                talentProfileId={talentProfileId}
                parentCommentId={comment.id}
                onCommentPosted={handleReplyPosted}
                onCancel={() => setShowReplyInput(false)}
                placeholder="Write a reply..."
                autoFocus
              />
            </div>
          )}

          {/* Replies */}
          {showReplies && replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onCommentDeleted={handleReplyDeleted}
                  portfolioItemId={portfolioItemId}
                  talentProfileId={talentProfileId}
                  isReply
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
