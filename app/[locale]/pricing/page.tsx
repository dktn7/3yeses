import React from 'react';
import PageContent from '@/components/PageContent';

const PricingPage = () => {
  return (
    <PageContent title="Pricing Plans">
      <div className="container mx-auto py-8">
        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-8">
          Choose the plan that&apos;s right for you.
        </p>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">For Talents</h2>
        <div className="max-w-md mx-auto mb-12">
          {/* Standard Talent Plan */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg border-2 border-blue-500 dark:border-blue-300 shadow-lg">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100 text-center">Standard Access</h3>
            <div className="text-4xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">
              £10 <span className="text-lg text-gray-500 dark:text-gray-400 font-normal">/ 6 months</span>
            </div>
            <ul className="space-y-4 text-gray-600 dark:text-gray-300 mb-8">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Full Profile Customization
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Unlimited Portfolio Uploads
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Direct Messaging
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Priority Search Ranking
              </li>
            </ul>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200">
              Subscribe with Stripe
            </button>
          </div>
        </div>

        {/* Talent-only pricing plans */}
      </div>
    </PageContent>
  );
};

export default PricingPage;