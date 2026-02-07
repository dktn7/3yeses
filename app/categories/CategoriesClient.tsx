'use client';

import { useState, useRef, useEffect } from 'react';
import { getTalentsBySubCategory, getSubSubCategories } from '@/lib/data';
import type { Talent, TalentFilters } from '@/types/index.ts';
import { ArrowLeft, CheckCircle, Users, Music, Zap, Camera, UserCheck, Filter, X, Search, MapPin } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import VideoTalentCard from '@/components/VideoTalentCard';
import LocationAutocomplete from '@/components/LocationAutocomplete';

// Local lightweight types matching data shapes used in this component
type LocalSubCategory = { id: string; name: string; description?: string; talentCount?: number };
type LocalCategory = { id: string; name: string; description?: string; icon?: string; subcategories: LocalSubCategory[] };

// Helper to get a styled icon for a category
const getCategoryIcon = (iconName: string) => {
  const iconClasses = 'w-12 h-12 text-primary-blue dark:text-accent-red group-hover:text-white dark:group-hover:text-white transition-colors';
  switch (iconName) {
    case 'Users':     return <Users className={iconClasses} />;
    case 'Music':     return <Music className={iconClasses} />;
    case 'Zap':       return <Zap className={iconClasses} />;
    case 'Camera':    return <Camera className={iconClasses} />;
    case 'UserCheck': return <UserCheck className={iconClasses} />;
    default:          return <CheckCircle className={iconClasses} />;
  }
};

// ...existing code...

interface CategoriesClientProps {
  categories: LocalCategory[];
}

