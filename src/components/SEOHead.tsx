'use client';

import React, { useState, useEffect } from 'react';
import { getRankMathSEO, extractRankMathSEOData, type RankMathSEOData, type RankMathExtractedData } from '@/lib/rankmath-api';
import { getUrlAnalysis, getSampleTestUrl } from '@/lib/url-utils';
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
  const [seoState, setSeoState] = useState<SEOState>({
    loading: false,
    rankMathData: null,
    error: null,
    useFallback: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fetchSEOData = async () => {
      try {
        setSeoState(prev => ({ ...prev, loading: true, error: null }));
        
        const rankMathData = await getRankMathSEO(url);
        
        if (rankMathData && rankMathData.success && rankMathData.head) {
          const extracted = extractRankMathSEOData(rankMathData.head);
          
          setSeoState({
            loading: false,
            rankMathData,
            error: null,
            useFallback: false,
          });
        } else {
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
        const is404Error = errorMessage.includes('404') || errorMessage.includes('not found');
        
        setSeoState({
          loading: false,
          rankMathData: null,
          error: is404Error ? 'Page not found in RankMath' : errorMessage,
          useFallback: fallbackEnabled,
        });
      }
    };

    if (url) {
      fetchSEOData();
    }
  }, [url, fallbackEnabled]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const existingTags = document.querySelectorAll('[data-rankmath], [data-fallback-seo]');
    existingTags.forEach(tag => tag.remove());

    if (!seoState.loading) {
      if (seoState.rankMathData && seoState.rankMathData.head) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = seoState.rankMathData.head;
        
        const hasBreadcrumb = seoState.rankMathData.head.toLowerCase().includes('breadcrumb');
        
        Array.from(tempDiv.children).forEach((element, index) => {
          element.setAttribute('data-rankmath', 'true');
          element.setAttribute('data-rankmath-index', index.toString());
          document.head.appendChild(element);
        });
        
        if (!hasBreadcrumb && (post || customTitle)) {
          const breadcrumbSchema = generateBreadcrumbSchema({
            post: post || null,
            postCategories: postCategories || [],
            postTags: postTags || [],
            featuredImageUrl,
          });
          
          const breadcrumbScript = document.createElement('script');
          breadcrumbScript.type = 'application/ld+json';
          breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
          breadcrumbScript.setAttribute('data-rankmath', 'true');
          breadcrumbScript.setAttribute('data-breadcrumb', 'true');
          document.head.appendChild(breadcrumbScript);
        }
      } else if (seoState.useFallback) {
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

          fallbackSchemas.forEach((schema, index) => {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(schema);
            script.setAttribute('data-fallback-seo', 'true');
            script.setAttribute('data-schema-index', index.toString());
            document.head.appendChild(script);
          });
        };
        
        injectFallbackSchemas();
      }
    }

    return () => {
      const tagsToRemove = document.querySelectorAll('[data-rankmath], [data-fallback-seo]');
      tagsToRemove.forEach(tag => tag.remove());
    };
  }, [seoState, post, postCategories, postTags, featuredImageUrl, customTitle, customDescription, pageType]);

  return null;
};

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
  const schemas = [];

  // Add organization schema
  schemas.push(generateOrganizationSchema());

  // Add article/webpage schema based on pageType
  if (pageType === 'Article' || pageType === 'BlogPosting') {
    schemas.push(
      generateArticleSchema({
        post: post || null,
        postCategories: postCategories || [],
        postTags: postTags || [],
        featuredImageUrl,
        customTitle,
        customDescription,
      })
    );
  } else {
    schemas.push(
      generateWebPageSchema({
        post: post || null,
        postCategories: postCategories || [],
        postTags: postTags || [],
        featuredImageUrl,
        customTitle,
        customDescription,
      })
    );
  }

  // Add breadcrumb schema
  schemas.push(
    generateBreadcrumbSchema({
      post: post || null,
      postCategories: postCategories || [],
      postTags: postTags || [],
      featuredImageUrl,
    })
  );

  return schemas;
}

export default SEOHead; 