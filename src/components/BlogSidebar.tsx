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
          {categories.slice(0, 10).map(category => (
            <Link
              key={category.id}
              href={`/blog?category=${category.slug}`}
              className={`block px-3 py-2 rounded-md text-sm transition-all duration-200 transform hover:translate-x-1 ${
                isCategoryActive(category)
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 hover:shadow-sm'
              }`}
            >
              {category.name}
              {category.count && (
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                  {category.count}
                </span>
              )}
            </Link>
          ))}
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
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 20).map(tag => (
            <Link
              key={tag.id}
              href={`/blog?tag=${tag.slug}`}
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 transform hover:scale-105 ${
                isTagActive(tag)
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 shadow-md'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm'
              }`}
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 