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
    return null; // Return null if no post is provided or title is missing
  }

  const defaultImage = buildImageUrl(env.schema.business.defaultImage);
  const logoUrl = buildImageUrl(env.schema.business.logo);
  
  console.log('[Schema Debug] Environment check:', {
    siteName: env.site.name,
    businessName: env.schema.business.name,
    defaultImage,
    logoUrl,
    featuredImageUrl,
    siteAuthor: env.site.author,
    businessPhone: env.schema.business.phone,
    businessEmail: env.schema.business.email
  });
  
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
    "knowsAbout": enhancedAuthorData.expertise || ["WordPress", "Web Technology"],
    "hasOccupation": {
      "@type": "Occupation",
      "name": enhancedAuthorData.jobTitle || "Content Writer",
      "occupationLocation": {
        "@type": "Country",
        "name": env.schema.locale.country
      }
    }
  } : {
    "@type": "Person",
    "name": env.site.author || `${env.schema.business.name} Editorial Team`,
    "description": `Professional content team at ${env.schema.business.name} specializing in WordPress and web technology`,
    "url": buildAbsoluteUrl('/'),
    "jobTitle": "Content Editor", 
    "worksFor": {
      "@type": "Organization",
      "name": env.schema.business.name,
      "url": buildAbsoluteUrl('/')
    },
    "knowsAbout": ["WordPress", "VPS Management", "Web Security", "Web Technology"],
    "hasOccupation": {
      "@type": "Occupation",
      "name": "Content Editor",
      "occupationLocation": {
        "@type": "Country",
        "name": env.schema.locale.country
      }
    }
  };

  // Enhanced image schema with proper ImageObject structure
  const primaryImage = featuredImageUrl || defaultImage;
  console.log('[Schema Debug] Image selection:', {
    featuredImageUrl,
    defaultImage,
    primaryImage,
    hasValidImage: !!primaryImage && primaryImage !== '/default-article-image.jpg'
  });
  
  const imageSchema = {
    "@type": "ImageObject",
    "@id": `${buildAbsoluteUrl(`/${post.slug}`)}#primaryimage`,
    "url": primaryImage,
    "width": featuredImageUrl ? 1200 : 800,
    "height": featuredImageUrl ? 630 : 600,
    "caption": post.title.rendered.replace(/<[^>]*>/g, ''),
    "contentUrl": primaryImage,
    "thumbnail": {
      "@type": "ImageObject",
      "url": primaryImage,
      "width": 300,
      "height": 200
    }
  };

  // Enhanced publisher schema
  const publisherSchema = {
    "@type": "Organization",
    "@id": buildAbsoluteUrl('/#organization'),
    "name": env.schema.business.name,
    "logo": {
      "@type": "ImageObject",
      "@id": buildAbsoluteUrl('/#logo'),
      "url": logoUrl,
      "width": 300,
      "height": 60,
      "caption": `${env.schema.business.name} Logo`
    },
    "url": buildAbsoluteUrl('/'),
    "sameAs": getSocialUrls(),
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": env.schema.business.phone,
      "email": env.schema.business.email,
      "contactType": "customer service"
    }
  };
  
  console.log('[Schema Debug] Final schema components:', {
    hasAuthor: !!authorSchema.name,
    hasImage: !!imageSchema.url,
    hasPublisher: !!publisherSchema.name,
    authorName: authorSchema.name,
    imageUrl: imageSchema.url,
    publisherName: publisherSchema.name
  });
  
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": buildAbsoluteUrl(`/${post.slug}#article`),
    "headline": post.title.rendered.replace(/<[^>]*>/g, ''),
    "description": post.excerpt?.rendered ? post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160) : `Read ${post.title.rendered.replace(/<[^>]*>/g, '')} on our blog`,
    "image": [imageSchema],
    "author": authorSchema,
    "publisher": publisherSchema,
    "datePublished": post.date,
    "dateModified": post.modified,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": buildAbsoluteUrl(`/${post.slug}`)
    },
    "url": buildAbsoluteUrl(`/${post.slug}`),
    "inLanguage": env.schema.locale.language,
    "articleSection": postCategories.length > 0 ? postCategories[0].name.replace(/<[^>]*>/g, '') : "Technology",
    "keywords": postTags.map(tag => tag.name.replace(/<[^>]*>/g, '')).join(', '),
    "wordCount": post.content?.rendered ? post.content.rendered.replace(/<[^>]*>/g, '').split(/\s+/).length : undefined,
    "timeRequired": post.content?.rendered ? `PT${Math.max(2, Math.ceil(post.content.rendered.replace(/<[^>]*>/g, '').split(/\s+/).length / 200))}M` : "PT3M",
    "about": {
      "@type": "Thing",
      "name": postCategories.length > 0 ? postCategories[0].name.replace(/<[^>]*>/g, '') : "WordPress Technology",
      "description": "Professional WordPress and web technology services"
    },
    "mentions": env.schema.services.primary.map(service => ({
      "@type": "Service",
      "name": service,
      "provider": {
        "@type": "Organization",
        "name": env.schema.business.name,
        "@id": buildAbsoluteUrl('/#organization')
      }
    })),
    "isPartOf": {
      "@type": "Blog",
      "@id": buildAbsoluteUrl('/blog#blog'),
      "name": `${env.schema.business.name} Blog`,
      "url": buildAbsoluteUrl('/blog'),
      "description": env.site.description || "Expert insights on WordPress, VPS, and web technology",
      "publisher": {
        "@id": buildAbsoluteUrl('/#organization')
      }
    },
    "potentialAction": {
      "@type": "ReadAction",
      "target": buildAbsoluteUrl(`/${post.slug}`)
    }
  };
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