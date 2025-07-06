'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { searchPosts } from '@/lib/wordpress-api';
import { WordPressPost } from '@/types/wordpress';

interface LiveSearchProps {
  className?: string;
}

interface SearchResult extends WordPressPost {
  highlightedTitle?: string;
  highlightedExcerpt?: string;
  relevanceScore?: number;
}

interface SearchSuggestion {
  term: string;
  type: 'recent' | 'popular';
  count?: number;
}

export default function LiveSearch({ className = '' }: LiveSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Mark client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load search suggestions and recent searches
  useEffect(() => {
    if (!isClient) return;
    loadSearchSuggestions();
  }, [isClient]);

  const loadSearchSuggestions = useCallback(() => {
    try {
      // Load recent searches from localStorage
      const recentSearches = JSON.parse(localStorage.getItem('recent_searches') || '[]');
      const popularSearches = JSON.parse(localStorage.getItem('popular_searches') || '[]');
      
      const recentSuggestions: SearchSuggestion[] = recentSearches.slice(0, 3).map((term: string) => ({
        term,
        type: 'recent' as const
      }));
      
      const popularSuggestions: SearchSuggestion[] = popularSearches.slice(0, 3).map((item: any) => ({
        term: item.term,
        type: 'popular' as const,
        count: item.count
      }));
      
      setSuggestions([...recentSuggestions, ...popularSuggestions]);
    } catch (error) {
      console.error('Error loading search suggestions:', error);
    }
  }, []);

  const saveToSearchHistory = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    try {
      // Save to recent searches
      const recentSearches = JSON.parse(localStorage.getItem('recent_searches') || '[]');
      const filtered = recentSearches.filter((term: string) => term !== searchTerm);
      filtered.unshift(searchTerm);
      localStorage.setItem('recent_searches', JSON.stringify(filtered.slice(0, 10)));
      
      // Update popular searches count
      const popularSearches = JSON.parse(localStorage.getItem('popular_searches') || '[]');
      const existing = popularSearches.find((item: any) => item.term === searchTerm);
      if (existing) {
        existing.count++;
        existing.lastUsed = new Date().toISOString();
      } else {
        popularSearches.push({ 
          term: searchTerm, 
          count: 1, 
          lastUsed: new Date().toISOString() 
        });
      }
      popularSearches.sort((a: any, b: any) => b.count - a.count);
      localStorage.setItem('popular_searches', JSON.stringify(popularSearches.slice(0, 10)));
      
      loadSearchSuggestions();
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }, [loadSearchSuggestions]);

  const highlightText = useCallback((text: string, searchTerm: string): string => {
    if (!searchTerm.trim()) return text;
    
    // Split search term into words and sort by length (longest first)
    const searchWords = searchTerm
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .sort((a, b) => b.length - a.length);
    
    let highlightedText = text;
    
    searchWords.forEach(word => {
      const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-900 px-1 rounded font-medium">$1</mark>');
    });
    
    return highlightedText;
  }, []);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      setSearchError(null);
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    setShowSuggestions(false);
    setSearchError(null);
    
    try {
      const searchResults = await searchPosts(searchQuery, 1, 8);
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      // Add highlighting to search results
      const highlightedResults = searchResults.map(post => ({
        ...post,
        highlightedTitle: highlightText(post.title.rendered, searchQuery),
        highlightedExcerpt: highlightText(
          post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 120), 
          searchQuery
        )
      }));
      
      setResults(highlightedResults);
      setIsOpen(true);
      setSelectedIndex(-1);
      
      // Track search performance
      console.log(`Search completed for "${searchQuery}" - ${highlightedResults.length} results`);
      
    } catch (error: any) {
      // Only show error if request wasn't aborted
      if (!abortControllerRef.current?.signal.aborted) {
        console.error('Search error:', error);
        setSearchError('Terjadi kesalahan saat mencari. Silakan coba lagi.');
        setResults([]);
        setIsOpen(true);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [highlightText]);

  // Improved debounced search with abort support
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Show suggestions immediately for empty or single character
    if (query.length === 0 || (query.length === 1 && suggestions.length > 0)) {
      setResults([]);
      setShowSuggestions(true);
      setIsOpen(true);
      setIsLoading(false);
      return;
    }

    // Perform search for 2 or more characters
    debounceRef.current = setTimeout(() => {
      if (query.trim().length >= 1) {
        performSearch(query.trim());
      } else {
        setResults([]);
        setIsOpen(false);
        setShowSuggestions(false);
        setSearchError(null);
        // Cancel any pending request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }
    }, 150); // Quick response time

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, performSearch, suggestions.length]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handle keyboard navigation with improved logic
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen && !showSuggestions) return;
    
    const totalItems = showSuggestions ? suggestions.length : results.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < totalItems - 1 ? prev + 1 : 0); // Loop to start
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : totalItems - 1); // Loop to end
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (showSuggestions && selectedIndex < suggestions.length) {
            const suggestion = suggestions[selectedIndex];
            setQuery(suggestion.term);
            performSearch(suggestion.term);
            saveToSearchHistory(suggestion.term);
          } else if (!showSuggestions && selectedIndex < results.length) {
            const selectedPost = results[selectedIndex];
            saveToSearchHistory(query);
            window.location.href = `/${selectedPost.slug}`;
          }
        } else if (query.trim()) {
          handleSubmit(e as any);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        setSearchError(null);
        inputRef.current?.blur();
        break;
      case 'Tab':
        // Allow tab to navigate away
        setIsOpen(false);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  }, [isOpen, showSuggestions, selectedIndex, suggestions, results, query, performSearch, saveToSearchHistory]);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        setSearchError(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSearchError(null);
  };

  const handleInputFocus = () => {
    if (query.length === 0 && suggestions.length > 0) {
      setShowSuggestions(true);
      setIsOpen(true);
    } else if (query.length >= 1 && (results.length > 0 || searchError)) {
      setIsOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveToSearchHistory(query.trim());
      setIsOpen(false);
      setShowSuggestions(false);
      // Navigate to blog page with search parameter
      window.location.href = `/blog?search=${encodeURIComponent(query.trim())}`;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.term);
    performSearch(suggestion.term);
    saveToSearchHistory(suggestion.term);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setSearchError(null);
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    inputRef.current?.focus();
  };

  const retrySearch = () => {
    setSearchError(null);
    if (query.trim().length >= 1) {
      performSearch(query.trim());
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder="Cari artikel..."
            className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
            data-autocomplete="off"
            data-lpignore="true"
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
          
          {/* Clear button */}
          {query && !isLoading && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              data-title="Hapus pencarian"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          {/* Search button */}
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors"
            data-disabled={!query.trim()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      {/* Search Results/Suggestions Dropdown */}
      {isClient && isOpen && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          data-role="listbox"
          aria-label="Hasil pencarian"
        >
          {searchError ? (
            // Error State
            <div className="p-4 text-center">
              <svg className="w-8 h-8 mx-auto text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600 dark:text-red-400 mb-2">{searchError}</p>
              <button
                onClick={retrySearch}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                Coba Lagi
              </button>
            </div>
          ) : showSuggestions && suggestions.length > 0 ? (
            // Search Suggestions
            <>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pencarian Terkini & Populer
                </p>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.term}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                      selectedIndex === index ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    role="option"
                    aria-selected={selectedIndex === index}
                  >
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {suggestion.type === 'recent' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        )}
                      </svg>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{suggestion.term}</span>
                    </div>
                    {suggestion.count && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full">
                        {suggestion.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          ) : results.length > 0 ? (
            // Search Results
            <>
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ditemukan {results.length} artikel untuk &ldquo;{query}&rdquo;
                </p>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {results.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/${post.slug}`}
                    className={`block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedIndex === index ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => {
                      setIsOpen(false);
                      saveToSearchHistory(query);
                    }}
                    role="option"
                    aria-selected={selectedIndex === index}
                  >
                    <div className="space-y-2">
                      <h4 
                        className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: post.highlightedTitle || post.title.rendered }}
                      />
                      <p 
                        className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: post.highlightedExcerpt || post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 120) }}
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          {new Date(post.date).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {results.length >= 8 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href={`/blog?search=${encodeURIComponent(query)}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center"
                    onClick={() => {
                      setIsOpen(false);
                      saveToSearchHistory(query);
                    }}
                  >
                    Lihat semua hasil pencarian
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </>
          ) : query.trim().length >= 1 && !isLoading ? (
            // No Results
            <div className="p-4 text-center">
              <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.007-5.824-2.562M15 9a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tidak ditemukan artikel untuk &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Coba kata kunci yang berbeda atau lebih spesifik
              </p>
            </div>
          ) : null}
          
          {/* Keyboard navigation hint */}
          {(results.length > 0 || (showSuggestions && suggestions.length > 0)) && !searchError && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Gunakan ↑↓ untuk navigasi, Enter untuk pilih, Esc untuk tutup
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 