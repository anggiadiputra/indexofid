import { env } from '@/config/environment';

/**
 * URL utility functions for domain detection and transformation
 * Eliminates hardcoded domain checks throughout the application
 */

/**
 * Check if URL is a frontend domain URL
 */
export function isFrontendUrl(url: string): boolean {
  if (!url) return false;
  
  const frontendDomains = [
    env.site.url,
    env.wordpress.frontendDomain,
    process.env.NEXT_PUBLIC_FRONTEND_DOMAIN,
    process.env.NEXT_PUBLIC_SITE_URL
  ].filter(Boolean);
  
  return frontendDomains.some(domain => {
    if (!domain) return false;
    // Extract domain from URL for comparison
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return url.includes(cleanDomain);
  });
}

/**
 * Check if URL is a WordPress backend domain URL
 */
export function isBackendUrl(url: string): boolean {
  if (!url) return false;
  
  const backendDomains = [
    env.wordpress.backendUrl,
    process.env.NEXT_PUBLIC_WORDPRESS_BACKEND_URL,
    process.env.WORDPRESS_BACKEND_URL
  ].filter(Boolean);
  
  return backendDomains.some(domain => {
    if (!domain) return false;
    // Extract domain from URL for comparison
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return url.includes(cleanDomain);
  });
}

/**
 * Get the primary WordPress backend URL from environment
 */
export function getBackendUrl(): string {
  return env.wordpress.backendUrl || 
         process.env.NEXT_PUBLIC_WORDPRESS_BACKEND_URL || 
         process.env.WORDPRESS_BACKEND_URL || 
         'https://your-wordpress-backend.com';
}

/**
 * Get the primary frontend URL from environment
 */
export function getFrontendUrl(): string {
  return env.site.url || 
         env.wordpress.frontendDomain || 
         process.env.NEXT_PUBLIC_SITE_URL || 
         process.env.NEXT_PUBLIC_FRONTEND_DOMAIN || 
         'http://localhost:3000';
}

/**
 * Transform backend URL to frontend URL
 */
export function transformToFrontendUrl(backendUrl: string): string {
  if (!backendUrl || isFrontendUrl(backendUrl)) {
    return backendUrl;
  }
  
  const backend = getBackendUrl();
  const frontend = getFrontendUrl();
  
  // Remove trailing slashes for consistent comparison
  const cleanBackend = backend.replace(/\/$/, '');
  const cleanFrontend = frontend.replace(/\/$/, '');
  
  // Replace backend domain with frontend domain
  if (backendUrl.startsWith(cleanBackend)) {
    return backendUrl.replace(cleanBackend, cleanFrontend);
  }
  
  return backendUrl;
}

/**
 * Get a sample test URL for debugging
 */
export function getSampleTestUrl(): string {
  return `${getBackendUrl()}/sample-post/`;
}

/**
 * Check if URL transformation is needed
 */
export function shouldTransformUrl(url: string): boolean {
  return !isBackendUrl(url) && !url.startsWith('/') && !isFrontendUrl(url);
}

/**
 * Generate debug info for URL analysis
 */
export function getUrlAnalysis(url: string) {
  return {
    inputUrl: url,
    isAbsolute: url.startsWith('http'),
    isFrontendUrl: isFrontendUrl(url),
    isBackendUrl: isBackendUrl(url),
    shouldTransform: shouldTransformUrl(url),
    backendUrl: getBackendUrl(),
    frontendUrl: getFrontendUrl()
  };
} 