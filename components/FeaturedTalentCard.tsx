'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, User, Play, Music, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import SwoopingTick from './SwoopingTick';
import { isAudioUrl, shouldBeUnoptimized } from '@/lib/image-utils';
import MediaThumbnailFallback from './MediaThumbnailFallback';

interface MediaItem {
  id: string;
  title: string;
  url: string;
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
      case 'VIDEO': return Play;
      case 'AUDIO': return Music;
      case 'IMAGE': return ImageIcon;
      default: return Play;
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
      const embedMatch = item.url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
      if (embedMatch && embedMatch[1]) return `https://img.youtube.com/vi/${embedMatch[1]}/hqdefault.jpg`;
      
      const watchMatch = item.url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
      if (watchMatch && watchMatch[1]) return `https://img.youtube.com/vi/${watchMatch[1]}/hqdefault.jpg`;

      const shortMatch = item.url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
      if (shortMatch && shortMatch[1]) return `https://img.youtube.com/vi/${shortMatch[1]}/hqdefault.jpg`;

      // Return undefined if we can't extract a thumbnail from the video URL
      return undefined;
    }
    
    // Don't return audio URLs as thumbnails
    if (isAudioUrl(item.url)) return undefined;
    
    return item.url;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-100 dark:border-gray-700 flex flex-col w-full aspect-[4/5] hover:scale-[1.02] transition-transform duration-300">
      {/* Header */}
      <div className="p-5 flex items-center gap-4 border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={() => {
            // Create a synthetic media item for the profile picture with full talent profile data
            const profileImageItem: any = {
              id: `profile-${talent.id}`,
              title: `${talent.user.name}'s Profile Picture`,
              url: talent.avatarUrl || '',
              type: 'IMAGE',
              thumbnail: talent.avatarUrl,
              description: `Profile picture of ${talent.user.name}`,
              talentProfile: talent,
              views: 0,
              likes: 0,
              isSponsored: false,
              createdAt: new Date().toISOString()
            };
            onMediaClick(profileImageItem);
          }}
          className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 ring-2 ring-primary-blue/20 dark:ring-accent-red/20 hover:ring-4 hover:ring-primary-blue/40 dark:hover:ring-accent-red/40 transition-all cursor-pointer hover:scale-110"
        >
          {talent.avatarUrl ? (
            <Image
              src={talent.avatarUrl}
              alt={talent.user.name}
              width={56}
              height={56}
              className="w-full h-full object-cover"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <User className="w-7 h-7" />
            </div>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">
            {talent.user.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize truncate">
            {talent.category?.name || 'Talent'}
          </p>
        </div>
        <button className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      {/* Skills Tags - Use featuredSkills if available, otherwise first 4 skills */}
      {(() => {
        const displaySkills = talent.featuredSkills && talent.featuredSkills.length > 0 
          ? talent.featuredSkills.slice(0, 4) 
          : (talent.skills || []).slice(0, 4);
        return displaySkills.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
            <div className="flex flex-wrap gap-1.5">
              {displaySkills.map((skill, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSkillClick?.(skill);
                  }}
                  className="px-2 py-1 bg-primary-blue/10 dark:bg-accent-red/10 text-primary-blue dark:text-accent-red text-xs font-medium rounded-full border border-primary-blue/20 dark:border-accent-red/20 hover:bg-primary-blue/20 dark:hover:bg-accent-red/20 transition-colors"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Media Carousel */}
      <div className="relative group/carousel bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 flex-1 overflow-hidden">
        {/* Left Arrow */}
        <button 
          onClick={(e) => { e.preventDefault(); scroll('left'); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scroll Container */}
        <div 
          ref={scrollContainerRef}
          className="h-full flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth p-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {mediaItems.map((item, index) => {
            const TypeIcon = getTypeIcon(item.type);
            const isVideo = item.type.toUpperCase() === 'VIDEO';
            const isYouTube = isVideo && (item.url.includes('youtube.com') || item.url.includes('youtu.be'));
            const thumbnail = getThumbnail(item);

            return (
              <button
                key={item.id}
                onClick={() => onMediaClick(item)}
                className="relative h-full aspect-square flex-shrink-0 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 group hover:ring-2 ring-primary-blue dark:ring-accent-red transition-all hover:scale-105"
              >
                {isVideo && !isYouTube ? (
                  <video
                    src={item.url}
                    poster={item.thumbnail}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : thumbnail ? (
                  <Image
                    src={thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 33vw, 250px"
                    priority={priority && index < 3}
                  />
                ) : (
                   <MediaThumbnailFallback size="small" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-1 right-1 bg-black/60 rounded p-0.5">
                  <TypeIcon className="w-3 h-3 text-white" />
                </div>
              </button>
            );
          })}
          {mediaItems.length === 0 && (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm italic">
              No media available
            </div>
          )}
        </div>

        {/* Right Arrow */}
        <button 
          onClick={(e) => { e.preventDefault(); scroll('right'); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <Link
          href={`/talent/${talent.id}`}
          className="block w-full py-2 bg-gradient-to-r from-primary-blue to-blue-600 dark:from-accent-red dark:to-red-600 text-white text-center font-semibold rounded-full hover:shadow-lg transition-all text-sm"
        >
          View Full Profile
        </Link>
      </div>
    </div>
  );
}
