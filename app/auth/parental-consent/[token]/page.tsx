'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { MdCheckCircle, MdError, MdWarning } from 'react-icons/md';

export default function ParentalConsentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = params.token as string;
  const action = searchParams.get('action'); // 'approve' or 'decline'
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'initial'>('initial');
  const [message, setMessage] = useState('');
  const [teenName, setTeenName] = useState('');
  const [parentName, setParentName] = useState('');

  // If action is in URL, auto-submit
  useEffect(() => {
    if (action === 'approve' || action === 'decline') {
      handleSubmit(action);
    } else {
      // Load token info for manual decision
      loadTokenInfo();
    }
  }, [action]);

  const loadTokenInfo = async () => {
    try {
      setStatus('loading');
      const response = await fetch(`/api/auth/parental-consent/${token}`);
      const data = await response.json();

      if (response.ok) {
        setTeenName(data.teenName || 'your child');
        setParentName(data.parentName || '');
        setStatus('initial');
      } else if (response.status === 410) {
        setStatus('expired');
        setMessage(data.error || 'This consent link has expired');
      } else {
        setStatus('error');
        setMessage(data.error || 'Invalid consent link');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to load consent information');
    }
  };

  const handleSubmit = async (decision: string) => {
    setLoading(true);
    setStatus('loading');

    try {
      const response = await fetch(`/api/auth/parental-consent/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: decision }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(decision === 'approve' 
          ? 'Account approved! The user has been notified and can now access their account.'
          : 'Account declined. The registration has been cancelled.'
        );
        setTeenName(data.teenName || 'the user');
      } else if (response.status === 410) {
        setStatus('expired');
        setMessage(data.error || 'This consent link has expired');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to process your decision');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
      <div className="max-w-2xl w-full">
        
        {/* Card */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Parental Consent
            </h1>
            <p className="text-gray-600 dark:text-gray-400">3yeses Talent Platform</p>
          </div>

          {/* Loading State */}
          {status === 'loading' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Processing...</p>
            </div>
          )}

          {/* Initial State - Show decision options */}
          {status === 'initial' && (
            <div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
                <div className="flex items-start">
                  <MdWarning className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="text-blue-800 dark:text-blue-300 font-semibold mb-1">
                      Account Approval Request
                    </h3>
                    <p className="text-blue-700 dark:text-blue-400 text-sm">
                      {teenName} has requested to create a self-managed account on 3yeses. 
                      Please review and make your decision below.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What this means:</h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1 text-sm">
                    <li>{teenName} will have their own login credentials</li>
                    <li>They can create and manage their talent profile</li>
                    <li>They can apply for opportunities and showcase their skills</li>
                    <li>Enhanced safety controls will be applied to their account</li>
                    <li>You can request access to monitor the account at any time</li>
                  </ul>
                </div>
              </div>

              <p className="text-center text-gray-700 dark:text-gray-300 font-medium mb-6">
                Do you consent to {teenName} having a self-managed account?
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => handleSubmit('approve')}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <MdCheckCircle size={20} />
                  Approve Account
                </button>
                <button
                  onClick={() => handleSubmit('decline')}
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <MdError size={20} />
                  Decline Account
                </button>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
                If you have any questions or concerns, please contact us at support@3yeses.com
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <MdCheckCircle className="text-green-600 dark:text-green-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Decision Recorded
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {message}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You can now close this window.
              </p>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <MdError className="text-red-600 dark:text-red-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Error
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {message}
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Go to Homepage
              </button>
            </div>
          )}

          {/* Expired State */}
          {status === 'expired' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
                <MdWarning className="text-yellow-600 dark:text-yellow-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Link Expired
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {message}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Please contact support@3yeses.com if you need a new consent link.
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                Go to Homepage
              </button>
            </div>
          )}

        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          © {new Date().getFullYear()} 3yeses. All rights reserved.
        </p>
      </div>
    </div>
  );
}
