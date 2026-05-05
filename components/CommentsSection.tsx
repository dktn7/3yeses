'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  User, Send, ThumbsUp, MessageCircle, ChevronDown, Lock, Loader2,
  Pencil, Trash2, X, Check, Pin, CornerDownRight, ChevronUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from 'next-intl';
import { useAuthRequired } from '@/hooks/useAuthRequired';
import AuthRequiredModal from '@/components/AuthRequiredModal';

interface MentionUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

function MentionInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled,
  submitting,
  className,
  inputClassName,
  autoFocus,
  onCancel,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder: string;
  disabled?: boolean;
  submitting?: boolean;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
}) {
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionLoading, setMentionLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mentionTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    // Detect @ mention
    const cursorPos = e.target.selectionStart ?? val.length;
    const textBeforeCursor = val.slice(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);

    if (atMatch) {
      const query = atMatch[1];
      setMentionQuery(query);
      setMentionIndex(0);

      if (query.length >= 1) {
        if (mentionTimeout.current) clearTimeout(mentionTimeout.current);
        mentionTimeout.current = setTimeout(async () => {
          setMentionLoading(true);
          try {
            const res = await fetch(`/api/user/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
              const data = await res.json();
              setMentionUsers(data.users);
              setShowMentions(data.users.length > 0);
            }
          } catch {
            setShowMentions(false);
          } finally {
            setMentionLoading(false);
          }
        }, 150);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user: MentionUser) => {
    const cursorPos = inputRef.current?.selectionStart ?? value.length;
    const textBeforeCursor = value.slice(0, cursorPos);
    const textAfterCursor = value.slice(cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    const newValue = textBeforeCursor.slice(0, atIndex) + `@${user.name} ` + textAfterCursor;
    onChange(newValue);
    setShowMentions(false);
    setMentionUsers([]);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions && mentionUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(prev => (prev + 1) % mentionUsers.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(prev => (prev - 1 + mentionUsers.length) % mentionUsers.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(mentionUsers[mentionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentions(false);
        return;
      }
    }
    if (e.key === 'Enter' && value.trim()) onSubmit();
    if (e.key === 'Escape' && onCancel) onCancel();
  };

  return (
    <div className={`relative ${className || ''}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={inputClassName}
        autoFocus={autoFocus}
        disabled={disabled}
        onBlur={() => setTimeout(() => setShowMentions(false), 200)}
      />
      {showMentions && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
          {mentionLoading ? (
            <div className="p-3 text-center"><Loader2 className="w-4 h-4 animate-spin mx-auto text-gray-400" /></div>
          ) : (
            mentionUsers.map((u, i) => (
              <button
                key={u.id}
                onMouseDown={(e) => { e.preventDefault(); insertMention(u); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                  i === mentionIndex
                    ? 'bg-primary-blue/10 dark:bg-accent-red/10 text-primary-blue dark:text-accent-red'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                  {u.avatarUrl ? (
                    <Image src={u.avatarUrl} alt={u.name} width={24} height={24} className="object-cover" />
                  ) : (
                    <User className="w-full h-full p-1 text-gray-400" />
                  )}
                </div>
                <span className="truncate font-medium">{u.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface Comment {
  id: string;
  userId: string;
  user: {
    name: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  likesCount: number;
  isLiked: boolean;
  replyCount: number;
  isPinned: boolean;
}

interface CommentsSectionProps {
  mediaId: string;
  mediaOwnerId?: string;
}

function mapComment(c: any): Comment {
  const created = new Date(c.createdAt);
  const updated = new Date(c.updatedAt);
  const isEdited = (updated.getTime() - created.getTime()) > 2000;
  return {
    id: c.id,
    userId: c.userId || c.user?.id,
    user: {
      name: c.user.name,
      avatarUrl: c.user.talentProfile?.avatarUrl,
    },
    content: c.content,
    createdAt: created.toLocaleDateString(),
    updatedAt: c.updatedAt,
    isEdited,
    likesCount: c.likesCount,
    isLiked: c.isLiked || false,
    replyCount: c._count?.replies || 0,
    isPinned: c.isPinned || false,
  };
}

export default function CommentsSection({ mediaId, mediaOwnerId }: CommentsSectionProps) {
  const { user } = useAuth();
  const locale = useLocale();
  const { showAuthModal, openAuthModal, closeAuthModal } = useAuthRequired();
  const [sortOrder, setSortOrder] = useState<'newest' | 'top'>('newest');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Reply state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replies, setReplies] = useState<Record<string, Comment[]>>({});
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set());

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/comments?portfolioItemId=${mediaId}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments.map(mapComment));
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (mediaId) {
      fetchComments();
      // Reset reply state when media changes
      setReplies({});
      setExpandedReplies(new Set());
      setReplyingToId(null);
    }
  }, [mediaId]);

  // Post comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    if (!user) {
      openAuthModal();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment, portfolioItemId: mediaId }),
      });

      if (!res.ok) throw new Error('Failed to post comment');

      const data = await res.json();

      const comment: Comment = {
        id: data.comment.id,
        userId: user.id,
        user: { name: user.name, avatarUrl: user.avatarUrl },
        content: data.comment.content,
        createdAt: 'Just now',
        updatedAt: new Date().toISOString(),
        isEdited: false,
        likesCount: 0,
        isLiked: false,
        replyCount: 0,
        isPinned: false,
      };

      setComments([comment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Like / unlike
  const handleCommentLike = async (commentId: string) => {
    if (!user) {
      openAuthModal();
      return;
    }

    // Optimistic update
    setComments(prev => prev.map(c =>
      c.id === commentId
        ? { ...c, isLiked: !c.isLiked, likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1 }
        : c
    ));
    // Also update in replies
    setReplies(prev => {
      const updated = { ...prev };
      for (const parentId of Object.keys(updated)) {
        updated[parentId] = updated[parentId].map(c =>
          c.id === commentId
            ? { ...c, isLiked: !c.isLiked, likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1 }
            : c
        );
      }
      return updated;
    });

    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'POST' });
      if (!res.ok) throw new Error('Like failed');
    } catch {
      // Revert on failure
      setComments(prev => prev.map(c =>
        c.id === commentId
          ? { ...c, isLiked: !c.isLiked, likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1 }
          : c
      ));
    }
  };

  // Edit
  const handleEditStart = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleEditSave = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });

      if (!res.ok) throw new Error('Failed to edit comment');

      const updateFn = (c: Comment) =>
        c.id === commentId ? { ...c, content: editContent.trim(), isEdited: true } : c;

      setComments(prev => prev.map(updateFn));
      setReplies(prev => {
        const updated = { ...prev };
        for (const parentId of Object.keys(updated)) {
          updated[parentId] = updated[parentId].map(updateFn);
        }
        return updated;
      });
      setEditingId(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  // Delete
  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete comment');

      setComments(prev => prev.filter(c => c.id !== commentId));
      setReplies(prev => {
        const updated = { ...prev };
        for (const parentId of Object.keys(updated)) {
          updated[parentId] = updated[parentId].filter(c => c.id !== commentId);
        }
        return updated;
      });
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setDeletingId(null);
    }
  };

  // Pin / unpin
  const handlePin = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}/pin`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to pin comment');
      const data = await res.json();

      setComments(prev => {
        const updated = prev.map(c =>
          c.id === commentId ? { ...c, isPinned: data.isPinned } : c
        );
        // Re-sort: pinned first, then by date
        return updated.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return 0;
        });
      });
    } catch (error) {
      console.error('Failed to pin comment:', error);
    }
  };

  // Reply
  const handleReplyStart = (commentId: string) => {
    setReplyingToId(commentId);
    setReplyContent('');
  };

  const handleReplyCancel = () => {
    setReplyingToId(null);
    setReplyContent('');
  };

  const handleReplySubmit = async (parentCommentId: string) => {
    if (!replyContent.trim()) return;
    
    if (!user) {
      openAuthModal();
      return;
    }

    setReplySubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent,
          portfolioItemId: mediaId,
          parentCommentId,
        }),
      });

      if (!res.ok) throw new Error('Failed to post reply');

      const data = await res.json();

      const reply: Comment = {
        id: data.comment.id,
        userId: user.id,
        user: { name: user.name, avatarUrl: user.avatarUrl },
        content: data.comment.content,
        createdAt: 'Just now',
        updatedAt: new Date().toISOString(),
        isEdited: false,
        likesCount: 0,
        isLiked: false,
        replyCount: 0,
        isPinned: false,
      };

      // Add to replies and expand
      setReplies(prev => ({
        ...prev,
        [parentCommentId]: [reply, ...(prev[parentCommentId] || [])],
      }));
      setExpandedReplies(prev => new Set(prev).add(parentCommentId));

      // Increment reply count on parent
      setComments(prev => prev.map(c =>
        c.id === parentCommentId ? { ...c, replyCount: c.replyCount + 1 } : c
      ));

      setReplyingToId(null);
      setReplyContent('');
    } catch (error) {
      console.error('Failed to post reply:', error);
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleLoadReplies = async (parentCommentId: string) => {
    if (expandedReplies.has(parentCommentId)) {
      // Collapse
      setExpandedReplies(prev => {
        const next = new Set(prev);
        next.delete(parentCommentId);
        return next;
      });
      return;
    }

    // Load replies
    setLoadingReplies(prev => new Set(prev).add(parentCommentId));
    try {
      const res = await fetch(`/api/comments?parentCommentId=${parentCommentId}`);
      if (res.ok) {
        const data = await res.json();
        setReplies(prev => ({
          ...prev,
          [parentCommentId]: data.comments.map(mapComment),
        }));
        setExpandedReplies(prev => new Set(prev).add(parentCommentId));
      }
    } catch (error) {
      console.error('Failed to load replies:', error);
    } finally {
      setLoadingReplies(prev => {
        const next = new Set(prev);
        next.delete(parentCommentId);
        return next;
      });
    }
  };

  // Permissions
  const canModify = (comment: Comment) => {
    if (!user) return false;
    return comment.userId === user.id || user.role === 'admin';
  };

  const canEdit = (comment: Comment) => {
    if (!user) return false;
    return comment.userId === user.id;
  };

  const canPin = () => {
    if (!user || !mediaOwnerId) return false;
    return user.id === mediaOwnerId;
  };

  // Render a single comment row (used for top-level and replies)
  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`flex gap-3 group ${isReply ? 'ml-8' : ''}`}>
      <div className={`${isReply ? 'w-7 h-7' : 'w-10 h-10'} rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden`}>
        {comment.user.avatarUrl ? (
          <Image src={comment.user.avatarUrl} alt={comment.user.name} width={isReply ? 28 : 40} height={isReply ? 28 : 40} className="object-cover" />
        ) : (
          <User className="w-full h-full p-1.5 text-gray-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`font-semibold text-gray-900 dark:text-white ${isReply ? 'text-xs' : 'text-sm'}`}>{comment.user.name}</span>
          <span className="text-xs text-gray-500">{comment.createdAt}</span>
          {comment.isEdited && (
            <span className="text-xs text-gray-400 italic">(edited)</span>
          )}
          {comment.isPinned && (
            <span className="flex items-center gap-0.5 text-xs text-amber-500 font-medium">
              <Pin className="w-3 h-3" />
              Pinned
            </span>
          )}
        </div>

        {editingId === comment.id ? (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg py-1.5 px-3 text-sm focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red text-gray-900 dark:text-white"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSave(comment.id);
                if (e.key === 'Escape') handleEditCancel();
              }}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEditSave(comment.id)}
                disabled={!editContent.trim()}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-primary-blue dark:bg-accent-red text-white hover:opacity-90 disabled:opacity-50 transition-colors"
              >
                <Check className="w-3 h-3" />
                Save
              </button>
              <button
                onClick={handleEditCancel}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className={`text-gray-700 dark:text-gray-300 ${isReply ? 'text-xs' : 'text-sm'} mb-2`}>
              {comment.content.split(/(@\w[\w\s]*?)(?=\s|$|@)/g).map((part, i) =>
                part.startsWith('@') ? (
                  <span key={i} className="text-primary-blue dark:text-accent-red font-semibold cursor-pointer hover:underline">{part}</span>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Like */}
              <button
                onClick={() => handleCommentLike(comment.id)}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  comment.isLiked
                    ? 'text-primary-blue dark:text-accent-red font-medium'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <ThumbsUp className={`w-3 h-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                {comment.likesCount > 0 && comment.likesCount}
              </button>

              {/* Reply (only on top-level) */}
              {!isReply && (
                <button
                  onClick={() => handleReplyStart(comment.id)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <CornerDownRight className="w-3 h-3" />
                  Reply
                </button>
              )}

              {/* Pin (media owner only, top-level only) */}
              {!isReply && canPin() && (
                <button
                  onClick={() => handlePin(comment.id)}
                  className={`flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition-all ${
                    comment.isPinned
                      ? 'text-amber-500'
                      : 'text-gray-500 hover:text-amber-500'
                  }`}
                >
                  <Pin className="w-3 h-3" />
                  {comment.isPinned ? 'Unpin' : 'Pin'}
                </button>
              )}

              {/* Edit */}
              {canEdit(comment) && (
                <button
                  onClick={() => handleEditStart(comment)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-blue dark:hover:text-accent-red opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
              )}

              {/* Delete */}
              {canModify(comment) && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={deletingId === comment.id}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                >
                  {deletingId === comment.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                  Delete
                </button>
              )}
            </div>
          </>
        )}

        {/* Reply input */}
        {!isReply && replyingToId === comment.id && user && (
          <div className="mt-3 flex gap-2 items-start">
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt={user.name} width={24} height={24} className="object-cover" />
              ) : (
                <User className="w-full h-full p-1 text-gray-400" />
              )}
            </div>
            <div className="flex-1 relative">
              <MentionInput
                value={replyContent}
                onChange={setReplyContent}
                onSubmit={() => { if (replyContent.trim()) handleReplySubmit(comment.id); }}
                onCancel={handleReplyCancel}
                placeholder={`Reply to ${comment.user.name}... (@ to mention)`}
                submitting={replySubmitting}
                autoFocus
                className="flex-1"
                inputClassName="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full py-1.5 pl-3 pr-16 text-xs focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red text-gray-900 dark:text-white placeholder:text-gray-500"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                <button
                  onClick={handleReplyCancel}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleReplySubmit(comment.id)}
                  disabled={!replyContent.trim() || replySubmitting}
                  className="p-1 text-primary-blue dark:text-accent-red disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  {replySubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View replies toggle */}
        {!isReply && comment.replyCount > 0 && (
          <button
            onClick={() => handleLoadReplies(comment.id)}
            disabled={loadingReplies.has(comment.id)}
            className="flex items-center gap-1 mt-2 text-xs font-medium text-primary-blue dark:text-accent-red hover:underline transition-colors"
          >
            {loadingReplies.has(comment.id) ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : expandedReplies.has(comment.id) ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            {expandedReplies.has(comment.id)
              ? 'Hide replies'
              : `View ${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}`
            }
          </button>
        )}

        {/* Rendered replies */}
        {!isReply && expandedReplies.has(comment.id) && replies[comment.id] && (
          <div className="mt-3 space-y-4">
            {replies[comment.id].map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col bg-light-surface dark:bg-dark-surface">
      {/* Header with Sort */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comments
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({comments.length})</span>
        </h3>
        <div className="relative group/sort">
          <button className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            {sortOrder === 'newest' ? 'Newest First' : 'Top Comments'}
            <ChevronDown className="w-4 h-4" />
          </button>
          <div className="absolute right-0 top-full mt-1 w-40 bg-light-surface dark:bg-dark-surface rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 hidden group-hover/sort:block z-10">
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
              <MentionInput
                value={newComment}
                onChange={setNewComment}
                onSubmit={() => { if (newComment.trim()) handlePostComment(new Event('submit') as any); }}
                placeholder="Add a comment... (type @ to mention)"
                submitting={submitting}
                className="flex-1"
                inputClassName="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-full py-2 pl-4 pr-10 text-sm focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red text-gray-900 dark:text-white placeholder:text-gray-500"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary-blue dark:text-accent-red disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors z-10"
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
          comments.map((comment) => renderComment(comment))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        title="Sign in to comment"
        message="You need an account to comment on talent profiles. Continue to sign in or create an account."
        action="comment on profiles"
      />
    </div>
  );
}
