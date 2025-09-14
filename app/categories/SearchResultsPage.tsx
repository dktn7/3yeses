import React from 'react';
import { Users } from 'lucide-react';
import EmptyState from '@/components/EmptyState';

interface SearchResult {
  id: string;
  type: 'category' | 'subcategory' | 'talent';
  name: string;
  description?: string;
  parentName?: string;
}

interface SearchResultsPageProps {
  query: string;
  results: SearchResult[];
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ query, results }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
          Search Results
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Showing results for <span className="font-semibold text-blue-600 dark:text-red-400">&quot;{query}&quot;</span>
        </p>
        {results.length === 0 ? (
          <EmptyState
            title="No Results Found"
            description="Try a different search term or adjust your filters."
            icon={<Users className="w-16 h-16 text-gray-400" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {result.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  {result.description}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                  {result.parentName && (
                    <span> in <span className="font-semibold">{result.parentName}</span></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
