'use client';

import React, { useState } from 'react';
import { Flag, AlertCircle, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface FlagButtonProps {
  mediaId: string;
  contentType?: 'IMAGE' | 'VIDEO' | 'AUDIO';
  talentName?: string;
  onReportSubmitted?: () => void;
}

type ReportCategory = 'nsfw' | 'violence' | 'hate' | 'spam' | 'copyright' | 'harassment' | 'misinformation' | 'other';

const REPORT_CATEGORIES: { value: ReportCategory; label: string; description: string }[] = [
  { value: 'nsfw', label: 'NSFW Content', description: 'Sexual or adult content' },
  { value: 'violence', label: 'Violence', description: 'Violent or graphic content' },
  { value: 'hate', label: 'Hate Speech', description: 'Discrimination or hate speech' },
  { value: 'spam', label: 'Spam', description: 'Spam or misleading content' },
  { value: 'copyright', label: 'Copyright', description: 'Copyright infringement' },
  { value: 'harassment', label: 'Harassment', description: 'Harassment or bullying' },
  { value: 'misinformation', label: 'Misinformation', description: 'False or misleading information' },
  { value: 'other', label: 'Other', description: 'Something else' }
];

export default function FlagButton({ mediaId, contentType = 'VIDEO', talentName, onReportSubmitted }: FlagButtonProps) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFlagClick = () => {
    if (!user) {
      setErrorMessage('Please log in to report content');
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
      return;
    }
    setShowModal(true);
  };

  const handleSubmitReport = async () => {
    if (!selectedCategory) {
      setErrorMessage('Please select a category');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/moderation/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: mediaId,
          contentType,
          reason: description,
          category: selectedCategory,
          reportedById: user?.id
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit report');
      }

      setSubmitStatus('success');
      setShowModal(false);
      setSelectedCategory(null);
      setDescription('');
      onReportSubmitted?.();
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to submit report');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Flag Button */}
      <button
        onClick={handleFlagClick}
        className="flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all font-medium text-sm group"
        title="Report this content"
        aria-label="Flag or report content"
      >
        <Flag className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">Report</span>
      </button>

      {/* Toast Notifications */}
      {submitStatus === 'success' && (
        <div className="fixed bottom-4 right-4 px-4 py-3 bg-green-500 text-white rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2 z-[200]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Report submitted successfully</span>
          </div>
        </div>
      )}

      {submitStatus === 'error' && errorMessage && (
        <div className="fixed bottom-4 right-4 px-4 py-3 bg-red-500 text-white rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2 z-[200]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[150] bg-black/50 flex items-center justify-center p-4 pt-20">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-600 dark:text-red-400" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Report Content</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content Info */}
            {talentName && (
              <div className="px-6 pt-4 pb-2 text-sm text-gray-600 dark:text-gray-400">
                Reporting {contentType.toLowerCase()} from <span className="font-medium text-gray-900 dark:text-white">{talentName}</span>
              </div>
            )}

            {/* Category Selection */}
            <div className="p-6 space-y-3">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">
                What's wrong with this content?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {REPORT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedCategory === cat.value
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{cat.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{cat.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="px-6 pb-4">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Additional Details (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                placeholder="Provide more context about this report..."
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows={3}
              />
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {description.length}/500 characters
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={!selectedCategory || isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
