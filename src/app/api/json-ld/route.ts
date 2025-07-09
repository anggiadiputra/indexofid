import { NextResponse } from 'next/server';
import { env } from '@/config/environment';

export const dynamic = 'force-dynamic';

export async function GET() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": env.schema.organization.name,
    "url": env.site.url,
    "logo": `${env.site.url}${env.schema.organization.logo}`,
    "description": env.schema.organization.description,
    "telephone": env.schema.organization.phone,
    "email": env.schema.organization.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": env.schema.organization.streetAddress,
      "addressLocality": env.schema.organization.addressLocality,
      "addressRegion": env.schema.organization.addressRegion,
      "postalCode": env.schema.organization.postalCode,
      "addressCountry": "ID"
    },
    "sameAs": [
      env.schema.social.facebook,
      env.schema.social.twitter,
      env.schema.social.linkedin
    ].filter(Boolean),
    "serviceType": env.schema.services.primary,
    "areaServed": {
      "@type": "Country",
      "name": "Indonesia"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "WordPress Services",
      "itemListElement": env.schema.services.primary.map((service, index) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service,
          "description": `Professional ${service.toLowerCase()} services in Indonesia`
        }
      }))
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": env.site.name,
    "url": env.site.url,
    "description": env.site.description,
    "inLanguage": "id-ID",
    "publisher": {
      "@type": "Organization",
      "name": env.schema.organization.name,
      "logo": `${env.site.url}${env.schema.organization.logo}`
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${env.site.url}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": env.schema.organization.name,
    "image": `${env.site.url}${env.schema.organization.logo}`,
    "description": env.schema.organization.description,
    "url": env.site.url,
    "telephone": env.schema.organization.phone,
    "email": env.schema.organization.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": env.schema.organization.streetAddress,
      "addressLocality": env.schema.organization.addressLocality,
      "addressRegion": env.schema.organization.addressRegion,
      "postalCode": env.schema.organization.postalCode,
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
      "name": "Indonesia"
    }
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