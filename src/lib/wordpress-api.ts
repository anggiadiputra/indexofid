import type { 
  WordPressPost, 
  WordPressCategory, 
  WordPressTag, 
  WordPressAuthor,
  WordPressMedia,
  WordPressBlock,
} from '@/types/wordpress';
import { env } from '@/config/environment';
import { cacheManager, browserCache } from './cache-manager';
import { serverCache } from './server-cache';

// Use client-side or server-side API URL based on environment with www fallback
const API_BASE = typeof window !== 'undefined'
  ? (env.wordpress.publicApiUrl || 'https://www.jasakami.id/wp-json/wp/v2') // Client-side with fallback
  : (env.wordpress.apiUrl || env.wordpress.publicApiUrl || 'https://www.jasakami.id/wp-json/wp/v2'); // Server-side with fallback

// Validate API_BASE configuration
if (!API_BASE || API_BASE.trim() === '') {
  const isClientSide = typeof window !== 'undefined';
  const envType = isClientSide ? 'Client-side (browser)' : 'Server-side (Node.js)';
  const requiredVar = isClientSide ? 'NEXT_PUBLIC_WORDPRESS_API_URL' : 'WORDPRESS_API_URL';
  
  const errorMessage = `${requiredVar} tidak terdefinisi! Pastikan .env.local sudah benar dan server sudah di-restart.`;
  console.error(`[${envType}] ${errorMessage}`);
  console.error('Current API_BASE:', API_BASE);
  console.error('Environment variables check:');
  console.error('- WORDPRESS_API_URL:', process.env.WORDPRESS_API_URL);
  console.error('- NEXT_PUBLIC_WORDPRESS_API_URL:', process.env.NEXT_PUBLIC_WORDPRESS_API_URL);
  console.error('- env.wordpress.apiUrl:', env.wordpress.apiUrl);
  console.error('- env.wordpress.publicApiUrl:', env.wordpress.publicApiUrl);
  throw new Error(errorMessage);
}

console.log(`[WordPress API] Initialized with base URL: ${API_BASE} (${typeof window !== 'undefined' ? 'client-side' : 'server-side'})`);

// Error handling class
class WordPressApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'WordPressApiError';
  }
}

// Enhanced fetch with aggressive server-side caching for TTFB optimization
async function fetchWithCache<T>(
  url: string, 
  cacheKey: string, 
  cacheTTL: number = 5 * 60 * 1000,
  useBrowserCache: boolean = false
): Promise<T> {
  // Try server cache first (fastest)
  const serverCached = serverCache.get<T>(cacheKey);
  if (serverCached) {
    return serverCached;
  }

  // Try memory cache second
  const cached = cacheManager.get<T>(cacheKey);
  if (cached) {
    // Also populate server cache
    serverCache.set(cacheKey, cached, cacheTTL);
    return cached;
  }

  // Try browser cache for client-side requests
  if (useBrowserCache && typeof window !== 'undefined') {
    const browserCached = browserCache.get<T>(cacheKey);
    if (browserCached) {
      // Populate both caches
      cacheManager.set(cacheKey, browserCached, cacheTTL);
      serverCache.set(cacheKey, browserCached, cacheTTL);
      return browserCached;
    }
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NextJS-App/1.0',
      },
      next: { 
        revalidate: 60 // Set revalidation time to 60 seconds instead of 0
      }
    });

    if (!response.ok) {
      // For 400 errors on list endpoints, it's often an invalid page number.
      // We can treat this as an empty result instead of an error.
      const isListEndpoint = url.includes('per_page=') || url.includes('slug=');
      if (response.status === 400 && isListEndpoint) {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.log(`[WordPress API Info] Received 400 for ${url}, treating as empty array.`);
        }
        return [] as unknown as T;
      }

      // For all other errors, or 400s on non-list endpoints, throw.
      const bodyText = await response.text().catch(() => '');
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('[WordPress API Error]', response.status, response.statusText, {url, body: bodyText});
      }
      throw new WordPressApiError(
        `WordPress API error: ${response.status} ${response.statusText}. URL: ${url}. Body: ${bodyText}`,
        response.status
      );
    }

    const data = await response.json();

    // Cache in all layers for maximum TTFB optimization
    serverCache.set(cacheKey, data, cacheTTL);
    cacheManager.set(cacheKey, data, cacheTTL);
    
    if (useBrowserCache && typeof window !== 'undefined') {
      browserCache.set(cacheKey, data, cacheTTL);
    }

    return data;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    if (error instanceof WordPressApiError) {
      throw error;
    }
    throw new WordPressApiError(`Failed to fetch from WordPress: ${error}`);
  }
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
    orderby: 'date',
    order: 'desc'
  });

  if (categoryId) params.append('categories', categoryId.toString());
  if (tagId) params.append('tags', tagId.toString());
  if (search) params.append('search', search);

  const url = `${API_BASE}/posts?${params.toString()}`;
  const cacheKey = `posts_${page}_${perPage}_${categoryId || ''}_${tagId || ''}_${search || ''}`;

  const posts = await fetchWithCache<WordPressPost[]>(
    url, 
    cacheKey, 
    3 * 60 * 1000, // 3 minutes cache
    true // Use browser cache
  );

  // Parse content to blocks and cache individual posts
  const processedPosts = posts.map(post => {
    const processedPost = {
      ...post,
      blocks: parseContentToBlocks(post.content.rendered),
    };
    
    // Cache individual posts
    cacheManager.cachePost(processedPost, 5 * 60 * 1000); // 5 minutes
    
    return processedPost;
  });

  return processedPosts;
}

