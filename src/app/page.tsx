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

  // Determine base URL for schema
  const baseUrl = env.site.url || env.wordpress.frontendDomain || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_FRONTEND_DOMAIN || 'http://localhost:3000';
  const cleanBaseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash

  // Enhanced Organization Schema - Fully Configurable from Environment
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": env.schema.business.businessType,
    "@id": `${cleanBaseUrl}/#organization`,
    "name": env.schema.business.name,
    "alternateName": env.schema.business.alternateName || env.schema.business.name,
    "url": cleanBaseUrl,
    "logo": {
      "@type": "ImageObject",
      "@id": `${cleanBaseUrl}${env.site.logo}`,
      "url": `${cleanBaseUrl}${env.site.logo}`,
      "caption": `${env.schema.business.name} Logo`
    },
    "image": `${cleanBaseUrl}${env.site.logo}`,
    "description": env.schema.business.description,
    "slogan": env.schema.business.slogan || env.site.slogan,
    "foundingDate": env.schema.business.foundingDate,
    "foundingLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": env.schema.business.addressLocality,
        "addressCountry": "ID"
      }
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "@id": `${cleanBaseUrl}/#contact`,
        "telephone": env.schema.business.phone,
        "email": env.schema.business.email,
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
      "streetAddress": env.schema.business.streetAddress,
      "addressLocality": env.schema.business.addressLocality,
      "addressRegion": env.schema.business.addressRegion,
      "postalCode": env.schema.business.postalCode,
      "addressCountry": "ID"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": env.schema.business.latitude,
      "longitude": env.schema.business.longitude
    },
    "sameAs": [env.schema.social.facebook, env.schema.social.twitter, env.schema.social.linkedin, env.schema.social.instagram, env.schema.social.youtube].filter(Boolean),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": cleanBaseUrl
    },
    "knowsAbout": env.schema.business.knowsAbout,
    "expertise": env.schema.business.expertise,
    "areaServed": {
      "@type": "Country",
      "name": env.schema.locale.country
    },
    "audience": {
      "@type": "Audience",
      "audienceType": env.schema.business.audienceType
    },
    "brand": {
      "@type": "Brand",
      "name": env.schema.business.name,
      "logo": `${cleanBaseUrl}${env.site.logo}`
    },
    "parentOrganization": null,
    "subOrganization": [],
    "member": []
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": `${env.schema.business.name} - ${env.site.description || env.schema.business.description}`,
    "url": cleanBaseUrl,
    "description": env.site.description || env.schema.business.description,
    "inLanguage": env.schema.locale.language,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${cleanBaseUrl}/blog?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const professionalServiceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${cleanBaseUrl}/#service`,
    "name": env.schema.business.name,
    "alternateName": env.schema.business.alternateName || `${env.schema.business.name} Services`,
    "url": cleanBaseUrl,
    "logo": `${cleanBaseUrl}${env.site.logo}`,
    "image": `${cleanBaseUrl}${env.site.logo}`,
    "description": env.schema.business.description,
    "slogan": env.schema.business.slogan || env.site.slogan,
    "foundingDate": env.schema.business.foundingDate,
    "serviceType": env.schema.services.primary.length > 0 ? env.schema.services.primary : [
      "Technology Services",
      "Web Development", 
      "Digital Solutions"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Digital Services",
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
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": env.schema.business.streetAddress,
      "addressLocality": env.schema.business.addressLocality,
      "addressRegion": env.schema.business.addressRegion,
      "postalCode": env.schema.business.postalCode,
      "addressCountry": "ID"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": env.schema.business.phone,
      "email": env.schema.business.email,
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
      "name": env.schema.locale.country
    },
    "audience": {
      "@type": "Audience",
      "audienceType": env.schema.business.audienceType
    },
    "knowsAbout": env.schema.business.knowsAbout,
    "parentOrganization": {
      "@id": `${cleanBaseUrl}/#organization`
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
      
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-3xl opacity-70"></div>
          <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-indigo-100 dark:bg-indigo-900/30 rounded-full blur-3xl opacity-70"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-50 dark:bg-blue-800/20 rounded-full blur-2xl opacity-50"></div>
        </div>

        <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-8 transform hover:scale-105 transition-transform duration-200">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Platform Teknologi Terpercaya #1 di Indonesia
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Solusi Digital
              </span>
              <br />
              untuk Bisnis Modern
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed">
              Maintenance WordPress profesional, migrasi website tanpa downtime, keamanan cyber terdepan, dan setup VPS optimal. 
              <span className="font-semibold text-blue-600 dark:text-blue-400">Wujudkan website impian Anda bersama tim ahli IndexOf.ID!</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Konsultasi Gratis
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center px-8 py-4 bg-white dark:bg-gray-800 border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Lihat Layanan
              </Link>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">500+</div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-300">Website Dikelola</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">99.9%</div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-300">Uptime Garantee</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">24/7</div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-300">Support Ready</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">5+</div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-300">Tahun Pengalaman</div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                SSL & Keamanan Terjamin
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Tim Bersertifikat
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Dokumentasi Lengkap
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Layanan Unggulan Kami
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Dari maintenance hingga migrasi, kami memberikan solusi terbaik untuk semua kebutuhan WordPress Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6 text-blue-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">WordPress Maintenance</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Update rutin, backup otomatis, dan monitoring keamanan 24/7 untuk website WordPress Anda</p>
            </div>

            <div className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6 text-green-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Migrasi Website</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Pindahkan website Anda tanpa downtime dengan proses migrasi yang aman dan terpercaya</p>
            </div>

            <div className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6 text-red-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Malware Removal</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Pembersihan malware lengkap dan perlindungan keamanan untuk melindungi website Anda</p>
            </div>

            <div className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <svg className="w-6 h-6 text-purple-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">VPS Management</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">Setup, konfigurasi, dan pengelolaan VPS profesional untuk performa website optimal</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/services"
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Lihat Semua Layanan
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Clients Carousel */}
      <ClientsCarousel />

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </>
  );
} 