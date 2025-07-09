import { env } from '@/config/environment';
import { getPostBySlug } from './wordpress-api';

/**
 * Resolves WordPress backend URL from post data for Rank Math API
 */
export function resolveRankMathUrl(post: { link?: string; slug: string }): string {
  // Priority order:
  // 1. Use post.link from WordPress API (most reliable)
  // 2. Construct from environment config + slug
  // 3. Fallback to hardcoded backend URL
  
  if (post.link) {
    return post.link;
  }
  
  const backendUrl = env.wordpress.backendUrl || 'https://backend.indexof.id';
  return `${backendUrl}/${post.slug}/`;
}

/**
 * Resolves frontend URL for social sharing and canonical tags
 */
export function resolveFrontendUrl(slug: string): string {
  return `${env.site.url}/${slug}`;
}

/**
 * Attempts to find a post by trying different slug variations
 * This handles cases where frontend and backend slugs don't match
 */
export async function findPostBySlugVariations(frontendSlug: string) {
  console.log(`[findPostBySlugVariations] Searching for slug: ${frontendSlug}`);
  
  // Try exact match first
  let post = await getPostBySlug(frontendSlug);
  if (post) {
    console.log(`[findPostBySlugVariations] Found exact match for: ${frontendSlug}`);
    return { post, redirectSlug: null };
  }

  console.log(`[findPostBySlugVariations] No exact match, trying variations...`);
  
  // Try common slug variations
  const variations = [
    // Remove common suffixes that might be added in frontend
    frontendSlug.replace('-menggunakan-bash', ''),
    frontendSlug.replace('-paling-cepat', ''),
    frontendSlug.replace('-terbaru', ''),
    frontendSlug.replace('-lengkap', ''),
    
    // Try shorter versions
    frontendSlug.split('-').slice(0, 4).join('-'), // First 4 words
    frontendSlug.split('-').slice(0, 5).join('-'), // First 5 words
    frontendSlug.split('-').slice(0, 6).join('-'), // First 6 words
  ];

  console.log(`[findPostBySlugVariations] Trying variations:`, variations);

  for (const variation of variations) {
    if (variation !== frontendSlug) {
      console.log(`[findPostBySlugVariations] Trying variation: ${variation}`);
      post = await getPostBySlug(variation);
      if (post) {
        console.log(`[findPostBySlugVariations] Found match with variation: ${variation} -> redirecting`);
        return { 
          post, 
          redirectSlug: variation,
          originalSlug: frontendSlug 
        };
      }
    }
  }

  console.log(`[findPostBySlugVariations] No post found for any variation`);
  return { post: null, redirectSlug: null };
}

/**
 * WordPress URL patterns to frontend slug mapping
 * This helps maintain consistent URLs across different environments
 */
export interface UrlMapping {
  backend: string;
  frontend: string;
  canonical: string;
}

export function createUrlMapping(
  post: { link?: string; slug: string },
  frontendSlug: string
): UrlMapping {
  return {
    backend: resolveRankMathUrl(post),
    frontend: resolveFrontendUrl(frontendSlug),
    canonical: resolveFrontendUrl(frontendSlug), // Frontend URL is canonical
  };
}

/**
 * Extract slug from WordPress post link
 */
export function extractSlugFromLink(link: string): string {
  try {
    const url = new URL(link);
    const pathname = url.pathname;
    // Remove leading/trailing slashes and extract slug
    return pathname.replace(/^\/+|\/+$/g, '');
  } catch {
    // If URL parsing fails, return the link as-is
    return link;
  }
}

/**
 * Auto-redirect handler for slug mismatches
 * Returns null if no redirect needed, or redirect URL if needed
 */
export async function checkForRedirect(frontendSlug: string): Promise<string | null> {
  const result = await findPostBySlugVariations(frontendSlug);
  
  if (result.post && result.redirectSlug && result.redirectSlug !== frontendSlug) {
    // Found post with different slug, suggest redirect
    return `/${result.redirectSlug}`;
  }
  
  return null;
} 