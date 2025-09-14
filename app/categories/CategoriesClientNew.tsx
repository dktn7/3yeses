'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Users, Music, Zap, Camera, UserCheck, Filter, X, Search, MapPin, Star } from 'lucide-react';
import EmptyState from '@/components/EmptyState';

// Helper to get a styled icon for a category
const getCategoryIcon = (iconName: string | null) => {
  const iconClasses = 'w-12 h-12 text-primary-blue dark:text-accent-red group-hover:text-white dark:group-hover:text-white transition-colors';
  const name = iconName || 'CheckCircle';
  switch (name) {
    case 'Users':     return <Users className={iconClasses} />;
    case 'Music':     return <Music className={iconClasses} />;
    case 'Zap':       return <Zap className={iconClasses} />;
    case 'Camera':    return <Camera className={iconClasses} />;
    case 'UserCheck': return <UserCheck className={iconClasses} />;
    case 'MapPin':    return <MapPin className={iconClasses} />;
    case 'Star':      return <Star className={iconClasses} />;
    default:          return <CheckCircle className={iconClasses} />;
  }
};

interface Subcategory {
  id: string;
  name: string;
  description: string | null;
  _count: {
    talentProfiles: number;
  };
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  subcategories: Subcategory[];
  _count: {
    talentProfiles: number;
    subcategories: number;
  };
}

interface TalentFilters {
  gender: string[];
  ethnicity: string[];
  ageRange: { min: number; max: number };
  heightRange: { min: number; max: number };
  bodyType: string[];
  experience: { min: number; max: number };
  location: string;
  eyeColor: string[];
  hairColor: string[];
  skills: string[];
  languages: string[];
}

interface TalentProfile {
  id: string;
  title: string;
  description: string;
  priceRange: string;
  ratePerHour: number;
  location: string;
  experience: number;
  availability: string;
  rating: number;
  reviewCount: number;
  bookingCount: number;
  user: {
    id: string;
    name: string;
    profilePicture?: string;
  };
  category: {
    id: string;
    name: string;
  };
  subcategory: {
    id: string;
    name: string;
  };
  skills: Array<{
    id: string;
    name: string;
  }>;
}

interface CategoriesClientProps {
  categories: Category[];
}

