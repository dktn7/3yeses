'use client';

import React, { useEffect, useRef, useState } from 'react';
import sendTelemetryEvent from '@/lib/telemetry';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { User, ChevronLeft, ChevronRight } from 'lucide-react';
import * as Ph from 'phosphor-react';
import { getCategoryIconByName } from '@/lib/categoryIcons';
import SwoopingTick from './SwoopingTick';
import AuthRequiredModal from './AuthRequiredModal';
import { isAudioUrl, shouldBeUnoptimized } from '@/lib/image-utils';
import MediaThumbnailFallback from './MediaThumbnailFallback';
interface MediaItem {
  id: string;
  title: string;
  mediaUrl: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO';
  thumbnail?: string;
}

interface TalentProfile {
  id: string;
  user: {
    name: string;
  };
  avatarUrl?: string;
  category?: {
    name: string;
  };
  skills?: string[];
  featuredSkills?: string[]; // User-selected skills to display (max 4)
}

interface FeaturedTalentCardProps {
  talent: TalentProfile;
  mediaItems: MediaItem[];
  onMediaClick: (item: MediaItem) => void;
  onProfileClick?: (talent: TalentProfile) => void;
  onSkillClick?: (skill: string) => void;
  priority?: boolean;
}

export default function FeaturedTalentCard({ talent, mediaItems, onMediaClick, onProfileClick, onSkillClick, priority = false }: FeaturedTalentCardProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const localePrefix = params?.locale ? `/${params.locale}` : '';
  const likeTargetId = (talent as any).profileId ?? (talent as any).userId ?? talent.id;
  const [isFeatured, setIsFeatured] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const previewRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const previewTimeouts = useRef<Record<string, number>>({});
  const [durations, setDurations] = useState<Record<string, number>>({});

  const formatTime = (seconds?: number) => {
    if (!seconds || Number.isNaN(seconds) || seconds <= 0) return '';
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    const m = Math.floor((seconds / 60) % 60).toString().padStart(2, '0');
    const h = Math.floor(seconds / 3600);
    if (h > 0) return `${h}:${m}:${s}`;
    return `${m}:${s}`;
  };

  const startPreview = (id: string) => {
    const v = previewRefs.current[id];
    if (!v) return;
    try {
      v.muted = true;
      const p = v.play();
      if (p && typeof (p as Promise<void>).catch === 'function') (p as Promise<void>).catch(() => {});
      if (previewTimeouts.current[id]) window.clearTimeout(previewTimeouts.current[id]);
      previewTimeouts.current[id] = window.setTimeout(() => {
        const vv = previewRefs.current[id];
        if (vv) {
          try { vv.pause(); vv.currentTime = 0; } catch {}
        }
        delete previewTimeouts.current[id];
      }, 3000);
      try { sendTelemetryEvent({ type: 'preview_start', mediaId: id, ts: new Date().toISOString() }); } catch {}
    } catch {}
  };

  const stopPreview = (id: string) => {
    if (previewTimeouts.current[id]) {
      window.clearTimeout(previewTimeouts.current[id]);
      delete previewTimeouts.current[id];
    }
    const v = previewRefs.current[id];
    if (v) {
      try { v.pause(); v.currentTime = 0; } catch {}
    }
    try { sendTelemetryEvent({ type: 'preview_stop', mediaId: id, ts: new Date().toISOString() }); } catch {}
  };

  const promptForAuth = () => {
    setShowAuthModal(true);
  };

  useEffect(() => {
    const timeoutsSnapshot = previewTimeouts.current;
    const refsSnapshot = previewRefs.current;
    return () => {
      try {
        Object.values(timeoutsSnapshot).forEach((t) => window.clearTimeout(t));
      } catch {}
      try {
        Object.keys(refsSnapshot).forEach((k) => {
          const v = refsSnapshot[k];
          if (v) try { v.pause(); } catch {}
        });
      } catch {}
    };
  }, []);

  useEffect(() => {
    if (!likeTargetId) return;

    let cancelled = false;

    const loadLikes = async () => {
      try {
        const res = await fetch(`/api/talent/${likeTargetId}/like`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setIsFeatured(Boolean(data?.isLiked));
      } catch {
        // Keep card interactive even if like endpoint is temporarily unavailable.
      }
    };

    loadLikes();
    return () => {
      cancelled = true;
    };
  }, [likeTargetId]);

  const handleToggleLike = async () => {
    if (likeLoading) return;
    if (!likeTargetId) return;

    const nextLiked = !isFeatured;
    const prevLiked = isFeatured;

    setIsFeatured(nextLiked);
    setLikeLoading(true);

    try {
      const res = await fetch(`/api/talent/${likeTargetId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ like: nextLiked }),
      });

      if (res.status === 401) {
        setIsFeatured(prevLiked);
        promptForAuth();
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to save like state');
      }

      const data = await res.json();
      setIsFeatured(Boolean(data?.isLiked));
    } catch {
      setIsFeatured(prevLiked);
    } finally {
      setLikeLoading(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return Ph.Play;
      case 'AUDIO': return Ph.MusicNotes || Ph.MusicNote;
      case 'IMAGE': return Ph.Image;
      default: return Ph.Play;
    }
  };

  const getThumbnail = (item: MediaItem) => {
    // For audio items, return undefined (use fallback instead)
    if (item.type.toUpperCase() === 'AUDIO') return undefined;
    
    // Safety check: if thumbnail looks like a video URL, ignore it and try to extract from URL
    if (item.thumbnail && !item.thumbnail.includes('youtube.com/watch') && !item.thumbnail.includes('youtu.be/') && !isAudioUrl(item.thumbnail)) {
        return item.thumbnail;
    }
    
    const type = item.type.toUpperCase();
    if (type === 'VIDEO') {
      const embedMatch = item.mediaUrl.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
      if (embedMatch && embedMatch[1]) return `https://img.youtube.com/vi/${embedMatch[1]}/hqdefault.jpg`;
      
      const watchMatch = item.mediaUrl.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
      if (watchMatch && watchMatch[1]) return `https://img.youtube.com/vi/${watchMatch[1]}/hqdefault.jpg`;

      const shortMatch = item.mediaUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
      if (shortMatch && shortMatch[1]) return `https://img.youtube.com/vi/${shortMatch[1]}/hqdefault.jpg`;

      // Return undefined if we can't extract a thumbnail from the video URL
      return undefined;
    }
    
    // Don't return audio URLs as thumbnails
    if (isAudioUrl(item.mediaUrl)) return undefined;
    
    return item.mediaUrl;
  };

  const categoryName = talent.category?.name?.trim() || 'Talent';
  const categoryUrl = `${localePrefix}/categories${talent.category?.name ? `?category=${encodeURIComponent(talent.category.name)}` : ''}`;

  const handleCategoryClick = () => {
    router.push(categoryUrl);
  };

  const CategoryIcon = getCategoryIconByName(talent.category?.name);
  return (
    <>
      <div className="hub-card group relative overflow-hidden rounded-2xl border border-blue-100/80 dark:border-red-900/55 bg-light-surface dark:bg-dark-surface shadow-[0_8px_28px_rgba(37,99,235,0.10)] dark:shadow-[0_12px_42px_rgba(0,0,0,0.55)] flex flex-col w-full max-w-xs box-border hover:-translate-y-1 hover:border-blue-300 dark:hover:border-red-700 hover:shadow-[0_12px_32px_rgba(37,99,235,0.18)] dark:hover:shadow-[0_12px_44px_rgba(127,29,29,0.50)] transition-all duration-200">

      {/* Media-first hero */}
      <div className="relative group/media bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 flex-none h-[320px] overflow-hidden">
        {/* Scroll container: make first item prominent */}
        <div
          ref={scrollContainerRef}
          className="h-full flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth p-4 items-stretch"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {mediaItems.map((item, index) => {
            const TypeIcon = getTypeIcon(item.type);
            const isVideo = item.type.toUpperCase() === 'VIDEO';
            const isYouTube = isVideo && (item.mediaUrl.includes('youtube.com') || item.mediaUrl.includes('youtu.be'));
            const thumbnail = getThumbnail(item);

            const itemWidthClass = index === 0 ? 'min-w-[62%]' : 'min-w-[28%]';

            return (
              <button
                key={item.id}
                onClick={() => onMediaClick(item)}
                onMouseEnter={() => { if (isVideo && !isYouTube) startPreview(item.id); }}
                onMouseLeave={() => { if (isVideo && !isYouTube) stopPreview(item.id); }}
                onFocus={() => { if (isVideo && !isYouTube) startPreview(item.id); }}
                onBlur={() => { if (isVideo && !isYouTube) stopPreview(item.id); }}
                className={`relative h-full ${itemWidthClass} flex-shrink-0 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 group transition-transform duration-200 hover:scale-105`}
              >
                {isVideo && !isYouTube ? (
                  <video
                    ref={(el) => { previewRefs.current[item.id] = el; }}
                    src={item.mediaUrl}
                    poster={item.thumbnail}
                    className="w-full h-full object-cover transition-transform duration-300"
                    muted
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={(e) => {
                      try {
                        const d = e.currentTarget.duration;
                        if (d && !Number.isNaN(d)) setDurations(prev => ({ ...prev, [item.id]: d }));
                      } catch {}
                    }}
                  />
                ) : thumbnail ? (
                  <Image
                    src={thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300"
                    sizes="(max-width: 768px) 33vw, 250px"
                    priority={priority && index < 3}
                  />
                ) : (
                   <MediaThumbnailFallback size="small" />
                )}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                {/* Play affordance on prominent item */}
                {index === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="rounded-full p-3 bg-black/35 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <Ph.Play className="w-7 h-7 text-white" />
                    </div>
                  </div>
                )}

                {/* Metadata overlay for primary item */}
                {index === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/75 to-transparent text-white">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                          {talent.avatarUrl ? (
                            <Image src={talent.avatarUrl} alt={talent.user.name} width={40} height={40} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">{item.title || talent.user.name}</div>
                          <div className="text-xs opacity-80 truncate">{talent.user.name} · {categoryName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs opacity-90">
                        {durations[item.id] ? (
                          <div className="duration-badge px-2 py-0.5 rounded text-[11px] font-semibold">{formatTime(durations[item.id])}</div>
                        ) : null}
                        {((item as any).views ?? 0) > 0 && (
                          <div className="text-xs opacity-80">{(item as any).views} views</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Small duration for thumbnails */}
                {durations[item.id] && index !== 0 ? (
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-[11px] px-2 rounded">{formatTime(durations[item.id])}</div>
                ) : null}

                <div className="absolute bottom-2 right-2 bg-black/60 rounded p-0.5">
                  <TypeIcon className="w-3 h-3 text-white" />
                </div>
              </button>
            );
          })}

          {mediaItems.length === 0 && (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm italic">No media available</div>
          )}
        </div>
      </div>

      {/* Compact header below hero */}
      <div className="relative p-4 flex items-center gap-3 border-b border-gray-100/80 dark:border-gray-800 box-border">
        <button
          onClick={() => {
            const profileImageItem: any = {
              id: `profile-${talent.id}`,
              title: `${talent.user.name}'s Profile Picture`,
              url: talent.avatarUrl || '',
              type: 'IMAGE',
              thumbnail: talent.avatarUrl,
              talentProfile: talent,
              createdAt: new Date().toISOString()
            };
            onMediaClick(profileImageItem);
          }}
          className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 ring-1 ring-primary-blue/10 dark:ring-accent-red/10 transition-all cursor-pointer hover:scale-105"
        >
          {talent.avatarUrl ? (
            <Image src={talent.avatarUrl} alt={talent.user.name} width={48} height={48} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400"><User className="w-5 h-5" /></div>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCategoryClick}
              aria-label={`Browse ${categoryName} talents`}
              className="text-left rounded-lg p-1 transition-all hover:bg-blue-50 dark:hover:bg-red-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-red-500"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-primary-blue to-indigo-500 dark:from-accent-red dark:to-red-800 text-white border border-white/20 shadow transition-shadow">
                  <CategoryIcon className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-bold truncate">{talent.user.name}</div>
                  <div className="text-xs opacity-80 truncate">{categoryName}</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleLike}
          aria-pressed={isFeatured}
          disabled={likeLoading}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <SwoopingTick size={20} hovered={isFeatured} variant="toggle" />
        </button>
      </div>

      {/* Skills Tags */}
      <div className="px-4 py-3 border-b border-gray-100/80 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 box-border">
        <div className="flex flex-wrap gap-1.5 items-start content-start">
          {(() => {
            const allSkills = talent.featuredSkills && talent.featuredSkills.length > 0 ? talent.featuredSkills : talent.skills || [];
            const MAX_SKILLS = 4;
            const displaySkills = allSkills.slice(0, MAX_SKILLS);
            const remaining = Math.max(0, allSkills.length - MAX_SKILLS);

            return (
              <>
                {displaySkills.map((skill, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); onSkillClick?.(skill); }}
                    className="max-w-[112px] truncate px-2.5 py-1 bg-primary-blue/10 dark:bg-accent-red/10 text-primary-blue dark:text-accent-red text-xs font-medium rounded-full border border-primary-blue/20 dark:border-accent-red/20 hover:bg-primary-blue/20 dark:hover:bg-accent-red/20 transition-colors"
                    title={skill}
                  >
                    {skill}
                  </button>
                ))}
                {remaining > 0 && (
                  <span className="px-2 py-1 text-xs font-semibold text-primary-blue dark:text-accent-red bg-primary-blue/20 dark:bg-accent-red/20 rounded-full">+{remaining}</span>
                )}
                {displaySkills.length === 0 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">No featured skills</span>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100/80 dark:border-gray-800 bg-light-surface dark:bg-dark-surface min-h-[64px] box-border mt-auto">
        <button
          onClick={() => {
            if (onProfileClick) return onProfileClick(talent as any);
            return router.push(`/talent/${(talent as any).profileId ?? (talent as any).userId ?? talent.id}`);
          }}
          className="block w-full py-2 text-primary-blue dark:text-accent-red text-center font-semibold rounded-lg hover:bg-primary-blue/5 dark:hover:bg-accent-red/10 transition-all text-sm border border-primary-blue/25 dark:border-accent-red/20 hover:border-primary-blue/40 dark:hover:border-accent-red/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue dark:focus-visible:ring-accent-red"
        >
          View Full Profile
        </button>
      </div>
    </div>

    <AuthRequiredModal
      isOpen={showAuthModal}
      onClose={() => setShowAuthModal(false)}
      title="Sign in required"
      message="You need an account to like talent profiles. Continue to sign in or create an account."
      action="like profiles"
    />
    </>
  );
}
