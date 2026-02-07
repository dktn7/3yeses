'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import {
  X,
  ChevronRight,
  Eye,
  User,
  Play,
  Search,
  MessageCircle,
  Share2,
  Heart
} from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import CommentsSection from './CommentsSection';
import SwoopingTick from './SwoopingTick';
import MediaThumbnailFallback from './MediaThumbnailFallback';
import FlagButton from './FlagButton';
import { ModeToggle } from './ThemeToggle';
import LanguageSwitcherModal from './LanguageSwitcherModal';
import { useAuth } from '@/contexts/AuthContext';

interface MediaItem {
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
    location?: string;
  };
  views: number;
  likes: number;
  isSponsored?: boolean;
  createdAt: string;
}

interface MediaOverlayProps {
  media: MediaItem;
  allMedia: MediaItem[];
  talents?: any[]; // Optional for now to avoid breaking other usages if any
  onClose: () => void;
  onMediaSelect: (item: MediaItem) => void;
}

export default function MediaOverlay({ media, allMedia, talents = [], onClose, onMediaSelect }: MediaOverlayProps) {
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuth();
  
  const [activeRightTab, setActiveRightTab] = useState<'recommended' | 'similar'>('recommended');
  const [playerFilter, setPlayerFilter] = useState<'all' | 'video' | 'audio' | 'image'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showLoginToast, setShowLoginToast] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  // Reset like state when media changes
  useEffect(() => {
    setIsLiked(false);
  }, [media.id]);

  const handleLike = () => {
    if (!user) {
      setShowLoginToast(true);
      setTimeout(() => setShowLoginToast(false), 3000);
      return;
    }
    setIsLiked(!isLiked);
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/hub/media/${media.id}`;
      await navigator.clipboard.writeText(shareUrl);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const talent = media.talentProfile;
  const likesCount = isLiked ? media.likes + 1 : media.likes;

  // Filter media based on current selection (Media)
  const filteredMedia = React.useMemo(() => {
    // If we don't have allMedia loaded yet, just return the current media
    if (!allMedia || allMedia.length === 0) return [media];

    return allMedia.filter(m => {
      if (m.talentProfile.id !== talent.id) return false;
      
      if (playerFilter !== 'all' && m.type.toLowerCase() !== playerFilter) return false;
      
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchDesc = m.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }
      
      return true;
    });
  }, [allMedia, talent.id, playerFilter, searchQuery, media]);

  // Recommended Videos (From other talents)
  const recommendedMedia = React.useMemo(() => {
    if (!allMedia) return [];
    return allMedia.filter(m => m.talentProfile.id !== talent.id).slice(0, 10);
  }, [allMedia, talent.id]);

  // Similar Talents - sorted by media count (most active first)
  const similarTalents = React.useMemo(() => {
    return talents
      .filter(t => t.id !== talent.id)
      .sort((a, b) => {
        // Sort by media count descending, then by name alphabetically
        const aMediaCount = a._count?.portfolioItems || a.portfolioItems?.length || 0;
        const bMediaCount = b._count?.portfolioItems || b.portfolioItems?.length || 0;
        if (bMediaCount !== aMediaCount) return bMediaCount - aMediaCount;
        return (a.user?.name || '').localeCompare(b.user?.name || '');
      });
  }, [talents, talent.id]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        navigate('prev');
      } else if (e.key === 'ArrowRight') {
        navigate('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredMedia, media.id]); 

  const navigate = (direction: 'prev' | 'next') => {
    if (filteredMedia.length <= 1) return;
    
    const currentIndex = filteredMedia.findIndex(m => m.id === media.id);
    if (currentIndex === -1) return; 

    let nextIndex;
    if (direction === 'prev') {
      nextIndex = (currentIndex - 1 + filteredMedia.length) % filteredMedia.length;
    } else {
      nextIndex = (currentIndex + 1) % filteredMedia.length;
    }
    
    // Use replace instead of push to avoid building up history stack
    onMediaSelect(filteredMedia[nextIndex]);
  };

  // Prevent body scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-gray-100 dark:bg-black flex animate-in fade-in duration-200">
      {/* Left Sidebar - Profile, Filters & Media List */}
      <div className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-300 dark:border-gray-800 flex-col overflow-hidden flex-shrink-0 transition-all duration-300 ${isTheaterMode ? 'w-0 opacity-0 border-none' : 'w-80 opacity-100 flex'}`}>
        {/* Header with Logo, Theme Toggle, Language & Close */}
        <div className="p-4 border-b border-gray-300 dark:border-gray-800 flex items-center justify-between">
          <span className="flex items-center gap-2 font-bold text-2xl text-blue-600 dark:text-red-500">
            3YESES
            <SwoopingTick size={32} />
          </span>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <LanguageSwitcherModal />
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-sm text-gray-900 dark:text-white rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-300 dark:border-gray-800">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 group-focus-within:text-primary-blue dark:group-focus-within:text-accent-red transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full pl-10 pr-8 py-2 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
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
              <div className="flex flex-col">
                {talent.category && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm capitalize truncate">{talent.category.name}</p>
                )}
                {talent.location && (
                  <p className="text-gray-500 dark:text-gray-500 text-xs truncate flex items-center gap-1 mt-0.5">
                    <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600" />
                    {talent.location}
                  </p>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push(`/${locale}/talent/${talent.id}`)}
            className="w-full px-3 py-2 bg-primary-blue dark:bg-accent-red text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
          >
            View Full Profile
          </button>
        </div>

        {/* Filter Media */}
        <div className="p-4 border-b border-gray-300 dark:border-gray-800">
          <h4 className="text-gray-500 dark:text-white/60 text-xs font-semibold uppercase tracking-wide mb-3">Filter Media</h4>
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
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Media Portfolio List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-4">
            <h4 className="text-gray-500 dark:text-white/60 text-xs font-semibold uppercase tracking-wide mb-3">
              {talent.user.name}'s Media
            </h4>
            <div className="space-y-2">
              {filteredMedia.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onMediaSelect(m)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                      m.id === media.id
                        ? 'bg-primary-blue/20 dark:bg-accent-red/20 ring-2 ring-primary-blue dark:ring-accent-red'
                        : 'hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                  >
                    <div className="relative w-20 h-14 rounded overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                      {m.type === 'VIDEO' || m.type === 'AUDIO' ? (
                        <>
                          {m.thumbnail ? (
                            <Image
                              src={m.thumbnail}
                              alt={m.title}
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
                      ) : (m.thumbnail || (m.type === 'IMAGE' && m.url)) ? (
                        <Image
                          src={m.thumbnail || m.url}
                          alt={m.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MediaThumbnailFallback />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-gray-900 dark:text-white text-sm font-medium line-clamp-2">{m.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-gray-500 dark:text-white/40 text-xs uppercase">{m.type}</span>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Center - Media Viewer */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto scrollbar-hide relative">
        {/* Close Button for Theater Mode */}
        {isTheaterMode && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Media Display */}
        <div className={`w-full bg-gray-200 dark:bg-black relative flex items-center justify-center transition-all duration-300 ${isTheaterMode ? 'p-0 min-h-screen' : media.type === 'AUDIO' ? 'p-2 flex-1' : 'p-6 flex-1'}`}>
          <div className="relative w-full h-full flex items-center justify-center max-w-7xl mx-auto">
               <div className={`bg-black overflow-hidden shadow-2xl transition-all duration-300 flex items-center justify-center ${
                 isTheaterMode 
                   ? 'h-full w-full rounded-none' 
                   : media.type === 'AUDIO'
                     ? 'w-full h-full max-w-[min(95vw,95vh)] rounded-lg'
                     : 'aspect-square w-full max-w-[min(90vw,90vh)] rounded-lg'
               }`}>
                 <VideoPlayer 
                   url={media.url} 
                   className="w-full h-full"
                   talentProfile={{
                     id: media.talentProfile.id,
                     name: media.talentProfile.user.name,
                     avatarUrl: media.talentProfile.avatarUrl
                   }}
                   showLogo={true}
                   relatedMedia={allMedia.filter(m => m.id !== media.id)}
                   onMediaSelect={onMediaSelect}
                   isTheaterMode={isTheaterMode}
                   onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
                   type={media.type}
                   thumbnail={media.thumbnail}
                 />
               </div>

            {/* Navigation Arrows - Small and subtle */}
            {filteredMedia.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('prev');
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white/70 hover:text-white rounded-full flex items-center justify-center transition-all z-20 group"
                  aria-label="Previous media"
                >
                  <ChevronRight className="w-5 h-5 rotate-180 group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('next');
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white/70 hover:text-white rounded-full flex items-center justify-center transition-all z-20 group"
                  aria-label="Next media"
                >
                  <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bottom Info Bar */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-300 dark:border-gray-800 p-4 flex-shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-gray-900 dark:text-white font-bold text-xl mb-2">{media.title}</h2>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 dark:text-gray-400 text-sm">{talent.user.name} • {talent.category?.name}</span>
              <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                <Eye className="w-4 h-4" />
                {formatNumber(media.views)} views
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 relative">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all font-medium text-sm ${
                isLiked 
                  ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-primary-blue dark:bg-accent-red text-white rounded-full hover:opacity-90 transition-opacity font-medium text-sm"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>

            <FlagButton 
              mediaId={media.id}
              contentType={media.type}
              talentName={talent.user.name}
            />
            
            {/* Copied Toast */}
            <div className={`absolute bottom-full right-0 mb-2 px-3 py-1 bg-black/80 text-white text-xs rounded shadow-lg transition-opacity duration-200 pointer-events-none whitespace-nowrap ${showCopiedToast ? 'opacity-100' : 'opacity-0'}`}>
              Link copied to clipboard!
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <CommentsSection mediaId={media.id} />
        </div>
      </div>

      {/* Right Sidebar - Recommended & Similar */}
      <div className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-300 dark:border-gray-800 flex-col overflow-hidden flex-shrink-0 hidden xl:flex transition-all duration-300 ${isTheaterMode ? 'w-0 opacity-0 border-none' : 'w-80 opacity-100'}`}>
        {/* Tabs */}
        <div className="flex border-b border-gray-300 dark:border-gray-800">
          <button
            onClick={() => setActiveRightTab('recommended')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeRightTab === 'recommended'
                ? 'text-primary-blue dark:text-accent-red border-b-2 border-primary-blue dark:border-accent-red bg-blue-50 dark:bg-red-900/10'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Recommended
          </button>
          <button
            onClick={() => setActiveRightTab('similar')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeRightTab === 'similar'
                ? 'text-primary-blue dark:text-accent-red border-b-2 border-primary-blue dark:border-accent-red bg-blue-50 dark:bg-red-900/10'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Similar Talent
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-2">
          {activeRightTab === 'recommended' ? (
            <div className="space-y-2">
              {recommendedMedia.slice(0, 20).map((m) => (
                <button
                  key={m.id}
                  onClick={() => onMediaSelect(m)}
                  className="w-full group flex gap-3 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg p-2 transition-all"
                >
                  <div className="relative w-32 aspect-video rounded overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                    {m.thumbnail || (m.type === 'IMAGE' ? m.url : undefined) ? (
                      <Image
                        src={m.thumbnail || (m.type === 'IMAGE' ? m.url : '')}
                        alt={m.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <MediaThumbnailFallback />
                    )}
                    {(m.type === 'VIDEO' || m.type === 'AUDIO') && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="w-6 h-6 text-white" fill="currentColor" />
                      </div>
                    )}
                    <div className="absolute top-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded uppercase">
                      {m.type}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-gray-900 dark:text-white text-sm font-medium line-clamp-2 group-hover:text-primary-blue dark:group-hover:text-accent-red transition-colors">
                      {m.title}
                    </p>
                    <p className="text-gray-600 dark:text-white/60 text-xs truncate mt-1">{m.talentProfile.user.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-gray-500 dark:text-white/40 text-xs">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatNumber(m.views)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {similarTalents.slice(0, 10).map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    const firstMedia = allMedia.find(m => m.talentProfile.id === t.id);
                    if (firstMedia) onMediaSelect(firstMedia);
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {t.avatarUrl ? (
                      <Image src={t.avatarUrl} alt={t.user.name} width={40} height={40} className="object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{t.category?.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
