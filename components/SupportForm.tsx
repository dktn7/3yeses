"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Dropdown from './Dropdown';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  { value: 'ACCOUNT', label: 'catAccount' },
  { value: 'BILLING', label: 'catBilling' },
  { value: 'PORTFOLIO', label: 'catPortfolio' },
  { value: 'CATEGORIES', label: 'catCategories' },
  { value: 'NOTIFICATIONS', label: 'catNotifications' },
  { value: 'SECURITY', label: 'catSecurity' },
  { value: 'OTHER', label: 'catOther' },
] as const;

type CategoryValue = typeof CATEGORIES[number]['value'];

type Props = {
  onSuccess?: (ticketId: string) => void;
  defaultCategory?: CategoryValue;
};

export default function SupportForm({ onSuccess, defaultCategory }: Props) {
  const t = useTranslations('support');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<CategoryValue>(defaultCategory ?? 'OTHER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = { subject, message, category };

      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || t('formError'));
        setLoading(false);
        return;
      }

      setSuccessId(json.ticketId);
      setSubject('');
      setMessage('');
      setCategory(defaultCategory ?? 'OTHER');
      if (onSuccess) onSuccess(json.ticketId);
    } catch {
      setError(t('formNetworkError'));
    } finally {
      setLoading(false);
    }
  }

  if (successId) {
    return (
      <div className="rounded-2xl backdrop-blur-xl bg-green-50/80 dark:bg-green-900/20 border border-green-200/60 dark:border-green-500/20 p-6 text-center">
        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400 mx-auto mb-3" />
        <h3 className="font-bold text-green-800 dark:text-green-300 text-lg mb-1">{t('formSuccess')}</h3>
        <p className="text-sm text-green-700 dark:text-green-400/80">
          {t('formSuccessMsg', { ticketId: successId })}
        </p>
        <button
          type="button"
          onClick={() => setSuccessId(null)}
          className="mt-4 text-sm font-medium text-primary-blue dark:text-accent-red hover:underline"
        >
          {t('formSubmitAnother')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50/80 dark:bg-red-900/20 border border-red-200/60 dark:border-red-500/20">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Category */}
      <div>
        <label htmlFor="ticket-category" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
          {t('formCategory')}
        </label>
        <Dropdown
          options={CATEGORIES.map((c) => ({ value: c.value, label: t(c.label) }))}
          value={category}
          onChange={(v) => setCategory(v)}
          ariaLabel={t('formCategoryAria')}
        />
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="ticket-subject" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
          {t('formSubject')}
        </label>
        <input
          id="ticket-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={t('formSubjectPlaceholder')}
          className="w-full rounded-xl border border-gray-200/60 dark:border-white/10 backdrop-blur-xl bg-light-surface dark:bg-dark-surface px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 dark:focus:ring-accent-red/30 focus:border-primary-blue dark:focus:border-accent-red transition-all"
          required
          minLength={3}
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="ticket-message" className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
          {t('formDescription')}
        </label>
        <textarea
          id="ticket-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder={t('formDescPlaceholder')}
          className="w-full rounded-xl border border-gray-200/60 dark:border-white/10 backdrop-blur-xl bg-light-surface dark:bg-dark-surface px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue/30 dark:focus:ring-accent-red/30 focus:border-primary-blue dark:focus:border-accent-red transition-all resize-none"
          required
          minLength={10}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-blue via-accent-blue to-accent-red dark:from-accent-red dark:via-primary-red dark:to-red-900 text-white font-semibold px-6 py-3.5 text-sm shadow-lg shadow-primary-blue/20 dark:shadow-accent-red/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {t('formSubmitting')}
          </span>
        ) : (
          <>
            <Send className="w-4 h-4" />
            {t('formSubmit')}
          </>
        )}
      </button>
    </form>
  );
}
