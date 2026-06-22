'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Fuse from 'fuse.js';
import Image from 'next/image';
import {
  Eye,
  Heart,
  Filter,
  Play,
  Image as ImageIcon,
  Music,
  Sparkles,
  Search,
  Clapperboard,
  Flame,
  X,
  Loader2,
  Users,
} from 'lucide-react';
import { getCategoryIconByName, getSubcategoryIconByName } from '@/lib/categoryIcons';
import MediaOverlay from '@/components/MediaOverlay';
import FeaturedTalentCard from '@/components/FeaturedTalentCard';
import MediaThumbnailFallback from '@/components/MediaThumbnailFallback';
import LoadingSpinner from '@/components/LoadingSpinner';

interface PortfolioItem {
  id: string;
  title: string;
  mediaUrl: string;
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
      id?: string;
      name: string;
      icon?: string | null;
    };
    subcategory?: {
      id?: string;
      name: string;
    };
  };
  views: number;
  likeCount: number;
  isSponsored?: boolean;
  createdAt: string;
}

interface DbCategory {
  id: string;
  name: string;
  icon: string | null;
  subcategories?: Array<{ id: string; name: string; description: string | null }>;
}

interface HubSuggestion {
  type: 'category' | 'subcategory' | 'media' | 'creator';
  id: string;
  name: string;
  parentId?: string;
  parentName?: string;
}

const HUB_PAGE_SIZE = 200;

function resolveCategoryFilter(value: string, categories: DbCategory[]) {
  if (!value || value === 'all') return 'all';
  const lowerValue = value.toLowerCase();

  const category = categories.find(
    (cat) => cat.id === value || cat.name.toLowerCase() === lowerValue
  );
  if (category) return category.id;

  for (const categoryItem of categories) {
    const subcategory = (categoryItem.subcategories || []).find(
      (sub) => sub.id === value || sub.name.toLowerCase() === lowerValue
    );
    if (subcategory) return subcategory.id;
  }

  return value;
}

