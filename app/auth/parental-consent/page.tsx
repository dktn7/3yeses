'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Users, Check, X, Mail, ShieldCheck, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

function ParentalConsentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'pending' | 'waiting' | 'approved' | 'denied'>('pending');
  const [loading, setLoading] = useState(false);
  const [parentEmail, setParentEmail] = useState('');
  const [childEmail] = useState(searchParams?.get('email') || '');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user has already sent consent request
    const checkStatus = async () => {
      if (childEmail) {
        try {
          const response = await fetch(`/api/auth/parental-consent/status?email=${childEmail}`);
          if (response.ok) {
            const data = await response.json();
            setStatus(data.status || 'pending');
            if (data.parentEmail) {
              setParentEmail(data.parentEmail);
            }
          }
        } catch (error) {
          console.error('Failed to check consent status:', error);
        }
      }
    };

    checkStatus();
  }, [childEmail]);

  const handleRequestConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!parentEmail.trim()) {
      setError('Parent/Guardian email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (parentEmail.toLowerCase() === childEmail.toLowerCase()) {
      setError('Parent email must be different from your email');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/parental-consent/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childEmail,
          parentEmail,
        }),
      });

      if (response.ok) {
        setStatus('waiting');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send consent request');
      }
    } catch (err) {
      console.error('Consent request error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendRequest = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/parental-consent/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childEmail }),
      });
      alert('Consent request resent to parent/guardian');
    } catch (error) {
      console.error('Resend error:', error);
      alert('Failed to resend request');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'pending':
        return (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Parental Consent Required
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                As you're under 18, we need permission from your parent or guardian
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Why do we need this?
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 ml-7">
                <li>• We're required by law to get parental consent for users under 18</li>
                <li>• This helps keep you safe online</li>
                <li>• Your parent/guardian will receive an email to approve your account</li>
              </ul>
            </div>

            <form onSubmit={handleRequestConsent} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Email
                </label>
                <input
                  type="email"
                  value={childEmail}
                  disabled
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parent/Guardian Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="parentEmail"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all`}
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  We'll send them an email to approve your account
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending Request...
                  </span>
                ) : (
                  'Request Parental Consent'
                )}
              </button>
            </form>
          </>
        );

      case 'waiting':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Waiting for Parent Approval
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We've sent a consent request to:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <p className="font-medium text-gray-900 dark:text-white">{parentEmail}</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">What happens next?</h3>
              <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
                <li className="flex gap-2">
                  <span className="font-bold">1.</span>
                  <span>Your parent/guardian will receive an email with a secure link</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">2.</span>
                  <span>They'll review your account details and give consent</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">3.</span>
                  <span>Once approved, you'll receive an email and can access your account</span>
                </li>
              </ol>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleResendRequest}
                disabled={loading}
                className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Resending...' : 'Resend Request'}
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Haven't received the email? Check spam folder or resend above
              </p>
            </div>
          </div>
        );

      case 'approved':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Consent Approved!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your parent/guardian has approved your account. You can now sign in.
            </p>
            <button
              onClick={() => router.push('/auth/signin')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              Continue to Sign In
            </button>
          </div>
        );

      case 'denied':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Consent Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your parent/guardian has not approved your account at this time.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Please speak with them about creating an account on 3yeses.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <li>
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <Link href="/auth/signup" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Sign Up
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">Parental Consent</span>
            </li>
          </ol>
        </nav>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {renderContent()}
        </div>

        {status === 'pending' && (
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              Need help?{' '}
              <Link
                href="/contact"
                className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Contact Support
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ParentalConsentPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-white dark:bg-gray-900"><LoadingSpinner /></div>}>
      <ParentalConsentContent />
    </Suspense>
  );
}
