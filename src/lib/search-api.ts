import { env } from '@/config/environment';
import type { WordPressPost, WordPressCategory, WordPressTag } from '@/types/wordpress';

// Enhanced search result interface
export interface SearchResult extends WordPressPost {
  highlightedTitle?: string;
  highlightedExcerpt?: string;
  highlightedContent?: string;
  relevanceScore?: number;
  matchedTerms?: string[];
  searchSnippet?: string;
}

// Search filters interface
export interface SearchFilters {
  query?: string;
  categories?: number[];
  tags?: number[];
  dateFrom?: string;
  dateTo?: string;
  author?: number;
  orderBy?: 'relevance' | 'date' | 'title';
  order?: 'asc' | 'desc';
}

// Search suggestion interface
export interface SearchSuggestion {
  term: string;
  type: 'query' | 'category' | 'tag' | 'post';
  count?: number;
  url?: string;
}

// Search analytics interface
export interface SearchAnalytics {
  term: string;
  count: number;
  lastSearched: string;
  resultsCount: number;
}

class SearchAPI {
  private baseUrl: string;
  private searchHistory: string[] = [];
  private maxHistoryItems = 10;

  constructor() {
    this.baseUrl = env.wordpress.publicApiUrl;
    this.loadSearchHistory();
  }

  // Enhanced search with advanced filtering
  async searchPosts(
    filters: SearchFilters,
    page = 1,
    perPage = 10
  ): Promise<{ results: SearchResult[]; total: number; pages: number }> {
    try {
      const params = new URLSearchParams();
      
      // Basic search parameters
      if (filters.query) {
        params.set('search', filters.query);
      }
      
      // Category filter
      if (filters.categories && filters.categories.length > 0) {
        params.set('categories', filters.categories.join(','));
      }
      
      // Tag filter
      if (filters.tags && filters.tags.length > 0) {
        params.set('tags', filters.tags.join(','));
      }
      
      // Date range filter
      if (filters.dateFrom) {
        params.set('after', filters.dateFrom);
      }
      if (filters.dateTo) {
        params.set('before', filters.dateTo);
      }
      
      // Author filter
      if (filters.author) {
        params.set('author', filters.author.toString());
      }
      
      // Ordering
      const orderBy = filters.orderBy || 'relevance';
      if (orderBy === 'relevance' && filters.query) {
        params.set('orderby', 'relevance');
      } else if (orderBy === 'date') {
        params.set('orderby', 'date');
      } else if (orderBy === 'title') {
        params.set('orderby', 'title');
      }
      
      params.set('order', filters.order || 'desc');
      params.set('page', page.toString());
      params.set('per_page', perPage.toString());
      params.set('_embed', 'true');
      
      const response = await fetch(`${this.baseUrl}/posts?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const posts: WordPressPost[] = await response.json();
      const totalHeader = response.headers.get('X-WP-Total');
      const totalPagesHeader = response.headers.get('X-WP-TotalPages');
      
      const total = totalHeader ? parseInt(totalHeader) : posts.length;
      const pages = totalPagesHeader ? parseInt(totalPagesHeader) : 1;
      
      // Enhance search results with highlighting and snippets
      const enhancedResults = this.enhanceSearchResults(posts, filters.query || '');
      
      // Save search analytics
      if (filters.query) {
        this.saveSearchAnalytics(filters.query, total);
        this.addToSearchHistory(filters.query);
      }
      
      return {
        results: enhancedResults,
        total,
        pages
      };
    } catch (error) {
      console.error('Enhanced search error:', error);
      return { results: [], total: 0, pages: 0 };
    }
  }

  // Generate search suggestions
  async getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
    if (!query || query.length < 2) {
      return this.getRecentSearches();
    }

    try {
      const suggestions: SearchSuggestion[] = [];
      
      // Get post title suggestions
      const postSuggestions = await this.getPostSuggestions(query);
      suggestions.push(...postSuggestions);
      
      // Get category suggestions
      const categorySuggestions = await this.getCategorySuggestions(query);
      suggestions.push(...categorySuggestions);
      
      // Get tag suggestions
      const tagSuggestions = await this.getTagSuggestions(query);
      suggestions.push(...tagSuggestions);
      
      // Add query suggestions from search history
      const historySuggestions = this.getHistorySuggestions(query);
      suggestions.push(...historySuggestions);
      
      // Sort by relevance and limit results
      return suggestions
        .sort((a, b) => (b.count || 0) - (a.count || 0))
        .slice(0, 8);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  // Get popular search terms
  getPopularSearches(): SearchAnalytics[] {
    try {
      const analytics = localStorage.getItem('search_analytics');
      if (!analytics) return [];
      
      const data: SearchAnalytics[] = JSON.parse(analytics);
      return data
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    } catch {
      return [];
    }
  }

  // Get recent searches
  getRecentSearches(): SearchSuggestion[] {
    return this.searchHistory.map(term => ({
      term,
      type: 'query' as const,
      count: this.getSearchCount(term)
    }));
  }

  // Clear search history
  clearSearchHistory(): void {
    this.searchHistory = [];
    localStorage.removeItem('search_history');
    localStorage.removeItem('search_analytics');
  }

  // Private methods
  private enhanceSearchResults(posts: WordPressPost[], query: string): SearchResult[] {
    return posts.map(post => {
      const searchResult: SearchResult = { ...post };
      
      if (query) {
        // Highlight matches in title
        searchResult.highlightedTitle = this.highlightText(
          post.title.rendered,
          query
        );
        
        // Highlight matches in excerpt
        const plainExcerpt = post.excerpt.rendered.replace(/<[^>]*>/g, '');
        searchResult.highlightedExcerpt = this.highlightText(plainExcerpt, query);
        
        // Generate search snippet from content
        searchResult.searchSnippet = this.generateSearchSnippet(
          post.content.rendered,
          query
        );
        
        // Calculate relevance score
        searchResult.relevanceScore = this.calculateRelevanceScore(post, query);
        
        // Extract matched terms
        searchResult.matchedTerms = this.extractMatchedTerms(post, query);
      }
      
      return searchResult;
    });
  }

  private highlightText(text: string, searchTerm: string): string {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      'gi'
    );
    return text.replace(
      regex,
      '<mark class="bg-yellow-200 dark:bg-yellow-900 px-1 rounded font-medium">$1</mark>'
    );
  }

  private generateSearchSnippet(content: string, query: string): string {
    const plainContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    const queryWords = query.toLowerCase().split(/\s+/);
    
    // Find the first occurrence of any query word
    let bestIndex = -1;
    let bestWord = '';
    
    for (const word of queryWords) {
      const index = plainContent.toLowerCase().indexOf(word);
      if (index !== -1 && (bestIndex === -1 || index < bestIndex)) {
        bestIndex = index;
        bestWord = word;
      }
    }
    
    if (bestIndex === -1) {
      return plainContent.substring(0, 160) + '...';
    }
    
    // Extract snippet around the found word
    const start = Math.max(0, bestIndex - 80);
    const end = Math.min(plainContent.length, bestIndex + 80);
    let snippet = plainContent.substring(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < plainContent.length) snippet = snippet + '...';
    
    return this.highlightText(snippet, query);
  }

  private calculateRelevanceScore(post: WordPressPost, query: string): number {
    let score = 0;
    const queryWords = query.toLowerCase().split(/\s+/);
    const title = post.title.rendered.toLowerCase();
    const content = post.content.rendered.toLowerCase();
    const excerpt = post.excerpt.rendered.toLowerCase();
    
    // Title matches (highest weight)
    for (const word of queryWords) {
      if (title.includes(word)) {
        score += title === word ? 100 : 50; // Exact title match vs partial
      }
    }
    
    // Excerpt matches (medium weight)
    for (const word of queryWords) {
      if (excerpt.includes(word)) {
        score += 25;
      }
    }
    
    // Content matches (lower weight)
    for (const word of queryWords) {
      const matches = (content.match(new RegExp(word, 'g')) || []).length;
      score += matches * 5;
    }
    
    return score;
  }

  private extractMatchedTerms(post: WordPressPost, query: string): string[] {
    const queryWords = query.toLowerCase().split(/\s+/);
    const allText = (
      post.title.rendered + ' ' +
      post.excerpt.rendered + ' ' +
      post.content.rendered
    ).toLowerCase();
    
    return queryWords.filter(word => allText.includes(word));
  }

  private async getPostSuggestions(query: string): Promise<SearchSuggestion[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/posts?search=${encodeURIComponent(query)}&per_page=3&_fields=id,title,slug`
      );
      const posts: Partial<WordPressPost>[] = await response.json();
      
      return posts.map(post => ({
        term: post.title?.rendered || '',
        type: 'post' as const,
        url: `/${post.slug}`
      }));
    } catch {
      return [];
    }
  }

