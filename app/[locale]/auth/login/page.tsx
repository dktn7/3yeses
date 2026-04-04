'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import SwoopingTick from '@/components/SwoopingTick';

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
    { label: tNav('home'), href: `/${locale}` },
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
      router.push(redirectTo || `/${locale}/dashboard`);
      
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="py-8 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex items-center justify-center mt-8">
          <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <SwoopingTick size={64} className="text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
            </div>
            
            {error && (
              <div className="p-3 text-sm text-red-800 bg-red-100 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {error}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    {t('rememberMe')}
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                    {t('forgotPassword')}
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Logging in...' : t('submit')}
                </button>
              </div>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('noAccount')}{' '}
                <Link href={`/${locale}/auth/signup`} className="font-medium text-blue-600 hover:text-blue-500">
                  {t('signUpLink')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}