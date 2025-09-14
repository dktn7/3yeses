import Link from 'next/link';

export default function PricingPage() {
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
        <h1 className="text-3xl font-bold text-primary-blue dark:text-accent-red mb-6">
          Pricing Plans
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Basic</h2>
            <div className="text-3xl font-bold mb-4 text-primary-blue dark:text-accent-red">
              Free
            </div>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• Browse talent profiles</li>
              <li>• Basic search filters</li>
              <li>• View contact information</li>
              <li>• Up to 5 messages per month</li>
            </ul>
          </div>
          
          {/* Pro Plan */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-primary-blue dark:border-accent-red">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Professional</h2>
            <div className="text-3xl font-bold mb-4 text-primary-blue dark:text-accent-red">
              $29<span className="text-lg">/month</span>
            </div>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• Advanced search filters</li>
              <li>• Unlimited messaging</li>
              <li>• Priority support</li>
              <li>• Analytics dashboard</li>
            </ul>
          </div>
          
          {/* Enterprise Plan */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Enterprise</h2>
            <div className="text-3xl font-bold mb-4 text-primary-blue dark:text-accent-red">
              Custom
            </div>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• Custom integrations</li>
              <li>• Dedicated account manager</li>
              <li>• White-label options</li>
              <li>• Volume discounts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
