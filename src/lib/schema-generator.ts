import type { 
  WordPressPost, 
  WordPressCategory, 
  WordPressTag,
  WordPressAuthor 
} from '@/types/wordpress';
import { env } from '@/config/environment';
import { getAuthorById, getAuthorBySlug } from './wordpress-api';
import { getRankMathSEO, extractRankMathSEOData } from './rankmath-api';

interface SchemaGeneratorProps {
  post: WordPressPost | null;
  postCategories: WordPressCategory[];
  postTags: WordPressTag[];
  featuredImageUrl?: string | null;
  customBreadcrumbs?: Array<{ name: string; url: string }>;
  customTitle?: string;
  customDescription?: string;
  pageType?: string;
}

// Content type detection patterns
const CONTENT_PATTERNS = {
  howTo: {
    title: /how\s+to|cara|langkah|tutorial|panduan/i,
    content: /langkah|step|tahap|cara|tutorial|guide/i,
    tags: /tutorial|guide|how-to|cara/i
  },
  listArticle: {
    title: /\d+\s+(?:best|top|terbaik|cara|tips|trik)|best\s+\d+|top\s+\d+/i,
    content: /\d+\.\s|numbered list|daftar|list of/i,
    tags: /list|daftar|tips|trik/i
  },
  faq: {
    title: /faq|frequently asked|tanya jawab|q&a/i,
    content: /\?|pertanyaan|question|faq/i,
    tags: /faq|tanya-jawab|q-and-a/i
  }
};

/**
 * Detect content type based on post data
 */
function detectContentType(post: WordPressPost, categories: WordPressCategory[], tags: WordPressTag[]): string {
  const title = post.title.rendered.toLowerCase();
  const content = post.content.rendered.toLowerCase();
  const tagNames = tags.map(tag => tag.name.toLowerCase()).join(' ');
  const categoryNames = categories.map(cat => cat.name.toLowerCase()).join(' ');

  // Check for HowTo content
  if (
    CONTENT_PATTERNS.howTo.title.test(title) ||
    CONTENT_PATTERNS.howTo.content.test(content) ||
    CONTENT_PATTERNS.howTo.tags.test(tagNames)
  ) {
    return 'HowTo';
  }

  // Check for ListArticle content
  if (
    CONTENT_PATTERNS.listArticle.title.test(title) ||
    CONTENT_PATTERNS.listArticle.content.test(content) ||
    CONTENT_PATTERNS.listArticle.tags.test(tagNames)
  ) {
    return 'ListArticle';
  }

  // Check for FAQ content
  if (
    CONTENT_PATTERNS.faq.title.test(title) ||
    CONTENT_PATTERNS.faq.content.test(content) ||
    CONTENT_PATTERNS.faq.tags.test(tagNames)
  ) {
    return 'FAQPage';
  }

  // Default to Article
  return 'Article';
}

/**
 * Generate HowTo schema for tutorial content
 */
function generateHowToSchema(post: WordPressPost, imageSchema: any, authorSchema: any): any {
  const steps = extractSteps(post.content.rendered);
  
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": post.title.rendered.replace(/<[^>]*>/g, ''),
    "description": post.excerpt?.rendered 
      ? post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160) 
      : `Learn how to ${post.title.rendered.replace(/<[^>]*>/g, '')}`,
    "image": imageSchema,
    "author": authorSchema,
    "datePublished": post.date,
    "dateModified": post.modified,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.title || `Step ${index + 1}`,
      "text": step.content,
      "url": `${buildAbsoluteUrl(`/${post.slug}`)}#step-${index + 1}`
    })),
    "totalTime": `PT${Math.max(5, Math.ceil(steps.length * 3))}M`,
    "tool": extractTools(post.content.rendered),
    "supply": extractSupplies(post.content.rendered)
  };
}

/**
 * Generate ListArticle schema for list-based content
 */
function generateListArticleSchema(post: WordPressPost, imageSchema: any, authorSchema: any): any {
  const items = extractListItems(post.content.rendered);
  
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "articleBody": post.content.rendered.replace(/<[^>]*>/g, ''),
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": items.length,
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.title,
        "description": item.description,
        "url": `${buildAbsoluteUrl(`/${post.slug}`)}#item-${index + 1}`
      }))
    },
    "image": imageSchema,
    "author": authorSchema,
    "datePublished": post.date,
    "dateModified": post.modified,
    "headline": post.title.rendered.replace(/<[^>]*>/g, ''),
    "description": post.excerpt?.rendered 
      ? post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160) 
      : `Check out our list of ${post.title.rendered.replace(/<[^>]*>/g, '')}`
  };
}

