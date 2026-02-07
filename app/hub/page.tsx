'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Heart,
  MessageCircle,
  Share,
  Filter,
  TrendingUp,
  Eye,
  Clock,
  Users,
  Music,
  Camera,
  Palette
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface VideoContent {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: string;
  subcategory: string;
  talentName: string;
  talentAvatar: string;
  views: number;
  likes: number;
  comments: number;
  duration: string;
  createdAt: string;
  isSponsored?: boolean;
  isTrending?: boolean;
}

interface CategoryFilter {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  count: number;
}

export default function HubPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryFilters: CategoryFilter[] = [
    { id: 'all', name: 'All', icon: Play, color: 'text-gray-600 dark:text-gray-400', count: 0 },
    { id: 'acting', name: 'Acting', icon: Camera, color: 'text-primary-blue dark:text-accent-red', count: 0 },
    { id: 'music', name: 'Music', icon: Music, color: 'text-primary-blue dark:text-accent-red', count: 0 },
    { id: 'dance', name: 'Dance', icon: Users, color: 'text-primary-blue dark:text-accent-red', count: 0 },
    { id: 'crew', name: 'Crew', icon: Palette, color: 'text-primary-blue dark:text-accent-red', count: 0 },
  ];

  // Mock data for demonstration
  const mockVideos: VideoContent[] = [
    {
      id: '1',
      title: 'Behind the Scenes: Professional Acting Reel',
      description: 'A day in the life of a professional actor showcasing different roles and techniques.',
      videoUrl: '/videos/acting-reel-1.mp4',
      thumbnailUrl: '/thumbnails/acting-reel-1.jpg',
      category: 'acting',
      subcategory: 'Film & TV',
      talentName: 'Sarah Johnson',
      talentAvatar: '/avatars/sarah.jpg',
      views: 12500,
      likes: 890,
      comments: 45,
      duration: '2:45',
      createdAt: '2 hours ago',
      isTrending: true
    },
    {
      id: '2',
      title: 'Original Music Composition Showcase',
      description: 'Live performance of an original song with behind-the-scenes production process.',
      videoUrl: '/videos/music-showcase.mp4',
      thumbnailUrl: '/thumbnails/music-showcase.jpg',
      category: 'music',
      subcategory: 'Singer-Songwriter',
      talentName: 'Marcus Chen',
      talentAvatar: '/avatars/marcus.jpg',
      views: 8200,
      likes: 560,
      comments: 32,
      duration: '4:12',
      createdAt: '4 hours ago',
      isSponsored: true
    },
    {
      id: '3',
      title: 'Contemporary Dance Workshop',
      description: 'Learn modern dance techniques with professional choreographer.',
      videoUrl: '/videos/dance-workshop.mp4',
      thumbnailUrl: '/thumbnails/dance-workshop.jpg',
      category: 'dance',
      subcategory: 'Contemporary',
      talentName: 'Elena Rodriguez',
      talentAvatar: '/avatars/elena.jpg',
      views: 15600,
      likes: 1200,
      comments: 78,
      duration: '6:30',
      createdAt: '6 hours ago'
    },
    {
      id: '4',
      title: 'Production Crew Equipment Demo',
      description: 'Latest camera equipment and lighting techniques for film production.',
      videoUrl: '/videos/crew-demo.mp4',
      thumbnailUrl: '/thumbnails/crew-demo.jpg',
      category: 'crew',
      subcategory: 'Camera & Lighting',
      talentName: 'Tech Productions',
      talentAvatar: '/avatars/tech-pro.jpg',
      views: 3400,
      likes: 234,
      comments: 18,
      duration: '8:15',
      createdAt: '1 day ago'
    }
  ];

  useEffect(() => {
    // Simulate loading videos
    const loadVideos = async () => {
      setLoading(true);
      setTimeout(() => {
        setVideos(mockVideos);
        setLoading(false);
      }, 1000);
    };

    loadVideos();
  }, [activeFilter, sortBy]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getCategoryIcon = (category: string) => {
    const categoryMap: Record<string, React.ComponentType<{ className?: string }>> = {
      acting: Camera,
      music: Music,
      dance: Users,
      crew: Palette,
    };
    return categoryMap[category] || Play;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header Section */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-screen-2xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Video Hub
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Discover amazing talent through video content
              </p>
            </div>

            {/* Filter and Sort Controls */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Category Filters */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  {categoryFilters.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveFilter(category.id)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          activeFilter === category.id
                            ? 'bg-primary-blue dark:bg-accent-red text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:text-primary-blue dark:hover:text-accent-red'
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-blue dark:focus:ring-accent-red"
              >
                <option value="trending">Trending</option>
                <option value="views">Most Views</option>
                <option value="likes">Most Likes</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
          </div>
        </div>
      </section>


      {/* Content Section */}
      <section className="py-6">
        <div className="max-w-screen-2xl mx-auto px-6">
          <div className="flex gap-6">
            {/* Main Content */}
            <div className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <LoadingSpinner inline />
                    <p className="text-gray-600 dark:text-gray-400">Loading amazing content...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                    >
                      {/* Video Thumbnail */}
                      <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 group cursor-pointer">
                        {/* Sponsored Badge */}
                        {video.isSponsored && (
                          <div className="absolute top-2 left-2 z-10">
                            <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                              Sponsored
                            </span>
                          </div>
                        )}

                        {/* Trending Badge */}
                        {video.isTrending && (
                          <div className="absolute top-2 right-2 z-10">
                            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Trending
                            </div>
                          </div>
                        )}

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black bg-opacity-50 rounded-full p-4 group-hover:bg-opacity-70 transition-all">
                            <Play className="h-8 w-8 text-white fill-current" />
                          </div>
                        </div>

                        {/* Duration */}
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                          {video.duration}
                        </div>

                        {/* Video Thumbnail Placeholder */}
                        <div className="w-full h-full bg-gradient-to-br from-primary-blue/20 to-accent-red/20 flex items-center justify-center">
                          <video
                            className="w-full h-full object-cover opacity-0"
                            poster={video.thumbnailUrl}
                          >
                            <source src={video.videoUrl} type="video/mp4" />
                          </video>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {video.talentName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
                                {video.title}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {video.talentName}
                              </p>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {video.description}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-3 w-3" />
                              <span>{formatNumber(video.views)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="h-3 w-3" />
                              <span>{formatNumber(video.likes)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{video.comments}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{video.createdAt}</span>
                          </div>
                        </div>

                        {/* Category Tags */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {(() => {
                              const IconComponent = getCategoryIcon(video.category);
                              return <IconComponent className="h-4 w-4 text-primary-blue dark:text-accent-red" />;
                            })()}
                            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {video.category}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {video.subcategory}
                            </span>
                          </div>
                          <button className="text-gray-400 hover:text-primary-blue dark:hover:text-accent-red">
                            <Share className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              </div>
          </div>

          {/* No Videos State */}
          {!loading && videos.length === 0 && (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No videos found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your filters or check back later for new content.
                </p>
                <button
                  onClick={() => setActiveFilter('all')}
                  className="bg-primary-blue dark:bg-accent-red text-white px-6 py-2 rounded-lg hover:bg-primary-blueHover dark:hover:bg-accent-red/80 transition-colors"
                >
                  View All Videos
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}