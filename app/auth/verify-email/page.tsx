'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Mail, Check, X, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations('Auth.verifyEmail');
  const email = searchParams?.get ? searchParams.get('email') : null;
  
  // Extract locale for dashboard redirect
  const pathSegments = pathname?.split('/').filter(Boolean) || [];
  const validLocales = ['en-gb', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-PT', 'ru-RU', 'ja-JP', 'zh-CN', 'ar'];
  const firstSegment = pathSegments[0] || 'en-gb';
  const locale = validLocales.includes(firstSegment) ? firstSegment : 'en-gb';
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | 'expired'>('pending');
  const [loading, setLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);

  useEffect(() => {
    if (!email) {
      router.push('/auth/signin');
      return;
    }

    // Auto-verify for demo purposes after 3 seconds
    const timer = setTimeout(() => {
      setVerificationStatus('success');
    }, 3000);

    return () => clearTimeout(timer);
  }, [email, router]);

  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => setCooldownTime(cooldownTime - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  const handleResendEmail = async () => {
    if (cooldownTime > 0 || resendCount >= 3) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResendCount(resendCount + 1);
      setCooldownTime(60); // 1 minute cooldown
      
      // Show success message
      alert('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Failed to resend email:', error);
      alert('Failed to resend email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (verificationStatus === 'success') {
      router.push(`/${locale}/dashboard`);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <Check className="h-16 w-16 text-green-500" />;
      case 'error':
        return <X className="h-16 w-16 text-red-500" />;
      case 'expired':
        return <X className="h-16 w-16 text-orange-500" />;
      default:
        return <Mail className="h-16 w-16 text-primary-blue animate-pulse" />;
    }
  };

  const getStatusMessage = () => {
    switch (verificationStatus) {
      case 'success':
        return {
          title: t('success.title'),
          message: t('success.message'),
          action: t('success.button')
        };
      case 'error':
        return {
          title: t('error.title'),
          message: t('error.message'),
          action: t('resend')
        };
      case 'expired':
        return {
          title: t('expired.title'),
          message: t('expired.message'),
          action: t('resend')
        };
      default:
        return {
          title: t('pending.title'),
          message: t('pending.message'),
          action: t('resend')
        };
    }
  };

  if (!email) {
    return null;
  }

  const status = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back Link */}
        <div className="mb-6">
          <Link 
            href="/auth/signin"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary-blue transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Registration
          </Link>
        </div>

        {/* Logo/Title */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Email Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Secure your account with email verification
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>

          {/* Status Message */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {status.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {status.message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {verificationStatus === 'success' ? (
              <button
                onClick={handleContinue}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-blue to-primary-red hover:from-blue-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue transition-all duration-200"
              >
                {status.action}
              </button>
            ) : (
              <button
                onClick={handleResendEmail}
                disabled={loading || cooldownTime > 0 || resendCount >= 3}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    {t('resending')}
                  </div>
                ) : cooldownTime > 0 ? (
                  t('cooldown', { seconds: cooldownTime })
                ) : resendCount >= 3 ? (
                  t('maxAttempts')
                ) : (
                  status.action
                )}
              </button>
            )}

            {/* Additional Options */}
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {t('checkSpam')}
              </p>
              {resendCount > 0 && (
                <p className="text-xs text-gray-400">
                  {t('attemptsRemaining', { count: resendCount })}
                </p>
              )}
            </div>
          </div>

          {/* Support Link */}
          <div className="mt-6 text-center">
            <Link
              href={`/${locale}/contact`}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t('needHelp')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
      <LoadingSpinner />
    </div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
