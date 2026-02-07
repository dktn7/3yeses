'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Send, ThumbsUp, MessageCircle, ChevronDown, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from 'next-intl';

interface Comment {
  id: string;
  user: {
    name: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: string;
  likesCount: number;
}

interface CommentsSectionProps {
  mediaId: string;
}

export default function CommentsSection({ mediaId }: CommentsSectionProps) {
  const { user } = useAuth();
  const locale = useLocale();
  const [sortOrder, setSortOrder] = useState<'newest' | 'top'>('newest');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/comments?portfolioItemId=${mediaId}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments.map((c: any) => ({
            id: c.id,
            user: {
              name: c.user.name,
              avatarUrl: c.user.talentProfile?.avatarUrl
            },
            content: c.content,
            createdAt: new Date(c.createdAt).toLocaleDateString(), // Simple formatting
            likesCount: c.likesCount
          })));
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (mediaId) {
      fetchComments();
    }
  }, [mediaId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment, portfolioItemId: mediaId }),
      });

      if (!res.ok) {
        throw new Error('Failed to post comment');
      }

      const data = await res.json();
      
      const comment: Comment = {
        id: data.comment.id,
        user: { name: user.name, avatarUrl: user.avatarUrl },
        content: data.comment.content,
        createdAt: 'Just now',
        likesCount: 0,
      };

      setComments([comment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col bg-white dark:bg-gray-900">
      {/* Header with Sort */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({comments.length})</span>
        </h3>
        <div className="relative group">
          <button className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            {sortOrder === 'newest' ? 'Newest First' : 'Top Comments'}
            <ChevronDown className="w-4 h-4" />
          </button>
          <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 hidden group-hover:block z-10">
            <button
              onClick={() => setSortOrder('newest')}
              className={`w-full text-left px-4 py-2 text-sm ${sortOrder === 'newest' ? 'bg-gray-100 dark:bg-gray-700 text-primary-blue dark:text-accent-red' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              Newest First
            </button>
            <button
              onClick={() => setSortOrder('top')}
              className={`w-full text-left px-4 py-2 text-sm ${sortOrder === 'top' ? 'bg-gray-100 dark:bg-gray-700 text-primary-blue dark:text-accent-red' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              Top Comments
            </button>
          </div>
        </div>
      </div>

      {/* Comment Input */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        {user ? (
          <form onSubmit={handlePostComment} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt={user.name} width={32} height={32} className="object-cover" />
              ) : (
                <User className="w-full h-full p-1 text-gray-400" />
              )}
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red text-gray-900 dark:text-white placeholder:text-gray-500"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary-blue dark:text-accent-red disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-3 py-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <Lock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Please sign in to comment</span>
            <Link 
              href={`/${locale}/auth/login`}
              className="text-sm font-medium text-primary-blue dark:text-accent-red hover:underline"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-6 p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                {comment.user.avatarUrl ? (
                  <Image src={comment.user.avatarUrl} alt={comment.user.name} width={40} height={40} className="object-cover" />
                ) : (
                  <User className="w-full h-full p-2 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{comment.user.name}</span>
                  <span className="text-xs text-gray-500">{comment.createdAt}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{comment.content}</p>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    <ThumbsUp className="w-3 h-3" />
                    {comment.likesCount}
                  </button>
                  <button className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </div>
  );
}
