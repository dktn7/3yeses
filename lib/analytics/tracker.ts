// Analytics tracking utilities
export class AnalyticsTracker {
  /**
   * Track profile view
   * Call this when a user views a talent profile
   */
  static async trackProfileView(
    talentProfileId: string,
    userId?: string,
    duration?: number
  ) {
    try {
      const response = await fetch('/api/analytics/profile-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          talentProfileId,
          userId,
          referrer: document.referrer,
          duration,
        }),
      });

      if (!response.ok) {
        console.error('Failed to track profile view');
      }
    } catch (error) {
      console.error('Profile view tracking error:', error);
    }
  }

  /**
   * Track portfolio item view
   * Call this when a user views a portfolio item
   */
  static async trackPortfolioView(
    portfolioItemId: string,
    userId?: string,
    duration?: number,
    completed?: boolean
  ) {
    try {
      const response = await fetch('/api/analytics/portfolio-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioItemId,
          userId,
          duration,
          completed,
        }),
      });

      if (!response.ok) {
        console.error('Failed to track portfolio view');
      }
    } catch (error) {
      console.error('Portfolio view tracking error:', error);
    }
  }

  /**
   * Track search appearance
   * Call this when a talent appears in search results
   */
  static async trackSearchAppearance(
    talentProfileId: string,
    searchQuery: string,
    searchFilters?: any,
    position?: number,
    clicked?: boolean
  ) {
    try {
      const response = await fetch('/api/analytics/search-appearance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          talentProfileId,
          searchQuery,
          searchFilters,
          position,
          clicked,
        }),
      });

      if (!response.ok) {
        console.error('Failed to track search appearance');
      }
    } catch (error) {
      console.error('Search appearance tracking error:', error);
    }
  }

  /**
   * Create a video view tracker with duration and completion tracking
   */
  static createVideoTracker(portfolioItemId: string, userId?: string) {
    let startTime = Date.now();
    let tracked = false;

    return {
      onPlay: () => {
        startTime = Date.now();
      },
      onEnded: () => {
        if (!tracked) {
          const duration = Math.floor((Date.now() - startTime) / 1000);
          this.trackPortfolioView(portfolioItemId, userId, duration, true);
          tracked = true;
        }
      },
      onTimeUpdate: (currentTime: number, totalTime: number) => {
        // Track view after 30 seconds or 25% completion, whichever comes first
        if (!tracked && (currentTime > 30 || currentTime / totalTime > 0.25)) {
          const duration = Math.floor((Date.now() - startTime) / 1000);
          this.trackPortfolioView(portfolioItemId, userId, duration, false);
          tracked = true;
        }
      },
    };
  }

  /**
   * Create a profile page view tracker with time spent
   */
  static createProfileTracker(talentProfileId: string, userId?: string) {
    const startTime = Date.now();
    let tracked = false;

    // Track view after 5 seconds on page
    const timer = setTimeout(() => {
      if (!tracked) {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        this.trackProfileView(talentProfileId, userId, duration);
        tracked = true;
      }
    }, 5000);

    // Cleanup and final track on page leave
    return () => {
      clearTimeout(timer);
      if (!tracked) {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        // Only track if user spent more than 3 seconds
        if (duration >= 3) {
          this.trackProfileView(talentProfileId, userId, duration);
        }
      }
    };
  }
}