/**
 * Generate FAQ schema for Q&A content
 */
function generateFAQSchema(post: WordPressPost): any {
  const questions = extractQuestions(post.content.rendered);
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map(q => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer
      }
    }))
  };
}

/**
 * Extract steps from HowTo content
 */
function extractSteps(content: string): Array<{ title?: string; content: string }> {
  const steps: Array<{ title?: string; content: string }> = [];
  const headings = content.match(/<h[2-3][^>]*>.*?<\/h[2-3]>/g) || [];
  
  headings.forEach((heading, index) => {
    const titleMatch = heading.match(/<h[2-3][^>]*>(.*?)<\/h[2-3]>/);
    if (!titleMatch) return;
    
    const title = titleMatch[1].replace(/<[^>]*>/g, '');
    
    // Get content until next heading or end
    const startIndex = content.indexOf(heading) + heading.length;
    const nextHeading = headings[index + 1];
    const endIndex = nextHeading ? content.indexOf(nextHeading) : content.length;
    
    if (startIndex < endIndex) {
      const stepContent = content
        .slice(startIndex, endIndex)
        .replace(/<[^>]*>/g, '')
        .trim();
      
      if (stepContent) {
        steps.push({ title, content: stepContent });
      }
    }
  });
  
  return steps;
}

/**
 * Extract list items from list content
 */
function extractListItems(content: string): Array<{ title: string; description: string }> {
  const items: Array<{ title: string; description: string }> = [];
  const headings = content.match(/<h[2-3][^>]*>.*?<\/h[2-3]>/g) || [];
  
  headings.forEach((heading, index) => {
    const titleMatch = heading.match(/<h[2-3][^>]*>(.*?)<\/h[2-3]>/);
    if (!titleMatch) return;
    
    const title = titleMatch[1].replace(/<[^>]*>/g, '');
    
    // Get content until next heading or end
    const startIndex = content.indexOf(heading) + heading.length;
    const nextHeading = headings[index + 1];
    const endIndex = nextHeading ? content.indexOf(nextHeading) : content.length;
    
    if (startIndex < endIndex) {
      const description = content
        .slice(startIndex, endIndex)
        .replace(/<[^>]*>/g, '')
        .trim();
      
      if (title && description) {
        items.push({ title, description });
      }
    }
  });
  
  return items;
}

/**
 * Extract questions and answers from FAQ content
 */
function extractQuestions(content: string): Array<{ question: string; answer: string }> {
  const questions: Array<{ question: string; answer: string }> = [];
  const headings = content.match(/<h[2-3][^>]*>.*?<\/h[2-3]>/g) || [];
  
  headings.forEach((heading, index) => {
    const titleMatch = heading.match(/<h[2-3][^>]*>(.*?)<\/h[2-3]>/);
    if (!titleMatch || !titleMatch[1].includes('?')) return;
    
    const question = titleMatch[1].replace(/<[^>]*>/g, '');
    
    // Get content until next heading or end
    const startIndex = content.indexOf(heading) + heading.length;
    const nextHeading = headings[index + 1];
    const endIndex = nextHeading ? content.indexOf(nextHeading) : content.length;
    
    if (startIndex < endIndex) {
      const answer = content
        .slice(startIndex, endIndex)
        .replace(/<[^>]*>/g, '')
        .trim();
      
      if (question && answer) {
        questions.push({ question, answer });
      }
    }
  });
  
  return questions;
}

/**
 * Extract tools mentioned in HowTo content
 */
function extractTools(content: string): Array<{ "@type": string; "name": string }> {
  const toolsSection = content.match(/(?:Tools|Alat|Requirements|Persyaratan)[^\n]*\n+((?:[-*]\s*[^\n]+\n*)+)/i);
  if (!toolsSection) return [];
  
  const tools = toolsSection[1].match(/[-*]\s*([^\n]+)/g) || [];
  return tools.map(tool => ({
    "@type": "HowToTool",
    "name": tool.replace(/[-*]\s*/, '').trim()
  }));
}

/**
 * Extract supplies mentioned in HowTo content
 */
