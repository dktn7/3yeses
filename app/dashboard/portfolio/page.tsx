'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
  title?: string;
}

export default function PortfolioPage() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState<Media[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [uploadType, setUploadType] = useState<'image' | 'video'>('image');

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await fetch('/api/talent/portfolio', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setMedia(data.media || []);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', uploadType);

    try {
      const response = await fetch('/api/talent/portfolio/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMedia([...media, data.media]);
      } else {
        alert('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/talent/portfolio/${mediaId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setMedia(media.filter(m => m.id !== mediaId));
        if (selectedMedia?.id === mediaId) {
          setSelectedMedia(null);
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Showcase your best work with photos and videos
            </p>
          </div>

          {/* Upload Button */}
          <div className="flex items-center space-x-4">
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value as 'image' | 'video')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>

            <label className="cursor-pointer">
              <span className="inline-flex items-center px-6 py-2 bg-primary-blue dark:bg-accent-red text-white rounded-lg hover:opacity-90 transition-opacity">
                {uploading ? (
                  <>
                    <LoadingSpinner size="small" className="p-0 inline-flex mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <span className="mr-2">📤</span>
                    Upload {uploadType}
                  </>
                )}
              </span>
              <input
                type="file"
                accept={uploadType === 'image' ? 'image/*' : 'video/*'}
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{media.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎨</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Photos</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {media.filter(m => m.type === 'image').length}
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📷</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Videos</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {media.filter(m => m.type === 'video').length}
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Gallery</h2>

        {media.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No portfolio items yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Upload your first photo or video to get started
            </p>
            <label className="cursor-pointer inline-flex items-center px-6 py-3 bg-primary-blue dark:bg-accent-red text-white rounded-lg hover:opacity-90 transition-opacity">
              <span className="mr-2">📤</span>
              Upload Now
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                className="relative group aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setSelectedMedia(item)}
              >
                {item.type === 'image' ? (
                  <Image
                    src={item.url}
                    alt={item.title || 'Portfolio item'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <span className="text-4xl">▶️</span>
                    </div>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                  >
                    Delete
                  </button>
                </div>

                {/* Type Badge */}
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                  {item.type === 'image' ? '📷' : '🎥'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
          >
            ×
          </button>

          <div className="max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {selectedMedia.type === 'image' ? (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.title || 'Portfolio item'}
                className="max-w-full max-h-[80vh] object-contain"
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                className="max-w-full max-h-[80vh]"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
