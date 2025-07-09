'use client';

import React, { useState, useEffect } from 'react';
import { getRankMathSEO, extractRankMathSEOData, type RankMathSEOData, type RankMathExtractedData } from '@/lib/rankmath-api';
import { getUrlAnalysis, getSampleTestUrl } from '@/lib/url-utils';
import '@/lib/debug-rankmath'; // Load debug utilities
import { 
  generateOrganizationSchema, 
  generateArticleSchema, 
  generateWebPageSchema, 
  generateBreadcrumbSchema 
} from '@/lib/schema-generator';
import type { WordPressPost, WordPressCategory, WordPressTag } from '@/types/wordpress';

interface SEOHeadProps {
  url: string;
  post?: WordPressPost;
  postCategories?: WordPressCategory[];
  postTags?: WordPressTag[];
  featuredImageUrl?: string | null;
  customTitle?: string;
  customDescription?: string;
  pageType?: 'WebPage' | 'Article' | 'BlogPosting';
  fallbackEnabled?: boolean;
}

interface SEOState {
  loading: boolean;
  rankMathData: RankMathSEOData | null;
  error: string | null;
  useFallback: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  url,
  post,
  postCategories = [],
  postTags = [],
  featuredImageUrl,
  customTitle,
  customDescription,
  pageType = 'WebPage',
  fallbackEnabled = true,
}) => {
  console.log('[SEOHead] Component initialized with URL:', url);
  
  const [seoState, setSeoState] = useState<SEOState>({
    loading: false,
    rankMathData: null,
    error: null,
    useFallback: false,
  });

  // Simplified approach - fetch SEO data directly when component mounts
  useEffect(() => {
    // Skip if running on server
    if (typeof window === 'undefined') {
      console.log('[SEOHead] ⏭️  Skipping server-side execution');
      return;
    }
    
    console.log('[SEOHead] ✅ Component mounted on client-side with URL:', url);

    const fetchSEOData = async () => {
      try {
        console.log('[SEOHead] 🚀 Starting SEO data fetch for URL:', url);
        console.log('[SEOHead] 🔍 URL analysis:', getUrlAnalysis(url));
        setSeoState(prev => ({ ...prev, loading: true, error: null }));
        
        const rankMathData = await getRankMathSEO(url);
        console.log('[SEOHead] 📡 Rank Math API response received:', {
          success: rankMathData?.success,
          hasHead: !!rankMathData?.head,
          headLength: rankMathData?.head?.length || 0
        });
        
        if (rankMathData && rankMathData.success && rankMathData.head) {
          console.log('[SEOHead] ✅ Using Rank Math SEO data for:', url);
          
          // Extract and log specific SEO data for debugging
          const extracted = extractRankMathSEOData(rankMathData.head);
          console.log('[SEOHead] 🔍 Extracted SEO data:', {
            title: extracted.title ? `"${extracted.title.substring(0, 50)}..."` : '❌ Not found',
            description: extracted.description ? `"${extracted.description.substring(0, 50)}..."` : '❌ Not found',
            focusKeyword: extracted.focusKeyword ? `"${extracted.focusKeyword}"` : '❌ Not found',
            thumbnail: extracted.thumbnail ? `"${extracted.thumbnail}"` : '❌ Not found',
            ogImage: extracted.ogImage ? `"${extracted.ogImage}"` : '❌ Not found',
            twitterImage: extracted.twitterImage ? `"${extracted.twitterImage}"` : '❌ Not found',
            canonicalUrl: extracted.canonicalUrl ? `"${extracted.canonicalUrl}"` : '❌ Not found',
          });
          
          setSeoState({
            loading: false,
            rankMathData,
            error: null,
            useFallback: false,
          });
        } else {
          console.warn('[SEOHead] ⚠️  Rank Math data unavailable, using fallback for:', url);
          setSeoState({
            loading: false,
            rankMathData: null,
            error: 'Rank Math data not available',
            useFallback: fallbackEnabled,
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const isCorsError = errorMessage.includes('CORS') || errorMessage.includes('blocked');
        
        if (isCorsError) {
          console.warn('[SEOHead] 🌐 CORS error detected, using fallback SEO generation:', errorMessage);
        } else {
          console.error('[SEOHead] ❌ Error fetching Rank Math data:', error);
        }
        
        setSeoState({
          loading: false,
          rankMathData: null,
          error: errorMessage,
          useFallback: fallbackEnabled,
        });
      }
    };

    if (url) {
      console.log('[SEOHead] 🎯 Triggering SEO data fetch...');
      fetchSEOData();
    }
  }, [url, fallbackEnabled]);

  // Inject SEO data into document head (only on client-side)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    console.log('[SEOHead] 💉 Injecting SEO data, state:', {
      loading: seoState.loading,
      hasRankMathData: !!seoState.rankMathData,
      useFallback: seoState.useFallback,
      error: seoState.error
    });

    // Remove any existing RankMath/fallback meta tags
    const existingTags = document.querySelectorAll('[data-rankmath], [data-fallback-seo]');
    if (existingTags.length > 0) {
      console.log('[SEOHead] 🧹 Removing', existingTags.length, 'existing SEO tags');
      existingTags.forEach(tag => tag.remove());
    }

    if (!seoState.loading) {
      if (seoState.rankMathData && seoState.rankMathData.head) {
        // Inject Rank Math SEO data
        console.log('[SEOHead] 🎯 Injecting Rank Math HTML:', seoState.rankMathData.head.substring(0, 200) + '...');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = seoState.rankMathData.head;
        
        // Count different types of tags
        const metaTags = tempDiv.querySelectorAll('meta');
        const linkTags = tempDiv.querySelectorAll('link');
        const scriptTags = tempDiv.querySelectorAll('script');
        
        console.log('[SEOHead] 📊 Found tags:', {
          meta: metaTags.length,
          link: linkTags.length,
          script: scriptTags.length,
          total: tempDiv.children.length
        });
        
        // Move each child element to document head
        Array.from(tempDiv.children).forEach((element, index) => {
          element.setAttribute('data-rankmath', 'true');
          element.setAttribute('data-rankmath-index', index.toString());
          document.head.appendChild(element);
        });
        
        console.log('[SEOHead] ✅ Rank Math SEO injected into document head');
      } else if (seoState.useFallback) {
        // Inject fallback schemas (async)
        const injectFallbackSchemas = async () => {
          const fallbackSchemas = await generateFallbackSchemas({
            post,
            postCategories,
            postTags,
            featuredImageUrl,
            customTitle,
            customDescription,
            pageType,
          });

          console.log('[SEOHead] 📄 Injecting', fallbackSchemas.length, 'fallback schemas');
          fallbackSchemas.forEach((schema, index) => {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(schema);
            script.setAttribute('data-fallback-seo', 'true');
            script.setAttribute('data-schema-index', index.toString());
            document.head.appendChild(script);
          });
          
          console.log('[SEOHead] ✅ Fallback SEO schemas injected into document head');
        };
        
        injectFallbackSchemas();
      } else {
        console.log('[SEOHead] ⚠️  No SEO data to inject');
      }
    }

    // Cleanup function to remove SEO data when component unmounts
    return () => {
      const tagsToRemove = document.querySelectorAll('[data-rankmath], [data-fallback-seo]');
      if (tagsToRemove.length > 0) {
        console.log('[SEOHead] 🧹 Cleanup: removing', tagsToRemove.length, 'SEO tags');
        tagsToRemove.forEach(tag => tag.remove());
      }
    };
  }, [seoState, post, postCategories, postTags, featuredImageUrl, customTitle, customDescription, pageType]);

  // This component doesn't render anything visible on server or client

  // This component doesn't render anything visible
  return null;
};

