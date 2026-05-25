'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as Ph from 'phosphor-react';
import { useTranslations } from 'next-intl';
import { getCategoryTranslationKey } from '@/lib/categoryTranslations';
import { getCategoryIconByName } from '@/lib/categoryIcons';

interface Category {
  id: string;
  name: string;
  slug?: string;
  icon?: string | null;
  _count?: { talents: number };
  subcategories?: { id: string; name: string }[];
}

export default function CategoryReel({
  categories,
  locale = 'en-gb',
}: {
  categories: Category[];
  locale?: string;
}) {
  const tHome = useTranslations('Home');
  const tCategories = useTranslations('Categories');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const animationRef = useRef<number | null>(null);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  // Auto-scroll animation
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || categories.length <= 3) return;

    let lastTime = 0;
    const speed = 0.4; // px per ms

    const tick = (time: number) => {
      if (!isPaused && lastTime) {
        const delta = time - lastTime;
        el.scrollLeft += speed * delta;

        // Loop back when reaching end
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
          el.scrollLeft = 0;
        }
      }
      lastTime = time;
      updateScrollButtons();
      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPaused, categories.length, updateScrollButtons]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    setTimeout(updateScrollButtons, 400);
  }, [updateScrollButtons]);

  const getTranslatedCategoryName = useCallback((category: Category) => {
    const translationKey = getCategoryTranslationKey(category.id, category.slug, category.name);
    if (!translationKey) return category.name;

    const messageKey = `names.${translationKey}`;
    return typeof tCategories.has === 'function' && tCategories.has(messageKey)
      ? tCategories(messageKey)
      : category.name;
  }, [tCategories]);

  if (!categories.length) return null;

  return (
    <div className="relative z-10 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section label */}
        <div className="text-center mb-12">
          <span className="marketing-pill inline-flex items-center gap-2 rounded-full px-5 py-2 text-[10px] uppercase tracking-[0.22em] font-semibold text-[var(--marketing-accent)] ring-1 ring-[var(--marketing-border)] mb-6">
            <Ph.Sparkle className="w-4 h-4" />
            {tHome('reelEyebrow')}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tighter leading-[1.05]">
            {tHome('reelTitlePrefix')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-accent)]">
              {tHome('reelTitleAccent')}
            </span>
          </h2>
        </div>

        {/* Reel container */}
        <div className="relative group/reel">
          {/* Left arrow */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll('left')}
              className="marketing-surface absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 w-10 h-10 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.1)] ring-1 ring-[var(--marketing-border)] flex items-center justify-center text-gray-600 dark:text-gray-300 opacity-0 group-hover/reel:opacity-100 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-110 active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right arrow */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll('right')}
              className="marketing-surface absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 w-10 h-10 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.1)] ring-1 ring-[var(--marketing-border)] flex items-center justify-center text-gray-600 dark:text-gray-300 opacity-0 group-hover/reel:opacity-100 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-110 active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Edge fade overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[var(--marketing-panel-soft)] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--marketing-panel-soft)] to-transparent z-10 pointer-events-none" />

          {/* Scrolling strip */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide px-4 py-2"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onScroll={updateScrollButtons}
          >
            {categories.map((cat, index) => {
              const translatedCategoryName = getTranslatedCategoryName(cat);
              const Icon = getCategoryIconByName(cat.name, cat.icon);
              const talentCount = cat._count?.talents ?? 0;
              const categoryHref = `/${locale}/categories?category=${encodeURIComponent(cat.name)}`;

              return (
                <Link
                  key={cat.id}
                  href={categoryHref}
                  className="group/card flex-none w-44 md:w-52"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="marketing-surface rounded-2xl ring-1 ring-[var(--marketing-border)] p-5 md:p-6 text-center transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)] hover:ring-[var(--marketing-ring)] hover:-translate-y-1 hover-smart-bg">
                      <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/card:scale-110 group-hover/card:rotate-3">
                      <Icon className="w-6 h-6 text-[var(--brand-primary)]" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight mb-1 truncate">
                       {translatedCategoryName}
                    </h3>
                    {talentCount > 0 && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {tHome('reelTalentCount', { count: talentCount })}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
