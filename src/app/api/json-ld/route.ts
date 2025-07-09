import { NextResponse } from 'next/server';
import { env } from '@/config/environment';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Determine base URL for schema
  const baseUrl = env.site.url || env.wordpress.frontendDomain || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_FRONTEND_DOMAIN || 'http://localhost:3000';
  const cleanBaseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": env.schema.business.businessType || "ProfessionalService",
    "name": env.schema.business.name,
    "url": cleanBaseUrl,
    "logo": `${cleanBaseUrl}${env.schema.business.logo}`,
    "description": env.schema.business.description,
    "telephone": env.schema.business.phone,
    "email": env.schema.business.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": env.schema.business.streetAddress,
      "addressLocality": env.schema.business.addressLocality,
      "addressRegion": env.schema.business.addressRegion,
      "postalCode": env.schema.business.postalCode,
      "addressCountry": "ID"
    },
    "sameAs": [
      env.schema.social.facebook,
      env.schema.social.twitter,
      env.schema.social.linkedin,
      env.schema.social.instagram,
      env.schema.social.youtube
    ].filter(Boolean),
    "serviceType": env.schema.services.primary,
    "areaServed": {
      "@type": "Country",
      "name": env.schema.locale.country
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Business Services",
      "itemListElement": env.schema.services.primary.map((service, index) => {
        const serviceKey = `service${index + 1}` as keyof typeof env.schema.services.serviceDescriptions;
        return {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": service || `Service ${index + 1}`,
            "description": env.schema.services.serviceDescriptions[serviceKey] || `Professional ${(service || 'business').toLowerCase()} services`
          }
        };
      })
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": env.site.name || env.schema.business.name,
    "url": cleanBaseUrl,
    "description": env.site.description || env.schema.business.description,
    "inLanguage": env.schema.locale.language,
    "publisher": {
      "@type": env.schema.business.businessType || "ProfessionalService",
      "name": env.schema.business.name,
      "logo": `${cleanBaseUrl}${env.schema.business.logo}`
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${cleanBaseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": env.schema.business.name,
    "image": `${cleanBaseUrl}${env.schema.business.logo}`,
    "description": env.schema.business.description,
    "url": cleanBaseUrl,
    "telephone": env.schema.business.phone,
    "email": env.schema.business.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": env.schema.business.streetAddress,
      "addressLocality": env.schema.business.addressLocality,
      "addressRegion": env.schema.business.addressRegion,
      "postalCode": env.schema.business.postalCode,
      "addressCountry": "ID"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    },
    "serviceType": env.schema.services.primary,
    "areaServed": {
      "@type": "Country",
      "name": env.schema.locale.country
    },
    "knowsAbout": env.schema.business.knowsAbout,
    "expertise": env.schema.business.expertise
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [organizationSchema, websiteSchema, localBusinessSchema]
  };

  return NextResponse.json(jsonLd, {
    headers: {
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
    },
  });
} 