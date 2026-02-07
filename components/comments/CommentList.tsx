'use client';

import { useState } from 'react';
import CommentItem from './CommentItem';

interface CommentListProps {
  comments: any[];
  onCommentDeleted: (commentId: string) => void;
  portfolioItemId?: string;
  talentProfileId?: string;
}

export default function CommentList({
  comments,
  onCommentDeleted,
  portfolioItemId,
  talentProfileId,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No comments yet. Be the first to comment!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onCommentDeleted={onCommentDeleted}
          portfolioItemId={portfolioItemId}
          talentProfileId={talentProfileId}
        />
      ))}
    </div>
  );
}
