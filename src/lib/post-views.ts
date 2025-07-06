interface PostView {
  postId: number;
  slug: string;
  viewCount: number;
  lastViewed: string;
}

interface ViewsStorage {
  [key: string]: PostView;
}

class PostViewsManager {
  private storageKey = 'wphead-post-views';
  private apiEndpoint = '/api/post-views';

  // Get views from localStorage
  private getLocalViews(): ViewsStorage {
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading post views from localStorage:', error);
      return {};
    }
  }

  // Save views to localStorage
  private saveLocalViews(views: ViewsStorage): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(views));
    } catch (error) {
      console.error('Error saving post views to localStorage:', error);
    }
  }

  // Check if post was viewed recently (within 24 hours)
  private wasRecentlyViewed(postSlug: string): boolean {
    const views = this.getLocalViews();
    const postView = views[postSlug];
    
    if (!postView) return false;
    
    const lastViewed = new Date(postView.lastViewed);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastViewed.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff < 24; // Don't count as new view if within 24 hours
  }

  // Track a post view
  async trackView(postId: number, postSlug: string): Promise<number> {
    // Don't track if recently viewed
    if (this.wasRecentlyViewed(postSlug)) {
      return this.getViewCount(postSlug);
    }

    // Update local storage
    const views = this.getLocalViews();
    const currentView = views[postSlug] || { postId, slug: postSlug, viewCount: 0, lastViewed: '' };
    
    currentView.viewCount += 1;
    currentView.lastViewed = new Date().toISOString();
    views[postSlug] = currentView;
    
    this.saveLocalViews(views);

    // Send to server (fire and forget)
    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          slug: postSlug,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Error tracking view on server:', error);
    }

    return currentView.viewCount;
  }

  // Get view count for a specific post
  getViewCount(postSlug: string): number {
    const views = this.getLocalViews();
    return views[postSlug]?.viewCount || 0;
  }

  // Get all views data
  getAllViews(): ViewsStorage {
    return this.getLocalViews();
  }

  // Get popular posts (most viewed)
  getPopularPosts(limit: number = 10): PostView[] {
    const views = this.getLocalViews();
    return Object.values(views)
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
  }

  // Clear all view data
  clearAllViews(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.storageKey);
  }
}

// Export singleton instance
export const postViewsManager = new PostViewsManager();

// Hook for React components
export function usePostViews() {
  return {
    trackView: postViewsManager.trackView.bind(postViewsManager),
    getViewCount: postViewsManager.getViewCount.bind(postViewsManager),
    getAllViews: postViewsManager.getAllViews.bind(postViewsManager),
    getPopularPosts: postViewsManager.getPopularPosts.bind(postViewsManager),
    clearAllViews: postViewsManager.clearAllViews.bind(postViewsManager),
  };
} 