'use client';

import Image from 'next/image';
import { User } from 'lucide-react';

interface SafeAvatarImageProps {
  src: string | undefined | null;
  alt: string;
  size?: number;
  className?: string;
  fallbackClassName?: string;
}

// Check if URL is an audio file (should not be used as image)
const isAudioUrl = (url: string): boolean => {
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a', '.wma'];
  return audioExtensions.some(ext => url.toLowerCase().includes(ext));
};

// Check if URL should be unoptimized (SVG, DiceBear)
const shouldBeUnoptimized = (url: string): boolean => {
  return url.includes('api.dicebear.com') || url.includes('.svg') || url.includes('/svg');
};

/**
 * Safe avatar image component that handles:
 * - DiceBear SVG avatars (unoptimized)
 * - Audio URLs (fallback to icon)
 * - Missing/null URLs (fallback to icon)
 */
export default function SafeAvatarImage({ 
  src, 
  alt, 
  size = 32,
  className = 'w-full h-full object-cover',
  fallbackClassName = 'text-gray-500'
}: SafeAvatarImageProps) {
  // Validate the URL
  const isValidImageUrl = src && !isAudioUrl(src);
  
  if (isValidImageUrl) {
    // Use fill so large avatar containers render crisply without relying on width/height
    return (
      <div className="relative w-full h-full">
        <Image
          src={src!}
          alt={alt}
          fill
          className={className}
          unoptimized={shouldBeUnoptimized(src!)}
        />
      </div>
    );
  }
  
  // Fallback to user icon
  const iconSize = Math.max(size * 0.5, 12);
  return (
    <User 
      className={fallbackClassName}
      style={{ width: iconSize, height: iconSize }}
    />
  );
}
