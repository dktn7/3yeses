'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Volume2, ExternalLink, ImageIcon } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

interface GalleryItem {
  url: string;
  title: string;
  type: 'video' | 'image' | 'audio';
}

interface GalleryViewerProps {
  readonly items: GalleryItem[];
  readonly initialIndex: number;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export default function GalleryViewer({ items, initialIndex, isOpen, onClose }: GalleryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Define callbacks before using them in useEffect
  const nextItem = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevItem = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Update currentIndex when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          prevItem();
          break;
        case 'ArrowRight':
          nextItem();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, nextItem, prevItem]);

  // Mouse wheel navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleWheel = (e: Event) => {
      const wheelEvent = e as WheelEvent;
      e.preventDefault();
      if (wheelEvent.deltaY > 0) {
        nextItem();
      } else if (wheelEvent.deltaY < 0) {
        prevItem();
      }
    };

    const galleryElement = document.querySelector('.gallery-viewer');
    if (galleryElement) {
      galleryElement.addEventListener('wheel', handleWheel, { passive: false });
      return () => galleryElement.removeEventListener('wheel', handleWheel);
    }
  }, [isOpen, nextItem, prevItem]);

  // Touch/swipe navigation for mobile
  useEffect(() => {
    if (!isOpen) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: Event) => {
      const touchEvent = e as TouchEvent;
      touchStartX = touchEvent.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: Event) => {
      const touchEvent = e as TouchEvent;
      touchEndX = touchEvent.changedTouches[0].screenX;
      const swipeThreshold = 50;
      
      if (touchStartX - touchEndX > swipeThreshold) {
        // Swipe left - next item
        nextItem();
      } else if (touchEndX - touchStartX > swipeThreshold) {
        // Swipe right - previous item
        prevItem();
      }
    };

    const galleryElement = document.querySelector('.gallery-viewer');
    if (galleryElement) {
      galleryElement.addEventListener('touchstart', handleTouchStart);
      galleryElement.addEventListener('touchend', handleTouchEnd);
      return () => {
        galleryElement.removeEventListener('touchstart', handleTouchStart);
        galleryElement.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isOpen, nextItem, prevItem]);

  if (!isOpen) return null;

  const currentItem = items[currentIndex];

  const goToItem = (index: number) => {
    setCurrentIndex(index);
  };

  const renderMainContent = () => {
    switch (currentItem.type) {
      case 'video':
        return (
          <div className="w-full h-full max-w-4xl max-h-[70vh] mx-auto">
            <VideoPlayer url={currentItem.url} />
          </div>
        );
      case 'image':
        return (
          <div className="w-full h-full max-w-4xl max-h-[70vh] mx-auto flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentItem.url}
              alt={currentItem.title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          </div>
        );
      case 'audio':
        return (
          <div className="w-full max-w-2xl mx-auto bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg p-8 flex flex-col items-center justify-center">
            <div className="text-6xl mb-4 text-purple-600 dark:text-purple-400">
              <Volume2 />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-center">{currentItem.title}</h3>
            <audio controls className="w-full max-w-md">
              <source src={currentItem.url} />
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      default:
        return null;
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play size={16} className="text-blue-600" />;
      case 'image':
        return <ImageIcon size={16} className="text-green-600" />;
      case 'audio':
        return <Volume2 size={16} className="text-purple-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col gallery-viewer">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black bg-opacity-50 text-white">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">{currentItem.title}</h2>
          <span className="text-sm bg-gray-700 px-2 py-1 rounded capitalize">
            {currentItem.type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open(currentItem.url, '_blank')}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Open in new tab"
          >
            <ExternalLink size={20} />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Close gallery"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Navigation Arrows */}
        {items.length > 1 && (
          <>
            <button
              onClick={prevItem}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all z-10"
              title="Previous item"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextItem}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all z-10"
              title="Next item"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Main Content */}
        {renderMainContent()}
      </div>

      {/* Thumbnail Navigation */}
      {items.length > 1 && (
        <div className="bg-black bg-opacity-50 p-4">
          <div className="flex justify-center">
            <div className="flex gap-2 max-w-full overflow-x-auto pb-2">
              {items.map((item, index) => (
                <button
                  key={`${item.url}-${index}`}
                  onClick={() => goToItem(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? 'border-blue-500 scale-110'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                  title={item.title}
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                    {item.type === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-600 dark:text-gray-400">
                        {getItemIcon(item.type)}
                        <span className="text-xs mt-1 capitalize">{item.type}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="text-center mt-2 text-white text-sm">
            {currentIndex + 1} of {items.length}
          </div>
        </div>
      )}
    </div>
  );
}
