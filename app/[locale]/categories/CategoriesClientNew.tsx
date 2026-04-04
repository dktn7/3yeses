'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Users, Music, Zap, Camera, UserCheck, Filter, X, Search, MapPin, Star, Calendar, Heart, Settings, BookOpen, Monitor, Trophy, Clapperboard, Sparkles, SlidersHorizontal, ArrowLeft, Loader2, Mic, Globe, PenTool, Flame, Tent, Smile, Aperture, Palette, Sliders, Smartphone, Scissors, Wrench, Film, Drama } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import FeaturedTalentCard from '@/components/FeaturedTalentCard';
import MediaOverlay from '@/components/MediaOverlay';
import SkillMultiSelect from '@/components/SkillMultiSelect';
import MultiSelect from '@/components/MultiSelect';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { TalentFilters } from '@/types';
import { getCategoryI18nKey } from '@/lib/categories';

// Helper to get a styled icon for a category
const getCategoryIcon = (iconName: string | null) => {
  const iconClasses = 'w-12 h-12 text-primary-blue dark:text-accent-red group-hover:text-white dark:group-hover:text-white transition-colors';
  const name = iconName || 'CheckCircle';
  switch (name) {
    case 'Mic':           return <Mic className={iconClasses} />;
    case 'Globe':         return <Globe className={iconClasses} />;
    case 'PenTool':       return <PenTool className={iconClasses} />;
    case 'Music':         return <Music className={iconClasses} />;
    case 'Clapperboard':  return <Clapperboard className={iconClasses} />;
    case 'Drama':         return <Drama className={iconClasses} />;
    case 'Camera':        return <Camera className={iconClasses} />;
    case 'Users':         return <Users className={iconClasses} />;
    case 'Heart':         return <Heart className={iconClasses} />;
    case 'Trophy':        return <Trophy className={iconClasses} />;
    case 'Flame':         return <Flame className={iconClasses} />;
    case 'Sparkles':      return <Sparkles className={iconClasses} />;
    case 'Tent':          return <Tent className={iconClasses} />;
    case 'Smile':         return <Smile className={iconClasses} />;
    case 'Aperture':      return <Aperture className={iconClasses} />;
    case 'Palette':       return <Palette className={iconClasses} />;
    case 'Sliders':       return <Sliders className={iconClasses} />;
    case 'Smartphone':    return <Smartphone className={iconClasses} />;
    case 'Scissors':      return <Scissors className={iconClasses} />;
    case 'Wrench':        return <Wrench className={iconClasses} />;
    case 'Film':          return <Film className={iconClasses} />;
    case 'Zap':           return <Zap className={iconClasses} />;
    case 'UserCheck':     return <UserCheck className={iconClasses} />;
    case 'MapPin':        return <MapPin className={iconClasses} />;
    case 'Star':          return <Star className={iconClasses} />;
    case 'Calendar':      return <Calendar className={iconClasses} />;
    case 'Settings':      return <Settings className={iconClasses} />;
    case 'BookOpen':      return <BookOpen className={iconClasses} />;
    case 'Monitor':       return <Monitor className={iconClasses} />;
    default:              return <CheckCircle className={iconClasses} />;
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

interface TalentProfile {
  id: string;
  title: string;
  description: string;
  priceRange: string;
  ratePerHour: number;
  location: string;
  experience: number;
  availability: string;
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
  skills: string[];
  portfolio: Array<{
    title: string;
    mediaUrl: string;
    type: 'image' | 'video' | 'audio';
    thumbnail?: string;
  }>;
}

interface CategoriesClientProps {
  categories: Category[];
  params: { locale: string };
}

// Range filter operator type
type RangeOperator = 'between' | 'exactly' | 'atLeast' | 'atMost';

export default function CategoriesClient({ categories, params }: Readonly<CategoriesClientProps>) {
  const t = useTranslations('Categories');
  const locale = useLocale();
  const router = useRouter();

  // Translate a category name from DB to the current locale, with English fallback
  const translateCategoryName = (dbName: string): string => {
    const key = getCategoryI18nKey(dbName);
    if (!key) return dbName;
    try {
      return t(`names.${key}`);
    } catch {
      return dbName;
    }
  };
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Multi-select for categories and subcategories (for first two phases)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  
  // Combined mode: view talents from multiple categories/subcategories inline
  const [isCombinedMode, setIsCombinedMode] = useState(false);
  const [combinedTalents, setCombinedTalents] = useState<any[]>([]);
  const [combinedTotal, setCombinedTotal] = useState(0);
  const [combinedLoading, setCombinedLoading] = useState(false);
  const [combinedError, setCombinedError] = useState<string | null>(null);
  const [combinedPage, setCombinedPage] = useState(1);
  
  // Range filter operators (for advanced filtering)
  const [ageOperator, setAgeOperator] = useState<RangeOperator>('between');
  const [heightOperator, setHeightOperator] = useState<RangeOperator>('between');
  const [experienceOperator, setExperienceOperator] = useState<RangeOperator>('between');
  
  // Track which preset is selected (null = custom)
  const [agePreset, setAgePreset] = useState<string | null>(null);
  const [heightPreset, setHeightPreset] = useState<string | null>(null);
  const [experiencePreset, setExperiencePreset] = useState<string | null>(null);
  
  // Filter tab state
  const [filterTab, setFilterTab] = useState<'main' | 'more'>('main');
  
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

  // Search suggestions based on categories/subcategories
  const searchSuggestions = useMemo(() => {
    if (!searchInputValue.trim()) return [];
    const lowerInput = searchInputValue.toLowerCase();
    
    const categoryMatches = categories
      .filter(cat => cat.name.toLowerCase().includes(lowerInput))
      .map(cat => ({ type: 'category' as const, name: cat.name, id: cat.id }));
    
    const subcategoryMatches = categories
      .flatMap(cat => cat.subcategories.map(sub => ({ ...sub, parentName: cat.name, parentId: cat.id })))
      .filter(sub => sub.name.toLowerCase().includes(lowerInput))
      .map(sub => ({ type: 'subcategory' as const, name: sub.name, id: sub.id, parentName: sub.parentName }));
    
    return [...categoryMatches.slice(0, 3), ...subcategoryMatches.slice(0, 4)].slice(0, 6);
  }, [searchInputValue, categories]);

  // State for phase 3 suggestions visibility
  const [showPhase3Suggestions, setShowPhase3Suggestions] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [talentsError, setTalentsError] = useState<string | null>(null);
  const [selectedMediaItem, setSelectedMediaItem] = useState<any | null>(null);

  // Phase 3 search suggestions - skills and talent names from current results (after talents state)
  const phase3SearchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQuery = searchQuery.toLowerCase();
    const allTalentsSource = isCombinedMode ? combinedTalents : talents;
    
    // Get unique skills from current talents
    const allSkills = Array.from(new Set(
      allTalentsSource.flatMap((t: any) => t.skills || [])
    )).filter(skill => skill.toLowerCase().includes(lowerQuery)).slice(0, 3);
    
    // Get talent names matching
    const matchingTalents = allTalentsSource
      .filter((t: any) => {
        const name = t.name || t.user?.name || '';
        return name.toLowerCase().includes(lowerQuery);
      })
      .slice(0, 3)
      .map((t: any) => ({ type: 'talent' as const, name: t.name || t.user?.name, id: t.id }));
    
    // Get category/subcategory suggestions
    const catSuggestions = categories
      .filter(c => c.name.toLowerCase().includes(lowerQuery) && !selectedCategories.includes(c.name))
      .slice(0, 2)
      .map(c => ({ type: 'category' as const, name: c.name, id: c.id }));
    
    const subSuggestions = categories
      .flatMap(cat => cat.subcategories.filter(sub => 
        sub.name.toLowerCase().includes(lowerQuery) && !selectedSubcategories.includes(sub.name)
      ).map(sub => ({ ...sub, parentName: cat.name })))
      .slice(0, 2)
      .map(s => ({ type: 'subcategory' as const, name: s.name, id: s.id, parentName: s.parentName }));
    
    return [
      ...allSkills.map(skill => ({ type: 'skill' as const, name: skill })),
      ...matchingTalents,
      ...catSuggestions,
      ...subSuggestions
    ].slice(0, 6);
  }, [searchQuery, talents, combinedTalents, isCombinedMode, categories, selectedCategories, selectedSubcategories]);

  // Filter displayed talents based on search query
  const filteredTalents = useMemo(() => {
    if (!searchQuery.trim()) return talents;
    const lowerQuery = searchQuery.toLowerCase();
    return talents.filter((t: any) => {
      const name = (t.name || t.user?.name || '').toLowerCase();
      const skills = (t.skills || []).map((s: string) => s.toLowerCase());
      const category = (typeof t.category === 'string' ? t.category : t.category?.name || '').toLowerCase();
      return name.includes(lowerQuery) || 
             skills.some((s: string) => s.includes(lowerQuery)) ||
             category.includes(lowerQuery);
    });
  }, [talents, searchQuery]);

  const filteredCombinedTalents = useMemo(() => {
    if (!searchQuery.trim()) return combinedTalents;
    const lowerQuery = searchQuery.toLowerCase();
    return combinedTalents.filter((t: any) => {
      const name = (t.name || t.user?.name || '').toLowerCase();
      const skills = (t.skills || []).map((s: string) => s.toLowerCase());
      const category = (typeof t.category === 'string' ? t.category : t.category?.name || '').toLowerCase();
      return name.includes(lowerQuery) || 
             skills.some((s: string) => s.includes(lowerQuery)) ||
             category.includes(lowerQuery);
    });
  }, [combinedTalents, searchQuery]);

  // Dynamic header title and description
  const dynamicHeaderTitle = useMemo(() => {
    if (selectedCategories.length === 0 && selectedSubcategories.length === 0) {
      return selectedSubcategory?.name || 'Talents';
    }
    if (selectedCategories.length === 1 && selectedSubcategories.length === 0) {
      return selectedCategories[0];
    }
    if (selectedSubcategories.length === 1 && selectedCategories.length === 0) {
      return selectedSubcategories[0];
    }
    const totalItems = selectedCategories.length + selectedSubcategories.length;
    return `${totalItems} Selection${totalItems > 1 ? 's' : ''}`;
  }, [selectedCategories, selectedSubcategories, selectedSubcategory]);

  const dynamicHeaderDescription = useMemo(() => {
    const totalResults = isCombinedMode ? 
      (searchQuery ? filteredCombinedTalents.length : combinedTotal) : 
      (searchQuery ? filteredTalents.length : total);
    
    if (selectedCategories.length === 0 && selectedSubcategories.length === 0) {
      return selectedSubcategory?.description || `${totalResults} talent${totalResults !== 1 ? 's' : ''} found`;
    }
    
    const parts: string[] = [];
    if (selectedCategories.length > 0) {
      parts.push(`${selectedCategories.length} categor${selectedCategories.length > 1 ? 'ies' : 'y'}`);
    }
    if (selectedSubcategories.length > 0) {
      parts.push(`${selectedSubcategories.length} subcategor${selectedSubcategories.length > 1 ? 'ies' : 'y'}`);
    }
    return `Browsing ${parts.join(' and ')} • ${totalResults} talent${totalResults !== 1 ? 's' : ''} found`;
  }, [selectedCategories, selectedSubcategories, selectedSubcategory, isCombinedMode, combinedTotal, total, searchQuery, filteredTalents, filteredCombinedTalents]);

  // Special marker ID for "View All" in a category (no subcategory filter)
  const VIEW_ALL_ID = '__view_all__';

  useEffect(() => {
    if (!selectedSubcategory) return;
    const isViewAll = selectedSubcategory.id === VIEW_ALL_ID;
    const fetchTalents = async () => {
      setIsLoading(true);
      setTalentsError(null);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      try {
        const res = await fetch('/api/talent/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...filters,
            ...(isViewAll
              ? { categoryId: selectedCategory?.id }
              : { subcategoryId: selectedSubcategory.id }),
            page,
            pageSize,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) {
           throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        if (data.success) {
          setTalents(data.talents);
          setTotal(data.total || 0);
        } else {
          setTalents([]);
          setTotal(0);
          setTalentsError(t('errors.failedToLoadTalents'));
        }
      } catch (err: any) {
        console.error('Fetch talents error:', err);
        setTalents([]);
        if (err.name === 'AbortError') {
            setTalentsError('Request timed out. Please try again.');
        } else {
            setTalentsError(t('errors.failedToLoadTalents'));
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchTalents();
  }, [selectedSubcategory, filters, page, pageSize, t]);

  const allMediaItems = useMemo(() => {
    return talents.flatMap(talent => 
      (talent.portfolio || []).map((item, index) => ({
        id: `${talent.id}-media-${index}`,
        title: item.title,
        mediaUrl: item.mediaUrl,
        type: item.type.toUpperCase() as 'IMAGE' | 'VIDEO' | 'AUDIO',
        thumbnail: item.type === 'video' ? undefined : item.mediaUrl,
        talentProfile: {
          id: talent.id,
          user: { name: talent.user.name },
          avatarUrl: talent.user.profilePicture,
          category: { name: talent.category.name },
          location: talent.location
        },
        views: 0,
        likeCount: 0,
        createdAt: new Date().toISOString()
      }))
    );
  }, [talents]);

  // Sync URL with selectedMediaItem
  useEffect(() => {
    const mediaId = searchParams.get('mediaId');
    if (mediaId && allMediaItems.length > 0) {
      const item = allMediaItems.find(i => i.id === mediaId);
      if (item) {
        setSelectedMediaItem(item);
      }
    } else if (!mediaId) {
      setSelectedMediaItem(null);
    }
  }, [searchParams, allMediaItems]);

  // Sync URL with selectedCategory and selectedSubcategory
  useEffect(() => {
    const categoryName = searchParams.get('category');
    const subcategoryName = searchParams.get('subcategory');

    if (categoryName) {
      const category = categories.find(c => c.name === categoryName);
      if (category) {
        setSelectedCategory(category);
        if (subcategoryName === '__all__') {
          // "View All" mode — synthetic subcategory to show all talents in category
          setSelectedSubcategory({
            id: VIEW_ALL_ID,
            name: `All ${category.name}`,
            description: `All talents in ${category.name}`,
            _count: { talentProfiles: category._count.talentProfiles },
          });
        } else if (subcategoryName) {
          const subcategory = category.subcategories.find(s => s.name === subcategoryName);
          if (subcategory) {
            setSelectedSubcategory(subcategory);
          } else {
             setSelectedSubcategory(null);
          }
        } else {
          setSelectedSubcategory(null);
        }
      } else {
         setSelectedCategory(null);
         setSelectedSubcategory(null);
      }
    } else {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    }
  }, [searchParams, categories]);

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

  const handleCategorySelect = (category: Category) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', category.name);
    params.delete('subcategory');
    router.push(`?${params.toString()}`);
  };

  const handleBackToSubcategories = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('subcategory');
    router.push(`?${params.toString()}`);
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
    // Reset operators and presets
    setAgeOperator('between');
    setHeightOperator('between');
    setExperienceOperator('between');
    setAgePreset(null);
    setHeightPreset(null);
    setExperiencePreset(null);
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory.name);
    if (selectedSubcategory) params.set('subcategory', selectedSubcategory.name);
    
    if (filters.gender?.length) params.set('gender', filters.gender.join(','));
    if (filters.bodyType?.length) params.set('bodyType', filters.bodyType.join(','));
    if (filters.ethnicity?.length) params.set('ethnicity', filters.ethnicity.join(','));
    
    if (filters.ageRange && (filters.ageRange.min !== 5 || filters.ageRange.max !== 80)) {
      params.set('minAge', filters.ageRange.min.toString());
      params.set('maxAge', filters.ageRange.max.toString());
    }
    
    if (filters.experience && (filters.experience.min !== 0 || filters.experience.max !== 20)) {
      params.set('minExperience', filters.experience.min.toString());
      params.set('maxExperience', filters.experience.max.toString());
    }

    if (filters.heightRange && (filters.heightRange.min !== 150 || filters.heightRange.max !== 200)) {
      params.set('minHeight', filters.heightRange.min.toString());
      params.set('maxHeight', filters.heightRange.max.toString());
    }
    
    if (filters.eyeColor?.length) params.set('eyeColor', filters.eyeColor.join(','));
    if (filters.hairColor?.length) params.set('hairColor', filters.hairColor.join(','));
    if (filters.skills?.length) params.set('skills', filters.skills.join(','));
    if (filters.languages?.length) params.set('languages', filters.languages.join(','));
    if (filters.location) params.set('location', filters.location);

    router.push(`/${locale}/search-results?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  // Enter combined mode to view talents from multiple categories/subcategories inline
  const browseSelectedCategories = () => {
    setIsCombinedMode(true);
    setShowFilters(false);
    setCombinedPage(1);
  };
  
  // Exit combined mode
  const exitCombinedMode = () => {
    setIsCombinedMode(false);
    setCombinedTalents([]);
    setCombinedTotal(0);
  };
  
  // Fetch combined talents when in combined mode
  useEffect(() => {
    if (!isCombinedMode || (selectedCategories.length === 0 && selectedSubcategories.length === 0)) return;
    
    const fetchCombinedTalents = async () => {
      setCombinedLoading(true);
      setCombinedError(null);
      
      try {
        const params = new URLSearchParams();
        if (selectedCategories.length > 0) params.set('categories', selectedCategories.join(','));
        if (selectedSubcategories.length > 0) params.set('subcategories', selectedSubcategories.join(','));
        params.set('page', combinedPage.toString());
        params.set('pageSize', '12');
        
        // Add filters
        if (filters.gender?.length) params.set('gender', filters.gender.join(','));
        if (filters.bodyType?.length) params.set('bodyType', filters.bodyType.join(','));
        if (filters.ethnicity?.length) params.set('ethnicity', filters.ethnicity.join(','));
        if (filters.skills?.length) params.set('skills', filters.skills.join(','));
        if (filters.languages?.length) params.set('languages', filters.languages.join(','));
        if (filters.eyeColor?.length) params.set('eyeColor', filters.eyeColor.join(','));
        if (filters.hairColor?.length) params.set('hairColor', filters.hairColor.join(','));
        if (filters.location) params.set('location', filters.location);
        if (filters.ageRange && (filters.ageRange.min !== 5 || filters.ageRange.max !== 80)) {
          params.set('minAge', filters.ageRange.min.toString());
          params.set('maxAge', filters.ageRange.max.toString());
        }
        if (filters.heightRange && (filters.heightRange.min !== 150 || filters.heightRange.max !== 200)) {
          params.set('minHeight', filters.heightRange.min.toString());
          params.set('maxHeight', filters.heightRange.max.toString());
        }
        if (filters.experience && (filters.experience.min !== 0 || filters.experience.max !== 20)) {
          params.set('minExp', filters.experience.min.toString());
          params.set('maxExp', filters.experience.max.toString());
        }
        
        const res = await fetch(`/api/talent/search?${params.toString()}`);
        const data = await res.json();
        
        if (data.success) {
          setCombinedTalents(data.talents || []);
          setCombinedTotal(data.total || 0);
        } else {
          setCombinedError('Failed to load talents');
        }
      } catch (err) {
        console.error('Combined fetch error:', err);
        setCombinedError('Failed to load talents');
      } finally {
        setCombinedLoading(false);
      }
    };
    
    fetchCombinedTalents();
  }, [isCombinedMode, selectedCategories, selectedSubcategories, combinedPage, filters]);

  // Category Filter Panel (for phases 1 & 2)
  const renderCategoryFilterPanel = () => (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[60vh] overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          📁 Select Multiple Categories to Browse Together
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Choose categories you want to explore. For example, select both &quot;Musical Theater&quot; and &quot;Voice Actors&quot; to see talents from both.
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategories(prev => 
                  prev.includes(category.name)
                    ? prev.filter(c => c !== category.name)
                    : [...prev, category.name]
                );
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedCategories.includes(category.name)
                  ? 'bg-primary-blue dark:bg-accent-red text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {getCategoryIcon(category.icon)}
              <span>{translateCategoryName(category.name)}</span>
              <span className="text-xs opacity-75">({category._count.talentProfiles})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Show subcategories of selected categories */}
      {selectedCategories.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            📂 Subcategories (from selected categories)
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories
              .filter(cat => selectedCategories.includes(cat.name))
              .flatMap(cat => cat.subcategories.map(sub => ({ ...sub, parentName: cat.name })))
              .map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => {
                    setSelectedSubcategories(prev => 
                      prev.includes(subcategory.name)
                        ? prev.filter(s => s !== subcategory.name)
                        : [...prev, subcategory.name]
                    );
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedSubcategories.includes(subcategory.name)
                      ? 'bg-primary-blue dark:bg-accent-red text-white'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {subcategory.name}
                  <span className="ml-1 opacity-75">({subcategory.parentName})</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Filter Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {selectedCategories.length > 0 && (
            <span>{selectedCategories.length} categories selected</span>
          )}
          {selectedCategories.length > 0 && selectedSubcategories.length > 0 && <span className="mx-2">•</span>}
          {selectedSubcategories.length > 0 && (
            <span>{selectedSubcategories.length} subcategories selected</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedCategories([]);
              setSelectedSubcategories([]);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Clear Selection
          </button>
          {(selectedCategories.length > 0 || selectedSubcategories.length > 0) && (
            <button
              onClick={browseSelectedCategories}
              className="px-6 py-2 bg-primary-blue dark:bg-accent-red text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium"
            >
              Browse {selectedCategories.length + selectedSubcategories.length} Selected →
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Subcategory Filter Panel (for phase 2 - when viewing a category's subcategories)
  const renderSubcategoryFilterPanel = () => {
    if (!selectedCategory) return null;
    
    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[60vh] overflow-y-auto">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            📂 Select Multiple Subcategories to Browse Together
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Choose subcategories from &quot;{selectedCategory.name}&quot; or add from other categories too.
          </p>
          
          {/* Current category's subcategories */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              {selectedCategory.name}
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedCategory.subcategories.map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => {
                    setSelectedSubcategories(prev => 
                      prev.includes(subcategory.name)
                        ? prev.filter(s => s !== subcategory.name)
                        : [...prev, subcategory.name]
                    );
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedSubcategories.includes(subcategory.name)
                      ? 'bg-primary-blue dark:bg-accent-red text-white'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {subcategory.name}
                  {subcategory._count?.talentProfiles > 0 && (
                    <span className="ml-1 opacity-75">({subcategory._count.talentProfiles})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Add from other categories */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              + Add from other categories
            </h4>
            <div className="space-y-3">
              {categories
                .filter(cat => cat.id !== selectedCategory.id)
                .map((category) => (
                  <div key={category.id}>
                    <button
                      onClick={() => {
                        // Toggle all subcategories from this category
                        const subNames = category.subcategories.map(s => s.name);
                        const allSelected = subNames.every(n => selectedSubcategories.includes(n));
                        if (allSelected) {
                          setSelectedSubcategories(prev => prev.filter(s => !subNames.includes(s)));
                        } else {
                          setSelectedSubcategories(prev => [...new Set([...prev, ...subNames])]);
                        }
                      }}
                      className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-primary-blue dark:hover:text-accent-red transition-colors flex items-center gap-1"
                    >
                      {getCategoryIcon(category.icon)}
                      {translateCategoryName(category.name)}
                    </button>
                    <div className="flex flex-wrap gap-1.5 mt-1.5 ml-5">
                      {category.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setSelectedSubcategories(prev => 
                              prev.includes(sub.name)
                                ? prev.filter(s => s !== sub.name)
                                : [...prev, sub.name]
                            );
                          }}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                            selectedSubcategories.includes(sub.name)
                              ? 'bg-primary-blue dark:bg-accent-red text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {selectedSubcategories.length > 0 && (
              <span>{selectedSubcategories.length} subcategories selected</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedSubcategories([])}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Clear Selection
            </button>
            {selectedSubcategories.length > 0 && (
              <button
                onClick={browseSelectedCategories}
                className="px-6 py-2 bg-primary-blue dark:bg-accent-red text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium"
              >
                Browse {selectedSubcategories.length} Selected →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Count active filters for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.gender?.length) count++;
    if (filters.bodyType?.length) count++;
    if (filters.ethnicity?.length) count++;
    if (filters.ageRange && (filters.ageRange.min !== 5 || filters.ageRange.max !== 80)) count++;
    if (filters.heightRange && (filters.heightRange.min !== 150 || filters.heightRange.max !== 200)) count++;
    if (filters.experience && (filters.experience.min !== 0 || filters.experience.max !== 20)) count++;
    if (filters.eyeColor?.length) count++;
    if (filters.hairColor?.length) count++;
    if (filters.skills?.length) count++;
    if (filters.languages?.length) count++;
    if ((filters as any).disabilities?.length) count++;
    if (filters.location) count++;
    return count;
  }, [filters]);

  // Inline Filter Panel Component (for phase 3 - talents view)
  const renderFilterPanel = () => {
    return (
    <div className="my-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="p-4">
        {/* Header with Close */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filter Talents
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-600 dark:bg-red-500 text-white text-xs rounded-full">{activeFilterCount}</span>
            )}
          </h3>
          <button
            type="button"
            onClick={() => setShowFilters(false)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setFilterTab('main')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              filterTab === 'main'
                ? 'border-blue-600 dark:border-red-500 text-blue-600 dark:text-red-500'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            Main Filters
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('more')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              filterTab === 'more'
                ? 'border-blue-600 dark:border-red-500 text-blue-600 dark:text-red-500'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            More Filters
          </button>
        </div>

        {/* TAB 1: Main Filters */}
        {filterTab === 'main' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Quick Filters: Gender */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Gender</label>
              <div className="flex flex-wrap gap-1.5">
                {['male', 'female', 'non-binary', 'other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      const current = filters.gender || [];
                      const updated = current.includes(g) ? current.filter(x => x !== g) : [...current, g];
                      setFilters(prev => ({ ...prev, gender: updated }));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                      filters.gender?.includes(g)
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Filters: Body Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Body Type</label>
              <div className="flex flex-wrap gap-1.5">
                {['slim', 'athletic', 'average', 'curvy', 'muscular'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      const current = filters.bodyType || [];
                      const updated = current.includes(b) ? current.filter(x => x !== b) : [...current, b];
                      setFilters(prev => ({ ...prev, bodyType: updated }));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                      filters.bodyType?.includes(b)
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Skills */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Skills</label>
              <SkillMultiSelect
                value={filters.skills || []}
                onChange={(vals) => setFilters(prev => ({ ...prev, skills: vals }))}
                placeholder="Type to search skills..."
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Location</label>
              <div className="flex gap-1">
                <LocationAutocomplete
                  value={filters.location || ''}
                  onChange={(v) => setFilters(prev => ({ ...prev, location: v }))}
                  placeholder="City or region..."
                />
                <button
                  type="button"
                  className="px-2 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm flex-shrink-0"
                  title="Use my location"
                  onClick={async () => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(async (pos) => {
                        const { latitude, longitude } = pos.coords;
                        try {
                          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                          const data = await res.json();
                          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || '';
                          setFilters(prev => ({ ...prev, location: city }));
                        } catch { /* ignore */ }
                      });
                    }
                  }}
                >
                  📍
                </button>
              </div>
            </div>

            {/* Appearance Dropdowns - Compact Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Ethnicity</label>
                <MultiSelect
                  options={[
                    { label: 'White/Caucasian', value: 'WHITE_CAUCASIAN' },
                    { label: 'Black/African', value: 'BLACK_AFRICAN' },
                    { label: 'Asian', value: 'ASIAN' },
                    { label: 'Hispanic/Latino', value: 'HISPANIC_LATINO' },
                    { label: 'Middle Eastern', value: 'MIDDLE_EASTERN' },
                    { label: 'Mixed', value: 'MIXED_MULTIRACIAL' },
                    { label: 'Other', value: 'OTHER' },
                  ]}
                  value={filters.ethnicity || []}
                  onChange={(vals) => setFilters(prev => ({ ...prev, ethnicity: vals }))}
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Eye Color</label>
                <MultiSelect
                  options={[
                    { label: 'Blue', value: 'Blue' },
                    { label: 'Brown', value: 'Brown' },
                    { label: 'Green', value: 'Green' },
                    { label: 'Hazel', value: 'Hazel' },
                    { label: 'Gray', value: 'Gray' },
                  ]}
                  value={filters.eyeColor || []}
                  onChange={(vals) => setFilters(prev => ({ ...prev, eyeColor: vals }))}
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Hair Color</label>
                <MultiSelect
                  options={[
                    { label: 'Black', value: 'Black' },
                    { label: 'Brown', value: 'Brown' },
                    { label: 'Blonde', value: 'Blonde' },
                    { label: 'Red', value: 'Red' },
                    { label: 'Gray', value: 'Gray' },
                  ]}
                  value={filters.hairColor || []}
                  onChange={(vals) => setFilters(prev => ({ ...prev, hairColor: vals }))}
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Languages</label>
                <MultiSelect
                  options={[
                    { label: 'English', value: 'English' },
                    { label: 'Spanish', value: 'Spanish' },
                    { label: 'French', value: 'French' },
                    { label: 'German', value: 'German' },
                    { label: 'Mandarin', value: 'Mandarin' },
                    { label: 'Japanese', value: 'Japanese' },
                  ]}
                  value={filters.languages || []}
                  onChange={(vals) => setFilters(prev => ({ ...prev, languages: vals }))}
                  placeholder="Any"
                />
              </div>
            </div>
          </div>
        </div>
        )}

        {/* TAB 2: More Filters (Age, Height, Experience) */}
        {filterTab === 'more' && (
        <div className="space-y-5">
          {/* Age - Single Input + Range Presets + Range Inputs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Age</label>
              {(filters.ageRange?.min !== 5 || filters.ageRange?.max !== 80) && (
                <button type="button" onClick={() => { setFilters(prev => ({ ...prev, ageRange: { min: 5, max: 80 } })); setAgePreset(null); }} className="text-xs text-blue-600 dark:text-red-400">Reset</button>
              )}
            </div>
            <div className="mb-3">
              <input
                type="number"
                min="5"
                max="80"
                value={filters.ageRange?.min || 25}
                onChange={(e) => setFilters(prev => ({ ...prev, ageRange: { min: parseInt(e.target.value) || 25, max: parseInt(e.target.value) || 25 } }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-center text-base mb-2"
                placeholder="Enter specific age..."
              />
              <div className="text-xs text-gray-400">Looking for talent aged {filters.ageRange?.min || 25}</div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                { label: 'Any', min: 5, max: 80, key: 'any' },
                { label: '5-17', min: 5, max: 17, key: 'child' },
                { label: '18-25', min: 18, max: 25, key: 'young' },
                { label: '25-35', min: 25, max: 35, key: 'adult' },
                { label: '35-50', min: 35, max: 50, key: 'middle' },
                { label: '50+', min: 50, max: 80, key: 'senior' },
              ].map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => { setFilters(prev => ({ ...prev, ageRange: { min: preset.min, max: preset.max } })); setAgePreset(preset.key); }}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    agePreset === preset.key ? 'bg-blue-600 dark:bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="number" min="5" max="80" value={filters.ageRange?.min || 5}
                onChange={(e) => { setFilters(prev => ({ ...prev, ageRange: { min: parseInt(e.target.value) || 5, max: prev.ageRange?.max || 80 } })); setAgePreset(null); }}
                className="w-16 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-center"
              />
              <span className="text-xs text-gray-400">to</span>
              <input type="number" min="5" max="80" value={filters.ageRange?.max || 80}
                onChange={(e) => { setFilters(prev => ({ ...prev, ageRange: { min: prev.ageRange?.min || 5, max: parseInt(e.target.value) || 80 } })); setAgePreset(null); }}
                className="w-16 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-center"
              />
              <span className="text-xs text-gray-400">years</span>
            </div>
          </div>

          {/* Height - Single Input + Range Presets + Range Inputs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Height</label>
              {(filters.heightRange?.min !== 150 || filters.heightRange?.max !== 200) && (
                <button type="button" onClick={() => { setFilters(prev => ({ ...prev, heightRange: { min: 150, max: 200 } })); setHeightPreset(null); }} className="text-xs text-blue-600 dark:text-red-400">Reset</button>
              )}
            </div>
            <div className="mb-3">
              <input
                type="number"
                min="100"
                max="250"
                value={filters.heightRange?.min || 170}
                onChange={(e) => setFilters(prev => ({ ...prev, heightRange: { min: parseInt(e.target.value) || 170, max: parseInt(e.target.value) || 170 } }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-center text-base mb-2"
                placeholder="Enter specific height..."
              />
              <div className="text-xs text-gray-400">Looking for talent {filters.heightRange?.min || 170} cm tall</div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                { label: 'Any', min: 150, max: 200, key: 'any' },
                { label: '<160', min: 150, max: 160, key: 'short' },
                { label: '160-170', min: 160, max: 170, key: 'medium' },
                { label: '170-180', min: 170, max: 180, key: 'average' },
                { label: '180+', min: 180, max: 220, key: 'tall' },
              ].map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => { setFilters(prev => ({ ...prev, heightRange: { min: preset.min, max: preset.max } })); setHeightPreset(preset.key); }}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    heightPreset === preset.key ? 'bg-blue-600 dark:bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="number" min="100" max="250" value={filters.heightRange?.min || 150}
                onChange={(e) => { setFilters(prev => ({ ...prev, heightRange: { min: parseInt(e.target.value) || 150, max: prev.heightRange?.max || 200 } })); setHeightPreset(null); }}
                className="w-16 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-center"
              />
              <span className="text-xs text-gray-400">to</span>
              <input type="number" min="100" max="250" value={filters.heightRange?.max || 200}
                onChange={(e) => { setFilters(prev => ({ ...prev, heightRange: { min: prev.heightRange?.min || 150, max: parseInt(e.target.value) || 200 } })); setHeightPreset(null); }}
                className="w-16 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-center"
              />
              <span className="text-xs text-gray-400">cm</span>
            </div>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3">Experience</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Any', min: 0, max: 20, key: 'any' },
                { label: 'Beginner', min: 0, max: 2, key: 'beginner' },
                { label: '2-5 yrs', min: 2, max: 5, key: 'some' },
                { label: '5-10 yrs', min: 5, max: 10, key: 'experienced' },
                { label: '10+ yrs', min: 10, max: 30, key: 'veteran' },
              ].map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => { setFilters(prev => ({ ...prev, experience: { min: preset.min, max: preset.max } })); setExperiencePreset(preset.key); }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    experiencePreset === preset.key ? 'bg-blue-600 dark:bg-red-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(false)}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg text-sm font-medium shadow-md"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
    );
  };

  // Combined Mode View - shows talents from multiple categories/subcategories
  if (isCombinedMode) {
    const combinedMediaItems = combinedTalents.flatMap((talent: any) => 
      (talent.portfolio || []).map((item: any, index: number) => ({
        id: item.id || `${talent.id}-media-${index}`,
        title: item.title || '',
        mediaUrl: item.mediaUrl,
        type: (item.type || 'IMAGE').toUpperCase() as 'IMAGE' | 'VIDEO' | 'AUDIO',
        thumbnail: item.thumbnail || (item.type?.toLowerCase() === 'video' ? undefined : item.mediaUrl),
        talentProfile: {
          id: talent.id,
          user: { name: talent.name || talent.user?.name || 'Unknown' },
          avatarUrl: talent.avatarUrl || talent.user?.profilePicture,
          category: { name: typeof talent.category === 'string' ? talent.category : (talent.category?.name || 'Uncategorized') },
          location: talent.location || ''
        },
        views: item.views || 0,
        likeCount: item.likeCount || 0,
        createdAt: item.createdAt || new Date().toISOString()
      }))
    );

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sticky Header */}
        <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
          <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
            {/* Top Row: Back + Title + Search + Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-shrink-0">
                <button
                  onClick={exitCombinedMode}
                  className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                    {dynamicHeaderTitle}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                    {dynamicHeaderDescription}
                  </p>
                </div>
              </div>

              {/* Search Bar + Filter Button */}
              <div className="flex items-center gap-2 flex-1 sm:justify-end">
                {/* Smart Search Input with Suggestions */}
                <div className="relative flex-1 sm:max-w-sm lg:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <input
                    type="text"
                    placeholder="Search talents, skills..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowPhase3Suggestions(true);
                    }}
                    onFocus={() => searchQuery && setShowPhase3Suggestions(true)}
                    onBlur={() => setTimeout(() => setShowPhase3Suggestions(false), 200)}
                    className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500 focus:border-transparent transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setShowPhase3Suggestions(false); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  
                  {/* Smart Suggestions Dropdown */}
                  {showPhase3Suggestions && phase3SearchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                      {phase3SearchSuggestions.map((suggestion, idx) => (
                        <button
                          key={`${suggestion.type}-${suggestion.name}-${idx}`}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            if (suggestion.type === 'skill') {
                              setFilters(prev => ({
                                ...prev,
                                skills: prev.skills?.includes(suggestion.name) ? prev.skills : [...(prev.skills || []), suggestion.name]
                              }));
                              setSearchQuery('');
                            } else if (suggestion.type === 'category') {
                              if (!selectedCategories.includes(suggestion.name)) {
                                setSelectedCategories(prev => [...prev, suggestion.name]);
                              }
                              setSearchQuery('');
                            } else if (suggestion.type === 'subcategory') {
                              if (!selectedSubcategories.includes(suggestion.name)) {
                                setSelectedSubcategories(prev => [...prev, suggestion.name]);
                              }
                              setSearchQuery('');
                            } else {
                              setSearchQuery(suggestion.name);
                            }
                            setShowPhase3Suggestions(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                        >
                          {suggestion.type === 'skill' && <Sparkles className="w-4 h-4 text-purple-500" />}
                          {suggestion.type === 'talent' && <Users className="w-4 h-4 text-blue-500" />}
                          {suggestion.type === 'category' && <span className="text-sm">📁</span>}
                          {suggestion.type === 'subcategory' && <span className="text-sm">📂</span>}
                          <span className="text-gray-900 dark:text-white">{suggestion.name}</span>
                          <span className="text-xs text-gray-400 ml-auto capitalize">{suggestion.type}</span>
                        </button>
                      ))}
                      {searchQuery && (
                        <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                          Showing {filteredCombinedTalents.length} matching results
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Filter Button with Count Badge */}
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all font-medium text-sm ${
                    showFilters
                      ? 'bg-blue-600 dark:bg-red-500 text-white border-transparent shadow-md'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className={`px-1.5 py-0.5 text-xs rounded-full font-bold ${showFilters ? 'bg-white/20 text-white' : 'bg-blue-600 dark:bg-red-500 text-white'}`}>
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Compact Browsing Context + Active Filters Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Selected Categories/Subcategories */}
              {(selectedCategories.length > 0 || selectedSubcategories.length > 0) && (
                <>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide">In:</span>
                  {selectedCategories.map(cat => (
                    <span key={cat} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs font-medium">
                      {cat}
                      <button 
                        onClick={() => {
                          setSelectedCategories(prev => prev.filter(c => c !== cat));
                          if (selectedCategories.length === 1 && selectedSubcategories.length === 0) {
                            exitCombinedMode();
                          }
                        }} 
                        className="hover:bg-blue-600 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {selectedSubcategories.map(sub => (
                    <span key={sub} className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500 text-white rounded-full text-xs font-medium">
                      {sub}
                      <button 
                        onClick={() => {
                          setSelectedSubcategories(prev => prev.filter(s => s !== sub));
                          if (selectedSubcategories.length === 1 && selectedCategories.length === 0) {
                            exitCombinedMode();
                          }
                        }} 
                        className="hover:bg-purple-600 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </>
              )}
              
              {/* Active Filter Pills (always visible) */}
              {activeFilterCount > 0 && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  {filters.gender?.slice(0, 2).map(g => (
                    <span key={g} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs capitalize">
                      {g} <button onClick={() => setFilters(prev => ({ ...prev, gender: prev.gender?.filter(x => x !== g) }))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {filters.bodyType?.slice(0, 2).map(b => (
                    <span key={b} className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs capitalize">
                      {b} <button onClick={() => setFilters(prev => ({ ...prev, bodyType: prev.bodyType?.filter(x => x !== b) }))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {filters.skills?.slice(0, 2).map(s => (
                    <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                      {s} <button onClick={() => setFilters(prev => ({ ...prev, skills: prev.skills?.filter(x => x !== s) }))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {activeFilterCount > 4 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">+{activeFilterCount - 4} more</span>
                  )}
                  <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-red-500 underline">
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Filter Panel - Outside sticky header, pushes content down */}
        {showFilters && (
          <div className="max-w-screen-2xl mx-auto px-3 sm:px-6">
            {renderFilterPanel()}
          </div>
        )}

        {/* Results Content */}
        <div className="max-w-screen-2xl mx-auto p-3 sm:p-6">
          {combinedLoading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary-blue dark:text-accent-red mb-4" />
              <span className="text-gray-600 dark:text-gray-400">Searching talents...</span>
            </div>
          ) : combinedError ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl">
              <p className="text-red-600 dark:text-red-400 mb-4">{combinedError}</p>
              <button
                onClick={() => setCombinedPage(1)}
                className="text-primary-blue dark:text-accent-red hover:underline font-medium"
              >
                Try again
              </button>
            </div>
          ) : filteredCombinedTalents.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl">
              <Users className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No matching talents' : 'No talents found'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? `No talents match "${searchQuery}". Try different keywords or clear your search.`
                  : 'Try selecting different categories or adjusting your filters.'
                }
              </p>
              <button
                onClick={() => { searchQuery ? setSearchQuery('') : clearFilters(); setCombinedPage(1); }}
                className="px-4 py-2 bg-blue-600 dark:bg-red-500 text-white rounded-lg hover:opacity-90 transition-colors font-medium"
              >
                {searchQuery ? 'Clear Search' : 'Clear Filters'}
              </button>
            </div>
          ) : (
            <>
              {/* Search Result Count */}
              {searchQuery && (
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Found <span className="font-semibold text-gray-900 dark:text-white">{filteredCombinedTalents.length}</span> of {combinedTalents.length} talents matching "<span className="font-medium">{searchQuery}</span>"
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                {filteredCombinedTalents.map((talent: any, index: number) => (
                  <FeaturedTalentCard
                    key={talent.id}
                    priority={index < 8}
                    talent={{
                      id: talent.id,
                      user: { name: talent.name || talent.user?.name || 'Unknown' },
                      avatarUrl: talent.avatarUrl || talent.user?.profilePicture,
                      category: { name: typeof talent.category === 'string' ? talent.category : (talent.category?.name || 'Uncategorized') },
                      skills: talent.skills || []
                    }}
                    mediaItems={(talent.portfolio || []).map((item: any, idx: number) => ({
                      id: item.id || `${talent.id}-media-${idx}`,
                      title: item.title || '',
                      mediaUrl: item.mediaUrl,
                      type: (item.type || 'IMAGE').toUpperCase() as 'IMAGE' | 'VIDEO' | 'AUDIO',
                      thumbnail: item.thumbnail || (item.type?.toLowerCase() === 'video' ? undefined : item.mediaUrl),
                      talentProfile: {
                        id: talent.id,
                        user: { name: talent.name || talent.user?.name || 'Unknown' },
                        avatarUrl: talent.avatarUrl || talent.user?.profilePicture,
                        category: { name: typeof talent.category === 'string' ? talent.category : (talent.category?.name || 'Uncategorized') }
                      },
                      views: item.views || 0,
                      likeCount: item.likeCount || 0,
                      createdAt: item.createdAt || new Date().toISOString()
                    }))}
                    onMediaClick={handleMediaSelect}
                    onProfileClick={() => router.push(`/talent/${talent.id}`)}
                    onSkillClick={(skill: string) => {
                      if (!filters.skills?.includes(skill)) {
                        setFilters(prev => ({ ...prev, skills: [...(prev.skills || []), skill] }));
                      }
                    }}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              {combinedTotal > 12 && (
                <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setCombinedPage(p => Math.max(1, p - 1))}
                    disabled={combinedPage === 1}
                    className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.ceil(combinedTotal / 12) }, (_, i) => i + 1).slice(0, 10).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setCombinedPage(pg)}
                      className={`px-3 py-2 rounded transition-all duration-300 ${combinedPage === pg ? 'bg-primary-blue dark:bg-accent-red text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    onClick={() => setCombinedPage(p => p + 1)}
                    disabled={combinedPage * 12 >= combinedTotal}
                    className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Media Overlay */}
        {selectedMediaItem && (
          <MediaOverlay
            media={selectedMediaItem}
            allMedia={combinedMediaItems}
            talents={combinedTalents.map(t => ({
              id: t.id,
              user: { name: t.user.name },
              avatarUrl: t.user.profilePicture,
              category: { name: t.category.name },
              location: t.location
            }))}
            onClose={handleCloseOverlay}
            onMediaSelect={handleMediaSelect}
          />
        )}
      </div>
    );
  }

  // Main categories view
  if (!selectedCategory) {
    const filteredCategories = categories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.subcategories.some((subcategory) =>
        subcategory.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Sticky Header with Search */}
        <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
          <div className="max-w-screen-2xl mx-auto px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {t('main.title')}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {t('main.description')}
                  </p>
                </div>
              </div>

              {/* Search Bar - Hub Style */}
              <div className="flex-1 max-w-xl w-full relative">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-blue dark:group-focus-within:text-accent-red transition-colors z-10" />
                  <input
                    type="text"
                    placeholder={t('search.placeholder') || "Search categories, talents, or skills..."}
                    value={searchInputValue}
                    onChange={(e) => {
                      setSearchInputValue(e.target.value);
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowSuggestions(false);
                      }
                    }}
                    onFocus={() => searchInputValue && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red focus:border-transparent transition-all"
                  />
                  {searchInputValue && (
                    <button
                      onClick={() => { setSearchInputValue(''); setSearchQuery(''); setShowSuggestions(false); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  
                  {/* Search Suggestions Dropdown */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (suggestion.type === 'category') {
                              const cat = categories.find(c => c.id === suggestion.id);
                              if (cat) handleCategorySelect(cat);
                            } else {
                              const parentCat = categories.find(c => 
                                c.subcategories.some(s => s.id === suggestion.id)
                              );
                              if (parentCat) {
                                const sub = parentCat.subcategories.find(s => s.id === suggestion.id);
                                if (sub) {
                                  const params = new URLSearchParams();
                                  params.set('category', parentCat.name);
                                  params.set('subcategory', sub.name);
                                  router.push(`?${params.toString()}`);
                                }
                              }
                            }
                            setShowSuggestions(false);
                            setSearchInputValue('');
                            setSearchQuery('');
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                        >
                          {suggestion.type === 'category' ? (
                            <Sparkles className="w-4 h-4 text-primary-blue dark:text-accent-red" />
                          ) : (
                            <Search className="w-4 h-4 text-gray-400" />
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium">{suggestion.name}</span>
                            {suggestion.type === 'subcategory' && 'parentName' in suggestion && (
                              <span className="text-xs text-gray-500">in {suggestion.parentName}</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Filters Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all font-medium ${
                  showFilters
                    ? 'bg-primary-blue dark:bg-accent-red text-white border-transparent'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Multi-Select</span>
                {(selectedCategories.length > 0 || selectedSubcategories.length > 0) && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                    {selectedCategories.length + selectedSubcategories.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Filter Panel - Outside sticky header */}
        {showFilters && (
          <div className="max-w-screen-2xl mx-auto px-6">
            {renderCategoryFilterPanel()}
          </div>
        )}

        {/* Main Content */}
        <div className="p-6">
          <div className="max-w-screen-2xl mx-auto">
            {/* Categories List */}
            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="group p-3 border rounded-lg shadow-md hover:bg-primary-blue dark:hover:bg-accent-red transition-colors cursor-pointer aspect-square"
                    onClick={() => handleCategorySelect(category)}
                  >
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category.icon)}
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-white transition-colors">
                          {translateCategoryName(category.name)}
                        </h2>
                        <p className="text-xs text-gray-700 dark:text-gray-200 group-hover:text-white transition-colors">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Search className="w-12 h-12" />}
                title="No categories found"
                description={`We couldn't find any categories matching "${searchQuery}". Try adjusting your search terms.`}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Subcategories view
  if (selectedCategory && !selectedSubcategory) {
    const filteredSubcategories = selectedCategory.subcategories.filter((subcategory) =>
      subcategory.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Sticky Header with Search */}
        <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
          <div className="max-w-screen-2xl mx-auto px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Back Button */}
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete('category');
                    params.delete('subcategory');
                    router.push(`?${params.toString()}`);
                  }}
                  className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {translateCategoryName(selectedCategory.name)}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {selectedCategory.description}
                  </p>
                </div>
              </div>

              {/* Search Bar - Hub Style */}
              <div className="flex-1 max-w-xl w-full relative">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-blue dark:group-focus-within:text-accent-red transition-colors z-10" />
                  <input
                    type="text"
                    placeholder="Search subcategories..."
                    value={searchInputValue}
                    onChange={(e) => {
                      setSearchInputValue(e.target.value);
                      setSearchQuery(e.target.value);
                    }}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red focus:border-transparent transition-all"
                  />
                  {searchInputValue && (
                    <button
                      onClick={() => { setSearchInputValue(''); setSearchQuery(''); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Advanced Filters Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all font-medium ${
                  showFilters
                    ? 'bg-primary-blue dark:bg-accent-red text-white border-transparent'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Multi-Select</span>
                {selectedSubcategories.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                    {selectedSubcategories.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Filter Panel - Outside sticky header */}
        {showFilters && (
          <div className="max-w-screen-2xl mx-auto px-6">
            {renderSubcategoryFilterPanel()}
          </div>
        )}

        {/* Main Content */}
        <div className="p-6">
          <div className="max-w-screen-2xl mx-auto">
            {/* Subcategories Grid - Same shape as main categories */}
            {filteredSubcategories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* View All card — shows all talents in this category */}
                <div
                  className="group p-3 border-2 border-primary-blue dark:border-accent-red rounded-lg shadow-md hover:bg-primary-blue dark:hover:bg-accent-red transition-colors cursor-pointer aspect-square"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('subcategory', '__all__');
                    router.push(`?${params.toString()}`);
                  }}
                >
                  <div className="flex flex-col h-full items-center justify-center text-center">
                    {getCategoryIcon(selectedCategory.icon)}
                    <h2 className="text-lg font-bold text-primary-blue dark:text-accent-red group-hover:text-white transition-colors mt-3">
                      View All
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-white/80 transition-colors mt-1">
                      Browse all talents in {translateCategoryName(selectedCategory.name)}
                    </p>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary-blue/10 dark:bg-accent-red/20 text-primary-blue dark:text-accent-red group-hover:bg-white/20 group-hover:text-white transition-colors mt-3">
                      {selectedCategory._count.talentProfiles} talents
                    </span>
                  </div>
                </div>

                {filteredSubcategories.map((subcategory) => (
                  <div
                    key={subcategory.id}
                    className="group p-3 border rounded-lg shadow-md hover:bg-primary-blue dark:hover:bg-accent-red transition-colors cursor-pointer aspect-square"
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('subcategory', subcategory.name);
                      router.push(`?${params.toString()}`);
                    }}
                  >
                    <div className="flex flex-col h-full items-center justify-center text-center">
                      {getCategoryIcon(selectedCategory.icon)}
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-white transition-colors mt-3">
                        {subcategory.name}
                      </h2>
                      <p className="text-xs text-gray-700 dark:text-gray-200 group-hover:text-white/80 transition-colors mt-1">
                        {subcategory.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Search className="w-12 h-12" />}
                title="No subcategories found"
                description={`We couldn't find any subcategories matching "${searchQuery}". Try adjusting your search terms.`}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Talents view (Phase 3 - single subcategory)
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sticky Header */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          {/* Breadcrumb */}
          <nav className="mb-2 sm:mb-3 overflow-x-auto">
            <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              <li>
                <button 
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete('category');
                    params.delete('subcategory');
                    router.push(`?${params.toString()}`);
                  }}
                  className="hover:text-blue-600 dark:hover:text-red-500 transition-colors"
                >
                  Categories
                </button>
              </li>
              <li className="flex items-center">
                <span className="mx-1 sm:mx-2">/</span>
                <button 
                  onClick={handleBackToSubcategories}
                  className="hover:text-blue-600 dark:hover:text-red-500 transition-colors truncate max-w-[100px] sm:max-w-none"
                >
                  {selectedCategory?.name}
                </button>
              </li>
              <li className="flex items-center">
                <span className="mx-1 sm:mx-2">/</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium truncate max-w-[100px] sm:max-w-none">{selectedSubcategory?.name}</span>
              </li>
            </ol>
          </nav>

          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-shrink-0">
              <button
                onClick={handleBackToSubcategories}
                className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {dynamicHeaderTitle}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                  {dynamicHeaderDescription}
                </p>
              </div>
            </div>

            {/* Search Bar + Filter Button */}
            <div className="flex items-center gap-2 flex-1 sm:justify-end">
              {/* Smart Search Input with Suggestions */}
              <div className="relative flex-1 sm:max-w-sm lg:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <input
                  type="text"
                  placeholder="Search talents, skills..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowPhase3Suggestions(true);
                  }}
                  onFocus={() => searchQuery && setShowPhase3Suggestions(true)}
                  onBlur={() => setTimeout(() => setShowPhase3Suggestions(false), 200)}
                  className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500 focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setShowPhase3Suggestions(false); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                
                {/* Smart Suggestions Dropdown */}
                {showPhase3Suggestions && phase3SearchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    {phase3SearchSuggestions.map((suggestion, idx) => (
                      <button
                        key={`${suggestion.type}-${suggestion.name}-${idx}`}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          if (suggestion.type === 'skill') {
                            setFilters(prev => ({
                              ...prev,
                              skills: prev.skills?.includes(suggestion.name) ? prev.skills : [...(prev.skills || []), suggestion.name]
                            }));
                            setSearchQuery('');
                          } else if (suggestion.type === 'category') {
                            if (!selectedCategories.includes(suggestion.name)) {
                              setSelectedCategories(prev => [...prev, suggestion.name]);
                            }
                            setSearchQuery('');
                          } else if (suggestion.type === 'subcategory') {
                            if (!selectedSubcategories.includes(suggestion.name)) {
                              setSelectedSubcategories(prev => [...prev, suggestion.name]);
                            }
                            setSearchQuery('');
                          } else {
                            setSearchQuery(suggestion.name);
                          }
                          setShowPhase3Suggestions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                      >
                        {suggestion.type === 'skill' && <Sparkles className="w-4 h-4 text-purple-500" />}
                        {suggestion.type === 'talent' && <Users className="w-4 h-4 text-blue-500" />}
                        {suggestion.type === 'category' && <span className="text-sm">📁</span>}
                        {suggestion.type === 'subcategory' && <span className="text-sm">📂</span>}
                        <span className="text-gray-900 dark:text-white">{suggestion.name}</span>
                        <span className="text-xs text-gray-400 ml-auto capitalize">{suggestion.type}</span>
                      </button>
                    ))}
                    {searchQuery && (
                      <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                        Showing {searchQuery ? (isCombinedMode ? filteredCombinedTalents.length : filteredTalents.length) : 0} matching results
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Filter Button with Count Badge */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all font-medium text-sm ${
                  showFilters
                    ? 'bg-blue-600 dark:bg-red-500 text-white border-transparent shadow-md'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className={`px-1.5 py-0.5 text-xs rounded-full font-bold ${showFilters ? 'bg-white/20 text-white' : 'bg-blue-600 dark:bg-red-500 text-white'}`}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          {/* Active Filters Bar (compact, always in header) */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 py-2 overflow-x-auto">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Active:</span>
              <div className="flex flex-wrap gap-1.5">
                {filters.gender?.slice(0, 2).map(g => (
                  <span key={g} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs whitespace-nowrap">
                    {g} <button onClick={() => setFilters(prev => ({ ...prev, gender: prev.gender?.filter(x => x !== g) }))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {filters.bodyType?.slice(0, 2).map(b => (
                  <span key={b} className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs whitespace-nowrap">
                    {b} <button onClick={() => setFilters(prev => ({ ...prev, bodyType: prev.bodyType?.filter(x => x !== b) }))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {filters.skills?.slice(0, 2).map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs whitespace-nowrap">
                    {s} <button onClick={() => setFilters(prev => ({ ...prev, skills: prev.skills?.filter(x => x !== s) }))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {activeFilterCount > 6 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">+{activeFilterCount - 6} more</span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="ml-auto text-xs text-primary-blue dark:text-accent-red hover:underline whitespace-nowrap"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Filter Panel - Outside sticky header, pushes content down */}
      {showFilters && (
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6">
          {renderFilterPanel()}
        </div>
      )}

      {/* Results Content */}
      <div className="max-w-screen-2xl mx-auto p-3 sm:p-6">

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 dark:border-red-500 mb-4"></div>
              <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{t('loading')}</span>
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
                {t('retry')}
              </button>
            </div>
          )}

          {/* Talents Grid */}
          {!isLoading && !talentsError && (
            <>
              {filteredTalents.length > 0 ? (
                <>
                  {/* Search Result Count */}
                  {searchQuery && (
                    <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                      Found <span className="font-semibold text-gray-900 dark:text-white">{filteredTalents.length}</span> of {talents.length} talents matching "<span className="font-medium">{searchQuery}</span>"
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                    {filteredTalents.map((talent: any, index: number) => (
                      <FeaturedTalentCard
                        key={talent.id}
                        priority={index < 8}
                        talent={{
                          id: talent.id,
                          user: { name: talent.name || talent.user?.name || 'Unknown' },
                          avatarUrl: talent.avatarUrl || talent.user?.profilePicture,
                          category: { name: typeof talent.category === 'string' ? talent.category : (talent.category?.name || 'Uncategorized') },
                          skills: talent.skills || []
                        }}
                        mediaItems={(talent.portfolio || []).map((item: any, idx: number) => ({
                          id: item.id || `${talent.id}-media-${idx}`,
                          title: item.title || '',
                          mediaUrl: item.mediaUrl,
                          type: (item.type || 'IMAGE').toUpperCase() as 'IMAGE' | 'VIDEO' | 'AUDIO',
                          thumbnail: item.thumbnail || (item.type?.toLowerCase() === 'video' ? undefined : item.mediaUrl),
                          talentProfile: {
                            id: talent.id,
                            user: { name: talent.name || talent.user?.name || 'Unknown' },
                            avatarUrl: talent.avatarUrl || talent.user?.profilePicture,
                            category: { name: typeof talent.category === 'string' ? talent.category : (talent.category?.name || 'Uncategorized') }
                          },
                          views: item.views || 0,
                          likeCount: item.likeCount || 0,
                          createdAt: item.createdAt || new Date().toISOString()
                        }))}
                        onMediaClick={handleMediaSelect}
                        onProfileClick={() => router.push(`/talent/${talent.id}`)}
                        onSkillClick={(skill: string) => {
                          if (!filters.skills?.includes(skill)) {
                            setFilters(prev => ({ ...prev, skills: [...(prev.skills || []), skill] }));
                          }
                        }}
                      />
                    ))}
                  </div>
                  {/* Pagination Controls with Page Numbers */}
                  <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                    >
                      {t('pagination.previous')}
                    </button>
                    {Array.from({ length: Math.max(1, Math.ceil(total / pageSize)) }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => setPage(pg)}
                        className={`px-3 py-2 rounded transition-all duration-300 ${page === pg ? 'bg-primary-blue text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                      >
                        {pg}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page * pageSize >= total}
                      className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
                    >
                      {t('pagination.next')}
                    </button>
                  </div>
                </>
              ) : (
                <EmptyState
                  title={searchQuery ? 'No matching talents' : t('talents.noTalents.title')}
                  description={searchQuery ? `No talents match "${searchQuery}". Try different keywords or clear your search.` : t('talents.noTalents.description')}
                  icon="Search"
                />
              )}
            </>
          )}
      </div>
      {selectedMediaItem && (
        <MediaOverlay
          media={selectedMediaItem}
          allMedia={allMediaItems}
          talents={filteredTalents.map((t: any) => ({
            id: t.id,
            user: { name: t.name || t.user?.name || 'Unknown' },
            avatarUrl: t.avatarUrl || t.user?.profilePicture,
            category: { name: typeof t.category === 'string' ? t.category : (t.category?.name || 'Uncategorized') },
            location: t.location
          }))}
          onClose={handleCloseOverlay}
          onMediaSelect={handleMediaSelect}
        />
      )}
    </div>
  );
}
