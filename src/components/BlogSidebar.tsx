import Link from 'next/link';
import LiveSearch from './LiveSearch';
import NewsletterSignup from './NewsletterSignup';
import PopularPosts from './PopularPosts';
import type { WordPressCategory, WordPressTag, WordPressPost } from '@/types/wordpress';
import React from 'react';

interface BlogSidebarProps {
  categories: WordPressCategory[];
  tags: WordPressTag[];
  selectedCategory?: WordPressCategory | null;
  selectedTag?: WordPressTag | null;
  postCategories?: WordPressCategory[]; // for single post highlight
  postTags?: WordPressTag[]; // for single post highlight
  popularPosts?: WordPressPost[];
  className?: string;
}

export default function BlogSidebar({
  categories,
  tags,
  selectedCategory,
  selectedTag,
  postCategories = [],
  postTags = [],
  popularPosts,
  className = '',
}: BlogSidebarProps) {
  // Determine highlight logic: use selectedCategory/Tag (blog) or postCategories/Tags (single)
  const isCategoryActive = (cat: WordPressCategory) => {
    if (selectedCategory) return selectedCategory.id === cat.id;
    if (postCategories && postCategories.length > 0) return postCategories.some(pc => pc.id === cat.id);
    return false;
  };
  const isTagActive = (tag: WordPressTag) => {
    if (selectedTag) return selectedTag.id === tag.id;
    if (postTags && postTags.length > 0) return postTags.some(pt => pt.id === tag.id);
    return false;
  };

  return (
    <div className={`space-y-6 min-h-screen ${className}`}>
      {/* Search Box */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-lg flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Cari Artikel
        </h3>
        <LiveSearch />
      </div>

      {/* Popular Posts - Moved after Search */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-lg flex items-center">
          <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Artikel Populer
        </h3>
        <PopularPosts 
          maxResults={5}
          layout="vertical"
          showImages={true}
          showExcerpt={false}
          showDate={true}
          showTrending={true}
          posts={popularPosts}
          className=""
        />
      </div>

      {/* Newsletter Signup */}
      <div className="transform hover:scale-[1.02] transition-transform duration-200">
        <NewsletterSignup variant="sidebar" />
      </div>

      {/* Categories */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-lg flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Kategori
        </h3>
        <div className="space-y-2">
          {categories.slice(0, 10).map(category => {
            const getCategoryIcon = (level: number, hasChildren: boolean) => {
              if (level === 0) return hasChildren ? '📁' : '📂';
              if (level === 1) return hasChildren ? '📂' : '📄';
              return '📄';
            };

            const getIndentation = (level: number) => {
              return level * 8; // 8px per level
            };

            return (
              <Link
                key={category.id}
                href={`/blog?category=${category.slug}`}
                className={`block px-3 py-2 rounded-md text-sm transition-all duration-200 transform hover:translate-x-1 ${
                  isCategoryActive(category)
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-sm'
                }`}
                style={{ paddingLeft: `${12 + getIndentation(category.level || 0)}px` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2 text-xs">
                      {getCategoryIcon(category.level || 0, category.hasChildren || false)}
                    </span>
                    <span>{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {category.hasChildren && (
                      <span className="text-xs text-gray-400">+</span>
                    )}
                    {category.count && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    )}
                  </div>
                </div>
                {category.fullPath && category.level && category.level > 0 && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 opacity-75">
                    {category.fullPath}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-lg flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Tag Populer
        </h3>
        
        {/* Tag categories filter */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1 text-xs">
            {['technology', 'frontend', 'backend', 'tutorial', 'wordpress'].map(category => {
              const categoryTags = tags.filter(tag => tag.category === category);
              if (categoryTags.length === 0) return null;
              
              return (
                <span
                  key={category}
                  className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full capitalize border border-blue-200 dark:border-blue-700"
                >
                  {category} ({categoryTags.length})
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 20).map(tag => {
            const getPopularityStyle = (popularity: 'high' | 'medium' | 'low') => {
              const styles = {
                high: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
                medium: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
                low: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
              };
              return styles[popularity] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
            };

            return (
              <Link
                key={tag.id}
                href={`/blog?tag=${tag.slug}`}
                className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 transform hover:scale-105 border ${
                  isTagActive(tag)
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 shadow-md border-blue-300'
                    : tag.popularity ? getPopularityStyle(tag.popularity) : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm border-gray-200 dark:border-gray-600'
                }`}
              >
                <span>{tag.name}</span>
                {tag.popularity === 'high' && <span>🔥</span>}
                {tag.count && tag.count > 0 && (
                  <span className="opacity-75">({tag.count})</span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Show tag category legend */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-red-100 border border-red-200 rounded-full mr-1"></span>
                High
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-yellow-100 border border-yellow-200 rounded-full mr-1"></span>
                Medium
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-100 border border-green-200 rounded-full mr-1"></span>
                Low
              </span>
            </div>
            <span>🔥 Popular</span>
          </div>
        </div>
      </div>
    </div>
  );
} 