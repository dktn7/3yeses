'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import {
  X,
  ChevronRight,
  Eye,
  Heart,
  User,
  Play,
  Search,
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import MediaThumbnailFallback from '@/components/MediaThumbnailFallback';
import { buildLocalizedPath } from '@/lib/locale-path';

interface MediaItem {
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
      name: string;
    };
  };
  views: number;
  likes: number;
  isSponsored?: boolean;
  createdAt: string;
}

export default function MediaViewerPage() {
  const t = useTranslations('HubMediaPage');
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const mediaId = params.id as string;

  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playerFilter, setPlayerFilter] = useState<'all' | 'video' | 'audio' | 'image'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch media data
  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/hub/portfolio?includeBio=true');
        const fetched: MediaItem[] = await res.json();
        setAllMedia(fetched);
        
        // Find current media
        const idx = fetched.findIndex(i => i.id === mediaId);
        if (idx !== -1) {
          setCurrentMediaIndex(idx);
          setCurrentMedia(fetched[idx]);
        } else {
          // Media not found
          router.push(buildLocalizedPath(locale, '/hub'));
        }
      } catch (e) {
        console.error('Failed to fetch media', e);
        router.push(buildLocalizedPath(locale, '/hub'));
      } finally {
        setLoading(false);
      }
    };
    
    if (mediaId) {
      fetchMedia();
    }
  }, [mediaId, locale, router]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading || !currentMedia) {
    return (
      <div className="min-h-screen bg-gray-900 dark:bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const talent = currentMedia.talentProfile;

  return (
    <div className="fixed inset-0 z-[100] bg-gray-100 dark:bg-black flex">
      {/* Left Sidebar - Profile, Filters & Media List */}
      <div className="w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-300 dark:border-gray-800 flex flex-col overflow-hidden">
        {/* Header with Logo & Close */}
        <div className="p-4 border-b border-gray-300 dark:border-gray-800 flex items-center justify-between">
          <Link href={buildLocalizedPath(locale, '/hub')} className="font-bold text-2xl text-blue-600 dark:text-red-500 hover:opacity-80 transition-opacity">
            3YESES
          </Link>
          <button
            onClick={() => router.push(buildLocalizedPath(locale, '/hub'))}
            className="w-10 h-10 bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-sm text-gray-900 dark:text-white rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-300 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-3 py-2 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
            />
          </div>
        </div>

        {/* Talent Profile Info */}
        <div className="p-4 border-b border-gray-300 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
              {talent.avatarUrl ? (
                <Image
                  src={talent.avatarUrl}
                  alt={talent.user.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900 dark:text-white font-semibold truncate">{talent.user.name}</h3>
              {talent.category && (
                <p className="text-gray-600 dark:text-gray-400 text-sm capitalize truncate">{talent.category.name}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => router.push(`/talent/${(talent as any).userId ?? talent.id}`)}
            className="w-full px-3 py-2 bg-primary-blue dark:bg-accent-red text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
          >
            {t('viewFullProfile')}
          </button>
        </div>

        {/* Filter Media */}
        <div className="p-4 border-b border-gray-300 dark:border-gray-800">
          <h4 className="text-gray-500 dark:text-white/60 text-xs font-semibold uppercase tracking-wide mb-3">{t('filterMedia')}</h4>
          <div className="flex flex-wrap gap-2">
            {['all', 'video', 'audio', 'image'].map((filter) => (
              <button
                key={filter}
                onClick={() => setPlayerFilter(filter as any)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                  playerFilter === filter
                    ? 'bg-primary-blue dark:bg-accent-red text-white'
                    : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white/60 hover:bg-gray-300 dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {t(`filters.${filter}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Media Portfolio List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-4">
            <h4 className="text-gray-500 dark:text-white/60 text-xs font-semibold uppercase tracking-wide mb-3">
              {t('portfolioTitle', { name: talent.user.name })}
            </h4>
            <div className="space-y-2">
              {allMedia
                .filter(media => {
                  if (((media.talentProfile as any).userId ?? media.talentProfile.id) !== ((talent as any).userId ?? talent.id)) return false;
                  if (playerFilter !== 'all' && media.type.toLowerCase() !== playerFilter) return false;
                  if (searchQuery && !media.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                  return true;
                })
                .map((media) => (
                  <button
                    key={media.id}
                    onClick={() => {
                      if (media.type === 'IMAGE') {
                        router.push(buildLocalizedPath(locale, `/hub/media/${media.id}`));
                      } else {
                        // For video/audio, go back to hub with player open
                        router.push(buildLocalizedPath(locale, '/hub'));
                      }
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                      media.id === currentMedia.id
                        ? 'bg-primary-blue/20 dark:bg-accent-red/20 ring-2 ring-primary-blue dark:ring-accent-red'
                        : 'hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                  >
                    <div className="relative w-20 h-14 rounded overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                      {media.type === 'VIDEO' || media.type === 'AUDIO' ? (
                        <>
                          {media.thumbnail ? (
                            <Image
                              src={media.thumbnail}
                              alt={media.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <MediaThumbnailFallback />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="w-5 h-5 text-white" fill="currentColor" />
                          </div>
                        </>
                      ) : media.thumbnail || media.mediaUrl ? (
                        <Image
                          src={media.thumbnail || media.mediaUrl}
                          alt={media.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <MediaThumbnailFallback />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-gray-900 dark:text-white text-sm font-medium line-clamp-2">{media.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-gray-500 dark:text-white/40 text-xs uppercase">{media.type}</span>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Center - Image Viewer */}
      <div className="flex-1 flex flex-col">
        {/* Image Display */}
        <div className="flex-1 flex items-center justify-center bg-gray-200 dark:bg-black p-6">
          <div className="relative w-full h-full flex items-center justify-center">
            {currentMedia.thumbnail || currentMedia.mediaUrl ? (
              <Image
                src={currentMedia.thumbnail || currentMedia.mediaUrl}
                alt={currentMedia.title}
                width={1600}
                height={1200}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <MediaThumbnailFallback size="large" />
            )}

            {/* Navigation Arrows */}
            {allMedia.filter(m => ((m.talentProfile as any).userId ?? m.talentProfile.id) === ((talent as any).userId ?? talent.id) && m.type === 'IMAGE').length > 1 && (
              <>
                <button
                  onClick={() => {
                    const imageMedia = allMedia.filter(m => ((m.talentProfile as any).userId ?? m.talentProfile.id) === ((talent as any).userId ?? talent.id) && m.type === 'IMAGE');
                    const currentIdx = imageMedia.findIndex(m => m.id === currentMedia.id);
                    const prevIdx = (currentIdx - 1 + imageMedia.length) % imageMedia.length;
                    router.push(buildLocalizedPath(locale, `/hub/media/${imageMedia[prevIdx].id}`));
                  }}
                  className="absolute left-4 w-12 h-12 bg-white/90 hover:bg-light-surface dark:bg-black/50 dark:hover:bg-black/70 backdrop-blur-sm text-gray-900 dark:text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                >
                  <ChevronRight className="w-6 h-6 rotate-180" />
                </button>
                <button
                  onClick={() => {
                    const imageMedia = allMedia.filter(m => ((m.talentProfile as any).userId ?? m.talentProfile.id) === ((talent as any).userId ?? talent.id) && m.type === 'IMAGE');
                    const currentIdx = imageMedia.findIndex(m => m.id === currentMedia.id);
                    const nextIdx = (currentIdx + 1) % imageMedia.length;
                    router.push(buildLocalizedPath(locale, `/hub/media/${imageMedia[nextIdx].id}`));
                  }}
                  className="absolute right-4 w-12 h-12 bg-white/90 hover:bg-light-surface dark:bg-black/50 dark:hover:bg-black/70 backdrop-blur-sm text-gray-900 dark:text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bottom Info Bar */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-300 dark:border-gray-800 p-4">
          <h2 className="text-gray-900 dark:text-white font-bold text-xl mb-2">{currentMedia.title}</h2>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-gray-400 text-sm">{talent.user.name} • {talent.category?.name}</span>
            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
              <Eye className="w-4 h-4" />
              {t('views', { count: formatNumber(currentMedia.views) })}
            </span>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Recommended */}
      <div className="w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-300 dark:border-gray-800 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-300 dark:border-gray-800">
          <h4 className="text-gray-900 dark:text-white font-semibold text-sm">Recommended</h4>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
          <div className="space-y-3">
            {allMedia
              .filter(media => {
                if (media.id === currentMedia.id) return false;
                if (playerFilter !== 'all' && media.type.toLowerCase() !== playerFilter) return false;
                if (searchQuery && !media.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                return true;
              })
              .slice(0, 20)
              .map((media) => (
                <button
                  key={media.id}
                  onClick={() => {
                    if (media.type === 'IMAGE') {
                      router.push(buildLocalizedPath(locale, `/hub/media/${media.id}`));
                    } else {
                      router.push(buildLocalizedPath(locale, '/hub'));
                    }
                  }}
                  className="w-full group flex gap-3 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg p-2 transition-all"
                >
                  <div className="relative w-32 aspect-video rounded overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                    {media.thumbnail ? (
                      <Image
                        src={media.thumbnail}
                        alt={media.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <MediaThumbnailFallback />
                    )}
                    {(media.type === 'VIDEO' || media.type === 'AUDIO') && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="w-6 h-6 text-white" fill="currentColor" />
                      </div>
                    )}
                    <div className="absolute top-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded uppercase">
                      {media.type}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-gray-900 dark:text-white text-sm font-medium line-clamp-2 group-hover:text-primary-blue dark:group-hover:text-accent-red transition-colors">
                      {media.title}
                    </p>
                    <p className="text-gray-600 dark:text-white/60 text-xs truncate mt-1">{media.talentProfile.user.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-gray-500 dark:text-white/40 text-xs">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatNumber(media.views)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
