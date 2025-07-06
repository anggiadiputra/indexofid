import { getAllPosts, getPostsByCategory, getPostsByTag } from '@/lib/wordpress-api';
import type { WordPressPost, WordPressCategory, WordPressTag } from '@/types/wordpress';

export interface RelatedPost extends WordPressPost {
  relevanceScore: number;
  matchReason: 'category' | 'tag' | 'title' | 'content';
  matchDetails: string[];
}

export interface RelatedPostsOptions {
  maxResults?: number;
  excludeCurrentPost?: boolean;
  includeCategories?: boolean;
  includeTags?: boolean;
  includeContentSimilarity?: boolean;
  minRelevanceScore?: number;
}

class RelatedPostsService {
  private stopWords = new Set([
    'dan', 'atau', 'yang', 'ini', 'itu', 'dari', 'ke', 'di', 'untuk', 'dengan',
    'pada', 'dalam', 'oleh', 'adalah', 'akan', 'telah', 'sudah', 'juga', 'dapat',
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
    'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had'
  ]);

  /**
   * Get related posts for a given post
   */
  async getRelatedPosts(
    currentPost: WordPressPost,
    postCategories: WordPressCategory[],
    postTags: WordPressTag[],
    options: RelatedPostsOptions = {}
  ): Promise<RelatedPost[]> {
    const {
      maxResults = 6,
      excludeCurrentPost = true,
      includeCategories = true,
      includeTags = true,
      includeContentSimilarity = true,
      minRelevanceScore = 10
    } = options;

    try {
      // Get all posts for analysis
      const allPosts = await getAllPosts(1, 100); // Get more posts for better matching
      
      // Filter out current post if requested
      const candidatePosts = excludeCurrentPost 
        ? allPosts.filter(post => post.id !== currentPost.id)
        : allPosts;

      if (candidatePosts.length === 0) {
        return [];
      }

      // Calculate relevance scores for each candidate post
      const scoredPosts = await Promise.all(
        candidatePosts.map(post => this.calculateRelevanceScore(
          currentPost,
          post,
          postCategories,
          postTags,
          { includeCategories, includeTags, includeContentSimilarity }
        ))
      );

      // Filter by minimum relevance score and sort by score
      const relatedPosts = scoredPosts
        .filter(post => post.relevanceScore >= minRelevanceScore)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, maxResults);

      return relatedPosts;
    } catch (error) {
      console.error('Error getting related posts:', error);
      return [];
    }
  }

  /**
   * Get related posts by category only (faster method)
   */
  async getRelatedPostsByCategory(
    currentPost: WordPressPost,
    postCategories: WordPressCategory[],
    maxResults = 6
  ): Promise<RelatedPost[]> {
    if (postCategories.length === 0) {
      return [];
    }

    try {
      // Get posts from the same categories
      const categoryPosts = await Promise.all(
        postCategories.map(category => getPostsByCategory(category.id, 1, 20))
      );

      // Flatten and deduplicate
      const allCategoryPosts = Array.from(
        new Map(
          categoryPosts
            .flat()
            .filter(post => post.id !== currentPost.id)
            .map(post => [post.id, post])
        ).values()
      );

      // Create related posts with category-based scoring
      const relatedPosts: RelatedPost[] = allCategoryPosts
        .slice(0, maxResults)
        .map(post => ({
          ...post,
          relevanceScore: 50, // Base score for category match
          matchReason: 'category' as const,
          matchDetails: postCategories
            .filter(cat => this.postHasCategory(post, cat.id))
            .map(cat => cat.name)
        }));

      return relatedPosts;
    } catch (error) {
      console.error('Error getting related posts by category:', error);
      return [];
    }
  }

  /**
   * Calculate relevance score between two posts
   */
  private async calculateRelevanceScore(
    currentPost: WordPressPost,
    candidatePost: WordPressPost,
    currentCategories: WordPressCategory[],
    currentTags: WordPressTag[],
    options: {
      includeCategories: boolean;
      includeTags: boolean;
      includeContentSimilarity: boolean;
    }
  ): Promise<RelatedPost> {
    let totalScore = 0;
    const matchDetails: string[] = [];
    let primaryMatchReason: 'category' | 'tag' | 'title' | 'content' = 'content';

    // Category matching (highest weight)
    if (options.includeCategories) {
      const categoryScore = this.calculateCategoryScore(candidatePost, currentCategories);
      if (categoryScore > 0) {
        totalScore += categoryScore;
        primaryMatchReason = 'category';
        const matchingCategories = currentCategories
          .filter(cat => this.postHasCategory(candidatePost, cat.id))
          .map(cat => cat.name);
        matchDetails.push(...matchingCategories);
      }
    }

    // Tag matching (medium weight)
    if (options.includeTags) {
      const tagScore = this.calculateTagScore(candidatePost, currentTags);
      if (tagScore > 0) {
        totalScore += tagScore;
        if (primaryMatchReason === 'content') primaryMatchReason = 'tag';
        const matchingTags = currentTags
          .filter(tag => this.postHasTag(candidatePost, tag.id))
          .map(tag => tag.name);
        matchDetails.push(...matchingTags);
      }
    }

    // Content similarity (lower weight but important for relevance)
    if (options.includeContentSimilarity) {
      const contentScore = this.calculateContentSimilarity(currentPost, candidatePost);
      if (contentScore > 0) {
        totalScore += contentScore;
        if (primaryMatchReason === 'content' && contentScore > 20) {
          primaryMatchReason = 'title';
        }
      }
    }

    // Recency bonus (newer posts get slight boost)
    const recencyScore = this.calculateRecencyScore(candidatePost);
    totalScore += recencyScore;

    return {
      ...candidatePost,
      relevanceScore: Math.round(totalScore),
      matchReason: primaryMatchReason,
      matchDetails: Array.from(new Set(matchDetails)) // Remove duplicates
    };
  }

  /**
   * Calculate category matching score
   */
  private calculateCategoryScore(post: WordPressPost, categories: WordPressCategory[]): number {
    let score = 0;
    
    for (const category of categories) {
      if (this.postHasCategory(post, category.id)) {
        score += 50; // High score for category match
      }
    }
    
    return score;
  }

  /**
   * Calculate tag matching score
   */
  private calculateTagScore(post: WordPressPost, tags: WordPressTag[]): number {
    let score = 0;
    
    for (const tag of tags) {
      if (this.postHasTag(post, tag.id)) {
        score += 25; // Medium score for tag match
      }
    }
    
    return score;
  }

  /**
   * Calculate content similarity score
   */
  private calculateContentSimilarity(currentPost: WordPressPost, candidatePost: WordPressPost): number {
    let score = 0;

    // Title similarity (highest weight for content)
    const titleSimilarity = this.calculateTextSimilarity(
      currentPost.title.rendered,
      candidatePost.title.rendered
    );
    score += titleSimilarity * 30;

    // Excerpt similarity (medium weight)
    const excerptSimilarity = this.calculateTextSimilarity(
      this.cleanHtml(currentPost.excerpt.rendered),
      this.cleanHtml(candidatePost.excerpt.rendered)
    );
    score += excerptSimilarity * 15;

    // Content similarity (lower weight due to length)
    const contentSimilarity = this.calculateTextSimilarity(
      this.cleanHtml(currentPost.content.rendered).substring(0, 500),
      this.cleanHtml(candidatePost.content.rendered).substring(0, 500)
    );
    score += contentSimilarity * 10;

    return score;
  }

  /**
   * Calculate recency score (newer posts get slight boost)
   */
  private calculateRecencyScore(post: WordPressPost): number {
    const postDate = new Date(post.date);
    const now = new Date();
    const daysDiff = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Posts within last 30 days get bonus points
    if (daysDiff <= 30) return 5;
    if (daysDiff <= 90) return 3;
    if (daysDiff <= 180) return 1;
    
    return 0;
  }

  /**
   * Calculate text similarity using word overlap
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = this.extractKeywords(text1);
    const words2 = this.extractKeywords(text2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set(Array.from(set1).filter(word => set2.has(word)));
    const union = new Set([...Array.from(set1), ...Array.from(set2)]);
    
    return intersection.size / union.size; // Jaccard similarity
  }

  /**
   * Extract keywords from text (remove stop words, normalize)
   */
  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 3 && !this.stopWords.has(word))
      .slice(0, 20); // Limit to top 20 keywords for performance
  }

  /**
   * Clean HTML tags from text
   */
  private cleanHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Check if post has specific category
   */
  private postHasCategory(post: WordPressPost, categoryId: number): boolean {
    if (!post._embedded || !post._embedded['wp:term']) return false;
    
    return post._embedded['wp:term'].some((termGroup: any) =>
      termGroup.some((term: any) => 
        term.taxonomy === 'category' && term.id === categoryId
      )
    );
  }

  /**
   * Check if post has specific tag
   */
  private postHasTag(post: WordPressPost, tagId: number): boolean {
    if (!post._embedded || !post._embedded['wp:term']) return false;
    
    return post._embedded['wp:term'].some((termGroup: any) =>
      termGroup.some((term: any) => 
        term.taxonomy === 'post_tag' && term.id === tagId
      )
    );
  }

  /**
   * Get trending posts based on recent activity
   */
  async getTrendingPosts(maxResults = 6): Promise<WordPressPost[]> {
    try {
      // Get recent posts (last 30 days) and sort by date
      const recentPosts = await getAllPosts(1, 50);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return recentPosts
        .filter(post => new Date(post.date) > thirtyDaysAgo)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, maxResults);
    } catch (error) {
      console.error('Error getting trending posts:', error);
      return [];
    }
  }

  /**
   * Get popular posts (fallback to recent if no analytics available)
   */
  async getPopularPosts(maxResults = 6): Promise<WordPressPost[]> {
    try {
      // For now, return most recent posts as "popular"
      // In the future, this could integrate with analytics data
      const posts = await getAllPosts(1, maxResults * 2);
      
      // Simple popularity algorithm: newer posts with more categories/tags
      return posts
        .map(post => ({
          ...post,
          popularityScore: this.calculatePopularityScore(post)
        }))
        .sort((a, b) => b.popularityScore - a.popularityScore)
        .slice(0, maxResults);
    } catch (error) {
      console.error('Error getting popular posts:', error);
      return [];
    }
  }

  /**
   * Calculate simple popularity score
   */
  private calculatePopularityScore(post: WordPressPost): number {
    let score = 0;
    
    // Recency factor
    const daysSincePublished = (Date.now() - new Date(post.date).getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 30 - daysSincePublished); // Newer posts get higher score
    
    // Content engagement factors
    const titleLength = post.title.rendered.length;
    if (titleLength > 30 && titleLength < 60) score += 5; // Optimal title length
    
    const excerptLength = this.cleanHtml(post.excerpt.rendered).length;
    if (excerptLength > 100) score += 3; // Has substantial excerpt
    
    // Category/tag engagement
    if (post._embedded && post._embedded['wp:term']) {
      const termCount = post._embedded['wp:term'].flat().length;
      score += Math.min(termCount * 2, 10); // More categories/tags = higher engagement
    }
    
    return score;
  }
}

// Export singleton instance
export const relatedPostsService = new RelatedPostsService();

// Export utility functions
export {
  RelatedPostsService
}; 