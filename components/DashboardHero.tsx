"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Eye, TrendingUp, Award, Sparkles, Image as ImageIcon, Zap } from 'lucide-react';
import SafeAvatarImage from './SafeAvatarImage';
import SwoopingTick from './SwoopingTick';

interface TalentProfile {
  avatarUrl?: string;
  role?: string;
  displayName?: string;
  bio?: string;
  skills?: string[];
  portfolio?: any[];
}

interface Stats {
  totalViews?: number;
  totalLikes?: number;
}

interface Props {
  displayName: string;
  formattedDay: string;
  profileCompletion: number;
  talentProfile: TalentProfile | null;
  stats: Stats;
  savedCount: number;
  locale: string;
  userId: string;
}

export default function DashboardHero({ displayName, formattedDay, profileCompletion, talentProfile, stats, savedCount, locale, userId }: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [modal, setModal] = useState<{ label: string; action: string } | null>(null);

  // Breakdown items computed from profile (smart calculations)
  // Skills: 0/4 = 0%, 1/4 = 25%, 2/4 = 50%, 3/4 = 75%, 4+ = 100%
  // Media: 0/4 = 0%, 1/4 = 25%, 2/4 = 50%, 3/4 = 75%, 4+ = 100%
  const skillsCount = talentProfile?.skills?.length ?? 0;
  const mediaCount = talentProfile?.portfolio?.length ?? 0;
  const skillsPercent = Math.min(100, Math.floor((skillsCount / 4) * 100));
  const mediaPercent = Math.min(100, Math.floor((mediaCount / 4) * 100));

  const breakdown = [
    { label: 'Avatar', percent: talentProfile?.avatarUrl ? 100 : 0, action: 'avatar', current: talentProfile?.avatarUrl ? 1 : 0, target: 1 },
    { label: 'Bio', percent: talentProfile?.bio && talentProfile.bio.trim().length > 0 ? 100 : 0, action: 'bio', current: talentProfile?.bio && talentProfile.bio.trim().length > 0 ? 1 : 0, target: 1 },
    { label: 'Skills', percent: skillsPercent, action: 'skills', current: skillsCount, target: 4 },
    { label: 'Media', percent: mediaPercent, action: 'media', current: mediaCount, target: 4 },
  ];
  // Pie chart constants (even larger radius for clarity)
  const R = 60; // Larger radius for better visibility
  const segmentColors = [
    '#FDB642', // Avatar (golden yellow)
    '#2563EB', // Bio (brand blue)
    '#60A5FA', // Skills (light blue)
    '#EF4444', // Media (brand red)
  ];
  
  // Calculate pie chart slices - each section represents 25% of the total profile
  // So the angle for each section is: (sectionPercent / 100) * 90 degrees (since 25% of 360 = 90)
  const segs = breakdown.map((b, i) => ({
    ...b,
    color: segmentColors[i % segmentColors.length],
    percent: b.percent,
    piePercent: (b.percent / 100) * 25, // Convert section completion to percentage of total pie
  }));
  
  let startAngle = -90;
  const arcs = segs.map((seg, i) => {
    const angle = (seg.piePercent / 100) * 360; // piePercent is already calculated as portion of whole
    const endAngle = startAngle + angle;
    const large = angle > 180 ? 1 : 0;
    const rad = (a: number) => (a * Math.PI) / 180;
    const cx = 64; // Center for larger chart
    const cy = 64;
    const x1 = cx + R * Math.cos(rad(startAngle));
    const y1 = cy + R * Math.sin(rad(startAngle));
    const x2 = cx + R * Math.cos(rad(endAngle));
    const y2 = cy + R * Math.sin(rad(endAngle));
    const path = `M${cx} ${cy} L${x1} ${y1} A${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`;
    const arcObj = {
      path,
      color: seg.color,
      percent: seg.percent,
      piePercent: seg.piePercent,
      label: seg.label,
      idx: i,
      action: seg.action,
      midAngle: (startAngle + endAngle) / 2,
    };
    startAngle = endAngle + 2; // Small gap between segments
    return arcObj;
  });

  // Helper functions for contextual navigation
  const getActionLink = (action: string): string => {
    switch (action) {
      case 'media':
        return `/${locale}/dashboard/gallery`; // Gallery page
      case 'skills':
        return `/${locale}/dashboard/profile#skills`; // Skills editor
      case 'avatar':
        return `/${locale}/dashboard/profile#avatar`; // Avatar upload
      case 'bio':
        return `/${locale}/dashboard/profile#bio`; // Bio editor
      default:
        return `/${locale}/dashboard/profile`;
    }
  };

  const getActionLabel = (action: string): string => {
    switch (action) {
      case 'media':
        return 'Upload Media';
      case 'skills':
        return 'Add Skills';
      case 'avatar':
        return 'Upload Avatar';
      case 'bio':
        return 'Write Bio';
      default:
        return 'Edit';
    }
  };

  const getCompletionButtonText = (action: string): string => {
    switch (action) {
      case 'media':
        return 'Complete Media';
      case 'skills':
        return 'Complete Skills';
      case 'avatar':
        return 'Add Avatar';
      case 'bio':
        return 'Complete Bio';
      default:
        return 'Complete Profile';
    }
  };

  // Find the first incomplete section
  const firstIncomplete = breakdown.find(item => item.percent < 100);
  const isProfileComplete = profileCompletion >= 100;

  return (
    <section className="relative rounded-2xl shadow-lg p-6 md:p-8 mb-8 overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      {/* Row 1: Welcome + Avatar + CTA */}
      <div className="flex items-start justify-between gap-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white flex-1">Welcome back, <span className="underline decoration-gray-300 dark:decoration-gray-700">{displayName}</span>!</h1>
        
        {/* Avatar in the gap */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="w-28 h-28 rounded-full overflow-hidden relative border-2 border-gray-300 dark:border-gray-700 shadow-md bg-gray-100 dark:bg-gray-800">
            <SafeAvatarImage src={talentProfile?.avatarUrl} alt={displayName} size={112} className="rounded-full object-cover" />
          </div>
          <p className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400">
            {talentProfile?.displayName || displayName}
          </p>
          {/* Date pill below avatar */}
          <div className="px-2 py-0.5 rounded-full text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 whitespace-nowrap">
            {formattedDay}
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href={`/talent/${userId}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] transition-all bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white whitespace-nowrap"
            aria-label="View public profile"
          >
            View Profile
          </Link>
          {!isProfileComplete && firstIncomplete && (
            <Link
              href={getActionLink(firstIncomplete.action)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] transition-all bg-blue-600 dark:bg-blue-700 text-white whitespace-nowrap"
              aria-label={`Complete ${firstIncomplete.label}`}
            >
              {getCompletionButtonText(firstIncomplete.action)}
            </Link>
          )}
        </div>
      </div>

      {/* Row 2: Profile completion overview */}
      <div className="mt-8 flex gap-8 items-start">
        {/* Left: Pie chart */}
        <div className="flex-shrink-0">
          <div
            ref={ringRef}
            className={`relative flex items-center justify-center ${profileCompletion < 100 ? 'animate-pulse-ring' : ''}`}
            aria-label="Profile completion pie chart"
          >
            <svg width="160" height="160" viewBox="0 0 128 128" className="rounded-full filter drop-shadow-sm" style={{ transform: 'scale(1.25)' }}>
            {arcs.map((arc, i) => (
              <path
                key={arc.label}
                d={arc.path}
                fill={arc.color}
                opacity={arc.percent > 0 ? 1 : 0.12}
                className={`transition-all duration-300 cursor-pointer ${
                  hoveredIdx === i ? 'drop-shadow-lg brightness-110' : ''
                }`}
                style={{ filter: hoveredIdx === i ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' : 'none' }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => arc.percent < 100 && setModal({ label: arc.label, action: arc.action })}
              />
            ))}
            {/* White center circle for donut effect */}
            <circle
              cx="64"
              cy="64"
              r="32"
              fill="white"
              className="dark:fill-gray-900"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.05))' }}
            />
          </svg>

          <div className="absolute text-center" style={{ transform: 'scale(1.25)' }}>
            <div className="text-gray-900 dark:text-white text-2xl font-extrabold w-full">{Math.round(profileCompletion)}%</div>
            <div className="text-gray-500 dark:text-gray-400 text-xs font-medium mt-0.5">Complete</div>
          </div>

          {/* Hover tooltip */}
          {hoveredIdx !== null && arcs[hoveredIdx] && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap z-10 pointer-events-none">
              <div className="font-semibold">{arcs[hoveredIdx].label}</div>
              <div className="text-xs text-gray-300 dark:text-gray-400">
                {breakdown[hoveredIdx].current} of {breakdown[hoveredIdx].target} • {arcs[hoveredIdx].percent}%
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
            </div>
          )}
          {/* Modal for breakdown CTA */}
          {modal && createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn" onClick={() => setModal(null)}>
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 min-w-[320px] max-w-xs relative" onClick={e => e.stopPropagation()}>
                <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl" onClick={() => setModal(null)} aria-label="Close">×</button>
                <div className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Complete your {modal.label}</div>
                <div className="mb-4 text-gray-700 dark:text-gray-200 text-sm">To finish your {modal.label.toLowerCase()}, go to your profile and add the missing info.</div>
                <Link
                  href={getActionLink(modal.action)}
                  className="inline-block px-4 py-2 rounded-lg font-semibold bg-blue-600 dark:bg-blue-700 text-white shadow hover:shadow-md hover:scale-[1.02] transition-all text-sm"
                  onClick={() => setModal(null)}
                >
                  {getActionLabel(modal.action)}
                </Link>
              </div>
            </div>,
            typeof window !== 'undefined' && document.body ? document.body : document.createElement('div')
          )}
          </div>
        </div>

        {/* Right: Breakdown legend */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Complete Your Profile</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Unlock features by completing each section</p>
          </div>
          <div className="space-y-4">
            {breakdown.map((item, i) => {
              const isComplete = item.percent === 100;
              const remaining = Math.max(0, item.target - item.current);
              
              return (
                <div key={item.label} className={`group ${isComplete ? 'opacity-60' : ''}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: segmentColors[i % segmentColors.length] }}
                      />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.label}</span>
                    </div>
                    <span className={`text-sm font-bold ${
                      isComplete 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {item.percent}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${item.percent}%`,
                        backgroundColor: segmentColors[i % segmentColors.length],
                        boxShadow: item.percent > 0 ? `0 1px 3px ${segmentColors[i % segmentColors.length]}40` : 'none'
                      }}
                    />
                  </div>
                  {!isComplete && (
                    <div className="mt-1.5">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                        {item.current} of {item.target} {remaining === 1 ? 'item' : 'items'} needed
                      </p>
                      <button
                        onClick={() => setModal({ label: item.label, action: item.action })}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-medium"
                      >
                        {remaining > 0 ? `Add ${remaining} more ${item.label.toLowerCase()}${remaining === 1 ? '' : 's'} →` : 'Complete now →'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Stats section with fun icons */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Portfolio Items */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500 dark:bg-blue-600 rounded-lg shadow-md">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{talentProfile?.portfolio?.length?.toLocaleString() ?? 0}</div>
              <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Portfolio Items</div>
            </div>
            <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400 opacity-50" />
          </div>
        </div>

        {/* Total Engagement */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/30 dark:to-green-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 dark:bg-emerald-600 rounded-lg shadow-md">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{((stats.totalViews ?? 0) + (stats.totalLikes ?? 0)).toLocaleString()}</div>
              <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Total Engagement</div>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400 opacity-50" />
          </div>
        </div>

        {/* Completion Badge */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-950/30 dark:to-yellow-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 dark:bg-amber-600 rounded-lg shadow-md">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{Math.round(profileCompletion)}%</div>
              <div className="text-xs font-medium text-amber-600 dark:text-amber-400">Profile Complete</div>
            </div>
            {profileCompletion === 100 && (
              <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-200 dark:bg-amber-900/50 px-2 py-1 rounded-full">
                <Sparkles className="w-3 h-3" />
                <span>Done!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
