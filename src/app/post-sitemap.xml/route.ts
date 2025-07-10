import { NextResponse } from 'next/server';
import { getAllPosts, getPostCount } from '@/lib/wordpress-api';
import { env } from '@/config/environment';
import type { WordPressPost } from '@/types/wordpress';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

interface PostImage {
  url: string;
  title: string;
  caption?: string;
}

interface BlogPostMetadata {
  url: string;
  lastmod: string;
  images: PostImage[];
  categories: string[];
  tags: string[];
  author?: {
    name: string;
    url: string;
  };
}

function getBaseUrl(request: Request) {
  const url = new URL(request.url);
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  return `${protocol}://${url.host}`;
}

/**
 * Extract post metadata for sitemap
 */
function extractPostMetadata(post: WordPressPost, baseUrl: string): BlogPostMetadata {
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

export async function GET(request: Request) {
  try {
    console.log('Generating post sitemap at:', request.url);
    const baseUrl = getBaseUrl(request);

    // Get total post count
    const totalPosts = await getPostCount();
    console.log('Total posts:', totalPosts);

    // Fetch all posts with pagination
    const postsPerPage = 100; // Fetch 100 posts per request
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    
    let allPosts: WordPressPost[] = [];
    for (let page = 1; page <= totalPages; page++) {
      console.log(`Fetching page ${page} of ${totalPages}...`);
      const posts = await getAllPosts(page, postsPerPage);
      allPosts = allPosts.concat(posts);
    }

    console.log('Fetched posts:', allPosts.length);
    const postsMetadata = allPosts.map(post => extractPostMetadata(post, baseUrl));

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
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

    console.log('Post sitemap generated successfully');
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
        'X-Robots-Tag': 'noindex'
      },
    });
  } catch (error) {
    console.error('Error generating post sitemap:', error);
    return new NextResponse('Error generating sitemap', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }
} 