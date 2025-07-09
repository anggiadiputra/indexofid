'use client';

import { rankMathAPI, type RankMathExtractedData } from './rankmath-api';

/**
 * Debug utility for testing Rank Math API connection and data extraction
 */
export class RankMathDebugger {
  /**
   * Test Rank Math API connection
   */
  static async testConnection(): Promise<void> {
    console.log('🔧 [RankMath Debug] Testing API connection...');
    
    const isEnabled = rankMathAPI.isEnabled();
    console.log(`📊 [RankMath Debug] API Enabled: ${isEnabled}`);
    
    if (!isEnabled) {
      console.log('❌ [RankMath Debug] API not enabled. Check environment variables:');
      console.log('   - NEXT_PUBLIC_RANKMATH_API_ENABLED should be "true"');
      console.log('   - NEXT_PUBLIC_RANKMATH_API_URL should be set to your WordPress Rank Math API endpoint');
      return;
    }
    
    console.log('⚙️ [RankMath Debug] Configuration:', {
      enabled: rankMathAPI.isEnabled(),
      apiUrl: process.env.NEXT_PUBLIC_RANKMATH_API_URL,
      apiEnabled: process.env.NEXT_PUBLIC_RANKMATH_API_ENABLED
    });
    
    // Test with a sample URL
    const testUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_BACKEND_URL || 'https://your-wordpress-backend.com'}/sample-post/`;
    console.log(`🧪 [RankMath Debug] Testing with URL: ${testUrl}`);
    
    try {
      const result = await rankMathAPI.getSEOHead(testUrl);
      if (result) {
        console.log('✅ [RankMath Debug] API connection successful!');
        console.log('📡 [RankMath Debug] Response:', result);
        
        // Test data extraction
        const extracted = rankMathAPI.extractSEOData(result.head);
        console.log('🔍 [RankMath Debug] Extracted data:', extracted);
        
        if (extracted.focusKeyword) {
          console.log(`🎯 [RankMath Debug] Focus Keyword found: "${extracted.focusKeyword}"`);
        } else {
          console.log('⚠️ [RankMath Debug] No focus keyword found');
        }
        
        if (extracted.ogImage || extracted.thumbnail) {
          console.log(`🖼️ [RankMath Debug] Thumbnail found: "${extracted.ogImage || extracted.thumbnail}"`);
        } else {
          console.log('⚠️ [RankMath Debug] No thumbnail found');
        }
      } else {
        console.log('❌ [RankMath Debug] API returned null response');
      }
    } catch (error) {
      console.error('❌ [RankMath Debug] API connection failed:', error);
    }
  }

  /**
   * Extract and display SEO data from HTML
   */
     static extractData(htmlContent: string): RankMathExtractedData {
     console.log('🔍 [RankMath Debug] Extracting SEO data from HTML...');
     
     const extracted = rankMathAPI.extractSEOData(htmlContent);
    
    console.log('📊 [RankMath Debug] Extraction results:');
    console.table({
      'Title': extracted.title || '❌ Not found',
      'Description': extracted.description || '❌ Not found',
      'Focus Keyword': extracted.focusKeyword || '❌ Not found',
      'Thumbnail': extracted.thumbnail || '❌ Not found',
      'OG Image': extracted.ogImage || '❌ Not found',
      'Twitter Image': extracted.twitterImage || '❌ Not found',
      'Canonical URL': extracted.canonicalUrl || '❌ Not found',
    });
    
    return extracted;
  }

  /**
   * Test with specific URL
   */
  static async testUrl(url: string): Promise<void> {
    console.log(`🧪 [RankMath Debug] Testing URL: ${url}`);
    
         try {
       const result = await rankMathAPI.getSEOHead(url);
       if (result) {
         console.log('✅ [RankMath Debug] Success!');
         this.extractData(result.head);
       } else {
         console.log('❌ [RankMath Debug] No data returned');
       }
     } catch (error) {
       console.error('❌ [RankMath Debug] Error:', error);
     }
  }

  /**
   * Check current page meta tags
   */
  static checkCurrentPageMeta(): void {
    console.log('🔍 [RankMath Debug] Checking current page meta tags...');
    
    const rankMathTags = document.querySelectorAll('[data-rankmath]');
    const fallbackTags = document.querySelectorAll('[data-fallback-seo]');
    
    console.log(`📊 [RankMath Debug] Found ${rankMathTags.length} Rank Math tags`);
    console.log(`📊 [RankMath Debug] Found ${fallbackTags.length} fallback tags`);
    
    if (rankMathTags.length > 0) {
      console.log('🎯 [RankMath Debug] Rank Math tags:');
      rankMathTags.forEach((tag, index) => {
        console.log(`  ${index + 1}. ${tag.tagName}:`, tag.outerHTML.substring(0, 200) + '...');
      });
    }
    
    if (fallbackTags.length > 0) {
      console.log('📄 [RankMath Debug] Fallback tags:');
      fallbackTags.forEach((tag, index) => {
        console.log(`  ${index + 1}. ${tag.tagName}:`, tag.outerHTML.substring(0, 200) + '...');
      });
    }
    
    // Check for specific meta tags
    const focusKeywordMeta = document.querySelector('meta[name*="keyword"], meta[property*="keyword"]');
    const thumbnailMeta = document.querySelector('meta[property="og:image"], meta[name="twitter:image"]');
    
    if (focusKeywordMeta) {
      console.log('🎯 [RankMath Debug] Focus keyword meta found:', focusKeywordMeta.outerHTML);
    } else {
      console.log('⚠️ [RankMath Debug] No focus keyword meta found');
    }
    
    if (thumbnailMeta) {
      console.log('🖼️ [RankMath Debug] Thumbnail meta found:', thumbnailMeta.outerHTML);
    } else {
      console.log('⚠️ [RankMath Debug] No thumbnail meta found');
    }
  }
}

// Expose to global window for browser console access
if (typeof window !== 'undefined') {
  (window as any).debugRankMath = {
    test: () => RankMathDebugger.testConnection(),
    testUrl: (url: string) => RankMathDebugger.testUrl(url),
    extractData: (html: string) => RankMathDebugger.extractData(html),
    checkMeta: () => RankMathDebugger.checkCurrentPageMeta(),
         config: () => {
       console.log('⚙️ [RankMath Debug] Current configuration:');
       const config = {
         enabled: rankMathAPI.isEnabled(),
         apiUrl: process.env.NEXT_PUBLIC_RANKMATH_API_URL,
         apiEnabled: process.env.NEXT_PUBLIC_RANKMATH_API_ENABLED
       };
       console.table(config);
       return config;
     }
  };
  
  console.log('🔧 [RankMath Debug] Debug utilities loaded. Available commands:');
  console.log('   - debugRankMath.config() - Show current configuration');
  console.log('   - debugRankMath.test() - Test API connection');
  console.log('   - debugRankMath.testUrl(url) - Test specific URL');
  console.log('   - debugRankMath.checkMeta() - Check current page meta tags');
} 