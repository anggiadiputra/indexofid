import type { 
  WordPressPost, 
  WordPressCategory, 
  WordPressTag, 
  WordPressAuthor,
  WordPressMedia,
  WordPressBlock,
} from '@/types/wordpress';
import { env } from '@/config/environment';
import { cacheManager, AdvancedCacheManager, BrowserStorageCache, browserCache } from './cache-manager';
import { serverCache } from './server-cache';

// Helper functions for conditional logging (only in development)
const debugLog = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...args);
  }
};

const debugWarn = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(message, ...args);
  }
};

const debugError = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(message, ...args);
  }
};

// Production error logging (for critical errors only)
const prodError = (message: string, error?: any) => {
  if (process.env.NODE_ENV === 'production') {
    // Only log critical errors in production
    console.error(message, error);
  } else {
    console.error(message, error);
  }
};

// Use client-side or server-side API URL based on environment
const API_BASE = typeof window !== 'undefined'
  ? env.wordpress.publicApiUrl // Client-side from NEXT_PUBLIC_WORDPRESS_API_URL
  : (env.wordpress.apiUrl || env.wordpress.publicApiUrl); // Server-side from WORDPRESS_API_URL or fallback to public

// Alternative API base for fallback when primary fails - defaults to same as primary
const FALLBACK_API_BASE = process.env.NEXT_PUBLIC_FALLBACK_API_URL || env.wordpress.publicApiUrl || API_BASE;

// Validate API_BASE configuration
if (!API_BASE || API_BASE.trim() === '') {
  const isClientSide = typeof window !== 'undefined';
  const envType = isClientSide ? 'Client-side (browser)' : 'Server-side (Node.js)';
  const requiredVar = isClientSide ? 'NEXT_PUBLIC_WORDPRESS_API_URL' : 'WORDPRESS_API_URL';
  
  const errorMessage = `
❌ WORDPRESS API CONFIGURATION ERROR ❌

${requiredVar} tidak terdefinisi atau kosong!

Langkah-langkah perbaikan:
1. Buat file .env.local di root project
2. Tambahkan konfigurasi berikut:

   WORDPRESS_API_URL=https://backend.indexof.id/wp-json/wp/v2
   NEXT_PUBLIC_WORDPRESS_API_URL=https://backend.indexof.id/wp-json/wp/v2
   NEXT_PUBLIC_FALLBACK_API_URL=https://backend.indexof.id/wp-json/wp/v2

3. Restart development server: npm run dev

Untuk referensi lengkap, lihat file env.example
  `;
  
  throw new Error(errorMessage);
}

// Error handling class
class WordPressApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'WordPressApiError';
  }
}

// PERFORMANCE OPTIMIZATION: Cache TTL values optimized for SSR + aggressive server-side caching
const CACHE_TTL = {
  POSTS_LIST: 60 * 60 * 1000,     // 1 hour for post lists
  SINGLE_POST: 60 * 60 * 1000,    // 1 hour for individual posts
  CATEGORIES: 12 * 60 * 60 * 1000, // 12 hours for categories
  TAGS: 12 * 60 * 60 * 1000,      // 12 hours for tags
  SEARCH: 30 * 60 * 1000,         // 30 minutes for search results
  POPULAR: 2 * 60 * 60 * 1000,    // 2 hours for popular posts
};

// Enhanced cache instance with larger size for better hit rates
const cache = new AdvancedCacheManager({
  defaultTTL: CACHE_TTL.POSTS_LIST,
  maxSize: 2000,  // Increased from default
  cleanupInterval: 5 * 60 * 1000  // Cleanup every 5 minutes
});

// Enhanced browser cache for client-side caching
const enhancedBrowserCache = typeof window !== 'undefined' ? new BrowserStorageCache() : null;

