import { NextResponse } from 'next/server';
import { getAllPosts, getAllCategories, getAllTags, getPostCount } from '@/lib/wordpress-api';
import { env } from '@/config/environment';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

const POSTS_PER_SITEMAP = 1000;
const baseUrl = env.site.url;

interface BlogPostMetadata {
  url: string;
  lastmod: string;
  images: Array<{
    url: string;
    title: string;
    caption?: string;
  }>;
  categories: string[];
  tags: string[];
  author?: {
    name: string;
    url: string;
  };
}

interface PostImage {
  url: string;
  title: string;
  caption?: string;
}

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
 * Extract post metadata for sitemap
 */
function extractPostMetadata(post: any): BlogPostMetadata {
  const featuredImage = post._embedded?.['wp:featuredmedia']?.[0];
  const categories = post._embedded?.['wp:term']?.find((terms: any[]) => 
    terms?.[0]?.taxonomy === 'category'
  ) || [];
  const tags = post._embedded?.['wp:term']?.find((terms: any[]) => 
    terms?.[0]?.taxonomy === 'post_tag'
  ) || [];
  const author = post._embedded?.author?.[0];

  const images: PostImage[] = [];
  
  // Add featured image if exists
  if (featuredImage?.source_url) {
    images.push({
      url: featuredImage.source_url,
      title: featuredImage.title?.rendered || post.title.rendered,
      caption: featuredImage.caption?.rendered
    });
  }

  // Extract images from content
  const contentImages = post.content.rendered.match(/<img[^>]+src="([^">]+)"/g);
  if (contentImages) {
    contentImages.forEach((img: string) => {
      const src = img.match(/src="([^">]+)"/)?.[1];
      const alt = img.match(/alt="([^">]+)"/)?.[1];
      if (src && !images.some(image => image.url === src)) {
        images.push({
          url: src,
          title: alt || post.title.rendered
        });
      }
    });
  }

  return {
    url: `${baseUrl}/${post.slug}`,
    lastmod: new Date(post.modified).toISOString(),
    images,
    categories: categories.map((cat: any) => cat.name),
    tags: tags.map((tag: any) => tag.name),
    author: author ? {
      name: author.name,
      url: `${baseUrl}/author/${author.slug}`
    } : undefined
  };
}

/**
 * Generate blog posts sitemap with enhanced metadata
 */
async function generateBlogPostsSitemap(page: number) {
  const posts = await getAllPosts(page, POSTS_PER_SITEMAP);
  const postsMetadata = posts.map(extractPostMetadata);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${postsMetadata.map(post => `
  <url>
    <loc>${post.url}</loc>
    <lastmod>${post.lastmod}</lastmod>
    <priority>0.7</priority>
    <changefreq>monthly</changefreq>
    ${post.images.map(image => `
    <image:image>
      <image:loc>${image.url}</image:loc>
      <image:title>${image.title.replace(/[<>]/g, '')}</image:title>
      ${image.caption ? `<image:caption>${image.caption.replace(/[<>]/g, '')}</image:caption>` : ''}
    </image:image>`).join('')}
    <news:news>
      <news:publication>
        <news:name>${env.site.name}</news:name>
        <news:language>${env.schema.locale.language || 'id'}</news:language>
      </news:publication>
      <news:publication_date>${post.lastmod}</news:publication_date>
      <news:title>${post.url.split('/').pop()?.replace(/-/g, ' ') || ''}</news:title>
      ${post.author ? `<news:keywords>${[...post.categories, ...post.tags].join(', ')}</news:keywords>` : ''}
    </news:news>
  </url>`).join('')}
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
      sitemap = await generateBlogPostsSitemap(page);
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