// Add global debug functions to window object for browser console testing
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.debugRankMath = {
    config: () => {
      console.log('⚙️ [RankMath Debug] Current configuration:');
      const config = {
        enabled: process.env.NEXT_PUBLIC_RANKMATH_API_ENABLED,
        apiUrl: process.env.NEXT_PUBLIC_RANKMATH_API_URL,
        frontendDomain: process.env.NEXT_PUBLIC_FRONTEND_DOMAIN,
        backendUrl: process.env.NEXT_PUBLIC_WORDPRESS_BACKEND_URL,
      };
      console.table(config);
      return config;
    },

    env: () => {
      console.log('🌍 [RankMath Debug] Environment variables:');
      const envVars = {
        NEXT_PUBLIC_RANKMATH_API_ENABLED: process.env.NEXT_PUBLIC_RANKMATH_API_ENABLED,
        NEXT_PUBLIC_RANKMATH_API_URL: process.env.NEXT_PUBLIC_RANKMATH_API_URL,
        NEXT_PUBLIC_FRONTEND_DOMAIN: process.env.NEXT_PUBLIC_FRONTEND_DOMAIN,
        NEXT_PUBLIC_WORDPRESS_BACKEND_URL: process.env.NEXT_PUBLIC_WORDPRESS_BACKEND_URL,
      };
      console.table(envVars);
      return envVars;
    },
    
    test: async (testUrl?: string) => {
      const url = testUrl || getSampleTestUrl();
      console.log('🧪 [RankMath Debug] Testing with URL:', url);
      
      try {
        const result = await getRankMathSEO(url);
        if (result) {
          console.log('✅ [RankMath Debug] API connection successful!');
          console.log('📡 [RankMath Debug] Response:', result);
          
          if (result.head) {
            const extracted = extractRankMathSEOData(result.head);
            console.log('🔍 [RankMath Debug] Extracted data:', extracted);
          }
        } else {
          console.log('❌ [RankMath Debug] No data returned');
        }
        return result;
      } catch (error) {
        console.error('❌ [RankMath Debug] Error:', error);
        return null;
      }
    },
    
    extract: (htmlContent: string) => {
      console.log('🔍 [RankMath Debug] Extracting data from HTML...');
      const extracted = extractRankMathSEOData(htmlContent);
      console.log('📊 [RankMath Debug] Result:', extracted);
      return extracted;
    },

    // Enhanced debug function for deep analysis
    analyze: async (testUrl?: string) => {
      const url = testUrl || getSampleTestUrl();
      console.log('🔍 [RankMath Debug] Deep analysis for:', url);
      
      try {
        const result = await getRankMathSEO(url);
        if (result && result.head) {
          const html = result.head;
          
          console.log('📊 HTML Analysis:');
          console.log('Total length:', html.length);
          
          // Title analysis
          console.log('🏷️ === TITLE ANALYSIS ===');
          const titleMatches = html.match(/<title[^>]*>([^<]*)<\/title>/gi);
          console.log('Title tags:', titleMatches || 'None found');
          
          const ogTitleMatches = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*?)["'][^>]*>/gi);
          console.log('OG Title tags:', ogTitleMatches || 'None found');
          
          // Focus keyword analysis
          console.log('🎯 === FOCUS KEYWORD ANALYSIS ===');
          
          // Look for any mention of 'focus' or 'keyword'
          const focusInstances = (html.match(/focus/gi) || []).length;
          const keywordInstances = (html.match(/keyword/gi) || []).length;
          console.log(`Found ${focusInstances} instances of "focus" and ${keywordInstances} instances of "keyword"`);
          
          // Search for JSON-LD
          console.log('📋 === JSON-LD ANALYSIS ===');
          const jsonScripts = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
          if (jsonScripts) {
            console.log(`Found ${jsonScripts.length} JSON-LD scripts`);
            jsonScripts.forEach((script, i) => {
              try {
                const jsonMatch = script.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
                if (jsonMatch) {
                  const jsonData = JSON.parse(jsonMatch[1]);
                  console.log(`JSON-LD ${i + 1}:`, {
                    type: jsonData['@type'],
                    name: jsonData.name,
                    headline: jsonData.headline,
                    keywords: jsonData.keywords,
                    hasKeywords: !!jsonData.keywords
                  });
                }
              } catch (e) {
                console.log(`JSON-LD ${i + 1} parse error:`, e instanceof Error ? e.message : String(e));
              }
            });
          } else {
            console.log('No JSON-LD scripts found');
          }
          
          // Show sample content
          console.log('📄 === SAMPLE CONTENT ===');
          console.log('First 1000 chars:', html.substring(0, 1000));
          
          return { html, analysis: 'complete' };
        }
      } catch (error) {
        console.error('❌ Analysis error:', error);
        return null;
      }
    }
  };
  
  console.log('🛠️ [RankMath Debug] Debug utilities loaded! Use:');
  console.log('   debugRankMath.config() - Show configuration');
  console.log('   debugRankMath.env() - Show environment variables');
  console.log('   debugRankMath.test() - Test API connection');
  console.log('   debugRankMath.extract(html) - Extract data from HTML');
  console.log('   debugRankMath.analyze() - Deep analysis of content');
}

