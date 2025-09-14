import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
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

      <div className="p-8">
        <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-blue dark:text-accent-red mb-8">
          Privacy Policy
        </h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-lg mb-6 text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Information We Collect
            </h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Profile information (name, contact details, professional experience)</li>
                <li>• Portfolio content (photos, videos, demo reels)</li>
                <li>• Usage data and platform interactions</li>
                <li>• Communication records and messages</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              How We Use Your Information
            </h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• To connect talent with casting opportunities</li>
                <li>• To improve our search and matching algorithms</li>
                <li>• To provide customer support and platform updates</li>
                <li>• To ensure platform security and prevent fraud</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Data Protection
            </h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400">
                We implement industry-standard security measures to protect your personal information. 
                Your data is encrypted in transit and at rest, and we regularly audit our security practices.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Contact Us
            </h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400">
                If you have questions about this Privacy Policy, please contact us at privacy@3yeses.com
              </p>
            </div>
          </section>
        </div>
        </div>
      </div>
    </div>
  );
}