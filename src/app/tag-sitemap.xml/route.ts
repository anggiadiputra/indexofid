import { NextResponse } from 'next/server';
import { env } from '@/config/environment';
import type { WordPressTag } from '@/types/wordpress';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

interface TagMetadata {
  url: string;
  lastmod: string;
  postCount: number;
}

function getBaseUrl(request: Request) {
  const url = new URL(request.url);
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  return `${protocol}://${url.host}`;
}

/**
 * Extract tag metadata for sitemap
 */
function extractTagMetadata(tag: WordPressTag, baseUrl: string): TagMetadata {
  return {
    url: `${baseUrl}/tag/${tag.slug}`,
    lastmod: new Date().toISOString(), // Tags don't have modified date, use current
    postCount: tag.count || 0
  };
}

export async function GET(request: Request) {
  try {
    console.log('Generating tag sitemap at:', request.url);
    const baseUrl = getBaseUrl(request);

    // Fetch tags from WordPress API
    const response = await fetch(`${env.wordpress.apiUrl}/tags?per_page=100&_fields=id,name,slug,count`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NextJS-App/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tags: ${response.status} ${response.statusText}`);
    }

    const tags = await response.json();
    console.log('Fetched tags:', tags.length);
    const tagsMetadata = tags.map((tag: WordPressTag) => extractTagMetadata(tag, baseUrl));

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${tagsMetadata.map((tag: TagMetadata) => `
  <url>
    <loc>${tag.url}</loc>
    <lastmod>${tag.lastmod}</lastmod>
    <priority>${tag.postCount > 0 ? '0.5' : '0.3'}</priority>
    <changefreq>daily</changefreq>
  </url>`).join('')}
</urlset>`;

    console.log('Tag sitemap generated successfully');
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
        'X-Robots-Tag': 'noindex'
      },
    });
  } catch (error) {
    console.error('Error generating tag sitemap:', error);
    return new NextResponse('Error generating sitemap', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }
} 