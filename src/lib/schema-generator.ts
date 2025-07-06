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

  const defaultImage = buildImageUrl(env.schema.organization.defaultImage);
  const logoUrl = buildImageUrl(env.schema.organization.logo);
  
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title.rendered.replace(/<[^>]*>/g, ''),
    "description": post.excerpt?.rendered ? post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160) : `Read ${post.title.rendered.replace(/<[^>]*>/g, '')} on our blog`,
    "image": featuredImageUrl ? [featuredImageUrl] : [defaultImage],
    "author": {
      "@type": "Organization",
      "name": `${env.schema.organization.name} Team`,
      "url": buildAbsoluteUrl('/'),
      "logo": {
        "@type": "ImageObject",
        "url": logoUrl
      }
    },
    "publisher": {
      "@type": "Organization",
      "name": env.schema.organization.name,
      "logo": {
        "@type": "ImageObject",
        "url": logoUrl,
        "width": 300,
        "height": 60
      },
      "url": buildAbsoluteUrl('/'),
      "sameAs": getSocialUrls()
    },
    "datePublished": post.date,
    "dateModified": post.modified,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": buildAbsoluteUrl(`/${post.slug}`)
    },
    "url": buildAbsoluteUrl(`/${post.slug}`),
    "inLanguage": env.schema.locale.language,
    "articleSection": postCategories.length > 0 ? postCategories[0].name.replace(/<[^>]*>/g, '') : "Blog",
    "keywords": postTags.map(tag => tag.name.replace(/<[^>]*>/g, '')).join(', '),
    "about": {
      "@type": "Thing",
      "name": "WordPress Maintenance Services",
      "description": "Professional WordPress maintenance, migration, malware removal, and VPS management services"
    },
    "mentions": env.schema.services.primary.map(service => ({
      "@type": "Service",
      "name": service,
      "provider": {
        "@type": "Organization",
        "name": env.schema.organization.name
      }
    })),
    "isPartOf": {
      "@type": "Blog",
      "name": `${env.schema.organization.name} Blog`,
      "url": buildAbsoluteUrl('/blog'),
      "description": env.site.description
    }
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": env.schema.organization.name,
    "url": buildAbsoluteUrl('/'),
    "logo": buildImageUrl(env.schema.organization.logo),
    "description": env.schema.organization.description,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": env.schema.organization.phone,
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
  const defaultImage = buildImageUrl(env.schema.organization.defaultImage);
  
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
        "name": env.schema.organization.name
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
      "name": `${env.schema.organization.name} Team`
    },
    "publisher": {
      "@type": "Organization",
      "name": env.schema.organization.name
    },
    "mainEntity": {
      "@type": "Article",
      "headline": post.title?.rendered ? post.title.rendered.replace(/<[^>]*>/g, '') : 'Untitled Post'
    }
  };
} 