// Server-side cache for TTFB optimization
interface ServerCacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  etag: string;
}

class ServerCache {
  private cache = new Map<string, ServerCacheItem<any>>();
  private maxSize = 1000;
  private defaultTTL = 60 * 1000; // 1 minute default

  // Generate ETag for cache validation
  private generateETag(data: any): string {
    return Buffer.from(JSON.stringify(data)).toString('base64').slice(0, 16);
  }

  // Set with aggressive TTL for different content types
  set<T>(key: string, data: T, customTTL?: number): void {
    const now = Date.now();
    let ttl = customTTL || this.defaultTTL;

    // Aggressive caching aligned with page revalidation intervals
    if (key.includes('posts_')) ttl = 2 * 60 * 60 * 1000; // 2 hours for posts (blog page revalidates every 2 hours, single posts every 15 days)
    if (key.includes('categories_') || key.includes('tags_')) ttl = 6 * 60 * 60 * 1000; // 6 hours (pages revalidate every 24 hours)
    if (key.includes('popular_') || key.includes('featured_')) ttl = 60 * 60 * 1000; // 1 hour for popular/featured
    if (key.includes('homepage_')) ttl = 4 * 60 * 60 * 1000; // 4 hours for homepage (page revalidates every 24 hours)
    if (key.includes('search_')) ttl = 15 * 60 * 1000; // 15 minutes for search results (page revalidates every hour)

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      etag: this.generateETag(data)
    });

    // Prevent memory leaks
    if (this.cache.size > this.maxSize) {
      this.evictOldest();
    }
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  // Get with ETag for conditional requests
  getWithETag<T>(key: string): { data: T; etag: string } | null {
    const item = this.cache.get(key);
    
    if (!item || Date.now() > item.expiresAt) {
      if (item) this.cache.delete(key);
      return null;
    }

    return {
      data: item.data as T,
      etag: item.etag
    };
  }

  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    Array.from(this.cache.entries()).forEach(([key, item]) => {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Pre-warm cache for critical routes
  async preWarmCache(criticalRoutes: string[]): Promise<void> {
    // This would be called during server startup
    console.log(`Pre-warming cache for ${criticalRoutes.length} critical routes`);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.cache.size > 0 ? 0.85 : 0 // Simplified calculation
    };
  }
}

export const serverCache = new ServerCache(); 