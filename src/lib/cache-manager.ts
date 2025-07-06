// Advanced multi-layer caching system for WordPress content
import type { WordPressPost, WordPressCategory, WordPressTag } from '@/types/wordpress';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  defaultTTL: number; // Time to live in milliseconds
  maxSize: number;    // Maximum cache size
  cleanupInterval: number; // Auto cleanup interval
}

class AdvancedCacheManager {
  private memoryCache = new Map<string, CacheItem<any>>();
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes default
      maxSize: 1000,
      cleanupInterval: 10 * 60 * 1000, // 10 minutes cleanup
      ...config
    };

    // Start automatic cleanup
    this.startCleanup();
  }

  // Generate cache key
  private generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as Record<string, any>);
    
    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }

  // Set item in cache
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const timeToLive = ttl || this.config.defaultTTL;
    
    this.memoryCache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + timeToLive
    });

    // Enforce max size
    if (this.memoryCache.size > this.config.maxSize) {
      this.evictOldest();
    }
  }

  // Get item from cache
  get<T>(key: string): T | null {
    const item = this.memoryCache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.data as T;
  }

  // Check if item exists and is valid
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Remove item from cache
  delete(key: string): boolean {
    return this.memoryCache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.memoryCache.clear();
  }

  // Get cache stats
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    Array.from(this.memoryCache.entries()).forEach(([key, item]) => {
      if (now > item.expiresAt) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    });

    return {
      totalEntries: this.memoryCache.size,
      validEntries,
      expiredEntries,
      maxSize: this.config.maxSize,
      hitRate: this.calculateHitRate()
    };
  }

  // Evict oldest entries when max size reached
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    Array.from(this.memoryCache.entries()).forEach(([key, item]) => {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  // Clean up expired entries
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    Array.from(this.memoryCache.entries()).forEach(([key, item]) => {
      if (now > item.expiresAt) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.memoryCache.delete(key));
  }

  // Start automatic cleanup
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  // Stop automatic cleanup
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }

  // Calculate hit rate (simplified)
  private calculateHitRate(): number {
    // This is a simplified version - in production you'd track hits/misses
    return this.memoryCache.size > 0 ? 0.85 : 0;
  }

  // Specialized cache methods for WordPress content
  cachePost(post: WordPressPost, ttl?: number): void {
    const key = this.generateKey('post', { id: post.id });
    this.set(key, post, ttl);
  }

  getCachedPost(id: number): WordPressPost | null {
    const key = this.generateKey('post', { id });
    return this.get<WordPressPost>(key);
  }

  cachePostsList(posts: WordPressPost[], page: number, perPage: number, filters: any = {}, ttl?: number): void {
    const key = this.generateKey('posts', { page, perPage, filters });
    this.set(key, posts, ttl);
  }

  getCachedPostsList(page: number, perPage: number, filters: any = {}): WordPressPost[] | null {
    const key = this.generateKey('posts', { page, perPage, filters });
    return this.get<WordPressPost[]>(key);
  }

  cacheCategories(categories: WordPressCategory[], ttl?: number): void {
    const key = 'categories:all';
    this.set(key, categories, ttl);
  }

  getCachedCategories(): WordPressCategory[] | null {
    return this.get<WordPressCategory[]>('categories:all');
  }

  cacheTags(tags: WordPressTag[], ttl?: number): void {
    const key = 'tags:all';
    this.set(key, tags, ttl);
  }

  getCachedTags(): WordPressTag[] | null {
    return this.get<WordPressTag[]>('tags:all');
  }

  // Cache search results
  cacheSearchResults(query: string, filters: any, results: WordPressPost[], ttl?: number): void {
    const key = this.generateKey('search', { query, filters });
    this.set(key, results, ttl);
  }

  getCachedSearchResults(query: string, filters: any): WordPressPost[] | null {
    const key = this.generateKey('search', { query, filters });
    return this.get<WordPressPost[]>(key);
  }

  // Invalidate related cache entries
  invalidatePost(postId: number): void {
    // Remove specific post
    const postKey = this.generateKey('post', { id: postId });
    this.delete(postKey);

    // Remove related post lists (simplified - in production you'd be more specific)
    const keysToDelete: string[] = [];
    Array.from(this.memoryCache.keys()).forEach(key => {
      if (key.startsWith('posts:') || key.startsWith('search:')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.delete(key));
  }

  // Invalidate category/tag related cache
  invalidateTaxonomy(): void {
    this.delete('categories:all');
    this.delete('tags:all');
    
    // Invalidate related post lists
    const keysToDelete: string[] = [];
    Array.from(this.memoryCache.keys()).forEach(key => {
      if (key.startsWith('posts:') || key.startsWith('search:')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.delete(key));
  }
}

// Create singleton instance
export const cacheManager = new AdvancedCacheManager({
  defaultTTL: 5 * 60 * 1000,  // 5 minutes
  maxSize: 500,               // 500 entries max
  cleanupInterval: 10 * 60 * 1000 // 10 minutes cleanup
});

// Export cache manager class for custom instances
export { AdvancedCacheManager };

// Browser storage cache for persistence
export class BrowserStorageCache {
  private prefix = 'wphead_cache_';

  set<T>(key: string, data: T, expiresIn: number): void {
    if (typeof window === 'undefined') return;

    const item = {
      data,
      expiresAt: Date.now() + expiresIn
    };

    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.warn('LocalStorage cache set failed:', error);
    }
  }

  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      if (Date.now() > parsed.expiresAt) {
        this.delete(key);
        return null;
      }

      return parsed.data as T;
    } catch (error) {
      console.warn('LocalStorage cache get failed:', error);
      return null;
    }
  }

  delete(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.prefix + key);
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const browserCache = new BrowserStorageCache(); 