/**
 * Generate fallback schemas when Rank Math is not available
 */
async function generateFallbackSchemas({
  post,
  postCategories,
  postTags,
  featuredImageUrl,
  customTitle,
  customDescription,
  pageType,
}: {
  post?: WordPressPost;
  postCategories?: WordPressCategory[];
  postTags?: WordPressTag[];
  featuredImageUrl?: string | null;
  customTitle?: string;
  customDescription?: string;
  pageType?: string;
}): Promise<any[]> {
  const schemas: any[] = [];

  try {
    // Always include organization schema
    schemas.push(generateOrganizationSchema());

    // Generate breadcrumb schema
    if (post || customTitle) {
      schemas.push(generateBreadcrumbSchema({
        post: post || null,
        postCategories: postCategories || [],
        postTags: postTags || [],
        featuredImageUrl,
      }));
    }

    // Generate page-specific schema
    if (post) {
      // Article schema for posts (now async)
      const articleSchema = await generateArticleSchema({
        post,
        postCategories: postCategories || [],
        postTags: postTags || [],
        featuredImageUrl,
      });
      if (articleSchema) {
        schemas.push(articleSchema);
      }
      
      // WebPage schema for posts
      schemas.push(generateWebPageSchema({
        post,
        postCategories: postCategories || [],
        postTags: postTags || [],
        featuredImageUrl,
      }));
    } else {
      // Generic webpage schema for non-post pages
      schemas.push(generateWebPageSchema({
        post: null,
        postCategories: [],
        postTags: [],
        customTitle,
        customDescription,
        pageType,
      }));
    }

    console.log('[SEOHead] Generated fallback schemas:', schemas.length);
    return schemas;
  } catch (error) {
    console.error('[SEOHead] Error generating fallback schemas:', error);
    return [];
  }
}

/**
 * Server-side function to fetch Rank Math SEO data
 * This should be used in server components or getServerSideProps
 */
export async function getServerSideRankMathSEO(url: string): Promise<RankMathSEOData | null> {
  try {
    return await getRankMathSEO(url);
  } catch (error) {
    console.error('[getServerSideRankMathSEO] Error:', error);
    return null;
  }
}

/**
 * Custom hook for using Rank Math SEO data in client components
 */
export function useRankMathSEO(url: string) {
  const [data, setData] = useState<RankMathSEOData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getRankMathSEO(url);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchData();
    }
  }, [url]);

  return { data, loading, error };
}

export default SEOHead; 