'use client';

import SwoopingTick from './SwoopingTick';

interface MediaThumbnailFallbackProps {
  size?: 'small' | 'medium' | 'large';
}

/**
 * Fallback thumbnail component for media without explicit thumbnails
 * Shows 3YESES logo with theme-aware colors (blue in light, red in dark)
 */
export default function MediaThumbnailFallback({ size = 'medium' }: MediaThumbnailFallbackProps) {
  const sizeClasses = {
    small: 'text-[8px]',
    medium: 'text-xs',
    large: 'text-sm',
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-blue to-blue-900 dark:from-accent-red dark:to-red-900">
      <span className={`flex items-center gap-0.5 ${sizeClasses[size]} text-white opacity-70`}>
        3YESES
        <SwoopingTick size={size === 'small' ? 8 : size === 'medium' ? 12 : 16} className="opacity-70" />
      </span>
    </div>
  );
}
