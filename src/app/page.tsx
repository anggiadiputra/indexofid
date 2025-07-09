import Link from 'next/link';
import { getAllPosts } from '@/lib/wordpress-api';
import { WordPressPost } from '@/types/wordpress';
import ClientsCarousel from '@/components/ClientsCarousel';
import NewsletterSignup from '@/components/NewsletterSignup';
import { getHomepageData } from '@/lib/wordpress-api';
import { env } from '@/config/environment';

// PERFORMANCE OPTIMIZATION: Use ISR instead of force-dynamic
export const revalidate = 86400; // Revalidate every 24 hours

export default async function HomePage() {
  // Use parallel data fetching for optimal TTFB
  const { posts, popularPosts } = await getHomepageData();

  // Enhanced Organization Schema for Tech News/Tutorial Platform
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${env.site.url}/#organization`,
    "name": env.schema.organization.name,
    "alternateName": "IndexOf ID",
    "url": env.site.url,
    "logo": {
      "@type": "ImageObject",
      "@id": `${env.site.url}${env.site.logo}`,
      "url": `${env.site.url}${env.site.logo}`,
      "caption": `${env.schema.organization.name} Logo`
    },
    "image": `${env.site.url}${env.site.logo}`,
    "description": env.schema.organization.description,
    "slogan": "Panduan Teknologi Terpercaya Indonesia",
    "foundingDate": "2020-01-01",
    "foundingLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Jakarta",
        "addressCountry": "ID"
      }
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "@id": `${env.site.url}/#contact`,
        "telephone": env.schema.organization.phone,
        "email": env.schema.organization.email,
        "contactType": "customer service",
        "availableLanguage": ["id", "en"],
        "hoursAvailable": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          "opens": "00:00",
          "closes": "23:59"
        }
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": env.schema.organization.streetAddress,
      "addressLocality": env.schema.organization.addressLocality,
      "addressRegion": env.schema.organization.addressRegion,
      "postalCode": env.schema.organization.postalCode,
      "addressCountry": "ID"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -6.2088,
      "longitude": 106.8456
    },
    "sameAs": [env.schema.social.facebook, env.schema.social.twitter, env.schema.social.linkedin].filter(Boolean),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": env.site.url
    },
    "knowsAbout": [
      "WordPress Development",
      "VPS Management", 
      "Web Hosting",
      "Domain Registration",
      "Website Security",
      "Performance Optimization",
      "Digital Marketing",
      "E-commerce Solutions"
    ],
    "expertise": [
      "WordPress",
      "VPS",
      "Web Hosting",
      "Domain Management",
      "Web Security"
    ],
    "areaServed": {
      "@type": "Country",
      "name": "Indonesia"
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Developers, Business Owners, Tech Enthusiasts"
    },
    "brand": {
      "@type": "Brand",
      "name": env.schema.organization.name,
      "logo": `${env.site.url}${env.site.logo}`
    },
    "parentOrganization": null,
    "subOrganization": [],
    "member": []
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": `${env.schema.organization.name} - ${env.site.description}`,
    "url": env.site.url,
    "description": env.site.description,
    "inLanguage": env.schema.locale.language,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${env.site.url}/blog?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const professionalServiceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${env.site.url}/#service`,
    "name": env.schema.organization.name,
    "alternateName": "IndexOf ID Services",
    "url": env.site.url,
    "logo": `${env.site.url}${env.site.logo}`,
    "image": `${env.site.url}${env.site.logo}`,
    "description": "Penyedia layanan domain, hosting, VPS, dan solusi WordPress profesional di Indonesia",
    "slogan": "Solusi Digital Terpercaya Indonesia",
    "foundingDate": "2020-01-01",
    "serviceType": [
      "Domain Registration",
      "VPS Hosting",
      "WordPress Services",
      "Web Development",
      "Malware Removal",
      "Website Migration"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Digital Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Domain Registration",
            "description": "Pendaftaran domain dengan harga terjangkau dan proses cepat"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Service",
            "name": "VPS Hosting",
            "description": "Layanan VPS managed dan setup profesional"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service", 
            "name": "WordPress Services",
            "description": "Migrasi, maintenance, dan optimasi WordPress"
          }
        }
      ]
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": env.schema.organization.streetAddress,
      "addressLocality": env.schema.organization.addressLocality,
      "addressRegion": env.schema.organization.addressRegion,
      "postalCode": env.schema.organization.postalCode,
      "addressCountry": "ID"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": env.schema.organization.phone,
      "email": env.schema.organization.email,
      "contactType": "customer service"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Indonesia"
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Business owners, developers, entrepreneurs in Indonesia"
    },
    "knowsAbout": [
      "Domain Management",
      "VPS Administration",
      "WordPress Development",
      "Web Hosting",
      "Website Security",
      "Performance Optimization"
    ],
    "parentOrganization": {
      "@id": `${env.site.url}/#organization`
    }
  };

  return (
    <>
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(professionalServiceSchema)
        }}
      />
      
    <div className="min-h-screen bg-white dark:bg-neutral-900 flex flex-col justify-center items-center">
      {/* Redesigned Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 dark:text-white mb-6 leading-tight max-w-3xl mx-auto">
          Dapatkan Nama Domain Impianmu<br className="hidden md:inline" />
          Mulai Bisnis Online Lebih Mudah!
        </h1>
        <p className="text-lg md:text-xl text-gray-700 dark:text-neutral-300 mb-8 max-w-2xl mx-auto">
          Temukan dan beli domain terbaik untuk brand, bisnis, atau proyek pribadimu. Proses cepat, harga transparan, dan dukungan profesional siap membantu kamu online tanpa ribet!
        </p>
        <a
          href="#get-started"
          className="inline-flex items-center justify-center px-8 py-4 bg-white text-neutral-900 font-semibold rounded-lg shadow hover:bg-neutral-200 transition mb-10 text-lg"
        >
          Get Started For Free
          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </a>
        {/* Monochrome Developer Illustration (SVG) */}
        <div className="w-full flex justify-center">
          <svg width="400" height="220" viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="200" cy="200" rx="180" ry="20" fill="#444" />
            <rect x="80" y="120" width="240" height="10" rx="5" fill="#888" />
            <rect x="110" y="80" width="60" height="40" rx="8" fill="#222" />
            <rect x="180" y="100" width="100" height="20" rx="6" fill="#222" />
            <rect x="120" y="120" width="40" height="40" rx="10" fill="#bbb" />
            <rect x="170" y="120" width="60" height="40" rx="10" fill="#bbb" />
            <rect x="240" y="120" width="60" height="40" rx="10" fill="#bbb" />
            <circle cx="150" cy="110" r="18" fill="#eee" />
            <rect x="140" y="128" width="20" height="30" rx="8" fill="#eee" />
            <rect x="145" y="158" width="10" height="20" rx="5" fill="#eee" />
            <rect x="155" y="158" width="10" height="20" rx="5" fill="#eee" />
            <rect x="130" y="148" width="10" height="20" rx="5" fill="#eee" />
            <rect x="160" y="148" width="10" height="20" rx="5" fill="#eee" />
            <rect x="200" y="130" width="40" height="10" rx="5" fill="#888" />
            <rect x="250" y="130" width="20" height="10" rx="5" fill="#888" />
            <rect x="270" y="130" width="20" height="10" rx="5" fill="#888" />
            <rect x="290" y="130" width="10" height="10" rx="5" fill="#888" />
            <circle cx="320" cy="60" r="6" fill="#888" />
            <rect x="320" y="70" width="8" height="20" rx="4" fill="#888" />
            <rect x="330" y="80" width="8" height="10" rx="4" fill="#888" />
            <rect x="340" y="90" width="8" height="10" rx="4" fill="#888" />
          </svg>
        </div>
      </section>
    </div>
    </>
  );
} 