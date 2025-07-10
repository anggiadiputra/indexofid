import { NextResponse } from 'next/server';
import { env } from '@/config/environment';
import type { WordPressCategory } from '@/types/wordpress';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

interface CategoryMetadata {
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
 * Extract category metadata for sitemap
 */
function extractCategoryMetadata(category: WordPressCategory, baseUrl: string): CategoryMetadata {
  return {
    url: `${baseUrl}/category/${category.slug}`,
    lastmod: new Date().toISOString(), // Categories don't have modified date, use current
    postCount: category.count || 0
  };
}

export async function GET(request: Request) {
  try {
    console.log('Generating category sitemap at:', request.url);
    const baseUrl = getBaseUrl(request);

    // Fetch categories from WordPress API
    const response = await fetch(`${env.wordpress.apiUrl}/categories?per_page=100&_fields=id,name,slug,count`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NextJS-App/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
    }

    const categories = await response.json();
    console.log('Fetched categories:', categories.length);
    const categoriesMetadata = categories.map((category: WordPressCategory) => extractCategoryMetadata(category, baseUrl));

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${categoriesMetadata.map(category => `
  <url>
    <loc>${category.url}</loc>
    <lastmod>${category.lastmod}</lastmod>
    <priority>${category.postCount > 0 ? '0.7' : '0.3'}</priority>
    <changefreq>daily</changefreq>
  </url>`).join('')}
</urlset>`;

    console.log('Category sitemap generated successfully');
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
        'X-Robots-Tag': 'noindex'
      },
    });
  } catch (error) {
    console.error('Error generating category sitemap:', error);
    return new NextResponse('Error generating sitemap', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }
} 