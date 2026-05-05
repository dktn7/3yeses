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
      className="group cursor-pointer bg-light-surface dark:bg-dark-surface rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-red-500 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500"
      aria-label={`Browse ${category.name} category`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 p-3 rounded-2xl bg-primary-blue dark:bg-accent-red transition-colors">
          {getCategoryIcon(category.icon)}
        </div>
        
        <h3 className="text-xl font-semibold text-light-surface dark:text-dark-surface mb-2">
          {category.name}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {category.description}
        </p>
      </div>
    </div>
  );
}
