import { NextResponse } from 'next/server';
import { getAllPosts, getAllCategories, getAllTags } from '@/lib/wordpress-api';
import { env } from '@/config/environment';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch all content for sitemap
    const [posts, categories, tags] = await Promise.all([
      getAllPosts(1, 1000), // Get all posts (limited to 1000 for performance)
      getAllCategories(),
      getAllTags()
    ]);

    const baseUrl = env.site.url;
    const currentDate = new Date().toISOString();

    // Static pages
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

    // Build sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
  </url>`
    )
    .join('')}
  ${posts
    .map(
      (post) => `
  <url>
    <loc>${baseUrl}/${post.slug}</loc>
    <lastmod>${new Date(post.modified).toISOString()}</lastmod>
    <priority>0.7</priority>
    <changefreq>monthly</changefreq>
  </url>`
    )
    .join('')}
  ${categories
    .map(
      (category) => `
  <url>
    <loc>${baseUrl}/category/${category.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.6</priority>
    <changefreq>weekly</changefreq>
  </url>`
    )
    .join('')}
  ${tags
    .map(
      (tag) => `
  <url>
    <loc>${baseUrl}/tag/${tag.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.5</priority>
    <changefreq>weekly</changefreq>
  </url>`
    )
    .join('')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
} 