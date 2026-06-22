'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  ExternalLink,
  ImageIcon,
  Music,
  Heart,
  Share2,
  MessageCircle,
} from 'lucide-react';
import VideoPlayer from './VideoPlayer.tsx';
import CommentsSection from './CommentsSection';
import AuthRequiredModal from './AuthRequiredModal';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthRequired } from '@/hooks/useAuthRequired';

interface GalleryItem {
  id: string;
  mediaUrl: string;
  title: string;
  type: 'video' | 'image' | 'audio';
  thumbnail?: string;
  likeCount?: number;
}

interface GalleryViewerProps {
  readonly items: GalleryItem[];
  readonly initialIndex: number;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly mediaOwnerId?: string;
}

export default function GalleryViewer({ items, initialIndex, isOpen, onClose, mediaOwnerId }: GalleryViewerProps) {
  const { user } = useAuth();
  const { showAuthModal, openAuthModal, closeAuthModal } = useAuthRequired();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev || '';
    };
  }, [isOpen]);

  const nextItem = useCallback(() => {
    if (!items.length) return;
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevItem = useCallback(() => {
    if (!items.length) return;
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

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

  useEffect(() => {
    if (!isOpen) return;

    const handleWheel = (e: Event) => {
      const wheelEvent = e as WheelEvent;
      e.preventDefault();
      if (wheelEvent.deltaY > 0) nextItem();
      else if (wheelEvent.deltaY < 0) prevItem();
    };

    const galleryElement = document.querySelector('.gallery-viewer');
    if (galleryElement) {
      galleryElement.addEventListener('wheel', handleWheel, { passive: false });
      return () => galleryElement.removeEventListener('wheel', handleWheel);
    }
  }, [isOpen, nextItem, prevItem]);

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

      if (touchStartX - touchEndX > swipeThreshold) nextItem();
      else if (touchEndX - touchStartX > swipeThreshold) prevItem();
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
    if (!currentItem?.id) return;

    let cancelled = false;
    setIsLiked(false);
    setLikesCount(currentItem.likeCount || 0);

    fetch(`/api/portfolio/${currentItem.id}/like`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        if (typeof data.isLiked === 'boolean') setIsLiked(data.isLiked);
        if (typeof data.likeCount === 'number') setLikesCount(data.likeCount);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [currentItem?.id, currentItem?.likeCount]);

  if (!isOpen || !currentItem) return null;

  const handleLike = async () => {
    if (!currentItem?.id) return;
    if (!user) {
      openAuthModal();
      return;
    }

    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await fetch(`/api/portfolio/${currentItem.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ like: nextLiked }),
      });

      if (!res.ok) throw new Error('Like request failed');
      const data = await res.json();
      if (typeof data.likeCount === 'number') setLikesCount(data.likeCount);
      if (typeof data.isLiked === 'boolean') setIsLiked(data.isLiked);
    } catch (error) {
      console.error('Failed to like portfolio item:', error);
      setIsLiked(!nextLiked);
      setLikesCount((prev) => (nextLiked ? Math.max(0, prev - 1) : prev + 1));
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = new URL(window.location.href);
      shareUrl.searchParams.set('mediaId', currentItem.id);
      await navigator.clipboard.writeText(shareUrl.toString());
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    } catch (error) {
      console.error('Failed to copy gallery link:', error);
    }
  };

  const goToItem = (index: number) => {
    setCurrentIndex(index);
  };

  const renderMedia = () => {
    switch (currentItem.type) {
      case 'video':
        return (
          <div key={`video-${currentIndex}`} className="flex h-full w-full items-center justify-center p-3 sm:p-4">
            <div className="w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
              <VideoPlayer url={currentItem.mediaUrl} type="VIDEO" />
            </div>
          </div>
        );
      case 'image':
        return (
          <div key={`image-${currentIndex}`} className="flex h-full w-full items-center justify-center p-3 sm:p-4">
            <div className="flex h-full w-full max-w-6xl items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/50 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentItem.mediaUrl}
                alt={currentItem.title}
                className="max-h-[min(72vh,56rem)] w-auto max-w-full object-contain"
              />
            </div>
          </div>
        );
      case 'audio':
        return (
          <div key={`audio-${currentIndex}`} className="flex h-full w-full items-center justify-center p-3 sm:p-4">
            <div className="flex w-full max-w-3xl flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-4 shadow-2xl sm:p-6">
              <VideoPlayer
                url={currentItem.mediaUrl}
                type="AUDIO"
                talentProfile={{ id: mediaOwnerId || 'gallery', name: currentItem.title }}
              />
            </div>
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
        return <Music size={16} className="text-blue-600" />;
      default:
        return null;
    }
  };

  return createPortal(
    <div
      className="gallery-viewer fixed inset-0 z-[100] flex flex-col bg-black/95"
      ref={viewerRef}
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-black/70 px-3 py-2 text-white sm:px-4 sm:py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-sm font-semibold sm:text-base md:text-lg">{currentItem.title}</h2>
          <span className="flex-shrink-0 rounded bg-white/10 px-2 py-0.5 text-xs capitalize">
            {currentItem.type}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => window.open(currentItem.mediaUrl, '_blank')}
            className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
            title="Open in new tab"
          >
            <ExternalLink size={18} />
          </button>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
            title="Close gallery"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-h-0 flex-col">
          <div className="relative flex min-h-0 flex-1 items-center justify-center p-2 sm:p-3 md:p-4">
            {items.length > 1 && (
              <>
                <button
                  onClick={prevItem}
                  className="absolute left-2 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white transition-all hover:bg-black/80 sm:left-3 md:left-4"
                  title="Previous item"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextItem}
                  className="absolute right-2 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/55 p-2 text-white transition-all hover:bg-black/80 sm:right-3 md:right-4"
                  title="Next item"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {renderMedia()}
          </div>

          {items.length > 1 && (
            <div className="border-t border-white/10 bg-black/70 p-3 backdrop-blur-md sm:p-4">
              <div className="flex items-center justify-center gap-3">
                {items.length > 6 && (
                  <button
                    onClick={() => {
                      const container = document.querySelector('.thumbnail-scroll');
                      if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
                    }}
                    className="hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 md:flex"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}

                <div className="thumbnail-scroll flex max-w-full gap-2 overflow-x-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent sm:gap-3">
                  {items.map((item, index) => (
                    <button
                      key={`${item.mediaUrl}-${index}`}
                      onClick={() => goToItem(index)}
                      className={`flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors duration-200 ${
                        index === currentIndex ? 'border-blue-500' : 'border-gray-600/80 hover:border-gray-400'
                      } h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20`}
                      title={item.title}
                    >
                      <div className="flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-black">
                        {item.thumbnail || item.type === 'image' ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.thumbnail || item.mediaUrl}
                            alt={item.title}
                            className="block h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-gray-700/50 to-gray-900/50 text-white backdrop-blur-sm">
                            <div className="rounded-full bg-blue-500/20 p-2">
                              {getItemIcon(item.type)}
                            </div>
                            <span className="text-[10px] font-semibold uppercase tracking-wide sm:text-xs">{item.type}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {items.length > 6 && (
                  <button
                    onClick={() => {
                      const container = document.querySelector('.thumbnail-scroll');
                      if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
                    }}
                    className="hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20 md:flex"
                  >
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>

              <div className="mt-2 text-center">
                <span className="text-sm font-semibold text-white sm:text-base">
                  {currentIndex + 1} <span className="text-gray-400">/</span> {items.length}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-col border-t border-white/10 bg-black/75 xl:border-l xl:border-t-0">
          <div className="border-b border-white/10 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Profile media</p>
                <h3 className="mt-1 truncate text-lg font-semibold text-white">{currentItem.title}</h3>
                <p className="text-sm capitalize text-white/50">{currentItem.type}</p>
              </div>
              <button
                onClick={() => window.open(currentItem.mediaUrl, '_blank')}
                className="rounded-full bg-white/10 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/20"
                title="Open in new tab"
              >
                Open
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={handleLike}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isLiked
                    ? 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30'
                    : 'bg-white/10 text-white/80 hover:bg-white/15'
                }`}
              >
                <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                <span>{likesCount}</span>
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <Share2 size={16} />
                Share
              </button>

              <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-2 text-sm text-white/60">
                <MessageCircle size={16} />
                Comments
              </div>
            </div>

            <div className={`mt-3 rounded-full px-3 py-2 text-xs transition-colors ${showCopiedToast ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/5 text-white/45'}`}>
              {showCopiedToast ? 'Link copied to clipboard.' : 'Share uses a deep-link to this exact media item.'}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
              <CommentsSection mediaId={currentItem.id} mediaOwnerId={mediaOwnerId} />
            </div>
          </div>
        </div>
      </div>

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        title="Sign in to like"
        message="You need an account to like media. Continue to sign in or create an account."
        action="like media"
      />
    </div>,
    document.body
  );
}
