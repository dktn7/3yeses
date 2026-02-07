'use client';

export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { MdAccountCircle, MdWork, MdCloudUpload } from 'react-icons/md';

export default function SignupPage() {
  const router = useRouter();
  const t = useTranslations('Auth.signup');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <li>
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">Sign Up</span>
            </li>
          </ol>
        </nav>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent mb-3">
              {t('title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {t('subtitle')}
            </p>
          </div>

          {/* Step Progress */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-4 md:gap-8">
              {/* Step 1 */}
              <div className="flex flex-col items-center flex-1 max-w-xs">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center mb-3 shadow-lg">
                  <MdAccountCircle className="text-3xl text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('step1Title')}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">{t('step1Description')}</span>
              </div>

              {/* Connector */}
              <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-red-600 rounded-full hidden md:block" />

              {/* Step 2 */}
              <div className="flex flex-col items-center flex-1 max-w-xs">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-red-600 flex items-center justify-center mb-3 shadow-lg">
                  <MdWork className="text-3xl text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('step2Title')}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">{t('step2Description')}</span>
              </div>

              {/* Connector */}
              <div className="h-1 w-12 bg-gradient-to-r from-red-600 to-red-700 rounded-full hidden md:block" />

              {/* Step 3 */}
              <div className="flex flex-col items-center flex-1 max-w-xs">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center mb-3 shadow-lg">
                  <MdCloudUpload className="text-3xl text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('step3Title')}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">{t('step3Description')}</span>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => router.push('/auth/signup/step-1')}
              className="w-full max-w-md py-4 px-6 bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white font-bold text-lg rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              {t('startButton')}
            </button>

            {/* Sign In Link */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('alreadyHaveAccount')}{' '}
              <Link
                href="/auth/signin"
                className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                {t('signIn')}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
