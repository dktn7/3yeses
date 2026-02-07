'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Eye,
  Heart,
  Filter,
  TrendingUp,
  Play,
  Image as ImageIcon,
  Music,
  Camera,
  Users,
  Palette,
  Sparkles,
  Star,
  User,
  MoreHorizontal,
  Search,
  Clapperboard,
  Mic2,
  Briefcase,
  Flame,
  Clock,
  X
} from 'lucide-react';
import PropellerAd from '@/components/PropellerAd';
import Image from 'next/image';
import { getCategoryData } from '@/lib/data';
import MediaOverlay from '@/components/MediaOverlay';
import FeaturedTalentCard from '@/components/FeaturedTalentCard';
import SwoopingTick from '@/components/SwoopingTick';
import MediaThumbnailFallback from '@/components/MediaThumbnailFallback';

interface PortfolioItem {
  id: string;
  title: string;
  url: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO';
  thumbnail?: string;
  description?: string;
  talentProfile: {
    id: string;
    user: {
      name: string;
    };
    avatarUrl?: string;
    category?: {
      name: string;
    };
  };
  views: number;
  likes: number;
  isSponsored?: boolean;
  createdAt: string;
}

export default function HubPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const locale = params.locale || 'en-gb';
  const t = useTranslations('Hub');

  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeType, setActiveType] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(100);
  const [allItems, setAllItems] = useState<PortfolioItem[]>([]);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [featuredItem, setFeaturedItem] = useState<PortfolioItem | null>(null);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [allCategoryCount, setAllCategoryCount] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({});
  const [trendingItems, setTrendingItems] = useState<PortfolioItem[]>([]);
  const [featuredTalents, setFeaturedTalents] = useState<any[]>([]);
  const [selectedMediaItem, setSelectedMediaItem] = useState<PortfolioItem | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [dbCategories, setDbCategories] = useState<Array<{ 
    id: string; 
    name: string; 
    icon: string | null;
    subcategories?: Array<{ id: string; name: string; description: string | null }>;
  }>>([]);

  // Sync URL with selectedMediaItem
  useEffect(() => {
    const mediaId = searchParams.get('mediaId');
    
    if (!mediaId) {
      if (selectedMediaItem) setSelectedMediaItem(null);
      return;
    }

    // If we already have the correct item selected, do nothing
    if (selectedMediaItem?.id === mediaId) return;

    const item = allItems.find(i => i.id === mediaId);
    if (item) {
      setSelectedMediaItem(item);
    } else {
      // Fetch individual item if not found in loaded items (e.g. direct link to older item)
      const fetchSingleItem = async () => {
        try {
          const res = await fetch(`/api/hub/portfolio/${mediaId}`);
          if (res.ok) {
            const fetchedItem = await res.json();
            setSelectedMediaItem(fetchedItem);
          }
        } catch (e) {
          console.error("Failed to fetch single item", e);
        }
      };
      fetchSingleItem();
    }
  }, [searchParams, allItems, selectedMediaItem]);

  const handleMediaSelect = (item: PortfolioItem) => {
    setSelectedMediaItem(item);
    const params = new URLSearchParams(searchParams.toString());
    params.set('mediaId', item.id);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleMediaClose = () => {
    setSelectedMediaItem(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('mediaId');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [popularityTier, setPopularityTier] = useState<'all' | 'viral' | 'popular' | 'rising' | 'fresh'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');

  const getCategoryIcon = (categoryId: string) => {
    const iconLower = categoryId.toLowerCase();
    if (iconLower.includes('voice') || iconLower.includes('dubbing')) return Mic2;
    if (iconLower.includes('music') || iconLower.includes('audio')) return Music;
    if (iconLower.includes('act')) return Clapperboard;
    if (iconLower.includes('model')) return Camera;
    if (iconLower.includes('danc')) return Users;
    if (iconLower.includes('video') || iconLower.includes('film')) return Clapperboard;
    if (iconLower.includes('photo')) return Camera;
    if (iconLower.includes('content') || iconLower.includes('writ')) return Palette;
    if (iconLower.includes('magic') || iconLower.includes('circus')) return Sparkles;
    if (iconLower.includes('comedy')) return Sparkles;
    if (iconLower.includes('stunt')) return Flame;
    if (iconLower.includes('beauty') || iconLower.includes('wellness')) return Sparkles;
    if (iconLower.includes('sport') || iconLower.includes('fitness')) return Flame;
    if (iconLower.includes('translation')) return Palette;
    return Briefcase;
  };

  const categoryFilters = useMemo(() => {
    const filters: Array<{
      id: string;
      name: string;
      icon: any;
      count: number;
      isSub: boolean;
      parentId: string | null;
    }> = [
      { id: 'all', name: 'All', icon: Sparkles, count: allCategoryCount || totalFiltered, isSub: false, parentId: null }
    ];
    
    // Add database categories with their counts
    dbCategories.forEach(cat => {
      filters.push({
        id: cat.id,
        name: cat.name,
        icon: getCategoryIcon(cat.name),
        count: categoryCounts[cat.name.toLowerCase()] || 0,
        isSub: false,
        parentId: null
      });

      // Add subcategories
      if (cat.subcategories) {
        cat.subcategories.forEach(sub => {
          filters.push({
            id: sub.id,
            name: sub.name,
            icon: getCategoryIcon(sub.name),
            count: categoryCounts[sub.name.toLowerCase()] || 0,
            isSub: true,
            parentId: cat.id
          });
        });
      }
    });
    
    return filters;
  }, [allItems.length, dbCategories, categoryCounts, allCategoryCount, totalFiltered]);

  const typeFilters = [
    { id: 'all', name: 'All', icon: MoreHorizontal },
    { id: 'VIDEO', name: 'Videos', icon: Play },
    { id: 'AUDIO', name: 'Audio', icon: Music },
    { id: 'IMAGE', name: 'Images', icon: ImageIcon },
  ];

  // Initialize from URL
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    const urlType = searchParams.get('type');
    const urlSort = searchParams.get('sort');
    const urlPage = searchParams.get('page');
    const urlSearch = searchParams.get('search');
    if (urlCategory) setActiveCategory(urlCategory);
    if (urlType) setActiveType(urlType);
    if (urlSort) setSortBy(urlSort);
    if (urlSearch) {
      setSearchQuery(urlSearch);
      setSearchInputValue(urlSearch);
    }
    if (urlPage) {
      const p = parseInt(urlPage, 10);
      if (!isNaN(p) && p > 0) setPage(p);
    }
  }, [searchParams]);

  // Fetch portfolio items
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const categoriesRes = await fetch('/api/categories');
        const categoriesData = await categoriesRes.json();
        if (!cancelled) {
          setDbCategories(categoriesData.data || []);
        }
        
        // Fetch portfolio items with filters
        const params = new URLSearchParams();
        if (activeCategory !== 'all') params.set('categoryId', activeCategory);
        if (activeType !== 'all') params.set('type', activeType);
        if (searchQuery) params.set('search', searchQuery);
        if (popularityTier !== 'all') params.set('popularity', popularityTier);
        if (dateRange !== 'all') params.set('date', dateRange);
        params.set('page', page.toString());
        params.set('limit', pageSize.toString());
        params.set('sort', sortBy);

        const res = await fetch(`/api/hub/portfolio?${params.toString()}`);
        const data = await res.json();
        if (cancelled) return;
        
        // Handle both old array format (if cached) and new object format
        const fetchedItems = Array.isArray(data) ? data : data.items || [];
        const totalCount = Array.isArray(data) ? data.length : data.total || 0;
        
        setAllItems(fetchedItems);
        setTotalFiltered(totalCount);
        
        // Set type counts from server facets if available
        if (data.facets) {
          if (data.facets.types) {
            setTypeCounts(data.facets.types);
          }
          if (data.facets.categories && typeof data.facets.categories.all === 'number') {
            setAllCategoryCount(data.facets.categories.all);
          }
        }

        // Calculate category counts
        const counts: Record<string, number> = {};
        fetchedItems.forEach((item: PortfolioItem) => {
          const catName = item.talentProfile.category?.name?.toLowerCase() || 'other';
          counts[catName] = (counts[catName] || 0) + 1;
        });

        // Aggregate counts for parent categories
        if (categoriesData.data) {
          categoriesData.data.forEach((cat: any) => {
            let parentCount = counts[cat.name.toLowerCase()] || 0;
            if (cat.subcategories) {
              cat.subcategories.forEach((sub: any) => {
                parentCount += counts[sub.name.toLowerCase()] || 0;
              });
            }
            counts[cat.name.toLowerCase()] = parentCount;
          });
        }

        setCategoryCounts(counts);

        // Set trending items (top 10 by views)
        const sortedByViews = [...fetchedItems].sort((a: PortfolioItem, b: PortfolioItem) => b.views - a.views);
        setTrendingItems(sortedByViews.slice(0, 10));

        // Extract unique talents for featured section
        const uniqueTalents = Array.from(new Map(fetchedItems.map((item: PortfolioItem) => [item.talentProfile.id, item.talentProfile])).values());
        setFeaturedTalents(uniqueTalents.slice(0, 5));

      } catch (e) {
        console.error('Failed to fetch portfolio items', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [activeCategory, activeType, page, pageSize, searchQuery, sortBy, popularityTier, dateRange]);

  // Generate search suggestions based on input (debounced)
  useEffect(() => {
    if (!searchInputValue.trim()) {
      setSearchSuggestions([]);
      return;
    }

    // Sanitize input on client side as well
    const sanitizedInput = searchInputValue.trim().substring(0, 100).replace(/[<>"'&]/g, '');
    const lowerInput = sanitizedInput.toLowerCase();
    
    // Generate suggestions from loaded items (titles and talent names)
    const titleMatches = allItems
      .filter(item => item.title.toLowerCase().includes(lowerInput))
      .map(item => item.title)
      .slice(0, 3);
    
    const talentMatches = allItems
      .filter(item => item.talentProfile.user.name.toLowerCase().includes(lowerInput))
      .map(item => item.talentProfile.user.name)
      .slice(0, 2);
    
    // Match categories
    const categoryMatches = dbCategories
      .filter(cat => cat.name.toLowerCase().includes(lowerInput))
      .map(cat => cat.name);
    
    // Match subcategories
    const subcategoryMatches = dbCategories
      .flatMap(cat => cat.subcategories || [])
      .filter(sub => sub.name.toLowerCase().includes(lowerInput))
      .map(sub => sub.name);
    
    // Combine and dedupe, prioritizing categories first
    const suggestions = [
      ...new Set([
        ...categoryMatches.slice(0, 2),
        ...subcategoryMatches.slice(0, 2),
        ...titleMatches,
        ...talentMatches
      ])
    ].slice(0, 6);
    
    setSearchSuggestions(suggestions);
  }, [searchInputValue, allItems, dbCategories]);

  // Handle search submission
  const handleSearchSubmit = (query?: string) => {
    let searchValue = (query ?? searchInputValue).trim();
    
    // Client-side sanitization
    searchValue = searchValue
      .substring(0, 100) // Limit length
      .replace(/[<>"'&]/g, '') // Remove potentially dangerous characters
      .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
    
    const lowerSearch = searchValue.toLowerCase();
    
    // Check if search matches a category name (exact or close match)
    const matchingCategory = dbCategories.find(cat => 
      cat.name.toLowerCase() === lowerSearch ||
      cat.name.toLowerCase().includes(lowerSearch) ||
      lowerSearch.includes(cat.name.toLowerCase())
    );
    
    // Check if search matches a subcategory name
    const matchingSubcategory = dbCategories
      .flatMap(cat => (cat.subcategories || []).map(sub => ({ ...sub, parentId: cat.id })))
      .find(sub => 
        sub.name.toLowerCase() === lowerSearch ||
        sub.name.toLowerCase().includes(lowerSearch) ||
        lowerSearch.includes(sub.name.toLowerCase())
      );
    
    // If exact or close match to a subcategory, switch to that subcategory filter
    if (matchingSubcategory && (
      matchingSubcategory.name.toLowerCase() === lowerSearch ||
      lowerSearch.includes(matchingSubcategory.name.toLowerCase())
    )) {
      setActiveCategory(matchingSubcategory.id);
      setSearchQuery('');
      setSearchInputValue('');
      setShowSuggestions(false);
      setPage(1);
      return;
    }
    
    // If exact or close match to a category, switch to that category filter
    if (matchingCategory && (
      matchingCategory.name.toLowerCase() === lowerSearch ||
      lowerSearch.includes(matchingCategory.name.toLowerCase())
    )) {
      setActiveCategory(matchingCategory.id);
      setSearchQuery('');
      setSearchInputValue('');
      setShowSuggestions(false);
      setPage(1);
      return;
    }
    
    // Otherwise, perform a regular text search
    setSearchQuery(searchValue);
    setSearchInputValue(searchValue);
    setShowSuggestions(false);
    setPage(1);
  };

  // Filter and sort
  const derived = useMemo(() => {
    // Since we are doing server-side filtering/pagination, 'allItems' already contains the correct items for the current page.
    // We just return them directly.
    return allItems;
  }, [allItems]);

  // Check if any filters are active
  const hasActiveFilters = searchQuery || activeCategory !== 'all' || activeType !== 'all' || popularityTier !== 'all' || dateRange !== 'all' || sortBy !== 'trending';

  // Separate items by type - these will respect the sort order from derived
  const videoItems = useMemo(() => derived.filter(item => item.type === 'VIDEO'), [derived]);
  const audioItems = useMemo(() => derived.filter(item => item.type === 'AUDIO'), [derived]);
  const imageItems = useMemo(() => derived.filter(item => item.type === 'IMAGE'), [derived]);
  
  // Trending sections - independent of filters/search, always sorted by views
  const trendingVideos = useMemo(() => {
    return [...allItems]
      .filter(item => item.type === 'VIDEO')
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }, [allItems]);
  
  const trendingAudio = useMemo(() => {
    return [...allItems]
      .filter(item => item.type === 'AUDIO')
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }, [allItems]);
  
  const trendingImages = useMemo(() => {
    return [...allItems]
      .filter(item => item.type === 'IMAGE')
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }, [allItems]);
  
  const latestUploads = useMemo(() => {
    return [...allItems]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [allItems]);
  
  const mostPopular = useMemo(() => {
    return [...allItems]
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 10);
  }, [allItems]);

  // Pagination
  useEffect(() => {
    // setTotalFiltered is now handled in the fetch effect
    setItems(derived);
    setFeaturedItem(page === 1 && derived.length ? derived[0] : null);
  }, [derived, page]);

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory !== 'all') params.set('category', activeCategory);
    if (activeType !== 'all') params.set('type', activeType);
    if (sortBy !== 'trending') params.set('sort', sortBy);
    if (searchQuery) params.set('search', searchQuery);
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, { scroll: false });
  }, [activeCategory, activeType, sortBy, page, searchQuery, pathname, router]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return Play;
      case 'IMAGE': return ImageIcon;
      case 'AUDIO': return Music;
      default: return Sparkles;
    }
  };

  // Helper to check if URL is an audio file
  const isAudioUrl = (url: string) => {
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a', '.wma'];
    return audioExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  // Helper to check if URL should be unoptimized (SVG, DiceBear)
  const shouldBeUnoptimized = (url: string) => {
    return url.includes('api.dicebear.com') || url.includes('.svg') || url.includes('/svg');
  };

  const getThumbnail = (item: PortfolioItem) => {
    // For audio items, return null (use fallback instead)
    if (item.type === 'AUDIO') return null;
    
    if (item.thumbnail && !isAudioUrl(item.thumbnail)) return item.thumbnail;
    
    if (item.type === 'VIDEO') {
      const embedMatch = item.url.match(/youtube\.com\/embed\/([^?]+)/);
      if (embedMatch && embedMatch[1]) return `https://img.youtube.com/vi/${embedMatch[1]}/hqdefault.jpg`;
      
      const watchMatch = item.url.match(/youtube\.com\/watch\?v=([^&]+)/);
      if (watchMatch && watchMatch[1]) return `https://img.youtube.com/vi/${watchMatch[1]}/hqdefault.jpg`;

      const shortMatch = item.url.match(/youtu\.be\/([^?]+)/);
      if (shortMatch && shortMatch[1]) return `https://img.youtube.com/vi/${shortMatch[1]}/hqdefault.jpg`;
    }
    
    // Don't return audio URLs as thumbnails
    if (isAudioUrl(item.url)) return null;
    
    return item.url;
  };

  // FallbackImage replaced with MediaThumbnailFallback component

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {selectedMediaItem && (
        <MediaOverlay
          media={selectedMediaItem}
          allMedia={allItems}
          talents={featuredTalents}
          onClose={handleMediaClose}
          onMediaSelect={handleMediaSelect}
        />
      )}

      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('title')}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {t('subtitle')}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl w-full relative">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-blue dark:group-focus-within:text-accent-red transition-colors z-10" />
                <input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={searchInputValue}
                  onChange={(e) => {
                    setSearchInputValue(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit();
                    }
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
                          setSearchInputValue(suggestion);
                          handleSearchSubmit(suggestion);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                      >
                        <Search className="w-4 h-4 text-gray-400" />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                    {searchInputValue.trim() && (
                      <button
                        onClick={() => handleSearchSubmit()}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-primary-blue dark:text-accent-red hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 border-t border-gray-100 dark:border-gray-700 transition-colors"
                      >
                        <Search className="w-4 h-4" />
                        <span>Search for "{searchInputValue}"</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
            
            {/* Categories Filter Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('categories.title')}</h3>
                {searchQuery && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {totalFiltered} result{totalFiltered !== 1 ? 's' : ''} found
                  </span>
                )}
              </div>
              
              {/* Parent Categories */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categoryFilters.filter(f => !f.isSub).map((filter) => {
                  const CategoryIcon = filter.icon;
                  const isActive = activeCategory === filter.id || categoryFilters.find(f => f.id === activeCategory && f.parentId === filter.id);
                  
                  return (
                    <button
                      key={filter.id}
                      onClick={() => { setActiveCategory(filter.id); setPage(1); }}
                      className={`flex items-center gap-2 whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
                        isActive
                          ? 'bg-primary-blue dark:bg-accent-red text-white shadow-lg border-transparent scale-105'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <CategoryIcon className="w-4 h-4" />
                      {filter.name}
                      {filter.id === 'all' && filter.count > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {filter.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Subcategories (only show if parent is active or if "All" is not active) */}
              {activeCategory !== 'all' && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 mt-2 scrollbar-hide animate-in fade-in slide-in-from-top-2 duration-200">
                  {categoryFilters
                    .filter(f => f.isSub && (
                      // Show if parent is active
                      f.parentId === activeCategory || 
                      // Or if this subcategory itself is active
                      f.id === activeCategory ||
                      // Or if a sibling subcategory is active (so we keep showing the list)
                      f.parentId === categoryFilters.find(c => c.id === activeCategory)?.parentId
                    ))
                    .map((filter) => {
                      const CategoryIcon = filter.icon;
                      return (
                        <button
                          key={filter.id}
                          onClick={() => { setActiveCategory(filter.id); setPage(1); }}
                          className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                            activeCategory === filter.id
                              ? 'bg-primary-blue/10 dark:bg-accent-red/10 text-primary-blue dark:text-accent-red border-primary-blue dark:border-accent-red'
                              : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <CategoryIcon className="w-3 h-3" />
                          {filter.name}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

          {/* Media Type & Sort Controls */}
          <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('type.title')}</span>
              <div className="flex bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1.5 gap-1">
              {typeFilters.map((filter) => {
                const Icon = filter.icon;
                const totalTypeCount = Object.values(typeCounts).reduce((a, b) => a + b, 0);
                const count = filter.id === 'all' 
                  ? (totalTypeCount > 0 ? totalTypeCount : totalFiltered)
                  : typeCounts[filter.id] || 0;
                
                return (
                  <button
                    key={filter.id}
                    onClick={() => { setActiveType(filter.id); setPage(1); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeType === filter.id
                        ? 'bg-primary-blue dark:bg-accent-red text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{filter.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeType === filter.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            </div>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                showAdvancedFilters
                  ? 'bg-primary-blue dark:bg-accent-red text-white border-transparent'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Filter className="w-4 h-4 inline mr-1" />
              {t('filters.button')}
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Popularity Tier Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📊 {t('filters.popularityTier')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPopularityTier('viral')}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        popularityTier === 'viral'
                          ? 'bg-red-500 text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      🔥 {t('filters.viral')}<br/><span className="text-[10px] opacity-80">100K+</span>
                    </button>
                    <button
                      onClick={() => setPopularityTier('popular')}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        popularityTier === 'popular'
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      ⭐ {t('filters.popular')}<br/><span className="text-[10px] opacity-80">10K-100K</span>
                    </button>
                    <button
                      onClick={() => setPopularityTier('rising')}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        popularityTier === 'rising'
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      📈 {t('filters.rising')}<br/><span className="text-[10px] opacity-80">1K-10K</span>
                    </button>
                    <button
                      onClick={() => setPopularityTier('fresh')}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        popularityTier === 'fresh'
                          ? 'bg-green-500 text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      🌱 {t('filters.fresh')}<br/><span className="text-[10px] opacity-80">&lt;1K</span>
                    </button>
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📅 {t('filters.uploadDate')}
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red cursor-pointer"
                  >
                    <option value="all">{t('filters.allTime')}</option>
                    <option value="today">{t('filters.today')}</option>
                    <option value="week">{t('filters.pastWeek')}</option>
                    <option value="month">{t('filters.pastMonth')}</option>
                    <option value="year">{t('filters.pastYear')}</option>
                  </select>
                </div>

                {/* Sort By Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    🔄 {t('filters.sortBy')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setSortBy(sortBy === 'trending' ? 'recent' : 'trending'); setPage(1); }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        sortBy === 'trending'
                          ? 'bg-primary-blue dark:bg-accent-red text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      🔥 {t('filters.trending')}
                    </button>
                    <button
                      onClick={() => { setSortBy(sortBy === 'recent' ? 'recent' : 'recent'); setPage(1); }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        sortBy === 'recent'
                          ? 'bg-primary-blue dark:bg-accent-red text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      🕒 {t('filters.newest')}
                    </button>
                    <button
                      onClick={() => { setSortBy(sortBy === 'popular' ? 'recent' : 'popular'); setPage(1); }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        sortBy === 'popular'
                          ? 'bg-primary-blue dark:bg-accent-red text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      ❤️ {t('filters.mostLiked')}
                    </button>
                    <button
                      onClick={() => { setSortBy(sortBy === 'oldest' ? 'recent' : 'oldest'); setPage(1); }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        sortBy === 'oldest'
                          ? 'bg-primary-blue dark:bg-accent-red text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      ⌛ {t('filters.oldest')}
                    </button>
                    <button
                      onClick={() => { setSortBy(sortBy === 'title-asc' ? 'recent' : 'title-asc'); setPage(1); }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        sortBy === 'title-asc'
                          ? 'bg-primary-blue dark:bg-accent-red text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      🔤 {t('filters.alphabetical')}
                    </button>
                    <button
                      onClick={() => { setSortBy(sortBy === 'title-desc' ? 'recent' : 'title-desc'); setPage(1); }}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        sortBy === 'title-desc'
                          ? 'bg-primary-blue dark:bg-accent-red text-white shadow-md'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      🔤 {t('filters.reverseAlphabetical')}
                    </button>
                  </div>
                </div>

                {/* Active Filters Summary */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setPopularityTier('all');
                      setDateRange('all');
                      setSearchQuery('');
                      setActiveCategory('all');
                      setActiveType('all');
                      setSortBy('trending');
                    }}
                    className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4 inline mr-1" />
                    {t('filters.clearAll')}
                  </button>
                </div>
              </div>

              {/* Active Filters Display */}
              <div className="mt-3 flex flex-wrap gap-2">
                {popularityTier !== 'all' && (
                  <span className="px-3 py-1 bg-primary-blue/10 dark:bg-accent-red/10 text-primary-blue dark:text-accent-red rounded-full text-xs font-medium">
                    {popularityTier === 'viral' ? `🔥 ${t('filters.viral')} (100K+)` : 
                     popularityTier === 'popular' ? `⭐ ${t('filters.popular')} (10K-100K)` :
                     popularityTier === 'rising' ? `📈 ${t('filters.rising')} (1K-10K)` :
                     `🌱 ${t('filters.fresh')} (<1K)`}
                  </span>
                )}
                {dateRange !== 'all' && (
                  <span className="px-3 py-1 bg-primary-blue/10 dark:bg-accent-red/10 text-primary-blue dark:text-accent-red rounded-full text-xs font-medium">
                    {dateRange === 'today' ? t('filters.today') : dateRange === 'week' ? t('filters.pastWeek') : dateRange === 'month' ? t('filters.pastMonth') : t('filters.pastYear')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>      <div className="max-w-screen-2xl mx-auto px-6 py-8 space-y-12 relative min-h-[400px]">
        {/* Content Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 z-10 flex items-start justify-center pt-32 animate-in fade-in duration-100">
            <div className="animate-spin sticky top-48">
              <SwoopingTick size={64} />
            </div>
          </div>
        )}
        
        {/* Active Filters Banner */}
        {hasActiveFilters && (
          <div className="bg-gradient-to-r from-primary-blue/10 to-accent-red/10 dark:from-primary-blue/5 dark:to-accent-red/5 border-l-4 border-primary-blue dark:border-accent-red rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="w-5 h-5 text-primary-blue dark:text-accent-red" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('filters.activeFilters')}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <span className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                      🔍 {t('filters.search')}: <span className="font-semibold">"{searchQuery}"</span>
                    </span>
                  )}
                  {activeCategory !== 'all' && (
                    <span className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                      🎭 {t('filters.category')}: <span className="font-semibold capitalize">{categoryFilters.find(c => c.id === activeCategory)?.name || activeCategory}</span>
                    </span>
                  )}
                  {activeType !== 'all' && (
                    <span className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                      🎥 {t('filters.type')}: <span className="font-semibold">{activeType === 'VIDEO' ? t('type.videos') : activeType === 'AUDIO' ? t('type.audio') : t('type.images')}</span>
                    </span>
                  )}
                  {popularityTier !== 'all' && (
                    <span className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                      {popularityTier === 'viral' ? `🔥 ${t('filters.viral')} (100K+)` : 
                       popularityTier === 'popular' ? `⭐ ${t('filters.popular')} (10K-100K)` :
                       popularityTier === 'rising' ? `📈 ${t('filters.rising')} (1K-10K)` :
                       `🌱 ${t('filters.fresh')} (<1K)`}
                    </span>
                  )}
                  {dateRange !== 'all' && (
                    <span className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                      📅 {dateRange === 'today' ? t('filters.today') : dateRange === 'week' ? t('filters.pastWeek') : dateRange === 'month' ? t('filters.pastMonth') : t('filters.pastYear')}
                    </span>
                  )}
                  {sortBy !== 'trending' && (
                    <span className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                      🔄 {t('filters.sort')}: <span className="font-semibold">
                        {sortBy === 'recent' ? t('filters.newest') :
                         sortBy === 'oldest' ? t('filters.oldest') :
                         sortBy === 'popular' ? t('filters.mostLiked') :
                         sortBy === 'views-desc' ? t('filters.mostViews') :
                         sortBy === 'views-asc' ? t('filters.leastViews') :
                         sortBy === 'likes-desc' ? t('filters.mostLikes') :
                         sortBy === 'likes-asc' ? t('filters.leastLikes') :
                         sortBy === 'title-asc' ? t('filters.alphabetical') : t('filters.zToA')}
                      </span>
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {t('filters.showing')} <span className="font-semibold text-primary-blue dark:text-accent-red">{totalFiltered}</span> {totalFiltered !== 1 ? t('filters.resultsPlural') : t('filters.results')}
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                  setActiveType('all');
                  setPopularityTier('all');
                  setDateRange('all');
                  setSortBy('trending');
                }}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <X className="w-4 h-4" />
                {t('filters.clearAll')}
              </button>
            </div>
          </div>
        )}
        
        {/* Featured Talent */}
        {featuredTalents.length > 0 && !hasActiveFilters && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('sections.featuredCreators')}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('sections.discoverTopTalent')}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-6 px-1 -mx-1">
              {featuredTalents.map((talent) => {
                // Get media items for this talent
                const talentMedia = allItems.filter(item => item.talentProfile.id === talent.id);
                
                return (
                  <div key={talent.id} className="min-w-[300px] w-[300px] flex-shrink-0">
                    <FeaturedTalentCard
                      talent={talent}
                      mediaItems={talentMedia}
                      onMediaClick={(item) => handleMediaSelect(item as any)}
                      onProfileClick={(profile) => {
                        // Open profile in new window/tab
                        window.open(`/talent/${profile.id}`, '_blank');
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Trending Media */}
        {trendingItems.length > 0 && !hasActiveFilters && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('sections.trendingNow')}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('sections.mostViewed')}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {trendingItems.map((item) => (
                <a
                  key={`trending-${item.id}`}
                  href={`/hub/media/${item.id}`}
                  onClick={(e) => { e.preventDefault(); handleMediaSelect(item); }}
                  className="group relative aspect-video rounded-xl overflow-hidden bg-gray-900 shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                >
                  {getThumbnail(item) ? (
                    <Image
                      src={getThumbnail(item)}
                      alt={item.title}
                      fill
                      className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                  ) : (
                    <MediaThumbnailFallback />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm flex-shrink-0">
                        {item.talentProfile.avatarUrl && !item.talentProfile.avatarUrl.includes('.mp3') ? (
                          <Image
                            src={item.talentProfile.avatarUrl}
                            alt={item.talentProfile.user.name}
                            width={24}
                            height={24}
                            className="w-full h-full object-cover"
                            unoptimized={shouldBeUnoptimized(item.talentProfile.avatarUrl)}
                          />
                        ) : (
                          <User className="w-4 h-4 text-white m-1" />
                        )}
                      </div>
                      <p className="text-gray-200 text-xs font-medium truncate">{item.talentProfile.user.name}</p>
                    </div>
                    <h3 className="text-white font-bold text-base truncate mb-1">{item.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatNumber(item.views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {item.likes}
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-red-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {t('badges.hot')}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}



        {/* Videos Section */}
        {!hasActiveFilters && videoItems.length > 0 && (activeType === 'all' || activeType === 'VIDEO') && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Play className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('sections.featuredVideos')}</h2>
                </div>
              </div>
              {videoItems.length > 10 && (
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActiveType('VIDEO'); }}
                  className="text-sm font-semibold text-primary-blue dark:text-accent-red hover:underline"
                >
                  {t('sections.viewAllVideos')}
                </a>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {videoItems.slice(0, 10).map((item) => {
                const TypeIcon = getTypeIcon(item.type);
                const thumbnail = getThumbnail(item);
                return (
                  <a
                    key={item.id}
                    href={`/hub/media/${item.id}`}
                    onClick={(e) => { e.preventDefault(); handleMediaSelect(item); }}
                    className="group block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 hover:scale-[1.02]"
                  >
                    <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                      {thumbnail ? (
                        <Image
                          src={thumbnail}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <MediaThumbnailFallback />
                      )}
                      
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <div className="bg-black/50 rounded-full p-3 backdrop-blur-sm">
                           <TypeIcon className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-full p-1.5">
                        <TypeIcon className="w-3 h-3 text-white" />
                      </div>

                      {item.isSponsored && (
                        <span className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-semibold shadow-sm">
                          {t('badges.sponsored')}
                        </span>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-600">
                          {item.talentProfile.avatarUrl ? (
                            <Image
                              src={item.talentProfile.avatarUrl}
                              alt={item.talentProfile.user.name}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700">
                              <User className="w-3 h-3 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {item.talentProfile.user.name}
                          </p>
                          {item.talentProfile.category && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                              {item.talentProfile.category.name}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 text-base leading-snug">
                        {item.title}
                      </h3>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 font-medium">
                            <Eye className="w-3.5 h-3.5" />
                            {formatNumber(item.views)}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Heart className="w-3.5 h-3.5" />
                            {item.likes}
                          </span>
                        </div>
                        <span className="text-xs">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Audio Section */}
        {!hasActiveFilters && audioItems.length > 0 && (activeType === 'all' || activeType === 'AUDIO') && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Music className="w-6 h-6 text-green-600 dark:text-green-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('sections.featuredAudio')}</h2>
                </div>
              </div>
              {audioItems.length > 10 && (
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActiveType('AUDIO'); }}
                  className="text-sm font-semibold text-primary-blue dark:text-accent-red hover:underline"
                >
                  {t('sections.viewAllAudio')}
                </a>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {audioItems.slice(0, 10).map((item) => {
                const TypeIcon = getTypeIcon(item.type);
                const thumbnail = getThumbnail(item);
                return (
                  <a
                    key={item.id}
                    href={`/hub/media/${item.id}`}
                    onClick={(e) => { e.preventDefault(); handleMediaSelect(item); }}
                    className="group block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 hover:scale-[1.02]"
                  >
                    <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                      {thumbnail ? (
                        <Image
                          src={thumbnail}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <MediaThumbnailFallback />
                      )}
                      
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <div className="bg-black/50 rounded-full p-3 backdrop-blur-sm">
                           <TypeIcon className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-full p-1.5">
                        <TypeIcon className="w-3 h-3 text-white" />
                      </div>

                      {item.isSponsored && (
                        <span className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-semibold shadow-sm">
                          {t('badges.sponsored')}
                        </span>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-600">
                          {item.talentProfile.avatarUrl ? (
                            <Image
                              src={item.talentProfile.avatarUrl}
                              alt={item.talentProfile.user.name}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700">
                              <User className="w-3 h-3 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {item.talentProfile.user.name}
                          </p>
                          {item.talentProfile.category && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                              {item.talentProfile.category.name}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 text-base leading-snug">
                        {item.title}
                      </h3>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 font-medium">
                            <Eye className="w-3.5 h-3.5" />
                            {formatNumber(item.views)}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Heart className="w-3.5 h-3.5" />
                            {item.likes}
                          </span>
                        </div>
                        <span className="text-xs">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Images Section */}
        {!hasActiveFilters && imageItems.length > 0 && (activeType === 'all' || activeType === 'IMAGE') && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                  <ImageIcon className="w-6 h-6 text-pink-600 dark:text-pink-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('sections.featuredImages')}</h2>
                </div>
              </div>
              {imageItems.length > 10 && (
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActiveType('IMAGE'); }}
                  className="text-sm font-semibold text-primary-blue dark:text-accent-red hover:underline"
                >
                  {t('sections.viewAllImages')}
                </a>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {imageItems.slice(0, 10).map((item) => {
                const TypeIcon = getTypeIcon(item.type);
                const thumbnail = getThumbnail(item);
                return (
                  <a
                    key={item.id}
                    href={`/hub/media/${item.id}`}
                    onClick={(e) => { e.preventDefault(); handleMediaSelect(item); }}
                    className="group block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 hover:scale-[1.02]"
                  >
                    <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                      {thumbnail ? (
                        <Image
                          src={thumbnail}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <MediaThumbnailFallback />
                      )}
                      
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <div className="bg-black/50 rounded-full p-3 backdrop-blur-sm">
                           <TypeIcon className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-full p-1.5">
                        <TypeIcon className="w-3 h-3 text-white" />
                      </div>

                      {item.isSponsored && (
                        <span className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-semibold shadow-sm">
                          {t('badges.sponsored')}
                        </span>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-600">
                          {item.talentProfile.avatarUrl ? (
                            <Image
                              src={item.talentProfile.avatarUrl}
                              alt={item.talentProfile.user.name}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700">
                              <User className="w-3 h-3 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {item.talentProfile.user.name}
                          </p>
                          {item.talentProfile.category && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                              {item.talentProfile.category.name}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 text-base leading-snug">
                        {item.title}
                      </h3>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 font-medium">
                            <Eye className="w-3.5 h-3.5" />
                            {formatNumber(item.views)}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Heart className="w-3.5 h-3.5" />
                            {item.likes}
                          </span>
                        </div>
                        <span className="text-xs">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Explore All Media */}
        {hasActiveFilters && (
          <section>
            {derived.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {allItems.map((item) => {
                    const TypeIcon = getTypeIcon(item.type);
                    const thumbnail = getThumbnail(item);
                    return (
                      <a
                        key={item.id}
                        href={`/hub/media/${item.id}`}
                        onClick={(e) => { e.preventDefault(); handleMediaSelect(item); }}
                        className="group block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 hover:scale-[1.02]"
                      >
                        <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                          {thumbnail ? (
                            <Image
                              src={thumbnail}
                              alt={item.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <MediaThumbnailFallback />
                          )}
                          
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                            <div className="bg-black/50 rounded-full p-3 backdrop-blur-sm">
                              <TypeIcon className="w-6 h-6 text-white" />
                            </div>
                          </div>

                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-full p-1.5">
                            <TypeIcon className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-600">
                              {item.talentProfile.avatarUrl ? (
                                <Image
                                  src={item.talentProfile.avatarUrl}
                                  alt={item.talentProfile.user.name}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700">
                                  <User className="w-3 h-3 text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {item.talentProfile.user.name}
                              </p>
                              {item.talentProfile.category && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                                  {item.talentProfile.category.name}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 text-base leading-snug">
                            {item.title}
                          </h3>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1 font-medium">
                                <Eye className="w-3.5 h-3.5" />
                                {formatNumber(item.views)}
                              </span>
                              <span className="flex items-center gap-1 font-medium">
                                <Heart className="w-3.5 h-3.5" />
                                {item.likes}
                              </span>
                            </div>
                            <span className="text-xs">{new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>

                {/* Pagination */}
                {Math.ceil(totalFiltered / pageSize) > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {t('pagination.previous')}
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.ceil(totalFiltered / pageSize) }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === Math.ceil(totalFiltered / pageSize) || Math.abs(p - page) <= 1)
                        .map((p, idx, arr) => (
                          <React.Fragment key={p}>
                            {idx > 0 && arr[idx - 1] !== p - 1 && (
                              <span className="px-2 text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => setPage(p)}
                              className={`px-4 py-2 rounded-lg transition-colors ${
                                p === page
                                  ? 'bg-primary-blue dark:bg-accent-red text-white'
                                  : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        ))}
                    </div>
                    <button
                      onClick={() => setPage(Math.min(Math.ceil(totalFiltered / pageSize), page + 1))}
                      disabled={page === Math.ceil(totalFiltered / pageSize)}
                      className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {t('pagination.next')}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <SwoopingTick size={64} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t('empty.title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('empty.description')}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Explore All Link */}
        {!hasActiveFilters && totalFiltered > 0 && (
          <div className="mt-12 mb-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('sections.exploreMoreDescription', { count: totalFiltered })}
            </p>
            <button
              onClick={() => setSortBy('recent')}
              className="px-8 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all text-primary-blue dark:text-accent-red font-bold text-lg"
            >
              {t('sections.exploreAll')}
            </button>
          </div>
        )}

        {/* Empty State */}
        <section>
          {!hasActiveFilters && totalFiltered === 0 && !loading && (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <SwoopingTick size={64} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('empty.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('empty.description')}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
