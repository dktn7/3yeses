'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Users, Filter, X, Search, MapPin, Calendar, Heart, Settings, BookOpen, Monitor, Trophy, Sparkles, SlidersHorizontal, ArrowLeft, Loader2, Folder } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import Breadcrumbs from '@/components/Breadcrumbs';
import Fuse from 'fuse.js';
import FeaturedTalentCard from '@/components/FeaturedTalentCard';
import MediaOverlay from '@/components/MediaOverlay';
import TalentFilterPanel, { defaultFilters as sharedDefaultFilters, TalentFilters as SharedTalentFilters } from '@/components/TalentFilterPanel';
import { getCategoryI18nKey } from '@/lib/categories';
import { getCategoryIconByName, getSubcategoryIconByName } from '@/lib/categoryIcons';

const CATEGORY_ICON_CLASSES = 'w-14 h-14 transition-colors';
const CATEGORY_TILE_BASE_CLASSES =
  'group p-8 border rounded-xl transition-all duration-200 cursor-pointer min-h-[260px] focus-visible:outline-none focus-visible:ring-2 active:scale-[0.98] active:translate-y-0 hover:-translate-y-0.5';
const CATEGORY_TILE_LIGHT_CLASSES =
  'border-blue-100/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(248,251,255,0.97)_100%)] text-slate-900 shadow-[0_10px_24px_rgba(59,130,246,0.14)] hover:border-blue-200 hover:bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(238,245,255,0.98)_100%)] hover:shadow-[0_16px_32px_rgba(59,130,246,0.18)] focus-visible:ring-blue-500 focus-visible:ring-offset-2';
const CATEGORY_TILE_DARK_CLASSES =
  'dark:border-white/10 dark:bg-none dark:[background-image:none] dark:bg-[rgba(31,32,36,0.96)] dark:text-white dark:shadow-[0_8px_22px_rgba(0,0,0,0.42)] dark:hover:border-red-500/45 dark:hover:bg-[rgba(31,32,36,0.98)] dark:hover:shadow-[0_12px_28px_rgba(127,29,29,0.18)] dark:focus-visible:ring-red-400 dark:focus-visible:ring-offset-[#140809]';
const CATEGORY_TILE_CLASSES = `${CATEGORY_TILE_BASE_CLASSES} ${CATEGORY_TILE_LIGHT_CLASSES} ${CATEGORY_TILE_DARK_CLASSES}`;
const CATEGORY_ICON_BOX_BASE_CLASSES = 'p-4 rounded-2xl transition-all duration-200';
const CATEGORY_ICON_BOX_LIGHT_CLASSES =
  'border border-blue-200/90 bg-white text-[#1d4ed8] shadow-[0_10px_24px_rgba(37,99,235,0.16)] group-hover:border-primary-blue group-hover:bg-primary-blue group-hover:text-white group-hover:shadow-[0_14px_28px_rgba(37,99,235,0.24)] group-hover:scale-[1.03]';
const CATEGORY_ICON_BOX_DARK_CLASSES =
  'dark:border dark:border-red-500/20 dark:bg-[#232937] dark:text-accent-red dark:shadow-[0_10px_22px_rgba(0,0,0,0.24)] dark:group-hover:border-accent-red dark:group-hover:bg-accent-red dark:group-hover:text-white dark:group-hover:shadow-[0_14px_28px_rgba(127,29,29,0.20)]';
const CATEGORY_ICON_BOX_CLASSES = `${CATEGORY_ICON_BOX_BASE_CLASSES} ${CATEGORY_ICON_BOX_LIGHT_CLASSES} ${CATEGORY_ICON_BOX_DARK_CLASSES}`;
const CATEGORY_TITLE_BASE_CLASSES = 'text-base font-semibold tracking-tight transition-colors leading-snug';
const CATEGORY_TITLE_LIGHT_CLASSES = 'text-slate-900';
const CATEGORY_TITLE_DARK_CLASSES = 'dark:text-white';
const CATEGORY_TITLE_CLASSES = `${CATEGORY_TITLE_BASE_CLASSES} ${CATEGORY_TITLE_LIGHT_CLASSES} ${CATEGORY_TITLE_DARK_CLASSES}`;
const CATEGORY_VIEW_ALL_TITLE_LIGHT_CLASSES = 'text-primary-blue';
const CATEGORY_VIEW_ALL_TITLE_CLASSES = `${CATEGORY_TITLE_BASE_CLASSES} ${CATEGORY_VIEW_ALL_TITLE_LIGHT_CLASSES} ${CATEGORY_TITLE_DARK_CLASSES}`;
const CATEGORY_META_BASE_CLASSES = 'text-xs font-medium transition-colors mt-0.5';
const CATEGORY_META_LIGHT_CLASSES = 'text-slate-500';
const CATEGORY_META_DARK_CLASSES = 'dark:text-gray-400';
const CATEGORY_META_CLASSES = `${CATEGORY_META_BASE_CLASSES} ${CATEGORY_META_LIGHT_CLASSES} ${CATEGORY_META_DARK_CLASSES}`;
const CATEGORY_DESCRIPTION_BASE_CLASSES = 'text-sm transition-colors mt-1 line-clamp-2';
const CATEGORY_DESCRIPTION_LIGHT_CLASSES = 'text-slate-600';
const CATEGORY_DESCRIPTION_DARK_CLASSES = 'dark:text-gray-300';
const CATEGORY_DESCRIPTION_CLASSES = `${CATEGORY_DESCRIPTION_BASE_CLASSES} ${CATEGORY_DESCRIPTION_LIGHT_CLASSES} ${CATEGORY_DESCRIPTION_DARK_CLASSES}`;
const SMALL_ICON_CLASSES = 'w-4 h-4 shrink-0';

