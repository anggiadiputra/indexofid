'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { WordPressPost } from '@/types/wordpress';

interface OptimizedImageProps {
  post?: WordPressPost;
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
}

// Generate blur data URL for better UX
const generateBlurDataURL = (width: number, height: number) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#3B82F6');
    gradient.addColorStop(1, '#1E40AF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  return canvas.toDataURL();
};

// Get optimized image source from WordPress media
export function getOptimizedImageUrl(post: WordPressPost, size: 'thumbnail' | 'medium' | 'medium_large' | 'large' | 'full' = 'medium_large'): string | null {
  if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'].length > 0) {
    const featuredMedia = post._embedded['wp:featuredmedia'][0];
    
    if (featuredMedia.media_details && featuredMedia.media_details.sizes) {
      const sizes = featuredMedia.media_details.sizes;
      
      // Priority order based on requested size
      const sizeOrder = {
        thumbnail: ['thumbnail', 'medium', 'medium_large', 'large', 'full'],
        medium: ['medium', 'medium_large', 'large', 'thumbnail', 'full'],
        medium_large: ['medium_large', 'large', 'medium', 'full', 'thumbnail'],
        large: ['large', 'medium_large', 'medium', 'full', 'thumbnail'],
        full: ['full', 'large', 'medium_large', 'medium', 'thumbnail']
      };
      
      for (const sizeKey of sizeOrder[size]) {
        if (sizes[sizeKey]) {
          return sizes[sizeKey].source_url;
        }
      }
    }
    
    return featuredMedia.source_url || null;
  }
  
  return null;
}

export default function OptimizedImage({
  post,
  src,
  alt,
  width = 800,
  height = 600,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fill = false,
  quality = 85,
  placeholder = 'blur'
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get image source from post or use provided src
  const imageSrc = post ? getOptimizedImageUrl(post) : src;

  if (!imageSrc || imageError) {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 ${className}`}>
        <svg className="w-16 h-16 text-blue-400 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 animate-pulse z-10 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <Image
        src={imageSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} object-cover`}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? generateBlurDataURL(width, height) : undefined}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
} 