// Get single post by slug
export async function getPostBySlug(slug: string): Promise<WordPressPost | null> {
  const cacheKey = `post_slug_${slug}`;
  
  // Debug log for troubleshooting
  console.log(`[getPostBySlug] Fetching post with slug: ${slug}, API_BASE: ${API_BASE}`);
  
  // Check cache first
  const cached = cacheManager.get<WordPressPost>(cacheKey);
  if (cached) {
    console.log(`[getPostBySlug] Cache hit for slug: ${slug}`);
    return cached;
  }

  try {
    const url = `${API_BASE}/posts?slug=${slug}&_embed=true`;
    console.log(`[getPostBySlug] Making API request to: ${url}`);
    
    const posts = await fetchWithCache<WordPressPost[]>(
      url, 
      cacheKey, 
      10 * 60 * 1000, // 10 minutes cache for individual posts
      true
    );

    console.log(`[getPostBySlug] API response for ${slug}: ${posts ? posts.length : 0} posts found`);

    if (!posts.length) {
      console.warn(`[getPostBySlug] No posts found for slug: ${slug}`);
      return null;
    }

    const post = {
      ...posts[0],
      blocks: parseContentToBlocks(posts[0].content.rendered),
    };
    
    // Cache by ID as well
    cacheManager.cachePost(post, 10 * 60 * 1000);

    return post;
  } catch (error) {
    console.error(`[getPostBySlug] Error fetching post with slug ${slug}:`, error);
    // Try alternative API URL as fallback
    try {
      const alternativeUrl = `https://www.jasakami.id/wp-json/wp/v2/posts?slug=${slug}&_embed=true`;
      console.log(`[getPostBySlug] Trying alternative URL: ${alternativeUrl}`);
      
      const response = await fetch(alternativeUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NextJS-App/1.0',
        },
        next: { revalidate: 60 }
      });
      
      if (!response.ok) {
        console.error(`[getPostBySlug] Alternative request failed: ${response.status}`);
        return null;
      }
      
      const posts = await response.json();
      if (!posts.length) {
        console.warn(`[getPostBySlug] No posts found in alternative request for slug: ${slug}`);
        return null;
      }
      
      const post = {
        ...posts[0],
        blocks: parseContentToBlocks(posts[0].content.rendered),
      };
      
      // Cache the result
      cacheManager.cachePost(post, 10 * 60 * 1000);
      return post;
    } catch (fallbackError) {
      console.error(`[getPostBySlug] Fallback request also failed for slug ${slug}:`, fallbackError);
      return null;
    }
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
      10 * 60 * 1000,
      true
    );

    const post = {
      ...postData,
      blocks: parseContentToBlocks(postData.content.rendered),
    };

    // Cache the post
    cacheManager.cachePost(post, 10 * 60 * 1000);

    return post;
  } catch (error) {
    console.error('Error fetching post by ID:', error);
    return null;
  }
}

// Get all categories
export async function getAllCategories(): Promise<WordPressCategory[]> {
  // Check cache first
  const cached = cacheManager.getCachedCategories();
  if (cached) {
    return cached;
  }

  try {
    const url = `${API_BASE}/categories?per_page=100&orderby=count&order=desc`;
    const categories = await fetchWithCache<WordPressCategory[]>(
      url, 
      'categories_all', 
      15 * 60 * 1000, // 15 minutes cache for categories
      true
    );

    // Cache the categories
    cacheManager.cacheCategories(categories, 15 * 60 * 1000);

    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Get category by slug
export async function getCategoryBySlug(slug: string): Promise<WordPressCategory | null> {
  const cacheKey = `category_slug_${slug}`;
  
  try {
    const url = `${API_BASE}/categories?slug=${slug}`;
    const categories = await fetchWithCache<WordPressCategory[]>(
      url, 
      cacheKey, 
      15 * 60 * 1000,
      true
    );

    return categories.length > 0 ? categories[0] : null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

// Get all tags
export async function getAllTags(): Promise<WordPressTag[]> {
  // Check cache first
  const cached = cacheManager.getCachedTags();
  if (cached) {
    return cached;
  }

  try {
    const url = `${API_BASE}/tags?per_page=100&orderby=count&order=desc`;
    const tags = await fetchWithCache<WordPressTag[]>(
      url, 
      'tags_all', 
      15 * 60 * 1000, // 15 minutes cache for tags
      true
    );

    // Cache the tags
    cacheManager.cacheTags(tags, 15 * 60 * 1000);

    return tags;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

// Get tag by slug
export async function getTagBySlug(slug: string): Promise<WordPressTag | null> {
  const cacheKey = `tag_slug_${slug}`;
  
  try {
    const url = `${API_BASE}/tags?slug=${slug}`;
    const tags = await fetchWithCache<WordPressTag[]>(
      url, 
      cacheKey, 
      15 * 60 * 1000,
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
      2 * 60 * 1000, // 2 minutes cache
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
    cacheManager.cacheSearchResults(query, { page, perPage }, processedResults, 2 * 60 * 1000);
    
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
    cacheManager.set(cacheKey, posts, 30 * 60 * 1000); // 30 minutes
    
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
      15 * 60 * 1000, // 15 minutes cache
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
      15 * 60 * 1000,
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
      15 * 60 * 1000,
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
      5 * 60 * 1000,
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
      30 * 60 * 1000, // 30 minutes cache for media
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
      60 * 60 * 1000, // 1 hour cache for slugs
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
      60 * 60 * 1000, // 1 hour cache for slugs
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
      60 * 60 * 1000, // 1 hour cache for slugs
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
      60 * 60 * 1000, // 1 hour cache for slugs
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
  browserCache.clear();
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
    serverCache.set(cacheKey, homepageData, 5 * 60 * 1000);
    
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