export const env = {
  wordpress: {
    apiUrl: process.env.WORDPRESS_API_URL || '',
    publicApiUrl: process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '',
    // WordPress backend site URL (for Rank Math and canonical URLs)
    backendUrl: process.env.NEXT_PUBLIC_WORDPRESS_BACKEND_URL || process.env.WORDPRESS_BACKEND_URL || process.env.WORDPRESS_API_URL?.replace('/wp-json/wp/v2', '') || '',
    // Frontend domain mapping - transform backend URLs to frontend URLs
    frontendDomain: process.env.NEXT_PUBLIC_FRONTEND_DOMAIN || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },
  // Rank Math API configuration
  rankmath: {
    enabled: process.env.NEXT_PUBLIC_RANKMATH_API_ENABLED === 'true',
    apiUrl: process.env.NEXT_PUBLIC_RANKMATH_API_URL || '',
  },
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'Headless WordPress Blog',
    logoText: process.env.NEXT_PUBLIC_SITE_LOGO_TEXT || '',
    slogan: process.env.NEXT_PUBLIC_SITE_SLOGAN || '',
    author: process.env.NEXT_PUBLIC_SITE_AUTHOR || '',
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'A modern, fast, and SEO-optimized headless WordPress website',
    // Meta images - will be constructed as site.url + image path
    ogImage: process.env.NEXT_PUBLIC_OG_IMAGE || '/og-image.jpg',
    twitterImage: process.env.NEXT_PUBLIC_TWITTER_IMAGE || '/twitter-image.jpg',
    logo: process.env.NEXT_PUBLIC_SITE_LOGO || '/logo.png',
    // Alternate language URL
    altLanguageUrl: process.env.NEXT_PUBLIC_ALT_LANGUAGE_URL || '',
    // RSS Feed title
    rssTitle: process.env.NEXT_PUBLIC_RSS_TITLE || 'RSS Feed',
  },
  // Dynamic schema configuration
  schema: {
    organization: {
      name: process.env.NEXT_PUBLIC_ORG_NAME || 'Your Organization',
      description: process.env.NEXT_PUBLIC_ORG_DESCRIPTION || 'Your organization description',
      phone: process.env.NEXT_PUBLIC_ORG_PHONE || '+1-234-567-8900',
      logo: process.env.NEXT_PUBLIC_ORG_LOGO || '/logo.png',
      defaultImage: process.env.NEXT_PUBLIC_DEFAULT_IMAGE || '/default-article-image.jpg',
      email: process.env.NEXT_PUBLIC_ORG_EMAIL || 'contact@yoursite.com',
      address: process.env.NEXT_PUBLIC_ORG_ADDRESS || 'Your City, Your Country',
      hours: process.env.NEXT_PUBLIC_ORG_HOURS || '24/7',
      // Schema.org specific URLs
      editorialPolicy: process.env.NEXT_PUBLIC_EDITORIAL_POLICY_URL || '/editorial-policy',
      ethicsPolicy: process.env.NEXT_PUBLIC_ETHICS_POLICY_URL || '/ethics-policy',
      diversityPolicy: process.env.NEXT_PUBLIC_DIVERSITY_POLICY_URL || '/diversity-policy',
      aboutUrl: process.env.NEXT_PUBLIC_ABOUT_URL || '/about',
    },
    social: {
      facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
      twitter: process.env.NEXT_PUBLIC_TWITTER_URL || '',
      linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || '',
      // Social media handles (without @ symbol)
      twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE || '',
    },
    services: {
      primary: [
        process.env.NEXT_PUBLIC_SERVICE_1 || 'Service 1',
        process.env.NEXT_PUBLIC_SERVICE_2 || 'Service 2', 
        process.env.NEXT_PUBLIC_SERVICE_3 || 'Service 3',
        process.env.NEXT_PUBLIC_SERVICE_4 || 'Service 4',
      ],
    },
    locale: {
      language: process.env.NEXT_PUBLIC_SITE_LANGUAGE || 'en-US',
      country: process.env.NEXT_PUBLIC_SITE_COUNTRY || 'United States',
    },
  },
  revalidateTime: parseInt(process.env.REVALIDATE_TIME || '3600'),
} as const;

export type Environment = typeof env; 