  private async getCategorySuggestions(query: string): Promise<SearchSuggestion[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/categories?search=${encodeURIComponent(query)}&per_page=3`
      );
      const categories: WordPressCategory[] = await response.json();
      
      return categories.map(category => ({
        term: category.name,
        type: 'category' as const,
        count: category.count,
        url: `/category/${category.slug}`
      }));
    } catch {
      return [];
    }
  }

  private async getTagSuggestions(query: string): Promise<SearchSuggestion[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/tags?search=${encodeURIComponent(query)}&per_page=3`
      );
      const tags: WordPressTag[] = await response.json();
      
      return tags.map(tag => ({
        term: tag.name,
        type: 'tag' as const,
        count: tag.count,
        url: `/tag/${tag.slug}`
      }));
    } catch {
      return [];
    }
  }

  private getHistorySuggestions(query: string): SearchSuggestion[] {
    return this.searchHistory
      .filter(term => term.toLowerCase().includes(query.toLowerCase()))
      .map(term => ({
        term,
        type: 'query' as const,
        count: this.getSearchCount(term)
      }));
  }

  private addToSearchHistory(query: string): void {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    
    // Remove if already exists
    this.searchHistory = this.searchHistory.filter(term => term !== trimmedQuery);
    
    // Add to beginning
    this.searchHistory.unshift(trimmedQuery);
    
    // Limit history size
    this.searchHistory = this.searchHistory.slice(0, this.maxHistoryItems);
    
    // Save to localStorage
    try {
      localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
    } catch {
      // Handle localStorage errors silently
    }
  }

  private loadSearchHistory(): void {
    try {
      const history = localStorage.getItem('search_history');
      if (history) {
        this.searchHistory = JSON.parse(history);
      }
    } catch {
      this.searchHistory = [];
    }
  }

  private saveSearchAnalytics(query: string, resultsCount: number): void {
    try {
      const analytics = localStorage.getItem('search_analytics');
      let data: SearchAnalytics[] = analytics ? JSON.parse(analytics) : [];
      
      const existing = data.find(item => item.term === query);
      if (existing) {
        existing.count++;
        existing.lastSearched = new Date().toISOString();
        existing.resultsCount = resultsCount;
      } else {
        data.push({
          term: query,
          count: 1,
          lastSearched: new Date().toISOString(),
          resultsCount
        });
      }
      
      // Keep only top 50 searches
      data = data.sort((a, b) => b.count - a.count).slice(0, 50);
      
      localStorage.setItem('search_analytics', JSON.stringify(data));
    } catch {
      // Handle localStorage errors silently
    }
  }

  private getSearchCount(term: string): number {
    try {
      const analytics = localStorage.getItem('search_analytics');
      if (!analytics) return 0;
      
      const data: SearchAnalytics[] = JSON.parse(analytics);
      const found = data.find(item => item.term === term);
      return found ? found.count : 0;
    } catch {
      return 0;
    }
  }
}

// Export singleton instance
export const searchAPI = new SearchAPI(); 