function extractSupplies(content: string): Array<{ "@type": string; "name": string }> {
  const suppliesSection = content.match(/(?:Supplies|Bahan|Materials)[^\n]*\n+((?:[-*]\s*[^\n]+\n*)+)/i);
  if (!suppliesSection) return [];
  
  const supplies = suppliesSection[1].match(/[-*]\s*([^\n]+)/g) || [];
  return supplies.map(supply => ({
    "@type": "HowToSupply",
    "name": supply.replace(/[-*]\s*/, '').trim()
  }));
}

// Enhanced author interface for schema generation
interface EnhancedAuthorData extends WordPressAuthor {
  socialLinks?: string[];
  bio?: string;
  expertise?: string[];
  jobTitle?: string;
  rankMathData?: any;
}

// Helper function to build absolute URLs
function buildAbsoluteUrl(path: string): string {
  // Use configured site URL with proper fallback hierarchy
  const baseUrl = (
    env.site.url || 
    env.wordpress.frontendDomain || 
    process.env.NEXT_PUBLIC_SITE_URL || 
    process.env.NEXT_PUBLIC_FRONTEND_DOMAIN ||
    'http://localhost:3000'
  ).replace(/\/$/, ''); // Remove trailing slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

// Helper function to build absolute image URLs
function buildImageUrl(imagePath: string): string {
  if (imagePath.startsWith('http')) {
    return imagePath; // Already absolute URL
  }
  return buildAbsoluteUrl(imagePath);
}

// Helper function to get social media URLs (only if they exist)
function getSocialUrls(): string[] {
  const socialUrls: string[] = [];
  if (env.schema.social.facebook) socialUrls.push(env.schema.social.facebook);
  if (env.schema.social.twitter) socialUrls.push(env.schema.social.twitter);
  if (env.schema.social.linkedin) socialUrls.push(env.schema.social.linkedin);
  return socialUrls;
}

/**
 * Enhanced author data fetching from multiple sources
 * Priority: RankMath API > WordPress API > Embedded data > Fallback
 */
async function getEnhancedAuthorData(post: WordPressPost): Promise<EnhancedAuthorData | null> {
  console.log('[Schema Debug] 🔍 Starting enhanced author data fetch...');
  
  // Step 1: Get embedded author data (fastest)
  let authorData = post._embedded?.author?.[0];
  
  console.log('[Schema Debug] 📊 Embedded author data:', {
    hasEmbedded: !!authorData,
    authorId: authorData?.id,
    authorName: authorData?.name,
    authorSlug: authorData?.slug
  });
  
  // Step 2: Fetch full author details from WordPress API if we have author ID
  if (authorData?.id && typeof authorData.id === 'number') {
    try {
      console.log('[Schema Debug] 🌐 Fetching full author data from WordPress API...');
      const fullAuthorData = await getAuthorById(authorData.id);
      if (fullAuthorData) {
        authorData = { ...authorData, ...fullAuthorData };
        console.log('[Schema Debug] ✅ Enhanced author data from WordPress API');
      }
    } catch (error) {
      console.warn('[Schema Debug] ⚠️ Failed to fetch full author data:', error);
    }
  }
  
  // Step 3: Try to get additional SEO data from RankMath API
  if (post.link && env.rankmath.enabled) {
    try {
      console.log('[Schema Debug] 🎯 Fetching author data from RankMath API...');
      const rankMathData = await getRankMathSEO(post.link);
      if (rankMathData?.head) {
        const extractedData = extractRankMathSEOData(rankMathData.head);
        console.log('[Schema Debug] 📊 RankMath extracted data for author:', {
          hasAuthorInfo: !!extractedData,
          extractedTitle: extractedData.title,
          extractedDescription: extractedData.description
        });
        
        if (authorData) {
          (authorData as EnhancedAuthorData).rankMathData = extractedData;
        }
      }
    } catch (error) {
      console.warn('[Schema Debug] ⚠️ Failed to fetch RankMath data for author:', error);
    }
  }
  
  // Step 4: Enhance author data with additional fields
  if (authorData) {
    const enhanced: EnhancedAuthorData = {
      ...authorData,
      bio: authorData.description || `Professional content writer at ${env.schema.business.name}`,
      jobTitle: getAuthorJobTitle(authorData),
      expertise: getAuthorExpertise(authorData, post),
      socialLinks: getAuthorSocialLinks(authorData)
    };
    
    console.log('[Schema Debug] ✅ Enhanced author data complete:', {
      name: enhanced.name,
      bio: enhanced.bio?.substring(0, 50) + '...',
      jobTitle: enhanced.jobTitle,
      expertise: enhanced.expertise?.join(', '),
      hasSocialLinks: enhanced.socialLinks && enhanced.socialLinks.length > 0,
      hasAvatar: !!enhanced.avatar_urls?.['96']
    });
    
    return enhanced;
  }
  
  console.log('[Schema Debug] ❌ No author data found, will use fallback');
  return null;
}

/**
 * Determine appropriate job title for author
 */
function getAuthorJobTitle(authorData: WordPressAuthor): string {
  // Check if description contains job title keywords
  const description = authorData.description?.toLowerCase() || '';
  
  if (description.includes('editor') || description.includes('chief')) {
    return 'Editor';
  } else if (description.includes('senior') || description.includes('lead')) {
    return 'Senior Content Writer';
  } else if (description.includes('technical') || description.includes('developer')) {
    return 'Technical Writer';
  } else if (description.includes('specialist') || description.includes('expert')) {
    return 'Content Specialist';
  }
  
  return 'Content Writer';
}

/**
 * Extract author expertise from post content and categories
 */
function getAuthorExpertise(authorData: WordPressAuthor, post: WordPressPost): string[] {
  const expertise: Set<string> = new Set();
  
  // Add expertise based on author description
  const description = authorData.description?.toLowerCase() || '';
  if (description.includes('wordpress')) expertise.add('WordPress');
  if (description.includes('vps') || description.includes('server')) expertise.add('VPS Management');
  if (description.includes('security') || description.includes('malware')) expertise.add('Web Security');
  if (description.includes('migration')) expertise.add('Website Migration');
  if (description.includes('hosting')) expertise.add('Web Hosting');
  if (description.includes('seo')) expertise.add('SEO Optimization');
  
  // Add expertise based on post categories
  if (post._embedded?.['wp:term']) {
    post._embedded['wp:term'].forEach((termGroup: any) => {
      if (Array.isArray(termGroup)) {
        termGroup.forEach((term: any) => {
          if (term.taxonomy === 'category') {
            const categoryName = term.name?.toLowerCase() || '';
            if (categoryName.includes('wordpress')) expertise.add('WordPress');
            if (categoryName.includes('vps')) expertise.add('VPS Management');
            if (categoryName.includes('security')) expertise.add('Web Security');
            if (categoryName.includes('hosting')) expertise.add('Web Hosting');
          }
        });
      }
    });
  }
  
  // Default expertise if none found
  if (expertise.size === 0) {
    expertise.add('WordPress');
    expertise.add('Web Technology');
  }
  
  return Array.from(expertise);
}

/**
 * Extract social links for author
 */
function getAuthorSocialLinks(authorData: WordPressAuthor): string[] {
  const socialLinks: string[] = [];
  
  // Add author's website if available
  if (authorData.url && authorData.url !== '#' && !authorData.url.includes('localhost')) {
    socialLinks.push(authorData.url);
  }
  
  // Add author's WordPress profile link
  if (authorData.link) {
    socialLinks.push(authorData.link);
  }
  
  // TODO: In future, can check author meta for social media links
  // This would require additional WordPress API calls or custom fields
  
  return socialLinks;
}

export function generateBreadcrumbSchema({ post, postCategories, customBreadcrumbs }: SchemaGeneratorProps) {
  if (customBreadcrumbs) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": buildAbsoluteUrl('/#breadcrumb'),
      "itemListElement": customBreadcrumbs.map((breadcrumb, index) => ({
        "@type": "ListItem",
        "@id": buildAbsoluteUrl(`${breadcrumb.url}#breadcrumb-${index + 1}`),
        "position": index + 1,
        "name": breadcrumb.name,
        "item": {
          "@type": "WebPage",
          "@id": buildAbsoluteUrl(breadcrumb.url),
          "url": buildAbsoluteUrl(breadcrumb.url),
          "name": breadcrumb.name
        }
      }))
    };
  }

  if (!post || !post.title || !post.title.rendered || !post.slug) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": buildAbsoluteUrl('/#breadcrumb'),
      "itemListElement": [
        {
          "@type": "ListItem",
          "@id": buildAbsoluteUrl('/#breadcrumb-1'),
          "position": 1,
          "name": "Home",
          "item": {
            "@type": "WebPage",
            "@id": buildAbsoluteUrl('/'),
            "url": buildAbsoluteUrl('/'),
            "name": "Home"
          }
        },
        {
          "@type": "ListItem",
          "@id": buildAbsoluteUrl('/blog#breadcrumb-2'),
          "position": 2,
          "name": "Blog",
          "item": {
            "@type": "WebPage",
            "@id": buildAbsoluteUrl('/blog'),
            "url": buildAbsoluteUrl('/blog'),
            "name": "Blog"
          }
        }
      ]
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": buildAbsoluteUrl(`/${post.slug}#breadcrumb`),
    "itemListElement": [
      {
        "@type": "ListItem",
        "@id": buildAbsoluteUrl('/#breadcrumb-1'),
        "position": 1,
        "name": "Home",
        "item": {
          "@type": "WebPage",
          "@id": buildAbsoluteUrl('/'),
          "url": buildAbsoluteUrl('/'),
          "name": "Home"
        }
      },
      ...(postCategories.length > 0 ? [{
        "@type": "ListItem",
        "@id": buildAbsoluteUrl(`/category/${postCategories[0].slug}#breadcrumb-2`),
        "position": 2,
        "name": postCategories[0].name.replace(/<[^>]*>/g, ''),
        "item": {
          "@type": "WebPage",
          "@id": buildAbsoluteUrl(`/category/${postCategories[0].slug}`),
          "url": buildAbsoluteUrl(`/category/${postCategories[0].slug}`),
          "name": postCategories[0].name.replace(/<[^>]*>/g, '')
        }
      }] : [{
        "@type": "ListItem",
        "@id": buildAbsoluteUrl('/blog#breadcrumb-2'),
        "position": 2,
        "name": "Blog",
        "item": {
          "@type": "WebPage",
          "@id": buildAbsoluteUrl('/blog'),
          "url": buildAbsoluteUrl('/blog'),
          "name": "Blog"
        }
      }]),
      {
        "@type": "ListItem",
        "@id": buildAbsoluteUrl(`/${post.slug}#breadcrumb-${postCategories.length > 0 ? 3 : 3}`),
        "position": postCategories.length > 0 ? 3 : 3,
        "name": post.title?.rendered ? post.title.rendered.replace(/<[^>]*>/g, '') : 'Untitled Post',
        "item": {
          "@type": "WebPage",
          "@id": buildAbsoluteUrl(`/${post.slug}`),
          "url": buildAbsoluteUrl(`/${post.slug}`),
          "name": post.title?.rendered ? post.title.rendered.replace(/<[^>]*>/g, '') : 'Untitled Post'
        }
      }
    ]
  };
}

