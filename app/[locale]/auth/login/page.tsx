'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import SwoopingTick from '@/components/SwoopingTick';
import { buildLocalizedPath } from '@/lib/locale-path';

export default function LoginPage() {
  const t = useTranslations('LoginPage');
  const tNav = useTranslations('Navigation');
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get current locale from pathname, validating against allowed locales
  const pathSegments = pathname?.split('/').filter(Boolean) || [];
  const validLocales = ['en-gb', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-PT', 'ru-RU', 'ja-JP', 'zh-CN', 'ar'];
  const firstSegment = pathSegments[0] || 'en-gb';
  const locale = validLocales.includes(firstSegment) ? firstSegment : 'en-gb';

  const breadcrumbItems = [
    { label: tNav('home'), href: buildLocalizedPath(locale, '/') },
    { label: t('title') }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresEmailVerification) {
          setError('Please verify your email address before logging in. Check your inbox for the verification link.');
        } else if (data.requiresParentalConsent) {
          setError('Your account is pending parental consent approval. We\'ve sent an email to your parent/guardian.');
        } else if (data.error === 'Invalid email address') {
          setError('The email address you entered is not registered. Please check your email or sign up for a new account.');
        } else if (data.error === 'Invalid password') {
          setError('The password you entered is incorrect. Please try again or reset your password.');
        } else {
          setError(data.error || 'Login failed. Please try again.');
        }
        setLoading(false);
        return;
      }

      // Success - redirect to intended page or dashboard
      console.log('Login successful:', data.user);
      router.push(redirectTo || buildLocalizedPath(locale, '/dashboard'));
      
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 dark:from-[#1a0508] dark:via-[#2d080d] dark:to-[#0f0204] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <li>
              <Link href={buildLocalizedPath(locale, '/')} className="hover:text-primary-blue dark:hover:text-accent-red transition-colors">
                {tNav('home')}
              </Link>
            </li>
            <li className="text-gray-400 dark:text-gray-500">/</li>
            <li className="text-gray-900 dark:text-white font-medium">{t('title')}</li>
          </ol>
        </nav>

        {/* Card */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-200 dark:border-gray-700/50 p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <SwoopingTick size={52} className="text-[var(--brand-primary)]" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-red-500 dark:to-red-700 bg-clip-text text-transparent">{t('title')}</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
          </div>
          
          {error && (
            <div className="p-3 text-sm text-red-800 bg-red-100 border border-red-200 rounded-xl dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="block w-full px-4 py-2.5 text-gray-900 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red focus:border-transparent text-sm transition-all disabled:opacity-50"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="block w-full px-4 py-2.5 text-gray-900 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red focus:border-transparent text-sm transition-all disabled:opacity-50"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 text-primary-blue dark:text-accent-red focus:ring-primary-blue dark:focus:ring-accent-red border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  {t('rememberMe')}
                </label>
              </div>

              <div className="text-sm">
                <Link href={buildLocalizedPath(locale, '/auth/forgot-password')} className="font-medium text-primary-blue dark:text-accent-red hover:opacity-80 transition-opacity">
                  {t('forgotPassword')}
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-blue to-blue-700 dark:from-accent-red dark:to-red-800 shadow-lg shadow-primary-blue/20 dark:shadow-accent-red/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue dark:focus:ring-accent-red disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? 'Logging in...' : t('submit')}
              </button>
            </div>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('noAccount')}{' '}
              <Link href={buildLocalizedPath(locale, '/auth/signup')} className="font-medium text-primary-blue dark:text-accent-red hover:opacity-80 transition-opacity">
                {t('signUpLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
