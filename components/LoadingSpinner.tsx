'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: string | number;
  color?: string; // Kept for compatibility, though not used by SwoopingTick
  className?: string;
  fullScreen?: boolean;
  inline?: boolean; // New prop for inline spinners without background
}

const LoadingSpinner = ({ 
  size = 'medium', 
  className = '', 
  fullScreen = false,
  inline = false
}: LoadingSpinnerProps) => {
  const getSize = (s: string | number): number => {
    if (typeof s === 'number') return s;
    
    // Handle common Tailwind classes if passed
    if (s.includes('h-')) {
        if (s.includes('4')) return 16;
        if (s.includes('6')) return 24;
        if (s.includes('8')) return 32;
        if (s.includes('10')) return 40;
        if (s.includes('12')) return 48;
        if (s.includes('16')) return 64;
        if (s.includes('20')) return 80;
        if (s.includes('24')) return 96;
    }

    switch (s) {
      case 'small': return 24;
      case 'large': return 80;
      case 'xl': return 120;
      case 'medium': 
      default: return 48;
    }
  };

  const pixelSize = getSize(size);

  // Inline spinner (no background, just the spinning circle)
  if (inline) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <div
          className="rounded-full border-4 border-gray-300 dark:border-gray-700 border-t-primary-blue dark:border-t-accent-red animate-spin"
          style={{ width: pixelSize, height: pixelSize }}
        />
      </div>
    );
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900 transition-colors">
        <div
          className="rounded-full border-4 border-gray-300 dark:border-gray-700 border-t-primary-blue dark:border-t-accent-red animate-spin"
          style={{ width: pixelSize, height: pixelSize }}
        />
      </div>
    );
  }

  // Page-level spinner with subtle background
  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div
        className="rounded-full border-4 border-gray-300 dark:border-gray-700 border-t-primary-blue dark:border-t-accent-red animate-spin"
        style={{ width: pixelSize, height: pixelSize }}
      />
    </div>
  );
};

export default LoadingSpinner;