export default function HubPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const locale = (router && (router as any).locale) || 'en-gb';
  const t = useTranslations('Hub');

  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeType, setActiveType] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [, setPage] = useState(1);
  const pageSize = HUB_PAGE_SIZE;

  const [allItems, setAllItems] = useState<PortfolioItem[]>([]);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [allCategoryCount, setAllCategoryCount] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({});
  const [featuredTalents, setFeaturedTalents] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<DbCategory[]>([]);

  const [selectedMediaItem, setSelectedMediaItem] = useState<PortfolioItem | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [debouncedSearchInput, setDebouncedSearchInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeFeedTab, setActiveFeedTab] = useState<'all' | 'creators' | 'videos' | 'audio' | 'images'>('all');
  const [popularityTier, setPopularityTier] = useState<'all' | 'viral' | 'popular' | 'rising' | 'fresh'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');

  const spinnerTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const urlCategory = searchParams.get('category');
    const urlType = searchParams.get('type');
    const urlSort = searchParams.get('sort');
    const urlSearch = searchParams.get('search');
    const urlMediaId = searchParams.get('mediaId');

    if (urlCategory) setActiveCategory(urlCategory);
    if (urlType) setActiveType(urlType);
    if (urlSort) setSortBy(urlSort);
    if (urlSearch) {
      setSearchQuery(urlSearch);
      setSearchInputValue(urlSearch);
      setDebouncedSearchInput(urlSearch);
    }
    if (!urlMediaId) {
      setSelectedMediaItem(null);
    }
  }, [searchParams]);

  useEffect(() => {
    if (spinnerTimerRef.current) {
      clearTimeout(spinnerTimerRef.current);
      spinnerTimerRef.current = null;
    }

    if (!searchInputValue.trim()) {
      setDebouncedSearchInput('');
      setIsSearching(false);
      return;
    }

    spinnerTimerRef.current = window.setTimeout(() => {
      setIsSearching(true);
    }, 150);

    const debounceId = window.setTimeout(() => {
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

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      try {
        const categoriesRes = await fetch('/api/categories');
        const categoriesData = await categoriesRes.json();

        if (!cancelled) {
          setDbCategories(categoriesData.data || []);
        }

        const categories = categoriesData.data || [];
        const resolvedCategory = resolveCategoryFilter(activeCategory, categories);

        if (!cancelled && resolvedCategory !== activeCategory) {
          setActiveCategory(resolvedCategory);
        }

        const params = new URLSearchParams();
        if (resolvedCategory !== 'all') params.set('categoryId', resolvedCategory);
        if (activeType !== 'all') params.set('type', activeType);
        if (searchQuery) params.set('search', searchQuery);
        if (popularityTier !== 'all') params.set('popularity', popularityTier);
        if (dateRange !== 'all') params.set('date', dateRange);
        params.set('limit', pageSize.toString());
        params.set('sort', sortBy);

        const fetchPage = async (pageNumber: number) => {
          const pageParams = new URLSearchParams(params);
          pageParams.set('page', String(pageNumber));
          const res = await fetch(`/api/hub/portfolio?${pageParams.toString()}`);
          if (!res.ok) {
            const errorData = await res.json().catch(() => null);
            throw new Error(errorData?.error || `Hub API error ${res.status}`);
          }
          return res.json();
        };

        const data = await fetchPage(1);

        if (cancelled) return;

        const totalCount = Array.isArray(data) ? data.length : data.total || 0;
        const firstPageItems = Array.isArray(data) ? data : data.items || [];
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        const remainingPages = totalPages > 1
          ? await Promise.all(
              Array.from({ length: totalPages - 1 }, (_, index) => fetchPage(index + 2))
            )
          : [];

        if (cancelled) return;

        const fetchedItems = [
          ...firstPageItems,
          ...remainingPages.flatMap((pageData) => (Array.isArray(pageData) ? pageData : pageData.items || [])),
        ];

        setAllItems(fetchedItems);
        setTotalFiltered(totalCount);

        if (data.facets?.types) setTypeCounts(data.facets.types);
        if (data.facets?.categories && typeof data.facets.categories.all === 'number') {
          setAllCategoryCount(data.facets.categories.all);
        }

        const counts: Record<string, number> = {};
        fetchedItems.forEach((item: PortfolioItem) => {
          const categoryId = item.talentProfile.category?.id;
          const categoryName = item.talentProfile.category?.name?.toLowerCase();
          const subcategoryId = item.talentProfile.subcategory?.id;
          const subcategoryName = item.talentProfile.subcategory?.name?.toLowerCase();

          [categoryId, categoryName, subcategoryId, subcategoryName]
            .filter((key): key is string => Boolean(key))
            .forEach((key) => {
              counts[key] = (counts[key] || 0) + 1;
            });
        });

        if (categories.length) {
          categories.forEach((cat: any) => {
            let parentCount = counts[cat.id] || counts[cat.name.toLowerCase()] || 0;
            (cat.subcategories || []).forEach((sub: any) => {
              parentCount += counts[sub.id] || counts[sub.name.toLowerCase()] || 0;
            });
            counts[cat.id] = parentCount;
            counts[cat.name.toLowerCase()] = parentCount;
          });
        }

        setCategoryCounts(counts);

        const uniqueTalents = Array.from(
          new Map(
            fetchedItems.map((item: PortfolioItem) => [
              (item.talentProfile as any).userId ?? item.talentProfile.id,
              item.talentProfile,
            ])
          ).values()
        );
        setFeaturedTalents(uniqueTalents.slice(0, 6));
      } catch (e) {
        console.error('Failed to fetch hub data', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [activeCategory, activeType, pageSize, searchQuery, sortBy, popularityTier, dateRange]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory !== 'all') params.set('category', activeCategory);
    if (activeType !== 'all') params.set('type', activeType);
    if (sortBy !== 'trending') params.set('sort', sortBy);
    if (searchQuery) params.set('search', searchQuery);
    const urlMediaId = searchParams.get('mediaId');
    if (urlMediaId) params.set('mediaId', urlMediaId);
    else if (selectedMediaItem) params.set('mediaId', selectedMediaItem.id);

    const url = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(url, { scroll: false });
  }, [activeCategory, activeType, sortBy, searchQuery, selectedMediaItem, pathname, router, searchParams]);

  useEffect(() => {
    const mediaId = searchParams.get('mediaId');
    if (mediaId) {
      const item = allItems.find((item) => item.id === mediaId);
      if (item) {
        setSelectedMediaItem(item);
      }
    } else {
      setSelectedMediaItem(null);
    }
  }, [searchParams, allItems]);

  const flatCategoryIndex = useMemo(() => {
    const items: Array<{ id: string; type: 'category' | 'subcategory'; name: string; parentName: string; parentId?: string }> = [];
    dbCategories.forEach((cat) => {
      items.push({ id: cat.id, type: 'category', name: cat.name, parentName: '' });
      (cat.subcategories || []).forEach((sub) => {
        items.push({ id: sub.id, type: 'subcategory', name: sub.name, parentName: cat.name, parentId: cat.id });
      });
    });
    return items;
  }, [dbCategories]);

  const fuse = useMemo(
    () =>
      new Fuse(flatCategoryIndex, {
        keys: ['name', 'parentName'],
        threshold: 0.28,
        ignoreLocation: true,
        minMatchCharLength: 1,
      }),
    [flatCategoryIndex]
  );

  const hubSuggestions = useMemo<HubSuggestion[]>(() => {
    const input = debouncedSearchInput.trim();
    if (!input) return [];

    const lowerInput = input.toLowerCase();
    const output: HubSuggestion[] = [];

    try {
      fuse.search(input, { limit: 4 }).forEach((res: { item: HubSuggestion }) => {
        output.push({
          type: res.item.type,
          id: res.item.id,
          name: res.item.name,
          parentId: res.item.parentId,
          parentName: res.item.parentName,
        });
      });
    } catch {
      // Fallbacks below.
    }

    allItems
      .filter((item) => item.title.toLowerCase().includes(lowerInput))
      .slice(0, 2)
      .forEach((item) => output.push({ type: 'media', id: item.id, name: item.title }));

    allItems
      .filter((item) => item.talentProfile.user.name.toLowerCase().includes(lowerInput))
      .slice(0, 2)
      .forEach((item) => {
        output.push({
          type: 'creator',
          id: (item.talentProfile as any).userId ?? item.talentProfile.id,
          name: item.talentProfile.user.name,
        });
      });

    const seen = new Set<string>();
    return output.filter((item) => {
      const key = `${item.type}:${item.id}:${item.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 8);
  }, [debouncedSearchInput, fuse, allItems]);

  const categoryFilters = useMemo(() => {
    const filters: Array<{ id: string; name: string; icon: any; count: number; isSub: boolean; parentId: string | null }> = [
      { id: 'all', name: 'All', icon: Sparkles, count: allCategoryCount || totalFiltered, isSub: false, parentId: null },
    ];

    dbCategories.forEach((cat) => {
      filters.push({
        id: cat.id,
        name: cat.name,
        icon: getCategoryIconByName(cat.name, cat.icon ?? undefined),
        count: categoryCounts[cat.id] || categoryCounts[cat.name.toLowerCase()] || 0,
        isSub: false,
        parentId: null,
      });

      (cat.subcategories || []).forEach((sub) => {
        filters.push({
          id: sub.id,
          name: sub.name,
          icon: getSubcategoryIconByName(sub.name, cat.name, cat.icon ?? undefined),
          count: categoryCounts[sub.id] || categoryCounts[sub.name.toLowerCase()] || 0,
          isSub: true,
          parentId: cat.id,
        });
      });
    });

    return filters;
  }, [dbCategories, categoryCounts, allCategoryCount, totalFiltered]);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSearchInputValue('');
    setDebouncedSearchInput('');
    setActiveCategory('all');
    setActiveType('all');
    setPopularityTier('all');
    setDateRange('all');
    setSortBy('trending');
    setPage(1);
    setShowSuggestions(false);
  }, []);

  const getCategoryLabel = useCallback(
    (id: string) => {
      const category = dbCategories.find((cat) => cat.id === id);
      if (category) return category.name;
      for (const cat of dbCategories) {
        const sub = (cat.subcategories || []).find((subItem) => subItem.id === id);
        if (sub) return `${sub.name} (${cat.name})`;
      }
      return id;
    },
    [dbCategories]
  );

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ label: string; onRemove: () => void }> = [];
    if (searchQuery) {
      chips.push({ label: `Search: "${searchQuery}"`, onRemove: () => { setSearchQuery(''); setSearchInputValue(''); setDebouncedSearchInput(''); setPage(1); } });
    }
    if (activeCategory !== 'all') {
      chips.push({ label: `Category: ${getCategoryLabel(activeCategory)}`, onRemove: () => { setActiveCategory('all'); setPage(1); } });
    }
    if (activeType !== 'all') {
      chips.push({ label: `Type: ${activeType}`, onRemove: () => { setActiveType('all'); setPage(1); } });
    }
    if (popularityTier !== 'all') {
      chips.push({ label: `Popularity: ${popularityTier}`, onRemove: () => { setPopularityTier('all'); setPage(1); } });
    }
    if (dateRange !== 'all') {
      chips.push({ label: `Date: ${dateRange}`, onRemove: () => { setDateRange('all'); setPage(1); } });
    }
    if (sortBy !== 'trending') {
      chips.push({ label: `Sort: ${sortBy}`, onRemove: () => { setSortBy('trending'); setPage(1); } });
    }
    return chips;
  }, [searchQuery, activeCategory, activeType, popularityTier, dateRange, sortBy, getCategoryLabel]);

  const hasActiveFilters = activeFilterChips.length > 0;

  const videoItems = useMemo(() => allItems.filter((item) => item.type === 'VIDEO'), [allItems]);
  const audioItems = useMemo(() => allItems.filter((item) => item.type === 'AUDIO'), [allItems]);
  const imageItems = useMemo(() => allItems.filter((item) => item.type === 'IMAGE'), [allItems]);
  const trendingItems = useMemo(() => [...allItems].sort((a, b) => b.views - a.views).slice(0, 10), [allItems]);

  const getThumbnail = (item: PortfolioItem) => {
    if (item.type === 'AUDIO') return null;
    if (item.thumbnail) return item.thumbnail;
    return item.mediaUrl;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTypeIcon = (type: string) => {
    if (type === 'VIDEO') return Play;
    if (type === 'AUDIO') return Music;
    if (type === 'IMAGE') return ImageIcon;
    return Sparkles;
  };

  const getSuggestionIcon = (type: HubSuggestion['type']) => {
    if (type === 'category') return Sparkles;
    if (type === 'subcategory') return ImageIcon;
    if (type === 'media') return Play;
    return Users;
  };

  const getSuggestionLabel = (type: HubSuggestion['type']) => {
    if (type === 'category') return 'Category';
    if (type === 'subcategory') return 'Subcategory';
    if (type === 'media') return 'Media';
    return 'Creator';
  };

  const handleMediaSelect = (item: PortfolioItem) => {
    setSelectedMediaItem(item);
    const params = new URLSearchParams(searchParams.toString());
    params.set('mediaId', item.id);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleBackToBrowse = () => {
    setSelectedMediaItem(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('mediaId');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const handleExitHub = () => {
    handleBackToBrowse();
  };

  const handleSearchSubmit = (query?: string) => {
    const searchValue = (query ?? searchInputValue)
      .trim()
      .substring(0, 100)
      .replace(/[<>"'&]/g, '')
      .replace(/[\x00-\x1F\x7F]/g, '');

    if (!searchValue) {
      setSearchQuery('');
      setSearchInputValue('');
      setDebouncedSearchInput('');
      setShowSuggestions(false);
      setPage(1);
      return;
    }

    const lower = searchValue.toLowerCase();
    const exactCategory = dbCategories.find((cat) => cat.name.toLowerCase() === lower);
    if (exactCategory) {
      setActiveCategory(exactCategory.id);
      setSearchQuery('');
      setSearchInputValue('');
      setDebouncedSearchInput('');
      setShowSuggestions(false);
      setPage(1);
      return;
    }

    const exactSubcategory = dbCategories
      .flatMap((cat) => (cat.subcategories || []).map((sub) => ({ ...sub, parentId: cat.id })))
      .find((sub) => sub.name.toLowerCase() === lower);

    if (exactSubcategory) {
      setActiveCategory(exactSubcategory.id);
      setSearchQuery('');
      setSearchInputValue('');
      setDebouncedSearchInput('');
      setShowSuggestions(false);
      setPage(1);
      return;
    }

    setSearchQuery(searchValue);
    setSearchInputValue(searchValue);
    setDebouncedSearchInput(searchValue);
    setShowSuggestions(false);
    setPage(1);
  };

  const applySuggestion = (suggestion: HubSuggestion) => {
    if (suggestion.type === 'category' || suggestion.type === 'subcategory') {
      setActiveCategory(suggestion.id);
      setSearchQuery('');
      setSearchInputValue('');
      setDebouncedSearchInput('');
    } else if (suggestion.type === 'media') {
      const media = allItems.find((item) => item.id === suggestion.id);
      if (media) {
        handleMediaSelect(media);
      } else {
        setSearchQuery(suggestion.name);
        setSearchInputValue(suggestion.name);
      }
    } else {
      setSearchQuery(suggestion.name);
      setSearchInputValue(suggestion.name);
    }

    setShowSuggestions(false);
    setPage(1);
  };

  if (selectedMediaItem) {
    return (
      <div className="hub-root min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50/40 text-light-surface dark:from-zinc-950 dark:via-[#111111] dark:to-zinc-950 dark:text-dark-surface">
        <MediaOverlay
          media={selectedMediaItem}
          allMedia={allItems}
          talents={featuredTalents}
          onClose={handleExitHub}
          onBackToHub={handleBackToBrowse}
          onMediaSelect={handleMediaSelect}
        />
      </div>
    );
  }

  const topMedia = trendingItems[0] || allItems[0] || null;
  const queueMedia = trendingItems.length > 1 ? trendingItems.slice(1, 7) : allItems.slice(0, 6);

  const feedTabs = [
    { id: 'all' as const, label: 'For You' },
    { id: 'creators' as const, label: 'Creators' },
    { id: 'videos' as const, label: 'Videos' },
    { id: 'audio' as const, label: 'Audio' },
    { id: 'images' as const, label: 'Images' },
  ];

  const showCreators = activeFeedTab === 'all' || activeFeedTab === 'creators';
  const showVideos = activeFeedTab === 'all' || activeFeedTab === 'videos';
  const showAudio = activeFeedTab === 'all' || activeFeedTab === 'audio';
  const showImages = activeFeedTab === 'all' || activeFeedTab === 'images';

  const mediaShelfCard = (item: PortfolioItem, idx: number) => {
    const TypeIcon = getTypeIcon(item.type);
    const thumbnail = getThumbnail(item);

    return (
      <button
        key={`${item.id}-${idx}`}
        onClick={() => handleMediaSelect(item)}
        className="group relative w-[280px] sm:w-[320px] shrink-0 text-left snap-start"
      >
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-blue-100/90 bg-slate-950 shadow-[0_8px_30px_rgba(15,23,42,0.12)] dark:border-zinc-800 dark:shadow-[0_14px_34px_rgba(0,0,0,0.45)]">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              loading={idx < 2 ? 'eager' : 'lazy'}
              quality={75}
            />
          ) : (
            <MediaThumbnailFallback />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          <div className="absolute left-3 right-3 bottom-3 flex items-end justify-between">
            <div className="min-w-0">
              <p className="text-white font-semibold truncate">{item.title}</p>
              <p className="text-white/80 text-xs truncate">{item.talentProfile.user.name}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] font-semibold text-white">
              <TypeIcon className="w-3 h-3" />
              {item.type}
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-blue-900/70 dark:text-red-200/80">
          <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3" />{formatNumber(item.views)}</span>
          <span className="inline-flex items-center gap-1"><Heart className="w-3 h-3" />{item.likeCount}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="hub-root min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50/40 text-light-surface dark:from-zinc-950 dark:via-[#111111] dark:to-zinc-950 dark:text-dark-surface">
      <div className="sticky top-0 z-40 border-b border-blue-100/80 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/85">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 md:gap-4 md:px-6">
          <div className="shrink-0 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_14px_30px_rgba(37,99,235,0.24)] dark:bg-red-500">
                <Clapperboard className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm md:text-base font-black tracking-tight text-blue-950 dark:text-red-100">Talent Hub</h1>
                <p className="max-w-xl text-[11px] text-blue-700 dark:text-red-200/75">A premium media destination for talent portfolios, reel highlights and discoverable creative storytelling.</p>
              </div>
            </div>

          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('search.placeholder')}
              value={searchInputValue}
              onChange={(e) => {
                setSearchInputValue(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit();
                if (e.key === 'Escape') setShowSuggestions(false);
              }}
              onFocus={() => searchInputValue && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 140)}
              className="w-full rounded-xl border border-blue-100 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-red-500/70"
            />
            {isSearching && <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />}
            {searchInputValue && (
              <button
                onClick={() => {
                  setSearchInputValue('');
                  setDebouncedSearchInput('');
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {showSuggestions && (
              <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border border-blue-100 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                {hubSuggestions.length > 0 ? (
                  hubSuggestions.map((suggestion, idx) => {
                    const SuggestionIcon = getSuggestionIcon(suggestion.type);
                    return (
                      <button
                        key={`${suggestion.type}-${suggestion.id}-${idx}`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => applySuggestion(suggestion)}
                        className="w-full px-3 py-2.5 text-left transition-colors hover:bg-blue-50 dark:hover:bg-zinc-800"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <SuggestionIcon className="h-4 w-4 text-blue-600 dark:text-red-300" />
                            <span className="truncate text-sm text-blue-950 dark:text-red-100">{suggestion.name}</span>
                          </div>
                          <span className="shrink-0 text-[10px] uppercase tracking-wide text-blue-700/80 dark:text-red-200/75">{getSuggestionLabel(suggestion.type)}</span>
                        </div>
                        {suggestion.parentName && (
                          <p className="truncate text-[11px] text-blue-700/80 dark:text-red-200/70">in {suggestion.parentName}</p>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-3 text-sm text-slate-600 dark:text-slate-300">
                    No suggestions found.
                  </div>
                )}
                {searchInputValue.trim() && (
                  <button
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSearchSubmit()}
                    className="w-full border-t border-blue-100 px-3 py-2 text-left text-sm font-semibold text-blue-700 hover:bg-blue-50 dark:border-zinc-800 dark:text-red-300 dark:hover:bg-zinc-800"
                  >
                    Search for "{searchInputValue.trim()}"
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAdvancedFilters((v) => !v)}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-900 transition-colors hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-red-100 dark:hover:bg-zinc-800"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="mx-auto flex max-w-[1600px] items-center gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide md:px-6">
          {feedTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFeedTab(tab.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                activeFeedTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md dark:bg-red-500'
                  : 'border border-blue-100 bg-white text-blue-900 hover:bg-blue-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-red-100 dark:hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {allItems.length > 0 && (
          <section className="hub-hero mx-auto max-w-[1600px] px-4 pb-6 md:px-6">
            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
              <div className="relative overflow-hidden rounded-[1.65rem] border border-blue-100/80 bg-white/90 p-6 shadow-[0_32px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/85">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.12),transparent_25%)] pointer-events-none" />
                <div className="relative z-10">
                  <span className="hub-pill">Talent spotlight</span>
                  <h2 className="mt-4 text-2xl font-black tracking-tight text-blue-950 dark:text-red-100 sm:text-3xl">A media-first showcase for talent portfolios and creator reels.</h2>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Explore talent stories through premium videos, striking images and audio highlights, all surfaced in a dramatic visual canvas.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="hub-stat">
                      <span className="block text-xs uppercase tracking-[0.24em] text-blue-700 dark:text-red-300">Media items</span>
                      <span className="mt-2 block text-2xl font-black text-blue-950 dark:text-white">{totalFiltered}</span>
                    </div>
                    <div className="hub-stat">
                      <span className="block text-xs uppercase tracking-[0.24em] text-blue-700 dark:text-red-300">Categories</span>
                      <span className="mt-2 block text-2xl font-black text-blue-950 dark:text-white">{dbCategories.length}</span>
                    </div>
                    <div className="hub-stat">
                      <span className="block text-xs uppercase tracking-[0.24em] text-blue-700 dark:text-red-300">Top format</span>
                      <span className="mt-2 block text-2xl font-black text-blue-950 dark:text-white">{topMedia?.type || 'Video'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-blue-100/80 bg-slate-950/95 p-5 shadow-[0_32px_90px_rgba(15,23,42,0.18)] dark:border-zinc-800">
                <div className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-300 dark:text-red-300">Now playing</div>
                <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 to-sky-600 text-white shadow-lg dark:from-red-500 dark:to-rose-500">
                      <Play className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white line-clamp-2">{topMedia?.title}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{topMedia?.talentProfile.user.name}</div>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3">
                    <div className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
                      Hand-picked media from creative portfolios, surfaced with a premium visual rhythm.
                    </div>
                    <div className="hub-stat">
                      <span className="block text-xs uppercase tracking-[0.24em] text-blue-300 dark:text-red-300">Views</span>
                      <span className="mt-2 block text-2xl font-black text-white">{topMedia ? formatNumber(topMedia.views) : '0'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        {hasActiveFilters && (
          <div className="mx-auto max-w-[1600px] px-4 pb-3 md:px-6">
            <div className="flex flex-wrap gap-2 rounded-2xl border border-blue-100 bg-white/90 px-4 py-3 text-sm text-blue-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/75 dark:text-red-100">
              {activeFilterChips.map((chip) => (
                <span key={chip.label} className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[13px] font-semibold text-blue-900 dark:bg-red-950/50 dark:text-red-100">
                  {chip.label}
                  <button
                    onClick={chip.onRemove}
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-blue-700 transition-colors hover:bg-blue-100 dark:bg-zinc-900 dark:text-red-200 dark:hover:bg-red-950"
                    aria-label={`Remove filter ${chip.label}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              <button
                onClick={clearAllFilters}
                className="ml-auto rounded-full bg-blue-100 px-3 py-1.5 text-[13px] font-semibold text-blue-800 hover:bg-blue-200 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-900"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 px-4 py-5 md:px-6 md:py-6 xl:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden self-start rounded-2xl border border-blue-100/80 bg-white/90 p-4 xl:block sticky top-[108px] dark:border-zinc-800 dark:bg-zinc-900/70">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-blue-700 dark:text-red-200/80">Categories</p>
          <div className="max-h-[65vh] space-y-1.5 overflow-y-auto pr-1">
            {categoryFilters.filter((f) => !f.isSub).map((filter) => {
              const CategoryIcon = filter.icon;
              const active = activeCategory === filter.id;
              const count = filter.id === 'all' ? (allCategoryCount || totalFiltered) : filter.count;

              return (
                <button
                  key={filter.id}
                  onClick={() => {
                    setActiveCategory(filter.id);
                    setPage(1);
                  }}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors flex items-center justify-between ${
                    active
                      ? 'bg-blue-600 text-white dark:bg-red-500'
                      : 'text-blue-900 hover:bg-blue-50 dark:text-red-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <CategoryIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{filter.name}</span>
                  </span>
                  <span className={`rounded px-1.5 py-0.5 text-[11px] ${active ? 'bg-white/20' : 'bg-blue-100 dark:bg-zinc-800'}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="min-w-0 space-y-7">
          {topMedia && (
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_360px]">
              <button
                onClick={() => handleMediaSelect(topMedia)}
                className="group relative min-h-[260px] overflow-hidden rounded-2xl border border-blue-100 bg-slate-950 text-left dark:border-zinc-800 sm:min-h-[320px]"
              >
                {getThumbnail(topMedia) ? (
                  <Image
                    src={getThumbnail(topMedia) || ''}
                    alt={topMedia.title}
                    fill
                    sizes="100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    priority
                    quality={75}
                  />
                ) : (
                  <MediaThumbnailFallback />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-white/90">
                    <Flame className="w-4 h-4" />
                    Trending pick
                  </p>
                  <h2 className="max-w-2xl text-2xl font-black leading-tight text-white md:text-3xl">{topMedia.title}</h2>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/90">
                    <span>{topMedia.talentProfile.user.name}</span>
                    <span className="inline-flex items-center gap-1"><Eye className="w-4 h-4" />{formatNumber(topMedia.views)}</span>
                    <span className="inline-flex items-center gap-1"><Heart className="w-4 h-4" />{topMedia.likeCount}</span>
                  </div>
                </div>
                <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                  <Play className="w-5 h-5" />
                </div>
              </button>

              <div className="rounded-2xl border border-blue-100 bg-white/95 p-3 dark:border-zinc-800 dark:bg-zinc-900/75">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-bold text-blue-950 dark:text-red-100">Up Next</h3>
                  <span className="text-xs text-blue-700 dark:text-red-200/80">Autoplay queue</span>
                </div>
                <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                  {queueMedia.map((item) => (
                    <button
                      key={`queue-${item.id}`}
                      onClick={() => handleMediaSelect(item)}
                      className="w-full rounded-xl p-2 text-left transition-colors hover:bg-blue-50 dark:hover:bg-zinc-800"
                    >
                      <div className="flex gap-2.5">
                        <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-slate-900">
                          {getThumbnail(item) ? (
                            <Image src={getThumbnail(item) || ''} alt={item.title} fill sizes="112px" className="object-cover" loading="lazy" quality={75} />
                          ) : (
                            <MediaThumbnailFallback />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-semibold text-blue-950 dark:text-red-100">{item.title}</p>
                          <p className="mt-1 truncate text-xs text-blue-700 dark:text-red-200/75">{item.talentProfile.user.name}</p>
                          <p className="mt-1 text-[11px] text-blue-700/80 dark:text-red-200/70">{formatNumber(item.views)} views</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  {!queueMedia.length && <p className="p-2 text-sm text-blue-700/80 dark:text-red-200/75">No queued items yet.</p>}
                </div>
              </div>
            </section>
          )}

          {showCreators && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xl font-black text-blue-950 dark:text-red-100">Featured Creators</h3>
                <span className="text-xs text-blue-700 dark:text-red-200/80">Curated talents</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {featuredTalents.map((talent) => {
                  const talentId = (talent as any).userId ?? talent.id;
                  const mediaItems = allItems.filter((item) => ((item.talentProfile as any).userId ?? item.talentProfile.id) === talentId);
                  return (
                    <FeaturedTalentCard
                      key={`creator-${talentId}`}
                      talent={talent}
                      mediaItems={mediaItems}
                      onMediaClick={(item) => handleMediaSelect(item as any)}
                      onProfileClick={(profile) => window.open(`/talent/${(profile as any).userId ?? profile.id}`, '_blank')}
                    />
                  );
                })}
                {!featuredTalents.length && (
                  <div className="col-span-full rounded-2xl border border-dashed border-blue-200 bg-white/70 p-6 text-sm text-blue-700 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-red-200/80">
                    No creators available for this filter yet.
                  </div>
                )}
              </div>
            </section>
          )}

          {showVideos && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xl font-black text-blue-950 dark:text-red-100">Featured Videos</h3>
                <button onClick={() => { setActiveType('VIDEO'); setPage(1); }} className="text-sm font-semibold text-blue-700 hover:underline dark:text-red-300">View all</button>
              </div>
              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {(videoItems.length ? videoItems : trendingItems.filter((item) => item.type === 'VIDEO')).slice(0, 12).map(mediaShelfCard)}
              </div>
            </section>
          )}

          {showAudio && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xl font-black text-blue-950 dark:text-red-100">Featured Audio</h3>
                <button onClick={() => { setActiveType('AUDIO'); setPage(1); }} className="text-sm font-semibold text-blue-700 hover:underline dark:text-red-300">View all</button>
              </div>
              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {(audioItems.length ? audioItems : trendingItems.filter((item) => item.type === 'AUDIO')).slice(0, 12).map(mediaShelfCard)}
              </div>
            </section>
          )}

          {showImages && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xl font-black text-blue-950 dark:text-red-100">Featured Images</h3>
                <button onClick={() => { setActiveType('IMAGE'); setPage(1); }} className="text-sm font-semibold text-blue-700 hover:underline dark:text-red-300">View all</button>
              </div>
              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {(imageItems.length ? imageItems : trendingItems.filter((item) => item.type === 'IMAGE')).slice(0, 12).map(mediaShelfCard)}
              </div>
            </section>
          )}

          {showAdvancedFilters && (
            <section className="rounded-2xl border border-blue-100 bg-white/95 p-4 dark:border-zinc-800 dark:bg-zinc-900/70 md:p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-blue-700 dark:text-red-200/80">Popularity</label>
                  <select
                    value={popularityTier}
                    onChange={(e) => setPopularityTier(e.target.value as any)}
                    className="w-full rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    <option value="all">All</option>
                    <option value="viral">Viral</option>
                    <option value="popular">Popular</option>
                    <option value="rising">Rising</option>
                    <option value="fresh">Fresh</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-blue-700 dark:text-red-200/80">Upload date</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as any)}
                    className="w-full rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    <option value="all">All time</option>
                    <option value="today">Today</option>
                    <option value="week">Past week</option>
                    <option value="month">Past month</option>
                    <option value="year">Past year</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-blue-700 dark:text-red-200/80">Sort</label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(1);
                    }}
                    className="w-full rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    <option value="trending">Trending</option>
                    <option value="recent">Newest</option>
                    <option value="popular">Most liked</option>
                    <option value="oldest">Oldest</option>
                  </select>
                </div>
              </div>
            </section>
          )}

          {loading && (
            <div className="flex justify-center rounded-2xl border border-blue-100 bg-white/90 p-8 dark:border-zinc-800 dark:bg-zinc-900/70">
              <LoadingSpinner size={52} inline />
            </div>
          )}

          {!loading && !allItems.length && (
            <section className="rounded-2xl border border-dashed border-blue-200 bg-white/80 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/55">
              <h3 className="text-xl font-bold text-blue-950 dark:text-red-100">No content found</h3>
              <p className="mt-2 text-sm text-blue-700 dark:text-red-200/80">Try switching tabs, search terms, or category filters.</p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
