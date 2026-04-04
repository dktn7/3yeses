'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { 
  Search, ArrowLeft, Loader2, X, SlidersHorizontal, 
  Sparkles, Users, Grid3X3, List, Tag
} from 'lucide-react';
import FeaturedTalentCard from '@/components/FeaturedTalentCard';
import MediaOverlay from '@/components/MediaOverlay';
import RangeSlider from '@/components/RangeSlider';
import MultiSelect from '@/components/MultiSelect';
import SkillMultiSelect from '@/components/SkillMultiSelect';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import TalentFilterPanel, { TalentFilters, defaultFilters } from '@/components/TalentFilterPanel';
import { isAudioUrl, isValidImageUrl } from '@/lib/image-utils';

interface Category {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
}

interface SearchResultsClientProps {
  locale: string;
}

// Popular skills for suggestions
const POPULAR_SKILLS = [
  'Acting', 'Singing', 'Dancing', 'Modeling', 'Voice Acting', 'Comedy', 
  'Drama', 'Musical Theater', 'Stunts', 'Hosting', 'Presenting', 'Photography',
  'Directing', 'Writing', 'Improv', 'Stage Combat', 'Martial Arts', 'Gymnastics'
];

export default function SearchResultsClient({ locale }: SearchResultsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('Home');
  
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMediaItem, setSelectedMediaItem] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 24;
  
  // Search states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  
  // Multi-select categories/subcategories (from categories page)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('categories')?.split(',').filter(Boolean) || []
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    searchParams.get('subcategories')?.split(',').filter(Boolean) || 
    (searchParams.get('subcategory') ? [searchParams.get('subcategory')!] : [])
  );
  
  // Single category/subcategory (legacy support)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  
  // Advanced filters
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [gender, setGender] = useState<string[]>(searchParams.get('gender')?.split(',').filter(Boolean) || []);
  const [bodyType, setBodyType] = useState<string[]>(searchParams.get('bodyType')?.split(',').filter(Boolean) || []);
  const [ethnicity, setEthnicity] = useState<string[]>(searchParams.get('ethnicity')?.split(',').filter(Boolean) || []);
  const [ageRange, setAgeRange] = useState({
    min: parseInt(searchParams.get('minAge') || '5'),
    max: parseInt(searchParams.get('maxAge') || '80')
  });
  const [heightRange, setHeightRange] = useState({
    min: parseInt(searchParams.get('minHeight') || '140'),
    max: parseInt(searchParams.get('maxHeight') || '220')
  });
  const [experienceRange, setExperienceRange] = useState({
    min: parseInt(searchParams.get('minExp') || '0'),
    max: parseInt(searchParams.get('maxExp') || '50')
  });
  const [eyeColor, setEyeColor] = useState<string[]>(searchParams.get('eyeColor')?.split(',').filter(Boolean) || []);
  const [hairColor, setHairColor] = useState<string[]>(searchParams.get('hairColor')?.split(',').filter(Boolean) || []);
  const [skills, setSkills] = useState<string[]>(searchParams.get('skills')?.split(',').filter(Boolean) || []);
  const [languages, setLanguages] = useState<string[]>(searchParams.get('languages')?.split(',').filter(Boolean) || []);
  const [disabilities, setDisabilities] = useState<string[]>(searchParams.get('disabilities')?.split(',').filter(Boolean) || []);

  const [categories, setCategories] = useState<Category[]>([]);

  // Unified advanced filters state for TalentFilterPanel
  const [advancedFilters, setAdvancedFilters] = useState<TalentFilters>(() => ({
    gender: searchParams.get('gender')?.split(',').filter(Boolean) || [],
    bodyType: searchParams.get('bodyType')?.split(',').filter(Boolean) || [],
    ethnicity: searchParams.get('ethnicity')?.split(',').filter(Boolean) || [],
    ageRange: {
      min: parseInt(searchParams.get('minAge') || '5'),
      max: parseInt(searchParams.get('maxAge') || '80')
    },
    heightRange: {
      min: parseInt(searchParams.get('minHeight') || '150'),
      max: parseInt(searchParams.get('maxHeight') || '200')
    },
    experience: {
      min: parseInt(searchParams.get('minExp') || '0'),
      max: parseInt(searchParams.get('maxExp') || '20')
    },
    location: searchParams.get('location') || '',
    eyeColor: searchParams.get('eyeColor')?.split(',').filter(Boolean) || [],
    hairColor: searchParams.get('hairColor')?.split(',').filter(Boolean) || [],
    skills: searchParams.get('skills')?.split(',').filter(Boolean) || [],
    languages: searchParams.get('languages')?.split(',').filter(Boolean) || [],
    disabilities: searchParams.get('disabilities')?.split(',').filter(Boolean) || [],
  }));

  // Sync advancedFilters to individual states for compatibility
  useEffect(() => {
    setGender(advancedFilters.gender || []);
    setBodyType(advancedFilters.bodyType || []);
    setEthnicity(advancedFilters.ethnicity || []);
    setAgeRange(advancedFilters.ageRange || { min: 5, max: 80 });
    setHeightRange(advancedFilters.heightRange || { min: 150, max: 200 });
    setExperienceRange({ min: advancedFilters.experience?.min || 0, max: advancedFilters.experience?.max || 50 });
    setEyeColor(advancedFilters.eyeColor || []);
    setHairColor(advancedFilters.hairColor || []);
    setSkills(advancedFilters.skills || []);
    setLanguages(advancedFilters.languages || []);
    setLocation(advancedFilters.location || '');
  }, [advancedFilters]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setCategories(data.data || []);
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Smart search suggestions based on input
  const searchSuggestions = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) return [];
    const lowerInput = searchTerm.toLowerCase();
    
    const suggestions: { type: 'skill' | 'category' | 'subcategory'; name: string; parentName?: string }[] = [];
    
    // Match skills
    POPULAR_SKILLS
      .filter(skill => skill.toLowerCase().includes(lowerInput))
      .slice(0, 3)
      .forEach(skill => suggestions.push({ type: 'skill', name: skill }));
    
    // Match categories
    categories
      .filter(cat => cat.name.toLowerCase().includes(lowerInput))
      .slice(0, 2)
      .forEach(cat => suggestions.push({ type: 'category', name: cat.name }));
    
    // Match subcategories
    categories.forEach(cat => {
      cat.subcategories
        .filter(sub => sub.name.toLowerCase().includes(lowerInput))
        .slice(0, 2)
        .forEach(sub => suggestions.push({ type: 'subcategory', name: sub.name, parentName: cat.name }));
    });
    
    return suggestions.slice(0, 8);
  }, [searchTerm, categories]);

  // Build search params for API
  const buildSearchParams = useCallback(() => {
    const params = new URLSearchParams();
    
    if (searchTerm) params.set('q', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedCategories.length) params.set('categories', selectedCategories.join(','));
    if (selectedSubcategories.length) params.set('subcategories', selectedSubcategories.join(','));
    if (location) params.set('location', location);
    if (gender.length) params.set('gender', gender.join(','));
    if (bodyType.length) params.set('bodyType', bodyType.join(','));
    if (ethnicity.length) params.set('ethnicity', ethnicity.join(','));
    if (ageRange.min !== 5 || ageRange.max !== 80) {
      params.set('minAge', ageRange.min.toString());
      params.set('maxAge', ageRange.max.toString());
    }
    if (heightRange.min !== 140 || heightRange.max !== 220) {
      params.set('minHeight', heightRange.min.toString());
      params.set('maxHeight', heightRange.max.toString());
    }
    if (experienceRange.min !== 0 || experienceRange.max !== 50) {
      params.set('minExp', experienceRange.min.toString());
      params.set('maxExp', experienceRange.max.toString());
    }
    if (eyeColor.length) params.set('eyeColor', eyeColor.join(','));
    if (hairColor.length) params.set('hairColor', hairColor.join(','));
    if (skills.length) params.set('skills', skills.join(','));
    if (languages.length) params.set('languages', languages.join(','));
    if (disabilities.length) params.set('disabilities', disabilities.join(','));
    
    // Pagination
    params.set('page', currentPage.toString());
    params.set('pageSize', pageSize.toString());
    
    return params;
  }, [searchTerm, selectedCategory, selectedCategories, selectedSubcategories, location, gender, bodyType, ethnicity, ageRange, heightRange, experienceRange, eyeColor, hairColor, skills, languages, disabilities, currentPage]);

  // Fetch results
  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = buildSearchParams();
      const response = await fetch(`/api/talent/search?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setResults(data.talents || []);
        setTotalCount(data.total || 0);
        setTotalPages(Math.ceil((data.total || 0) / pageSize));
      } else {
        setError('Failed to fetch results');
      }
    } catch (err) {
      setError('An error occurred while searching');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [buildSearchParams]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSearchSuggestions(false);
    setCurrentPage(1); // Reset to first page on new search
    fetchResults();
    
    // Update URL with current filters
    const params = buildSearchParams();
    router.push(`/${locale}/search-results?${params.toString()}`, { scroll: false });
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: { type: string; name: string; parentName?: string }) => {
    if (suggestion.type === 'skill') {
      if (!skills.includes(suggestion.name)) {
        setSkills([...skills, suggestion.name]);
      }
      setSearchTerm('');
    } else if (suggestion.type === 'category') {
      if (!selectedCategories.includes(suggestion.name)) {
        setSelectedCategories([...selectedCategories, suggestion.name]);
      }
      setSearchTerm('');
    } else if (suggestion.type === 'subcategory') {
      if (!selectedSubcategories.includes(suggestion.name)) {
        setSelectedSubcategories([...selectedSubcategories, suggestion.name]);
      }
      setSearchTerm('');
    }
    setShowSearchSuggestions(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setCurrentPage(1); // Reset to first page
    setGender([]);
    setBodyType([]);
    setEthnicity([]);
    setAgeRange({ min: 5, max: 80 });
    setHeightRange({ min: 140, max: 220 });
    setExperienceRange({ min: 0, max: 50 });
    setEyeColor([]);
    setHairColor([]);
    setSkills([]);
    setLanguages([]);
    setDisabilities([]);
    setLocation('');
  };

  // Clear category/subcategory filters
  const clearCategoryFilters = () => {
    setSelectedCategory('');
    setSelectedCategories([]);
    setSelectedSubcategories([]);
  };

  // Check for active filters
  const hasActiveFilters = useMemo(() => 
    gender.length > 0 || bodyType.length > 0 || ethnicity.length > 0 || 
    ageRange.min !== 5 || ageRange.max !== 80 ||
    heightRange.min !== 140 || heightRange.max !== 220 ||
    experienceRange.min !== 0 || experienceRange.max !== 50 ||
    eyeColor.length > 0 || hairColor.length > 0 || 
    skills.length > 0 || languages.length > 0 || disabilities.length > 0 || location,
    [gender, bodyType, ethnicity, ageRange, heightRange, experienceRange, eyeColor, hairColor, skills, languages, disabilities, location]
  );

  const hasCategoryFilters = useMemo(() =>
    selectedCategory || selectedCategories.length > 0 || selectedSubcategories.length > 0,
    [selectedCategory, selectedCategories, selectedSubcategories]
  );

  // Count active filter badges
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (advancedFilters.gender?.length) count++;
    if (advancedFilters.bodyType?.length) count++;
    if (advancedFilters.ethnicity?.length) count++;
    if (advancedFilters.ageRange?.min !== 5 || advancedFilters.ageRange?.max !== 80) count++;
    if (advancedFilters.heightRange?.min !== 150 || advancedFilters.heightRange?.max !== 200) count++;
    if (advancedFilters.experience?.min !== 0 || advancedFilters.experience?.max !== 20) count++;
    if (advancedFilters.eyeColor?.length) count++;
    if (advancedFilters.hairColor?.length) count++;
    if (advancedFilters.skills?.length) count++;
    if (advancedFilters.languages?.length) count++;
    if (advancedFilters.disabilities?.length) count++;
    if (advancedFilters.location) count++;
    return count;
  }, [advancedFilters]);

  // Process results for display
  const processedResults = useMemo(() => {
    return results.map((talent: any) => {
      const talentProfile = {
        id: talent.id,
        user: { name: talent.name },
        avatarUrl: talent.avatarUrl,
        category: talent.category ? { name: talent.category } : undefined,
        skills: talent.skills || [],
        location: talent.location
      };
      
      let mediaItems: any[] = talent.portfolio || [];
      
      if (mediaItems.length === 0 && talent.videoUrl) {
        let thumbnail = undefined;
        if (talent.videoUrl.includes('youtube.com') || talent.videoUrl.includes('youtu.be')) {
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
          const match = talent.videoUrl.match(regExp);
          if (match && match[2].length === 11) {
            thumbnail = `https://img.youtube.com/vi/${match[2]}/0.jpg`;
          }
        }

        mediaItems = [{
          id: `video-${talent.id}`,
          title: 'Featured Video',
          url: talent.videoUrl,
          type: 'VIDEO',
          thumbnail: thumbnail,
          talentProfile: talentProfile,
          views: 0,
          likes: 0,
          createdAt: new Date().toISOString()
        }];
      }
      
      return { ...talent, talentProfile, mediaItems };
    });
  }, [results]);

  const allMediaItems = useMemo(() => {
    return processedResults.flatMap((r: any) => r.mediaItems);
  }, [processedResults]);

  // Sync URL with selectedMediaItem
  useEffect(() => {
    const mediaId = searchParams.get('mediaId');
    if (mediaId && allMediaItems.length > 0) {
      const item = allMediaItems.find((i: any) => i.id === mediaId);
      if (item) {
        setSelectedMediaItem(item);
      }
    } else if (!mediaId) {
      setSelectedMediaItem(null);
    }
  }, [searchParams, allMediaItems]);

  const handleMediaSelect = (item: any) => {
    setSelectedMediaItem(item);
    const params = new URLSearchParams(searchParams.toString());
    params.set('mediaId', item.id);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleCloseOverlay = () => {
    setSelectedMediaItem(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('mediaId');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSkillClick = (skill: string) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sticky Header */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          {/* Top Row: Back + Title + View Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/${locale}/categories`)}
                className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {searchTerm ? `Results for "${searchTerm}"` : 'Talent Search'}
                </h1>
                {!isLoading && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {totalCount} {totalCount === 1 ? 'talent' : 'talents'} found
                  </p>
                )}
              </div>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
              >
                <Grid3X3 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
              >
                <List className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Search Bar Row */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Main Search Input */}
            <div className="flex-1 relative">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder="Search talents, skills, or keywords..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSearchSuggestions(true);
                  }}
                  onFocus={() => searchTerm && setShowSearchSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 150)}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red focus:border-transparent transition-all"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => { setSearchTerm(''); setShowSearchSuggestions(false); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

              {/* Search Suggestions Dropdown */}
              {showSearchSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${suggestion.name}-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                    >
                      {suggestion.type === 'skill' && <Tag className="w-4 h-4 text-green-500" />}
                      {suggestion.type === 'category' && <Sparkles className="w-4 h-4 text-primary-blue dark:text-accent-red" />}
                      {suggestion.type === 'subcategory' && <Grid3X3 className="w-4 h-4 text-purple-500" />}
                      <div className="flex flex-col">
                        <span className="font-medium">{suggestion.name}</span>
                        <span className="text-xs text-gray-500">
                          {suggestion.type === 'skill' && 'Add as skill filter'}
                          {suggestion.type === 'category' && 'Category'}
                          {suggestion.type === 'subcategory' && `in ${suggestion.parentName}`}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all font-medium whitespace-nowrap ${
                showFilters
                  ? 'bg-primary-blue dark:bg-accent-red text-white border-transparent'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  showFilters ? 'bg-white/20' : 'bg-primary-blue dark:bg-accent-red text-white'
                }`}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Active Category/Subcategory Pills */}
          {hasCategoryFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Browsing:</span>
              {selectedCategories.map(cat => (
                <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-blue/10 dark:bg-accent-red/10 text-primary-blue dark:text-accent-red rounded-full text-sm font-medium">
                  {cat}
                  <button onClick={() => setSelectedCategories(prev => prev.filter(c => c !== cat))} className="ml-1 hover:bg-primary-blue/20 dark:hover:bg-accent-red/20 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedSubcategories.map(sub => (
                <span key={sub} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                  {sub}
                  <button onClick={() => setSelectedSubcategories(prev => prev.filter(s => s !== sub))} className="ml-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button onClick={clearCategoryFilters} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline">
                Clear all
              </button>
            </div>
          )}

          {/* Active Skill Pills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Skills:</span>
              {skills.map(skill => (
                <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                  {skill}
                  <button onClick={() => setSkills(prev => prev.filter(s => s !== skill))} className="ml-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-screen-2xl mx-auto p-6">
        {/* Filter Panel - Shows above content when open */}
        {showFilters && (
          <div className="mb-6">
            <TalentFilterPanel
              filters={advancedFilters}
              onFiltersChange={setAdvancedFilters}
              onClose={() => setShowFilters(false)}
              onApply={() => {
                setShowFilters(false);
                handleSearch(new Event('submit') as any);
              }}
              showHeader={true}
            />
          </div>
        )}

        {/* Results Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary-blue dark:text-accent-red mb-4" />
            <span className="text-gray-600 dark:text-gray-400">Searching talents...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => fetchResults()}
              className="text-primary-blue dark:text-accent-red hover:underline font-medium"
            >
              Try again
            </button>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl">
            <Users className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              No talents found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Try adjusting your search criteria, removing some filters, or browsing different categories.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  clearFilters();
                  clearCategoryFilters();
                }}
                className="px-4 py-2 bg-primary-blue dark:bg-accent-red text-white rounded-lg hover:opacity-90 transition-colors font-medium"
              >
                Start Fresh
              </button>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {processedResults.map((talent: any, index: number) => (
                  <FeaturedTalentCard
                    key={talent.id}
                    priority={index < 8}
                    talent={talent.talentProfile}
                    mediaItems={talent.mediaItems}
                    onMediaClick={handleMediaSelect}
                    onProfileClick={(profile) => router.push(`/talent/${(profile as any).userId ?? profile.id}`)}
                    onSkillClick={handleSkillClick}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {processedResults.map((talent: any, index: number) => (
                  <div key={talent.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="flex flex-col sm:flex-row">
                      {/* Left: Avatar and Info */}
                      <div className="p-4 flex items-center gap-4 sm:w-64 sm:border-r border-b sm:border-b-0 border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() => router.push(`/talent/${(talent.talentProfile as any).userId ?? talent.talentProfile.id}`)}
                          className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 ring-2 ring-primary-blue/20 dark:ring-accent-red/20 hover:ring-4 transition-all"
                        >
                          {talent.talentProfile.avatarUrl ? (
                            <Image
                              src={talent.talentProfile.avatarUrl}
                              alt={talent.talentProfile.user?.name || 'Talent'}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                              priority={index < 4}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Users className="w-8 h-8" />
                            </div>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-white truncate">
                            {talent.talentProfile.user?.name || 'Unknown'}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize truncate">
                            {talent.talentProfile.category?.name || 'Talent'}
                          </p>
                          {talent.talentProfile.location && (
                            <p className="text-xs text-gray-400 truncate">{talent.talentProfile.location}</p>
                          )}
                        </div>
                      </div>

                      {/* Middle: Skills */}
                      <div className="p-4 flex-1 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-700">
                        <div className="flex flex-wrap gap-1.5">
                          {(talent.talentProfile.skills || []).slice(0, 6).map((skill: string, idx: number) => (
                            <button
                              key={idx}
                              onClick={() => handleSkillClick(skill)}
                              className="px-2 py-1 bg-primary-blue/10 dark:bg-accent-red/10 text-primary-blue dark:text-accent-red text-xs font-medium rounded-full hover:bg-primary-blue/20 dark:hover:bg-accent-red/20 transition-colors"
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Right: Media Thumbnails */}
                      <div className="p-3 flex gap-2 overflow-x-auto sm:w-80">
                        {talent.mediaItems.slice(0, 4).map((item: any) => {
                          // Get valid image URL - skip audio files
                          const imageUrl = item.type === 'AUDIO' ? null : 
                            (item.thumbnail && !isAudioUrl(item.thumbnail)) ? item.thumbnail :
                            (item.mediaUrl && !isAudioUrl(item.mediaUrl)) ? item.mediaUrl : null;
                          
                          return (
                          <button
                            key={item.id}
                            onClick={() => handleMediaSelect(item)}
                            className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 hover:ring-2 ring-primary-blue dark:ring-accent-red transition-all"
                          >
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={item.title || 'Media'}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Users className="w-6 h-6" />
                              </div>
                            )}
                            {item.type === 'VIDEO' && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center">
                                  <div className="w-0 h-0 border-l-[6px] border-l-gray-800 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5" />
                                </div>
                              </div>
                            )}
                          </button>
                          );
                        })}
                      </div>

                      {/* View Profile Button */}
                      <div className="p-4 flex items-center">
                        <button
                          onClick={() => router.push(`/talent/${(talent.talentProfile as any).userId ?? talent.talentProfile.id}`)}
                          className="px-4 py-2 bg-primary-blue dark:bg-accent-red text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Pagination Controls */}
        {totalPages > 1 && !isLoading && results.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-8 mb-4">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-primary-blue dark:bg-accent-red text-white'
                        : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Last
            </button>
            
            <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        )}
      </div>
      
      {/* Media Overlay */}
      {selectedMediaItem && (
        <MediaOverlay
          media={selectedMediaItem}
          allMedia={allMediaItems}
          onClose={handleCloseOverlay}
          onMediaSelect={handleMediaSelect}
        />
      )}
    </div>
  );
}
