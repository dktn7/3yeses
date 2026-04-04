'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  X,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import MediaThumbnailFallback from './MediaThumbnailFallback';

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

interface MediaOverlayInstagramProps {
  media: MediaItem;
  allMedia: MediaItem[];
  talents: any[];
  onClose: () => void;
  onMediaSelect: (item: MediaItem) => void;
}

export default function MediaOverlayInstagram({ media, allMedia, talents, onClose, onMediaSelect }: MediaOverlayInstagramProps) {
  const router = useRouter();

  // Get unique talents for the top bar
  const uniqueTalents = React.useMemo(() => {
    return talents.slice(0, 15); // Limit to 15 for the top bar
  }, [talents]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col animate-in fade-in duration-200">
      
      {/* Top Bar - Stories Style */}
      <div className="h-24 bg-black border-b border-white/10 flex items-center px-4 gap-4 overflow-x-auto scrollbar-hide flex-shrink-0">
          {uniqueTalents.map((t) => {
          const isActive = ((t as any).userId ?? t.id) === ((media.talentProfile as any).userId ?? media.talentProfile.id);
          return (
            <button 
              key={t.id}
              onClick={() => {
                 const firstMedia = allMedia.find(m => ((m.talentProfile as any).userId ?? m.talentProfile.id) === ((t as any).userId ?? t.id));
                 if (firstMedia) onMediaSelect(firstMedia);
              }}
              className="flex flex-col items-center gap-1 min-w-[70px]"
            >
              <div className={`w-14 h-14 rounded-full p-[2px] ${isActive ? 'bg-gradient-to-tr from-yellow-400 to-purple-600' : 'bg-gray-700'}`}>
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-black">
                  <Image 
                    src={t.avatarUrl || '/logo.svg'} 
                    alt={t.user.name} 
                    width={56} 
                    height={56} 
                    className="object-cover"
                  />
                </div>
              </div>
              <span className={`text-[10px] truncate w-full text-center ${isActive ? 'text-white font-bold' : 'text-gray-400'}`}>
                {t.user.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center relative p-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 z-50">
          <X className="w-8 h-8" />
        </button>

        {/* Post Container */}
        <div className="flex w-full max-w-6xl h-[80vh] bg-black border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          
          {/* Left: Media */}
          <div className="flex-1 bg-gray-900 relative flex items-center justify-center">
             {media.type === 'VIDEO' ? (
                 <VideoPlayer 
                   url={media.mediaUrl} 
                   className="w-full h-full"
                   talentProfile={{
                     id: (media.talentProfile as any).userId ?? media.talentProfile.id,
                     name: media.talentProfile.user.name,
                     avatarUrl: media.talentProfile.avatarUrl
                   }}
                   showLogo={true}
                 />
            ) : (
              media.thumbnail || media.mediaUrl ? (
                <Image
                  src={media.thumbnail || media.mediaUrl}
                  alt={media.title}
                  fill
                  className="object-contain"
                />
              ) : (
                <MediaThumbnailFallback />
              )
            )}
          </div>

          {/* Right: Comments/Details Sidebar */}
          <div className="w-[400px] bg-white dark:bg-black border-l border-gray-200 dark:border-white/10 flex flex-col hidden lg:flex">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                  <Image src={media.talentProfile.avatarUrl || '/logo.svg'} alt="Avatar" width={32} height={32} />
                </div>
                <span className="font-bold text-sm text-gray-900 dark:text-white">{media.talentProfile.user.name}</span>
                <span className="text-blue-500 text-xs font-semibold">• Follow</span>
              </div>
              <MoreHorizontal className="w-5 h-5 text-gray-500" />
            </div>

            {/* Comments Area (Placeholder) */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                   <Image src={media.talentProfile.avatarUrl || '/logo.svg'} alt="Avatar" width={32} height={32} />
                </div>
                <div className="text-sm">
                  <span className="font-bold mr-2 text-gray-900 dark:text-white">{media.talentProfile.user.name}</span>
                  <span className="text-gray-700 dark:text-gray-300">{media.title}</span>
                  <p className="text-gray-500 text-xs mt-1">2h ago</p>
                </div>
              </div>
              {/* Fake comments */}
              <div className="flex gap-3 mb-4">
                 <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">JD</div>
                 <div className="text-sm">
                    <span className="font-bold mr-2 text-gray-900 dark:text-white">John Doe</span>
                    <span className="text-gray-700 dark:text-gray-300">This is amazing talent! 🔥</span>
                 </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-white/10">
              <div className="flex justify-between mb-4">
                <div className="flex gap-4">
                  <Heart className="w-6 h-6 text-gray-900 dark:text-white hover:text-red-500 cursor-pointer" />
                  <MessageCircle className="w-6 h-6 text-gray-900 dark:text-white hover:text-gray-500 cursor-pointer" />
                  <Send className="w-6 h-6 text-gray-900 dark:text-white hover:text-gray-500 cursor-pointer" />
                </div>
                <Bookmark className="w-6 h-6 text-gray-900 dark:text-white hover:text-gray-500 cursor-pointer" />
              </div>
              <p className="font-bold text-sm mb-1 text-gray-900 dark:text-white">{media.likeCount} likes</p>
              <p className="text-xs text-gray-500 uppercase">DECEMBER 8</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
