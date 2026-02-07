'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import MediaThumbnailFallback from './MediaThumbnailFallback';

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

interface MediaOverlayTikTokProps {
  media: MediaItem;
  allMedia: MediaItem[];
  onClose: () => void;
  onMediaSelect: (item: MediaItem) => void;
}

export default function MediaOverlayTikTok({ media, allMedia, onClose, onMediaSelect }: MediaOverlayTikTokProps) {
  const router = useRouter();

  // Find next/prev media
  const currentIndex = allMedia.findIndex(m => m.id === media.id);
  
  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % allMedia.length;
    onMediaSelect(allMedia[nextIndex]);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + allMedia.length) % allMedia.length;
    onMediaSelect(allMedia[prevIndex]);
  };

  // Keyboard nav
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') handleNext();
      if (e.key === 'ArrowUp') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [media.id]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-in fade-in duration-200">
      <button 
        onClick={onClose}
        className="absolute top-6 left-6 z-50 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Container - Mobile Aspect Ratio on Desktop */}
      <div className="relative w-full h-full md:w-[450px] md:h-[800px] bg-black md:rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        
        {/* Video Layer */}
        <div className="absolute inset-0 bg-gray-900">
            {media.type === 'VIDEO' ? (
                 <VideoPlayer 
                   url={media.url} 
                   className="w-full h-full object-cover"
                   talentProfile={{
                     id: media.talentProfile.id,
                     name: media.talentProfile.user.name,
                     avatarUrl: media.talentProfile.avatarUrl
                   }}
                   showLogo={true}
                 />
            ) : (
              media.thumbnail || media.url ? (
                <Image
                  src={media.thumbnail || media.url}
                  alt={media.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <MediaThumbnailFallback />
              )
            )}
        </div>

        {/* Overlay UI Layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

        {/* Right Actions Sidebar */}
        <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6 z-20">
          <div className="relative group">
            <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
               <Image 
                 src={media.talentProfile.avatarUrl || '/logo.svg'} 
                 alt="Avatar" 
                 width={48} 
                 height={48} 
                 className="object-cover"
               />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 rounded-full p-0.5">
              <UserPlus className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-sm transition-colors pointer-events-auto">
              <Heart className="w-8 h-8 text-white fill-white/20" />
            </button>
            <span className="text-white text-xs font-bold">{media.likes}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-sm transition-colors pointer-events-auto">
              <MessageCircle className="w-8 h-8 text-white fill-white/20" />
            </button>
            <span className="text-white text-xs font-bold">124</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-sm transition-colors pointer-events-auto">
              <Share2 className="w-8 h-8 text-white fill-white/20" />
            </button>
            <span className="text-white text-xs font-bold">Share</span>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute left-4 bottom-6 right-16 z-20 text-left">
          <h3 className="text-white font-bold text-lg mb-1">@{media.talentProfile.user.name}</h3>
          <p className="text-white/90 text-sm line-clamp-2 mb-2">{media.title} - {media.description || 'Check out my latest work!'}</p>
          <div className="flex items-center gap-2 text-white/60 text-xs">
             <span className="px-2 py-1 bg-white/10 rounded-full backdrop-blur-sm">
               {media.talentProfile.category?.name || 'Talent'}
             </span>
          </div>
        </div>

        {/* Navigation Buttons (Simulating Scroll) */}
        <button 
          onClick={handlePrev}
          className="absolute top-1/2 right-4 -translate-y-[60px] p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/50 hover:text-white transition-all pointer-events-auto"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <button 
          onClick={handleNext}
          className="absolute top-1/2 right-4 translate-y-[60px] p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/50 hover:text-white transition-all pointer-events-auto"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
}
