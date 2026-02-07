'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import type { Talent } from '@/types/index.ts';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import TalentCard from '@/components/TalentCard';
import VideoPlayer from '@/components/VideoPlayer';
import GalleryViewer from '@/components/GalleryViewer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Briefcase, MapPin, Languages, Film, ImageIcon, Music, Flag, 
  Eye, Share2, Users, TrendingUp, Building2, 
  Calendar, Ruler, Palette, User, CheckCircle2, PlayCircle,
  Sparkles, Zap, Edit2, X, Check
} from 'lucide-react';
import { AnalyticsTracker } from '@/lib/analytics/tracker';
import SafeAvatarImage from '@/components/SafeAvatarImage';

type TalentProfileData = {
  talent: Talent;
  suggestions: Talent[];
};

export default function TalentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const locale = pathname?.split('/')[1] || 'en-gb';
  const id = params?.id as string;

  const [data, setData] = useState<TalentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [activeTab, setActiveTab] = useState<'media' | 'about'>('media');
  const [viewsToday, setViewsToday] = useState(0);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [showBannerPicker, setShowBannerPicker] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch(`/api/talent/${id}`);
          
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to fetch talent data (${res.status})`);
          }
          
          const result: TalentProfileData = await res.json();
          setData(result);
          setEditData({
            name: result.talent.name,
            location: result.talent.location,
            role: result.talent.role,
            bio: result.talent.bio,
            avatarUrl: result.talent.avatarUrl,
            bannerUrl: result.talent.bannerUrl,
            skills: result.talent.skills || [],
            gender: result.talent.gender,
            age: result.talent.age,
            ethnicity: result.talent.ethnicity,
            height: result.talent.height,
            eyeColor: result.talent.eyeColor,
            hairColor: result.talent.hairColor,
            bodyType: result.talent.bodyType,
            languages: result.talent.languages || [],
          });
          
          // Check if this is the user's own profile
          if (user && (user.id === id || user.id === result.talent.userId)) {
            setIsOwnProfile(true);
          } else {
            setIsOwnProfile(false);
          }
        } catch (err) {
          console.error('Error in fetchData:', err);
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setError('No talent ID provided');
      setLoading(false);
    }
  }, [id, user]);

  const bannerPresets = [
    { id: 'preset-1', label: 'Ocean', gradient: 'linear-gradient(135deg, #0ea5e9 0%, #1e3a8a 100%)' },
    { id: 'preset-2', label: 'Sunset', gradient: 'linear-gradient(135deg, #f97316 0%, #be123c 100%)' },
    { id: 'preset-3', label: 'Aurora', gradient: 'linear-gradient(135deg, #22c55e 0%, #0f766e 100%)' },
    { id: 'preset-4', label: 'Midnight', gradient: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)' },
    { id: 'preset-5', label: 'Candy', gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' },
    { id: 'preset-6', label: 'Skyline', gradient: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)' },
    { id: 'preset-7', label: 'Forest', gradient: 'linear-gradient(135deg, #16a34a 0%, #166534 100%)' },
    { id: 'preset-8', label: 'Gold', gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' },
    { id: 'preset-9', label: 'Blush', gradient: 'linear-gradient(135deg, #f472b6 0%, #fb7185 100%)' },
    { id: 'preset-10', label: 'Indigo', gradient: 'linear-gradient(135deg, #6366f1 0%, #1e1b4b 100%)' },
  ];

  const resolveBannerStyle = (bannerUrl?: string) => {
    if (!bannerUrl) return null;
    if (bannerUrl.startsWith('preset-')) {
      const preset = bannerPresets.find(p => p.id === bannerUrl);
      return preset ? { backgroundImage: preset.gradient } : null;
    }
    return { backgroundImage: `url(${bannerUrl})` };
  };

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('type', 'profile');
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.url) {
          setEditData(prev => ({ ...prev, avatarUrl: data.url }));
        }
      }
    } catch (error) {
      console.error('Avatar upload failed:', error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (file: File) => {
    setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append('type', 'profile');
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.url) {
          setEditData(prev => ({ ...prev, bannerUrl: data.url }));
        }
      }
    } catch (error) {
      console.error('Banner upload failed:', error);
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!isOwnProfile) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('/api/talent/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editData.name,
          roleDescription: editData.role,
          location: editData.location,
          bio: editData.bio,
          avatarUrl: editData.avatarUrl,
          bannerUrl: editData.bannerUrl,
          skills: editData.skills,
          gender: editData.gender,
          age: editData.age,
          ethnicity: editData.ethnicity,
          height: editData.height,
          eyeColor: editData.eyeColor,
          hairColor: editData.hairColor,
          bodyType: editData.bodyType,
          languages: editData.languages,
        }),
      });
      if (res.ok) {
        await fetch(`/api/talent/${id}`).then(r => r.json()).then((result) => {
          setData(result);
          setEditData({
            name: result.talent.name,
            location: result.talent.location,
            role: result.talent.role,
            bio: result.talent.bio,
            avatarUrl: result.talent.avatarUrl,
            bannerUrl: result.talent.bannerUrl,
            skills: result.talent.skills || [],
            gender: result.talent.gender,
            age: result.talent.age,
            ethnicity: result.talent.ethnicity,
            height: result.talent.height,
            eyeColor: result.talent.eyeColor,
            hairColor: result.talent.hairColor,
            bodyType: result.talent.bodyType,
            languages: result.talent.languages || [],
          });
          setNewSkill('');
          setNewLanguage('');
        });
        setEditMode(false);
        setSaveMessage('Saved');
      } else {
        setSaveMessage('Failed to save');
      }
    } catch (error) {
      console.error('Save profile failed:', error);
      setSaveMessage('Failed to save');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  // Initialize like data when talent data is loaded
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (data?.talent && id) {
        try {
          const response = await fetch(`/api/talent/${id}/like`);
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setLikeCount(result.likeCount);
              setIsLiked(result.isLiked);
            }
          } else {
            setLikeCount(data.talent.likeCount || 0);
            setIsLiked(data.talent.isLiked || false);
          }
        } catch (error) {
          console.error('Error fetching like status:', error);
          setLikeCount(data.talent.likeCount || 0);
          setIsLiked(data.talent.isLiked || false);
        }
      }
    };
    
    const fetchViewsToday = async () => {
      if (data?.talent && id) {
        try {
          const response = await fetch(`/api/talent/${id}/views`);
          if (response.ok) {
            const result = await response.json();
            setViewsToday(result.viewsToday || 0);
          }
        } catch (error) {
          console.error('Error fetching views:', error);
        }
      }
    };
    
    fetchLikeStatus();
    fetchViewsToday();
  }, [data, id]);

  // Track profile view when page loads
  useEffect(() => {
    if (!data?.talent?.id || isOwnProfile) return;
    const cleanup = AnalyticsTracker.createProfileTracker(
      data.talent.id,
      user?.id
    );
    return cleanup;
  }, [data?.talent?.id, isOwnProfile, user?.id]);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    const newLikedState = !isLiked;
    const newLikeCount = newLikedState ? likeCount + 1 : likeCount - 1;
    
    setIsLiked(newLikedState);
    setLikeCount(newLikeCount);
    
    try {
      const response = await fetch(`/api/talent/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ like: newLikedState }),
      });
      
      if (!response.ok) {
        setIsLiked(!newLikedState);
        setLikeCount(prevCount => newLikedState ? prevCount - 1 : prevCount + 1);
      } else {
        const result = await response.json();
        if (result.success) {
          setIsLiked(result.isLiked);
          setLikeCount(result.likeCount);
        }
      }
    } catch (error) {
      setIsLiked(!newLikedState);
      setLikeCount(prevCount => newLikedState ? prevCount - 1 : prevCount + 1);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (!data?.talent) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.talent.name} - ${data.talent.role} | 3YESES`,
          text: `Check out ${data.talent.name}'s profile on 3YESES`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900"><LoadingSpinner /></div>;
  if (error) return <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900"><ErrorMessage message={error} /></div>;
  if (!data) return null;

  const { talent } = data;

  const isVisible = (setting: keyof NonNullable<Talent['profileSettings']>) => {
    return talent.profileSettings?.[setting] !== false;
  };

  const getSocialProofData = (talent: Talent) => {
    const isPopular = talent.rating >= 4.5 && talent.viewCount > 100;
    
    let badge;
    if (isPopular) badge = 'Top Rated';
    else if (talent.rating >= 4.0) badge = 'Popular Choice';
    else badge = 'Rising Star';
    
    return {
      isPopular,
      badge
    };
  };

  const socialProof = getSocialProofData(talent);
  const bannerStyle = resolveBannerStyle(editData.bannerUrl || talent.bannerUrl);

  const path = new URLSearchParams(window.location.search).get('path');
  const breadcrumbPath = path ? path.split(',') : [talent.category];

  const breadcrumbItems = [
    { label: 'Home', href: `/${locale}` },
    ...breadcrumbPath.map(item => ({ label: item.charAt(0).toUpperCase() + item.slice(1), href: `/${locale}/categories/${item.toLowerCase()}` })),
    { label: talent.name },
  ];

  const portfolioIcons = {
    video: <Film size={24} />,
    image: <ImageIcon size={24} />,
    audio: <Music size={24} />,
  };

  const handleSkillClick = (skill: string) => {
    router.push(`/${locale}/hub?q=${encodeURIComponent(skill)}`);
  };

  const handleLanguageClick = (language: string) => {
    router.push(`/${locale}/hub?q=${encodeURIComponent(language)}`);
  };

  const handleLocationClick = () => {
    router.push(`/${locale}/hub?q=${encodeURIComponent(talent.location)}`);
  };

  const handleCategoryClick = () => {
    router.push(`/${locale}/categories/${talent.category.toLowerCase()}`);
  };

  const openGallery = (index: number) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const getPeriod = (start: string | Date, end?: string | Date | null, isCurrent?: boolean) => {
    const startYear = new Date(start).getFullYear();
    if (isCurrent || !end) return `${startYear} - Present`;
    const endYear = new Date(end).getFullYear();
    return startYear === endYear ? `${startYear}` : `${startYear} - ${endYear}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-primary-blue selection:text-white">
      
      {/* Hero Section */}
      <div className="relative w-full bg-white dark:bg-gray-900 overflow-hidden">
        {/* Banner Background */}
        <div className="absolute inset-0 z-0">
          {bannerStyle ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={bannerStyle}
            />
          ) : (
            <>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 via-purple-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 opacity-80"></div>
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 -left-24 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl"></div>
            </>
          )}
          <div className="absolute inset-0 bg-black/5 dark:bg-black/40"></div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <Breadcrumbs items={breadcrumbItems} />
          {isOwnProfile && (
            <div className="absolute top-6 right-4 flex items-center gap-2">
              {saveMessage && (
                <span className="text-xs px-2 py-1 rounded bg-gray-900/80 text-white">{saveMessage}</span>
              )}
              {editMode ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-lg font-semibold transition-colors bg-green-600 text-white hover:bg-green-700 disabled:opacity-70"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditData({
                        name: data.talent.name,
                        location: data.talent.location,
                        role: data.talent.role,
                        bio: data.talent.bio,
                        avatarUrl: data.talent.avatarUrl,
                        bannerUrl: data.talent.bannerUrl,
                        skills: data.talent.skills,
                        gender: data.talent.gender,
                        age: data.talent.age,
                        ethnicity: data.talent.ethnicity,
                        height: data.talent.height,
                        eyeColor: data.talent.eyeColor,
                        hairColor: data.talent.hairColor,
                        bodyType: data.talent.bodyType,
                        languages: data.talent.languages,
                      });
                      setNewSkill('');
                      setNewLanguage('');
                    }}
                    className="px-4 py-2 rounded-lg font-semibold transition-colors bg-gray-600 text-white hover:bg-gray-700"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 rounded-lg font-semibold transition-colors bg-blue-600 dark:bg-red-600 text-white hover:bg-blue-700 dark:hover:bg-red-700"
                >
                  <Edit2 size={18} />
                </button>
              )}
            </div>
          )}
          
          <div className="mt-8 flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 shadow-lg bg-gray-100 dark:bg-gray-800">
                <SafeAvatarImage
                  src={editMode && editData.avatarUrl ? editData.avatarUrl : talent.avatarUrl}
                  alt={talent.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {editMode && isOwnProfile && (
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer flex flex-col items-center gap-2">
                    {uploadingAvatar ? (
                      <span className="text-white text-xs font-semibold">Uploading...</span>
                    ) : (
                      <>
                        <span className="text-white text-2xl">📷</span>
                        <span className="text-white text-xs font-semibold">Change Photo</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAvatarUpload(file);
                      }}
                      disabled={uploadingAvatar}
                    />
                  </label>
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-gray-800 shadow-sm" title="Available for work"></div>
            </div>

            {/* Info Section */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-red-900/30 dark:text-red-300 uppercase tracking-wider">
                      {talent.category}
                    </span>
                    {socialProof.isPopular && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-red-900/30 dark:text-red-300 uppercase tracking-wider">
                        <Sparkles size={12} /> {socialProof.badge}
                      </span>
                    )}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">
                    {editMode ? (
                      <input
                        type="text"
                        value={editData.name || talent.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="bg-transparent border-b-2 border-blue-500 dark:border-red-500 outline-none w-full"
                      />
                    ) : (
                      talent.name
                    )}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-gray-600 dark:text-gray-400">
                    <button onClick={handleCategoryClick} className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-red-400 transition-colors">
                      <Briefcase size={18} />
                      {editMode ? (
                        <input
                          type="text"
                          value={editData.role || talent.role}
                          onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                          className="bg-transparent border-b border-blue-500 dark:border-red-500 outline-none font-medium"
                        />
                      ) : (
                        <span className="font-medium">{talent.role}</span>
                      )}
                    </button>
                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                    <button onClick={handleLocationClick} className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-red-400 transition-colors">
                      <MapPin size={18} />
                      {editMode ? (
                        <input
                          type="text"
                          value={editData.location || talent.location}
                          onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                          className="bg-transparent border-b border-blue-500 dark:border-red-500 outline-none font-medium"
                        />
                      ) : (
                        <span className="font-medium">{talent.location}</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 border ${
                      isLiked 
                        ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-red-500 hover:text-blue-500 dark:hover:text-red-400'
                    }`}
                  >
                    <CheckCircle2 size={20} />
                    {likeCount}
                  </button>
                  <button 
                    onClick={handleShare}
                    className="relative p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-blue-600 dark:hover:text-red-400 transition-colors shadow-sm"
                  >
                    <Share2 size={20} />
                    {isShared && (
                      <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap animate-fade-in">
                        Link Copied!
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Stats Row - Only show if user allows */}
              {isVisible('showViewCount') && (
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider mb-1">Views Today</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <TrendingUp size={18} className="text-blue-500 dark:text-red-500" />
                      {viewsToday}
                    </div>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider mb-1">Total Views</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Eye size={18} className="text-blue-500 dark:text-red-500" />
                      {talent.viewCount || 0}
                    </div>
                  </div>
                </div>
              )}

              {editMode && isOwnProfile && (
                <div className="mt-6 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Banner</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowBannerPicker(!showBannerPicker)}
                        className="text-xs font-semibold text-blue-600 dark:text-red-400 hover:underline"
                      >
                        {showBannerPicker ? 'Hide options' : 'Choose banner'}
                      </button>
                      <label className="text-xs font-semibold text-blue-600 dark:text-red-400 hover:underline cursor-pointer">
                        {uploadingBanner ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleBannerUpload(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  {showBannerPicker && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {bannerPresets.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => setEditData(prev => ({ ...prev, bannerUrl: preset.id }))}
                          className={`h-12 rounded-lg border ${
                            editData.bannerUrl === preset.id
                              ? 'border-blue-500 dark:border-red-500'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                          style={{ backgroundImage: preset.gradient }}
                          title={preset.label}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (Content) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Tabs Navigation */}
            <div className="flex items-center gap-8 border-b border-gray-200 dark:border-gray-800 mb-8 overflow-x-auto">
              {['media', 'about'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-3 text-lg font-semibold capitalize whitespace-nowrap transition-all relative ${
                    activeTab === tab 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'media' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Featured Video */}
                  {talent.videoUrl && (
                    <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-900/5 dark:ring-white/10 bg-black aspect-video">
                      <VideoPlayer url={talent.videoUrl} className="w-full h-full" />
                    </div>
                  )}

                  {/* Media Grid */}
                  {talent.portfolio && talent.portfolio.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {talent.portfolio.map((item: Talent['portfolio'][0], index: number) => (
                        <button
                          key={item.url}
                          onClick={() => openGallery(index)}
                          className="group relative aspect-video rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                        >
                          {/* Media Content */}
                          {item.type === 'image' && (
                            <Image
                              src={item.thumbnail || item.url}
                              alt={item.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              unoptimized
                            />
                          )}
                          {item.type === 'video' && (
                            item.thumbnail ? (
                              <Image
                                src={item.thumbnail}
                                alt={item.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                unoptimized
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-600/30 dark:to-purple-600/30" />
                            )
                          )}
                          {item.type === 'audio' && (
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-orange-500/20 dark:from-pink-600/30 dark:to-orange-600/30" />
                          )}
                          
                          {/* Overlay with Icon and Title */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-white/90 dark:bg-gray-900/90 flex items-center justify-center text-blue-600 dark:text-red-400">
                                  {portfolioIcons[item.type]}
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-white bg-blue-600 dark:bg-red-600 px-2 py-0.5 rounded">
                                  {item.type}
                                </span>
                              </div>
                              <h3 className="text-base font-bold text-white">{item.title}</h3>
                            </div>
                          </div>

                          {/* Play Icon for Videos */}
                          {item.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-gray-900/90 flex items-center justify-center text-blue-600 dark:text-red-400 shadow-2xl group-hover:scale-110 transition-transform">
                                <PlayCircle size={32} />
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Biography</h3>
                    {editMode && isOwnProfile ? (
                      <textarea
                        value={editData.bio || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself, your experience, and what makes you unique..."
                        className="w-full min-h-[200px] text-lg text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500 resize-y"
                      />
                    ) : (
                      <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                        {talent.bio}
                      </p>
                    )}
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Work History</h3>
                    <div className="space-y-8">
                      {talent.workHistory && talent.workHistory.length > 0 ? (
                        talent.workHistory.map((work, index) => (
                          <div key={index} className="relative pl-8 border-l-2 border-gray-200 dark:border-gray-700 last:border-0">
                            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                              work.isCurrent ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <h4 className="text-lg font-bold text-gray-900 dark:text-white">{work.title}</h4>
                              <span className="text-sm text-gray-500 dark:text-gray-400">• {work.company}</span>
                            </div>
                            {work.description && (
                              <p className="text-gray-600 dark:text-gray-300 mb-2">{work.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-gray-500 dark:text-gray-400 font-medium">
                                {getPeriod(work.startDate, work.endDate, work.isCurrent)}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                work.isCurrent 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {work.isCurrent ? 'Current' : 'Completed'}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">No work history added yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit">
            
            {/* Skills Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Zap size={20} className="text-blue-500 dark:text-red-500" />
                  Skills & Expertise
                </h3>
                {editMode && isOwnProfile && (
                  <span className="text-xs font-semibold text-blue-600 dark:text-red-400">Edit</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {(editData.skills || []).map((skill, idx) => (
                  <div key={idx} className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    editMode && isOwnProfile
                      ? 'bg-blue-100 dark:bg-red-900/30 text-blue-700 dark:text-red-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-red-900/50'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-red-900/50 dark:hover:text-red-300'
                  } transition-colors`}>
                    {skill}
                    {editMode && isOwnProfile && (
                      <button
                        onClick={() => setEditData(prev => ({ ...prev, skills: prev.skills?.filter(s => s !== skill) }))}
                        className="ml-1 text-lg leading-none opacity-70 hover:opacity-100"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {editMode && isOwnProfile && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newSkill.trim()) {
                        setEditData(prev => ({
                          ...prev,
                          skills: [...(prev.skills || []), newSkill.trim()]
                        }));
                        setNewSkill('');
                      }
                    }}
                    placeholder="Add skill (Enter to add)"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500"
                  />
                  <button
                    onClick={() => {
                      if (newSkill.trim()) {
                        setEditData(prev => ({
                          ...prev,
                          skills: [...(prev.skills || []), newSkill.trim()]
                        }));
                        setNewSkill('');
                      }
                    }}
                    className="px-3 py-2 text-sm font-semibold bg-blue-600 dark:bg-red-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-red-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <User size={20} className="text-blue-500 dark:text-red-500" />
                  Personal Details
                </h3>
                {editMode && isOwnProfile && (
                  <span className="text-xs font-semibold text-blue-600 dark:text-red-400">Edit</span>
                )}
              </div>
              <div className="space-y-4">
                {/* Gender */}
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Gender</span>
                  {editMode && isOwnProfile ? (
                    <select
                      value={editData.gender || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, gender: e.target.value }))}
                      className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500"
                    >
                      <option value="">Select</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="NON_BINARY">Non-Binary</option>
                      <option value="PREFER_NOT_TO_SAY">Prefer Not To Say</option>
                    </select>
                  ) : (
                    <span className="font-medium text-gray-900 dark:text-white capitalize">{talent.gender || '-'}</span>
                  )}
                </div>

                {/* Age */}
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500 dark:text-gray-400">Age</span>
                  {editMode && isOwnProfile ? (
                    <input
                      type="number"
                      value={editData.age || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : null }))}
                      className="w-20 px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500"
                      min="18"
                      max="100"
                    />
                  ) : (
                    <span className="font-medium text-gray-900 dark:text-white">{talent.age ? `${talent.age} Years` : '-'}</span>
                  )}
                </div>

                {/* Ethnicity */}
                {(editMode && isOwnProfile) || talent.ethnicity ? (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Ethnicity</span>
                    {editMode && isOwnProfile ? (
                      <select
                        value={editData.ethnicity || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, ethnicity: e.target.value }))}
                        className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500"
                      >
                        <option value="">Select</option>
                        <option value="WHITE_CAUCASIAN">White / Caucasian</option>
                        <option value="BLACK_AFRICAN">Black / African</option>
                        <option value="ASIAN">Asian</option>
                        <option value="HISPANIC_LATINO">Hispanic / Latino</option>
                        <option value="MIXED_MULTIRACIAL">Mixed / Multiracial</option>
                      </select>
                    ) : (
                      <span className="font-medium text-gray-900 dark:text-white capitalize">{talent.ethnicity?.replace('_', ' ') || '-'}</span>
                    )}
                  </div>
                ) : null}

                {/* Height */}
                {(editMode && isOwnProfile) || (talent.height && talent.height > 0) ? (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Height</span>
                    {editMode && isOwnProfile ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={editData.height || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, height: e.target.value ? parseInt(e.target.value) : null }))}
                          className="w-20 px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500"
                          min="140"
                          max="220"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">cm</span>
                      </div>
                    ) : (
                      <span className="font-medium text-gray-900 dark:text-white">{talent.height && talent.height > 0 ? `${talent.height} cm` : '-'}</span>
                    )}
                  </div>
                ) : null}

                {/* Eye Color */}
                {(editMode && isOwnProfile) || talent.eyeColor ? (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">Eye Color</span>
                    {editMode && isOwnProfile ? (
                      <input
                        type="text"
                        value={editData.eyeColor || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, eyeColor: e.target.value }))}
                        placeholder="e.g., Brown"
                        className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500"
                      />
                    ) : (
                      <span className="font-medium text-gray-900 dark:text-white capitalize">{talent.eyeColor || '-'}</span>
                    )}
                  </div>
                ) : null}

                {/* Hair Color */}
                {(editMode && isOwnProfile) || talent.hairColor ? (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <span className="text-gray-500 dark:text-gray-400">Hair Color</span>
                    {editMode && isOwnProfile ? (
                      <input
                        type="text"
                        value={editData.hairColor || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, hairColor: e.target.value }))}
                        placeholder="e.g., Black"
                        className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500"
                      />
                    ) : (
                      <span className="font-medium text-gray-900 dark:text-white capitalize">{talent.hairColor || '-'}</span>
                    )}
                  </div>
                ) : null}

                {/* Body Type */}
                {(editMode && isOwnProfile) || talent.bodyType ? (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <span className="text-gray-500 dark:text-gray-400">Body Type</span>
                    {editMode && isOwnProfile ? (
                      <select
                        value={editData.bodyType || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, bodyType: e.target.value }))}
                        className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500"
                      >
                        <option value="">Select</option>
                        <option value="SLIM">Slim</option>
                        <option value="ATHLETIC">Athletic</option>
                        <option value="CURVY">Curvy</option>
                        <option value="AVERAGE">Average</option>
                        <option value="MUSCULAR">Muscular</option>
                        <option value="PLUS_SIZE">Plus Size</option>
                      </select>
                    ) : (
                      <span className="font-medium text-gray-900 dark:text-white capitalize">{talent.bodyType?.toLowerCase().replace('_', ' ') || '-'}</span>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Accessibility / Disabilities Card */}
            {talent.disabilities && talent.disabilities.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <User size={20} className="text-green-500" />
                  Accessibility
                </h3>
                <div className="flex flex-wrap gap-2">
                  {talent.disabilities.map((disability) => (
                    <span 
                      key={disability}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-800"
                    >
                      {disability}
                    </span>
                  ))}
                  {talent.disabilityOther && (
                    <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-800">
                      {talent.disabilityOther}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Social Media Card */}
            {talent.socialMedia && Array.isArray(talent.socialMedia) && talent.socialMedia.length > 0 && isVisible('showSocialMedia') && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <Share2 size={20} className="text-blue-500 dark:text-red-500" />
                  Social Media
                </h3>
                <div className="space-y-3">
                  {talent.socialMedia.map((social: any, index: number) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-red-900/20 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-red-400 transition-colors">
                        <Share2 size={16} />
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-red-400">
                        {social.platform}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Languages Card */}
            {isVisible('showLanguages') && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Languages size={20} className="text-blue-500 dark:text-red-500" />
                    Languages
                  </h3>
                  {editMode && isOwnProfile && (
                    <span className="text-xs font-semibold text-blue-600 dark:text-red-400">Edit</span>
                  )}
                </div>
                <div className="space-y-2 mb-4">
                  {(editData.languages || []).map((language, idx) => (
                    <div
                      key={idx}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                        editMode && isOwnProfile
                          ? 'bg-blue-50 dark:bg-red-900/20 hover:bg-blue-100 dark:hover:bg-red-900/30'
                          : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-red-900/20'
                      }`}
                    >
                      <span className={`font-medium ${editMode && isOwnProfile ? 'text-blue-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        {language}
                      </span>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500" />
                        {editMode && isOwnProfile && (
                          <button
                            onClick={() => setEditData(prev => ({ ...prev, languages: prev.languages?.filter(l => l !== language) }))}
                            className="text-lg leading-none opacity-70 hover:opacity-100 text-red-500 ml-2"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {editMode && isOwnProfile && (
                  <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newLanguage.trim()) {
                          setEditData(prev => ({
                            ...prev,
                            languages: [...(prev.languages || []), newLanguage.trim()]
                          }));
                          setNewLanguage('');
                        }
                      }}
                      placeholder="Add language (Enter to add)"
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-red-500"
                    />
                    <button
                      onClick={() => {
                        if (newLanguage.trim()) {
                          setEditData(prev => ({
                            ...prev,
                            languages: [...(prev.languages || []), newLanguage.trim()]
                          }));
                          setNewLanguage('');
                        }
                      }}
                      className="px-3 py-2 text-sm font-semibold bg-blue-600 dark:bg-red-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-red-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Similar Talent Section */}
        {data.suggestions && data.suggestions.length > 0 && (
          <div className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Similar Talent</h2>
              <button 
                onClick={handleCategoryClick}
                className="text-blue-600 dark:text-red-400 font-semibold hover:underline"
              >
                View All in {talent.category}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.suggestions.map((suggestion) => (
                <TalentCard key={suggestion.id} talent={suggestion} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Gallery Viewer */}
      {talent.portfolio && (
        <GalleryViewer
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          items={talent.portfolio}
          initialIndex={galleryIndex}
        />
      )}
    </div>
  );
}
