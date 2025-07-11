'use client';

import { serverCache } from './server-cache';
import { env } from '@/config/environment';
import { getBackendUrl } from './url-utils';

// TypeScript interfaces for Rank Math API response
export interface RankMathSEOData {
  success: boolean;
  head: string;
}

export interface RankMathAPIError {
  success: false;
  message: string;
  code?: string;
}

export interface RankMathConfig {
  apiUrl: string;
  enabled: boolean;
  timeout: number;
  cacheTime: number;
}

// Enhanced interfaces for extracted data
export interface RankMathExtractedData {
  title?: string;
  description?: string;
  keywords?: string;
  focusKeyword?: string;
  robotsMeta?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: string;
  thumbnail?: string;
  featuredImage?: string;
  structuredData?: any[];
}

// Configuration with environment variables
const config: RankMathConfig = {
  apiUrl: process.env.NEXT_PUBLIC_RANKMATH_API_URL || '',
  enabled: process.env.NEXT_PUBLIC_RANKMATH_API_ENABLED === 'true',
  timeout: 10000, // 10 seconds timeout
  cacheTime: 60 * 60 * 1000, // 1 hour cache
};

// Helper function for conditional logging (only in development)
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

/**
 * RankMath API Service for headless CMS support
 */
class RankMathAPIService {
  private config: RankMathConfig;

  constructor(config: RankMathConfig) {
    this.config = config;
  }

  /**
   * Check if Rank Math API is enabled and configured
   */
  isEnabled(): boolean {
    return this.config.enabled && Boolean(this.config.apiUrl);
  }

