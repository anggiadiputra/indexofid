'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { relatedPostsService, RelatedPost } from '@/lib/related-posts';
import type { WordPressPost, WordPressCategory, WordPressTag } from '@/types/wordpress';

interface RelatedPostsProps {
  currentPost: WordPressPost;
  postCategories: WordPressCategory[];
  postTags: WordPressTag[];
  maxResults?: number;
  showMatchReason?: boolean;
  className?: string;
}

export default function RelatedPosts({
  currentPost,
  postCategories,
  postTags,
  maxResults = 6,
  showMatchReason = true,
  className = ''
}: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRelatedPosts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const posts = await relatedPostsService.getRelatedPosts(
          currentPost,
          postCategories,
          postTags,
          {
            maxResults,
            excludeCurrentPost: true,
            includeCategories: true,
            includeTags: true,
            includeContentSimilarity: true,
            minRelevanceScore: 15
          }
        );
        
        setRelatedPosts(posts);
      } catch (err) {
        console.error('Error loading related posts:', err);
        setError('Failed to load related posts');
        
        // Fallback to category-based related posts
        try {
          const fallbackPosts = await relatedPostsService.getRelatedPostsByCategory(
            currentPost,
            postCategories,
            maxResults
          );
          setRelatedPosts(fallbackPosts);
        } catch (fallbackErr) {
          console.error('Fallback also failed:', fallbackErr);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadRelatedPosts();
  }, [currentPost, postCategories, postTags, maxResults]);

  const getFeaturedImageUrl = (post: RelatedPost): string | null => {
    if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'].length > 0) {
      const featuredMedia = post._embedded['wp:featuredmedia'][0];
      if (featuredMedia.media_details && featuredMedia.media_details.sizes) {
        const sizes = featuredMedia.media_details.sizes;
        return sizes.medium?.source_url || sizes.thumbnail?.source_url || featuredMedia.source_url;
      }
      return featuredMedia.source_url || null;
    }
    return null;
  };

  const getMatchReasonIcon = (reason: string) => {
    switch (reason) {
      case 'category':
        return (
          <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      case 'tag':
        return (
          <svg className="w-3 h-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      case 'title':
        return (
          <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  const getMatchReasonText = (reason: string) => {
    switch (reason) {
      case 'category': return 'Kategori sama';
      case 'tag': return 'Tag sama';
      case 'title': return 'Judul serupa';
      case 'content': return 'Konten serupa';
      default: return 'Terkait';
    }
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Artikel Terkait
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Memuat artikel yang mungkin Anda sukai...
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: maxResults }, (_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || relatedPosts.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Artikel Terkait
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Tidak ada artikel terkait ditemukan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Artikel Terkait
            </h2>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Temukan artikel lain yang mungkin menarik untuk Anda baca
        </p>
      </div>

      {/* Related Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedPosts.map((post) => {
          const featuredImageUrl = getFeaturedImageUrl(post);
          
          return (
            <article
              key={post.id}
              className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300"
            >
              <Link href={`/${post.slug}`} className="block">
                {/* Featured Image */}
                <div className="relative h-48 overflow-hidden">
                  {featuredImageUrl ? (
                    <Image
                      src={featuredImageUrl}
                      alt={post.title?.rendered || 'Article Image'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center">
                      <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                {/* Title */}
                <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2">
                  <span dangerouslySetInnerHTML={{ __html: post.title?.rendered || 'Untitled Article' }} />
                </h3>
                {/* Excerpt */}
                <div className="mt-2 text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                  <span dangerouslySetInnerHTML={{ __html: post.excerpt?.rendered || '' }} />
                </div>
              </Link>
              {/* Match Reason */}
              {showMatchReason && post.matchReason && (
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  {getMatchReasonIcon(post.matchReason)}
                  <span>{getMatchReasonText(post.matchReason)}</span>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
} 