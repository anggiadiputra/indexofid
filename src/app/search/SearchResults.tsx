'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { searchAPI, SearchFilters, SearchResult } from '@/lib/search-api';
import { getAllCategories, getAllTags } from '@/lib/wordpress-api';
import { WordPressCategory, WordPressTag } from '@/types/wordpress';
import AdvancedSearch from '@/components/AdvancedSearch';
import PopularPosts from '@/components/PopularPosts';

interface SearchResultsProps {
  searchParams: {
    search?: string;
    categories?: string;
    tags?: string;
    dateFrom?: string;
    dateTo?: string;
    orderBy?: 'relevance' | 'date' | 'title';
    page?: string;
  };
}

export default function SearchResults({ searchParams }: SearchResultsProps) {
  const router = useRouter();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [categories, setCategories] = useState<WordPressCategory[]>([]);
  const [tags, setTags] = useState<WordPressTag[]>([]);
  const [popularSearches, setPopularSearches] = useState<any[]>([]);

  const currentPage = parseInt(searchParams.page || '1');
  const query = searchParams.search || '';

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          getAllCategories(),
          getAllTags()
        ]);
        setCategories(categoriesData);
        setTags(tagsData);
        
        // Load popular searches
        const popular = searchAPI.getPopularSearches();
        setPopularSearches(popular);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  // Perform search when params change
  useEffect(() => {
    const performSearch = async () => {
      if (!query) {
        setResults([]);
        setTotalResults(0);
        setTotalPages(0);
        return;
      }

      setIsLoading(true);
      try {
        const filters: SearchFilters = {
          query,
          categories: searchParams.categories?.split(',').map(Number).filter(Boolean),
          tags: searchParams.tags?.split(',').map(Number).filter(Boolean),
          dateFrom: searchParams.dateFrom,
          dateTo: searchParams.dateTo,
          orderBy: searchParams.orderBy || 'relevance'
        };

        const searchResults = await searchAPI.searchPosts(filters, currentPage, 10);
        setResults(searchResults.results);
        setTotalResults(searchResults.total);
        setTotalPages(searchResults.pages);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setTotalResults(0);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query, searchParams.categories, searchParams.tags, searchParams.dateFrom, searchParams.dateTo, searchParams.orderBy, currentPage]);

  const getFeaturedImageUrl = (post: SearchResult): string | null => {
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

  const getSelectedCategoryNames = (): string[] => {
    if (!searchParams.categories) return [];
    const categoryIds = searchParams.categories.split(',').map(Number);
    return categories
      .filter(cat => categoryIds.includes(cat.id))
      .map(cat => cat.name);
  };

  const getSelectedTagNames = (): string[] => {
    if (!searchParams.tags) return [];
    const tagIds = searchParams.tags.split(',').map(Number);
    return tags
      .filter(tag => tagIds.includes(tag.id))
      .map(tag => tag.name);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    router.push(`/search?${params.toString()}`);
  };

  const removeFilter = (type: 'category' | 'tag' | 'dateFrom' | 'dateTo', value?: string | number) => {
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    
    if (type === 'category' && searchParams.categories) {
      const categoryIds = searchParams.categories.split(',').map(Number).filter(id => id !== value);
      if (categoryIds.length > 0) params.set('categories', categoryIds.join(','));
    } else if (searchParams.categories && type !== 'category') {
      params.set('categories', searchParams.categories);
    }
    
    if (type === 'tag' && searchParams.tags) {
      const tagIds = searchParams.tags.split(',').map(Number).filter(id => id !== value);
      if (tagIds.length > 0) params.set('tags', tagIds.join(','));
    } else if (searchParams.tags && type !== 'tag') {
      params.set('tags', searchParams.tags);
    }
    
    if (searchParams.dateFrom && type !== 'dateFrom') params.set('dateFrom', searchParams.dateFrom);
    if (searchParams.dateTo && type !== 'dateTo') params.set('dateTo', searchParams.dateTo);
    if (searchParams.orderBy) params.set('orderBy', searchParams.orderBy);
    
    router.push(`/search?${params.toString()}`);
  };

  const buildPaginationUrl = (page: number) => {
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (searchParams.categories) params.set('categories', searchParams.categories);
    if (searchParams.tags) params.set('tags', searchParams.tags);
    if (searchParams.dateFrom) params.set('dateFrom', searchParams.dateFrom);
    if (searchParams.dateTo) params.set('dateTo', searchParams.dateTo);
    if (searchParams.orderBy) params.set('orderBy', searchParams.orderBy);
    if (page > 1) params.set('page', page.toString());
    
    return `/search?${params.toString()}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Enhanced Search Bar */}
      <div className="lg:col-span-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <AdvancedSearch 
            showFilters={true}
            placeholder="Cari artikel dengan fitur pencarian canggih..."
            autoFocus={!query}
          />
        </div>
      </div>

      {/* Artikel Populer Widget - Under Search */}
      <div className="lg:col-span-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center text-lg">
            <span className="mr-2">🔥</span>
            Artikel Populer
            <span className="ml-auto text-sm font-normal text-gray-500 dark:text-gray-400">
              Trending sekarang
            </span>
          </h3>
          <PopularPosts 
            maxResults={6}
            showTrending={false}
            layout="grid"
            showImages={true}
            showExcerpt={true}
            showDate={true}
            className=""
          />
        </div>
      </div>

      {/* Search Filters & Analytics Sidebar */}
      <div className="lg:col-span-1">
        <div className="space-y-6 sticky top-24">
          {/* Active Filters */}
          {(searchParams.categories || searchParams.tags || searchParams.dateFrom || searchParams.dateTo) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filter Aktif</h3>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                >
                  Hapus Semua
                </button>
              </div>
              
              <div className="space-y-2">
                {/* Category filters */}
                {getSelectedCategoryNames().map((categoryName, index) => {
                  const categoryId = searchParams.categories?.split(',').map(Number)[index];
                  return (
                    <div key={`category-${categoryId}`} className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 px-3 py-2 rounded text-sm">
                      <span className="text-orange-800 dark:text-orange-200">📁 {categoryName}</span>
                      <button
                        onClick={() => removeFilter('category', categoryId)}
                        className="text-orange-600 hover:text-orange-800 dark:text-orange-400"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
                
                {/* Tag filters */}
                {getSelectedTagNames().map((tagName, index) => {
                  const tagId = searchParams.tags?.split(',').map(Number)[index];
                  return (
                    <div key={`tag-${tagId}`} className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded text-sm">
                      <span className="text-purple-800 dark:text-purple-200">🏷️ {tagName}</span>
                      <button
                        onClick={() => removeFilter('tag', tagId)}
                        className="text-purple-600 hover:text-purple-800 dark:text-purple-400"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
                
                {/* Date filters */}
                {searchParams.dateFrom && (
                  <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded text-sm">
                    <span className="text-blue-800 dark:text-blue-200">📅 Dari: {searchParams.dateFrom}</span>
                    <button
                      onClick={() => removeFilter('dateFrom')}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      ×
                    </button>
                  </div>
                )}
                {searchParams.dateTo && (
                  <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded text-sm">
                    <span className="text-blue-800 dark:text-blue-200">📅 Sampai: {searchParams.dateTo}</span>
                    <button
                      onClick={() => removeFilter('dateTo')}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          {popularSearches.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Pencarian Populer</h3>
              <div className="space-y-2">
                {popularSearches.map((search, index) => (
                  <Link
                    key={index}
                    href={`/search?search=${encodeURIComponent(search.term)}`}
                    className="block p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span>{search.term}</span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {search.count}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Search Tips */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Tips Pencarian</h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <span className="text-orange-500">💡</span>
                <span>Gunakan kata kunci spesifik untuk hasil yang lebih akurat</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500">🔍</span>
                <span>Filter berdasarkan kategori atau tag untuk mempersempit hasil</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500">📅</span>
                <span>Gunakan filter tanggal untuk mencari artikel terbaru</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="lg:col-span-3">
        {/* Results Header */}
        {query && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {isLoading ? 'Mencari...' : `${totalResults} hasil ditemukan`}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Pencarian untuk: <span className="font-medium">&ldquo;{query}&rdquo;</span>
                </p>
              </div>
              
              {totalResults > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Halaman {currentPage} dari {totalPages}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="animate-pulse flex space-x-4">
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && query && results.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Tidak ada hasil ditemukan
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {query ? `Tidak ditemukan artikel untuk &ldquo;${query}&rdquo;. Coba kata kunci yang berbeda.` : 'Belum ada artikel blog yang tersedia saat ini.'}
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Hapus Semua Filter
              </button>
            </div>
          </div>
        )}

        {/* Search Results */}
        {!isLoading && results.length > 0 && (
          <>
            <div className="space-y-6">
              {results.map((post) => {
                const featuredImageUrl = getFeaturedImageUrl(post);
                return (
                  <article
                    key={post.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex gap-4">
                        {/* Featured Image */}
                        <div className="w-24 h-24 flex-shrink-0 relative">
                          {featuredImageUrl ? (
                            <Image
                              src={featuredImageUrl}
                              alt={post.title.rendered}
                              fill
                              className="object-cover rounded-lg"
                              sizes="96px"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800 rounded-lg flex items-center justify-center">
                              <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Title with highlighting */}
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                            <Link 
                              href={`/${post.slug}`}
                              className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                            >
                              {post.highlightedTitle ? (
                                <span dangerouslySetInnerHTML={{ __html: post.highlightedTitle }} />
                              ) : (
                                <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                              )}
                            </Link>
                          </h3>

                          {/* Search snippet with highlighting */}
                          <div className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
                            {post.searchSnippet ? (
                              <span dangerouslySetInnerHTML={{ __html: post.searchSnippet }} />
                            ) : post.highlightedExcerpt ? (
                              <span dangerouslySetInnerHTML={{ __html: post.highlightedExcerpt }} />
                            ) : (
                              <span dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
                            )}
                          </div>

                          {/* Meta information */}
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              {new Date(post.date).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            {post.relevanceScore && (
                              <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded">
                                Relevansi: {Math.round(post.relevanceScore)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  {/* Previous button */}
                  {currentPage > 1 && (
                    <Link
                      href={buildPaginationUrl(currentPage - 1)}
                      className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Sebelumnya
                    </Link>
                  )}

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, currentPage - 2) + i;
                    if (page > totalPages) return null;
                    
                    return (
                      <Link
                        key={page}
                        href={buildPaginationUrl(page)}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                          page === currentPage
                            ? 'bg-orange-600 text-white'
                            : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </Link>
                    );
                  })}

                  {/* Next button */}
                  {currentPage < totalPages && (
                    <Link
                      href={buildPaginationUrl(currentPage + 1)}
                      className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Selanjutnya
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* No query state */}
        {!query && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Mulai Pencarian Anda
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Masukkan kata kunci di atas untuk mencari artikel yang Anda inginkan. Gunakan filter untuk hasil yang lebih spesifik.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 