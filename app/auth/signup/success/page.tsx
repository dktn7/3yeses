'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Star, Users, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/Footer';

export default function SignupSuccess() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Auto-redirect after countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-primary-blue to-primary-red">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-blue dark:bg-accent-red flex items-center justify-center">
              <span className="text-white font-bold text-sm">3Y</span>
            </div>
            <span className="text-xl font-bold text-primary-blue dark:text-accent-red">3YESES</span>
          </Link>
        </div>
      </header>

      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-4">
              <Check className="h-16 w-16 text-green-500" />
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
              Welcome to 3 Yes&apos;s!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              Your account has been created successfully
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You&apos;re now ready to start connecting with amazing opportunities
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3 mb-2">
                <Users className="h-6 w-6 text-blue-500 mx-auto" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Join 10K+</p>
              <p className="text-xs font-medium text-gray-900 dark:text-white">Talents</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-lg p-3 mb-2">
                <Star className="h-6 w-6 text-yellow-500 mx-auto" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Average</p>
              <p className="text-xs font-medium text-gray-900 dark:text-white">4.9★ Rating</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-3 mb-2">
                <Calendar className="h-6 w-6 text-green-500 mx-auto" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Book</p>
              <p className="text-xs font-medium text-gray-900 dark:text-white">Same Day</p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              What&apos;s Next?
            </h3>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              <li className="flex items-center">
                <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                Complete your profile verification
              </li>
              <li className="flex items-center">
                <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                Browse available opportunities
              </li>
              <li className="flex items-center">
                <Check className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                Start building your reputation
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-blue to-primary-red hover:from-blue-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue transition-all duration-200"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>

            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Redirecting automatically in {countdown} seconds...
              </p>
            </div>
          </div>

          {/* Support */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Need help?{' '}
              <Link href="/contact" className="text-primary-blue hover:text-blue-800">
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-white opacity-10 rounded-full"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-white opacity-10 rounded-full"></div>
      </div>
    </div>
    </div>
    <Footer />
    </>
  );
}
