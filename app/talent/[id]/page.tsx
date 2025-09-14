'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Talent } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import TalentCard from '@/components/TalentCard';
import VideoPlayer from '@/components/VideoPlayer';
import Breadcrumbs from '@/components/Breadcrumbs';
import GalleryViewer from '@/components/GalleryViewer';
import { Briefcase, Star, MapPin, Languages, Film, ImageIcon, Music, Flag, Eye, Share2, Heart, MessageCircle, Users, TrendingUp, Building2, Calendar, ThumbsUp } from 'lucide-react';

type TalentProfileData = {
  talent: Talent;
  suggestions: Talent[];
};

export default function TalentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<TalentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch(`/api/talent/${id}`);
          if (!res.ok) {
            throw new Error('Failed to fetch talent data');
          }
          const result: TalentProfileData = await res.json();
          setData(result);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id]);

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
            // Fallback to talent data
            setLikeCount(data.talent.likeCount || 0);
            setIsLiked(data.talent.isLiked || false);
          }
        } catch (error) {
          console.error('Error fetching like status:', error);
          // Fallback to talent data
          setLikeCount(data.talent.likeCount || 0);
          setIsLiked(data.talent.isLiked || false);
        }
      }
    };
    
    fetchLikeStatus();
  }, [data, id]);

  // Handle like/unlike functionality
  const handleLike = async () => {
    if (isLiking) return; // Prevent multiple clicks
    
    setIsLiking(true);
    const newLikedState = !isLiked;
    const newLikeCount = newLikedState ? likeCount + 1 : likeCount - 1;
    
    // Optimistic update
    setIsLiked(newLikedState);
    setLikeCount(newLikeCount);
    
    try {
      const response = await fetch(`/api/talent/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ like: newLikedState }),
      });
      
      if (!response.ok) {
        // Revert on error
        setIsLiked(!newLikedState);
        setLikeCount(prevCount => newLikedState ? prevCount - 1 : prevCount + 1);
        console.error('Failed to update like status');
      } else {
        // Update with server response
        const result = await response.json();
        if (result.success) {
          setIsLiked(result.isLiked);
          setLikeCount(result.likeCount);
        }
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newLikedState);
      setLikeCount(prevCount => newLikedState ? prevCount - 1 : prevCount + 1);
      console.error('Error updating like status:', error);
    } finally {
      setIsLiking(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  if (error) return <div className="flex justify-center items-center h-screen"><ErrorMessage message={error} /></div>;
  if (!data) return null;

  const { talent, suggestions } = data;

  // Helper function to check if a profile setting is visible
  const isVisible = (setting: keyof NonNullable<Talent['profileSettings']>) => {
    return talent.profileSettings?.[setting] !== false; // Default to true if not set
  };

  // Dynamic social proof based on talent data
  const getSocialProofData = (talent: Talent) => {
    const viewsToday = Math.floor(talent.viewCount * 0.02) + Math.floor(Math.random() * 5) + 3; // 2% of total views + random 3-8
    const satisfactionRate = Math.floor(talent.rating * 18) + Math.floor(Math.random() * 8) + 4; // Rating-based satisfaction (88-100%)
    const isPopular = talent.rating >= 4.5 && talent.viewCount > 100;
    
    let badge;
    if (isPopular) {
      badge = 'Top Rated';
    } else if (talent.rating >= 4.0) {
      badge = 'Popular Choice';
    } else {
      badge = 'Rising Star';
    }
    
    return {
      viewsToday,
      satisfactionRate: Math.min(satisfactionRate, 99), // Cap at 99%
      isPopular,
      badge
    };
  };

  const socialProof = getSocialProofData(talent);

  const path = new URLSearchParams(window.location.search).get('path');
  const breadcrumbPath = path ? path.split(',') : [talent.category];

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    ...breadcrumbPath.map(item => ({ label: item.charAt(0).toUpperCase() + item.slice(1), href: `/categories?category=${item.toLowerCase()}` })),
    { label: talent.name },
  ];

  const portfolioIcons = {
    video: <Film size={32} />,
    image: <ImageIcon size={32} />,
    audio: <Music size={32} />,
  };

  const handleSkillClick = (skill: string) => {
    router.push(`/search?q=${encodeURIComponent(skill)}`);
  };

  const handleLanguageClick = (language: string) => {
    router.push(`/search?q=${encodeURIComponent(language)}`);
  };

  const handleLocationClick = () => {
    router.push(`/search?q=${encodeURIComponent(talent.location)}`);
  };

  const handleCategoryClick = () => {
    router.push(`/categories/${talent.category.toLowerCase()}`);
  };

  const openGallery = (index: number) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  const closeGallery = () => {
    setGalleryOpen(false);
  };

  // Sample work history based on talent type
  const getWorkHistory = (talentName: string, role: string) => {
    if (role.toLowerCase().includes('jazz') || role.toLowerCase().includes('singer')) {
      return [
        {
          title: "Lead Jazz Vocalist",
          company: "Blue Note Entertainment",
          period: "2022 - Present",
          description: "Regular performer at premium venues. Led 50+ successful events including corporate galas and wedding receptions.",
          status: "Active Contract",
          statusColor: "green",
          borderColor: "blue"
        },
        {
          title: "Featured Artist",
          company: "Metropolitan Jazz Festival",
          period: "2021 - 2022",
          description: "Headline performer for annual jazz festival. Collaborated with renowned musicians and performed for audiences of 2000+.",
          status: "Featured Role",
          statusColor: "blue",
          borderColor: "purple"
        },
        {
          title: "Session Vocalist",
          company: "Various Studios",
          period: "2019 - 2021",
          description: "Studio recording work for albums, commercials, and film soundtracks. Worked with Grammy-nominated producers.",
          status: "Completed",
          statusColor: "gray",
          borderColor: "orange"
        }
      ];
    } else if (role.toLowerCase().includes('actor')) {
      return [
        {
          title: "Lead Actor",
          company: "Independent Film Productions",
          period: "2022 - Present",
          description: "Principal roles in indie films and commercials. Worked on 15+ productions with professional directors.",
          status: "Active",
          statusColor: "green",
          borderColor: "blue"
        },
        {
          title: "Theater Performer",
          company: "City Theater Company",
          period: "2020 - 2022",
          description: "Featured in multiple stage productions including classics and contemporary works.",
          status: "Featured Role",
          statusColor: "blue",
          borderColor: "purple"
        }
      ];
    } else {
      return [
        {
          title: "Professional Performer",
          company: "Entertainment Collective",
          period: "2021 - Present",
          description: "Regular performances at corporate events, private parties, and entertainment venues.",
          status: "Active",
          statusColor: "green",
          borderColor: "blue"
        },
        {
          title: "Freelance Artist",
          company: "Various Clients",
          period: "2019 - 2021",
          description: "Independent projects and collaborations across different entertainment sectors.",
          status: "Completed",
          statusColor: "gray",
          borderColor: "orange"
        }
      ];
    }
  };

  const getBorderColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'border-blue-500';
      case 'purple': return 'border-purple-500';
      case 'orange': return 'border-orange-500';
      default: return 'border-gray-500';
    }
  };

  const getStatusColorClass = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'blue': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Main Content */}
      <div className="flex flex-col">
        <div className="container mx-auto p-4 lg:p-8">
          <Breadcrumbs items={breadcrumbItems} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Image 
              src={talent.avatarUrl || '/default-avatar.png'} 
              alt={talent.name} 
              width={128}
              height={128}
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700" 
            />
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white">{talent.name}</h1>
              <button 
                onClick={handleCategoryClick}
                className="text-xl text-gray-600 dark:text-gray-300 hover:text-primary-blue dark:hover:text-primary-blue transition-colors cursor-pointer"
                title={`Browse ${talent.category} category`}
              >
                {talent.role}
              </button>
              <div className="flex items-center gap-2 mt-2">
                <MapPin size={16} className="text-gray-500" />
                <button
                  onClick={handleLocationClick}
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-blue dark:hover:text-primary-blue transition-colors cursor-pointer"
                  title={`Find talents in ${talent.location}`}
                >
                  {talent.location}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons - Separate section */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="bg-primary-blue hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2">
              <MessageCircle size={18} />
              Enquire Now
            </button>
            <button 
              onClick={handleLike}
              disabled={isLiking}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                isLiked 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'border border-gray-300 hover:border-red-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:border-red-500 hover:text-red-500 dark:hover:text-red-400'
              } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ThumbsUp size={18} className={isLiked ? 'fill-current' : ''} />
              {isLiked ? 'Liked' : 'Like'} ({likeCount})
            </button>
            <button className="border border-gray-300 hover:border-gray-400 text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:border-gray-500 px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2">
              <Heart size={18} />
              Save to Favorites
            </button>
            <button className="border border-gray-300 hover:border-gray-400 text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:border-gray-500 px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2">
              <Share2 size={18} />
              Share Profile
            </button>
          </div>

          {/* Visual Portfolio - Combined Showreel and Portfolio */}
          {(talent.videoUrl || (talent.portfolio && talent.portfolio.length > 0)) && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold border-b-2 border-primary-blue pb-2 mb-6">Visual Portfolio</h2>
              
              {talent.videoUrl && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">Showreel</h3>
                  <VideoPlayer url={talent.videoUrl} />
                </div>
              )}

              {talent.portfolio && talent.portfolio.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
                    Portfolio Gallery ({talent.portfolio.length} items)
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {talent.portfolio.map((item, index) => (
                      <button
                        key={item.url}
                        onClick={() => openGallery(index)}
                        className="group block w-full text-left"
                      >
                        <div className="aspect-square w-full overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-700 transition-all duration-300 group-hover:scale-105 shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-600 cursor-pointer">
                          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 group-hover:text-primary-blue transition-colors p-4 relative">
                            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                              {portfolioIcons[item.type]}
                            </div>
                            <span className="text-xs text-center font-medium uppercase tracking-wide">
                              {item.type}
                            </span>
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                              <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium">
                                Click to view
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary-blue transition-colors truncate">{item.title}</h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500 capitalize font-medium">{item.type} Content</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle report functionality
                              }}
                              className="text-xs text-gray-400 hover:text-primary-red flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Flag size={10} /> Report
                            </button>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      💡 Click on any item to open gallery viewer
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-2xl font-semibold border-b-2 border-primary-blue pb-2 mb-4">About Me</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{talent.bio}</p>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold border-b-2 border-primary-blue pb-2 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {talent.skills.map(skill => (
                <button
                  key={skill}
                  onClick={() => handleSkillClick(skill)}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 hover:text-blue-900 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300 dark:hover:text-blue-200 transition-colors cursor-pointer border border-transparent hover:border-blue-300 dark:hover:border-blue-600"
                  title={`Search for talents with ${skill} skill`}
                >
                  {skill}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              💡 Click on any skill to find similar talents
            </p>
          </div>

          {/* Media Comments Section */}
          {isVisible('showRating') && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold border-b-2 border-primary-blue pb-2">Media Comments & Feedback</h2>
                <button className="text-primary-blue hover:text-blue-700 font-semibold">
                  Add Comment
                </button>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-3xl font-bold text-yellow-500">{talent.rating.toFixed(1)}</div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={`${talent.id}-rating-${i}`} size={16} className={i < Math.floor(talent.rating) ? "text-yellow-400 fill-current" : "text-gray-300"} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Based on 32 media comments</p>
                  </div>
                </div>
              </div>

            {/* Sample Media Comments */}
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={`${talent.id}-comment1-${i}`} size={14} className="text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-medium">Director Sarah M.</span>
                  <span className="text-xs text-gray-500">• &ldquo;Summer Dreams&rdquo; Production</span>
                  <span className="text-xs text-gray-500">2 weeks ago</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  &ldquo;Outstanding performance in our short film. Brought incredible depth to the character and was a joy to work with on set.&rdquo;
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(4)].map((_, i) => (
                      <Star key={`${talent.id}-comment2-${i}`} size={14} className="text-yellow-400 fill-current" />
                    ))}
                    <Star size={14} className="text-gray-300" />
                  </div>
                  <span className="text-sm font-medium">Producer Mike R.</span>
                  <span className="text-xs text-gray-500">• Commercial Campaign</span>
                  <span className="text-xs text-gray-500">1 month ago</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  &ldquo;Professional approach and excellent screen presence. Delivered exactly what our brand needed for the campaign.&rdquo;
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={`${talent.id}-comment3-${i}`} size={14} className="text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-medium">Casting Director Lisa K.</span>
                  <span className="text-xs text-gray-500">• Theater Production</span>
                  <span className="text-xs text-gray-500">2 months ago</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  &ldquo;Incredible stage presence and vocal range. The audience was captivated throughout the entire performance.&rdquo;
                </p>
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Social Proof */}
          {isVisible('showViewCount') && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-lg p-4 border border-blue-100 dark:border-gray-600">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300">{socialProof.badge}</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Users size={16} className="text-green-500" />
                  <span><strong>{socialProof.viewsToday} people</strong> viewed this profile today</span>
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>{socialProof.satisfactionRate}% client satisfaction</strong> rate
                </p>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
             <h3 className="text-xl font-semibold mb-4">Details</h3>
             <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-3"><Briefcase size={20} /> <span>{talent.experience} years of experience</span></li>
                <li className="flex items-center gap-3"><Star size={20} className="text-yellow-400" /> <span>{talent.rating.toFixed(1)}/5.0 Rating</span></li>
                <li className="flex items-center gap-3"><ThumbsUp size={20} className="text-red-500" /> <span>{likeCount} likes</span></li>
                {isVisible('showLanguages') && (
                  <li className="flex items-center gap-3">
                    <Languages size={20} />
                    <span className="flex flex-wrap gap-1">
                      {talent.languages.map((language, index) => (
                        <span key={language}>
                          <button
                            onClick={() => handleLanguageClick(language)}
                            className="hover:text-primary-blue transition-colors cursor-pointer underline decoration-dotted"
                            title={`Find ${language} speaking talents`}
                          >
                            {language}
                          </button>
                          {index < talent.languages.length - 1 && <span className="text-gray-500">, </span>}
                        </span>
                      ))}
                    </span>
                  </li>
                )}
                {isVisible('showViewCount') && (
                  <li className="flex items-center gap-3"><Eye size={20} className="text-blue-500" /> <span>{talent.viewCount.toLocaleString()} views</span></li>
                )}
             </ul>
           </div>
           
           {/* Work History */}
           {isVisible('showWorkHistory') && (
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
               <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                 <Building2 size={20} />
                 Work History
               </h3>
             <div className="space-y-4">
               {getWorkHistory(talent.name, talent.role).map((work, index) => (
                 <div key={`${talent.id}-work-${index}`} className={`border-l-4 pl-4 py-2 ${getBorderColorClass(work.borderColor)}`}>
                   <div className="flex items-start justify-between mb-2">
                     <div>
                       <h4 className="font-semibold text-gray-800 dark:text-white">{work.title}</h4>
                       <p className="text-sm text-gray-600 dark:text-gray-400">{work.company}</p>
                     </div>
                     <div className="text-right">
                       <div className="flex items-center gap-1 text-xs text-gray-500">
                         <Calendar size={12} />
                         <span>{work.period}</span>
                       </div>
                     </div>
                   </div>
                   <p className="text-sm text-gray-700 dark:text-gray-300">
                     {work.description}
                   </p>
                   <div className="flex items-center gap-2 mt-2">
                     <span className={`text-xs px-2 py-1 rounded ${getStatusColorClass(work.statusColor)}`}>
                       {work.status}
                     </span>
                   </div>
                 </div>
               ))}
             </div>
             
             <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
               <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                 💼 Professional experience spanning <strong>{talent.experience}+ years</strong> in the industry
                 <br />
                 <span className="mt-1 block">
                   Worked with <strong>{Math.floor(talent.experience * 8) + 5} clients</strong> across <strong>{Math.min(Math.floor(talent.experience / 2) + 2, 8)} different sectors</strong>
                 </span>
               </p>
             </div>
           </div>
           )}
        </div>
      </div>

      {/* Suggestions */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6 text-center">You Might Also Like</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(showAllSuggestions ? suggestions : suggestions.slice(0, 3)).map(s => (
            <TalentCard key={s.id} talent={s} />
          ))}
        </div>
        
        {suggestions.length > 3 && (
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAllSuggestions(!showAllSuggestions)}
              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {showAllSuggestions ? `Show Less` : `Show All ${suggestions.length} Suggestions`}
            </button>
          </div>
        )}
      </div>
      </div>
      </div>

      {/* Gallery Viewer */}
      {talent.portfolio && talent.portfolio.length > 0 && (
        <GalleryViewer
          items={talent.portfolio}
          initialIndex={galleryIndex}
          isOpen={galleryOpen}
          onClose={closeGallery}
        />
      )}
    </div>
  );
}