export default function CategoriesClient({ categories }: Readonly<CategoriesClientProps>) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Advanced filters state
  const [filters, setFilters] = useState<TalentFilters>({
    gender: [],
    ethnicity: [],
    ageRange: { min: 5, max: 80 },
    heightRange: { min: 150, max: 200 },
    bodyType: [],
    experience: { min: 0, max: 20 },
    location: '',
    eyeColor: [],
    hairColor: [],
    skills: [],
    languages: []
  });


  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [talentsError, setTalentsError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedSubcategory) return;
    const fetchTalents = async () => {
      setIsLoading(true);
      setTalentsError(null);
      try {
        const res = await fetch('/api/talent/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...filters,
            subcategoryId: selectedSubcategory.id,
            page,
            pageSize,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setTalents(data.talents);
          setTotal(data.total || 0);
        } else {
          setTalents([]);
          setTotal(0);
          setTalentsError('Failed to load talents.');
        }
      } catch {
        setTalents([]);
        setTalentsError('Failed to load talents.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTalents();
  }, [selectedSubcategory, filters, page, pageSize]);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
  };



  const handleBackToSubcategories = () => {
    setSelectedSubcategory(null);
  };

  const clearFilters = () => {
    setFilters({
      gender: [],
      ethnicity: [],
      ageRange: { min: 5, max: 80 },
      heightRange: { min: 150, max: 200 },
      bodyType: [],
      experience: { min: 0, max: 20 },
      location: '',
      eyeColor: [],
      hairColor: [],
      skills: [],
      languages: []
    });
  };

  // Main categories view
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                Browse Categories
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-200 font-medium">
                Discover talented professionals across various creative industries
              </p>
            </div>

            {/* Enhanced Search Bar with Autocomplete */}
            <form className="mb-6 relative">
              <input
                type="text"
                className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
                placeholder="Search categories, subcategories, or talents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-900 border rounded-lg shadow-md mt-1">
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {categories
                      .filter((category) =>
                        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        category.subcategories.some((subcategory) =>
                          subcategory.name.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                      )
                      .map((category) => (
                        <li key={category.id} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            {category.name}
                          </h2>
                          <ul className="list-disc list-inside text-gray-700 dark:text-gray-200">
                            {category.subcategories.map((subcategory) => (
                              <li key={subcategory.id}>{subcategory.name}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </form>

            {/* Categories List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories
                .filter((category) =>
                  category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  category.subcategories.some((subcategory) =>
                    subcategory.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                )
                .map((category) => (
                  <div
                    key={category.id}
                    className="group p-3 border rounded-lg shadow-md hover:bg-primary-blue dark:hover:bg-accent-red transition-colors cursor-pointer aspect-square"
                    onClick={() => handleCategorySelect(category)}
                  >
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category.icon)}
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                          {category.name}
                        </h2>
                        <p className="text-xs text-gray-700 dark:text-gray-200">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Subcategories view
  if (selectedCategory && !selectedSubcategory) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                {selectedCategory.name}
              </h1>
              <p className="text-lg text-gray-700 dark:text-gray-200 font-medium">
                {selectedCategory.description}
              </p>
            </div>

            {/* Search Bar */}
            <form className="mb-6">
              <input
                type="text"
                className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
                placeholder="Search subcategories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Subcategories List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedCategory.subcategories
                .filter((subcategory) =>
                  subcategory.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((subcategory) => (
                  <div
                    key={subcategory.id}
                    className="group p-4 border rounded-lg shadow-md hover:bg-primary-blue dark:hover:bg-accent-red transition-colors cursor-pointer"
                    onClick={() => setSelectedSubcategory(subcategory)}
                  >
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {subcategory.name}
                    </h2>
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                      {subcategory.description}
                    </p>
                  </div>
                ))}
            </div>

            <button
              className="mt-6 px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSubcategory(null);
              }}
            >
              Back to Categories
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Talents view
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with back button */}
          <div className="mb-8">
            <button
              onClick={handleBackToSubcategories}
              className="flex items-center gap-2 text-blue-600 dark:text-red-500 hover:text-blue-700 dark:hover:text-red-600 mb-4"
            >
              {/* Removed ArrowLeft icon to resolve ReferenceError */}
              Back to {selectedCategory.name}
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {selectedSubcategory?.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {selectedSubcategory?.description}
                </p>
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-red-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-red-600 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Gender */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                  </div>
                  <div className="space-y-2">
                    {['Male', 'Female', 'Non-binary', 'Other'].map((gender) => (
                      <label key={gender} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 dark:border-gray-600 text-primary-blue focus:ring-primary-blue"
                          checked={filters.gender.includes(gender)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({ ...filters, gender: [...filters.gender, gender] });
                            } else {
                              setFilters({ ...filters, gender: filters.gender.filter(g => g !== gender) });
                            }
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{gender}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Ethnicity */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ethnicity
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {['White', 'Black/African', 'Hispanic/Latino', 'Asian', 'Middle Eastern', 'Mixed Race', 'Other'].map((ethnicity) => (
                      <label key={ethnicity} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 dark:border-gray-600 text-primary-blue focus:ring-primary-blue"
                          checked={filters.ethnicity.includes(ethnicity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({ ...filters, ethnicity: [...filters.ethnicity, ethnicity] });
                            } else {
                              setFilters({ ...filters, ethnicity: filters.ethnicity.filter(e => e !== ethnicity) });
                            }
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{ethnicity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Age Slider */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Age
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      type="range"
                      min="5"
                      max="80"
                      value={filters.ageRange.min}
                      onChange={e => setFilters({
                        ...filters,
                        ageRange: { ...filters.ageRange, min: Number(e.target.value), max: Number(e.target.value) }
                      })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>5</span>
                      <span>80</span>
                    </div>
                    <div className="text-center text-sm text-gray-700 dark:text-gray-200">
                      Selected Age: {filters.ageRange.min}
                    </div>
                  </div>
                </div>

                {/* Body Type */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Body Type
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {['Slim', 'Average', 'Athletic', 'Curvy', 'Plus Size', 'Muscular'].map((bodyType) => (
                      <label key={bodyType} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 dark:border-gray-600 text-primary-blue focus:ring-primary-blue"
                          checked={filters.bodyType.includes(bodyType)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({ ...filters, bodyType: [...filters.bodyType, bodyType] });
                            } else {
                              setFilters({ ...filters, bodyType: filters.bodyType.filter(bt => bt !== bodyType) });
                            }
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{bodyType}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Experience Range */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Experience (Years)
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      min="0"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      value={filters.experience.min}
                      onChange={(e) => setFilters({ 
                        ...filters, 
                        experience: { ...filters.experience, min: Number(e.target.value) || 0 }
                      })}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      min="0"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      value={filters.experience.max}
                      onChange={(e) => setFilters({ 
                        ...filters, 
                        experience: { ...filters.experience, max: Number(e.target.value) || 20 }
                      })}
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </div>
                  <input
                    type="text"
                    placeholder="City, Country"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  />
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-sm text-white bg-primary-blue hover:bg-blue-600 dark:bg-accent-red dark:hover:bg-red-600 rounded-md transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-red-500 mb-4"></div>
              <span className="text-gray-600 dark:text-gray-300">Loading talents...</span>
            </div>
          )}

          {/* Error State */}
          {talentsError && (
            <div className="text-center py-12">
              <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
                {talentsError}
              </p>
              <button
                onClick={() => setPage(1)}
                className="mt-2 px-4 py-2 bg-blue-600 dark:bg-red-500 text-white rounded hover:bg-blue-700 dark:hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          )}

          {/* Talents Grid */}
          {!isLoading && !talentsError && (
            <>
              {talents.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {talents.map((talent) => (
                      <div
                        key={talent.id}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
                      >
                        <div className="p-6">
                          {/* User Info */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-blue-600 dark:bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {talent.user.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {talent.user.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {talent.title}
                              </p>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                            {talent.description}
                          </p>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-2">
                            {talent.skills.map((skill) => (
                              <span key={skill.id} className="px-2 py-1 bg-gray-200 rounded text-sm">
                                {skill.name}
                              </span>
                            ))}
                          </div>

                          {/* Stats */}
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <div>
                              <span className="font-bold">{talent.rating}</span> / 5
                            </div>
                            <div>
                              <span>{talent.reviewCount} reviews</span>
                            </div>
                          </div>

                          {/* Price and Experience */}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-lg font-bold text-blue-600 dark:text-red-500">
                                ${talent.ratePerHour}/hr
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {talent.experience}+ years exp
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Pagination Controls with Page Numbers */}
                  <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.max(1, Math.ceil(total / pageSize)) }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => setPage(pg)}
                        className={`px-3 py-2 rounded ${pg === page ? 'bg-blue-600 dark:bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
                        disabled={pg === page}
                      >
                        {pg}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= Math.ceil(total / pageSize)}
                      className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <EmptyState
                  title="No Talents Found"
                  description={`No professionals found in ${selectedSubcategory?.name || 'this category'}. Try adjusting your filters.`}
                  icon={<Users className="w-16 h-16 text-gray-400" />}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
