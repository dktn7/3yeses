'use client';
import React, { useState } from 'react';
import { MapPin, Star, Clock, Heart, Play } from 'lucide-react';
import type { Talent } from '@/types/index.ts';
import Link from 'next/link';
import Image from 'next/image';

export interface VideoTalentCardProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly thumbnailUrl?: string;
  readonly rating?: number;
  readonly projects?: number;
  readonly experience?: string;
  readonly talent?: Talent;
  readonly locale?: string;
}

// Helper to extract YouTube ID
const getYouTubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Helper to get YouTube thumbnail
const getYouTubeThumbnail = (id: string) => {
  return `https://img.youtube.com/vi/${id}/0.jpg`; // 0.jpg is the high res thumbnail
};

export default function VideoTalentCard({ 
  title, 
  subtitle, 
  thumbnailUrl, 
  rating, 
  projects, 
  experience,
  talent,
  locale = 'en-gb'
}: VideoTalentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  
  const displayTitle = talent?.name || title || 'Talent Name';
  const displaySubtitle = talent?.role || subtitle || 'Talent Role';
  
  // Smart thumbnail logic
  let displayThumbnail = talent?.avatarUrl || thumbnailUrl || '/default-avatar.png';
  
  // Check if videoUrl is YouTube
  const youtubeId = talent?.videoUrl ? getYouTubeId(talent.videoUrl) : null;
  const isYoutube = !!youtubeId;

  // If avatarUrl is missing or looks like a placeholder, and we have a YouTube video, use its thumbnail
  // Also if displayThumbnail ITSELF is a YouTube URL (which caused the error), fix it
  const thumbnailIsYoutube = getYouTubeId(displayThumbnail);
  
  if (thumbnailIsYoutube) {
      displayThumbnail = getYouTubeThumbnail(thumbnailIsYoutube);
  } else if ((!talent?.avatarUrl || talent.avatarUrl?.includes('default') || talent.avatarUrl?.includes('placeholder')) && isYoutube && youtubeId) {
    displayThumbnail = getYouTubeThumbnail(youtubeId);
  }

  const displayRating = talent?.rating || rating || 4.9;
  const displayProjects = talent?.portfolio?.length || projects || 32;
  const displayExperience = talent?.experience ? `${talent.experience} yrs` : experience || '5 yrs';
  const displayLocation = talent?.location || 'London, UK';
  const talentId = talent?.id || '1';

  return (
    <div 
      className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-800 group cursor-pointer w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/${locale}/talent/${talentId}`} className="absolute inset-0 z-10" aria-label={displayTitle} />
      {/* Profile Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
          {/* Show video on hover if available, otherwise show image */}
          {isHovered && talent?.videoUrl && !isYoutube ? (
            <video
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              autoPlay
              muted
              loop
              playsInline
              src={talent.videoUrl}
            />
          ) : (
            <Image
              src={displayThumbnail}
              alt={displayTitle}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          )}
        
        {/* Play Button Overlay - shows when video is available */}
        {talent?.videoUrl && (
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isHovered ? 'bg-black/40' : 'bg-transparent'}`}>
            {(isHovered || !isYoutube) && (
               <div className={`bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg transition-all duration-300 ${isHovered ? 'scale-110 opacity-100' : 'scale-100 opacity-0'}`}>
                 <Play className="w-8 h-8 text-gray-800 fill-gray-800" />
               </div>
            )}
          </div>
        )}
        
        {/* Hover Overlay with gradient */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}></div>
        
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorited(!isFavorited);
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:scale-110 transition-all duration-200 z-20"
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${
              isFavorited 
                ? 'text-red-500 fill-red-500' 
                : 'text-gray-600 dark:text-gray-300'
            }`} 
          />
        </button>

        {/* Online Status */}
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-xs font-medium text-white shadow-sm bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">Online</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {displayTitle}
            </h3>
            <div className="flex items-center space-x-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded-full">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-bold text-yellow-700 dark:text-yellow-500">{displayRating}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium line-clamp-1">{displaySubtitle}</p>
        </div>

        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
          <div className="flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
            {displayLocation}
          </div>
          <div className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
            {displayExperience}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            <span className="text-gray-900 dark:text-white font-bold text-sm">{displayProjects}</span> projects
          </div>
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                 {/* Placeholder for project thumbnails */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
