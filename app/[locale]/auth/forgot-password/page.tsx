'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { MdEmail, MdCheckCircle } from 'react-icons/md';

export default function ForgotPasswordPage() {
  const t = useTranslations('Auth.forgotPassword');
  const tNav = useTranslations('Navigation');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError(t('errors.emailRequired'));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('errors.emailInvalid'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, locale }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.error || t('errors.requestFailed'));
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(t('errors.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <li>
              <Link href="/" className="hover:text-blue-600 dark:hover:text-red-300 transition-colors">
                {tNav('home')}
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <Link href="/auth/signin" className="hover:text-blue-600 dark:hover:text-red-300 transition-colors">
                {t('signIn')}
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">{t('title')}</span>
            </li>
          </ol>
        </nav>

        {/* Forgot Password Card */}
        <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MdEmail className="text-3xl text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent mb-2">
                  {t('title')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('subtitle')}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-200 text-sm font-medium">
                    {error}
                  </p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      error
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-light-surface dark:bg-dark-surface text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red focus:border-transparent transition-all`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-primary-blue to-accent-blue dark:from-accent-red dark:to-primary-red hover:opacity-95 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('sending')}
                    </span>
                  ) : (
                    t('submit')
                  )}
                </button>
              </form>

              {/* Back to Sign In */}
              <div className="mt-6 text-center">
                <Link
                  href="/auth/signin"
                  className="text-sm font-medium text-primary-blue hover:text-accent-blue dark:text-accent-red dark:hover:text-red-300 transition-colors"
                >
                  {t('backToSignIn')}
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MdCheckCircle className="text-4xl text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {t('success.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t('success.message')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
                  {t('success.checkSpam')}
                </p>
                <Link
                  href="/auth/signin"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-primary-blue to-accent-blue dark:from-accent-red dark:to-primary-red hover:opacity-95 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  {t('backToSignInButton')}
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            {t('rememberPasswordPrompt')}{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-primary-blue hover:text-accent-blue dark:text-accent-red dark:hover:text-red-300 transition-colors"
            >
              {t('signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
