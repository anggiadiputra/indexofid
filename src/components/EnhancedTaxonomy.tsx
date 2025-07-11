'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { WordPressCategory, WordPressTag } from '@/types/wordpress';
import { getEnhancedTaxonomyData, getTaxonomySettings } from '@/lib/wordpress-api';

interface EnhancedTaxonomyProps {
  className?: string;
  showCategories?: boolean;
  showTags?: boolean;
  maxCategories?: number;
  maxTags?: number;
  layout?: 'horizontal' | 'vertical' | 'grid';
}

interface TaxonomyData {
  categories: WordPressCategory[];
  tags: WordPressTag[];
  rankMathMeta?: any;
}

export default function EnhancedTaxonomy({
  className = '',
  showCategories = true,
  showTags = true,
  maxCategories = 10,
  maxTags = 20,
  layout = 'vertical'
}: EnhancedTaxonomyProps) {
  const [taxonomyData, setTaxonomyData] = useState<TaxonomyData | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTaxonomyData = async () => {
      try {
        setIsLoading(true);
        
        // Load enhanced taxonomy data and settings in parallel
        const [data, taxonomySettings] = await Promise.all([
          getEnhancedTaxonomyData(),
          getTaxonomySettings()
        ]);
        
        setTaxonomyData(data);
        setSettings(taxonomySettings);
        setError(null);
      } catch (err) {
        console.error('Failed to load taxonomy data:', err);
        setError('Failed to load categories and tags');
      } finally {
        setIsLoading(false);
      }
    };

    loadTaxonomyData();
  }, []);

  const getPopularityBadge = (popularity: 'high' | 'medium' | 'low') => {
    const badges = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return badges[popularity] || badges.low;
  };

  const getCategoryIcon = (level: number) => {
    if (level === 0) return '📁'; // Root category
    if (level === 1) return '📂'; // Sub category
    return '📄'; // Deep nested
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !taxonomyData) {
    return (
      <div className={`text-gray-500 ${className}`}>
        <p>{error || 'No taxonomy data available'}</p>
      </div>
    );
  }

  const { categories, tags, rankMathMeta } = taxonomyData;

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Enhanced Categories Section */}
      {showCategories && categories.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              📂 Categories
            </h3>
            {rankMathMeta?.categoryPage && (
              <span className="text-xs text-green-600 dark:text-green-400">
                ✓ SEO Optimized
              </span>
            )}
          </div>
          
          <div className={`space-y-2 ${layout === 'grid' ? 'grid grid-cols-2 gap-2' : ''}`}>
            {categories.slice(0, maxCategories).map((category) => (
              <div
                key={category.id}
                className="group p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={`/category/${category.slug}`}
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span className="text-sm">
                      {getCategoryIcon(category.level || 0)}
                    </span>
                    <span className="font-medium">{category.name}</span>
                    {category.count > 0 && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    )}
                  </Link>
                  
                  {category.hasChildren && (
                    <span className="text-xs text-gray-500">📁</span>
                  )}
                </div>
                
                {category.fullPath && category.level && category.level > 0 && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Path: {category.fullPath}
                  </div>
                )}
                
                {category.description && (
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {category.description}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {categories.length > maxCategories && (
            <div className="mt-4 text-center">
              <Link
                href="/categories"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all {categories.length} categories →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Tags Section */}
      {showTags && tags.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              🏷️ Tags
            </h3>
            {rankMathMeta?.tagPage && (
              <span className="text-xs text-green-600 dark:text-green-400">
                ✓ SEO Optimized
              </span>
            )}
          </div>
          
          {/* Tag Categories */}
          {layout === 'grid' && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 text-xs">
                {['technology', 'frontend', 'backend', 'tutorial', 'wordpress', 'general'].map(category => {
                  const categoryTags = tags.filter(tag => tag.category === category);
                  if (categoryTags.length === 0) return null;
                  
                  return (
                    <span
                      key={category}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full capitalize"
                    >
                      {category} ({categoryTags.length})
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className={`${layout === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 gap-2' : 'flex flex-wrap gap-2'}`}>
            {tags.slice(0, maxTags).map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className={`group inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm border transition-all hover:scale-105 ${
                  tag.popularity ? getPopularityBadge(tag.popularity) : 'bg-gray-100 text-gray-800 border-gray-200'
                }`}
              >
                <span>{tag.name}</span>
                {tag.count > 0 && (
                  <span className="text-xs opacity-75">({tag.count})</span>
                )}
                {tag.popularity === 'high' && <span className="text-xs">🔥</span>}
              </Link>
            ))}
          </div>
          
          {tags.length > maxTags && (
            <div className="mt-4 text-center">
              <Link
                href="/tags"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                View all {tags.length} tags →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* RankMath Integration Info */}
      {rankMathMeta && (
        <div className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <span>🔍 SEO Data: RankMath</span>
            <span>📅 Updated: {new Date(rankMathMeta.lastUpdated).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
} 