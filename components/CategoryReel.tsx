'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Camera, Music, User, Mic2, Sparkles, Palette, Users, Star,
  Clapperboard, Brush, HeartHandshake, Drama
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug?: string;
  _count?: { talents: number };
  subcategories?: { id: string; name: string }[];
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  acting: Clapperboard,
  actor: Clapperboard,
  music: Music,
  musician: Music,
  model: Camera,
  modelling: Camera,
  modeling: Camera,
  voice: Mic2,
  'voice-artist': Mic2,
  'voice artist': Mic2,
  dance: Sparkles,
  dancer: Sparkles,
  art: Palette,
  artist: Palette,
  presenter: Star,
  extra: Users,
  influencer: Star,
  comedian: Drama,
  host: HeartHandshake,
  beauty: Brush,
};

function getCategoryIcon(name: string): React.ElementType {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return User;
}

export default function CategoryReel({
  categories,
  locale = 'en-gb',
}: {
  categories: Category[];
  locale?: string;
}) {
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

  if (!categories.length) return null;

  return (
    <div className="relative z-10 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section label */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-[10px] uppercase tracking-[0.22em] font-semibold text-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/20 bg-white/60 dark:bg-white/[0.06] mb-6">
            <Sparkles className="w-4 h-4" />
            Explore talent
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tighter leading-[1.05]">
            Every type of{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-accent)]">
              creative talent
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
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-[0_4px_16px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.06] dark:ring-white/[0.1] flex items-center justify-center text-gray-600 dark:text-gray-300 opacity-0 group-hover/reel:opacity-100 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-110 active:scale-95"
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
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-[0_4px_16px_rgba(0,0,0,0.1)] ring-1 ring-black/[0.06] dark:ring-white/[0.1] flex items-center justify-center text-gray-600 dark:text-gray-300 opacity-0 group-hover/reel:opacity-100 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-110 active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Edge fade overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-gray-950 to-transparent z-10 pointer-events-none" />

          {/* Scrolling strip */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide px-4 py-2"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onScroll={updateScrollButtons}
          >
            {categories.map((cat, index) => {
              const Icon = getCategoryIcon(cat.name);
              const talentCount = cat._count?.talents ?? 0;

              return (
                <Link
                  key={cat.id}
                  href={`/${locale}/categories`}
                  className="group/card flex-none w-44 md:w-52"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="rounded-2xl bg-white/80 dark:bg-white/[0.04] ring-1 ring-black/[0.06] dark:ring-white/[0.08] p-5 md:p-6 text-center transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)] hover:ring-[var(--brand-primary)]/20 hover:-translate-y-1">
                    <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/card:scale-110 group-hover/card:rotate-3">
                      <Icon className="w-6 h-6 text-[var(--brand-primary)]" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight mb-1 truncate">
                      {cat.name}
                    </h3>
                    {talentCount > 0 && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {talentCount} {talentCount === 1 ? 'talent' : 'talents'}
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
