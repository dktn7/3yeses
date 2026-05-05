'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Play, ExternalLink, ImageIcon, Music, CheckCircle2, Heart, Flag } from 'lucide-react';
import VideoPlayer from './VideoPlayer.tsx';
import FlagButton from './FlagButton';
import CommentsSection from './CommentsSection';

interface GalleryItem {
  id: string;
  url: string;
  title: string;
  type: 'video' | 'image' | 'audio';
  thumbnail?: string;
  likes?: number;
}

interface GalleryViewerProps {
  readonly items: GalleryItem[];
  readonly initialIndex: number;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export default function GalleryViewer({ items, initialIndex, isOpen, onClose }: GalleryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const viewerRef = useRef<HTMLDivElement>(null);

  // Fullscreen modal – ignore page layout (sidebar/topbar)
  // Positioning handled entirely by fixed + inset-0 classes

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev || '';
    };
  }, [isOpen]);

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

  const currentItem = items[currentIndex];

  useEffect(() => {
    setIsLiked(false);
    setLikesCount(currentItem?.likes || 0);
  }, [currentItem?.id, currentItem?.likes]);

  if (!isOpen) return null;

  const handleLike = async () => {
    if (!currentItem?.id) return;
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    try {
      const res = await fetch(`/api/portfolio/${currentItem.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ like: nextLiked }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.likes === 'number') setLikesCount(data.likes);
      }
    } catch (error) {
      console.error('Failed to like portfolio item:', error);
    }
  };

  const goToItem = (index: number) => {
    setCurrentIndex(index);
  };

  const renderMainContent = () => {
    if (!isOpen) return null;
    switch (currentItem.type) {
      case 'video':
        return (
          <div key={`video-${currentIndex}`} className="w-full h-full flex items-center justify-center">
            <VideoPlayer url={currentItem.url} type="VIDEO" />
          </div>
        );
      case 'image':
        return (
          <div key={`image-${currentIndex}`} className="w-full h-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentItem.url}
              alt={currentItem.title}
              className="max-w-[95%] max-h-[95%] w-auto h-auto object-contain rounded-lg shadow-lg"
            />
          </div>
        );
      case 'audio':
        return (
          <div key={`audio-${currentIndex}`} className="w-full h-full flex flex-col items-center justify-center px-4 sm:px-6 md:px-8">
            <VideoPlayer
              url={currentItem.url}
              type="AUDIO"
              talentProfile={{ id: 'gallery', name: currentItem.title }}
            />
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
        return <Music size={16} className="text-purple-600" />;
      default:
        return null;
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] bg-black/90 flex flex-col gallery-viewer"
      ref={viewerRef}
    >
      {/* Header - Compact and responsive */}
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-black/60 text-white border-b border-gray-700">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold truncate">{currentItem.title}</h2>
          <span className="text-xs bg-gray-700 px-2 py-0.5 rounded capitalize flex-shrink-0">
            {currentItem.type}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => window.open(currentItem.url, '_blank')}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
            title="Open in new tab"
          >
            <ExternalLink size={18} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
            title="Close gallery"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center p-2 sm:p-3 md:p-4 relative">
          {/* Navigation Arrows */}
          {items.length > 1 && (
            <>
              <button
                onClick={prevItem}
                className="absolute left-2 sm:left-3 md:left-4 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all z-50"
                title="Previous item"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextItem}
                className="absolute right-2 sm:right-3 md:right-4 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all z-50"
                title="Next item"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Main Content */}
          {renderMainContent()}
        </div>

        <div className="w-full lg:w-96 bg-light-surface dark:bg-dark-surface border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isLiked
                  ? 'bg-blue-50 text-blue-600 dark:bg-red-900/20 dark:text-red-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              <Heart size={16} className={isLiked ? 'fill-current' : ''} />
              {likesCount}
            </button>
            {currentItem?.id && (
              <FlagButton
                mediaId={currentItem.id}
                contentType={currentItem.type.toUpperCase() as 'VIDEO' | 'IMAGE' | 'AUDIO'}
              />
            )}
          </div>
          {currentItem?.id ? (
            <CommentsSection mediaId={currentItem.id} />
          ) : (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Comments unavailable for this media.</div>
          )}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {items.length > 1 && (
        <div className="bg-gradient-to-t from-black/80 via-black/70 to-black/60 backdrop-blur-md border-t border-gray-700/50 p-3 sm:p-4 flex flex-col">
          <div className="flex justify-center items-center gap-3 h-20 sm:h-24 md:h-28">
            {/* Scroll indicator left */}
            {items.length > 6 && (
              <button
                onClick={() => {
                  const container = document.querySelector('.thumbnail-scroll');
                  if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
                }}
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all flex-shrink-0"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            
            <div className="flex gap-2 sm:gap-3 max-w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent thumbnail-scroll scroll-smooth">
              {items.map((item, index) => (
                <button
                  key={`${item.url}-${index}`}
                  onClick={() => goToItem(index)}
                  className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-colors duration-200 ${
                    index === currentIndex
                      ? 'border-blue-500'
                      : 'border-gray-600/80 hover:border-gray-400'
                  }`}
                  title={item.title}
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center overflow-hidden">
                    {item.thumbnail || item.type === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnail || item.url}
                        alt={item.title}
                        className="block w-full h-full object-cover scale-100"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-1.5 text-white bg-gradient-to-br from-gray-700/50 to-gray-900/50 w-full h-full backdrop-blur-sm">
                        <div className={`p-2 rounded-full ${
                          item.type === 'video' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                        }`}>
                          {getItemIcon(item.type)}
                        </div>
                        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide">{item.type}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            {/* Scroll indicator right */}
            {items.length > 6 && (
              <button
                onClick={() => {
                  const container = document.querySelector('.thumbnail-scroll');
                  if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
                }}
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all flex-shrink-0"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>
          <div className="text-center mt-2 sm:mt-3">
            <span className="text-white font-semibold text-sm sm:text-base">
              {currentIndex + 1} <span className="text-gray-400">/</span> {items.length}
            </span>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
