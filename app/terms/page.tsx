import Link from 'next/link';

export default function TermsPage() {
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
          Terms of Service
        </h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-lg mb-6 text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Platform Usage
            </h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Users must provide accurate and truthful information</li>
                <li>• Professional conduct is required in all interactions</li>
                <li>• Content must be original and properly licensed</li>
                <li>• Harassment or discrimination is strictly prohibited</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Payment and Fees
            </h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Subscription fees are billed monthly or annually</li>
                <li>• All payments are processed securely through our payment partners</li>
                <li>• Refunds are available within 30 days of subscription</li>
                <li>• Platform fees may apply to certain transactions</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Intellectual Property
            </h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Users retain ownership of their uploaded content while granting 3YESES a license to display 
                and distribute this content for platform purposes.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                The 3YESES platform, including its design, features, and technology, is protected by copyright 
                and other intellectual property laws.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Limitation of Liability
            </h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400">
                3YESES acts as a platform connecting professionals and is not responsible for the quality 
                or outcome of professional relationships formed through our service.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Contact Information
            </h2>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400">
                For questions about these Terms of Service, contact us at legal@3yeses.com
              </p>
            </div>
          </section>
        </div>
        </div>
      </div>
    </div>
  );
}