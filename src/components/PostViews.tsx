'use client';

import { useEffect, useState } from 'react';
import { usePostViews } from '@/lib/post-views';
import type { WordPressPost } from '@/types/wordpress';

interface PostViewsProps {
  post: WordPressPost;
  className?: string;
  showIcon?: boolean;
  trackView?: boolean;
}

export default function PostViews({ 
  post, 
  className = '', 
  showIcon = true, 
  trackView = true 
}: PostViewsProps) {
  const [viewCount, setViewCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { trackView: trackPostView, getViewCount } = usePostViews();

  useEffect(() => {
    setMounted(true);
    
    // Get initial count immediately from localStorage
    const initialCount = getViewCount(post.slug);
    setViewCount(initialCount);

    // Track view in background if enabled
    if (trackView) {
      trackPostView(post.id, post.slug)
        .then(newCount => setViewCount(newCount))
        .catch(error => console.error('Error tracking view:', error));
    }
  }, [post.id, post.slug, trackView, trackPostView, getViewCount]);

  // Show a simple fallback until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className={`flex items-center space-x-1 text-gray-500 dark:text-gray-400 ${className}`}>
        {showIcon && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
        <span className="text-sm">0 views</span>
      </div>
    );
  }

  const formatViewCount = (count: number): string => {
    if (count === 0) return '0 views';
    if (count === 1) return '1 view';
    if (count < 1000) return `${count} views`;
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k views`;
    return `${(count / 1000000).toFixed(1)}M views`;
  };

  return (
    <div className={`flex items-center space-x-1 text-gray-500 dark:text-gray-400 ${className}`}>
      {showIcon && (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
      <span className="text-sm" title={`${viewCount} total views`}>
        {formatViewCount(viewCount)}
      </span>
    </div>
  );
}

// Component for displaying view count without tracking (for lists, cards, etc.)
export function PostViewCount({ post, className = '', showIcon = true }: Omit<PostViewsProps, 'trackView'>) {
  return (
    <PostViews 
      post={post} 
      className={className} 
      showIcon={showIcon} 
      trackView={false} 
    />
  );
} 