  /**
   * Get SEO head data for a specific URL
   */
  async getSEOHead(url: string): Promise<RankMathSEOData | null> {
    if (!this.isEnabled()) {
      debugWarn('[RankMath] API is disabled or not configured');
      debugWarn('[RankMath] Config:', {
        enabled: this.config.enabled,
        apiUrl: this.config.apiUrl ? 'Set' : 'Not set',
        environment: {
          NEXT_PUBLIC_RANKMATH_API_ENABLED: process.env.NEXT_PUBLIC_RANKMATH_API_ENABLED,
          NEXT_PUBLIC_RANKMATH_API_URL: process.env.NEXT_PUBLIC_RANKMATH_API_URL ? 'Set' : 'Not set'
        }
      });
      return null;
    }

    if (!url) {
      debugWarn('[RankMath] URL is required');
      return null;
    }

    // Normalize URL to full URL if it's a relative path
    const fullUrl = this.normalizeUrl(url);
    const cacheKey = `rankmath-seo-${this.hashUrl(fullUrl)}`;

    try {
      // Check server cache first
      const cached = serverCache.get<RankMathSEOData>(cacheKey);
      if (cached) {
        return cached;
      }

      debugLog(`[RankMath] Fetching SEO data for ${fullUrl}`);
      debugLog(`[RankMath] API URL: ${this.config.apiUrl}`);
      
      // Determine if we're running on client or server
      const isClient = typeof window !== 'undefined';
      
      let apiUrl: string;
      
      if (isClient) {
        // Use internal API proxy route to avoid CORS issues
        apiUrl = `/api/rankmath?url=${encodeURIComponent(fullUrl)}`;
        debugLog(`[RankMath] Using client-side proxy: ${apiUrl}`);
      } else {
        // Direct API call on server-side
        apiUrl = `${this.config.apiUrl}?url=${encodeURIComponent(fullUrl)}`;
        debugLog(`[RankMath] Using server-side direct call: ${apiUrl}`);
      }
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': isClient ? 'IndexOf-Headless-Client/1.0' : 'IndexOf-Headless-Server/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      debugLog(`[RankMath] Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        
        // Handle different HTTP status codes more gracefully
        if (response.status === 404) {
          debugLog(`[RankMath] Page not found (404) for ${fullUrl}. Using fallback SEO generation.`);
        } else if (response.status === 403) {
          debugWarn(`[RankMath] Access forbidden (403) for ${fullUrl}. Check API permissions.`);
        } else if (response.status >= 500) {
          debugError(`[RankMath] Server error (${response.status}) for ${fullUrl}. Server may be temporarily unavailable.`);
        } else {
          debugWarn(`[RankMath] HTTP error ${response.status} for ${fullUrl}: ${errorText}`);
        }
        
        // Return null instead of throwing error for non-critical failures
        return null;
      }

      const data = await response.json() as RankMathSEOData;
      debugLog(`[RankMath] Response data:`, {
        success: data.success,
        headLength: data.head ? data.head.length : 0,
        headPreview: data.head ? data.head.substring(0, 200) + '...' : 'No head data'
      });

      if (data.success && data.head) {
        // Cache successful response
        serverCache.set(cacheKey, data, this.config.cacheTime);
        debugLog(`[RankMath] Successfully fetched SEO data for ${fullUrl}`);
        
        // Extract and log key SEO data
        const extracted = this.extractSEOData(data.head);
        debugLog(`[RankMath] Extracted SEO data:`, {
          title: extracted.title ? extracted.title.substring(0, 50) + '...' : 'Not found',
          description: extracted.description ? extracted.description.substring(0, 50) + '...' : 'Not found',
          focusKeyword: extracted.focusKeyword || 'Not found',
          thumbnail: extracted.thumbnail || 'Not found',
          ogImage: extracted.ogImage || 'Not found',
          twitterImage: extracted.twitterImage || 'Not found'
        });
        
        return data;
      } else {
        debugWarn(`[RankMath] API returned success:false for ${fullUrl}`);
        return null;
      }

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          debugWarn(`[RankMath] Request timeout for ${fullUrl}. Using fallback SEO generation.`);
        } else {
          debugLog(`[RankMath] API unavailable for ${fullUrl}. Using fallback SEO generation.`);
        }
      }
      return null;
    }
  }

  /**
   * Extract comprehensive SEO data from Rank Math head HTML
   */
  extractSEOData(headHtml: string): RankMathExtractedData {
    if (!headHtml) return {};

    const extracted: RankMathExtractedData = {};
    
    try {
      const metaTags = this.parseMetaTags(headHtml);
      
      extracted.title = this.extractTitle(headHtml) || 
                       metaTags['title'] ||
                       metaTags['og:title'] ||
                       metaTags['twitter:title'];
      
      extracted.description = metaTags['description'] || metaTags['og:description'];
      extracted.keywords = metaTags['keywords'] || 
                          metaTags['keyword'] ||
                          this.generateKeywordsFromContent(extracted.title, extracted.description, extracted.focusKeyword);
                          
      extracted.robotsMeta = metaTags['robots'];
      extracted.canonicalUrl = this.extractCanonicalUrl(headHtml);

      extracted.focusKeyword = metaTags['rankmath-focus-keyword'] || 
                               metaTags['rank-math-focus-keyword'] || 
                               metaTags['focus-keyword'] ||
                               this.extractFocusKeywordFromContent(headHtml) ||
                               this.generateFallbackFocusKeyword(extracted.title, extracted.description);

      // Extract Open Graph data
      extracted.ogTitle = metaTags['og:title'];
      extracted.ogDescription = metaTags['og:description'];
      extracted.ogImage = metaTags['og:image'];
      extracted.ogType = metaTags['og:type'];
      extracted.ogUrl = this.transformToFrontendUrl(metaTags['og:url'] || '');

      // Extract Twitter Card data
      extracted.twitterTitle = metaTags['twitter:title'];
      extracted.twitterDescription = metaTags['twitter:description'];
      extracted.twitterImage = metaTags['twitter:image'];
      extracted.twitterCard = metaTags['twitter:card'];

      // Extract thumbnail and featured image
      extracted.thumbnail = this.extractImageFromContent(headHtml);
      extracted.featuredImage = extracted.ogImage || extracted.twitterImage || extracted.thumbnail;

      // Extract structured data
      extracted.structuredData = this.getStructuredData(headHtml);

      return extracted;
    } catch (error) {
      return {};
    }
  }

  /**
   * Parse meta tags from head HTML string with enhanced patterns
   */
  parseMetaTags(headHtml: string): Record<string, string> {
    if (!headHtml) return {};

    const metaTags: Record<string, string> = {};
    
    // Enhanced regex patterns for different meta tag formats
    const patterns = [
      // Standard meta tags
      /<meta\s+name=["']([^"']+)["']\s+content=["']([^"']*?)["'][^>]*>/gi,
      /<meta\s+content=["']([^"']*?)["']\s+name=["']([^"']+)["'][^>]*>/gi,
      // Property meta tags (Open Graph, etc.)
      /<meta\s+property=["']([^"']+)["']\s+content=["']([^"']*?)["'][^>]*>/gi,
      /<meta\s+content=["']([^"']*?)["']\s+property=["']([^"']+)["'][^>]*>/gi,
      // HTTP-equiv meta tags
      /<meta\s+http-equiv=["']([^"']+)["']\s+content=["']([^"']*?)["'][^>]*>/gi,
    ];

    patterns.forEach((pattern, index) => {
      let match;
      while ((match = pattern.exec(headHtml)) !== null) {
        if (index % 2 === 0) {
          // name/property first, content second
          metaTags[match[1]] = match[2];
        } else {
          // content first, name/property second
          metaTags[match[2]] = match[1];
        }
      }
    });

    return metaTags;
  }

  /**
   * Extract title from title tag
   */
  extractTitle(headHtml: string): string | undefined {
    // Try to find title tag first
    const titleMatch = headHtml.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch && titleMatch[1] && titleMatch[1].trim()) {
      const title = titleMatch[1].trim();
      return title;
    }

    // Try to find title in meta tags as fallback
    const metaTitlePatterns = [
      /<meta[^>]*name=["']title["'][^>]*content=["']([^"']*?)["'][^>]*>/i,
      /<meta[^>]*content=["']([^"']*?)["'][^>]*name=["']title["'][^>]*>/i,
      /<meta[^>]*property=["']title["'][^>]*content=["']([^"']*?)["'][^>]*>/i,
      /<meta[^>]*content=["']([^"']*?)["'][^>]*property=["']title["'][^>]*>/i,
    ];

    for (const pattern of metaTitlePatterns) {
      const match = headHtml.match(pattern);
      if (match && match[1] && match[1].trim()) {
        const title = match[1].trim();
        return title;
      }
    }

    return undefined;
  }

  /**
   * Extract canonical URL from link tag and transform to frontend domain
   */
  extractCanonicalUrl(headHtml: string): string | undefined {
    const canonicalMatch = headHtml.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i) ||
                          headHtml.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i);
    
    if (canonicalMatch && canonicalMatch[1]) {
      const backendCanonical = canonicalMatch[1];
      const frontendCanonical = this.transformToFrontendUrl(backendCanonical);
      
      return frontendCanonical;
    }
    
    return undefined;
  }

  /**
   * Transform backend URL to frontend URL for headless setup
   */
  private transformToFrontendUrl(backendUrl: string): string {
    if (!backendUrl) return '';

    const backendDomain = env.wordpress.backendUrl;
    const frontendDomain = env.site.url;

    if (!backendDomain || !frontendDomain) {
      return backendUrl;
    }

    try {
      // If URL already matches frontend domain, return as is
      if (backendUrl.startsWith(frontendDomain)) {
        return backendUrl;
      }

      // If URL matches backend domain, transform it
      if (backendUrl.startsWith(backendDomain)) {
        return backendUrl.replace(backendDomain, frontendDomain);
      }

      return backendUrl;
    } catch (error) {
      return backendUrl;
    }
  }

  /**
   * Extract focus keyword from Rank Math specific content or JSON-LD
   */
  extractFocusKeywordFromContent(headHtml: string): string | undefined {
    // Enhanced focus keyword patterns for Rank Math
    const focusKeywordPatterns = [
      // Rank Math specific patterns
      /"focus_kw"[:\s]*"([^"]+)"/i,
      /"focuskw"[:\s]*"([^"]+)"/i,
      /"rank_math_focus_keyword"[:\s]*"([^"]+)"/i,
      /"rankmath_focus_keyword"[:\s]*"([^"]+)"/i,
      
      // General focus keyword patterns
      /focus[_-]?keyword["\'\s]*[:\=]["\'\s]*"([^"\'<>\n]+)"/i,
      /target[_-]?keyword["\'\s]*[:\=]["\'\s]*"([^"\'<>\n]+)"/i,
      
      // JSON patterns
      /"focus[_-]?keyword"[:\s]*"([^"]+)"/i,
      /"target[_-]?keyword"[:\s]*"([^"]+)"/i,
      
      // Script content patterns
      /focusKeyword["\'\s]*[:\=]["\'\s]*"([^"\'<>\n]+)"/i,
      /targetKeyword["\'\s]*[:\=]["\'\s]*"([^"\'<>\n]+)"/i,
      
      // Meta tag content patterns (without quotes)
      /focus[_-]?keyword["\'\s]*[:\=]["\'\s]*([^"\'<>\s,]+)/i,
      /target[_-]?keyword["\'\s]*[:\=]["\'\s]*([^"\'<>\s,]+)/i,
    ];

    // Try each pattern
    for (const pattern of focusKeywordPatterns) {
      const match = headHtml.match(pattern);
      if (match && match[1] && match[1].trim()) {
        const keyword = match[1].trim();
        // Validate keyword (should not be empty or contain obvious placeholders)
        if (keyword.length > 0 && !keyword.includes('placeholder') && !keyword.includes('example')) {
          return keyword;
        }
      }
    }

    // Try to find focus keyword in JSON-LD structured data
    const structuredData = this.getStructuredData(headHtml);
    for (const data of structuredData) {
      if (data.keywords) {
        // If keywords is a string, return the first keyword
        if (typeof data.keywords === 'string') {
          const firstKeyword = data.keywords.split(',')[0].trim();
          if (firstKeyword) {
            return firstKeyword;
          }
        }
        // If keywords is an array, return the first item
        if (Array.isArray(data.keywords) && data.keywords.length > 0) {
          return data.keywords[0];
        }
      }
      
      // Also check for Rank Math specific fields in structured data
      if (data.rankMath && data.rankMath.focusKeyword) {
        return data.rankMath.focusKeyword;
      }
    }

    return undefined;
  }

  /**
   * Generate keywords from content when meta keywords not available
   */
  generateKeywordsFromContent(title?: string, description?: string, focusKeyword?: string): string | undefined {
    const keywords: string[] = [];
    
    // Add focus keyword if available
    if (focusKeyword) {
      keywords.push(focusKeyword);
    }
    
    // Extract keywords from title
    if (title) {
      const titleKeywords = title
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => 
          word.length > 3 && 
          !['cara', 'dengan', 'untuk', 'dari', 'yang', 'pada', 'dalam', 'menggunakan', 'paling', 'terbaik', 'tutorial', 'langkah', 'panduan'].includes(word)
        )
        .slice(0, 5); // Take max 5 keywords from title
      
      titleKeywords.forEach(keyword => {
        if (!keywords.includes(keyword)) {
          keywords.push(keyword);
        }
      });
    }
    
    // Extract additional keywords from description
    if (description && keywords.length < 8) {
      const descKeywords = description
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => 
          word.length > 4 && 
          !['dalam', 'panduan', 'telah', 'membahas', 'langkah', 'untuk', 'dengan', 'menggunakan', 'adalah', 'dapat', 'akan', 'yang', 'ini', 'kita'].includes(word)
        )
        .slice(0, 3); // Take max 3 additional keywords from description
      
      descKeywords.forEach(keyword => {
        if (!keywords.includes(keyword) && keywords.length < 8) {
          keywords.push(keyword);
        }
      });
    }
    
    if (keywords.length > 0) {
      const result = keywords.join(', ');
      return result;
    }
    
    return undefined;
  }

  /**
   * Generate fallback focus keyword from title or description
   */
  generateFallbackFocusKeyword(title?: string, description?: string): string | undefined {
    // Try to extract meaningful keywords from title first
    if (title) {
      // Remove common words and get the main topic
      const titleWords = title
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => 
          word.length > 3 && 
          !['cara', 'dengan', 'untuk', 'dari', 'yang', 'pada', 'dalam', 'menggunakan', 'paling', 'terbaik', 'tutorial'].includes(word)
        );
      
      if (titleWords.length > 0) {
        // Take first 2-3 meaningful words
        const focusKeyword = titleWords.slice(0, Math.min(3, titleWords.length)).join(' ');
        return focusKeyword;
      }
    }
    
    // Fallback to description
    if (description) {
      const descWords = description
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => 
          word.length > 4 && 
          !['dalam', 'panduan', 'telah', 'membahas', 'langkah', 'untuk', 'dengan', 'menggunakan'].includes(word)
        );
      
      if (descWords.length > 0) {
        const focusKeyword = descWords.slice(0, 2).join(' ');
        return focusKeyword;
      }
    }
    
    return undefined;
  }

  /**
   * Extract image from link or meta tags
   */
  extractImageFromContent(headHtml: string): string | undefined {
    // Try different image patterns
    const imagePatterns = [
      /<link[^>]*rel=["']image["'][^>]*href=["']([^"']+)["'][^>]*>/i,
      /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']image["'][^>]*>/i,
      /<meta[^>]*name=["']image["'][^>]*content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']image["'][^>]*>/i,
    ];

    for (const pattern of imagePatterns) {
      const match = headHtml.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }

  /**
   * Extract specific meta tag value
   */
  getMetaTag(headHtml: string, tagName: string): string | null {
    const metaTags = this.parseMetaTags(headHtml);
    return metaTags[tagName] || null;
  }

  /**
   * Get structured data from head HTML
   */
  getStructuredData(headHtml: string): any[] {
    if (!headHtml) return [];

    const structuredData: any[] = [];
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gi;
    let match;

    while ((match = jsonLdRegex.exec(headHtml)) !== null) {
      try {
        const jsonData = JSON.parse(match[1].trim());
        structuredData.push(jsonData);
      } catch (error) {
        debugWarn('[RankMath] Failed to parse JSON-LD:', error);
      }
    }

    return structuredData;
  }

  /**
   * Normalize URL to full URL - always use WordPress backend URL for RankMath API
   */
  private normalizeUrl(url: string): string {
    // If URL is already absolute, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // For RankMath API, we MUST use WordPress backend URL
    const baseUrl = getBackendUrl();
    
    // Ensure URL starts with /
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    const fullUrl = `${baseUrl}${normalizedPath}`;
    
    return fullUrl;
  }

  /**
   * Create a simple hash of URL for cache key
   */
  private hashUrl(url: string): string {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    if (!this.isEnabled()) {
      debugLog('[RankMath] Connection test failed: API not enabled');
      return false;
    }

    try {
      const testUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_FRONTEND_DOMAIN || process.env.NEXT_PUBLIC_WORDPRESS_BACKEND_URL || 'http://localhost:3000';
      debugLog(`[RankMath] Testing connection with URL: ${testUrl}`);
      const result = await this.getSEOHead(testUrl);
      const isConnected = result !== null;
      debugLog(`[RankMath] Connection test result: ${isConnected ? 'SUCCESS' : 'FAILED'}`);
      return isConnected;
    } catch (error) {
      debugError('[RankMath] Connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const rankMathAPI = new RankMathAPIService(config);

// Helper functions for easier usage
export async function getRankMathSEO(url: string): Promise<RankMathSEOData | null> {
  return rankMathAPI.getSEOHead(url);
}

export function parseRankMathMeta(headHtml: string): Record<string, string> {
  return rankMathAPI.parseMetaTags(headHtml);
}

export function getRankMathMetaTag(headHtml: string, tagName: string): string | null {
  return rankMathAPI.getMetaTag(headHtml, tagName);
}

export function getRankMathStructuredData(headHtml: string): any[] {
  return rankMathAPI.getStructuredData(headHtml);
}

export function extractRankMathSEOData(headHtml: string): RankMathExtractedData {
  return rankMathAPI.extractSEOData(headHtml);
}

// Export for debugging
export { config as rankMathConfig }; 