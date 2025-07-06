'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts } from '@/lib/wordpress-api';
import type { WordPressPost } from '@/types/wordpress';
import { PostViewCount } from './PostViews';

interface PopularPostsProps {
  maxResults?: number;
  showTrending?: boolean;
  className?: string;
  layout?: 'vertical' | 'horizontal' | 'grid';
  showImages?: boolean;
  showExcerpt?: boolean;
  showDate?: boolean;
  posts?: WordPressPost[]; // Pre-fetched posts from server-side
}

// Calculate reading time
const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

export default function PopularPosts({
  maxResults = 6,
  showTrending = true,
  className = '',
  layout = 'vertical',
  showImages = true,
  showExcerpt = false,
  showDate = true,
  posts: prefetchedPosts // Renamed for clarity
}: PopularPostsProps) {
  // Initialize with empty array to ensure consistent initial render
  const [posts, setPosts] = useState<WordPressPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Use useEffect to mark client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load posts
  useEffect(() => {
    if (prefetchedPosts?.length) {
      setPosts(prefetchedPosts.slice(0, maxResults));
      setIsLoading(false);
      return;
    }

    const loadPosts = async () => {
      try {
        const fetchedPosts = await getAllPosts(1, maxResults);
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('[PopularPosts] Error loading posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [maxResults, prefetchedPosts]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getImageUrl = (post: any) => {
    if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
      return post._embedded['wp:featuredmedia'][0].source_url;
    }
    return null;
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').substring(0, 120) + '...';
  };

  // Show loading state only after client-side hydration
  if (!isClient || isLoading) {
    return (
      <div className={className}>
        <div className="text-gray-500 dark:text-gray-400 text-sm italic p-4 text-center">
          Memuat artikel populer...
        </div>
      </div>
    );
  }

  // Show empty state
  if (!posts.length) {
    return (
      <div className={className}>
        <div className="text-gray-500 dark:text-gray-400 text-sm italic p-4 text-center">
          Tidak ada artikel populer yang dapat ditampilkan.
        </div>
      </div>
    );
  }

  // Vertical layout (for sidebar)
  if (layout === 'vertical') {
    return (
      <div className={className}>
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="flex gap-3">
              {showImages && (
                <div className="w-16 h-16 flex-shrink-0 relative">
                  {getImageUrl(post) ? (
                    <Image
                      src={getImageUrl(post)}
                      alt={post.title?.rendered || 'Article Image'}
                      fill
                      className="object-cover rounded-lg"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-400 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-2 mb-1">
                  <Link href={`/${post.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {post.title?.rendered || 'Untitled Article'}
                  </Link>
                </h4>
                
                {showDate && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {formatDate(post.date)}
                  </p>
                )}
                
                {showExcerpt && post.excerpt && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                    {stripHtml(post.excerpt?.rendered || '')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Grid layout (for main content area)
  return (
    <div className={`${className}`}>
      {showTrending && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            Artikel Populer
          </h3>
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
              Trending
            </span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
              Popular
            </span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        {posts.map((post, index) => {
          const readingTime = calculateReadingTime(post.excerpt?.rendered || '');
          const isHovered = hoveredIndex === index;
          const isFeatured = index === 0;
          const isSecondary = index === 1 || index === 2;
          const isTrending = index < 3;
          
          return (
            <article 
              key={post.id} 
              className={`group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.02] ${
                isFeatured ? 'md:col-span-2 lg:col-span-2 xl:col-span-2' : ''
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              {/* Enhanced Image Container */}
              <div className={`relative overflow-hidden bg-gray-100 dark:bg-gray-700 ${
                isFeatured ? 'aspect-[16/10]' : 'aspect-[16/9]'
              }`}>
                {getImageUrl(post) ? (
                  <>
                    <Image
                      src={getImageUrl(post)}
                      alt={post.title?.rendered || 'Article Image'}
                      fill
                      className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                      sizes={isFeatured ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"}
                      priority={index < 2}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-70'}`} />
                    
                    {/* Multi-layered Trending Indicators */}
                    {isTrending && (
                      <div className="absolute top-4 right-4 z-20">
                        <div className={`flex items-center px-3 py-2 rounded-full backdrop-blur-sm shadow-lg text-white text-xs font-bold animate-pulse ${
                          index === 0 ? 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500' :
                          index === 1 ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500' :
                          'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
                        }`}>
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                          </svg>
                          {index === 0 ? '🔥 HOT' : '📈 TRENDING'}
                        </div>
                      </div>
                    )}

                    {/* Enhanced Position Badge with Medal Icons */}
                    <div className="absolute top-4 left-4 z-20">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-xl border-2 border-white/30 ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 text-yellow-900' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-gray-800' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 text-orange-900' :
                        'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                    </div>

                    {/* Floating Reading Time Badge */}
                    <div className="absolute bottom-4 right-4 z-20">
                      <div className="flex items-center px-3 py-2 bg-black/70 text-white text-xs font-medium rounded-full backdrop-blur-sm border border-white/20">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {readingTime} min read
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-blue-400 dark:text-blue-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <p className="text-xs text-gray-500 dark:text-gray-400">No Image</p>
                    </div>
                  </div>
                )}
                
                {/* Floating Category Tags */}
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 z-20">
                  <span className="px-3 py-1 bg-blue-600/90 text-white text-xs font-medium rounded-full backdrop-blur-sm border border-white/20 shadow-sm">
                    WordPress
                  </span>
                  {isFeatured && (
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white text-xs font-bold rounded-full backdrop-blur-sm border border-white/20 animate-pulse shadow-sm">
                      ⭐ FEATURED
                    </span>
                  )}
                </div>
              </div>

              {/* Enhanced Content Section */}
              <div className={`relative ${
                isFeatured ? 'p-6' : 'p-5'
              }`}>
                {/* Gradient Top Border for Trending */}
                {isTrending && (
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                    index === 0 ? 'from-yellow-400 via-orange-500 to-red-500' :
                    index === 1 ? 'from-blue-400 via-purple-500 to-pink-500' :
                    'from-green-400 via-blue-500 to-purple-500'
                  }`}></div>
                )}

                {/* Responsive Article Title */}
                <h3 className={`font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 leading-tight ${
                  isFeatured ? 'text-xl lg:text-2xl line-clamp-2' : 'text-lg line-clamp-2'
                }`}>
                  <Link href={`/${post.slug}`} className="hover:underline decoration-2 underline-offset-2">
                    {post.title?.rendered || 'Untitled Article'}
                  </Link>
                </h3>
                
                {/* Smart Excerpt Display */}
                {showExcerpt && post.excerpt && (
                  <p className={`text-gray-600 dark:text-gray-300 mb-4 leading-relaxed ${
                    isFeatured ? 'line-clamp-3 text-base' : 'line-clamp-2 text-sm'
                  }`}>
                    {stripHtml(post.excerpt?.rendered || '')}
                  </p>
                )}

                {/* Enhanced Footer */}
                <div className="space-y-3">
                  {/* Metadata Row */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                      {showDate && (
                        <div className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(post.date)}
                        </div>
                      )}

                      <PostViewCount 
                        post={post}
                        className="flex items-center text-green-600 dark:text-green-400"
                        showIcon={true}
                      />
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <Link 
                    href={`/${post.slug}`}
                    className={`inline-flex items-center justify-center w-full font-semibold rounded-lg transform hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-lg group/link ${
                      isFeatured ? 'px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm hover:from-blue-700 hover:to-purple-700' :
                      'px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700'
                    }`}
                  >
                    {isFeatured ? '📖 Baca Artikel Lengkap' : '📄 Baca Sekarang'}
                    <svg 
                      className="w-4 h-4 ml-2 transform transition-transform group-hover/link:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
} 