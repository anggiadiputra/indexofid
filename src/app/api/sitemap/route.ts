import { NextResponse } from 'next/server';
import { getAllPosts, getAllCategories, getAllTags, getPostCount } from '@/lib/wordpress-api';
import { env } from '@/config/environment';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

const POSTS_PER_SITEMAP = 1000;
const baseUrl = env.site.url;

/**
 * Generate sitemap index
 */
async function generateSitemapIndex() {
  const postCount = await getPostCount();
  const sitemapCount = Math.ceil(postCount / POSTS_PER_SITEMAP);
  const currentDate = new Date().toISOString();

  const sitemaps = [
    // Static sitemap
    {
      url: `${baseUrl}/api/sitemap/static`,
      lastmod: currentDate
    },
    // Category sitemap
    {
      url: `${baseUrl}/api/sitemap/categories`,
      lastmod: currentDate
    },
    // Tag sitemap
    {
      url: `${baseUrl}/api/sitemap/tags`,
      lastmod: currentDate
    }
  ];

  // Add post sitemaps
  for (let i = 1; i <= sitemapCount; i++) {
    sitemaps.push({
      url: `${baseUrl}/api/sitemap/posts/${i}`,
      lastmod: currentDate
    });
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemaps.map(sitemap => `
  <sitemap>
    <loc>${sitemap.url}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('')}
</sitemapindex>`;
}

/**
 * Generate static pages sitemap
 */
function generateStaticSitemap() {
  const currentDate = new Date().toISOString();
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/blog', priority: '0.9', changefreq: 'daily' },
    { url: '/services', priority: '0.8', changefreq: 'weekly' },
    { url: '/services/wordpress-migration', priority: '0.8', changefreq: 'weekly' },
    { url: '/services/malware-removal', priority: '0.8', changefreq: 'weekly' },
    { url: '/services/vps-setup', priority: '0.8', changefreq: 'weekly' },
    { url: '/services/managed-vps', priority: '0.8', changefreq: 'weekly' },
    { url: '/search', priority: '0.6', changefreq: 'weekly' },
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
  </url>`).join('')}
</urlset>`;
}

/**
 * Generate posts sitemap
 */
async function generatePostsSitemap(page: number) {
  const posts = await getAllPosts(page, POSTS_PER_SITEMAP);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${posts.map(post => {
    const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    return `
  <url>
    <loc>${baseUrl}/${post.slug}</loc>
    <lastmod>${new Date(post.modified).toISOString()}</lastmod>
    <priority>0.7</priority>
    <changefreq>monthly</changefreq>
    ${featuredImage ? `
    <image:image>
      <image:loc>${featuredImage}</image:loc>
      <image:title>${post.title.rendered.replace(/[<>]/g, '')}</image:title>
    </image:image>` : ''}
  </url>`;
  }).join('')}
</urlset>`;
}

/**
 * Generate categories sitemap
 */
async function generateCategoriesSitemap() {
  const categories = await getAllCategories();
  const currentDate = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${categories.map(category => `
  <url>
    <loc>${baseUrl}/category/${category.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.6</priority>
    <changefreq>weekly</changefreq>
  </url>`).join('')}
</urlset>`;
}

/**
 * Generate tags sitemap
 */
async function generateTagsSitemap() {
  const tags = await getAllTags();
  const currentDate = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${tags.map(tag => `
  <url>
    <loc>${baseUrl}/tag/${tag.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.5</priority>
    <changefreq>weekly</changefreq>
  </url>`).join('')}
</urlset>`;
}

export async function GET(request: Request) {
  try {
    const headersList = headers();
    const url = new URL(request.url);
    const path = url.pathname;
    const pathParts = path.split('/');
    
    let sitemap: string;
    let cacheTime = 3600; // Default 1 hour cache

    // Generate appropriate sitemap based on path
    if (path.includes('/posts/')) {
      const page = parseInt(pathParts[pathParts.length - 1]) || 1;
      sitemap = await generatePostsSitemap(page);
      cacheTime = 1800; // 30 minutes cache for posts
    } else if (path.includes('/categories')) {
      sitemap = await generateCategoriesSitemap();
    } else if (path.includes('/tags')) {
      sitemap = await generateTagsSitemap();
    } else if (path.includes('/static')) {
      sitemap = generateStaticSitemap();
      cacheTime = 86400; // 24 hours cache for static pages
    } else {
      sitemap = await generateSitemapIndex();
    }

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': `public, max-age=${cacheTime}, s-maxage=${cacheTime}`,
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
} 