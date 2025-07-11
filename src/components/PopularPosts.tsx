'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts } from '@/lib/wordpress-api';
import type { WordPressPost } from '@/types/wordpress';
import { PostViewCount } from './PostViews';
import OptimizedImage from './ImageOptimized';

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
    if (post._embedded?.['wp:featuredmedia']?.[0]) {
      const media = post._embedded['wp:featuredmedia'][0];
      if (media.media_details?.sizes) {
        const sizes = media.media_details.sizes;
        // Try smaller sizes first for thumbnails
        return sizes.medium?.source_url || 
               sizes.thumbnail?.source_url || 
               sizes.medium_large?.source_url || 
               sizes.large?.source_url || 
               media.source_url;
      }
      return media.source_url;
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
                  <OptimizedImage
                    post={post}
                    alt={post.title?.rendered || 'Article Image'}
                    width={64}
                    height={64}
                    className="rounded-lg"
                    sizes="64px"
                  />
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
                <OptimizedImage
                  post={post}
                  alt={post.title?.rendered || 'Article Image'}
                  width={isFeatured ? 800 : 400}
                  height={isFeatured ? 500 : 225}
                  className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                  sizes={isFeatured ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"}
                  priority={index < 2}
                />
                
                {/* Enhanced Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition-all duration-300`} />
                
                {/* Floating Date Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border border-white/50 px-3 py-2 rounded-xl shadow-lg">
                  <span className="text-xs font-semibold text-gray-700">
                    {new Date(post.date).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
              
              {/* Enhanced Card Content */}
              <div className="p-8">
                {/* Enhanced Category Tag */}
                <div className="mb-6">
                  <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 text-blue-700 text-sm font-semibold rounded-full shadow-sm">
                    <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    WordPress
                  </span>
                </div>

                {/* Enhanced Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: post.title?.rendered || 'Untitled Article',
                    }}
                  />
                </h3>

                {/* Enhanced Excerpt */}
                <div className="mb-6">
                  <div
                    className="text-gray-600 text-base line-clamp-3 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: post.excerpt?.rendered || 'No description available',
                    }}
                  />
                </div>

                {/* Enhanced Read More Button */}
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
            </article>
          );
        })}
      </div>
    </div>
  );
} 