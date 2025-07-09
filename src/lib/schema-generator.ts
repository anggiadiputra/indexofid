import { env } from '@/config/environment';
import type { WordPressPost, WordPressCategory, WordPressTag } from '@/types/wordpress';

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

// Helper function to build absolute URLs
function buildAbsoluteUrl(path: string): string {
  const baseUrl = env.site.url.replace(/\/$/, ''); // Remove trailing slash
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

export function generateBreadcrumbSchema({ post, postCategories, customBreadcrumbs }: SchemaGeneratorProps) {
  if (customBreadcrumbs) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": customBreadcrumbs.map((breadcrumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": breadcrumb.name,
        "item": buildAbsoluteUrl(breadcrumb.url)
      }))
    };
  }

  if (!post || !post.title || !post.title.rendered || !post.slug) {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": buildAbsoluteUrl('/')
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog",
          "item": buildAbsoluteUrl('/blog')
        }
      ]
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": buildAbsoluteUrl('/')
      },
      ...(postCategories.length > 0 ? [{
        "@type": "ListItem",
        "position": 2,
        "name": postCategories[0].name.replace(/<[^>]*>/g, ''),
        "item": buildAbsoluteUrl(`/category/${postCategories[0].slug}`)
      }] : [{
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": buildAbsoluteUrl('/blog')
      }]),
      {
        "@type": "ListItem",
        "position": postCategories.length > 0 ? 3 : 3,
        "name": post.title?.rendered ? post.title.rendered.replace(/<[^>]*>/g, '') : 'Untitled Post',
        "item": buildAbsoluteUrl(`/${post.slug}`)
      }
    ]
  };
}

export function generateArticleSchema({ post, postCategories, postTags, featuredImageUrl }: SchemaGeneratorProps) {
  if (!post || !post.title?.rendered) {
    return null; // Return null if no post is provided or title is missing
  }

  const defaultImage = buildImageUrl(env.schema.business.defaultImage);
  const logoUrl = buildImageUrl(env.schema.business.logo);
  
  // Enhanced author schema - check for real author data from WordPress
  const authorData = post._embedded?.author?.[0];
  const authorSchema = authorData ? {
    "@type": "Person",
    "@id": buildAbsoluteUrl(`/author/${authorData.slug}`),
    "name": authorData.name,
    "description": authorData.description || `Content writer at ${env.schema.business.name}`,
    "url": authorData.link ? buildAbsoluteUrl(`/author/${authorData.slug}`) : buildAbsoluteUrl('/'),
    "image": authorData.avatar_urls?.['96'] ? {
      "@type": "ImageObject",
      "url": authorData.avatar_urls['96'],
      "width": 96,
      "height": 96,
      "caption": `${authorData.name} avatar`
    } : undefined,
    "jobTitle": "Content Writer",
    "worksFor": {
      "@type": "Organization",
      "name": env.schema.business.name,
      "url": buildAbsoluteUrl('/')
    },
    "sameAs": authorData.url ? [authorData.url] : []
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
    }
  };

  // Enhanced image schema with proper ImageObject structure
  const primaryImage = featuredImageUrl || defaultImage;
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