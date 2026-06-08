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
      className="group category-card cursor-pointer rounded-xl transition-all duration-200 p-6 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[var(--brand-ring)]"
      aria-label={`Browse ${category.name} category`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="category-icon-box mb-4 p-3 rounded-2xl transition-all duration-200 group-hover:scale-[1.03]">
          <div className="category-icon-accent [&_svg]:h-10 [&_svg]:w-10 [&_svg]:transition-colors">
            {getCategoryIcon(category.icon)}
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          {category.name}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {category.description}
        </p>
      </div>
    </div>
  );
}