function getChipIconClasses(isSelected: boolean) {
  return `${SMALL_ICON_CLASSES} ${isSelected ? 'text-white' : 'text-primary-blue dark:text-accent-red'}`;
}

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

export default function CategoriesClient({ categories, params }: Readonly<CategoriesClientProps>) {
  const t = useTranslations('Categories');
  const locale = useLocale();
  const router = useRouter();

  const stripSeededSuffix = (value: string): string =>
    value.replace(/\s*\(seeded\)\s*$/i, '').replace(/\s+seeded\s*$/i, '').trim();

  // Translate a category name from DB to the current locale, with English fallback
  const translateCategoryName = (dbName: string): string => {
    const cleanName = stripSeededSuffix(dbName);
    const key = getCategoryI18nKey(cleanName);
    if (!key) return dbName;
    try {
      return t(`names.${key}`);
    } catch {
      return cleanName;
    }
  };
  const displayCategoryName = (name: string) => stripSeededSuffix(translateCategoryName(name));
  const displayRawName = (name: string) => stripSeededSuffix(name);
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [debouncedSearchInput, setDebouncedSearchInput] = useState(searchInputValue);
  // Debounce input and show a delayed micro-spinner when searches take longer than ~150ms
  const [isSearching, setIsSearching] = useState(false);
  const spinnerTimerRef = React.useRef<number | null>(null);
  useEffect(() => {
    // clear previous timers
    if (spinnerTimerRef.current) {
      clearTimeout(spinnerTimerRef.current);
      spinnerTimerRef.current = null;
    }

    // start spinner if search takes longer than 150ms
    spinnerTimerRef.current = window.setTimeout(() => {
      setIsSearching(true);
    }, 150);

    const debounceId = window.setTimeout(() => {
      // debounce finished; cancel spinner and apply value
      if (spinnerTimerRef.current) {
        clearTimeout(spinnerTimerRef.current);
        spinnerTimerRef.current = null;
      }
      setIsSearching(false);
      setDebouncedSearchInput(searchInputValue);
    }, 180);

    return () => {
      if (spinnerTimerRef.current) {
        clearTimeout(spinnerTimerRef.current);
        spinnerTimerRef.current = null;
      }
      clearTimeout(debounceId);
    };
  }, [searchInputValue]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Multi-select state stores stable IDs while labels are derived from the category data.
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
  const [filters, setFilters] = useState<SharedTalentFilters>({ ...sharedDefaultFilters });

  // Search suggestions based on categories/subcategories
  // Build a flattened index of categories and subcategories for Fuse
  const flatCategoryIndex = useMemo(() => {
    const items: Array<any> = [];
    categories.forEach(cat => {
      items.push({
        id: cat.id,
        type: 'category',
        name: cat.name,
        parentName: '',
        icon: cat.icon || null,
      });
      cat.subcategories.forEach(sub => {
        items.push({
          id: sub.id,
          type: 'subcategory',
          name: sub.name,
          parentName: cat.name,
          icon: cat.icon || null,
          parentId: cat.id,
        });
      });
    });
    return items;
  }, [categories]);

  const fuse = useMemo(() => {
    return new Fuse(flatCategoryIndex, {
      keys: ['name', 'parentName'],
      threshold: 0.28,
      ignoreLocation: true,
      minMatchCharLength: 1,
    });
  }, [flatCategoryIndex]);

  const flatSubcategoryResults = useMemo(() => {
    if (!searchInputValue.trim()) return [];
    const lowerQuery = searchInputValue.toLowerCase();
    const results: Array<{
      id: string;
      name: string;
      description: string | null;
      parentId: string;
      parentName: string;
      parentIcon: string | null;
      isViewAll: boolean;
    }> = [];
    categories.forEach(cat => {
      const catMatches = cat.name.toLowerCase().includes(lowerQuery);
      cat.subcategories.forEach(sub => {
        if (sub.name.toLowerCase().includes(lowerQuery) || catMatches) {
          results.push({
            id: sub.id,
            name: sub.name,
            description: sub.description,
            parentId: cat.id,
            parentName: cat.name,
            parentIcon: cat.icon,
            isViewAll: false,
          });
        }
      });
      if (catMatches) {
        results.push({
          id: `__viewall__${cat.id}`,
          name: cat.name,
          description: cat.description,
          parentId: cat.id,
          parentName: cat.name,
          parentIcon: cat.icon,
          isViewAll: true,
        });
      }
    });
    const seen = new Set<string>();
    return results.filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }, [searchInputValue, categories]);

  interface Suggestion { type: 'category' | 'subcategory'; name: string; id: string; parentName?: string }

  const searchSuggestions = useMemo<Suggestion[]>(() => {
    const input = debouncedSearchInput || '';
    if (!input.trim()) return [];
    try {
      const results = fuse.search(input, { limit: 6 });
      return results.map((r: any) => {
        const item = r.item || r;
        if (item.type === 'category') return { type: 'category' as const, name: item.name, id: item.id };
        return { type: 'subcategory' as const, name: item.name, id: item.id, parentName: item.parentName };
      });
    } catch (e) {
      // Fallback to simple filtering on error
      const lowerInput = input.toLowerCase();
      const catMatches = categories.filter(c => c.name.toLowerCase().includes(lowerInput)).slice(0, 3).map(c => ({ type: 'category' as const, name: c.name, id: c.id }));
      const subMatches = flatCategoryIndex.filter(s => s.type === 'subcategory' && s.name.toLowerCase().includes(lowerInput)).slice(0, 3).map(s => ({ type: 'subcategory' as const, name: s.name, id: s.id, parentName: s.parentName }));
      return [...catMatches, ...subMatches].slice(0, 6);
    }
  }, [debouncedSearchInput, fuse, categories, flatCategoryIndex]);

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
      .filter(c => c.name.toLowerCase().includes(lowerQuery) && !selectedCategories.includes(c.id))
      .slice(0, 2)
      .map(c => ({ type: 'category' as const, name: c.name, id: c.id }));
    
    const subSuggestions = categories
      .flatMap(cat => cat.subcategories.filter(sub => 
        sub.name.toLowerCase().includes(lowerQuery) && !selectedSubcategories.includes(sub.id)
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

  // Precompute icon components for categories and subcategories to avoid recomputing icons on every render
  const categoryIconMap = useMemo(() => {
    const map = new Map<string, any>();
    categories.forEach(cat => map.set(cat.id, getCategoryIconByName(cat.name, cat.icon)));
    return map;
  }, [categories]);

  const subcategoryIconMap = useMemo(() => {
    const map = new Map<string, any>();
    categories.forEach(cat => {
      cat.subcategories.forEach(sub => map.set(sub.id, getSubcategoryIconByName(sub.name, cat.name, cat.icon)));
    });
    return map;
  }, [categories]);

  const categoryById = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((category) => {
      map.set(category.id, category);
    });
    return map;
  }, [categories]);

  const subcategoryById = useMemo(() => {
    const map = new Map<string, { subcategory: Subcategory; category: Category }>();
    categories.forEach((category) => {
      category.subcategories.forEach((subcategory) => {
        map.set(subcategory.id, { subcategory, category });
      });
    });
    return map;
  }, [categories]);

  const selectedCategoryLabels = useMemo(
    () => selectedCategories.map((id) => translateCategoryName(categoryById.get(id)?.name ?? id)),
    [selectedCategories, categoryById]
  );

  const selectedSubcategoryLabels = useMemo(
    () => selectedSubcategories.map((id) => subcategoryById.get(id)?.subcategory.name ?? id),
    [selectedSubcategories, subcategoryById]
  );
  // Dynamic header title and description
  const dynamicHeaderTitle = useMemo(() => {
    if (selectedCategories.length === 0 && selectedSubcategories.length === 0) {
      return selectedSubcategory?.name || 'Talents';
    }
    if (selectedCategories.length === 1 && selectedSubcategories.length === 0) {
      return selectedCategoryLabels[0] || 'Talents';
    }
    if (selectedSubcategories.length === 1 && selectedCategories.length === 0) {
      return selectedSubcategoryLabels[0] || 'Talents';
    }
    const totalItems = selectedCategories.length + selectedSubcategories.length;
    return `${totalItems} Selection${totalItems > 1 ? 's' : ''}`;
  }, [selectedCategories, selectedSubcategories, selectedSubcategory, selectedCategoryLabels, selectedSubcategoryLabels]);

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
  }, [selectedSubcategory, selectedCategory?.id, filters, page, pageSize, t]);

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
            name: `All ${displayCategoryName(category.name)}`,
            description: `All talents in ${displayCategoryName(category.name)}`,
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
    setFilters({ ...sharedDefaultFilters });
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
    <div className="mt-5 p-5 bg-sky-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[70vh] overflow-y-auto">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
          <Filter className="w-5 h-5 flex-shrink-0 text-primary-blue dark:text-accent-red" /> Select Multiple Categories to Browse Together
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
          Choose categories you want to explore. For example, select both &quot;Musical Theater&quot; and &quot;Voice Actors&quot; to see talents from both.
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategories(prev => 
                  prev.includes(category.id)
                    ? prev.filter(c => c !== category.id)
                    : [...prev, category.id]
                );
              }}
              className={`px-5 py-3 rounded-xl text-base font-semibold transition-all flex items-center gap-2 ${
                selectedCategories.includes(category.id)
                  ? 'bg-primary-blue dark:bg-accent-red text-white shadow-md'
                  : 'bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {(() => {
                const Icon = categoryIconMap.get(category.id);
                return <Icon className={getChipIconClasses(selectedCategories.includes(category.id))} />;
              })()}
              <span>{displayCategoryName(category.name)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Show subcategories of selected categories */}
      {selectedCategories.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-slate-900/80 rounded-xl p-3 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4 flex-shrink-0" /> Subcategories (from selected categories)
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories
              .filter(cat => selectedCategories.includes(cat.id))
              .flatMap(cat => cat.subcategories.map(sub => ({ ...sub, parentName: cat.name })))
              .map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => {
                    setSelectedSubcategories(prev => 
                      prev.includes(subcategory.id)
                        ? prev.filter(s => s !== subcategory.id)
                        : [...prev, subcategory.id]
                    );
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedSubcategories.includes(subcategory.id)
                      ? 'bg-primary-blue dark:bg-accent-red text-white'
                      : 'bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {(() => {
                    const Icon = subcategoryIconMap.get(subcategory.id);
                    return <Icon className={`${selectedSubcategories.includes(subcategory.id) ? 'text-white' : 'text-primary-blue dark:text-accent-red'} w-3.5 h-3.5 inline-block mr-1`} />;
                  })()}
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
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4 flex-shrink-0" /> Select Multiple Subcategories to Browse Together
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
                      prev.includes(subcategory.id)
                        ? prev.filter(s => s !== subcategory.id)
                        : [...prev, subcategory.id]
                    );
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedSubcategories.includes(subcategory.id)
                      ? 'bg-primary-blue dark:bg-accent-red text-white'
                      : 'bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {subcategory.name}
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
                        const subIds = category.subcategories.map(s => s.id);
                        const allSelected = subIds.every(id => selectedSubcategories.includes(id));
                        if (allSelected) {
                          setSelectedSubcategories(prev => prev.filter(id => !subIds.includes(id)));
                        } else {
                          setSelectedSubcategories(prev => [...new Set([...prev, ...subIds])]);
                        }
                      }}
                      className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-primary-blue dark:hover:text-accent-red transition-colors flex items-center gap-1"
                    >
                        {(() => {
                          const Icon = categoryIconMap.get(category.id);
                          return <Icon className="w-3.5 h-3.5" />;
                        })()}
                      {displayCategoryName(category.name)}
                    </button>
                    <div className="flex flex-wrap gap-1.5 mt-1.5 ml-5">
                      {category.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setSelectedSubcategories(prev => 
                              prev.includes(sub.id)
                                ? prev.filter(s => s !== sub.id)
                                : [...prev, sub.id]
                            );
                          }}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                            selectedSubcategories.includes(sub.id)
                              ? 'bg-primary-blue dark:bg-accent-red text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {(() => {
                            const Icon = subcategoryIconMap.get(sub.id);
                            return <Icon className={`${selectedSubcategories.includes(sub.id) ? 'text-white' : 'text-primary-blue dark:text-accent-red'} w-3 h-3 inline-block mr-1`} />;
                          })()}
                          {displayRawName(sub.name)}
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
    if (filters.disabilities?.length) count++;
    if (filters.location) count++;
    return count;
  }, [filters]);
  // Shared filter panel used by search-results and categories phase 3.
  const renderFilterPanel = () => (
    <div className='my-4'>
      <TalentFilterPanel
        filters={filters}
        onFiltersChange={(nextFilters) => setFilters(nextFilters)}
        onClose={() => setShowFilters(false)}
        onApply={() => setShowFilters(false)}
        showHeader
        compact={false}
      />
    </div>
  );

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
      <div className="min-h-screen brand-true-red categories-page">
        {/* Sticky Header */}
        <section className="bg-gradient-to-r from-blue-100/95 via-blue-50/95 to-blue-100/95 dark:from-red-950/95 dark:via-red-900/95 dark:to-red-950/95 border-b border-gray-200/80 dark:border-red-400/20 sticky top-0 z-40 shadow-lg backdrop-blur-sm">
          <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
            {/* Top Row: Back + Title + Search + Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-shrink-0">
                <button
                  onClick={exitCombinedMode}
                  className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 bg-light-surface dark:bg-dark-surface text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white truncate">
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
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-blue-200 dark:border-red-400/25 bg-white/90 dark:bg-slate-900/85 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary-blue dark:focus:ring-red-400 focus:border-transparent shadow-sm transition-all"
                  />
                  {isSearching ? (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
                      <span className="inline-block w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin text-gray-600 dark:text-gray-300" />
                    </div>
                  ) : searchQuery ? (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setShowPhase3Suggestions(false); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  ) : null}
                  
                  {/* Smart Suggestions Dropdown */}
                  {showPhase3Suggestions && phase3SearchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-xl shadow-[0_8px_32px_rgba(15,23,42,0.10)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.48)] z-50 overflow-hidden">
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
                              if (!selectedCategories.includes(suggestion.id)) {
                                setSelectedCategories(prev => [...prev, suggestion.id]);
                              }
                              setSearchQuery('');
                            } else if (suggestion.type === 'subcategory') {
                              if (!selectedSubcategories.includes(suggestion.id)) {
                                setSelectedSubcategories(prev => [...prev, suggestion.id]);
                              }
                              setSearchQuery('');
                            } else {
                              setSearchQuery(suggestion.name);
                            }
                            setShowPhase3Suggestions(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                        >
                          {suggestion.type === 'skill' && <Sparkles className="w-4 h-4 text-primary-blue dark:text-red-300" />}
                          {suggestion.type === 'talent' && <Users className="w-4 h-4 text-primary-blue dark:text-red-300" />}
                          {suggestion.type === 'category' && <Folder className="w-4 h-4 text-primary-blue dark:text-red-300" />}
                          {suggestion.type === 'subcategory' && <Folder className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
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
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border-2 transition-all font-semibold text-sm ${
                    showFilters
                      ? 'bg-primary-blue dark:bg-[rgba(17,24,39,0.90)] text-white border-blue-300 dark:border-red-400/35 shadow-lg'
                      : 'border-blue-200 dark:border-red-400/25 bg-white/90 dark:bg-slate-900/85 text-gray-700 dark:text-gray-200 hover:border-primary-blue dark:hover:border-red-300/45 hover:text-primary-blue dark:hover:text-red-200'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className={`px-1.5 py-0.5 text-xs rounded-full font-bold ${showFilters ? 'bg-white/20 text-white' : 'bg-primary-blue dark:bg-[rgba(17,24,39,0.90)] text-white'}`}>
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
                    <span key={cat} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-blue dark:bg-accent-red text-white rounded-full text-xs font-medium">
                      {selectedCategoryLabels[selectedCategories.indexOf(cat)] || cat}
                      <button 
                        onClick={() => {
                          setSelectedCategories(prev => prev.filter(c => c !== cat));
                          if (selectedCategories.length === 1 && selectedSubcategories.length === 0) {
                            exitCombinedMode();
                          }
                        }} 
                        className="hover:bg-primary-blue/90 dark:hover:bg-accent-red/90 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70" aria-label={`Remove ${selectedCategoryLabels[selectedCategories.indexOf(cat)] || cat}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {selectedSubcategories.map(sub => (
                    <span key={sub} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-blue dark:bg-[rgba(17,24,39,0.90)] text-white rounded-full text-xs font-medium">
                      {selectedSubcategoryLabels[selectedSubcategories.indexOf(sub)] || sub}
                      <button 
                        onClick={() => {
                          setSelectedSubcategories(prev => prev.filter(s => s !== sub));
                          if (selectedSubcategories.length === 1 && selectedCategories.length === 0) {
                            exitCombinedMode();
                          }
                        }} 
                        className="hover:bg-primary-blue/90 dark:hover:bg-accent-red/90 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70" aria-label={`Remove ${selectedSubcategoryLabels[selectedSubcategories.indexOf(sub)] || sub}`}
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
                    <span key={g} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--brand-primary)]/10 dark:bg-[var(--brand-primary)]/18 text-[var(--brand-primary)] dark:text-red-100 rounded-full text-xs capitalize">
                      {g} <button onClick={() => setFilters(prev => ({ ...prev, gender: prev.gender?.filter(x => x !== g) }))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {filters.bodyType?.slice(0, 2).map(b => (
                    <span key={b} className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs capitalize">
                      {b} <button onClick={() => setFilters(prev => ({ ...prev, bodyType: prev.bodyType?.filter(x => x !== b) }))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {filters.skills?.slice(0, 2).map(s => (
                    <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-blue/10 dark:bg-accent-red/10 text-primary-blue dark:text-accent-red rounded-full text-xs">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-light-surface dark:bg-dark-surface rounded-2xl border border-gray-200/70 dark:border-gray-700/40 overflow-hidden animate-pulse">
                  <div className="p-5 flex items-center gap-4 border-b border-gray-100/80 dark:border-gray-800">
                    <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2" />
                    </div>
                  </div>
                  <div className="px-4 py-3 border-b border-gray-100/80 dark:border-gray-800 flex gap-2">
                    <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="h-5 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  </div>
                  <div className="h-[210px] bg-gray-100 dark:bg-gray-800" />
                  <div className="p-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : combinedError ? (
            <div className="text-center py-20 bg-light-surface dark:bg-dark-surface rounded-2xl">
              <p className="text-red-600 dark:text-red-400 mb-4">{combinedError}</p>
              <button
                onClick={() => setCombinedPage(1)}
                className="text-primary-blue dark:text-accent-red hover:underline font-medium"
              >
                Try again
              </button>
            </div>
          ) : filteredCombinedTalents.length === 0 ? (
            <div className='rounded-2xl border border-gray-200/70 dark:border-gray-700/50 bg-white/95 dark:bg-slate-900 p-8 sm:p-10 text-center shadow-[0_6px_22px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.45)]'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-blue/10 dark:bg-accent-red/15'>
                <Users className='w-8 h-8 text-primary-blue dark:text-accent-red' />
              </div>
              <h3 className='text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2'>{searchQuery ? 'No talents match this category search' : 'No talents in this category mix yet'}</h3>
              <p className='text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto'>{searchQuery ? 'No talents matched your query within the selected categories and subcategories.' : 'Try broadening your category selection or relaxing filters to discover more profiles.'}</p>
              <div className='flex flex-wrap items-center justify-center gap-3'>
                <button onClick={() => { searchQuery ? setSearchQuery('') : clearFilters(); setCombinedPage(1); }} className='px-4 py-2 bg-primary-blue dark:bg-[rgba(17,24,39,0.90)] text-white rounded-lg hover:opacity-90 transition-colors font-medium'>{searchQuery ? 'Clear Search' : 'Clear Filters'}</button>
                <button onClick={exitCombinedMode} className='px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium'>Choose Different Categories</button>
              </div>
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
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue dark:focus-visible:ring-accent-red"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.ceil(combinedTotal / 12) }, (_, i) => i + 1).slice(0, 10).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setCombinedPage(pg)}
                      className={`min-w-[40px] px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue dark:focus-visible:ring-accent-red ${combinedPage === pg ? 'bg-primary-blue dark:bg-accent-red text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    onClick={() => setCombinedPage(p => p + 1)}
                    disabled={combinedPage * 12 >= combinedTotal}
                    className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue dark:focus-visible:ring-accent-red"
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
      <div className="relative min-h-screen brand-true-red categories-page bg-sky-50/60 dark:bg-[#140809] [--cat-from:#dbeafe] [--cat-to:#3b82f6] [--cat-glow:#93c5fd] dark:[--cat-from:#ff2a2a] dark:[--cat-to:#ff4d4d] dark:[--cat-glow:#ffb4b4]">
        {/* Wave Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
          <svg className="w-full h-full opacity-70 dark:opacity-35" preserveAspectRatio="none" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="catBg1" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--cat-from)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <linearGradient id="catWave1a" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--cat-from)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--cat-to)" stopOpacity="0.09" />
              </linearGradient>
              <linearGradient id="catWave2a" x1="1" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--cat-from)" stopOpacity="0.14" />
                <stop offset="100%" stopColor="var(--cat-to)" stopOpacity="0.06" />
              </linearGradient>
              <radialGradient id="catGlow1" cx="50%" cy="0%" r="70%">
                <stop offset="0%" stopColor="var(--cat-glow)" stopOpacity="0.10" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <rect width="1440" height="900" fill="url(#catBg1)" />
            <rect width="1440" height="900" fill="url(#catGlow1)" />
            <path d="M0 320 Q360 220 720 300 T1440 260 V900 H0Z" fill="url(#catWave1a)" />
            <path d="M0 500 Q400 420 800 480 T1440 440 V900 H0Z" fill="url(#catWave2a)" />
            <path d="M0 80 C360 140 720 40 1080 100 C1260 130 1380 90 1440 110 L1440 0 L0 0 Z" fill="var(--cat-from)" opacity="0.10" />
            <circle cx="200" cy="150" r="200" fill="var(--cat-to)" opacity="0.07" />
            <circle cx="1250" cy="700" r="260" fill="var(--cat-from)" opacity="0.06" />
            <circle cx="720" cy="450" r="300" fill="var(--cat-glow)" opacity="0.04" />
          </svg>
        </div>
        {/* Sticky Header with Search */}
        <section className="bg-gradient-to-r from-blue-100/95 via-blue-50/95 to-blue-100/95 dark:from-red-950/95 dark:via-red-900/95 dark:to-red-950/95 border-b border-gray-200/80 dark:border-red-400/20 sticky top-0 z-40 shadow-lg backdrop-blur-sm">
          <div className="max-w-screen-2xl mx-auto px-6 pt-3 pb-4">
            <Breadcrumbs items={[{ label: 'Home', href: `/${locale}` }, { label: 'Categories' }]} />
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-8">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-blue dark:group-focus-within:text-red-300 transition-colors z-10" />
                  <input
                    type="text"
                    placeholder={t('search.placeholder') || "Search categories or roles…"}
                    value={searchInputValue}
                    onChange={(e) => {
                      setSearchInputValue(e.target.value);
                      setSearchQuery(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setSearchInputValue('');
                        setSearchQuery('');
                      }
                    }}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-red-400/25 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary-blue dark:focus:ring-red-400 focus:border-transparent transition-all"
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
                    ? 'bg-primary-blue dark:bg-[rgba(17,24,39,0.90)] text-white border-transparent'
                    : 'border-gray-200 dark:border-gray-700 bg-light-surface dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
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
            {/* Categories List / Search Results */}
            {searchInputValue.trim() ? (
              // SEARCH MODE: flat subcategory results inline in the grid
              flatSubcategoryResults.length > 0 ? (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="font-semibold text-gray-900 dark:text-white">{flatSubcategoryResults.length}</span> result{flatSubcategoryResults.length !== 1 ? 's' : ''} for &ldquo;{searchInputValue}&rdquo;
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {flatSubcategoryResults.map((result) => (
                      <div
                        key={result.id}
                        role="button"
                        tabIndex={0}
                        className={CATEGORY_TILE_CLASSES}
                        onClick={() => {
                          const params = new URLSearchParams();
                          params.set('category', result.parentName);
                          params.set('subcategory', result.isViewAll ? '__all__' : result.name);
                          setSearchInputValue('');
                          setSearchQuery('');
                          router.push(`?${params.toString()}`);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            const params = new URLSearchParams();
                            params.set('category', result.parentName);
                            params.set('subcategory', result.isViewAll ? '__all__' : result.name);
                            setSearchInputValue('');
                            setSearchQuery('');
                            router.push(`?${params.toString()}`);
                          }
                        }}
                      >
                        <div className="flex flex-col h-full items-center justify-center text-center gap-2">
                          <div className={CATEGORY_ICON_BOX_CLASSES}>
                            {(() => {
                              const Icon = result.isViewAll
                                ? getCategoryIconByName(result.parentName, result.parentIcon)
                                : getSubcategoryIconByName(result.name, result.parentName, result.parentIcon);
                              return <Icon className={CATEGORY_ICON_CLASSES} />;
                          })()}
                        </div>
                        <div>
                            <h2 className={result.isViewAll ? CATEGORY_VIEW_ALL_TITLE_CLASSES : CATEGORY_TITLE_CLASSES}>
                              {result.isViewAll ? `All ${displayCategoryName(result.parentName)}` : displayRawName(result.name)}
                            </h2>
                            <p className={CATEGORY_META_CLASSES}>
                              {displayCategoryName(result.parentName)}
                            </p>
                            {result.description && (
                              <p className={`${CATEGORY_DESCRIPTION_CLASSES} line-clamp-1`}>
                                {result.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={<Search className="w-12 h-12" />}
                  title="No results found"
                  description={`Nothing matched \u201c${searchInputValue}\u201d. Try a different term or browse by category.`}
                />
              )
            ) : (
              // NORMAL MODE: show all category cards
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    role="button"
                    tabIndex={0}
                    className={CATEGORY_TILE_CLASSES}
                    onClick={() => handleCategorySelect(category)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCategorySelect(category); } }}
                  >
                    <div className="flex flex-col h-full items-center justify-center text-center gap-2">
                      <div className={CATEGORY_ICON_BOX_CLASSES}>
                        {(() => {
                          const Icon = getCategoryIconByName(category.name, category.icon);
                          return <Icon className={CATEGORY_ICON_CLASSES} />;
                        })()}
                      </div>
                      <div>
                        <h2 className={CATEGORY_TITLE_CLASSES}>
                          {displayCategoryName(category.name)}
                        </h2>
                        <p className={CATEGORY_DESCRIPTION_CLASSES}>
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
      <div className="relative min-h-screen brand-true-red categories-page bg-sky-50/60 dark:bg-[#140809] [--cat-from:#dbeafe] [--cat-to:#3b82f6] [--cat-glow:#93c5fd] dark:[--cat-from:#ff2a2a] dark:[--cat-to:#ff4d4d] dark:[--cat-glow:#ffb4b4]">
        {/* Wave Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
          <svg className="w-full h-full opacity-70 dark:opacity-35" preserveAspectRatio="none" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="catBg" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--cat-from)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <linearGradient id="catWave1" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--cat-from)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--cat-to)" stopOpacity="0.09" />
              </linearGradient>
              <linearGradient id="catWave2" x1="1" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--cat-from)" stopOpacity="0.14" />
                <stop offset="100%" stopColor="var(--cat-to)" stopOpacity="0.06" />
              </linearGradient>
              <radialGradient id="catGlow" cx="50%" cy="0%" r="70%">
                <stop offset="0%" stopColor="var(--cat-glow)" stopOpacity="0.10" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <rect width="1440" height="900" fill="url(#catBg)" />
            <rect width="1440" height="900" fill="url(#catGlow)" />
            <path d="M0 320 Q360 220 720 300 T1440 260 V900 H0Z" fill="url(#catWave1)" />
            <path d="M0 500 Q400 420 800 480 T1440 440 V900 H0Z" fill="url(#catWave2)" />
            <path d="M0 80 C360 140 720 40 1080 100 C1260 130 1380 90 1440 110 L1440 0 L0 0 Z" fill="var(--cat-from)" opacity="0.10" />
            <circle cx="200" cy="150" r="200" fill="var(--cat-to)" opacity="0.07" />
            <circle cx="1250" cy="700" r="260" fill="var(--cat-from)" opacity="0.06" />
            <circle cx="720" cy="450" r="300" fill="var(--cat-glow)" opacity="0.04" />
          </svg>
        </div>
        {/* Sticky Header with Search */}
        <section className="bg-gradient-to-r from-blue-100/95 via-blue-50/95 to-blue-100/95 dark:from-red-950/95 dark:via-red-900/95 dark:to-red-950/95 border-b border-gray-200/80 dark:border-red-400/20 sticky top-0 z-40 shadow-lg backdrop-blur-sm">
          <div className="max-w-screen-2xl mx-auto px-6 pt-3 pb-4">
            <Breadcrumbs items={[{ label: 'Home', href: `/${locale}` }, { label: 'Categories', href: `/${locale}/categories` }, { label: displayCategoryName(selectedCategory.name) }]} />
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
                  className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-light-surface dark:bg-dark-surface text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {displayCategoryName(selectedCategory.name)}
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
                    : 'border-gray-200 dark:border-gray-700 bg-light-surface dark:bg-dark-surface text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
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
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* View All card — shows all talents in this category */}
                <div
                  role="button"
                  tabIndex={0}
                  className={CATEGORY_TILE_CLASSES}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('subcategory', '__all__');
                    router.push(`?${params.toString()}`);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('subcategory', '__all__');
                      router.push(`?${params.toString()}`);
                    }
                  }}
                >
                  <div className="flex flex-col h-full items-center justify-center text-center gap-2">
                    <div className={CATEGORY_ICON_BOX_CLASSES}>
                      {(() => {
                        const Icon = getCategoryIconByName(selectedCategory.name, selectedCategory.icon);
                        return <Icon className={CATEGORY_ICON_CLASSES} />;
                      })()}
                    </div>
                    <h2 className={`${CATEGORY_VIEW_ALL_TITLE_CLASSES} mt-1`}>
                      View All
                    </h2>
                    <p className={CATEGORY_DESCRIPTION_CLASSES}>
                      Browse all talents in {displayCategoryName(selectedCategory.name)}
                    </p>
                  </div>
                </div>

                {filteredSubcategories.map((subcategory) => (
                  <div
                    key={subcategory.id}
                    role="button"
                    tabIndex={0}
                    className={CATEGORY_TILE_CLASSES}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('subcategory', subcategory.name);
                      router.push(`?${params.toString()}`);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const params = new URLSearchParams(searchParams.toString());
                        params.set('subcategory', subcategory.name);
                        router.push(`?${params.toString()}`);
                      }
                    }}
                  >
                    <div className="flex flex-col h-full items-center justify-center text-center gap-2">
                      <div className={CATEGORY_ICON_BOX_CLASSES}>
                        {(() => {
                          const Icon = getSubcategoryIconByName(subcategory.name, selectedCategory.name, selectedCategory.icon);
                          return <Icon className={CATEGORY_ICON_CLASSES} />;
                        })()}
                      </div>
                      <h2 className={`${CATEGORY_TITLE_CLASSES} mt-1`}>
                        {displayRawName(subcategory.name)}
                      </h2>
                      <p className={CATEGORY_DESCRIPTION_CLASSES}>
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
    <div className="min-h-screen brand-true-red categories-page">
      {/* Sticky Header */}
      <section className="bg-gradient-to-r from-blue-100/95 via-blue-50/95 to-blue-100/95 dark:from-red-950/95 dark:via-red-900/95 dark:to-red-950/95 border-b border-gray-200/80 dark:border-red-400/20 sticky top-0 z-40 shadow-lg backdrop-blur-sm">
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
                  className="hover:text-primary-blue dark:hover:text-red-300 transition-colors"
                >
                  Categories
                </button>
              </li>
              <li className="flex items-center">
                <span className="mx-1 sm:mx-2">/</span>
                <button
                  onClick={handleBackToSubcategories}
                  className="hover:text-primary-blue dark:hover:text-red-300 transition-colors truncate max-w-[100px] sm:max-w-none"
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
                className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 bg-light-surface dark:bg-dark-surface text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white truncate">
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
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-blue-200 dark:border-red-400/25 bg-white/90 dark:bg-slate-900/85 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary-blue dark:focus:ring-red-400 focus:border-transparent shadow-sm transition-all"
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
                  <div className="absolute top-full left-0 right-0 mt-1 bg-light-surface dark:bg-dark-surface border border-gray-200 dark:border-gray-700 rounded-xl shadow-[0_8px_32px_rgba(15,23,42,0.10)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.48)] z-50 overflow-hidden">
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
                            if (!selectedCategories.includes(suggestion.id)) {
                              setSelectedCategories(prev => [...prev, suggestion.id]);
                            }
                            setSearchQuery('');
                          } else if (suggestion.type === 'subcategory') {
                            if (!selectedSubcategories.includes(suggestion.id)) {
                              setSelectedSubcategories(prev => [...prev, suggestion.id]);
                            }
                            setSearchQuery('');
                          } else {
                            setSearchQuery(suggestion.name);
                          }
                          setShowPhase3Suggestions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                      >
                        {suggestion.type === 'skill' && <Sparkles className="w-4 h-4 text-primary-blue dark:text-red-300" />}
                        {suggestion.type === 'talent' && <Users className="w-4 h-4 text-primary-blue dark:text-red-300" />}
                        {suggestion.type === 'category' && <Folder className="w-4 h-4 text-primary-blue dark:text-red-300" />}
                        {suggestion.type === 'subcategory' && <Folder className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
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
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border-2 transition-all font-semibold text-sm ${
                  showFilters
                    ? 'bg-primary-blue dark:bg-[rgba(17,24,39,0.90)] text-white border-blue-300 dark:border-red-400/35 shadow-lg'
                    : 'border-blue-200 dark:border-red-400/25 bg-white/90 dark:bg-slate-900/85 text-gray-700 dark:text-gray-200 hover:border-primary-blue dark:hover:border-red-300/45 hover:text-primary-blue dark:hover:text-red-200'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className={`px-1.5 py-0.5 text-xs rounded-full font-bold ${showFilters ? 'bg-white/20 text-white' : 'bg-primary-blue dark:bg-[rgba(17,24,39,0.90)] text-white'}`}>
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
                  <span key={g} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--brand-primary)]/10 dark:bg-[var(--brand-primary)]/18 text-[var(--brand-primary)] dark:text-red-100 rounded-full text-xs whitespace-nowrap">
                    {g} <button onClick={() => setFilters(prev => ({ ...prev, gender: prev.gender?.filter(x => x !== g) }))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {filters.bodyType?.slice(0, 2).map(b => (
                  <span key={b} className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs whitespace-nowrap">
                    {b} <button onClick={() => setFilters(prev => ({ ...prev, bodyType: prev.bodyType?.filter(x => x !== b) }))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {filters.skills?.slice(0, 2).map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-blue/10 dark:bg-red-950/35 text-primary-blue dark:text-red-300 rounded-full text-xs whitespace-nowrap">
                    {s} <button onClick={() => setFilters(prev => ({ ...prev, skills: prev.skills?.filter(x => x !== s) }))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {activeFilterCount > 6 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">+{activeFilterCount - 6} more</span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="ml-auto text-xs text-primary-blue dark:text-red-300 hover:underline whitespace-nowrap"
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

          {/* Loading State - Skeletal */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-light-surface dark:bg-dark-surface rounded-2xl border border-gray-200/70 dark:border-gray-700/40 overflow-hidden animate-pulse">
                  <div className="p-5 flex items-center gap-4 border-b border-gray-100/80 dark:border-gray-800">
                    <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2" />
                    </div>
                  </div>
                  <div className="px-4 py-3 border-b border-gray-100/80 dark:border-gray-800 flex gap-2">
                    <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="h-5 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  </div>
                  <div className="h-[210px] bg-gray-100 dark:bg-gray-800" />
                  <div className="p-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  </div>
                </div>
              ))}
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
                className="mt-2 px-4 py-2 bg-primary-blue dark:bg-accent-red text-white rounded hover:bg-primary-blue/90 dark:hover:bg-accent-red/90"
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
                      className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue dark:focus-visible:ring-accent-red"
                    >
                      {t('pagination.previous')}
                    </button>
                    {Array.from({ length: Math.max(1, Math.ceil(total / pageSize)) }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => setPage(pg)}
                        className={`min-w-[40px] px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue dark:focus-visible:ring-accent-red ${page === pg ? 'bg-primary-blue dark:bg-accent-red text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                      >
                        {pg}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page * pageSize >= total}
                      className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue dark:focus-visible:ring-accent-red"
                    >
                      {t('pagination.next')}
                    </button>
                  </div>
                </>
              ) : (
                <div className='rounded-2xl border border-gray-200/70 dark:border-gray-700/50 bg-white/95 dark:bg-slate-900 p-8 sm:p-10 text-center shadow-[0_6px_22px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.45)]'>
                  <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-blue/10 dark:bg-accent-red/15'>
                    <Search className='w-8 h-8 text-primary-blue dark:text-accent-red' />
                  </div>
                  <h3 className='text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2'>{searchQuery ? 'No matching talents in this subcategory' : 'No talents listed in this subcategory yet'}</h3>
                  <p className='text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto'>{searchQuery ? 'No talents matched your search within this subcategory.' : 'Try widening your filters or browse another subcategory to find more talent.'}</p>
                  <div className='flex flex-wrap items-center justify-center gap-3'>
                    <button onClick={() => { searchQuery ? setSearchQuery('') : clearFilters(); }} className='px-4 py-2 bg-primary-blue dark:bg-accent-red text-white rounded-lg hover:opacity-90 transition-colors font-medium'>{searchQuery ? 'Clear Search' : 'Clear Filters'}</button>
                    <button onClick={handleBackToSubcategories} className='px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium'>Back To Subcategories</button>
                  </div>
                </div>
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





