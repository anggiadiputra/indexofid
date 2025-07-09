import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/config/environment';

export async function GET(request: NextRequest) {
  try {
    // Check if RankMath API is enabled
    if (!env.rankmath.enabled || !env.rankmath.apiUrl) {
      return NextResponse.json(
        { success: false, error: 'RankMath API not configured' },
        { status: 400 }
      );
    }

    // Get URL parameter from query string
    const { searchParams } = new URL(request.url);
    const frontendUrl = searchParams.get('url');

    if (!frontendUrl) {
      return NextResponse.json(
        { success: false, error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Transform frontend URL to backend URL for RankMath API
    const frontendDomain = env.wordpress.frontendDomain || env.site.url || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const backendDomain = env.wordpress.backendUrl;
    
    // Remove trailing slashes and protocol for consistent comparison
    const cleanFrontendDomain = frontendDomain.replace(/\/$/, '').replace(/^https?:\/\//, '');
    const cleanBackendDomain = backendDomain.replace(/\/$/, '').replace(/^https?:\/\//, '');
    
    // Extract path from frontend URL
    const frontendUrlObj = new URL(frontendUrl);
    const path = frontendUrlObj.pathname + frontendUrlObj.search;
    
    // Construct backend URL
    const backendUrl = `${backendDomain}${path}`;

    console.log('[RankMath Proxy] URL transformation:', {
      frontendUrl,
      backendUrl,
      frontendDomain: cleanFrontendDomain,
      backendDomain: cleanBackendDomain,
      path
    });

    console.log('[RankMath Proxy] Fetching SEO data for:', backendUrl);
    console.log('[RankMath Proxy] API URL:', env.rankmath.apiUrl);
    console.log('[RankMath Proxy] Environment check:', {
      enabled: env.rankmath.enabled,
      apiUrl: env.rankmath.apiUrl,
      envApiUrl: process.env.NEXT_PUBLIC_RANKMATH_API_URL,
      frontendDomain: env.wordpress.frontendDomain,
      backendDomain: env.wordpress.backendUrl
    });

    // Build the API request URL
    const apiUrl = `${env.rankmath.apiUrl}?url=${encodeURIComponent(backendUrl)}`;
    console.log('[RankMath Proxy] Full API request URL:', apiUrl);
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'IndexOf-Headless-Proxy/1.0',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('[RankMath Proxy] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[RankMath Proxy] HTTP error:', response.status, errorText);
      return NextResponse.json(
        { success: false, error: `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[RankMath Proxy] Response received:', {
      success: data.success,
      hasHead: !!data.head,
      headLength: data.head ? data.head.length : 0
    });

    // Transform any backend URLs in the response back to frontend URLs
    if (data.head) {
      // Replace all occurrences of backend domain with frontend domain
      const backendDomainRegex = new RegExp(cleanBackendDomain.replace(/\./g, '\\.'), 'g');
      data.head = data.head.replace(backendDomainRegex, cleanFrontendDomain);
      
      // Also handle protocol-less URLs (//domain.com)
      const protocolLessBackendRegex = new RegExp(`//${cleanBackendDomain.replace(/\./g, '\\.')}`, 'g');
      data.head = data.head.replace(protocolLessBackendRegex, `//${cleanFrontendDomain}`);
    }

    // Return the data with CORS headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('[RankMath Proxy] Error:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'Request timeout' },
          { status: 408 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Unknown error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 