// Enhanced fetch with aggressive server-side caching for TTFB optimization
async function fetchWithCache<T>(
  url: string, 
  cacheKey: string, 
  cacheTTL: number = CACHE_TTL.POSTS_LIST,  // Use optimized default
  useBrowserCache: boolean = true,  // Enable browser cache by default
  retries: number = 2  // Reduced retry count to avoid long waits
): Promise<T> {
  // Try server cache first (fastest)
  const serverCached = serverCache.get<T>(cacheKey);
  if (serverCached) {
    return serverCached;
  }

  // Try memory cache next
  const memoryCached = cache.get<T>(cacheKey);
  if (memoryCached) {
    // Populate server cache for next request
    serverCache.set(cacheKey, memoryCached, cacheTTL);
    return memoryCached;
  }

  // Try browser cache for client-side requests
  if (useBrowserCache && typeof window !== 'undefined' && enhancedBrowserCache) {
    const browserCached = enhancedBrowserCache.get<T>(cacheKey);
    if (browserCached) {
      // Populate both caches
      cache.set(cacheKey, browserCached, cacheTTL);
      serverCache.set(cacheKey, browserCached, cacheTTL);
      return browserCached;
    }
  }

  // Fetch with retry logic
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NextJS-App/1.0',
        },
        signal: controller.signal,
        next: { 
          revalidate: Math.min(cacheTTL / 1000, 86400) // Dynamic revalidation based on cache TTL, max 24 hours
        }
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        // For 400 errors on list endpoints, it's often an invalid page number.
        // We can treat this as an empty result instead of an error.
        const isListEndpoint = url.includes('per_page=') || url.includes('slug=');
        if (response.status === 400 && isListEndpoint) {
                  debugLog(`[WordPress API Info] Received 400 for ${url}, treating as empty array.`);
          return [] as unknown as T;
        }

        // Handle rate limiting (429) and server errors (5xx) with retries
        if ((response.status === 429 || response.status >= 500) && attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          debugLog(`[WordPress API] Retrying after ${delay}ms (attempt ${attempt + 1}/${retries + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // For all other errors, or exhausted retries, throw.
        const bodyText = await response.text().catch(() => '');
        debugError('[WordPress API Error]', response.status, response.statusText, {url, body: bodyText});
        throw new WordPressApiError(
          `WordPress API error: ${response.status} ${response.statusText}. URL: ${url}. Body: ${bodyText}`,
          response.status
        );
      }

      // Check if response is actually JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const bodyText = await response.text().catch(() => '');
        
        // If we got HTML (like a server error page), retry if possible
        if (bodyText.includes('<!DOCTYPE') || bodyText.includes('<html')) {
          if (attempt < retries) {
            const delay = Math.pow(2, attempt) * 1000;
            debugLog(`[WordPress API] Received HTML instead of JSON, retrying after ${delay}ms (attempt ${attempt + 1}/${retries + 1})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          // For list endpoints, return empty array instead of failing
          const isListEndpoint = url.includes('per_page=') || url.includes('posts') || url.includes('tags') || url.includes('categories');
          if (isListEndpoint) {
            debugWarn(`[WordPress API] Server returned HTML instead of JSON for ${url}, returning empty array`);
            return [] as unknown as T;
          }
        }
        
        debugError(`[WordPress API] Invalid content-type: ${contentType}. Body: ${bodyText.substring(0, 200)}...`);
        throw new WordPressApiError(
          `WordPress API returned invalid content-type: ${contentType}. Expected application/json. URL: ${url}`,
          response.status
        );
      }

      const data = await response.json();

      // Cache the response
      cache.set(cacheKey, data, cacheTTL);
      serverCache.set(cacheKey, data, cacheTTL);
      
      // Enhanced browser cache integration with null safety
      if (useBrowserCache && typeof window !== 'undefined' && enhancedBrowserCache) {
        enhancedBrowserCache.set(cacheKey, data, cacheTTL);
      }

      return data;
    } catch (error) {
      // Handle JSON parsing errors specifically
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`[WordPress API] JSON parse error, retrying after ${delay}ms (attempt ${attempt + 1}/${retries + 1})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // For list endpoints, return empty array instead of failing
        const isListEndpoint = url.includes('per_page=') || url.includes('posts') || url.includes('tags') || url.includes('categories');
        if (isListEndpoint) {
          console.warn(`[WordPress API] JSON parse error for ${url}, returning empty array`);
          return [] as unknown as T;
        }
      }
      
      // Handle network errors more specifically
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCode = (error as any)?.code;
      
      if (attempt < retries && (
        error instanceof TypeError || 
        errorMessage.includes('fetch') ||
        errorMessage.includes('socket') ||
        errorMessage.includes('ECONNRESET') ||
        errorMessage.includes('other side closed') ||
        errorMessage.includes('aborted') ||
        errorMessage.includes('AbortError') ||
        errorCode === 'UND_ERR_SOCKET'
      )) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`[WordPress API] Network error, retrying after ${delay}ms (attempt ${attempt + 1}/${retries + 1})`);
        console.log(`[WordPress API] Error details:`, errorMessage);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      console.error(`Failed to fetch ${url}:`, error);
      if (error instanceof WordPressApiError) {
        throw error;
      }
      throw new WordPressApiError(`Failed to fetch from WordPress: ${error}`);
    }
  }

  // If we get here, all retries have been exhausted
  throw new WordPressApiError(`All retry attempts failed for ${url}`);
}

// Parse WordPress content to blocks
function parseContentToBlocks(content: string): WordPressBlock[] {
  try {
    // This is a simplified parser - in production you might use wp-block-to-html
    // For now, return empty blocks array to avoid parsing errors
    return [];
  } catch (error) {
    console.warn('Error parsing content to blocks:', error);
    return [];
  }
}

// Get all posts with pagination and filtering
export async function getAllPosts(
  page: number = 1, 
  perPage: number = 10,
  categoryId?: number,
  tagId?: number,
  search?: string
): Promise<WordPressPost[]> {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
    _embed: 'true',
    _fields: 'id,title,slug,content,excerpt,date,modified,featured_media,_links,_embedded,media_details,source_url',
    orderby: 'date',
    order: 'desc',
    status: 'publish'
  });

  if (categoryId) params.append('categories', categoryId.toString());
  if (tagId) params.append('tags', tagId.toString());
  if (search) params.append('search', search);

  const url = `${API_BASE}/posts?${params.toString()}`;
  const cacheKey = `posts_${page}_${perPage}_${categoryId || ''}_${tagId || ''}_${search || ''}`;

  try {
    const posts = await fetchWithCache<WordPressPost[]>(
      url, 
      cacheKey, 
      CACHE_TTL.POSTS_LIST,
      true // Use browser cache
    );

    // Parse content to blocks and cache individual posts
    const processedPosts = posts.map(post => {
      const processedPost = {
        ...post,
        blocks: parseContentToBlocks(post.content.rendered),
      };
      
      // Cache individual posts
      cacheManager.cachePost(processedPost, CACHE_TTL.SINGLE_POST);
      
      return processedPost;
    });

    return processedPosts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    
    // Clear cache on error to prevent stale data
    cache.delete(cacheKey);
    if (typeof window !== 'undefined' && enhancedBrowserCache) {
      enhancedBrowserCache.delete(cacheKey);
    }
    
    // Try fallback API if primary fails
    if (API_BASE !== FALLBACK_API_BASE) {
      try {
                  debugLog('[WordPress API] Trying fallback API endpoint');
        const fallbackUrl = url.replace(API_BASE, FALLBACK_API_BASE);
        const fallbackCacheKey = cacheKey + '_fallback';
        
        const fallbackPosts = await fetchWithCache<WordPressPost[]>(
          fallbackUrl, 
          fallbackCacheKey, 
          CACHE_TTL.POSTS_LIST,
          true
        );

        const processedFallbackPosts = fallbackPosts.map(post => {
          const processedPost = {
            ...post,
            blocks: parseContentToBlocks(post.content.rendered),
          };
          
          // Cache individual posts
          cacheManager.cachePost(processedPost, CACHE_TTL.SINGLE_POST);
          
          return processedPost;
        });

        return processedFallbackPosts;
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError);
      }
    }
    
    // Try to return cached posts if available
    const cached = cache.get<WordPressPost[]>(cacheKey);
    if (cached) {
      debugLog('[WordPress API] Using cached fallback posts');
      return cached;
    }
    
    // Return empty array as last resort
    return [];
  }
}

// Get single post by slug
export async function getPostBySlug(slug: string): Promise<WordPressPost | null> {
  if (!slug) return null;

  const url = `${API_BASE}/posts?slug=${slug}&_embed=true`;
  const cacheKey = `post-by-slug-${slug}`;

  try {
    const posts = await fetchWithCache<WordPressPost[]>(
      url,
      cacheKey,
      CACHE_TTL.SINGLE_POST
    );

    return posts && posts.length > 0 ? posts[0] : null;
  } catch (error) {
    if (error instanceof WordPressApiError && error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

// Get post by ID
export async function getPostById(id: number): Promise<WordPressPost | null> {
  // Check cache first
  const cached = cacheManager.getCachedPost(id);
  if (cached) {
    return cached;
  }

  try {
    const url = `${API_BASE}/posts/${id}?_embed=true`;
    const cacheKey = `post_id_${id}`;
    
    const postData = await fetchWithCache<WordPressPost>(
      url, 
      cacheKey, 
      CACHE_TTL.SINGLE_POST,
      true
    );

    const post = {
      ...postData,
      blocks: parseContentToBlocks(postData.content.rendered),
    };

    // Cache the post
    cacheManager.cachePost(post, CACHE_TTL.SINGLE_POST);

    return post;
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    return null;
  }
}

// Get all categories with enhanced metadata
export async function getAllCategories(): Promise<WordPressCategory[]> {
  // Check cache first
  const cached = cacheManager.getCachedCategories();
  if (cached) {
    return cached;
  }

  try {
    // Enhanced API call with more fields and metadata
    const params = new URLSearchParams({
      per_page: '100',
      orderby: 'count',
      order: 'desc',
      _fields: 'id,name,slug,description,count,parent,meta,link',
      hide_empty: 'false' // Include categories without posts
    });
    
    const url = `${API_BASE}/categories?${params.toString()}`;
    const categories = await fetchWithCache<WordPressCategory[]>(
      url, 
      'categories_all_enhanced', 
      CACHE_TTL.CATEGORIES,
      true
    );

    // Process categories to include hierarchy information
    const processedCategories = categories.map(category => ({
      ...category,
      // Add computed fields
      hasChildren: categories.some(cat => cat.parent === category.id),
      level: getCategoryLevel(category, categories),
      fullPath: getCategoryPath(category, categories)
    }));

    // Cache the enhanced categories
    cacheManager.cacheCategories(processedCategories, CACHE_TTL.CATEGORIES);

    return processedCategories;
  } catch (error) {
    console.error('Error fetching enhanced categories:', error);
    // Return basic fallback categories if available from cache
    const fallbackCategories = cacheManager.getCachedCategories();
    if (fallbackCategories && fallbackCategories.length > 0) {
      console.log('[WordPress API] Using cached fallback categories');
      return fallbackCategories;
    }
    return [];
  }
}

// Helper function to calculate category hierarchy level
function getCategoryLevel(category: WordPressCategory, allCategories: WordPressCategory[]): number {
  if (!category.parent) return 0;
  const parent = allCategories.find(cat => cat.id === category.parent);
  if (!parent) return 1;
  return 1 + getCategoryLevel(parent, allCategories);
}

// Helper function to get full category path
function getCategoryPath(category: WordPressCategory, allCategories: WordPressCategory[]): string {
  if (!category.parent) return category.name;
  const parent = allCategories.find(cat => cat.id === category.parent);
  if (!parent) return category.name;
  return `${getCategoryPath(parent, allCategories)} > ${category.name}`;
}

// Get category by slug
export async function getCategoryBySlug(slug: string): Promise<WordPressCategory | null> {
  const cacheKey = `category_slug_${slug}`;
  
  try {
    const url = `${API_BASE}/categories?slug=${slug}`;
    const categories = await fetchWithCache<WordPressCategory[]>(
      url, 
      cacheKey, 
      CACHE_TTL.CATEGORIES,
      true
    );

    return categories.length > 0 ? categories[0] : null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

// Get all tags with enhanced metadata
export async function getAllTags(): Promise<WordPressTag[]> {
  // Check cache first
  const cached = cacheManager.getCachedTags();
  if (cached) {
    return cached;
  }

  try {
    // Enhanced API call with more fields and metadata
    const params = new URLSearchParams({
      per_page: '100',
      orderby: 'count',
      order: 'desc',
      _fields: 'id,name,slug,description,count,meta,link',
      hide_empty: 'false' // Include tags without posts
    });
    
    const url = `${API_BASE}/tags?${params.toString()}`;
    const tags = await fetchWithCache<WordPressTag[]>(
      url, 
      'tags_all_enhanced', 
      CACHE_TTL.TAGS,
      true
    );

    // Process tags to include additional computed fields
    const processedTags = tags.map(tag => ({
      ...tag,
      // Add computed fields
      popularity: getTagPopularity(tag.count, tags),
      category: getTagCategory(tag.name), // Auto-categorize tags
      relatedTerms: findRelatedTags(tag, tags)
    }));

    // Cache the enhanced tags
    cacheManager.cacheTags(processedTags, CACHE_TTL.TAGS);

    return processedTags;
  } catch (error) {
    console.error('Error fetching enhanced tags:', error);
    // Return basic fallback tags if available from cache
    const fallbackTags = cacheManager.getCachedTags();
    if (fallbackTags && fallbackTags.length > 0) {
      console.log('[WordPress API] Using cached fallback tags');
      return fallbackTags;
    }
    return [];
  }
}

// Helper function to determine tag popularity level
function getTagPopularity(count: number, allTags: WordPressTag[]): 'high' | 'medium' | 'low' {
  const maxCount = Math.max(...allTags.map(tag => tag.count));
  const percentage = (count / maxCount) * 100;
  
  if (percentage >= 70) return 'high';
  if (percentage >= 30) return 'medium';
  return 'low';
}

// Helper function to auto-categorize tags based on common patterns
function getTagCategory(tagName: string): string {
  const name = tagName.toLowerCase();
  
  // Technology categories
  if (name.includes('javascript') || name.includes('react') || name.includes('node') || name.includes('api')) {
    return 'technology';
  }
  if (name.includes('css') || name.includes('html') || name.includes('design') || name.includes('ui')) {
    return 'frontend';
  }
  if (name.includes('server') || name.includes('database') || name.includes('backend') || name.includes('mysql')) {
    return 'backend';
  }
  if (name.includes('tutorial') || name.includes('guide') || name.includes('how-to')) {
    return 'tutorial';
  }
  if (name.includes('wordpress') || name.includes('cms') || name.includes('plugin')) {
    return 'wordpress';
  }
  
  return 'general';
}

// Helper function to find related tags
function findRelatedTags(currentTag: WordPressTag, allTags: WordPressTag[]): string[] {
  const related: string[] = [];
  const currentName = currentTag.name.toLowerCase();
  
  // Find tags with similar names or common keywords
  allTags.forEach(tag => {
    if (tag.id === currentTag.id) return;
    
    const tagName = tag.name.toLowerCase();
    const commonWords = currentName.split(/\s+/).filter(word => 
      word.length > 3 && tagName.includes(word)
    );
    
    if (commonWords.length > 0 && related.length < 5) {
      related.push(tag.slug);
    }
  });
  
  return related;
}

// Get tag by slug
export async function getTagBySlug(slug: string): Promise<WordPressTag | null> {
  const cacheKey = `tag_slug_${slug}`;
  
  try {
    const url = `${API_BASE}/tags?slug=${slug}`;
    const tags = await fetchWithCache<WordPressTag[]>(
      url, 
      cacheKey, 
      CACHE_TTL.TAGS,
      true
    );

    return tags.length > 0 ? tags[0] : null;
  } catch (error) {
    console.error('Error fetching tag:', error);
    return null;
  }
}

// Get posts by category ID
export async function getPostsByCategory(
  categoryId: number, 
  page: number = 1, 
  perPage: number = 10
): Promise<WordPressPost[]> {
  return getAllPosts(page, perPage, categoryId);
}

// Get posts by tag ID
export async function getPostsByTag(
  tagId: number, 
  page: number = 1, 
  perPage: number = 10
): Promise<WordPressPost[]> {
  return getAllPosts(page, perPage, undefined, tagId);
}

// Search posts
export async function searchPosts(
  query: string, 
  page: number = 1, 
  perPage: number = 10
): Promise<WordPressPost[]> {
  if (!query.trim()) {
    return [];
  }

  const cacheKey = `search_${query}_${page}_${perPage}`;
  
  // Check cache first
  const cached = cacheManager.getCachedSearchResults(query, { page, perPage });
  if (cached) {
    return cached;
  }

  try {
    // Build search parameters
    const params = new URLSearchParams({
      search: query.trim(),
      page: page.toString(),
      per_page: perPage.toString(),
      _embed: 'true',
      orderby: 'relevance', // Sort by relevance for better results
      search_columns: 'post_title,post_content,post_excerpt', // Search in these columns
      sentence: '0', // Allow partial word matches
    });

    const url = `${API_BASE}/posts?${params.toString()}`;
    
    const results = await fetchWithCache<WordPressPost[]>(
      url,
      cacheKey,
      CACHE_TTL.SEARCH,
      true
    );

    // Process and rank results
    const processedResults = results.map(post => {
      // Calculate relevance score
      const titleMatch = post.title.rendered.toLowerCase().includes(query.toLowerCase());
      const excerptMatch = post.excerpt.rendered.toLowerCase().includes(query.toLowerCase());
      const contentMatch = post.content.rendered.toLowerCase().includes(query.toLowerCase());
      
      const score = (titleMatch ? 3 : 0) + (excerptMatch ? 2 : 0) + (contentMatch ? 1 : 0);
      
      return {
        ...post,
        blocks: parseContentToBlocks(post.content.rendered),
        relevanceScore: score
      };
    }).sort((a: any, b: any) => b.relevanceScore - a.relevanceScore);
    
    // Cache search results
    cacheManager.cacheSearchResults(query, { page, perPage }, processedResults, CACHE_TTL.SEARCH);
    
    return processedResults;
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
}

// Get popular posts (by view count or comments)
export async function getPopularPosts(limit: number = 6): Promise<WordPressPost[]> {
  const cacheKey = `popular_posts_${limit}`;
  
  // Check cache first
  const cached = cacheManager.get<WordPressPost[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // For now, get recent posts as popular posts
    // In production, you might have a custom endpoint or meta field for popularity
    const posts = await getAllPosts(1, limit);
    
    // Cache popular posts for longer since they change less frequently
    cacheManager.set(cacheKey, posts, CACHE_TTL.POPULAR);
    
    return posts;
  } catch (error) {
    console.error('Error fetching popular posts:', error);
    return [];
  }
}

// Authors API functions
export async function getAllAuthors(): Promise<WordPressAuthor[]> {
  try {
    const url = `${API_BASE}/users?per_page=100`;
    const authors = await fetchWithCache<WordPressAuthor[]>(
      url, 
      'authors_all', 
      CACHE_TTL.CATEGORIES,
      true
    );
    return authors;
  } catch (error) {
    console.error('Error fetching authors:', error);
    return [];
  }
}

export async function getAuthorBySlug(slug: string): Promise<WordPressAuthor | null> {
  try {
    const url = `${API_BASE}/users?slug=${slug}`;
    const cacheKey = `author_slug_${slug}`;
    const authors = await fetchWithCache<WordPressAuthor[]>(
      url, 
      cacheKey, 
      CACHE_TTL.CATEGORIES,
      true
    );
    return authors.length > 0 ? authors[0] : null;
  } catch (error) {
    console.error(`Error fetching author by slug ${slug}:`, error);
    return null;
  }
}

export async function getAuthorById(id: number): Promise<WordPressAuthor | null> {
  try {
    const url = `${API_BASE}/users/${id}`;
    const cacheKey = `author_id_${id}`;
    const author = await fetchWithCache<WordPressAuthor>(
      url, 
      cacheKey, 
      CACHE_TTL.SINGLE_POST,
      true
    );
    return author;
  } catch (error) {
    console.error(`Error fetching author by ID ${id}:`, error);
    return null;
  }
}

export async function getPostsByAuthor(authorId: number, page = 1, perPage = 10): Promise<WordPressPost[]> {
  const params = new URLSearchParams({
    author: authorId.toString(),
    page: page.toString(),
    per_page: perPage.toString(),
    _embed: 'true'
  });

  const url = `${API_BASE}/posts?${params.toString()}`;
  const cacheKey = `posts_author_${authorId}_${page}_${perPage}`;

  try {
    const posts = await fetchWithCache<WordPressPost[]>(
      url, 
      cacheKey, 
      CACHE_TTL.POSTS_LIST,
      true
    );

    return posts.map(post => ({
      ...post,
      blocks: parseContentToBlocks(post.content.rendered),
    }));
  } catch (error) {
    console.error('Error fetching posts by author:', error);
    return [];
  }
}

// Media API functions
export async function getMediaById(id: number): Promise<WordPressMedia | null> {
  try {
    const url = `${API_BASE}/media/${id}`;
    const cacheKey = `media_id_${id}`;
    const media = await fetchWithCache<WordPressMedia>(
      url, 
      cacheKey, 
      CACHE_TTL.SINGLE_POST,
      true
    );
    return media;
  } catch (error) {
    console.error(`Error fetching media by ID ${id}:`, error);
    return null;
  }
}

// Helper functions for static generation
export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const url = `${API_BASE}/posts?per_page=100&_fields=slug`;
    const cacheKey = 'post_slugs_all';
    const posts = await fetchWithCache<WordPressPost[]>(
      url, 
      cacheKey, 
      CACHE_TTL.POSTS_LIST,
      true
    );
    return posts.map(post => post.slug);
  } catch (error) {
    console.error('Error fetching all post slugs:', error);
    return [];
  }
}

export async function getAllCategorySlugs(): Promise<string[]> {
  try {
    const url = `${API_BASE}/categories?per_page=100&_fields=slug`;
    const cacheKey = 'category_slugs_all';
    const categories = await fetchWithCache<WordPressCategory[]>(
      url, 
      cacheKey, 
      CACHE_TTL.CATEGORIES,
      true
    );
    return categories.map(category => category.slug);
  } catch (error) {
    console.error('Error fetching all category slugs:', error);
    return [];
  }
}

export async function getAllTagSlugs(): Promise<string[]> {
  try {
    const url = `${API_BASE}/tags?per_page=100&_fields=slug`;
    const cacheKey = 'tag_slugs_all';
    const tags = await fetchWithCache<WordPressTag[]>(
      url, 
      cacheKey, 
      CACHE_TTL.TAGS,
      true
    );
    return tags.map(tag => tag.slug);
  } catch (error) {
    console.error('Error fetching all tag slugs:', error);
    return [];
  }
}

export async function getAllAuthorSlugs(): Promise<string[]> {
  try {
    const url = `${API_BASE}/users?per_page=100&_fields=slug`;
    const cacheKey = 'author_slugs_all';
    const authors = await fetchWithCache<WordPressAuthor[]>(
      url, 
      cacheKey, 
      CACHE_TTL.CATEGORIES,
      true
    );
    return authors.map(author => author.slug);
  } catch (error) {
    console.error('Error fetching all author slugs:', error);
    return [];
  }
}

// Cache invalidation helpers
export function invalidatePostCache(postId: number): void {
  cacheManager.invalidatePost(postId);
}

export function invalidateTaxonomyCache(): void {
  cacheManager.invalidateTaxonomy();
}

export function clearAllCache(): void {
  cacheManager.clear();
  if (typeof window !== 'undefined' && enhancedBrowserCache) {
    enhancedBrowserCache.clear();
  }
}

// Cache statistics
export function getCacheStats() {
  return cacheManager.getStats();
}

// Export the error class for use in other modules
export { WordPressApiError };

// Parallel data fetching for homepage to reduce TTFB
export async function getHomepageData(): Promise<{
  posts: WordPressPost[];
  categories: WordPressCategory[];
  tags: WordPressTag[];
  popularPosts: WordPressPost[];
}> {
  // Force dynamic rendering for homepage data
  const dynamic = true;
  const cacheKey = 'homepage_data';
  
  // Try server cache first
  const cached = serverCache.get<any>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Fetch all homepage data in parallel for fastest TTFB
    const [posts, categories, tags, popularPosts] = await Promise.all([
      getAllPosts(1, 6), // Latest 6 posts
      getAllCategories(),
      getAllTags(), 
      getPopularPosts(6)
    ]);

    const homepageData = { posts, categories, tags, popularPosts };
    
    // Cache for 5 minutes with aggressive server caching
    serverCache.set(cacheKey, homepageData, CACHE_TTL.POPULAR);
    
    return homepageData;
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    // Return empty data structure to prevent errors
    return {
      posts: [],
      categories: [],
      tags: [],
      popularPosts: []
    };
  }
}

// API Health Check function
export async function checkApiHealth(): Promise<{
  primary: boolean;
  fallback: boolean;
  message: string;
}> {
  const results = {
    primary: false,
    fallback: false,
    message: ''
  };

  // Test primary API
  try {
    const response = await fetch(`${API_BASE}/posts?per_page=1`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NextJS-App/1.0',
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        results.primary = true;
        results.message += 'Primary API: OK. ';
      } else {
        results.message += 'Primary API: Returns HTML instead of JSON. ';
      }
    } else {
      results.message += `Primary API: HTTP ${response.status}. `;
    }
  } catch (error) {
    results.message += `Primary API: ${error instanceof Error ? error.message : 'Unknown error'}. `;
  }

  // Test fallback API if different
  if (API_BASE !== FALLBACK_API_BASE) {
    try {
      const response = await fetch(`${FALLBACK_API_BASE}/posts?per_page=1`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NextJS-App/1.0',
        },
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          results.fallback = true;
          results.message += 'Fallback API: OK.';
        } else {
          results.message += 'Fallback API: Returns HTML instead of JSON.';
        }
      } else {
        results.message += `Fallback API: HTTP ${response.status}.`;
      }
    } catch (error) {
      results.message += `Fallback API: ${error instanceof Error ? error.message : 'Unknown error'}.`;
    }
  } else {
    results.fallback = results.primary;
    results.message += 'Fallback API: Same as primary.';
  }

  return results;
} 

/**
 * Get total number of posts
 */
export async function getPostCount(): Promise<number> {
  try {
    // Try to get from cache first
    const cacheKey = 'total_posts_count';
    const cached = cache.get<number>(cacheKey);
    if (cached !== undefined && cached !== null) {
      return cached;
    }

    const response = await fetch(`${API_BASE}/posts?per_page=1&_fields=id`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NextJS-App/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get post count: ${response.status} ${response.statusText}`);
    }

    // WordPress returns total posts count in headers
    const totalPosts = parseInt(response.headers.get('X-WP-Total') || '0');
    
    if (isNaN(totalPosts) || totalPosts === 0) {
      // If header is missing or invalid, try to get total from response
      const data = await response.json();
      const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0');
      if (totalPages > 0) {
        // If we have total pages, multiply by per_page to get approximate total
        const approximateTotal = totalPages * 100;
        cache.set(cacheKey, approximateTotal, CACHE_TTL.POSTS_LIST);
        return approximateTotal;
      }
      console.warn('Could not determine total post count from headers, using fallback method');
      // Fallback: make another request with larger per_page
      const fallbackResponse = await fetch(`${API_BASE}/posts?per_page=100&_fields=id`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NextJS-App/1.0',
        },
      });
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (Array.isArray(fallbackData)) {
          // Cache the result for 1 hour
          const count = fallbackData.length;
          cache.set(cacheKey, count, CACHE_TTL.POSTS_LIST);
          return count;
        }
      }
      return 0;
    }

    // Cache the result for 1 hour
    cache.set(cacheKey, totalPosts, CACHE_TTL.POSTS_LIST);
    return totalPosts;
  } catch (error) {
    console.error('Error getting post count:', error);
    // Try fallback API if primary failed
    if (API_BASE !== FALLBACK_API_BASE) {
      try {
        const fallbackResponse = await fetch(`${FALLBACK_API_BASE}/posts?per_page=1&_fields=id`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'NextJS-App/1.0',
          },
        });
        if (fallbackResponse.ok) {
          const totalPosts = parseInt(fallbackResponse.headers.get('X-WP-Total') || '0');
          if (!isNaN(totalPosts) && totalPosts > 0) {
            return totalPosts;
          }
        }
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError);
      }
    }
    return 0;
  }
} 

