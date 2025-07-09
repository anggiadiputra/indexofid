import { NextResponse } from 'next/server';
import { env } from '@/config/environment';

export const dynamic = 'force-dynamic';

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# WordPress content
Allow: /blog
Allow: /category/
Allow: /tag/
Allow: /services/

# Sitemaps
Sitemap: ${env.site.url}/sitemap.xml

# Disallow admin areas and API
Disallow: /api/
Disallow: /_next/
Disallow: /admin
Disallow: /wp-admin
Disallow: /wp-content/uploads/

# Performance optimization files
Allow: /_next/static/
Allow: /_next/image

# SEO improvements
Crawl-delay: 1

# Additional directives for better SEO
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot  
Allow: /
Crawl-delay: 1

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
    },
  });
} 