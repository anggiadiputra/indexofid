import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getPostsByCategory, getAllPosts } from '@/lib/wordpress-api';
import { WordPressPost, WordPressCategory } from '@/types/wordpress';
import LiveSearch from '@/components/LiveSearch';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

// Function to get featured image URL from post
function getFeaturedImageUrl(post: WordPressPost): string | null {
  if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'].length > 0) {
    const featuredMedia = post._embedded['wp:featuredmedia'][0];
    if (featuredMedia.media_details && featuredMedia.media_details.sizes) {
      const sizes = featuredMedia.media_details.sizes;
      if (sizes.medium_large) {
        return sizes.medium_large.source_url;
      } else if (sizes.medium) {
        return sizes.medium.source_url;
      } else if (sizes.large) {
        return sizes.large.source_url;
      }
    }
    return featuredMedia.source_url || null;
  }
  return null;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  
  try {
    // Get category details and posts in parallel
    const [category, posts, featuredPosts] = await Promise.all([
      getCategoryBySlug(resolvedParams.slug),
      getCategoryBySlug(resolvedParams.slug).then(cat => cat ? getPostsByCategory(cat.id) : []),
      getAllPosts(1, 6) // Get featured posts for sidebar
    ]);
    
    if (!category) {
      notFound();
    }

    // Generate breadcrumb schema
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const plainCategoryName = category.name.replace(/<[^>]*>/g, '');
    
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": plainCategoryName,
          "item": `${baseUrl}/category/${category.slug}`
        }
      ]
    };

    return (
      <>
        {/* JSON-LD Breadcrumb Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema)
          }}
        />
        
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content - 2/3 width */}
              <div className="lg:col-span-2">
                {/* Breadcrumb */}
                <nav className="mb-6" aria-label="Breadcrumb">
                  <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <Link href="/" className="hover:text-foreground transition-colors">
                        Home
                      </Link>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-3 h-3 mx-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </li>
                    <li className="text-foreground font-medium break-words">
                      <span dangerouslySetInnerHTML={{ __html: category.name }} />
                    </li>
                  </ol>
                </nav>

                {/* Category Header */}
                <div className="mb-8">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    <span dangerouslySetInnerHTML={{ __html: category.name }} />
                  </h1>
                  {category.description && (
                    <div className="text-gray-600 dark:text-gray-300">
                      <div dangerouslySetInnerHTML={{ __html: category.description }} />
                    </div>
                  )}
                </div>

                {/* Posts */}
                {posts.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h3 className="font-medium">Tidak Ada Artikel</h3>
                        <p className="text-sm">Belum ada artikel dalam kategori ini.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map((post) => {
                      const featuredImageUrl = getFeaturedImageUrl(post);
                      return (
                        <article
                          key={post.id}
                          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex flex-col md:flex-row">
                            {/* Featured Image - Left side */}
                            <div className="md:w-80 flex-shrink-0 p-4">
                              <div className="aspect-video md:aspect-[4/3] md:h-48 relative overflow-hidden rounded-lg">
                                {featuredImageUrl ? (
                                  <Image
                                    src={featuredImageUrl}
                                    alt={post.title.rendered}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 320px"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                    <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Content - Right side */}
                            <div className="flex-1 p-6">
                              {/* Title */}
                              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                <Link href={`/${post.slug}`}>
                                  <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                                </Link>
                              </h2>

                              {/* Excerpt */}
                              <div className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                                <div dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
                              </div>

                              {/* Read More */}
                              <div className="flex justify-end">
                                <Link
                                  href={`/${post.slug}`}
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm flex items-center gap-1"
                                >
                                  Baca Selengkapnya
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </Link>
                              </div>
                            </div>
                          </div>
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
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-lg">Cari Artikel</h3>
                    <LiveSearch />
                  </div>

                  {/* Featured Articles */}
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-lg">Artikel Pilihan</h3>
                    <div className="space-y-4">
                      {featuredPosts.slice(0, 6).map((featuredPost) => {
                        const featuredImageUrl = getFeaturedImageUrl(featuredPost);
                        return (
                          <article key={featuredPost.id} className="group">
                            <Link href={`/${featuredPost.slug}`} className="block">
                              <div className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <div className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden relative">
                                  {featuredImageUrl ? (
                                    <Image
                                      src={featuredImageUrl}
                                      alt={featuredPost.title.rendered}
                                      fill
                                      className="object-cover"
                                      sizes="64px"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                      </svg>
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                                    <span dangerouslySetInnerHTML={{ __html: featuredPost.title.rendered }} />
                                  </h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {new Date(featuredPost.date).toLocaleDateString('id-ID', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                    })}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error('Error in CategoryPage:', error);
    notFound();
  }
} 