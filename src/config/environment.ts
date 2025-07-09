export const env = {
  wordpress: {
    apiUrl: process.env.WORDPRESS_API_URL || '',
    publicApiUrl: process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '',
    // WordPress backend site URL (for Rank Math and canonical URLs)
    backendUrl: process.env.NEXT_PUBLIC_WORDPRESS_BACKEND_URL || process.env.WORDPRESS_BACKEND_URL || process.env.WORDPRESS_API_URL?.replace('/wp-json/wp/v2', '') || '',
    // Frontend domain mapping - transform backend URLs to frontend URLs
    frontendDomain: process.env.NEXT_PUBLIC_FRONTEND_DOMAIN || process.env.NEXT_PUBLIC_SITE_URL || '',
  },
  // Rank Math API configuration
  rankmath: {
    enabled: process.env.NEXT_PUBLIC_RANKMATH_API_ENABLED === 'true',
    apiUrl: process.env.NEXT_PUBLIC_RANKMATH_API_URL || '',
  },
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || '',
    name: process.env.NEXT_PUBLIC_SITE_NAME || '',
    logoText: process.env.NEXT_PUBLIC_SITE_LOGO_TEXT || '',
    slogan: process.env.NEXT_PUBLIC_SITE_SLOGAN || '',
    author: process.env.NEXT_PUBLIC_SITE_AUTHOR || '',
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '',
    // Meta images - will be constructed as site.url + image path
    ogImage: process.env.NEXT_PUBLIC_OG_IMAGE || '/og-image.jpg',
    twitterImage: process.env.NEXT_PUBLIC_TWITTER_IMAGE || '/twitter-image.jpg',
    logo: process.env.NEXT_PUBLIC_SITE_LOGO || '/logo.png',
    // Alternate language URL
    altLanguageUrl: process.env.NEXT_PUBLIC_ALT_LANGUAGE_URL || '',
    // RSS Feed title
    rssTitle: process.env.NEXT_PUBLIC_RSS_TITLE || '',
  },
  // Dynamic schema configuration for business
  schema: {
    business: {
      name: process.env.NEXT_PUBLIC_BUSINESS_NAME || process.env.NEXT_PUBLIC_ORG_NAME || '',
      alternateName: process.env.NEXT_PUBLIC_BUSINESS_ALTERNATE_NAME || process.env.NEXT_PUBLIC_ORG_ALTERNATE_NAME || '',
      description: process.env.NEXT_PUBLIC_BUSINESS_DESCRIPTION || process.env.NEXT_PUBLIC_ORG_DESCRIPTION || '',
      slogan: process.env.NEXT_PUBLIC_BUSINESS_SLOGAN || process.env.NEXT_PUBLIC_ORG_SLOGAN || '',
      foundingDate: process.env.NEXT_PUBLIC_BUSINESS_FOUNDING_DATE || process.env.NEXT_PUBLIC_ORG_FOUNDING_DATE || '',
      businessType: process.env.NEXT_PUBLIC_BUSINESS_TYPE || process.env.NEXT_PUBLIC_ORG_BUSINESS_TYPE || 'ProfessionalService',
      phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || process.env.NEXT_PUBLIC_ORG_PHONE || '',
      logo: process.env.NEXT_PUBLIC_BUSINESS_LOGO || process.env.NEXT_PUBLIC_ORG_LOGO || process.env.NEXT_PUBLIC_SITE_LOGO || '/logo.png',
      defaultImage: process.env.NEXT_PUBLIC_DEFAULT_IMAGE || '/default-article-image.jpg',
      email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || process.env.NEXT_PUBLIC_ORG_EMAIL || '',
      address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || process.env.NEXT_PUBLIC_ORG_ADDRESS || '',
      streetAddress: process.env.NEXT_PUBLIC_BUSINESS_STREET_ADDRESS || process.env.NEXT_PUBLIC_ORG_STREET_ADDRESS || '',
      addressLocality: process.env.NEXT_PUBLIC_BUSINESS_LOCALITY || process.env.NEXT_PUBLIC_ORG_LOCALITY || '',
      addressRegion: process.env.NEXT_PUBLIC_BUSINESS_REGION || process.env.NEXT_PUBLIC_ORG_REGION || '',
      postalCode: process.env.NEXT_PUBLIC_BUSINESS_POSTAL_CODE || process.env.NEXT_PUBLIC_ORG_POSTAL_CODE || '',
      hours: process.env.NEXT_PUBLIC_BUSINESS_HOURS || process.env.NEXT_PUBLIC_ORG_HOURS || '',
      // Geo coordinates
      latitude: parseFloat(process.env.NEXT_PUBLIC_BUSINESS_LATITUDE || process.env.NEXT_PUBLIC_ORG_LATITUDE || '0'),
      longitude: parseFloat(process.env.NEXT_PUBLIC_BUSINESS_LONGITUDE || process.env.NEXT_PUBLIC_ORG_LONGITUDE || '0'),
      // Schema.org specific URLs
      aboutUrl: process.env.NEXT_PUBLIC_ABOUT_URL || '',
      // Know about areas (comma separated)
      knowsAbout: process.env.NEXT_PUBLIC_BUSINESS_KNOWS_ABOUT?.split(',').map(item => item.trim()) || 
                  process.env.NEXT_PUBLIC_ORG_KNOWS_ABOUT?.split(',').map(item => item.trim()) || [],
      // Expertise areas (comma separated)  
      expertise: process.env.NEXT_PUBLIC_BUSINESS_EXPERTISE?.split(',').map(item => item.trim()) || 
                 process.env.NEXT_PUBLIC_ORG_EXPERTISE?.split(',').map(item => item.trim()) || [],
      // Audience description
      audienceType: process.env.NEXT_PUBLIC_BUSINESS_AUDIENCE || process.env.NEXT_PUBLIC_ORG_AUDIENCE || '',
    },
    social: {
      facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
      twitter: process.env.NEXT_PUBLIC_TWITTER_URL || '',
      linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || '',
      instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
      youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || '',
      // Social media handles (without @ symbol)
      twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE || '',
    },
    services: {
      primary: [
        process.env.NEXT_PUBLIC_SERVICE_1,
        process.env.NEXT_PUBLIC_SERVICE_2, 
        process.env.NEXT_PUBLIC_SERVICE_3,
        process.env.NEXT_PUBLIC_SERVICE_4,
      ].filter(Boolean),
      // Service descriptions
      serviceDescriptions: {
        service1: process.env.NEXT_PUBLIC_SERVICE_1_DESC || '',
        service2: process.env.NEXT_PUBLIC_SERVICE_2_DESC || '',
        service3: process.env.NEXT_PUBLIC_SERVICE_3_DESC || '',
        service4: process.env.NEXT_PUBLIC_SERVICE_4_DESC || '',
      }
    },
    locale: {
      language: process.env.NEXT_PUBLIC_SITE_LANGUAGE || 'id-ID',
      country: process.env.NEXT_PUBLIC_SITE_COUNTRY || 'Indonesia',
    },
  },
  revalidateTime: parseInt(process.env.REVALIDATE_TIME || '3600'),
} as const;

export type Environment = typeof env; 