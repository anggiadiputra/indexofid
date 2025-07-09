import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { getPostsByTag, getAllTags, getAllPosts } from '@/lib/wordpress-api';
import { WordPressPost, WordPressTag } from '@/types/wordpress';
import LiveSearch from '@/components/LiveSearch';
import PopularPosts from '@/components/PopularPosts';
import { 
  generateBreadcrumbSchema, 
  generateWebPageSchema,
  generateOrganizationSchema 
} from '@/lib/schema-generator';
import { env } from '@/config/environment';

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  
  try {
    const allTags = await getAllTags();
    const tag = allTags.find(t => t.slug === resolvedParams.slug);

    if (!tag) {
      return {
        title: 'Tag Not Found',
        description: 'The requested tag could not be found.',
      };
    }

    const tagName = tag.name.replace(/<[^>]*>/g, '');
    const description = tag.description || `Semua artikel dengan tag ${tagName}`;

    return {
      title: `Tag: ${tagName} | ${env.schema.organization.name} Blog`,
      description: `${description} - Temukan artikel terkait ${tagName} di blog ${env.schema.organization.name}`,
      openGraph: {
        title: `Tag: ${tagName}`,
        description: description,
        type: 'website',
        url: `/tag/${tag.slug}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: `Tag: ${tagName}`,
        description: description,
      },
      alternates: {
        canonical: `/tag/${tag.slug}`,
      },
    };
  } catch (error) {
    return {
      title: 'Tag Page',
      description: 'Browse articles by tag',
    };
  }
}

// Generate static params for static generation
export async function generateStaticParams() {
  try {
    const tags = await getAllTags();
    return tags.map((tag) => ({ slug: tag.slug }));
  } catch (error) {
    console.error('Error generating static params for tags:', error);
    return [];
  }
}

// PERFORMANCE OPTIMIZATION: Add ISR for tag pages
export const revalidate = 86400; // Revalidate every 24 hours (tags change very rarely)

export default async function TagPage({ params }: TagPageProps) {
  const resolvedParams = await params;
  
  let posts: WordPressPost[] = [];
  let tag: WordPressTag | null = null;
  let allTags: WordPressTag[] = [];
  let featuredPosts: WordPressPost[] = [];
  let error: string | null = null;

  try {
    // Fetch all tags first to find the current tag
    allTags = await getAllTags();
    tag = allTags.find(t => t.slug === resolvedParams.slug) || null;

    if (!tag) {
      notFound();
    }

    // Fetch posts and featured posts in parallel
    [posts, featuredPosts] = await Promise.all([
      getPostsByTag(tag.id, 1, 50), // Get more posts for tag pages
      getAllPosts(1, 6) // Get featured posts for sidebar
    ]);
  } catch (err) {
    console.error('Error fetching tag page data:', err);
    error = 'Failed to load tag content';
  }

  if (!tag) {
    notFound();
  }

  // Function to get featured image URL
  function getFeaturedImageUrl(post: WordPressPost): string | null {
    if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'].length > 0) {
      const featuredMedia = post._embedded['wp:featuredmedia'][0];
      if (featuredMedia.media_details && featuredMedia.media_details.sizes) {
        const sizes = featuredMedia.media_details.sizes;
        return sizes.medium?.source_url || sizes.thumbnail?.source_url || featuredMedia.source_url;
      }
      return featuredMedia.source_url || null;
    }
    return null;
  }

  // Get related tags (exclude current tag)
  const relatedTags = allTags.filter(t => t.id !== tag.id).slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema({
            post: null,
            postCategories: [],
            postTags: [tag],
            featuredImageUrl: null,
            customBreadcrumbs: [
              { name: 'Home', url: '/' },
              { name: 'Blog', url: '/blog' },
              { name: `Tag: ${tag.name}`, url: `/tag/${tag.slug}` }
            ]
          }))
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateWebPageSchema({
            post: null,
            postCategories: [],
            postTags: [tag],
            featuredImageUrl: null,
            pageType: 'CollectionPage',
            customTitle: `Tag: ${tag.name}`,
            customDescription: tag.description || `Artikel dengan tag ${tag.name}`
          }))
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateOrganizationSchema())
        }}
      />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center">
              <Link href="/" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <svg className="w-3 h-3 mx-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="flex items-center">
              <Link href="/blog" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                Blog
              </Link>
            </li>
            <li className="flex items-center">
              <svg className="w-3 h-3 mx-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-gray-900 dark:text-gray-100 font-medium break-words">
              Tag: <span dangerouslySetInnerHTML={{ __html: tag.name }} />
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2">
            {/* Tag Header */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 border border-orange-200 dark:border-gray-700 rounded-2xl p-8 mb-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                      Tag
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {posts.length} artikel
                    </span>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    <span dangerouslySetInnerHTML={{ __html: tag.name }} />
                  </h1>
                  
                  {tag.description && (
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      <span dangerouslySetInnerHTML={{ __html: tag.description }} />
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Posts Grid */}
            {error ? (
              <div className="text-center py-12">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-8 rounded-xl">
                  <h3 className="text-xl font-bold mb-2">Terjadi Kesalahan</h3>
                  <p>{error}</p>
                </div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 p-8 rounded-xl">
                  <div className="w-16 h-16 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Belum Ada Artikel</h3>
                  <p>Belum ada artikel dengan tag ini. Coba jelajahi tag lain atau kembali ke halaman blog utama.</p>
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Kembali ke Blog
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => {
                  const featuredImageUrl = getFeaturedImageUrl(post);
                  
                  return (
                    <article
                      key={post.id}
                      className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300"
                    >
                      <Link href={`/${post.slug}`} className="block">
                        {/* Featured Image */}
                        <div className="relative h-48 overflow-hidden">
                          {featuredImageUrl ? (
                            <Image
                              src={featuredImageUrl}
                              alt={post.title.rendered}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 flex items-center justify-center">
                              <svg className="w-16 h-16 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                          </h2>

                          <div className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                            <div dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>
                              {new Date(post.date).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                            
                            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-medium">
                              <span>Baca</span>
                              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
              {/* Search Box */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-lg">Cari Artikel</h3>
                <LiveSearch />
              </div>

              {/* Related Tags */}
              {relatedTags.length > 0 && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-lg">Tag Terkait</h3>
                  <div className="flex flex-wrap gap-2">
                    {relatedTags.map((relatedTag) => (
                      <Link
                        key={relatedTag.id}
                        href={`/tag/${relatedTag.slug}`}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-gray-100 hover:bg-orange-100 dark:bg-gray-700 dark:hover:bg-orange-900/30 text-gray-700 dark:text-gray-300 hover:text-orange-700 dark:hover:text-orange-300 rounded-full transition-colors"
                      >
                        <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span dangerouslySetInnerHTML={{ __html: relatedTag.name }} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Posts */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                <PopularPosts 
                  maxResults={5}
                  showTrending={false}
                  layout="vertical"
                  showImages={true}
                  showExcerpt={false}
                  showDate={true}
                  className=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 