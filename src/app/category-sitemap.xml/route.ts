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
  try {
    return {
      url: `${baseUrl}/category/${category.slug}`,
      lastmod: new Date().toISOString(), // Categories don't have modified date, use current
      postCount: category.count || 0
    };
  } catch (error) {
    console.error('Error extracting category metadata:', error);
    console.error('Category object:', JSON.stringify(category, null, 2));
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    console.log('Generating category sitemap at:', request.url);
    const baseUrl = getBaseUrl(request);
    console.log('Base URL:', baseUrl);

    // Validate WordPress API URL
    if (!env.wordpress.apiUrl) {
      console.error('WordPress API URL is not configured');
      throw new Error('WordPress API URL is not configured. Please check your environment variables.');
    }

    const apiUrl = `${env.wordpress.apiUrl}/categories?per_page=100&_fields=id,name,slug,count`;
    console.log('Fetching categories from:', apiUrl);

    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      // Fetch categories from WordPress API
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NextJS-App/1.0',
        },
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }

      const categories = await response.json();
      console.log('Fetched categories:', {
        count: categories.length,
        data: JSON.stringify(categories, null, 2)
      });

      if (!Array.isArray(categories)) {
        console.error('Categories is not an array:', categories);
        throw new Error('Invalid categories response: expected array');
      }

      // Handle empty categories
      if (categories.length === 0) {
        console.log('No categories found, returning empty sitemap');
        const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

        return new NextResponse(emptySitemap, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=1800, s-maxage=1800',
            'X-Robots-Tag': 'noindex'
          },
        });
      }

      const categoriesMetadata = categories.map((category: WordPressCategory) => extractCategoryMetadata(category, baseUrl));
      console.log('Processed categories metadata:', JSON.stringify(categoriesMetadata, null, 2));

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${categoriesMetadata.map((category: CategoryMetadata) => `
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
    } catch (fetchError: unknown) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('API request timed out after 10 seconds');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error generating category sitemap:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return new NextResponse(`Error generating sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }
} 