// Get enhanced taxonomy data from RankMath (if enabled)
export async function getEnhancedTaxonomyData(): Promise<{
  categories: WordPressCategory[];
  tags: WordPressTag[];
  rankMathMeta?: any;
}> {
  try {
    // Fetch categories and tags in parallel
    const [categories, tags] = await Promise.all([
      getAllCategories(),
      getAllTags()
    ]);

    // If RankMath is enabled, try to get additional taxonomy metadata
    if (env.rankmath?.enabled) {
      try {
        const { getRankMathSEO } = await import('./rankmath-api');
        
        // Get taxonomy page metadata from RankMath
        const categoryPageUrl = `${env.wordpress.backendUrl}/category/`;
        const tagPageUrl = `${env.wordpress.backendUrl}/tag/`;
        
        const [categoryMeta, tagMeta] = await Promise.all([
          getRankMathSEO(categoryPageUrl).catch(() => null),
          getRankMathSEO(tagPageUrl).catch(() => null)
        ]);

        return {
          categories,
          tags,
          rankMathMeta: {
            categoryPage: categoryMeta,
            tagPage: tagMeta,
            lastUpdated: new Date().toISOString()
          }
        };
      } catch (error) {
        console.warn('[Enhanced Taxonomy] RankMath integration failed:', error);
      }
    }

    return { categories, tags };
  } catch (error) {
    console.error('[Enhanced Taxonomy] Failed to fetch taxonomy data:', error);
    return {
      categories: [],
      tags: []
    };
  }
}

// Get category/tag settings from WordPress customizer or theme options
export async function getTaxonomySettings(): Promise<{
  categorySettings: any;
  tagSettings: any;
}> {
  try {
    // This would require a custom WordPress endpoint or plugin
    // For now, we'll return default settings
    const defaultSettings = {
      categorySettings: {
        showInNavigation: true,
        showPostCount: true,
        hierarchical: true,
        description: 'Organize content by categories',
        maxDisplayed: 20
      },
      tagSettings: {
        showInNavigation: false,
        showPostCount: true,
        hierarchical: false,
        description: 'Tag content with keywords',
        maxDisplayed: 50,
        minPostCount: 1 // Only show tags with at least 1 post
      }
    };

    // You could extend this to fetch from WordPress Customizer API
    // const settingsUrl = `${API_BASE}/customizer-settings/taxonomy`;
    // const settings = await fetchWithCache(settingsUrl, 'taxonomy_settings', CACHE_TTL.CATEGORIES);
    
    return defaultSettings;
  } catch (error) {
    console.error('[Taxonomy Settings] Failed to fetch settings:', error);
    return {
      categorySettings: {},
      tagSettings: {}
    };
  }
} 