export default function CategoriesClient({ categories }: Readonly<CategoriesClientProps>) {
  const [selectedCategory, setSelectedCategory] = useState<LocalCategory | null>(null);
  const [selectedSubtype, setSelectedSubtype] = useState<LocalSubCategory | null>(null);
  const [selectedSubSubtype, setSelectedSubSubtype] = useState<LocalSubCategory | null>(null);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TalentFilters>({
    gender: [],
    ethnicity: [],
    ageRange: { min: 18, max: 65 },
    heightRange: { min: 150, max: 200 },
    bodyType: [],
    experience: { min: 0, max: 20 },
    location: '',
    eyeColor: [],
    hairColor: [],
    skills: [],
    languages: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Talent[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleCategorySelect = (category: LocalCategory) => setSelectedCategory(category);

  const handleSubtypeSelect = (subtype: LocalSubCategory) => {
    setSelectedSubtype(subtype);
    // Check if this subcategory has sub-subcategories
    const subSubcategories = getSubSubCategories(subtype.id);
    if (subSubcategories.length === 0) {
      // If no sub-subcategories, load talents directly
      const results = getTalentsBySubCategory(subtype.id);
      setTalents(results);
    }
  };

  const handleSubSubtypeSelect = (subSubtype: LocalSubCategory) => {
    setSelectedSubSubtype(subSubtype);
    const results = getTalentsBySubCategory(subSubtype.id);
    setTalents(results);
  };

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: searchQuery, filters, page: 1, limit: 50 })
      });
      const data = await res.json();
      setSearchResults(data.talents || []);
    } catch {
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  // debounce search when typing in the search input
  const searchTimer = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
    setTalents([]);
    clearFilters();
  };

  const handleFilterChange = (newFilters: TalentFilters) => {
    setFilters(newFilters);
    
    // Apply filters to the current talent set
    let baseResults: Talent[] = [];
    
    if (isSearching) {
      baseResults = searchResults;
    } else if (selectedSubSubtype) {
      baseResults = getTalentsBySubCategory(selectedSubSubtype.id);
    } else if (selectedSubtype) {
      baseResults = getTalentsBySubCategory(selectedSubtype.id);
    }
    
    if (baseResults.length > 0) {
      const filteredResults = baseResults.filter(talent => matchesFilters(talent, newFilters));
      setTalents(filteredResults);
    }
  };

  // Helper function to check if talent matches filters
  const matchesFilters = (talent: Talent, appliedFilters: TalentFilters): boolean => {
    // Gender filter
    if (appliedFilters.gender?.length && !appliedFilters.gender.includes(talent.gender)) {
      return false;
    }
    
    // Age filter
    if (appliedFilters.ageRange) {
      if (talent.age < appliedFilters.ageRange.min || talent.age > appliedFilters.ageRange.max) {
        return false;
      }
    }
    
    // Height filter
    if (appliedFilters.heightRange) {
      if (talent.height < appliedFilters.heightRange.min || talent.height > appliedFilters.heightRange.max) {
        return false;
      }
    }
    
    // Body type filter
    if (appliedFilters.bodyType?.length && !appliedFilters.bodyType.includes(talent.bodyType)) {
      return false;
    }
    
    // Experience filter
    if (appliedFilters.experience) {
      if (talent.experience < appliedFilters.experience.min || talent.experience > appliedFilters.experience.max) {
        return false;
      }
    }
    
    // Location filter
    if (appliedFilters.location && !talent.location.toLowerCase().includes(appliedFilters.location.toLowerCase())) {
      return false;
    }
    
    return true;
  };

  const clearFilters = () => {
    setFilters({
      gender: [],
      ethnicity: [],
      ageRange: { min: 18, max: 65 },
      heightRange: { min: 150, max: 200 },
      bodyType: [],
      experience: { min: 0, max: 20 },
      location: '',
      eyeColor: [],
      hairColor: [],
      skills: [],
      languages: []
    });
    if (isSearching) {
      setTalents(searchResults);
    } else if (selectedSubSubtype) {
      const results = getTalentsBySubCategory(selectedSubSubtype.id);
      setTalents(results);
    } else if (selectedSubtype) {
      const results = getTalentsBySubCategory(selectedSubtype.id);
      setTalents(results);
    }
  };

  const handleBack = () => {
    if (isSearching) {
      clearSearch();
    } else if (selectedSubSubtype) {
      setSelectedSubSubtype(null);
      setTalents([]);
      clearFilters();
    } else if (selectedSubtype) {
      setSelectedSubtype(null);
      setTalents([]);
      clearFilters();
    } else {
      setSelectedCategory(null);
    }
  };

  const getSearchPlaceholder = () => {
    if (selectedSubSubtype) {
      return `Search within ${selectedSubSubtype.name}...`;
    } else if (selectedSubtype) {
      return `Search within ${selectedSubtype.name}...`;
    } else if (selectedCategory) {
      return `Search within ${selectedCategory.name}...`;
    }
    return 'Search for talents by name, role, skills, location, or category...';
  };

  const getFilterTitle = () => {
    if (selectedSubSubtype) {
      return `Filter ${selectedSubSubtype.name} Professionals`;
    } else if (selectedSubtype) {
      return `Filter ${selectedSubtype.name} Professionals`;
    } else if (selectedCategory) {
      return `Filter ${selectedCategory.name} Professionals`;
    }
    return 'Advanced Filters';
  };

  const getSearchResultsText = () => {
    const baseText = `Found ${talents.length} talent${talents.length !== 1 ? 's' : ''}`;
    if (selectedSubSubtype) {
      return `${baseText} in ${selectedSubSubtype.name} matching your search`;
    } else if (selectedSubtype) {
      return `${baseText} in ${selectedSubtype.name} matching your search`;
    } else if (selectedCategory) {
      return `${baseText} in ${selectedCategory.name} matching your search`;
    }
    return `${baseText} matching your search`;
  };

  const getPageTitle = () => {
    if (isSearching) {
      const baseTitle = 'Search Results';
      return searchQuery ? `${baseTitle} for "${searchQuery}"` : baseTitle;
    }
    return selectedSubSubtype?.name || selectedSubtype?.name || selectedCategory?.name || 'Browse Categories';
  };

  const currentSubSubcategories = selectedSubtype ? getSubSubCategories(selectedSubtype.id) : [];
  const shouldShowSubSubcategories = selectedSubtype && !selectedSubSubtype && currentSubSubcategories.length > 0;

  // ...existing code...

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="p-6 md:p-10">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              {(selectedCategory || selectedSubtype || selectedSubSubtype || isSearching) && (
                <button onClick={handleBack} className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <ArrowLeft className="w-6 h-6 text-gray-800 dark:text-white" />
                </button>
              )}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {getPageTitle()}
              </h1>
            </div>
            
            {/* Filter Toggle Button */}
            {(talents.length > 0) && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-red-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-red-600 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            )}
          </div>

          {/* Search Bar */}
              <div className="relative max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchQuery}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSearchQuery(v);
                      if (searchTimer.current) window.clearTimeout(searchTimer.current);
                      searchTimer.current = window.setTimeout(() => {
                        handleSearch();
                      }, 300);
                    }}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {isSearching && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {getSearchResultsText()}
              </p>
            )}
          </div>
        </header>

        {/* Advanced Filter Panel */}
        {showFilters && talents.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getFilterTitle()}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Clear All
                </button>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                </button>
              </div>
            </div>
            
            {/* Basic Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin size={16} className="inline mr-1" />
                  Location
                </label>
                <LocationAutocomplete
                  value={filters.location || ''}
                  onChange={(v: string) => {
                    const newFilters = { ...filters, location: v };
                    setFilters(newFilters);
                    handleFilterChange(newFilters);
                  }}
                  placeholder="City, State, Country"
                />
              </div>
            </div>
          </div>
        )}

        <div>
          {/* Main Categories Grid */}
          {!selectedCategory && !isSearching && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 animate-fade-in">
              {categories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className="group bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500 flex flex-col items-center justify-center text-center"
                >
                  {category.icon && getCategoryIcon(category.icon)}
                  {category.description && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-200">{category.description}</p>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Subcategories Grid */}
          {selectedCategory && !selectedSubtype && !isSearching && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
              {selectedCategory.subcategories.map(sub => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => handleSubtypeSelect(sub)}
                  className="group bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:bg-blue-600 dark:hover:bg-red-500 hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500 text-center"
                >
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-white">{sub.name}</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-200">{sub.description}</p>
                  <span className="inline-block mt-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full group-hover:bg-white group-hover:text-gray-800">
                    {sub.talentCount} talents
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Sub-subcategories Grid */}
          {shouldShowSubSubcategories && !isSearching && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-fade-in">
              {currentSubSubcategories.map((subSub: LocalSubCategory) => (
                <button
                  key={subSub.id}
                  type="button"
                  onClick={() => handleSubSubtypeSelect(subSub)}
                  className="group bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:bg-blue-600 dark:hover:bg-red-500 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500 text-center"
                >
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white group-hover:text-white">{subSub.name}</h4>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-200">{subSub.description}</p>
                  <span className="inline-block mt-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full group-hover:bg-white group-hover:text-gray-800">
                    {subSub.talentCount}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Talents Grid */}
          {talents.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Showing {talents.length} talent{talents.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-fade-in">
                {talents.map(talent => (
                  <VideoTalentCard 
                    key={talent.id} 
                    talent={talent} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state when no talents found */}
          {talents.length === 0 && (isSearching || selectedSubtype || selectedSubSubtype) && !shouldShowSubSubcategories && (
            <EmptyState
              icon={<Users className="w-16 h-16" />}
              title={isSearching ? "No talents found matching your search" : "No talents found matching your criteria"}
              description={isSearching ? "Try different search terms or explore categories below" : "Try adjusting your filters or exploring other categories"}
            />
          )}
        </div>
      </main>
    </div>
  );
}
