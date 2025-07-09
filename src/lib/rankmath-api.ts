'use client';

import { serverCache } from './server-cache';
import { env } from '@/config/environment';

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
  timeout: 5000, // 5 seconds timeout
  cacheTime: 60 * 60 * 1000, // 1 hour cache
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
      console.warn('[RankMath] API is disabled or not configured');
      console.warn('[RankMath] Config:', {
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
      console.warn('[RankMath] URL is required');
      return null;
    }

    // Normalize URL to full URL if it's a relative path
    const fullUrl = this.normalizeUrl(url);
    const cacheKey = `rankmath-seo-${this.hashUrl(fullUrl)}`;

    try {
      // Check server cache first
      const cached = serverCache.get<RankMathSEOData>(cacheKey);
      if (cached) {
        console.log(`[RankMath] Cache hit for ${fullUrl}`);
        return cached;
      }

      console.log(`[RankMath] Fetching SEO data for ${fullUrl}`);
      console.log(`[RankMath] API URL: ${this.config.apiUrl}`);
      
      // Build API request URL
      const apiUrl = `${this.config.apiUrl}?url=${encodeURIComponent(fullUrl)}`;
      console.log(`[RankMath] Full request URL: ${apiUrl}`);
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'IndexOf-Headless/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`[RankMath] Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[RankMath] HTTP error! status: ${response.status}, body: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as RankMathSEOData;
      console.log(`[RankMath] Response data:`, {
        success: data.success,
        headLength: data.head ? data.head.length : 0,
        headPreview: data.head ? data.head.substring(0, 200) + '...' : 'No head data'
      });

      if (data.success && data.head) {
        // Cache successful response
        serverCache.set(cacheKey, data, this.config.cacheTime);
        console.log(`[RankMath] Successfully fetched SEO data for ${fullUrl}`);
        
        // Extract and log key SEO data
        const extracted = this.extractSEOData(data.head);
        console.log(`[RankMath] Extracted SEO data:`, {
          title: extracted.title ? extracted.title.substring(0, 50) + '...' : 'Not found',
          description: extracted.description ? extracted.description.substring(0, 50) + '...' : 'Not found',
          focusKeyword: extracted.focusKeyword || 'Not found',
          thumbnail: extracted.thumbnail || 'Not found',
          ogImage: extracted.ogImage || 'Not found',
          twitterImage: extracted.twitterImage || 'Not found'
        });
        
        return data;
      } else {
        console.warn(`[RankMath] API returned success:false for ${fullUrl}`);
        return null;
      }

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error(`[RankMath] Request timeout for ${fullUrl}`);
        } else {
          console.error(`[RankMath] API error for ${fullUrl}:`, error.message);
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
      // Parse meta tags
      const metaTags = this.parseMetaTags(headHtml);
      
      // Extract basic meta data with fallbacks
      extracted.title = this.extractTitle(headHtml) || 
                       metaTags['title'] ||
                       metaTags['og:title'] ||
                       metaTags['twitter:title'];
      
      console.log('[RankMath] Title extraction debug:', {
        fromTitleTag: this.extractTitle(headHtml),
        fromTitleMeta: metaTags['title'],
        fromOgTitle: metaTags['og:title'],
        fromTwitterTitle: metaTags['twitter:title'],
        finalTitle: extracted.title
      });
      
      extracted.description = metaTags['description'] || metaTags['og:description'];
      extracted.keywords = metaTags['keywords'] || 
                          metaTags['keyword'] ||
                          this.generateKeywordsFromContent(extracted.title, extracted.description, extracted.focusKeyword);
                          
      console.log('[RankMath] Keywords extraction debug:', {
        fromKeywordsMeta: metaTags['keywords'],
        fromKeywordMeta: metaTags['keyword'],
        fromGenerated: this.generateKeywordsFromContent(extracted.title, extracted.description, extracted.focusKeyword),
        finalKeywords: extracted.keywords
      });
      extracted.robotsMeta = metaTags['robots'];
      extracted.canonicalUrl = this.extractCanonicalUrl(headHtml);

      // Extract Rank Math specific data
      extracted.focusKeyword = metaTags['rankmath-focus-keyword'] || 
                               metaTags['rank-math-focus-keyword'] || 
                               metaTags['focus-keyword'] ||
                               this.extractFocusKeywordFromContent(headHtml) ||
                               this.generateFallbackFocusKeyword(extracted.title, extracted.description);
                               
      console.log('[RankMath] Focus keyword extraction debug:', {
        fromRankMathMeta: metaTags['rankmath-focus-keyword'],
        fromRankMathMeta2: metaTags['rank-math-focus-keyword'], 
        fromFocusKeywordMeta: metaTags['focus-keyword'],
        fromContent: this.extractFocusKeywordFromContent(headHtml),
        fromFallback: this.generateFallbackFocusKeyword(extracted.title, extracted.description),
        finalFocusKeyword: extracted.focusKeyword
      });

      // Extract Open Graph data
      extracted.ogTitle = metaTags['og:title'];
      extracted.ogDescription = metaTags['og:description'];
      extracted.ogImage = metaTags['og:image'];
      extracted.ogType = metaTags['og:type'];
      
      // Transform og:url to frontend domain
      const ogUrl = metaTags['og:url'];
      if (ogUrl) {
        extracted.ogUrl = this.transformToFrontendUrl(ogUrl);
        console.log('[RankMath] OG URL transformed:', {
          backend: ogUrl,
          frontend: extracted.ogUrl
        });
      }

      // Extract Twitter data
      extracted.twitterTitle = metaTags['twitter:title'];
      extracted.twitterDescription = metaTags['twitter:description'];
      extracted.twitterImage = metaTags['twitter:image'];
      extracted.twitterCard = metaTags['twitter:card'];

      // Extract thumbnail/featured image from multiple sources
      extracted.thumbnail = extracted.ogImage || 
                           extracted.twitterImage ||
                           metaTags['thumbnail'] ||
                           metaTags['featured-image'] ||
                           this.extractImageFromContent(headHtml);
      
      extracted.featuredImage = extracted.thumbnail;

      // Extract structured data
      extracted.structuredData = this.getStructuredData(headHtml);

      console.log('[RankMath] Extracted data summary:', {
        hasTitle: !!extracted.title,
        hasDescription: !!extracted.description,
        hasFocusKeyword: !!extracted.focusKeyword,
        hasThumbnail: !!extracted.thumbnail,
        hasOgImage: !!extracted.ogImage,
        hasStructuredData: extracted.structuredData && extracted.structuredData.length > 0
      });

    } catch (error) {
      console.error('[RankMath] Error extracting SEO data:', error);
    }

    return extracted;
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
      console.log('[RankMath] Found title in <title> tag:', title);
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
        console.log('[RankMath] Found title in meta tag:', title);
        return title;
      }
    }

    console.log('[RankMath] No title found');
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
      
      console.log('[RankMath] Canonical URL transformation:', {
        backend: backendCanonical,
        frontend: frontendCanonical
      });
      
      return frontendCanonical;
    }
    
    return undefined;
  }

  /**
   * Transform backend URL to frontend URL for headless setup
   */
  private transformToFrontendUrl(backendUrl: string): string {
    try {
      const backendDomain = env.wordpress.backendUrl;
      const frontendDomain = env.wordpress.frontendDomain;
      
      console.log('[RankMath] Transform URL debug:', {
        inputUrl: backendUrl,
        backendDomain,
        frontendDomain,
        envCheck: {
          backendFromEnv: process.env.NEXT_PUBLIC_WORDPRESS_BACKEND_URL,
          frontendFromEnv: process.env.NEXT_PUBLIC_FRONTEND_DOMAIN
        }
      });
      
      if (!backendDomain || !frontendDomain) {
        console.warn('[RankMath] Backend or frontend domain not configured, returning original URL');
        console.warn('[RankMath] Missing domains:', { backendDomain, frontendDomain });
        return backendUrl;
      }
      
      // Remove trailing slashes for consistent comparison
      const cleanBackendDomain = backendDomain.replace(/\/$/, '');
      const cleanFrontendDomain = frontendDomain.replace(/\/$/, '');
      
      // Replace backend domain with frontend domain
      if (backendUrl.startsWith(cleanBackendDomain)) {
        const transformedUrl = backendUrl.replace(cleanBackendDomain, cleanFrontendDomain);
        console.log('[RankMath] URL transformed:', {
          from: backendUrl,
          to: transformedUrl,
          backendDomain: cleanBackendDomain,
          frontendDomain: cleanFrontendDomain
        });
        return transformedUrl;
      }
      
      // If URL doesn't match backend domain, return as-is
      console.log('[RankMath] URL not transformed (no domain match):', backendUrl);
      return backendUrl;
      
    } catch (error) {
      console.error('[RankMath] Error transforming URL:', error);
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
          console.log('[RankMath] Found focus keyword with pattern:', pattern.source, '=>', keyword);
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
            console.log('[RankMath] Found focus keyword in structured data:', firstKeyword);
            return firstKeyword;
          }
        }
        // If keywords is an array, return the first item
        if (Array.isArray(data.keywords) && data.keywords.length > 0) {
          console.log('[RankMath] Found focus keyword in structured data array:', data.keywords[0]);
          return data.keywords[0];
        }
      }
      
      // Also check for Rank Math specific fields in structured data
      if (data.rankMath && data.rankMath.focusKeyword) {
        console.log('[RankMath] Found focus keyword in Rank Math data:', data.rankMath.focusKeyword);
        return data.rankMath.focusKeyword;
      }
    }

    console.log('[RankMath] No focus keyword found in content');
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
      console.log('[RankMath] Generated keywords from content:', result);
      return result;
    }
    
    console.log('[RankMath] Could not generate keywords from content');
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
        console.log('[RankMath] Generated focus keyword from title:', focusKeyword);
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
        console.log('[RankMath] Generated focus keyword from description:', focusKeyword);
        return focusKeyword;
      }
    }
    
    console.log('[RankMath] Could not generate fallback focus keyword');
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
        console.warn('[RankMath] Failed to parse JSON-LD:', error);
      }
    }

    return structuredData;
  }

  /**
   * Normalize URL to full URL
   */
  private normalizeUrl(url: string): string {
    // If URL is already absolute, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Get base URL from environment
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Ensure URL starts with /
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    
    return `${baseUrl}${normalizedPath}`;
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
      console.log('[RankMath] Connection test failed: API not enabled');
      return false;
    }

    try {
      const testUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      console.log(`[RankMath] Testing connection with URL: ${testUrl}`);
      const result = await this.getSEOHead(testUrl);
      const isConnected = result !== null;
      console.log(`[RankMath] Connection test result: ${isConnected ? 'SUCCESS' : 'FAILED'}`);
      return isConnected;
    } catch (error) {
      console.error('[RankMath] Connection test failed:', error);
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