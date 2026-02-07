import React from 'react';
import PageContent from '@/components/PageContent';
import Link from 'next/link';

const PrivacyPolicy = () => {
  return (
    <PageContent title="Privacy Policy">
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
              <span className="text-gray-900 dark:text-gray-100 font-medium">Privacy Policy</span>
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Privacy Policy</h1>
        
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">1. Data Collection</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          3YESES collects registration information, talent profiles, usage data, and parent account details. Underage user data is only collected and processed with parent/guardian consent.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">2. Use of Data</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Data is used to personalize matching, enhance user experience, verify talent credentials, and maintain platform security.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">3. Protection & Encryption</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          All sensitive data, messages, and personal details are encrypted and stored securely following GDPR and UK privacy regulations.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">4. Underage Talent Safeguarding</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Profiles for users under 18 are shielded from public listing by default unless explicitly permitted by a parent.
        </p>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Parent accounts have access to all messages, connections, and activity logs of their child.
        </p>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Sensitive information (such as addresses or contact details) is never disclosed to third parties or recruiters without parent approval.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">5. Data Sharing</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Data is not sold to marketers or used for unrelated third-party advertising.
        </p>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Where required, data may be shared with verified partners for talent opportunities, with explicit parental approval for minors.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">6. Rights and Choices</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Users and parents can request access, modification, or deletion of their data at any time.
        </p>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Parents may deactivate or permanently remove their child’s account and associated data.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">7. Updates</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          The Privacy Policy may be updated; significant changes will be communicated to all users and especially parent accounts.
        </p>
      </div>
    </PageContent>
  );
};

export default PrivacyPolicy;