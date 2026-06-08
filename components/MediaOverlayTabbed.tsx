'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import {
  X,
  ChevronRight,
  Eye,
  User,
  Play,
  Search,
  Grid,
  List,
  Share2,
  Wrench,
  Flag
} from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import CommentsSection from './CommentsSection';
import SwoopingTick from './SwoopingTick';
import MediaThumbnailFallback from './MediaThumbnailFallback';
import AuthRequiredModal from './AuthRequiredModal';
import { useAuthRequired } from '@/hooks/useAuthRequired';
import { useAuth } from '@/contexts/AuthContext';

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
    location?: string;
  };
  views: number;
  likeCount: number;
  isSponsored?: boolean;
  createdAt: string;
}

interface MediaOverlayTabbedProps {
  media: MediaItem;
  allMedia: MediaItem[];
  talents: any[]; // Pass the list of talents for the "Similar Talent" tab
  onClose: () => void;
  onMediaSelect: (item: MediaItem) => void;
}

export default function MediaOverlayTabbed({ media, allMedia, talents, onClose, onMediaSelect }: MediaOverlayTabbedProps) {
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuth();
  const { showAuthModal, openAuthModal, closeAuthModal } = useAuthRequired();
  
  const [activeTab, setActiveTab] = useState<'portfolio' | 'similar'>('portfolio');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(media.likeCount);
  const [showLoginToast, setShowLoginToast] = useState(false);
  const viewedItemsRef = useRef<Set<string>>(new Set());

  // Fetch like status and track view when media changes
  useEffect(() => {
    setIsLiked(false);
    setLikesCount(media.likeCount);

    const talentId = (media.talentProfile as any).userId ?? media.talentProfile.id;

    // Fetch like status
    fetch(`/api/talent/${talentId}/like`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setIsLiked(data.isLiked);
          setLikesCount(data.likeCount);
        }
      })
      .catch(() => {});

    // Track view (deduplicated per session)
    if (!viewedItemsRef.current.has(media.id)) {
      viewedItemsRef.current.add(media.id);
      fetch('/api/analytics/portfolio-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioItemId: media.id }),
      }).catch(() => {});
    }
  }, [media.id, media.likeCount, media.talentProfile]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const talent = media.talentProfile;
  const talentUserId = ((talent as any).userId ?? talent.id) as string;

  // Filter media for the current talent's portfolio
  const portfolioMedia = React.useMemo(() => {
    return allMedia.filter(m => ((m.talentProfile as any).userId ?? m.talentProfile.id) === ((talent as any).userId ?? talent.id));
  }, [allMedia, talent]);

  // Filter similar talents (excluding current)
  const similarTalents = React.useMemo(() => {
    return talents.filter(t => ((t as any).userId ?? t.id) !== ((talent as any).userId ?? talent.id));
  }, [talents, talent]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleLike = async () => {
    if (!user) {
      openAuthModal();
      return;
    }

    const newLiked = !isLiked;
    // Optimistic update
    setIsLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

    try {
      const talentId = (media.talentProfile as any).userId ?? media.talentProfile.id;
      const res = await fetch(`/api/talent/${talentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ like: newLiked }),
      });
      if (!res.ok) throw new Error('Like failed');
      const data = await res.json();
      setLikesCount(data.likeCount);
    } catch {
      // Revert on failure
      setIsLiked(!newLiked);
      setLikesCount(prev => newLiked ? prev - 1 : prev + 1);
    }
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

  return (
    <div className="fixed inset-0 z-[100] bg-gray-100 dark:bg-black flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-black relative overflow-y-auto scrollbar-hide">
        <div className="w-full min-h-full flex flex-col">
          {/* Media Container */}
          <div className="w-full bg-black flex items-center justify-center" style={{ minHeight: '60vh' }}>
            {media.type === 'VIDEO' ? (
               <div className="w-full max-w-6xl aspect-video">
                 <VideoPlayer 
                   url={media.mediaUrl} 
                   className="w-full h-full"
                   talentProfile={{
                     id: (media.talentProfile as any).userId ?? media.talentProfile.id,
                     name: media.talentProfile.user.name,
                     avatarUrl: media.talentProfile.avatarUrl
                   }}
                   showLogo={true}
                   relatedMedia={allMedia.filter(m => m.id !== media.id && m.type === 'VIDEO')}
                   onMediaSelect={onMediaSelect}
                 />
               </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-4">
                {media.thumbnail || media.mediaUrl ? (
                  <Image
                    src={media.thumbnail || media.mediaUrl}
                    alt={media.title}
                    width={1600}
                    height={1200}
                    className="max-w-full max-h-[80vh] object-contain"
                  />
                ) : (
                  <MediaThumbnailFallback size="large" />
                )}
              </div>
            )}
          </div>

          {/* Info & Comments Section */}
          <div className="flex-1 bg-light-surface dark:bg-dark-surface">
            <div className="max-w-6xl mx-auto p-6">
              <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{media.title}</h1>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">{media.talentProfile.user.name}</span>
                    <span>•</span>
                    <span>{media.talentProfile.category?.name || 'General'}</span>
                    <span>•</span>
                    <span>0 views</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all font-medium shadow-lg relative ${
                      isLiked 
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-red-500/10' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <SwoopingTick size={16} hovered={isLiked} />
                    {isLiked ? 'Saved' : 'Save'}
                    {showLoginToast && (
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black text-white text-xs rounded-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-1 z-50 shadow-xl">
                        Sign in to like
                      </div>
                    )}
                  </button>
                  <button 
                    onClick={handleShare}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-blue dark:bg-accent-red text-white rounded-full hover:opacity-90 transition-opacity font-medium shadow-lg shadow-blue-500/20 dark:shadow-red-500/20 relative"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                    {showCopiedToast && (
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black text-white text-xs rounded-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-1 z-50 shadow-xl">
                        Link Copied!
                      </div>
                    )}
                  </button>
                </div>
              </div>

              <CommentsSection mediaId={media.id} mediaOwnerId={talentUserId} />
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Tabbed Interface */}
      <div className="w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-300 dark:border-gray-800 flex flex-col overflow-hidden flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-300 dark:border-gray-800 flex items-center justify-between">
          <span className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-red-500">
            3YESES
            <SwoopingTick size={24} />
          </span>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
        </div>

        {/* Talent Profile Header */}
        <div className="p-4 border-b border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
              {talent.avatarUrl ? (
                <Image src={talent.avatarUrl} alt={talent.user.name} width={48} height={48} className="object-cover" />
              ) : (
                <User className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900 dark:text-white font-semibold truncate">{talent.user.name}</h3>
              <p className="text-gray-500 text-xs">{talent.category?.name}</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/talent/${talentUserId}`)}
            className="w-full py-1.5 bg-primary-blue dark:bg-accent-red text-white text-xs font-medium rounded hover:opacity-90 transition-opacity"
          >
            View Full Profile
          </button>

          {user?.role === 'admin' && (
            <div className="mt-2 flex flex-col gap-1">
              <button
                onClick={() => router.push(`/admin/users/${talentUserId}`)}
                className="w-full py-1.5 text-[11px] font-medium rounded border border-gray-200 dark:border-gray-700 bg-light-surface dark:bg-dark-surface text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center gap-1"
              >
                <Wrench className="w-3 h-3" />
                Admin: User
              </button>
              <button
                onClick={() => router.push(`/admin/reports?userId=${encodeURIComponent(talentUserId)}`)}
                className="w-full py-1.5 text-[11px] font-medium rounded border border-gray-200 dark:border-gray-700 bg-light-surface dark:bg-dark-surface text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center gap-1"
              >
                <Flag className="w-3 h-3" />
                Admin: Reports
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-300 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'portfolio'
                ? 'text-primary-blue dark:text-accent-red border-b-2 border-primary-blue dark:border-accent-red bg-blue-50 dark:bg-red-900/10'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Grid className="w-4 h-4" />
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab('similar')}
            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'similar'
                ? 'text-primary-blue dark:text-accent-red border-b-2 border-primary-blue dark:border-accent-red bg-blue-50 dark:bg-red-900/10'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <List className="w-4 h-4" />
            Similar Talent
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-2">
          {activeTab === 'portfolio' ? (
            <div className="space-y-2">
              {portfolioMedia.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onMediaSelect(m)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                    m.id === media.id
                      ? 'bg-primary-blue/10 dark:bg-accent-red/10 ring-1 ring-primary-blue dark:ring-accent-red'
                      : 'hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="relative w-16 h-10 rounded overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                    {m.thumbnail ? (
                      <Image src={m.thumbnail} alt={m.title} fill sizes="64px" className="object-cover" />
                    ) : (
                      <MediaThumbnailFallback />
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2 text-left">{m.title}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {similarTalents.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    // Find first media of this talent to play
                    const firstMedia = allMedia.find(m => ((m.talentProfile as any).userId ?? m.talentProfile.id) === ((t as any).userId ?? t.id));
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
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t.user.name}</p>
                    <p className="text-xs text-gray-500">{t.location || 'No location'}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions - Removed as moved to main content */}
        {/* <div className="p-4 border-t border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-white/5">
          ...
        </div> */}
      </div>

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        title="Sign in to like"
        message="You need an account to like media. Continue to sign in or create an account."
        action="like media"
      />
    </div>
  );
}
