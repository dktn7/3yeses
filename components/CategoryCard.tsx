import React from 'react';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    description: string;
    icon: string;
    _count: {
      talentProfiles: number;
      subcategories: number;
    };
  };
  onSelect: (category: CategoryCardProps['category']) => void;
  getCategoryIcon: (iconName: string) => React.ReactNode;
}

export default function CategoryCard({ category, onSelect, getCategoryIcon }: CategoryCardProps) {
  const handleClick = () => {
    onSelect(category);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(category);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="group cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500"
      aria-label={`Browse ${category.name} category`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-full group-hover:bg-blue-500 dark:group-hover:bg-red-500 transition-colors">
          {getCategoryIcon(category.icon)}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {category.name}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {category.description}
        </p>
      </div>
    </div>
  );
}
