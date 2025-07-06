'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllTags } from '@/lib/wordpress-api';
import type { WordPressTag } from '@/types/wordpress';

interface TagWithCount extends WordPressTag {
  postCount: number;
  size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  color: string;
}

interface TagCloudProps {
  maxTags?: number;
  showCount?: boolean;
  layout?: 'cloud' | 'list' | 'grid';
  className?: string;
  colorScheme?: 'blue' | 'rainbow' | 'monochrome';
}

export default function TagCloud({
  maxTags = 50,
  showCount = true,
  layout = 'cloud',
  className = '',
  colorScheme = 'blue'
}: TagCloudProps) {
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTags = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const allTags = await getAllTags();
        
        // Process tags with post count and sizing
        const processedTags = allTags
          .filter(tag => tag.count > 0) // Only show tags with posts
          .map(tag => ({
            ...tag,
            postCount: tag.count,
            size: getSizeByCount(tag.count),
            color: getColorByIndex(tag.id, colorScheme)
          }))
          .sort((a, b) => {
            // Sort by post count (descending) then by name
            if (b.postCount !== a.postCount) {
              return b.postCount - a.postCount;
            }
            return a.name.localeCompare(b.name);
          })
          .slice(0, maxTags);

        setTags(processedTags);
      } catch (err) {
        console.error('Error loading tags:', err);
        setError('Failed to load tags');
      } finally {
        setIsLoading(false);
      }
    };

    loadTags();
  }, [maxTags, colorScheme]);

  const getSizeByCount = (count: number): TagWithCount['size'] => {
    if (count >= 20) return '2xl';
    if (count >= 15) return 'xl';
    if (count >= 10) return 'lg';
    if (count >= 5) return 'base';
    if (count >= 2) return 'sm';
    return 'xs';
  };

  const getColorByIndex = (id: number, scheme: TagCloudProps['colorScheme']): string => {
    const colors: Record<NonNullable<TagCloudProps['colorScheme']>, string[]> = {
      blue: [
        'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/50',
        'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/50',
        'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/50',
        'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/50',
      ],
      rainbow: [
        'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800/50',
        'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-800/50',
        'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-800/50',
        'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-800/50',
        'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-800/50',
        'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-800/50',
        'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-800/50',
        'bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:hover:bg-pink-800/50',
      ],
      monochrome: [
        'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
        'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600',
        'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600',
        'bg-stone-100 text-stone-800 hover:bg-stone-200 dark:bg-stone-700 dark:text-stone-300 dark:hover:bg-stone-600',
      ]
    };

    const colorArray = colors[scheme || 'blue'] || colors.blue;
    return colorArray[id % colorArray.length];
  };

  const getSizeClasses = (size: TagWithCount['size']): string => {
    const sizeMap = {
      'xs': 'text-xs px-2 py-1',
      'sm': 'text-sm px-2.5 py-1.5',
      'base': 'text-base px-3 py-1.5',
      'lg': 'text-lg px-3.5 py-2',
      'xl': 'text-xl px-4 py-2.5',
      '2xl': 'text-2xl px-5 py-3'
    };
    return sizeMap[size];
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Tag Populer</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Memuat tag...</p>
        </div>
        
        <div className={`
          ${layout === 'cloud' ? 'flex flex-wrap gap-2' : ''}
          ${layout === 'list' ? 'space-y-2' : ''}
          ${layout === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-2' : ''}
        `}>
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full h-8 w-20"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || tags.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {error || 'Belum ada tag tersedia'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Tag Populer</h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Jelajahi artikel berdasarkan topik yang menarik
        </p>
      </div>

      {/* Tags Display */}
      <div className={`
        ${layout === 'cloud' ? 'flex flex-wrap gap-2 justify-center' : ''}
        ${layout === 'list' ? 'space-y-2' : ''}
        ${layout === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-2' : ''}
      `}>
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/tag/${tag.slug}`}
            className={`
              group inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md
              ${getSizeClasses(tag.size)}
              ${tag.color}
              ${layout === 'list' ? 'w-full justify-between' : ''}
            `}
            title={tag.description || `${tag.postCount} artikel dengan tag ${tag.name}`}
          >
            <span className="flex items-center gap-1.5">
              {layout !== 'cloud' && (
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              )}
              <span dangerouslySetInnerHTML={{ __html: tag.name }} />
            </span>
            
            {showCount && (
              <span className={`
                ml-1.5 px-1.5 py-0.5 text-xs bg-black/10 dark:bg-white/10 rounded-full
                ${tag.size === '2xl' || tag.size === 'xl' ? 'text-xs' : 'text-xs'}
              `}>
                {tag.postCount}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* View All Link */}
      {tags.length >= maxTags && (
        <div className="mt-6 text-center">
          <Link
            href="/tags"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          >
            <span>Lihat Semua Tag</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
} 