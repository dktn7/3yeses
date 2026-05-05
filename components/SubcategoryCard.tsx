import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SubcategoryCardProps {
  subcategory: {
    id: string;
    name: string;
    description: string;
    _count: {
      talentProfiles: number;
    };
  };
  onSelect: (subcategory: SubcategoryCardProps['subcategory']) => void;
}

export default function SubcategoryCard({ subcategory, onSelect }: SubcategoryCardProps) {
  const handleClick = () => {
    onSelect(subcategory);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(subcategory);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="group cursor-pointer bg-light-surface dark:bg-dark-surface rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-red-500 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500"
      aria-label={`Browse ${subcategory.name} professionals`}
    >
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {subcategory.name}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
        {subcategory.description}
      </p>
      
      <div className="flex items-center justify-end text-sm text-gray-500 dark:text-gray-400">
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
}
