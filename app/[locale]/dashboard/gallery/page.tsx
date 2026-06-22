'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import LoadingSpinner from '@/components/LoadingSpinner';
import MediaThumbnailFallback from '@/components/MediaThumbnailFallback';
import VideoPlayer from '@/components/VideoPlayer';
import GalleryViewer from '@/components/GalleryViewer';
import { Play, ImageIcon, Music, Eye, Heart, Trash2, Layers } from 'lucide-react';
import { validateUrl } from '@/lib/url-validator';
import { logBlockedUrl } from '@/lib/config/security';

interface Media {
  id: string;
  mediaUrl: string;
  type: 'image' | 'video' | 'audio';
  title?: string;
  description?: string;
  thumbnail?: string;
  createdAt?: string;
  talentProfile?: {
    user?: { name: string };
    category?: { name: string };
    avatarUrl?: string;
  };
}

export default function GalleryPage() {
  const t = useTranslations('dashboard.gallery');
  const locale = useLocale();
  // State declarations
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStep, setUploadStep] = useState<'select' | 'url-input' | 'details' | 'confirm'>('select');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingType, setPendingType] = useState<'image' | 'video' | 'audio'>('image');
  const [pendingMediaUrl, setPendingMediaUrl] = useState<string>('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>('');
  const [pendingTitle, setPendingTitle] = useState('');
  const [pendingDescription, setPendingDescription] = useState('');
  const [pendingThumbnailMethod, setPendingThumbnailMethod] = useState<'none' | 'video' | 'url' | 'file'>('none');
  const [videoTimestamp, setVideoTimestamp] = useState(0);
  const [media, setMedia] = useState<Media[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [pendingThumbnail, setPendingThumbnail] = useState('');
  const [pendingThumbnailFile, setPendingThumbnailFile] = useState<File | null>(null);
  const [extractedThumbnail, setExtractedThumbnail] = useState<string>('');
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Media | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [thumbnailMethod, setThumbnailMethod] = useState<'none' | 'video' | 'url' | 'file'>('none');
  const [editThumbnail, setEditThumbnail] = useState('');
  const [notification, setNotification] = useState<{ show: boolean; type: 'success' | 'error'; message: string; action?: 'upload' | 'extract' | 'update' | 'delete' | 'edit' }>({ show: false, type: 'success', message: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; mediaId: string | null }>({ show: false, mediaId: null });

  // Load gallery data on mount
  useEffect(() => {
    const loadGallery = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/talent/media');
        if (response.ok) {
          const data = await response.json();
          setMedia(data.media || []);
        } else {
          console.error('Failed to load gallery');
          setMedia([]);
        }
      } catch (error) {
        console.error('Error loading gallery:', error);
        setMedia([]);
      } finally {
        setLoading(false);
      }
    };
    loadGallery();
  }, []);

  // Auto-dismiss notifications after 10 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, type: 'success', message: '' });
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const getTypeIcon = (type: string) => {
    const typeUpper = (typeof type === 'string' ? type.toUpperCase() : type);
    switch (typeUpper) {
      case 'VIDEO': return Play;
      case 'IMAGE': return ImageIcon;
      case 'AUDIO': return Music;
      default: return ImageIcon;
    }
  };

  // File upload handler - processes selected file
  const handleFileUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const type = file.type.startsWith('image/') ? 'image' : 
                 file.type.startsWith('video/') ? 'video' : 
                 file.type.startsWith('audio/') ? 'audio' : null;
    
    if (!type) {
      setNotification({ show: true, type: 'error', message: t('invalidFileType') });
      return;
    }
    
    setPendingFile(file);
    setPendingType(type);
    setUploadMethod('file');
    setShowUploadModal(true);
    setUploadStep('details');
  };

  // URL upload handler - directly upload from URL
  const handleUrlUpload = async (type: string, url: string) => {
    if (!url.trim()) {
      setNotification({ show: true, type: 'error', message: t('invalidUrl') });
      return;
    }
    
    // Validate URL using centralized validation system
    const validationResult = validateUrl(url);
    if (!validationResult.isValid) {
      // Log blocked attempt for security monitoring
      logBlockedUrl(url, validationResult.error || 'Validation failed');
      setNotification({ show: true, type: 'error', message: validationResult.error || t('invalidUrl') });
      return;
    }
    
    // Use sanitized URL
    const safeUrl = validationResult.sanitizedUrl!;
    
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('type', type);
      formData.append('url', safeUrl);
      formData.append('title', pendingTitle || safeUrl.split('/').pop() || 'Media');
      formData.append('description', pendingDescription);
      
      const response = await fetch('/api/talent/media/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        setMedia([data.media, ...media]);
        setNotification({ show: true, type: 'success', message: t('mediaAdded'), action: 'upload' });
        setShowUploadModal(false);
        setPendingFile(null);
        setPendingTitle('');
        setPendingDescription('');
        setPendingMediaUrl('');
        setUploadStep('select');
      } else {
        const error = await response.json();
        setNotification({ show: true, type: 'error', message: error.error || t('uploadFailed') });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setNotification({ show: true, type: 'error', message: t('uploadFailed') });
    } finally {
      setUploading(false);
    }
  };

  // Video thumbnail extraction - extracts frame at specific timestamp
  const extractVideoThumbnail = (timestamp: number) => {
    if (!pendingFile || !pendingFile.type.startsWith('video/')) {
      setNotification({ show: true, type: 'error', message: t('noVideoSelected') });
      return;
    }
    
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';
    
    const fileUrl = URL.createObjectURL(pendingFile);
    video.src = fileUrl;
    
    let resolved = false;
    
    const extractFrame = () => {
      if (resolved) return;
      resolved = true;
      
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          setNotification({ show: true, type: 'error', message: t('canvasContextFailed') });
          URL.revokeObjectURL(fileUrl);
          return;
        }
        
        // Fill canvas with dark background first
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const thumbUrl = canvas.toDataURL('image/jpeg', 0.85);
        
        if (thumbUrl && thumbUrl.length > 100) {
          setExtractedThumbnail(thumbUrl);
          setEditThumbnail(thumbUrl);
          setPendingThumbnail(thumbUrl);
          setVideoTimestamp(timestamp);
          setNotification({ show: true, type: 'success', message: t('thumbnailExtracted'), action: 'extract' });
        } else {
          throw new Error('Invalid thumbnail data');
        }
      } catch (err) {
        console.error('Thumbnail extraction error:', err);
        setNotification({ show: true, type: 'error', message: t('thumbnailFailed') });
      } finally {
        URL.revokeObjectURL(fileUrl);
      }
    };
    
    // Listen for both events to ensure we catch when frame is ready
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(timestamp, video.duration || 5);
    };
    
    video.onseeked = extractFrame;
    video.oncanplay = extractFrame;
    
    // Timeout as final fallback
    setTimeout(() => {
      if (!resolved && video.videoWidth > 0) {
        extractFrame();
      } else if (!resolved) {
        setNotification({ show: true, type: 'error', message: t('videoLoadFailed') });
        resolved = true;
        URL.revokeObjectURL(fileUrl);
      }
    }, 2000);
  };

  // Upload confirmation - submits file to API
  const confirmUpload = async () => {
    if (!pendingFile) return;
    
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', pendingFile);
      formData.append('type', pendingType);
      formData.append('title', pendingTitle || pendingFile.name);
      formData.append('description', pendingDescription);
      
      if (pendingThumbnail) {
        formData.append('thumbnail', pendingThumbnail);
      } else if (extractedThumbnail) {
        const blob = await fetch(extractedThumbnail).then(r => r.blob());
        formData.append('thumbnailFile', blob, 'thumbnail.jpg');
      }
      
      const response = await fetch('/api/talent/media/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        setMedia([data.media, ...media]);
        setNotification({ show: true, type: 'success', message: t('mediaUploaded'), action: 'upload' });
        setShowUploadModal(false);
        setPendingFile(null);
        setPendingTitle('');
        setPendingDescription('');
        setExtractedThumbnail('');
        setPendingThumbnail('');
      } else {
        const error = await response.json();
        setNotification({ show: true, type: 'error', message: error.error || t('uploadFailed'), action: 'upload' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setNotification({ show: true, type: 'error', message: t('uploadFailed') });
    } finally {
      setUploading(false);
    }
  };

  // Delete media - sends DELETE request for specific media
  const deleteMedia = async (id: string) => {
    try {
      const response = await fetch(`/api/talent/media/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        setMedia(media.filter(m => m.id !== id));
        setNotification({ show: true, type: 'success', message: t('mediaDeleted'), action: 'delete' });
      } else {
        setNotification({ show: true, type: 'error', message: t('deleteFailed') });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setNotification({ show: true, type: 'error', message: t('deleteFailed') });
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm({ show: true, mediaId: id });
  };

  const openEdit = (item: Media) => {
    setEditingItem(item);
    setEditTitle(item.title || '');
    setEditDescription(item.description || '');
    setEditThumbnail(item.thumbnail || '');
    setThumbnailMethod('none');
  };

  const confirmEdit = async () => {
    if (!editingItem) return;
    
    try {
      const response = await fetch(`/api/talent/media/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          thumbnail: editThumbnail,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMedia(media.map(m => m.id === editingItem.id ? { ...m, ...data.media } : m));
        setEditingItem(null);
        setNotification({ show: true, type: 'success', message: t('mediaUpdated'), action: 'edit' });
      } else {
        setNotification({ show: true, type: 'error', message: t('updateFailed') });
      }
    } catch (error) {
      console.error('Edit error:', error);
      setNotification({ show: true, type: 'error', message: t('updateFailed') });
    }
  };

  const confirmDelete = () => {
    if (deleteConfirm.mediaId) {
      deleteMedia(deleteConfirm.mediaId);
      setDeleteConfirm({ show: false, mediaId: null });
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
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>
        
        {/* Upload Button */}
        <button
          onClick={() => { setShowUploadModal(true); setUploadStep('select'); }}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-blue dark:bg-accent-red text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 cursor-pointer"
        >
          {uploading ? (
            <>
              <LoadingSpinner size="small" inline className="" />
              <span>{t('uploading')}</span>
            </>
          ) : (
            <>
              <span>📤</span>
              <span>{t('uploadMedia')}</span>
            </>
          )}
        </button>
      </div>

      {/* Upload Modal - Multi-step Form */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700 animate-in zoom-in duration-200" role="dialog" aria-modal="true">
            {/* Header with step indicator - Fixed */}
            <div className="flex-shrink-0 p-8 pb-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <span className="w-10 h-10 bg-gradient-to-br from-primary-blue to-blue-600 dark:from-accent-red dark:to-red-600 rounded-xl flex items-center justify-center text-white text-lg shadow-lg">📤</span>
                    {t('uploadMedia')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('shareWork')}</p>
                </div>
                <button 
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" 
                  onClick={() => { 
                    if (videoPreviewUrl) {
                      URL.revokeObjectURL(videoPreviewUrl);
                      setVideoPreviewUrl(null);
                    }
                    setShowUploadModal(false); 
                    setUploadStep('select'); 
                  }} 
                  aria-label={t('cancel')}
                >
                  ✕
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex gap-2">
                <div className={`flex-1 h-1 rounded-full transition-all ${uploadStep === 'select' || uploadStep === 'details' || uploadStep === 'confirm' ? 'bg-primary-blue dark:bg-accent-red' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                <div className={`flex-1 h-1 rounded-full transition-all ${uploadStep === 'details' || uploadStep === 'confirm' ? 'bg-primary-blue dark:bg-accent-red' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                <div className={`flex-1 h-1 rounded-full transition-all ${uploadStep === 'confirm' ? 'bg-primary-blue dark:bg-accent-red' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 pb-4 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {/* Upload Method Selector - shown on initial select step or when nothing chosen yet */}
              {(uploadStep === 'select' || (uploadStep === 'details' && !pendingFile && !pendingMediaUrl)) && (
                <div className="space-y-4 mb-8">
                  <label className="block text-base font-semibold text-gray-900 dark:text-white mb-3">{t('chooseMethod')}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = 'image/*,video/*,audio/*';
                        fileInput.onchange = handleFileUpload as any;
                        fileInput.click();
                      }}
                      className="flex flex-col items-center gap-3 p-4 bg-light-surface dark:bg-dark-surface border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-blue dark:hover:border-accent-red transition-all hover:shadow-lg"
                    >
                      <div className="text-3xl">📁</div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900 dark:text-white">{t('fromDevice')}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{t('chooseFile')}</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setPendingMediaUrl('');
                        setPendingType('image');
                        setUploadMethod('url');
                        setUploadStep('url-input');
                      }}
                      className="flex flex-col items-center gap-3 p-4 bg-light-surface dark:bg-dark-surface border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-blue dark:hover:border-accent-red transition-all hover:shadow-lg"
                    >
                      <div className="text-3xl">🔗</div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900 dark:text-white">{t('fromUrl')}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{t('pasteLink')}</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* URL Input Step */}
              {uploadStep === 'url-input' && !pendingFile && (
                <div className="space-y-5">
                  <div className="p-5 bg-blue-50 dark:bg-red-900/20 rounded-2xl border border-blue-200 dark:border-red-800">
                    <p className="text-sm font-medium text-blue-900 dark:text-red-300 mb-3">🔗 {t('enterMediaUrl')}</p>
                    <p className="text-xs text-blue-800 dark:text-red-300 mb-4">{t('supportedFormats')}</p>
                    
                    <div className="space-y-4">
                      {/* Media Type Selector */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('mediaType')}</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['image', 'video', 'audio'] as const).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setPendingType(type)}
                              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                pendingType === type
                                  ? 'bg-primary-blue dark:bg-accent-red text-white shadow-lg scale-105'
                                  : 'bg-light-surface dark:bg-dark-surface text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                              }`}
                            >
                              {type === 'image' ? '🖼️' : type === 'video' ? '🎬' : '🎵'} {t(type)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* URL Input */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('url')}</label>
                        <input
                          type="url"
                          value={pendingMediaUrl}
                          onChange={(e) => setPendingMediaUrl(e.target.value)}
                          placeholder={t('mediaUrlPlaceholder')}
                          className="w-full px-4 py-3 rounded-xl bg-light-surface dark:bg-dark-surface border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-primary-blue dark:focus:border-accent-red"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{t('urlHttpsRequired')}</p>
                      </div>

                      {/* Safety Info */}
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-xs font-medium text-green-900 dark:text-green-300 flex items-center gap-2">
                          🛡️ {t('safetyCheck')}
                        </p>
                        <p className="text-xs text-green-800 dark:text-green-400 mt-1">
                          {t('safetyCheckDesc')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pendingFile && (
                <div className="space-y-5">
                  {/* File Info Badge */}
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-blue-200 dark:border-gray-700">
                    <div className="w-12 h-12 bg-primary-blue dark:bg-accent-red rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      {pendingType === 'video' ? '🎬' : pendingType === 'audio' ? '🎵' : '🖼️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{t(pendingType)}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{pendingFile.name}</p>
                    </div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {(pendingFile.size / (1024 * 1024)).toFixed(1)}MB
                    </div>
                  </div>

                  {/* Thumbnail Section FIRST - For Video & Audio */}
                  {(pendingType === 'video' || pendingType === 'audio') && (
                    <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                      <label className="flex text-base font-semibold text-gray-900 dark:text-white mb-4 items-center gap-2">
                        🎨 {t('thumbnail')}
                        <span className="text-xs font-normal text-gray-500 dark:text-gray-400">({t('optional')})</span>
                      </label>
                      
                      <div className="space-y-4">
                        <div className={`grid ${pendingType === 'video' ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                          {pendingType === 'video' && (
                            <button
                              type="button"
                              onClick={() => setPendingThumbnailMethod(pendingThumbnailMethod === 'video' ? 'none' : 'video')}
                              className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${pendingThumbnailMethod === 'video' ? 'bg-gradient-to-r from-primary-blue to-blue-600 dark:from-accent-red dark:to-red-600 text-white shadow-lg scale-105' : 'bg-light-surface dark:bg-dark-surface text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-primary-blue dark:hover:border-accent-red'}`}
                            >
                              🎬 {t('fromVideo')}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setPendingThumbnailMethod(pendingThumbnailMethod === 'url' ? 'none' : 'url')}
                            className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${pendingThumbnailMethod === 'url' ? 'bg-gradient-to-r from-primary-blue to-blue-600 dark:from-accent-red dark:to-red-600 text-white shadow-lg scale-105' : 'bg-light-surface dark:bg-dark-surface text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-primary-blue dark:hover:border-accent-red'}`}
                          >
                            🔗 {t('url')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingThumbnailMethod(pendingThumbnailMethod === 'file' ? 'none' : 'file')}
                            className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${pendingThumbnailMethod === 'file' ? 'bg-gradient-to-r from-primary-blue to-blue-600 dark:from-accent-red dark:to-red-600 text-white shadow-lg scale-105' : 'bg-light-surface dark:bg-dark-surface text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-primary-blue dark:hover:border-accent-red'}`}
                          >
                            📁 {t('upload')}
                          </button>
                        </div>

                        {pendingThumbnailMethod === 'video' && videoPreviewUrl && pendingType === 'video' && (
                          <div className="space-y-3 p-4 bg-light-surface dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('framePosition')}</label>
                              <span className="text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{videoTimestamp.toFixed(1)}s</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="10"
                              step="0.1"
                              value={videoTimestamp}
                              onChange={(e) => setVideoTimestamp(parseFloat(e.target.value))}
                              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-blue dark:accent-accent-red"
                            />
                            <button
                              type="button"
                              onClick={() => extractVideoThumbnail(videoTimestamp)}
                              className="w-full px-4 py-2.5 bg-gradient-to-r from-primary-blue to-blue-600 dark:from-accent-red dark:to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-[1.02]"
                            >
                              ⚡ {t('extractFrame')}
                            </button>
                            {extractedThumbnail && (
                              <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-green-500 shadow-xl">
                                <Image src={extractedThumbnail} alt={t('thumbnail')} fill sizes="100vw" className="object-cover" />
                                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                  ✓ {t('ready')}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {pendingThumbnailMethod === 'url' && (
                          <input
                            type="url"
                            value={pendingThumbnail}
                            onChange={(e) => setPendingThumbnail(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-light-surface dark:bg-dark-surface border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
                            placeholder={t('thumbnailUrlPlaceholder')}
                          />
                        )}

                        {pendingThumbnailMethod === 'file' && (
                          <div className="relative">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setPendingThumbnailFile(e.target.files?.[0] || null)}
                              className="w-full px-4 py-2.5 rounded-xl bg-light-surface dark:bg-dark-surface border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-blue dark:file:bg-accent-red file:text-white hover:file:bg-blue-600 dark:hover:file:bg-red-600"
                            />
                            {pendingThumbnailFile && (
                              <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium flex items-center gap-1">
                                <span>✓</span> {pendingThumbnailFile.name}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Title */}
                  <div>
                    <label className="flex text-base font-semibold text-gray-900 dark:text-white mb-2 items-center gap-2">
                      {t('title_field')}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={pendingTitle}
                      onChange={(e) => setPendingTitle(e.target.value)}
                      maxLength={100}
                      className="w-full px-4 py-3 rounded-xl bg-light-surface dark:bg-dark-surface border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-primary-blue dark:focus:border-accent-red transition-colors text-lg font-medium"
                      placeholder={t('titlePlaceholder')}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center justify-between">
                      <span>{t('titleTip')}</span>
                      <span className="font-mono">{pendingTitle.length}/100</span>
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-base font-semibold text-gray-900 dark:text-white mb-2">{t('description')}</label>
                    <textarea
                      value={pendingDescription}
                      onChange={(e) => setPendingDescription(e.target.value)}
                      maxLength={500}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-light-surface dark:bg-dark-surface border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-primary-blue dark:focus:border-accent-red resize-none transition-colors"
                      placeholder={t('descriptionPlaceholder')}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center justify-between">
                      <span>{t('descriptionTip')}</span>
                      <span className="font-mono">{pendingDescription.length}/500</span>
                    </p>
                  </div>

                  {/* Type-specific Tips */}
                  {pendingType === 'image' && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-red-900/20 dark:to-red-950/20 rounded-xl border border-blue-200 dark:border-red-800/50">
                      <p className="text-sm text-blue-700 dark:text-red-300 font-medium">💡 {t('imageBestPractices')}</p>
                      <ul className="text-xs text-blue-600 dark:text-red-300 mt-2 space-y-1">
                        <li>• {t('imageFormat')}</li>
                        <li>• {t('imageMaxSize')}</li>
                        <li>• {t('imageRecommended')}</li>
                      </ul>
                    </div>
                  )}

                  {pendingType === 'video' && (
                    <div className="p-4 bg-gradient-to-r from-red-50 to-red-50 dark:from-red-900/20 dark:to-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50">
                      <p className="text-sm text-red-700 dark:text-red-300 font-medium">💡 {t('videoBestPractices')}</p>
                      <ul className="text-xs text-red-600 dark:text-red-400 mt-2 space-y-1">
                        <li>• {t('videoFormat')}</li>
                        <li>• {t('videoMaxSize')}</li>
                        <li>• {t('videoThumbnailTip')}</li>
                      </ul>
                    </div>
                  )}

                  {pendingType === 'audio' && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-red-900/20 dark:to-red-950/20 rounded-xl border border-blue-200 dark:border-red-800/50">
                      <p className="text-sm text-blue-700 dark:text-red-300 font-medium">💡 {t('audioBestPractices')}</p>
                      <ul className="text-xs text-blue-600 dark:text-red-300 mt-2 space-y-1">
                        <li>• {t('audioFormat')}</li>
                        <li>• {t('audioMaxSize')}</li>
                        <li>• {t('audioCoverTip')}</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* URL Upload Content */}
              {pendingMediaUrl && (
                <div className="space-y-5">
                  {/* URL Info Badge */}
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-blue-200 dark:border-gray-700">
                    <div className="w-12 h-12 bg-primary-blue dark:bg-accent-red rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      {pendingType === 'video' ? '🎬' : pendingType === 'audio' ? '🎵' : '🖼️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{t('fromUrl')}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{pendingMediaUrl}</p>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="flex text-base font-semibold text-gray-900 dark:text-white mb-2 items-center gap-2">
                      {t('title_field')}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={pendingTitle}
                      onChange={(e) => setPendingTitle(e.target.value)}
                      maxLength={100}
                      className="w-full px-4 py-3 rounded-xl bg-light-surface dark:bg-dark-surface border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-primary-blue dark:focus:border-accent-red transition-colors text-lg font-medium"
                      placeholder={t('titlePlaceholder')}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center justify-between">
                      <span>{t('titleTip')}</span>
                      <span className="font-mono">{pendingTitle.length}/100</span>
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-base font-semibold text-gray-900 dark:text-white mb-2">{t('description')}</label>
                    <textarea
                      value={pendingDescription}
                      onChange={(e) => setPendingDescription(e.target.value)}
                      maxLength={500}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-light-surface dark:bg-dark-surface border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-primary-blue dark:focus:border-accent-red resize-none transition-colors"
                      placeholder={t('descriptionPlaceholder')}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center justify-between">
                      <span>{t('descriptionTip')}</span>
                      <span className="font-mono">{pendingDescription.length}/500</span>
                    </p>
                  </div>

                  {/* Thumbnail for URL upload */}
                  {(pendingType === 'video' || pendingType === 'audio') && (
                    <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                      <label className="flex text-base font-semibold text-gray-900 dark:text-white mb-4 items-center gap-2">
                        🎨 {t('thumbnail')}
                        <span className="text-xs font-normal text-gray-500 dark:text-gray-400">({t('optional')})</span>
                      </label>
                      <input
                        type="url"
                        value={pendingThumbnail}
                        onChange={(e) => setPendingThumbnail(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-light-surface dark:bg-dark-surface border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
                        placeholder={t('thumbnailUrlPlaceholder')}
                      />
                    </div>
                  )}

                  {/* Type-specific Tips */}
                  {pendingType === 'image' && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-red-900/20 dark:to-red-950/20 rounded-xl border border-blue-200 dark:border-red-800/50">
                      <p className="text-sm text-blue-700 dark:text-red-300 font-medium">💡 {t('imageTips')}</p>
                      <ul className="text-xs text-blue-600 dark:text-red-300 mt-2 space-y-1">
                        <li>• {t('imageDirectUrl')}</li>
                        <li>• {t('imageSupportedFormats')}</li>
                      </ul>
                    </div>
                  )}

                  {pendingType === 'video' && (
                    <div className="p-4 bg-gradient-to-r from-red-50 to-red-50 dark:from-red-900/20 dark:to-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50">
                      <p className="text-sm text-red-700 dark:text-red-300 font-medium">💡 {t('videoTips')}</p>
                      <ul className="text-xs text-red-600 dark:text-red-400 mt-2 space-y-1">
                        <li>• {t('videoDirectUrl')}</li>
                        <li>• {t('videoSupportedFormats')}</li>
                      </ul>
                    </div>
                  )}

                  {pendingType === 'audio' && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-red-900/20 dark:to-red-950/20 rounded-xl border border-blue-200 dark:border-red-800/50">
                      <p className="text-sm text-blue-700 dark:text-red-300 font-medium">💡 {t('audioTips')}</p>
                      <ul className="text-xs text-blue-600 dark:text-red-300 mt-2 space-y-1">
                        <li>• {t('audioDirectUrl')}</li>
                        <li>• {t('audioSupportedFormats')}</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fixed Footer with Actions */}
            <div className="flex-shrink-0 px-8 pb-8 pt-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center justify-between gap-4">
                <button 
                  className="px-8 py-3 rounded-xl bg-light-surface dark:bg-dark-surface text-gray-800 dark:text-gray-200 font-semibold border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all hover:scale-105" 
                  onClick={() => { 
                    if (uploadStep === 'url-input') {
                      setUploadStep('select');
                      setPendingMediaUrl('');
                    } else {
                      if (videoPreviewUrl) {
                        URL.revokeObjectURL(videoPreviewUrl);
                        setVideoPreviewUrl(null);
                      }
                      setShowUploadModal(false); 
                      setUploadStep('select'); 
                      setPendingFile(null); 
                      setPendingMediaUrl('');
                    }
                  }}
                >
                  {uploadStep === 'url-input' ? t('back') : t('cancel')}
                </button>
                <button 
                  className="flex-1 px-8 py-3 rounded-xl bg-gradient-to-r from-primary-blue to-blue-600 dark:from-accent-red dark:to-red-600 text-white font-bold hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2" 
                  onClick={() => {
                    if (uploadStep === 'url-input') {
                      handleUrlUpload(pendingType, pendingMediaUrl);
                    } else {
                      confirmUpload();
                    }
                  }}
                  disabled={uploading || (uploadStep === 'url-input' ? !pendingMediaUrl.trim() : (!pendingTitle.trim() || (uploadMethod === 'url' && !pendingMediaUrl)))}
                >
                  {uploading ? (
                    <>
                      <LoadingSpinner size="small" inline />
                      <span>{uploadStep === 'url-input' ? t('adding') : t('uploading')}</span>
                    </>
                  ) : (
                    <>
                      <span>{uploadStep === 'url-input' ? t('addFromUrl') : t('uploadToGallery')}</span>
                      <span>{uploadStep === 'url-input' ? '🔗' : '🚀'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('total')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{media.length}</p>
            </div>
            <div className="p-3 bg-[var(--marketing-surface)] dark:bg-[var(--marketing-surface)] rounded-xl border border-[var(--marketing-pill-border)]">
              <Layers className="w-6 h-6 text-[var(--marketing-pill-icon)] dark:text-[var(--marketing-pill-icon)]" />
            </div>
          </div>
        </div>

        <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('photos')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {media.filter(m => m.type === 'image').length}
              </p>
            </div>
            <div className="p-3 bg-[var(--marketing-surface)] dark:bg-[var(--marketing-surface)] rounded-xl border border-[var(--marketing-pill-border)]">
              <ImageIcon className="w-6 h-6 text-[var(--marketing-pill-icon)] dark:text-[var(--marketing-pill-icon)]" />
            </div>
          </div>
        </div>

        <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('videos')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {media.filter(m => m.type === 'video').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <Play className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('audio')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {media.filter(m => m.type === 'audio').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Music className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('yourMedia')}</h2>
        </div>

        {media.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-7xl mb-4">🎨</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('emptyGallery')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {t('emptyGalleryDesc')}
            </p>
            <label className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-primary-blue dark:bg-accent-red text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
              <span>📤</span>
              <span>{t('uploadFirst')}</span>
              <input
                type="file"
                accept="image/*,video/*,audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {media.map((item, index) => {
              const TypeIcon = getTypeIcon(item.type);
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedMedia(item);
                    setViewerIndex(index);
                    setIsViewerOpen(true);
                  }}
                  className="group block bg-light-surface dark:bg-dark-surface rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 hover:scale-[1.02]"
                >
                  {/* Image/Video Thumbnail */}
                  <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    {item.type === 'image' ? (
                      <Image
                        src={item.mediaUrl}
                        alt={item.title || t('title')}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : item.type === 'video' ? (
                      item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title || t('thumbnail')}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <MediaThumbnailFallback />
                      )
                    ) : (
                      item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title || t('thumbnail')}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <MediaThumbnailFallback />
                      )
                    )}

                    {/* Icon Overlay on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <div className="bg-black/50 rounded-full p-3 backdrop-blur-sm">
                        <TypeIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded-full p-1.5">
                      <TypeIcon className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 text-base leading-snug">
                      {item.title || t('untitled')}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-medium">
                          <Eye className="w-3.5 h-3.5" />
                          0
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <Heart className="w-3.5 h-3.5" />
                          0
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString(locale, { month: 'short', day: 'numeric' }) : t('recentlyAdded')}
                      </span>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t('delete')}
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(item);
                      }}
                      className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-red-900/20 text-blue-700 dark:text-red-300 rounded-lg font-medium hover:bg-blue-100 dark:hover:bg-red-900/30 transition-colors text-sm"
                    >
                      ✏️ {t('edit')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Media Viewer - Same as Talent Page */}
      {isViewerOpen && selectedMedia && (
        <GalleryViewer
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            setSelectedMedia(null);
          }}
          items={media.map((m, i) => ({
            id: (m as any).id || `media-${i}`,
            mediaUrl: m.mediaUrl,
            title: m.title || t('untitled'),
            type: m.type,
            thumbnail: m.thumbnail,
          }))}
          initialIndex={viewerIndex}
        />
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
            <div className="flex-shrink-0 px-6 md:px-8 py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <span className="w-10 h-10 bg-gradient-to-br from-primary-blue to-blue-600 dark:from-accent-red dark:to-red-600 rounded-xl flex items-center justify-center text-white text-lg shadow-lg">✏️</span>
                    {t('editMedia')}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">{t('previewAndUpdate')} {editingItem.type.toLowerCase()}</p>
                </div>
                <button 
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex-shrink-0" 
                  onClick={() => setEditingItem(null)} 
                  aria-label={t('cancel')}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">

            {/* Media Preview Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">{t('preview')}</label>
              <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
                {editingItem.type === 'image' ? (
                  <div className="relative aspect-video w-full">
                    <Image
                      src={editingItem.mediaUrl}
                      alt={editingItem.title || t('preview')}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : editingItem.type === 'video' ? (
                  <div className="aspect-video w-full">
                    <VideoPlayer
                      url={editingItem.mediaUrl}
                      className="w-full h-full"
                      talentProfile={{
                        id: editingItem.talentProfile?.user?.name || 'Artist',
                        name: editingItem.talentProfile?.user?.name || 'Artist',
                        avatarUrl: editingItem.talentProfile?.avatarUrl
                      }}
                      showLogo={false}
                      type="VIDEO"
                      thumbnail={editThumbnail || editingItem.thumbnail}
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full">
                    <VideoPlayer
                      url={editingItem.mediaUrl}
                      className="w-full h-full"
                      talentProfile={{
                        id: editingItem.talentProfile?.user?.name || 'Artist',
                        name: editingItem.talentProfile?.user?.name || 'Artist',
                        avatarUrl: editingItem.talentProfile?.avatarUrl
                      }}
                      showLogo={false}
                      type="AUDIO"
                      thumbnail={editingItem.thumbnail}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('title_field')}</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('description')}</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{editDescription.length}/500</p>
              </div>
              {(editingItem.type === 'video' || editingItem.type === 'audio') && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">{t('thumbnail')}</label>
                  <div className="space-y-3">
                    <div className={`grid ${editingItem.type === 'video' ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                      {editingItem.type === 'video' && (
                        <button
                          type="button"
                          onClick={() => setThumbnailMethod(thumbnailMethod === 'video' ? 'none' : 'video')}
                          className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${thumbnailMethod === 'video' ? 'bg-primary-blue dark:bg-accent-red text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                        >
                          🎬 {t('video')}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setThumbnailMethod(thumbnailMethod === 'url' ? 'none' : 'url')}
                        className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${thumbnailMethod === 'url' ? 'bg-primary-blue dark:bg-accent-red text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                      >
                        🔗 {t('url')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setThumbnailMethod(thumbnailMethod === 'file' ? 'none' : 'file')}
                        className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${thumbnailMethod === 'file' ? 'bg-primary-blue dark:bg-accent-red text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                      >
                        📁 {t('file')}
                      </button>
                    </div>
                    {thumbnailMethod === 'video' && editingItem.type === 'video' && (
                      <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('extractThumbnailDesc')}</p>
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('selectFrame')}</label>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{videoTimestamp.toFixed(1)}s</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.1"
                          value={videoTimestamp}
                          onChange={(e) => setVideoTimestamp(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-blue dark:accent-accent-red"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            // Create temporary video element from current media
                            const video = document.createElement('video');
                            video.src = editingItem.mediaUrl;
                            video.crossOrigin = 'anonymous';
                            video.currentTime = videoTimestamp;
                            
                            video.addEventListener('seeked', () => {
                              const canvas = document.createElement('canvas');
                              canvas.width = video.videoWidth;
                              canvas.height = video.videoHeight;
                              const ctx = canvas.getContext('2d');
                              ctx?.drawImage(video, 0, 0);
                              const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                              setExtractedThumbnail(dataUrl);
                              setEditThumbnail(dataUrl);
                            });
                            
                            video.load();
                          }}
                          className="w-full px-4 py-2 bg-primary-blue dark:bg-accent-red text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                        >
                          {t('extractThumbnail')}
                        </button>
                        {extractedThumbnail && (
                          <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-green-500">
                            <Image src={extractedThumbnail} alt={t('thumbnail')} fill sizes="100vw" className="object-cover" />
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">✓ {t('ready')}</div>
                          </div>
                        )}
                      </div>
                    )}
                    {thumbnailMethod === 'url' && (
                      <input
                        type="url"
                        value={editThumbnail}
                        onChange={(e) => setEditThumbnail(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                        placeholder={t('thumbnailUrlPlaceholder')}
                      />
                    )}
                    {thumbnailMethod === 'file' && (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Store file reference - will handle in confirmEdit
                              setPendingThumbnailFile(file);
                              const reader = new FileReader();
                              reader.onload = () => {
                                if (typeof reader.result === 'string') {
                                  setEditThumbnail(reader.result);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                        {pendingThumbnailFile && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ {pendingThumbnailFile.name}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('thumbnailOptional')}</p>
                </div>
              )}
            </div>
            </div>

            {/* Fixed Footer */}
            <div className="flex-shrink-0 px-6 md:px-8 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between gap-4">
              <button 
                className="px-6 py-2.5 rounded-xl bg-light-surface dark:bg-dark-surface text-gray-800 dark:text-gray-200 font-semibold border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all hover:scale-105" 
                onClick={() => setEditingItem(null)}
              >
                {t('cancel')}
              </button>
              <button 
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-blue to-blue-600 dark:from-accent-red dark:to-red-600 text-white font-semibold hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={confirmEdit}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <LoadingSpinner size="small" inline />
                    <span>{t('savingChanges')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('saveChanges')}</span>
                    <span>✓</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-32 right-4 z-[200] animate-in slide-in-from-top-2 fade-in duration-300">
          <div className={`rounded-2xl shadow-2xl border-2 px-6 py-4 min-w-[320px] backdrop-blur-md ${
            notification.type === 'success'
              ? notification.action === 'upload'
                ? 'bg-blue-50 dark:bg-red-900/90 border-blue-500 dark:border-red-400'
                : notification.action === 'extract'
                ? 'bg-blue-50 dark:bg-red-900/90 border-blue-500 dark:border-red-400'
                : notification.action === 'edit'
                ? 'bg-red-50 dark:bg-red-900/90 border-red-500 dark:border-red-400'
                : notification.action === 'delete'
                ? 'bg-red-50 dark:bg-red-900/90 border-red-500 dark:border-red-400'
                : 'bg-green-50 dark:bg-green-900/90 border-green-500 dark:border-green-400'
              : 'bg-red-50 dark:bg-red-900/90 border-red-500 dark:border-red-400'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                notification.type === 'success'
                  ? notification.action === 'upload'
                    ? 'bg-blue-500 dark:bg-red-600'
                    : notification.action === 'extract'
                    ? 'bg-purple-500 dark:bg-purple-600'
                    : notification.action === 'edit'
                    ? 'bg-red-500 dark:bg-red-600'
                    : notification.action === 'delete'
                    ? 'bg-red-500 dark:bg-red-600'
                    : 'bg-green-500 dark:bg-green-600'
                  : 'bg-red-500 dark:bg-red-600'
              }`}>
                {notification.type === 'success' ? (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`font-semibold text-sm ${
                  notification.type === 'success'
                    ? notification.action === 'upload'
                      ? 'text-blue-900 dark:text-red-100'
                      : notification.action === 'extract'
                      ? 'text-purple-900 dark:text-purple-100'
                      : notification.action === 'edit'
                      ? 'text-red-900 dark:text-red-100'
                      : notification.action === 'delete'
                      ? 'text-red-900 dark:text-red-100'
                      : 'text-green-900 dark:text-green-100'
                    : 'text-red-900 dark:text-red-100'
                }`}>
                  {notification.type === 'success' 
                    ? notification.action === 'upload'
                      ? `🚀 ${t('toastUploaded')}`
                      : notification.action === 'extract'
                      ? `📸 ${t('toastExtracted')}`
                      : notification.action === 'edit'
                      ? `✏️ ${t('toastUpdated')}`
                      : notification.action === 'delete'
                      ? `🗑️ ${t('toastDeleted')}`
                      : t('toastSuccess')
                    : t('toastError')
                  }
                </p>
                <p className={`text-sm mt-0.5 ${
                  notification.type === 'success'
                    ? notification.action === 'upload'
                      ? 'text-blue-800 dark:text-red-200'
                      : notification.action === 'extract'
                      ? 'text-purple-800 dark:text-purple-200'
                      : notification.action === 'edit'
                      ? 'text-red-800 dark:text-red-200'
                      : notification.action === 'delete'
                      ? 'text-red-800 dark:text-red-200'
                      : 'text-green-800 dark:text-green-200'
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification({ show: false, type: 'success', message: '' })}
                className={`p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${
                  notification.type === 'success'
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-red-700 dark:text-red-300'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-md border border-red-500/60 dark:border-red-400/60 animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
                {t('deleteMedia')}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                {t('deleteConfirm')}
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm({ show: false, mediaId: null })}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 border-2 border-transparent"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-red-500 dark:border-red-400"
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
