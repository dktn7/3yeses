import React from 'react';
import PageContent from '@/components/PageContent';

const ResourcesPage = () => {
  return (
    <PageContent title="Resources">
      <div className="container mx-auto py-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Talent Resources</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Welcome to the resources page! Here you'll find helpful links, articles, and tools to support your career as a talent.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Useful Links</h2>
        <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
          <li><a href="#" className="text-blue-500 hover:underline">Link 1</a></li>
          <li><a href="#" className="text-blue-500 hover:underline">Link 2</a></li>
          <li><a href="#" className="text-blue-500 hover:underline">Link 3</a></li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Recommended Articles</h2>
        <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
          <li><a href="#" className="text-blue-500 hover:underline">Article 1</a></li>
          <li><a href="#" className="text-blue-500 hover:underline">Article 2</a></li>
          <li><a href="#" className="text-blue-500 hover:underline">Article 3</a></li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Helpful Tools</h2>
        <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
          <li><a href="#" className="text-blue-500 hover:underline">Tool 1</a></li>
          <li><a href="#" className="text-blue-500 hover:underline">Tool 2</a></li>
          <li><a href="#" className="text-blue-500 hover:underline">Tool 3</a></li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Career Advice</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Looking for career advice? Check out these articles:
        </p>
        <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
          <li><a href="#" className="text-blue-500 hover:underline">Building Your Brand</a></li>
          <li><a href="#" className="text-blue-500 hover:underline">Networking Tips</a></li>
          <li><a href="#" className="text-blue-500 hover:underline">Negotiating Rates</a></li>
        </ul>
      </div>
    </PageContent>
  );
};

export default ResourcesPage;