# Analytics Integration Guide

This guide shows how to integrate analytics tracking into your talent platform pages.

## API Endpoints

### Track Profile View
```typescript
POST /api/analytics/profile-view
Body: {
  talentProfileId: string,
  userId?: string,
  referrer: string,
  duration?: number
}
```

### Track Portfolio View
```typescript
POST /api/analytics/portfolio-view
Body: {
  portfolioItemId: string,
  userId?: string,
  duration?: number,
  completed?: boolean
}
```

### Track Search Appearance
```typescript
POST /api/analytics/search-appearance
Body: {
  talentProfileId: string,
  searchQuery: string,
  searchFilters?: any,
  position?: number,
  clicked?: boolean
}
```

### Get Analytics Dashboard
```typescript
GET /api/analytics/dashboard?days=30
Returns: {
  overview: {
    totalViews: number,
    uniqueViewers: number,
    totalPortfolioViews: number,
    totalLikes: number,
    searchImpressions: number,
    searchClicks: number,
    searchCTR: number,
    engagementRate: string
  },
  dailyStats: DailyStats[],
  topPortfolioItems: PortfolioItem[],
  recentViews: RecentView[]
}
```

## Using the Analytics Tracker

### 1. Profile Page Tracking

```typescript
'use client';

import { useEffect } from 'react';
import { AnalyticsTracker } from '@/lib/analytics/tracker';

export default function TalentProfilePage() {
  const talentProfileId = 'profile-id';

  useEffect(() => {
    // Track profile view after 5 seconds or on page leave
    const cleanup = AnalyticsTracker.createProfileTracker(talentProfileId);
    
    return cleanup; // Cleanup on unmount
  }, [talentProfileId]);

  return <div>Profile content...</div>;
}
```

### 2. Video Portfolio Item Tracking

```typescript
'use client';

import { AnalyticsTracker } from '@/lib/analytics/tracker';

export default function VideoPlayer({ portfolioItemId }: { portfolioItemId: string }) {
  const tracker = AnalyticsTracker.createVideoTracker(portfolioItemId);

  return (
    <video
      onPlay={tracker.onPlay}
      onEnded={tracker.onEnded}
      onTimeUpdate={(e) => {
        const video = e.currentTarget;
        tracker.onTimeUpdate(video.currentTime, video.duration);
      }}
    >
      <source src="/video.mp4" />
    </video>
  );
}
```

### 3. Search Results Tracking

```typescript
'use client';

import { AnalyticsTracker } from '@/lib/analytics/tracker';

export default function SearchResults({ results }: { results: Talent[] }) {
  const searchQuery = 'actor in New York';
  const searchFilters = { location: 'New York', category: 'acting' };

  // Track impressions when results are displayed
  useEffect(() => {
    results.forEach((talent, index) => {
      AnalyticsTracker.trackSearchAppearance(
        talent.id,
        searchQuery,
        searchFilters,
        index + 1, // position
        false // not clicked yet
      );
    });
  }, [results]);

  // Track click when user clicks on a result
  const handleClick = (talent: Talent, position: number) => {
    AnalyticsTracker.trackSearchAppearance(
      talent.id,
      searchQuery,
      searchFilters,
      position,
      true // clicked
    );
  };

  return (
    <div>
      {results.map((talent, index) => (
        <div key={talent.id} onClick={() => handleClick(talent, index + 1)}>
          {talent.name}
        </div>
      ))}
    </div>
  );
}
```

### 4. Image/Audio Portfolio Tracking

```typescript
'use client';

import { AnalyticsTracker } from '@/lib/analytics/tracker';

export default function ImagePortfolio({ portfolioItemId }: { portfolioItemId: string }) {
  const handleClick = () => {
    // Track view when image is opened
    AnalyticsTracker.trackPortfolioView(portfolioItemId);
  };

  return (
    <img
      src="/image.jpg"
      onClick={handleClick}
      alt="Portfolio"
    />
  );
}
```

## Analytics Dashboard

Access the analytics dashboard at `/dashboard/analytics`:

-- **Overview Cards**: Total views, portfolio views, search performance
- **Profile Views Trend**: Line chart showing daily views and unique views
- **Portfolio Engagement**: Bar chart showing daily portfolio views
- **Search Performance**: Line chart comparing impressions vs clicks
- **Top Portfolio Items**: Ranked list of most viewed items
- **Recent Views**: Table of latest profile viewers
- **Time Range Selector**: 7 days, 30 days, or 90 days

## Database Schema

### ProfileView
- Tracks each profile page view
- Stores viewer info, IP, user agent, referrer, duration
- Auto-increments talent profile viewCount

### PortfolioView
- Tracks individual portfolio item views
- Records duration and completion status (for videos/audio)

### SearchAppearance
- Records when talent appears in search results
- Tracks position, search query, filters, and click-through

### ProfileStats
- Daily aggregated statistics per talent profile
- Views, unique views, portfolio views, search impressions/clicks
- Unique constraint on [talentProfileId, date]

## Best Practices

1. **Profile Views**: Track after user spends 5+ seconds on page
2. **Video Views**: Track when user watches 25%+ or 30+ seconds
3. **Search Impressions**: Track when results render
4. **Search Clicks**: Track separately when user clicks result
5. **Portfolio Views**: Track immediately on open/play
6. **Duration Tracking**: Measure time spent on content
7. **Anonymous Users**: Support tracking without userId

## Privacy Considerations

- IP addresses are hashed for privacy
- User agents stored for analytics only
- Anonymous tracking supported
- GDPR compliant with opt-out options
- Data retention: 90 days for detailed views, lifetime for aggregated stats
POST /api/admin/init-missing-profilesPOST /api/admin/init-missing-profilesPOST /api/admin/init-missing-profiles