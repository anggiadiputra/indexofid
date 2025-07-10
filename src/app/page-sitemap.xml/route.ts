import { NextResponse } from 'next/server';
import { env } from '@/config/environment';
import type { WordPressPage } from '@/types/wordpress';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

interface PageImage {
  url: string;
  title: string;
  caption?: string;
}

interface PageMetadata {
  url: string;
  lastmod: string;
  images: PageImage[];
  author?: {
    name: string;
    url: string;
  };
}

// Static pages in Next.js app
const STATIC_PAGES = [
  { path: '', priority: 1.0 },           // Homepage
  { path: 'about', priority: 0.8 },      // About page
  { path: 'contact', priority: 0.8 },    // Contact page
  { path: 'services', priority: 0.8 },   // Services page
  { path: 'domain', priority: 0.8 },     // Domain page
  { path: 'blog', priority: 0.8 },       // Blog page
  { path: 'tags', priority: 0.6 },       // Tags page
  { path: 'search', priority: 0.5 },     // Search page
  // Services subpages
  { path: 'services/malware-removal', priority: 0.8 },
  { path: 'services/managed-vps', priority: 0.8 },
  { path: 'services/vps-setup', priority: 0.8 },
  { path: 'services/wordpress-migration', priority: 0.8 },
];

function getBaseUrl(request: Request) {
  const url = new URL(request.url);
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  return `${protocol}://${url.host}`;
}

/**
 * Extract page metadata for sitemap
 */
function extractPageMetadata(page: WordPressPage, baseUrl: string): PageMetadata {
  const featuredImage = page._embedded?.['wp:featuredmedia']?.[0];
  const author = page._embedded?.author?.[0];

  const images: PageImage[] = [];
  
  // Add featured image if exists
  if (featuredImage?.source_url) {
    images.push({
      url: featuredImage.source_url,
      title: featuredImage.title?.rendered || page.title.rendered,
      caption: featuredImage.caption?.rendered
    });
  }

  // Extract images from content
  const contentImages = page.content.rendered.match(/<img[^>]+src="([^">]+)"/g);
  if (contentImages) {
    contentImages.forEach((img: string) => {
      const src = img.match(/src="([^">]+)"/)?.[1];
      const alt = img.match(/alt="([^">]+)"/)?.[1];
      if (src && !images.some(image => image.url === src)) {
        images.push({
          url: src,
          title: alt || page.title.rendered
        });
      }
    });
  }

  return {
    url: `${baseUrl}/${page.slug}`,
    lastmod: new Date(page.modified).toISOString(),
    images,
    author: author ? {
      name: author.name,
      url: `${baseUrl}/author/${author.slug}`
    } : undefined
  };
}

/**
 * Generate sitemap entries for static Next.js pages
 */
function generateStaticPageEntries(baseUrl: string): string {
  return STATIC_PAGES.map(page => `
  <url>
    <loc>${baseUrl}${page.path ? `/${page.path}` : ''}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>${page.priority}</priority>
    <changefreq>weekly</changefreq>
  </url>`).join('');
}

export async function GET(request: Request) {
  try {
    console.log('Generating page sitemap at:', request.url);
    const baseUrl = getBaseUrl(request);

    // Fetch pages from WordPress API
    const response = await fetch(`${env.wordpress.apiUrl}/pages?per_page=100&_embed=true&_fields=id,title,slug,content,excerpt,date,modified,_links,_embedded`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NextJS-App/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch pages: ${response.status} ${response.statusText}`);
    }

    const pages = await response.json() as WordPressPage[];
    console.log('Fetched WordPress pages:', pages.length);
    const pagesMetadata = pages.map(page => extractPageMetadata(page, baseUrl));

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${generateStaticPageEntries(baseUrl)}
  ${pagesMetadata.map(page => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
    ${page.images.map(image => `
    <image:image>
      <image:loc>${image.url}</image:loc>
      <image:title>${image.title.replace(/[<>]/g, '')}</image:title>
      ${image.caption ? `<image:caption>${image.caption.replace(/[<>]/g, '')}</image:caption>` : ''}
    </image:image>`).join('')}
  </url>`).join('')}
</urlset>`;

    console.log('Page sitemap generated successfully');
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
        'X-Robots-Tag': 'noindex'
      },
    });
  } catch (error) {
    console.error('Error generating page sitemap:', error);
    return new NextResponse('Error generating sitemap', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }
} 