export async function generateArticleSchema({ post, postCategories, postTags, featuredImageUrl }: SchemaGeneratorProps) {
  if (!post || !post.title?.rendered) {
    console.log('[Schema Debug] No post or title found:', { hasPost: !!post, hasTitle: !!post?.title?.rendered });
    return null;
  }

  const defaultImage = buildImageUrl(env.schema.business.defaultImage);
  const logoUrl = buildImageUrl(env.schema.business.logo);
  
  // Enhanced author schema using multiple data sources
  console.log('[Schema Debug] 🚀 Starting enhanced author data extraction...');
  const enhancedAuthorData = await getEnhancedAuthorData(post);
  
  const authorSchema = enhancedAuthorData ? {
    "@type": "Person",
    "@id": buildAbsoluteUrl(`/author/${enhancedAuthorData.slug}`),
    "name": enhancedAuthorData.name,
    "description": enhancedAuthorData.bio || enhancedAuthorData.description || `Content writer at ${env.schema.business.name}`,
    "url": enhancedAuthorData.link ? buildAbsoluteUrl(`/author/${enhancedAuthorData.slug}`) : buildAbsoluteUrl('/'),
    "image": enhancedAuthorData.avatar_urls?.['96'] ? {
      "@type": "ImageObject",
      "url": enhancedAuthorData.avatar_urls['96'],
      "width": 96,
      "height": 96,
      "caption": `${enhancedAuthorData.name} avatar`
    } : undefined,
    "jobTitle": enhancedAuthorData.jobTitle || "Content Writer",
    "worksFor": {
      "@type": "Organization",
      "name": env.schema.business.name,
      "url": buildAbsoluteUrl('/')
    },
    "sameAs": enhancedAuthorData.socialLinks || [],
    "knowsAbout": enhancedAuthorData.expertise || ["WordPress", "Web Technology"]
  } : {
    "@type": "Person",
    "name": env.site.author || `${env.schema.business.name} Editorial Team`,
    "description": `Professional content team at ${env.schema.business.name}`,
    "url": buildAbsoluteUrl('/')
  };

  // Enhanced image schema
  const primaryImage = featuredImageUrl || defaultImage;
  const imageSchema = {
    "@type": "ImageObject",
    "@id": `${buildAbsoluteUrl(`/${post.slug}`)}#primaryimage`,
    "url": primaryImage,
    "width": featuredImageUrl ? 1200 : 800,
    "height": featuredImageUrl ? 630 : 600,
    "caption": post.title.rendered.replace(/<[^>]*>/g, '')
  };

  // Detect content type and generate appropriate schema
  const contentType = detectContentType(post, postCategories, postTags);
  
  console.log('[Schema Debug] Detected content type:', contentType);
  
  switch (contentType) {
    case 'HowTo':
      return generateHowToSchema(post, imageSchema, authorSchema);
    
    case 'ListArticle':
      return generateListArticleSchema(post, imageSchema, authorSchema);
    
    case 'FAQPage':
      return generateFAQSchema(post);
    
    default:
      // Default Article schema
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": buildAbsoluteUrl(`/${post.slug}#article`),
        "headline": post.title.rendered.replace(/<[^>]*>/g, ''),
        "description": post.excerpt?.rendered 
          ? post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160) 
          : `Read ${post.title.rendered.replace(/<[^>]*>/g, '')} on our blog`,
        "image": [imageSchema],
        "author": authorSchema,
        "publisher": {
          "@type": "Organization",
          "@id": buildAbsoluteUrl('/#organization'),
          "name": env.schema.business.name,
          "logo": {
            "@type": "ImageObject",
            "@id": buildAbsoluteUrl('/#logo'),
            "url": logoUrl,
            "width": 300,
            "height": 60
          }
        },
        "datePublished": post.date,
        "dateModified": post.modified,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": buildAbsoluteUrl(`/${post.slug}`)
        }
      };
  }
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": env.schema.business.name,
    "url": buildAbsoluteUrl('/'),
    "logo": buildImageUrl(env.schema.business.logo),
    "description": env.schema.business.description,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": env.schema.business.phone,
      "contactType": "customer service",
      "availableLanguage": ["Indonesian", "English"]
    },
    "areaServed": {
      "@type": "Country",
      "name": env.schema.locale.country
    },
    "serviceType": env.schema.services.primary,
    "sameAs": getSocialUrls()
  };
}

