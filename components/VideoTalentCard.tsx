'use client';
import React, { useState } from 'react';
import { MapPin, Star, Clock, Heart, Play } from 'lucide-react';
import { Talent } from '@/types';
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
}

export default function VideoTalentCard({ 
  title, 
  subtitle, 
  thumbnailUrl, 
  rating, 
  projects, 
  experience,
  talent 
}: VideoTalentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  
  const displayTitle = talent?.name || title || 'Talent Name';
  const displaySubtitle = talent?.role || subtitle || 'Talent Role';
  const displayThumbnail = talent?.avatarUrl || thumbnailUrl || '/default-avatar.png';
  const displayRating = talent?.rating || rating || 4.9;
  const displayProjects = talent?.portfolio?.length || projects || 32;
  const displayExperience = talent?.experience ? `${talent.experience} yrs` : experience || '5 yrs';
  const displayLocation = talent?.location || 'London, UK';
  const talentId = talent?.id || '1';

  return (
    <button 
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-800 group cursor-pointer w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => window.location.href = `/talent/${talentId}`}
    >
      {/* Profile Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/talent/${talentId}`}>
          {/* Show video on hover if available, otherwise show image */}
          {isHovered && talent?.videoUrl ? (
            <video
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              autoPlay
              muted
              loop
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
        </Link>
        
        {/* Play Button Overlay - shows when video is available and not hovered */}
        {talent?.videoUrl && !isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-all duration-300">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg group-hover:scale-110 transition-all duration-300">
              <Play className="w-8 h-8 text-gray-800 fill-gray-800" />
            </div>
          </div>
        )}
        
        {/* Hover Overlay with gradient */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}></div>
        
        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:scale-110 transition-all duration-200"
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
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-white bg-black/50 px-2 py-1 rounded-full">
            Available
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <Link href={`/talent/${talentId}`} className="block">
          {/* Name and Role */}
          <div className="mb-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {displayTitle}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              {displaySubtitle}
            </p>
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-sm">{displayLocation}</span>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {/* Rating */}
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {displayRating}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                  ({displayProjects})
                </span>
              </div>

              {/* Experience */}
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {displayExperience}
                </span>
              </div>
            </div>
          </div>

          {/* Skills Tags */}
          {talent?.skills && talent.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {talent.skills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-md font-medium"
                >
                  {skill}
                </span>
              ))}
              {talent.skills.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs rounded-md">
                  +{talent.skills.length - 3} more
                </span>
              )}
            </div>
          )}
        </Link>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Link
            href={`/talent/${talentId}`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors text-sm"
          >
            View Profile
          </Link>
          <button className="flex-1 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-center py-2 px-4 rounded-lg font-medium transition-colors text-sm">
            Message
          </button>
        </div>
      </div>
    </button>
  );
}
