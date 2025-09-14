'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Check, X, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | 'expired'>('pending');
  const [loading, setLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);

  useEffect(() => {
    if (!email) {
      router.push('/auth/signup/step-1');
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
      router.push('/auth/signup/step-2');
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
          title: 'Email Verified Successfully!',
          message: 'Your email has been verified. You can now continue with your registration.',
          action: 'Continue to Profile Setup'
        };
      case 'error':
        return {
          title: 'Verification Failed',
          message: 'We couldn\'t verify your email. Please try again or request a new verification email.',
          action: 'Try Again'
        };
      case 'expired':
        return {
          title: 'Verification Link Expired',
          message: 'This verification link has expired. Please request a new one.',
          action: 'Resend Email'
        };
      default:
        return {
          title: 'Check Your Email',
          message: `We've sent a verification link to ${email}. Please check your inbox and click the link to verify your account.`,
          action: 'Resend Email'
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
            href="/auth/signup/step-1"
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Sending...
                  </div>
                ) : cooldownTime > 0 ? (
                  `Resend in ${cooldownTime}s`
                ) : resendCount >= 3 ? (
                  'Max attempts reached'
                ) : (
                  status.action
                )}
              </button>
            )}

            {/* Additional Options */}
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Didn&apos;t receive the email? Check your spam folder.
              </p>
              {resendCount > 0 && (
                <p className="text-xs text-gray-400">
                  Emails sent: {resendCount}/3
                </p>
              )}
            </div>
          </div>

          {/* Support Link */}
          <div className="mt-6 text-center">
            <Link
              href="/contact"
              className="text-sm text-primary-blue hover:text-blue-800"
            >
              Need help? Contact support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
