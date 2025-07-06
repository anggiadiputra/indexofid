export const env = {
  wordpress: {
    apiUrl: process.env.WORDPRESS_API_URL || '',
    publicApiUrl: process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '',
  },
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'Headless WordPress Blog',
    logoText: process.env.NEXT_PUBLIC_SITE_LOGO_TEXT || '',
    slogan: process.env.NEXT_PUBLIC_SITE_SLOGAN || '',
    author: process.env.NEXT_PUBLIC_SITE_AUTHOR || '',
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'A modern, fast, and SEO-optimized headless WordPress website',
  },
  // Dynamic schema configuration
  schema: {
    organization: {
      name: process.env.NEXT_PUBLIC_ORG_NAME || 'JasaKami.ID',
      description: process.env.NEXT_PUBLIC_ORG_DESCRIPTION || 'Spesialis layanan pemeliharaan WordPress profesional di Indonesia',
      phone: process.env.NEXT_PUBLIC_ORG_PHONE || '+62-812-3456-7890',
      logo: process.env.NEXT_PUBLIC_ORG_LOGO || '/logo.png',
      defaultImage: process.env.NEXT_PUBLIC_DEFAULT_IMAGE || '/default-article-image.jpg',
      email: process.env.NEXT_PUBLIC_ORG_EMAIL || 'info@jasakami.id',
      address: process.env.NEXT_PUBLIC_ORG_ADDRESS || 'Jakarta, Indonesia',
      hours: process.env.NEXT_PUBLIC_ORG_HOURS || 'Senin - Jumat: 09:00 - 18:00',
    },
    social: {
      facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://facebook.com/jasakami.id',
      twitter: process.env.NEXT_PUBLIC_TWITTER_URL || 'https://twitter.com/jasakami_id',
      linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || 'https://linkedin.com/company/jasakami.id',
    },
    services: {
      primary: [
        process.env.NEXT_PUBLIC_SERVICE_1 || 'WordPress Migration',
        process.env.NEXT_PUBLIC_SERVICE_2 || 'Malware Removal',
        process.env.NEXT_PUBLIC_SERVICE_3 || 'VPS Setup',
        process.env.NEXT_PUBLIC_SERVICE_4 || 'VPS Management',
      ],
    },
    locale: {
      language: process.env.NEXT_PUBLIC_SITE_LANGUAGE || 'id-ID',
      country: process.env.NEXT_PUBLIC_SITE_COUNTRY || 'Indonesia',
    },
  },
  revalidateTime: parseInt(process.env.REVALIDATE_TIME || '3600'),
} as const;

export type Environment = typeof env; 