export function generateWebPageSchema({ post, featuredImageUrl, customTitle, customDescription, pageType = 'WebPage' }: SchemaGeneratorProps) {
  const defaultImage = buildImageUrl(env.schema.business.defaultImage);
  
  if (!post) {
    return {
      "@context": "https://schema.org",
      "@type": pageType,
      "name": customTitle || env.site.name,
      "description": customDescription || env.site.description,
      "url": buildAbsoluteUrl('/'),
      "inLanguage": env.schema.locale.language,
      "isPartOf": {
        "@type": "WebSite",
        "name": env.site.name,
        "url": buildAbsoluteUrl('/')
      },
      "primaryImageOfPage": {
        "@type": "ImageObject",
        "url": featuredImageUrl || defaultImage
      },
      "publisher": {
        "@type": "Organization",
        "name": env.schema.business.name
      }
    };
  }
  
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": post.title?.rendered ? post.title.rendered.replace(/<[^>]*>/g, '') : 'Untitled Post',
    "description": post.excerpt?.rendered ? post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160) : `Read our blog post`,
    "url": buildAbsoluteUrl(`/${post.slug}`),
    "inLanguage": env.schema.locale.language,
    "isPartOf": {
      "@type": "WebSite",
      "name": env.site.name,
      "url": buildAbsoluteUrl('/')
    },
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": featuredImageUrl || defaultImage
    },
    "datePublished": post.date,
    "dateModified": post.modified,
    "author": {
      "@type": "Organization",
      "name": `${env.schema.business.name} Team`
    },
    "publisher": {
      "@type": "Organization",
      "name": env.schema.business.name
    },
    "mainEntity": {
      "@type": "Article",
      "headline": post.title?.rendered ? post.title.rendered.replace(/<[^>]*>/g, '') : 'Untitled Post'
    }
  };
} 