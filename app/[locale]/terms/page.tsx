import React from 'react';
import PageContent from '@/components/PageContent';
import Link from 'next/link';

const TermsAndConditions = () => {
  return (
    <PageContent title="Terms and Conditions">
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 -mx-4 px-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li>
              <Link href="/" className="hover:text-blue-600 dark:hover:text-red-500 transition-colors">
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">Terms and Conditions</span>
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Terms and Conditions</h1>
        
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">1. Platform Use</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Access to 3YESES is granted for discovering, showcasing, and engaging creative talent globally.
        </p>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Users agree to provide accurate personal information and maintain account security at all times.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">2. Eligibility & Parent Accounts</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Users under 18 require parent or guardian consent and must set up their profile through a verified parent account.
        </p>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Parent accounts can manage, monitor, and control their child's activities on the platform.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">3. Content and Conduct</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Users retain copyright to their uploads but grant 3YESES a license to display and share content for promotional and networking purposes.
        </p>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Inappropriate, fraudulent, or harmful behavior—including harassment, abuse, or uploading misleading profiles—is strictly prohibited.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">4. Verification and Matching</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Talent verification, background checks, and skill assessments may be required for some features and matched opportunities.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">5. Reviews and Community Rules</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Peer reviews, testimonials, and community-driven content are subject to moderation and must follow platform guidelines.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">6. Modifications and Termination</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          3YESES reserves the right to update the terms and suspend or terminate accounts breaching these policies.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">7. Limitation of Liability</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          3YESES is not liable for user-generated content, third-party interactions, or service interruptions.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">8. Governing Law</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Platform use is subject to laws and regulations of the UK; international users agree to local compliance as required.
        </p>
      </div>
    </PageContent>
  );
};

export default TermsAndConditions;